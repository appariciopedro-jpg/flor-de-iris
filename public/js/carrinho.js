// Sistema completo de carrinho
document.addEventListener('DOMContentLoaded', () => {
  
  // Elementos DOM
  const carrinhoVazio = document.getElementById('carrinho-vazio');
  const carrinhoConteudo = document.getElementById('carrinho-conteudo');
  const listaItens = document.getElementById('lista-itens');
  const totalItensEl = document.getElementById('total-itens');
  const carrinhoCountHeader = document.getElementById('carrinho-count-header');
  const subtotalEl = document.getElementById('subtotal');
  const descontoEl = document.getElementById('desconto');
  const totalFinalEl = document.getElementById('total-final');
  const limparCarrinhoBtn = document.getElementById('limpar-carrinho');
  const finalizarPedidoBtn = document.getElementById('finalizar-pedido');
  const cupomInput = document.getElementById('cupom-input');
  const aplicarCupomBtn = document.getElementById('aplicar-cupom');
  const cepResumo = document.getElementById('cep-resumo');
  const btnCalcularResumo = document.getElementById('btn-calcular-resumo');
  const resultadoFrete = document.getElementById('resultado-frete');

  // Estado do carrinho
  let carrinho = [];
  let cupomAplicado = null;
  let freteCalculado = null;

  // Cupons disponíveis
  const cuponsDisponiveis = {
    'IRIS10': { desconto: 10, tipo: 'percentual', descricao: '10% de desconto' },
    'PRIMEIRA': { desconto: 15, tipo: 'percentual', descricao: '15% de desconto (primeira compra)' },
    'FRETE5': { desconto: 5, tipo: 'fixo', descricao: 'R$ 5,00 de desconto' },
    'VIP20': { desconto: 20, tipo: 'percentual', descricao: '20% de desconto VIP' }
  };

  // Formatação de moeda
  const formatPrice = (valor) => {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Carregar carrinho do localStorage
  function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    carrinho = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    renderizarCarrinho();
  }

  // Salvar carrinho no localStorage
  function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  // Agrupar itens por ID (para quantidade)
  function agruparItens() {
    const agrupado = {};
    
    carrinho.forEach(item => {
      const id = item.id || item.nome;
      if (agrupado[id]) {
        agrupado[id].quantidade++;
      } else {
        agrupado[id] = { ...item, quantidade: 1 };
      }
    });
    
    return Object.values(agrupado);
  }

  // Renderizar carrinho
  function renderizarCarrinho() {
    const itensAgrupados = agruparItens();
    
    // Atualizar contador do header
    carrinhoCountHeader.textContent = carrinho.length;
    
    // Verificar se carrinho está vazio
    if (itensAgrupados.length === 0) {
      carrinhoVazio.style.display = 'flex';
      carrinhoConteudo.style.display = 'none';
      return;
    }
    
    carrinhoVazio.style.display = 'none';
    carrinhoConteudo.style.display = 'grid';
    
    // Atualizar total de itens
    totalItensEl.textContent = carrinho.length;
    
    // Limpar lista
    listaItens.innerHTML = '';
    
    // Renderizar cada item
    itensAgrupados.forEach((item, index) => {
      const itemEl = criarItemCarrinho(item, index);
      listaItens.appendChild(itemEl);
    });
    
    // Atualizar totais
    atualizarTotais();
  }

  // Criar elemento de item do carrinho
  function criarItemCarrinho(item, index) {
    const div = document.createElement('div');
    div.className = 'carrinho-item';
    div.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s both`;
    
    const precoUnitario = Number(item.preco) || 0;
    const subtotalItem = precoUnitario * item.quantidade;
    
    div.innerHTML = `
      <div class="item-imagem">
        <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
      </div>
      
      <div class="item-info">
        <h3>${item.nome}</h3>
        <p class="item-preco-unitario">${formatPrice(precoUnitario)} / unidade</p>
      </div>
      
      <div class="item-quantidade">
        <button class="btn-quantidade" data-acao="diminuir" data-item="${item.id || item.nome}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <span class="quantidade-valor">${item.quantidade}</span>
        <button class="btn-quantidade" data-acao="aumentar" data-item="${item.id || item.nome}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      
      <div class="item-subtotal">
        <p class="label-subtotal">Subtotal:</p>
        <p class="valor-subtotal">${formatPrice(subtotalItem)}</p>
      </div>
      
      <button class="btn-remover" data-item="${item.id || item.nome}" title="Remover item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    `;
    
    // Event listeners
    const btnDiminuir = div.querySelector('[data-acao="diminuir"]');
    const btnAumentar = div.querySelector('[data-acao="aumentar"]');
    const btnRemover = div.querySelector('.btn-remover');
    
    btnDiminuir.addEventListener('click', () => alterarQuantidade(item.id || item.nome, -1));
    btnAumentar.addEventListener('click', () => alterarQuantidade(item.id || item.nome, 1));
    btnRemover.addEventListener('click', () => removerItem(item.id || item.nome));
    
    return div;
  }

  // Alterar quantidade de um item
  function alterarQuantidade(itemId, delta) {
    if (delta < 0) {
      // Diminuir: remover uma ocorrência
      const index = carrinho.findIndex(item => (item.id || item.nome) === itemId);
      if (index !== -1) {
        carrinho.splice(index, 1);
      }
    } else {
      // Aumentar: adicionar uma ocorrência
      const itemOriginal = carrinho.find(item => (item.id || item.nome) === itemId);
      if (itemOriginal) {
        carrinho.push({ ...itemOriginal });
      }
    }
    
    salvarCarrinho();
    renderizarCarrinho();
  }

  // Remover item completamente
  function removerItem(itemId) {
    if (confirm('Deseja remover este item do carrinho?')) {
      carrinho = carrinho.filter(item => (item.id || item.nome) !== itemId);
      salvarCarrinho();
      renderizarCarrinho();
      
      // Feedback visual
      mostrarNotificacao('Item removido do carrinho', 'info');
    }
  }

  // Calcular subtotal
  function calcularSubtotal() {
    return carrinho.reduce((total, item) => {
      return total + (Number(item.preco) || 0);
    }, 0);
  }

  // Calcular desconto
  function calcularDesconto(subtotal) {
    if (!cupomAplicado) return 0;
    
    if (cupomAplicado.tipo === 'percentual') {
      return subtotal * (cupomAplicado.desconto / 100);
    } else {
      return cupomAplicado.desconto;
    }
  }

  // Atualizar totais
  function atualizarTotais() {
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const frete = freteCalculado ? freteCalculado.valor : 0;
    const total = subtotal - desconto + frete;
    
    subtotalEl.textContent = formatPrice(subtotal);
    descontoEl.textContent = desconto > 0 ? `-${formatPrice(desconto)}` : formatPrice(0);
    totalFinalEl.textContent = formatPrice(total);
    
    // Destacar desconto
    if (desconto > 0) {
      descontoEl.style.color = '#10b981';
      descontoEl.style.fontWeight = '600';
    }
  }

  // Aplicar cupom
  aplicarCupomBtn.addEventListener('click', () => {
    const codigo = cupomInput.value.trim().toUpperCase();
    
    if (!codigo) {
      mostrarNotificacao('Digite um código de cupom', 'warning');
      return;
    }
    
    const cupom = cuponsDisponiveis[codigo];
    
    if (cupom) {
      cupomAplicado = cupom;
      atualizarTotais();
      mostrarNotificacao(`Cupom aplicado! ${cupom.descricao}`, 'success');
      cupomInput.value = '';
      cupomInput.disabled = true;
      aplicarCupomBtn.textContent = '✓ Aplicado';
      aplicarCupomBtn.disabled = true;
    } else {
      mostrarNotificacao('Cupom inválido', 'error');
    }
  });

  // Máscara CEP
  cepResumo.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 5) {
      valor = valor.substring(0, 5) + '-' + valor.substring(5, 8);
    }
    e.target.value = valor;
  });

  // Calcular frete
  btnCalcularResumo.addEventListener('click', () => {
    const cep = cepResumo.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      mostrarNotificacao('Digite um CEP válido', 'warning');
      return;
    }
    
    // Mostrar loading
    btnCalcularResumo.innerHTML = `
      <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    `;
    btnCalcularResumo.disabled = true;
    
    // Simular cálculo
    setTimeout(() => {
      const frete = calcularFretePorCEP(cep);
      freteCalculado = frete;
      
      resultadoFrete.innerHTML = `
        <div class="opcao-frete">
          <div class="opcao-info">
            <strong>📦 PAC</strong>
            <span>${frete.prazo} dias úteis</span>
          </div>
          <span class="opcao-preco">${formatPrice(frete.valor)}</span>
        </div>
      `;
      resultadoFrete.style.display = 'block';
      
      atualizarTotais();
      
      btnCalcularResumo.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      btnCalcularResumo.disabled = false;
      
      mostrarNotificacao('Frete calculado com sucesso!', 'success');
    }, 2000);
  });

  // Função para calcular frete por CEP
  function calcularFretePorCEP(cep) {
    const prefixo = cep.substring(0, 2);
    const regioes = {
      sudeste: { ceps: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39'], valor: 12.50, prazo: 7 },
      sul: { ceps: ['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'], valor: 15.80, prazo: 10 },
      centroOeste: { ceps: ['70', '71', '72', '73', '74', '75', '76', '78', '79'], valor: 18.90, prazo: 12 },
      nordeste: { ceps: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65'], valor: 22.30, prazo: 14 },
      norte: { ceps: ['66', '67', '68', '69', '77'], valor: 28.50, prazo: 18 }
    };
    
    for (const regiao in regioes) {
      if (regioes[regiao].ceps.includes(prefixo)) {
        return { valor: regioes[regiao].valor, prazo: regioes[regiao].prazo };
      }
    }
    
    return { valor: 15.00, prazo: 10 };
  }

  // Limpar carrinho
  limparCarrinhoBtn.addEventListener('click', () => {
    if (confirm('Deseja realmente limpar todo o carrinho?')) {
      carrinho = [];
      salvarCarrinho();
      renderizarCarrinho();
      cupomAplicado = null;
      freteCalculado = null;
      cupomInput.disabled = false;
      aplicarCupomBtn.disabled = false;
      aplicarCupomBtn.textContent = 'Aplicar';
      resultadoFrete.style.display = 'none';
      mostrarNotificacao('Carrinho limpo', 'info');
    }
  });

  // Finalizar pedido
  finalizarPedidoBtn.addEventListener('click', () => {
    if (carrinho.length === 0) {
      mostrarNotificacao('Adicione produtos ao carrinho primeiro', 'warning');
      return;
    }
    
    // Agrupar itens
    const itensAgrupados = agruparItens();
    
    // Montar mensagem para WhatsApp
    let mensagem = '*🛒 Novo Pedido - Flor de Íris*\n\n';
    mensagem += '*Itens:*\n';
    
    itensAgrupados.forEach((item, i) => {
      const subtotal = (Number(item.preco) || 0) * item.quantidade;
      mensagem += `${i + 1}. ${item.nome}\n`;
      mensagem += `   Quantidade: ${item.quantidade}\n`;
      mensagem += `   Preço: ${formatPrice(item.preco)}\n`;
      mensagem += `   Subtotal: ${formatPrice(subtotal)}\n\n`;
    });
    
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const frete = freteCalculado ? freteCalculado.valor : 0;
    const total = subtotal - desconto + frete;
    
    mensagem += `*Subtotal:* ${formatPrice(subtotal)}\n`;
    
    if (desconto > 0) {
      mensagem += `*Desconto:* -${formatPrice(desconto)}\n`;
      mensagem += `*Cupom:* ${Object.keys(cuponsDisponiveis).find(key => cuponsDisponiveis[key] === cupomAplicado)}\n`;
    }
    
    if (frete > 0) {
      mensagem += `*Frete:* ${formatPrice(frete)}\n`;
    }
    
    mensagem += `\n*TOTAL:* ${formatPrice(total)}`;
    
    // Codificar para URL
    const mensagemEncoded = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://api.whatsapp.com/send/?phone=554498642644&text=${mensagemEncoded}`;
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank');
    
    // Opcional: limpar carrinho após envio
    setTimeout(() => {
      if (confirm('Pedido enviado! Deseja limpar o carrinho?')) {
        carrinho = [];
        salvarCarrinho();
        renderizarCarrinho();
      }
    }, 1000);
  });

  // Sistema de notificações
  function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação anterior
    const notifAnterior = document.querySelector('.notificacao');
    if (notifAnterior) {
      notifAnterior.remove();
    }
    
    const notif = document.createElement('div');
    notif.className = `notificacao notificacao-${tipo}`;
    
    const icones = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notif.innerHTML = `
      <span class="notificacao-icone">${icones[tipo]}</span>
      <span class="notificacao-mensagem">${mensagem}</span>
    `;
    
    document.body.appendChild(notif);
    
    // Animar entrada
    setTimeout(() => notif.classList.add('notificacao-show'), 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notif.classList.remove('notificacao-show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // Inicializar
  carregarCarrinho();
  
});
