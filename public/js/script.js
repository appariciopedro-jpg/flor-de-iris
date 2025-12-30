// Animações de entrada
document.addEventListener("DOMContentLoaded", () => {
  // Animação de scroll reveal
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observar elementos para animação
  const elements = document.querySelectorAll(".beneficio-card, .depoimento-card, .sobre-content, .cta-section, .processo-step, .ingrediente-card");
  elements.forEach(el => {
    el.classList.add("fade-in");
    observer.observe(el);
  });

  // Contador animado para estatísticas
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  // Carregar produtos em destaque
  carregarProdutosDestaque();
  
  // Smooth scroll para âncoras
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Adicionar parallax leve no hero
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroMedia = document.querySelector('.hero-media');
    if (heroMedia) {
      heroMedia.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });
});

// Função para animar contadores
function animateCounter(element) {
  const target = parseInt(element.parentElement.dataset.target) || parseInt(element.textContent);
  if (isNaN(target)) return;
  
  const duration = 2000; // 2 segundos
  const step = Math.ceil(target / (duration / 16)); // 60 FPS
  let current = 0;
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = current;
    }
  }, 16);
}

// Carregar produtos do localStorage para exibir em destaque
function carregarProdutosDestaque() {
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  const container = document.getElementById("produtos-destaque");
  
  if (!container) return;
  
  // Se não houver produtos no localStorage, mostrar produtos padrão
  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="card">
        <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600" alt="Sabonete Lavanda">
        <div class="card-info">
          <h4>Sabonete de Lavanda</h4>
          <p class="preco">R$ 14,90</p>
        </div>
        <a href="produtos.html" class="btn-card">Ver Produtos</a>
      </div>
      <div class="card">
        <img src="https://images.unsplash.com/photo-1600857544200-b9f1c441ff42?w=600" alt="Sabonete Rosa">
        <div class="card-info">
          <h4>Sabonete de Rosas</h4>
          <p class="preco">R$ 13,90</p>
        </div>
        <a href="produtos.html" class="btn-card">Ver Produtos</a>
      </div>
      <div class="card">
        <img src="https://images.unsplash.com/photo-1607024696628-b37d89aaa161?w=600" alt="Sabonete Natural">
        <div class="card-info">
          <h4>Sabonete Natural</h4>
          <p class="preco">R$ 12,90</p>
        </div>
        <a href="produtos.html" class="btn-card">Ver Produtos</a>
      </div>
    `;
    return;
  }
  
  // Mostrar até 3 produtos
  const produtosDestaque = produtos.slice(0, 3);
  container.innerHTML = "";
  
  produtosDestaque.forEach(p => {
    const precoFormatado = Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="card-info">
        <h4>${p.nome}</h4>
        <p class="preco">${precoFormatado}</p>
      </div>
      <a href="produtos.html" class="btn-card">Ver Produto</a>
    `;
    container.appendChild(card);
  });
}
