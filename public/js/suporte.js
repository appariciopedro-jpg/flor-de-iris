// Widget de suporte flutuante com BOT
document.addEventListener("DOMContentLoaded", () => {
  // Base de conhecimento do bot
  const respostasBot = {
    saudacao: [
      "Olá! 👋 Sou a Iris, assistente virtual da Flor de Íris. Como posso ajudar você hoje?",
      "Oi! 🌸 Bem-vindo à Flor de Íris! Em que posso ajudar?",
      "Olá! Estou aqui para ajudar. O que você precisa?"
    ],
    produtos: [
      "Temos sabonetes artesanais maravilhosos! 🧼 Quer ver nosso catálogo completo?",
      "Nossos produtos são feitos à mão com ingredientes naturais. Posso mostrar nossa linha completa!",
      "Trabalhamos com sabonetes artesanais de alta qualidade. Gostaria de conhecer?"
    ],
    preco: [
      "Nossos preços variam de acordo com o produto. Veja nosso catálogo para conferir! 💰",
      "Temos opções para todos os bolsos! Confira nossa página de produtos para ver os valores.",
      "Os preços estão disponíveis na página de produtos. Quer que eu te leve até lá?"
    ],
    entrega: [
      "Fazemos entregas para todo o Brasil! 📦 O prazo varia conforme sua região.",
      "Trabalhamos com entregas rápidas e seguras. Fale conosco no WhatsApp para saber mais sobre sua região!",
      "Sim, entregamos! Entre em contato pelo WhatsApp para calcular o frete para seu CEP."
    ],
    horario: [
      "Nosso atendimento é de Segunda a Sexta, das 9h às 18h. 🕐",
      "Estamos disponíveis de Seg-Sex, das 9h às 18h. Mas você pode deixar sua mensagem a qualquer hora!",
      "Horário de atendimento: Segunda a Sexta, 9h-18h."
    ],
    whatsapp: [
      "Claro! Nosso WhatsApp é (44) 9864-2644. Clique no botão verde abaixo para falar conosco! 📱",
      "Você pode falar com a gente pelo WhatsApp: (44) 9864-2644. É só clicar no botão! 💬",
      "WhatsApp: (44) 9864-2644. Clique abaixo para conversar agora!"
    ],
    ingredientes: [
      "Nossos sabonetes são feitos com ingredientes naturais e orgânicos! 🌿",
      "Utilizamos apenas ingredientes de qualidade, sem químicos agressivos!",
      "Trabalhamos com óleos essenciais, manteigas vegetais e ingredientes naturais."
    ],
    personalizado: [
      "Sim! Fazemos produtos personalizados para presentes e eventos. Fale conosco! 🎁",
      "Oferecemos personalização! Entre em contato pelo WhatsApp para fazer seu pedido especial.",
      "Adoramos criar produtos personalizados! Vamos conversar sobre sua ideia?"
    ],
    pagamento: [
      "Aceitamos PIX, cartão e transferência! 💳",
      "Formas de pagamento: PIX, cartão de crédito/débito e transferência bancária.",
      "Você pode pagar via PIX (mais rápido!), cartão ou transferência."
    ],
    ajuda: [
      "Estou aqui para ajudar! Pode me perguntar sobre produtos, preços, entregas, horários ou qualquer dúvida. 😊",
      "Posso te ajudar com informações sobre produtos, pedidos, entregas e muito mais!",
      "Tire suas dúvidas comigo! Estou aqui para isso. 🌸"
    ],
    agradecimento: [
      "Por nada! Estamos sempre aqui para ajudar. 🌸",
      "Foi um prazer! Volte sempre! 💕",
      "De nada! Qualquer coisa, é só chamar! 😊"
    ],
    despedida: [
      "Até logo! Espero ter ajudado. 👋",
      "Tchau! Volte sempre! 🌸",
      "Foi ótimo conversar com você! Até breve! 💕"
    ],
    default: [
      "Hmm, não entendi muito bem. Pode reformular sua pergunta? 🤔",
      "Desculpe, não compreendi. Tente perguntar de outra forma!",
      "Não tenho certeza sobre isso. Quer falar com um atendente humano no WhatsApp?"
    ]
  };

  // Palavras-chave para identificar intenções
  const intencoes = {
    saudacao: ['oi', 'olá', 'ola', 'hey', 'ei', 'bom dia', 'boa tarde', 'boa noite'],
    admin: ['admin', 'administrador', 'painel', 'gerenciar', 'administração'],
    produtos: ['produto', 'sabonete', 'catalogo', 'catálogo', 'vender', 'comprar', 'tem'],
    preco: ['preço', 'preco', 'valor', 'quanto custa', 'quanto é'],
    entrega: ['entrega', 'frete', 'envio', 'correio', 'entregar', 'receber'],
    horario: ['horario', 'horário', 'atendimento', 'funciona', 'aberto'],
    whatsapp: ['whatsapp', 'whats', 'telefone', 'contato', 'ligar', 'falar'],
    ingredientes: ['ingrediente', 'natural', 'orgânico', 'organico', 'composição', 'feito'],
    personalizado: ['personalizado', 'customizado', 'presente', 'evento', 'casamento'],
    pagamento: ['pagamento', 'pagar', 'pix', 'cartão', 'cartao', 'dinheiro'],
    ajuda: ['ajuda', 'dúvida', 'duvida', 'informação', 'informacao', 'saber'],
    agradecimento: ['obrigado', 'obrigada', 'valeu', 'agradeço', 'agradeco', 'thanks'],
    despedida: ['tchau', 'até', 'ate', 'adeus', 'falou', 'bye']
  };

  // Histórico de conversa
  let historico = [];
  let aguardandoResposta = false;

  // Criar HTML do widget
  const widgetHTML = `
    <div id="suporte-widget">
      <button id="suporte-btn" class="suporte-btn" aria-label="Abrir suporte">
        <svg class="icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg class="icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="suporte-badge">1</span>
      </button>
      
      <div id="suporte-painel" class="suporte-painel" style="display: none;">
        <div class="suporte-header">
          <div class="suporte-avatar">
            🌸
          </div>
          <div class="suporte-info">
            <h4>Iris - Assistente Virtual</h4>
            <p class="status-online">
              <span class="status-dot"></span>
              <span id="status-texto">Online agora</span>
            </p>
          </div>
          <button id="limpar-chat" class="btn-limpar-chat" title="Limpar conversa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
        
        <div id="suporte-mensagens" class="suporte-body">
          <!-- Mensagens serão adicionadas aqui -->
        </div>
        
        <div class="suporte-acoes-rapidas" id="acoes-rapidas">
          <button class="acao-rapida" onclick="enviarMensagemRapida('Ver produtos')">
            🛍️ Ver Produtos
          </button>
          <button class="acao-rapida" onclick="enviarMensagemRapida('Quero falar no WhatsApp')">
            💬 WhatsApp
          </button>
          <button class="acao-rapida" onclick="enviarMensagemRapida('Qual o horário de atendimento?')">
            🕐 Horário
          </button>
          <button class="acao-rapida" onclick="enviarMensagemRapida('Como faço para pagar?')">
            💳 Pagamento
          </button>
        </div>
        
        <div class="suporte-input-area">
          <input 
            type="text" 
            id="suporte-input" 
            placeholder="Digite sua mensagem..." 
            autocomplete="off"
          />
          <button id="suporte-enviar" class="btn-enviar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        
        <div class="suporte-footer">
          <p>Powered by Flor de Íris 🌸</p>
        </div>
      </div>
    </div>
  `;
  
  // Inserir no body
  document.body.insertAdjacentHTML('beforeend', widgetHTML);
  
  // Elementos
  const btn = document.getElementById('suporte-btn');
  const painel = document.getElementById('suporte-painel');
  const iconChat = btn.querySelector('.icon-chat');
  const iconClose = btn.querySelector('.icon-close');
  const badge = btn.querySelector('.suporte-badge');
  const mensagensContainer = document.getElementById('suporte-mensagens');
  const input = document.getElementById('suporte-input');
  const btnEnviar = document.getElementById('suporte-enviar');
  const btnLimpar = document.getElementById('limpar-chat');
  
  let painelAberto = false;

  // Funções do Bot
  function obterHoraAtual() {
    const agora = new Date();
    return agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function adicionarMensagem(texto, tipo = 'bot', opcoes = null) {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-${tipo}`;
    
    if (tipo === 'bot') {
      mensagem.innerHTML = `
        <div class="mensagem-avatar">🌸</div>
        <div class="mensagem-conteudo">
          <p>${texto}</p>
          <span class="mensagem-hora">${obterHoraAtual()}</span>
        </div>
      `;
    } else {
      mensagem.innerHTML = `
        <div class="mensagem-conteudo">
          <p>${texto}</p>
          <span class="mensagem-hora">${obterHoraAtual()}</span>
        </div>
      `;
    }
    
    mensagensContainer.appendChild(mensagem);
    
    // Se houver opções de ação, adicionar botões
    if (opcoes) {
      const opcoesDiv = document.createElement('div');
      opcoesDiv.className = 'mensagem-opcoes-inline';
      opcoes.forEach(opcao => {
        const btn = document.createElement('button');
        btn.className = 'opcao-inline-btn';
        btn.textContent = opcao.texto;
        btn.onclick = opcao.acao;
        opcoesDiv.appendChild(btn);
      });
      mensagensContainer.appendChild(opcoesDiv);
    }
    
    // Scroll para baixo
    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
    
    // Adicionar ao histórico
    historico.push({ tipo, texto, hora: obterHoraAtual() });
  }

  function mostrarDigitando() {
    const digitando = document.createElement('div');
    digitando.className = 'mensagem-bot digitando';
    digitando.id = 'digitando';
    digitando.innerHTML = `
      <div class="mensagem-avatar">🌸</div>
      <div class="mensagem-conteudo">
        <div class="digitando-animacao">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    mensagensContainer.appendChild(digitando);
    mensagensContainer.scrollTop = mensagensContainer.scrollHeight;
  }

  function removerDigitando() {
    const digitando = document.getElementById('digitando');
    if (digitando) {
      digitando.remove();
    }
  }

  function detectarIntencao(mensagem) {
    const msgLower = mensagem.toLowerCase().trim();
    
    for (const [intencao, palavras] of Object.entries(intencoes)) {
      for (const palavra of palavras) {
        if (msgLower.includes(palavra)) {
          return intencao;
        }
      }
    }
    
    return 'default';
  }

  function obterResposta(intencao) {
    const respostas = respostasBot[intencao] || respostasBot.default;
    return respostas[Math.floor(Math.random() * respostas.length)];
  }

  function processarMensagem(mensagemUsuario) {
    if (aguardandoResposta) return;
    
    aguardandoResposta = true;
    
    // Adicionar mensagem do usuário
    adicionarMensagem(mensagemUsuario, 'usuario');
    
    // Mostrar digitando
    mostrarDigitando();
    
    // Simular tempo de resposta do bot
    setTimeout(() => {
      removerDigitando();
      
      const intencao = detectarIntencao(mensagemUsuario);
      const resposta = obterResposta(intencao);
      
      // Adicionar resposta do bot
      if (intencao === 'admin') {
        window.location.href = 'painel.html';
        aguardandoResposta = false;
        return;
      } else if (intencao === 'produtos') {
        adicionarMensagem(resposta, 'bot', [
          { 
            texto: '🛍️ Ver Catálogo', 
            acao: () => window.location.href = 'produtos.html' 
          },
          { 
            texto: '💬 WhatsApp', 
            acao: () => window.open('https://api.whatsapp.com/send/?phone=554498642644&text=Olá! Gostaria de ver os produtos.', '_blank') 
          }
        ]);
      } else if (intencao === 'whatsapp') {
        adicionarMensagem(resposta, 'bot', [
          { 
            texto: '💬 Abrir WhatsApp', 
            acao: () => window.open('https://api.whatsapp.com/send/?phone=554498642644&text=Olá!', '_blank') 
          }
        ]);
      } else if (intencao === 'preco') {
        adicionarMensagem(resposta, 'bot', [
          { 
            texto: '🛍️ Ver Preços', 
            acao: () => window.location.href = 'produtos.html' 
          }
        ]);
      } else {
        adicionarMensagem(resposta, 'bot');
      }
      
      aguardandoResposta = false;
      
      // Sugerir ações adicionais após algumas mensagens
      if (historico.length > 4 && Math.random() > 0.7) {
        setTimeout(() => {
          adicionarMensagem(
            'Posso te ajudar com mais alguma coisa? 😊',
            'bot',
            [
              { texto: '✅ Sim', acao: () => enviarMensagemRapida('Sim, tenho outra dúvida') },
              { texto: '❌ Não, obrigado', acao: () => enviarMensagemRapida('Não, obrigado') }
            ]
          );
        }, 1500);
      }
    }, 1000 + Math.random() * 1000);
  }

  function enviarMensagem() {
    const mensagem = input.value.trim();
    if (!mensagem) return;
    
    processarMensagem(mensagem);
    input.value = '';
  }

  // Função global para botões de ação rápida
  window.enviarMensagemRapida = function(mensagem) {
    processarMensagem(mensagem);
  };

  function limparConversa() {
    if (confirm('Deseja limpar toda a conversa?')) {
      mensagensContainer.innerHTML = '';
      historico = [];
      iniciarConversa();
    }
  }

  function iniciarConversa() {
    const saudacao = respostasBot.saudacao[Math.floor(Math.random() * respostasBot.saudacao.length)];
    adicionarMensagem(saudacao, 'bot');
    
    setTimeout(() => {
      adicionarMensagem(
        'Você pode me perguntar sobre:',
        'bot',
        [
          { texto: '🧼 Produtos', acao: () => enviarMensagemRapida('Quais produtos vocês tem?') },
          { texto: '💰 Preços', acao: () => enviarMensagemRapida('Qual o preço?') },
          { texto: '📦 Entrega', acao: () => enviarMensagemRapida('Vocês fazem entrega?') },
          { texto: '💬 Falar com Humano', acao: () => window.open('https://api.whatsapp.com/send/?phone=554498642644', '_blank') }
        ]
      );
    }, 800);
  }
  
  // Toggle painel
  btn.addEventListener('click', () => {
    painelAberto = !painelAberto;
    
    if (painelAberto) {
      painel.style.display = 'block';
      setTimeout(() => painel.classList.add('aberto'), 10);
      iconChat.style.display = 'none';
      iconClose.style.display = 'block';
      badge.style.display = 'none';
      btn.classList.add('ativo');
      
      // Iniciar conversa se for a primeira vez
      if (historico.length === 0) {
        setTimeout(iniciarConversa, 300);
      }
      
      // Focar no input
      setTimeout(() => input.focus(), 400);
    } else {
      painel.classList.remove('aberto');
      setTimeout(() => painel.style.display = 'none', 300);
      iconChat.style.display = 'block';
      iconClose.style.display = 'none';
      btn.classList.remove('ativo');
    }
  });

  // Event listeners
  btnEnviar.addEventListener('click', enviarMensagem);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      enviarMensagem();
    }
  });

  // Indicador de digitação
  let timeoutDigitacao;
  input.addEventListener('input', () => {
    document.getElementById('status-texto').textContent = 'digitando...';
    clearTimeout(timeoutDigitacao);
    timeoutDigitacao = setTimeout(() => {
      document.getElementById('status-texto').textContent = 'Online agora';
    }, 1000);
  });

  btnLimpar.addEventListener('click', limparConversa);
  
  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    const widget = document.getElementById('suporte-widget');
    if (painelAberto && !widget.contains(e.target)) {
      btn.click();
    }
  });
  
  // Animação de entrada após 3 segundos
  setTimeout(() => {
    btn.classList.add('bounce');
    badge.textContent = '💬';
    setTimeout(() => btn.classList.remove('bounce'), 1000);
  }, 3000);

  // Saudação automática após 5 segundos
  setTimeout(() => {
    if (!painelAberto && historico.length === 0) {
      badge.style.display = 'flex';
      badge.textContent = '👋';
      btn.classList.add('bounce');
      setTimeout(() => btn.classList.remove('bounce'), 1000);
    }
  }, 5000);
});
