const produtosContainer = document.getElementById("produtos");
const produtosVazio = document.getElementById("produtos-vazio");
const produtosCount = document.getElementById("produtos-count");
const carrinhoCount = document.getElementById("carrinho-count-sidebar");
const buscaInput = document.getElementById("filtro-busca");
const minInput = document.getElementById("filtro-min");
const maxInput = document.getElementById("filtro-max");
const ordenarSelect = document.getElementById("filtro-ordenar");
const limparFiltros = document.getElementById("limpar-filtros");
const btnVerCarrinho = document.getElementById("btn-ver-carrinho");

// Scroll para contato
window.scrollToContato = function(e) {
  e.preventDefault();
  alert("Entre em contato pelo WhatsApp através do botão flutuante no canto da tela!");
};

const formatPrice = (valor) => {
  const numero = Number(valor) || 0;
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Ler produtos do localStorage
const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// Atualizar contador do carrinho
function atualizarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinhoCount.textContent = carrinho.length;
}

function renderCards(lista) {
  produtosContainer.innerHTML = "";
  
  // Atualizar contador de produtos
  produtosCount.textContent = `${lista.length} produto${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;
  
  // Mostrar/ocultar mensagem de vazio
  if (lista.length === 0) {
    produtosContainer.style.display = "none";
    produtosVazio.style.display = "flex";
    return;
  } else {
    produtosContainer.style.display = "grid";
    produtosVazio.style.display = "none";
  }

  lista.forEach((p, i) => {
    const precoNumero = Number(p.preco) || 0;
    const badgeTexto = precoNumero <= 10 ? "Promoção" : "Novo";
    const badgeClass = precoNumero <= 10 ? "badge-promo" : "badge-novo";

    const card = document.createElement("div");
    card.className = "card produto-card";
    card.style.animation = `fadeInUp 0.5s ease ${i * 0.1}s both`;

    card.innerHTML = `
      <span class="badge ${badgeClass}">${badgeTexto}</span>
      <div class="card-image">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
      </div>
      <div class="card-info">
        <h4>${p.nome}</h4>
        <p class="preco">${formatPrice(p.preco)}</p>
      </div>
      <button class="btn-card" data-index="${i}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Adicionar ao Carrinho
      </button>
    `;

    produtosContainer.appendChild(card);

    card.querySelector(".btn-card").onclick = function() {
      const btn = this;
      const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
      carrinho.push(p);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      
      // Feedback visual
      btn.classList.add("btn-adicionado");
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Adicionado!
      `;
      
      setTimeout(() => {
        btn.classList.remove("btn-adicionado");
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Adicionar ao Carrinho
        `;
      }, 2000);
      
      atualizarCarrinho();
    };
  });
}

function aplicaFiltros() {
  const termo = (buscaInput?.value || "").toLowerCase();
  const min = Number(minInput?.value) || 0;
  const max = Number(maxInput?.value) || Infinity;
  const ordenar = ordenarSelect?.value || "relevancia";

  let lista = produtos.filter((p) => {
    const nome = (p.nome || "").toLowerCase();
    const preco = Number(p.preco) || 0;
    return nome.includes(termo) && preco >= min && preco <= max;
  });

  if (ordenar === "menor") {
    lista.sort((a, b) => (Number(a.preco) || 0) - (Number(b.preco) || 0));
  } else if (ordenar === "maior") {
    lista.sort((a, b) => (Number(b.preco) || 0) - (Number(a.preco) || 0));
  } else if (ordenar === "az") {
    lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt"));
  } else if (ordenar === "za") {
    lista.sort((a, b) => (b.nome || "").localeCompare(a.nome || "", "pt"));
  }

  renderCards(lista);
}

// Event listeners
buscaInput?.addEventListener("input", aplicaFiltros);
minInput?.addEventListener("input", aplicaFiltros);
maxInput?.addEventListener("input", aplicaFiltros);
ordenarSelect?.addEventListener("change", aplicaFiltros);

// Limpar filtros
limparFiltros?.addEventListener("click", () => {
  buscaInput.value = "";
  minInput.value = "";
  maxInput.value = "";
  ordenarSelect.value = "relevancia";
  aplicaFiltros();
});

// Botão ver carrinho
btnVerCarrinho?.addEventListener("click", () => {
  window.location.href = "carrinho.html";
});

// ========== CALCULADOR DE FRETE ==========
const cepInput = document.getElementById("cep-frete");
const btnCalcularFrete = document.getElementById("btn-calcular-frete");
const freteResultado = document.getElementById("frete-resultado");
const fretePac = document.getElementById("frete-pac");
const freteSedex = document.getElementById("frete-sedex");

// Máscara de CEP
cepInput?.addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.length > 5) {
    valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);
  }
  e.target.value = valor;
});

// Calcular frete
btnCalcularFrete?.addEventListener("click", () => {
  const cep = cepInput.value.replace(/\D/g, "");
  
  if (cep.length !== 8) {
    alert("⚠️ Por favor, digite um CEP válido com 8 dígitos!");
    cepInput.focus();
    return;
  }
  
  // Mostrar loading
  btnCalcularFrete.innerHTML = '<span class="loading-spinner"></span>';
  btnCalcularFrete.disabled = true;
  
  // Simular consulta de API (2 segundos)
  setTimeout(() => {
    // Calcular frete baseado nas regiões do Brasil
    const regiao = determinarRegiao(cep);
    const precosPac = {
      sudeste: 12.50,
      sul: 15.80,
      centroOeste: 18.90,
      nordeste: 22.30,
      norte: 28.50
    };
    
    const precosSedex = {
      sudeste: 22.80,
      sul: 28.50,
      centroOeste: 32.90,
      nordeste: 38.70,
      norte: 45.20
    };
    
    const valorPac = precosPac[regiao] || 20.00;
    const valorSedex = precosSedex[regiao] || 35.00;
    
    fretePac.textContent = valorPac.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    freteSedex.textContent = valorSedex.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    
    // Restaurar botão e mostrar resultado
    btnCalcularFrete.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    `;
    btnCalcularFrete.disabled = false;
    
    freteResultado.style.display = "block";
    
    // Animação de entrada
    freteResultado.style.animation = "slideDown 0.3s ease";
    
    // Feedback visual
    cepInput.style.borderColor = "#22c55e";
    setTimeout(() => {
      cepInput.style.borderColor = "";
    }, 2000);
    
  }, 2000);
});

