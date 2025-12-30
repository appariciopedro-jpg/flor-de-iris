# 🌸 Flor de Íris - E-commerce

Site de e-commerce para venda de sabonetes artesanais.

## 🚀 Como Publicar o Site

### Opção 1: Render.com (Recomendado - Gratuito)

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Fazer upload no GitHub**
   ```bash
   cd "c:\Users\pedro\OneDrive\Desktop\flor-de-iris\Flor-de-iris"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin SEU_REPOSITORIO_GITHUB
   git push -u origin main
   ```

3. **Deploy no Render**
   - No Render, clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Configure:
     - **Name:** flor-de-iris
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Clique em "Create Web Service"
   - Aguarde o deploy (3-5 minutos)
   - Seu site estará em: `https://flor-de-iris.onrender.com`

### Opção 2: Railway.app (Gratuito)

1. **Acessar Railway**
   - https://railway.app
   - Login com GitHub

2. **Deploy**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório
   - Railway detectará automaticamente Node.js
   - Deploy automático!

### Opção 3: Vercel (Gratuito)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd "c:\Users\pedro\OneDrive\Desktop\flor-de-iris\Flor-de-iris"
   vercel
   ```

3. Siga as instruções no terminal

### Opção 4: Ngrok (Teste Rápido - Temporário)

**Para testar rapidamente sem criar conta:**

1. **Baixar ngrok**
   - https://ngrok.com/download
   - Extraia o arquivo

2. **Executar**
   ```bash
   # Terminal 1 - Iniciar servidor
   cd "c:\Users\pedro\OneDrive\Desktop\flor-de-iris\Flor-de-iris"
   node server.js
   
   # Terminal 2 - Iniciar ngrok
   ngrok http 3001
   ```

3. **Compartilhar**
   - Copie a URL que aparece (ex: `https://abc123.ngrok.io`)
   - Envie para as pessoas acessarem
   - ⚠️ Funciona apenas enquanto o computador estiver ligado

## 📋 Recursos do Site

- ✅ Sistema de produtos com filtros
- ✅ Carrinho de compras completo
- ✅ Calculadora de frete por CEP
- ✅ Sistema de cupons de desconto
- ✅ Integração com WhatsApp
- ✅ Painel administrativo
- ✅ Chatbot de suporte
- ✅ Sistema de segurança completo

## 🛡️ Segurança

- Rate limiting (60 req/min)
- Proteção contra força bruta
- Headers de segurança
- Proteção XSS
- Sanitização de dados

## 📱 Contato

- WhatsApp: (44) 9864-2644
- Instagram: @flordeiris

## 🔧 Desenvolvimento Local

```bash
npm install
npm start
```

Acesse: http://localhost:3001

## 📦 Tecnologias

- Node.js + Express
- HTML5, CSS3, JavaScript
- LocalStorage para persistência
- Sistema de segurança customizado

---

**Desenvolvido com 💜 para Flor de Íris**
