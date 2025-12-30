// ============================================
// VERIFICAÇÃO DE SEGURANÇA
// ============================================

// Verificar autenticação segura
function verificarAutenticacao() {
  const adminLogado = sessionStorage.getItem("admin-logado");
  const adminToken = sessionStorage.getItem("admin-token");
  const loginTime = parseInt(sessionStorage.getItem("admin-login-time")) || 0;
  
  // Verificar se está logado
  if (adminLogado !== "true" || !adminToken) {
    alert("⚠️ Você precisa estar logado como admin!");
    window.location.href = "admin.html";
    return false;
  }
  
  // Verificar expiração de sessão (2 horas)
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas
  const now = Date.now();
  
  if (now - loginTime > SESSION_TIMEOUT) {
    alert("⚠️ Sua sessão expirou!\n\nPor segurança, faça login novamente.");
    sessionStorage.clear();
    window.location.href = "admin.html";
    return false;
  }
  
  return true;
}

// Executar verificação
if (!verificarAutenticacao()) {
  throw new Error("Acesso não autorizado");
}

// Atualizar tempo de atividade
sessionStorage.setItem("admin-last-activity", Date.now().toString());

// Verificar atividade a cada minuto
setInterval(() => {
  const lastActivity = parseInt(sessionStorage.getItem("admin-last-activity")) || 0;
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inatividade
  
  if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
    alert("⚠️ Sessão encerrada por inatividade!");
    sessionStorage.clear();
    window.location.href = "admin.html";
  }
}, 60000);

// Atualizar atividade em interações
document.addEventListener('click', () => {
  sessionStorage.setItem("admin-last-activity", Date.now().toString());
});
document.addEventListener('keypress', () => {
  sessionStorage.setItem("admin-last-activity", Date.now().toString());
});