// Determinar região pelo CEP
function determinarRegiao(cep) {
  const prefixo = parseInt(cep.substring(0, 2));
  
  // Sudeste: SP, RJ, MG, ES
  if ((prefixo >= 1 && prefixo <= 19) || // SP
      (prefixo >= 20 && prefixo <= 28) || // RJ
      (prefixo >= 30 && prefixo <= 39) || // MG
      (prefixo >= 29 && prefixo <= 29)) { // ES
    return "sudeste";
  }
  
  // Sul: PR, SC, RS
  if ((prefixo >= 80 && prefixo <= 87) || // PR
      (prefixo >= 88 && prefixo <= 89) || // SC
      (prefixo >= 90 && prefixo <= 99)) { // RS
    return "sul";
  }
  
  // Centro-Oeste: DF, GO, MT, MS
  if ((prefixo >= 70 && prefixo <= 72) || // DF
      (prefixo >= 73 && prefixo <= 76) || // GO
      (prefixo >= 78 && prefixo <= 78) || // MT
      (prefixo >= 79 && prefixo <= 79)) { // MS
    return "centroOeste";
  }
  
  // Nordeste: BA, SE, PE, AL, PB, RN, CE, PI, MA
  if ((prefixo >= 40 && prefixo <= 48) || // BA
      (prefixo >= 49 && prefixo <= 49) || // SE
      (prefixo >= 50 && prefixo <= 56) || // PE
      (prefixo >= 57 && prefixo <= 57) || // AL
      (prefixo >= 58 && prefixo <= 58) || // PB
      (prefixo >= 59 && prefixo <= 59) || // RN
      (prefixo >= 60 && prefixo <= 63) || // CE
      (prefixo >= 64 && prefixo <= 64) || // PI
      (prefixo >= 65 && prefixo <= 65)) { // MA
    return "nordeste";
  }
  
  // Norte: AM, RR, AP, PA, TO, RO, AC
  if ((prefixo >= 69 && prefixo <= 69) || // AM
      (prefixo >= 69 && prefixo <= 69) || // RR
      (prefixo >= 68 && prefixo <= 68) || // AP/AC
      (prefixo >= 66 && prefixo <= 68) || // PA/AM/RR/AP/RO/AC
      (prefixo >= 77 && prefixo <= 77)) { // TO
    return "norte";
  }
  
  return "sudeste"; // Padrão
}

// Inicializar
atualizarCarrinho();
aplicaFiltros();
