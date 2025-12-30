const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SISTEMA DE SEGURANÇA
// ============================================

// Rate Limiting por IP (proteção contra DDoS e força bruta)
const requestCounts = new Map();
const blockedIPs = new Set();
const MAX_REQUESTS_PER_MINUTE = 60;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos

// Middleware de Rate Limiting
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Verificar se IP está bloqueado
  if (blockedIPs.has(ip)) {
    return res.status(429).send('Muitas requisições. Tente novamente mais tarde.');
  }
  
  // Contar requisições
  const now = Date.now();
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  // Remover requisições antigas (mais de 1 minuto)
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    blockedIPs.add(ip);
    console.log(`⚠️ IP bloqueado por excesso de requisições: ${ip}`);
    
    // Desbloquear após duração definida
    setTimeout(() => {
      blockedIPs.delete(ip);
      console.log(`✅ IP desbloqueado: ${ip}`);
    }, BLOCK_DURATION);
    
    return res.status(429).send('Limite de requisições excedido. IP bloqueado temporariamente.');
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  
  next();
});

// Headers de Segurança
app.use((req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Política de referência
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (proteção contra XSS)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: http:; " +
    "connect-src 'self' https://api.whatsapp.com https://buscacepinter.correios.com.br; " +
    "frame-src 'self' https://api.whatsapp.com;"
  );
  
  // Remover header que expõe tecnologia
  res.removeHeader('X-Powered-By');
  
  next();
});

// Logging de segurança
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${ip} - ${req.method} ${req.url}`);
  next();
});

// SERVIR ARQUIVOS ESTÁTICOS com options para vídeo
const publicPath = path.join(__dirname, "public");
console.log(`📁 Servindo arquivos de: ${publicPath}`);

app.use(express.static(publicPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Rota fallback para index.html
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  console.log(`📄 Servindo index.html de: ${indexPath}`);
  
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.html não encontrado em: ${indexPath}`);
    return res.status(500).send('Erro ao carregar a página inicial');
  }
  
  res.sendFile(indexPath);
});

// ROTA DE STREAM DE VÍDEO COM SUPORTE A RANGE (evita RangeNotSatisfiable)
app.get("/videos/:file", (req, res) => {
  const videoPath = path.join(__dirname, "public", "videos", req.params.file);

  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.sendStatus(404);
    }

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Length": stats.size,
        "Content-Type": "video/mp4",
      });
      return fs.createReadStream(videoPath).pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

    if (isNaN(start) || isNaN(end) || start >= stats.size || end >= stats.size) {
      res.status(416).setHeader("Content-Range", `bytes */${stats.size}`);
      return res.end();
    }

    const chunkSize = (end - start) + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  });
});

// ROTA PARA PÁGINA INICIAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🌸 Servidor Flor de Íris rodando em http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("🛡️  Sistema de Segurança Ativo:");
  console.log(`   ✓ Rate Limiting: ${MAX_REQUESTS_PER_MINUTE} req/min por IP`);
  console.log(`   ✓ Bloqueio automático: ${BLOCK_DURATION/60000} minutos`);
  console.log("   ✓ Headers de segurança configurados");
  console.log("   ✓ Proteção XSS ativa");
  console.log("   ✓ Proteção contra clickjacking");
  console.log("   ✓ Logging de requisições");
  console.log("=".repeat(50));
});

// Limpeza periódica de dados de rate limiting (a cada 5 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [ip, requests] of requestCounts.entries()) {
    const recent = requests.filter(time => now - time < 60000);
    if (recent.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, recent);
    }
  }
}, 5 * 60 * 1000);