// Sanitização de entrada (proteção XSS)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validar entrada numérica
function validateNumber(value, min = 0, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

// Referências
const produtosContainer = document.getElementById("produtosAdmin");
const semProdutos = document.getElementById("sem-produtos");
let editandoIndex = null;

// ===================
// SISTEMA DE ABAS
// ===================
function mudarAba(aba) {
  // Remover active de todos os botões e abas
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.aba-conteudo').forEach(conteudo => conteudo.classList.remove('active'));
  
  // Ativar aba selecionada
  event.target.closest('.tab-btn').classList.add('active');
  document.getElementById(`aba-${aba}`).classList.add('active');
  
  // Carregar conteúdo específico da aba
  if (aba === 'dashboard') {
    atualizarDashboard();
  } else if (aba === 'pedidos') {
    carregarPedidos();
  } else if (aba === 'clientes') {
    carregarClientes();
  } else if (aba === 'relatorios') {
    carregarRelatorios();
  }
}

// ===================
// DASHBOARD
// ===================
function atualizarDashboard() {
  atualizarStats();
  carregarTopProdutos();
  carregarAtividades();
}

function carregarTopProdutos() {
  const container = document.getElementById('top-produtos');
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  
  if (produtos.length === 0) {
    container.innerHTML = '<p class="texto-vazio">Nenhum produto cadastrado ainda.</p>';
    return;
  }
  
  // Simular popularidade (em produção, seria baseado em vendas reais)
  const topProdutos = produtos.slice(0, 5);
  
  container.innerHTML = topProdutos.map((p, i) => `
    <div class="top-produto-item">
      <span class="posicao">#${i + 1}</span>
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="info">
        <h4>${p.nome}</h4>
        <p>${Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      </div>
      <div class="badge">Popular</div>
    </div>
  `).join('');
}

function carregarAtividades() {
  const container = document.getElementById('atividades');
  const atividades = JSON.parse(localStorage.getItem("atividades")) || [];
  
  // Se não houver atividades, criar algumas de exemplo
  if (atividades.length === 0) {
    const atividadesExemplo = [
      { tipo: 'produto', acao: 'Produto adicionado', descricao: 'Sistema iniciado', tempo: 'Agora' },
      { tipo: 'config', acao: 'Configurações atualizadas', descricao: 'Painel configurado', tempo: 'Agora' }
    ];
    
    container.innerHTML = atividadesExemplo.map(a => `
      <div class="atividade-item">
        <div class="atividade-icon ${a.tipo}">
          ${a.tipo === 'produto' ? '📦' : '⚙️'}
        </div>
        <div class="atividade-info">
          <h4>${a.acao}</h4>
          <p>${a.descricao}</p>
        </div>
        <span class="atividade-tempo">${a.tempo}</span>
      </div>
    `).join('');
  } else {
    container.innerHTML = atividades.slice(0, 10).map(a => `
      <div class="atividade-item">
        <div class="atividade-icon ${a.tipo}">
          ${a.tipo === 'produto' ? '📦' : a.tipo === 'pedido' ? '🛒' : '⚙️'}
        </div>
        <div class="atividade-info">
          <h4>${a.acao}</h4>
          <p>${a.descricao}</p>
        </div>
        <span class="atividade-tempo">${a.tempo}</span>
      </div>
    `).join('');
  }
}

function registrarAtividade(tipo, acao, descricao) {
  const atividades = JSON.parse(localStorage.getItem("atividades")) || [];
  const agora = new Date();
  const tempo = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  atividades.unshift({ tipo, acao, descricao, tempo });
  
  // Manter apenas as últimas 50 atividades
  if (atividades.length > 50) {
    atividades.pop();
  }
  
  localStorage.setItem("atividades", JSON.stringify(atividades));
}

// ===================
// AÇÕES RÁPIDAS
// ===================
function verPedidosPendentes() {
  mudarAba('pedidos');
  document.getElementById('filtro-status-pedido').value = 'pendente';
  filtrarPedidos();
}

function exportarDados() {
  const dados = {
    produtos: JSON.parse(localStorage.getItem("produtos")) || [],
    pedidos: JSON.parse(localStorage.getItem("pedidos")) || [],
    clientes: JSON.parse(localStorage.getItem("clientes")) || [],
    atividades: JSON.parse(localStorage.getItem("atividades")) || []
  };
  
  const dataStr = JSON.stringify(dados, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `flordeiris-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  registrarAtividade('config', 'Dados exportados', 'Backup criado com sucesso');
  alert('Dados exportados com sucesso!');
}

function limparCache() {
  if (confirm('Deseja limpar o cache? Esta ação irá remover dados temporários mas manterá produtos e pedidos.')) {
    // Limpar apenas dados temporários
    sessionStorage.clear();
    sessionStorage.setItem("admin-logado", "true"); // Manter login
    
    registrarAtividade('config', 'Cache limpo', 'Dados temporários removidos');
    alert('Cache limpo com sucesso!');
  }
}

// ===================
// PEDIDOS
// ===================
function carregarPedidos() {
  const container = document.getElementById('lista-pedidos');
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  
  if (pedidos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <h3>Nenhum pedido ainda</h3>
        <p>Os pedidos dos clientes aparecerão aqui</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = pedidos.map((pedido, i) => `
    <div class="pedido-card" data-status="${pedido.status}">
      <div class="pedido-header">
        <div>
          <h4>Pedido #${1000 + i}</h4>
          <p class="pedido-data">${pedido.data}</p>
        </div>
        <span class="status-badge ${pedido.status}">${pedido.status}</span>
      </div>
      <div class="pedido-body">
        <p><strong>Cliente:</strong> ${pedido.cliente}</p>
        <p><strong>Total:</strong> ${pedido.total}</p>
        <p><strong>Itens:</strong> ${pedido.itens} produto(s)</p>
      </div>
      <div class="pedido-actions">
        <button onclick="alterarStatusPedido(${i})" class="btn-status">Alterar Status</button>
        <button onclick="verDetalhesPedido(${i})" class="btn-detalhes">Ver Detalhes</button>
      </div>
    </div>
  `).join('');
}

function filtrarPedidos() {
  const status = document.getElementById('filtro-status-pedido').value;
  const cards = document.querySelectorAll('.pedido-card');
  
  cards.forEach(card => {
    if (status === 'todos' || card.dataset.status === status) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function alterarStatusPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const statusOptions = ['pendente', 'processando', 'enviado', 'concluido', 'cancelado'];
  const currentStatus = pedidos[index].status;
  const currentIndex = statusOptions.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % statusOptions.length;
  
  pedidos[index].status = statusOptions[nextIndex];
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  
  registrarAtividade('pedido', 'Status alterado', `Pedido #${1000 + index} -> ${statusOptions[nextIndex]}`);
  carregarPedidos();
}

function verDetalhesPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const pedido = pedidos[index];
  alert(`Detalhes do Pedido #${1000 + index}\n\nCliente: ${pedido.cliente}\nData: ${pedido.data}\nStatus: ${pedido.status}\nTotal: ${pedido.total}\nItens: ${pedido.itens}`);
}

// ===================
// CLIENTES
// ===================
function carregarClientes() {
  const container = document.getElementById('lista-clientes');
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  
  if (clientes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        <h3>Nenhum cliente cadastrado</h3>
        <p>Adicione clientes para gerenciar melhor seu negócio</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = clientes.map((cliente, i) => `
    registrarAtividade('produto', 'Produto adicionado', nome);
    <div class="cliente-card">
      <div class="cliente-avatar">${cliente.nome.charAt(0).toUpperCase()}</div>
      <div class="cliente-info">
        <h4>${cliente.nome}</h4>
        <p>${cliente.email}</p>
        <p>${cliente.telefone}</p>
      </div>
      <div class="cliente-stats">
        <span>${cliente.pedidos || 0} pedidos</span>
      </div>
      <button onclick="removerCliente(${i})" class="btn-remover">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function adicionarCliente() {
  const nome = prompt('Nome do cliente:');
  if (!nome) return;
  
  const email = prompt('E-mail:');
  const telefone = prompt('Telefone:');
  
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes.push({ nome, email, telefone, pedidos: 0 });
  localStorage.setItem("clientes", JSON.stringify(clientes));
  
  registrarAtividade('cliente', 'Cliente adicionado', nome);
  carregarClientes();
  atualizarStats();
}

function removerCliente(index) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  if (confirm(`Remover ${clientes[index].nome}?`)) {
    clientes.splice(index, 1);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    carregarClientes();
    atualizarStats();
  }
}

// ===================
// RELATÓRIOS
// ===================
function carregarRelatorios() {
  carregarRankingProdutos();
  carregarPerformanceCategorias();
}

function selecionarPeriodo(periodo) {
  document.querySelectorAll('.btn-periodo').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Aqui você implementaria a lógica de filtro por período
  alert(`Relatório para: ${periodo}`);
}

function carregarRankingProdutos() {
  const container = document.getElementById('ranking-produtos');
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  
  if (produtos.length === 0) {
    container.innerHTML = '<p class="texto-vazio">Sem dados para exibir</p>';
    return;
  }
  
  container.innerHTML = produtos.slice(0, 10).map((p, i) => `
    <div class="ranking-item">
      <span class="ranking-pos">${i + 1}º</span>
      <div class="ranking-info">
        <strong>${p.nome}</strong>
        <small>Vendas: ${Math.floor(Math.random() * 100)} un.</small>
      </div>
      <span class="ranking-valor">${Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
    </div>
  `).join('');
}

function carregarPerformanceCategorias() {
  const container = document.getElementById('categorias-performance');
  const categorias = [
    { nome: 'Sabonetes Artesanais', vendas: 145, crescimento: '+12%' },
    { nome: 'Kits Especiais', vendas: 89, crescimento: '+8%' },
    { nome: 'Hidratantes', vendas: 67, crescimento: '+15%' },
    { nome: 'Esfoliantes', vendas: 54, crescimento: '+5%' }
  ];
  
  container.innerHTML = categorias.map(cat => `
    <div class="categoria-item">
      <div class="categoria-info">
        <strong>${cat.nome}</strong>
        <small>${cat.vendas} vendas</small>
      </div>
      <span class="crescimento positivo">${cat.crescimento}</span>
    </div>
  `).join('');
}

// ===================
// CONFIGURAÇÕES
// ===================
function salvarConfiguracoes() {
  const config = {
    nomeLoja: document.getElementById('config-nome-loja').value,
    whatsapp: document.getElementById('config-whatsapp').value,
    email: document.getElementById('config-email').value,
    endereco: document.getElementById('config-endereco').value,
    notificacoes: {
      novosPedidos: document.getElementById('notif-novos-pedidos').checked,
      estoqueBaixo: document.getElementById('notif-estoque-baixo').checked,
      novosClientes: document.getElementById('notif-novos-clientes').checked
    }
  };
  
  localStorage.setItem('configuracoes', JSON.stringify(config));
  registrarAtividade('config', 'Configurações salvas', 'Sistema atualizado');
  alert('Configurações salvas com sucesso!');
}

function fazerBackup() {
  exportarDados();
}

function restaurarBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dados = JSON.parse(event.target.result);
        if (confirm('Deseja restaurar este backup? Os dados atuais serão substituídos!')) {
          localStorage.setItem('produtos', JSON.stringify(dados.produtos || []));
          localStorage.setItem('pedidos', JSON.stringify(dados.pedidos || []));
          localStorage.setItem('clientes', JSON.stringify(dados.clientes || []));
          localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
          
          alert('Backup restaurado com sucesso!');
          location.reload();
        }
      } catch (error) {
        alert('Erro ao ler arquivo de backup!');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function alterarSenha() {
  const senhaAtual = prompt('Digite a senha atual:');
  if (senhaAtual !== '1234') {
    alert('Senha incorreta!');
    return;
  }
  
  const novaSenha = prompt('Digite a nova senha:');
  if (!novaSenha || novaSenha.length < 4) {
    alert('Senha deve ter no mínimo 4 caracteres!');
    return;
  }
  
  const confirmar = prompt('Confirme a nova senha:');
  if (novaSenha !== confirmar) {
    alert('Senhas não coincidem!');
    return;
  }
  
  // Em produção, salvaria a senha de forma segura
  alert('Senha alterada com sucesso! (Em produção, seria salva de forma segura)');
  registrarAtividade('config', 'Senha alterada', 'Segurança atualizada');
}

// ===================
// PRODUTOS (mantém código original)
// ===================
function mostrarProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtosContainer.innerHTML = "";
  
  // Mostrar/ocultar mensagem de vazio
  if (produtos.length === 0) {
    produtosContainer.style.display = "none";
    semProdutos.style.display = "flex";
    document.getElementById("btn-limpar-todos").style.display = "none";
  } else {
    produtosContainer.style.display = "grid";
    semProdutos.style.display = "none";
    document.getElementById("btn-limpar-todos").style.display = "flex";
  }

  produtos.forEach((p, i) => {
    const precoFormatado = Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const card = document.createElement("div");
    card.className = "card admin-card";
    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="card-content">
        <h4>${p.nome}</h4>
        <p class="preco">${precoFormatado}</p>
      </div>
      <div class="card-actions">
        <button onclick="editarProduto(${i})" class="btn-edit" title="Editar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button onclick="removerProduto(${i})" class="btn-delete" title="Remover">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;
    produtosContainer.appendChild(card);
  });
  
  atualizarStats();
}

// Salvar produto no localStorage
function salvarProduto() {
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  const imagemInput = document.getElementById("imagem");

  if(!nome || !preco) {
    alert("Preencha o nome e o preço!");
    return;
  }

  if(preco <= 0) {
    alert("O preço deve ser maior que zero!");
    return;
  }
  
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  
  // Se está editando
  if (editandoIndex !== null) {
    if (imagemInput.files[0]) {
      // Nova imagem selecionada
      const reader = new FileReader();
      reader.onload = function(e) {
        produtos[editandoIndex] = { nome, preco, imagem: e.target.result };
        localStorage.setItem("produtos", JSON.stringify(produtos));
        limparFormulario();
        mostrarProdutos();
      };
      reader.readAsDataURL(imagemInput.files[0]);
    } else {
      // Manter imagem anterior
      produtos[editandoIndex].nome = nome;
      produtos[editandoIndex].preco = preco;
      localStorage.setItem("produtos", JSON.stringify(produtos));
      limparFormulario();
      mostrarProdutos();
    }
    return;
  }
  
  // Adicionar novo produto
  if(!imagemInput.files[0]) {
    alert("Selecione uma imagem!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imagem = e.target.result;
    produtos.push({ nome, preco, imagem });
    localStorage.setItem("produtos", JSON.stringify(produtos));
    limparFormulario();
    mostrarProdutos();
  };
  reader.readAsDataURL(imagemInput.files[0]);
}

// Limpar formulário
function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("imagem").value = "";
  document.getElementById("preview-container").style.display = "none";
  document.getElementById("file-name").textContent = "Escolher imagem";
  editandoIndex = null;
  document.querySelector(".btn-submit").innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
    Adicionar Produto
  `;
}

// Editar produto
function editarProduto(index) {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  const produto = produtos[index];
  
  document.getElementById("nome").value = produto.nome;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("preview-img").src = produto.imagem;
  document.getElementById("preview-container").style.display = "block";
  document.getElementById("file-name").textContent = "Imagem atual (clique para alterar)";
  
  editandoIndex = index;
  
  document.querySelector(".btn-submit").innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
    Salvar Alterações
  `;
  
  // Scroll para o formulário
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Remover produto
function removerProduto(index) {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  const produto = produtos[index];
  
  if (confirm(`Deseja realmente remover "${produto.nome}"?`)) {
    produtos.splice(index, 1);
    registrarAtividade('produto', 'Produto removido', produto.nome);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    mostrarProdutos();
  }
}

// Limpar todos os produtos
function limparTodosProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  
  if (produtos.length === 0) return;
  
  if (confirm(`Deseja realmente remover TODOS os ${produtos.length} produtos? Esta ação não pode ser desfeita!`)) {
    localStorage.setItem("produtos", JSON.stringify([]));
    registrarAtividade('produto', 'Todos os produtos removidos', `${produtos.length} produtos excluídos`);
    mostrarProdutos();
  }
}

// Logout
function logout() {
  sessionStorage.removeItem("admin-logado");
  window.location.href = "admin.html";
}

// Preview de imagem
function previewImagem(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("preview-img").src = e.target.result;
      document.getElementById("preview-container").style.display = "block";
    };
    reader.readAsDataURL(file);
    document.getElementById("file-name").textContent = file.name;
  }
}

// Atualizar estatísticas
function atualizarStats() {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  
  // Total de produtos
  document.getElementById("total-produtos").textContent = produtos.length;
  
  // Preço médio
  if (produtos.length > 0) {
    const soma = produtos.reduce((acc, p) => acc + Number(p.preco), 0);
    const media = soma / produtos.length;
    document.getElementById("preco-medio").textContent = media.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } else {
    document.getElementById("preco-medio").textContent = "R$ 0,00";
  }
  
  // Itens no carrinho
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  document.getElementById("itens-carrinho").textContent = totalItens;
  
  // Estatísticas adicionais (se existirem os elementos)
  const totalClientesEl = document.getElementById("total-clientes");
  if (totalClientesEl) {
    totalClientesEl.textContent = clientes.length;
  }
  
  const visitasHojeEl = document.getElementById("visitas-hoje");
  if (visitasHojeEl) {
    // Simular visitas (em produção viria de analytics)
    visitasHojeEl.textContent = Math.floor(Math.random() * 100) + 50;
  }
  
  const pedidosConcluidosEl = document.getElementById("pedidos-concluidos");
  if (pedidosConcluidosEl) {
    const concluidos = pedidos.filter(p => p.status === 'concluido').length;
    pedidosConcluidosEl.textContent = concluidos;
  }
}

// Inicializar
mostrarProdutos();
atualizarDashboard
// Criar dados de exemplo se não existirem
function inicializarDadosExemplo() {
  // Pedidos de exemplo
  if (!localStorage.getItem("pedidos")) {
    const pedidosExemplo = [
      {
        cliente: "Maria Silva",
        data: "29/12/2025",
        status: "pendente",
        total: "R$ 145,00",
        itens: 3
      },
      {
        cliente: "João Santos",
        data: "28/12/2025",
        status: "processando",
        total: "R$ 89,00",
        itens: 2
      },
      {
        cliente: "Ana Costa",
        data: "27/12/2025",
        status: "enviado",
        total: "R$ 234,50",
        itens: 5
      },
      {
        cliente: "Pedro Oliveira",
        data: "26/12/2025",
        status: "concluido",
        total: "R$ 67,00",
        itens: 1
      }
    ];
    localStorage.setItem("pedidos", JSON.stringify(pedidosExemplo));
  }
  
  // Clientes de exemplo
  if (!localStorage.getItem("clientes")) {
    const clientesExemplo = [
      {
        nome: "Maria Silva",
        email: "maria@email.com",
        telefone: "(44) 99999-1111",
        pedidos: 5
      },
      {
        nome: "João Santos",
        email: "joao@email.com",
        telefone: "(44) 99999-2222",
        pedidos: 3
      },
      {
        nome: "Ana Costa",
        email: "ana@email.com",
        telefone: "(44) 99999-3333",
        pedidos: 8
      }
    ];
    localStorage.setItem("clientes", JSON.stringify(clientesExemplo));
  }
}

inicializarDadosExemplo();// Inicializar
mostrarProdutos();
atualizarStats();
