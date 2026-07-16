const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

// O URL do seu Web App gerado no Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyopLIiJtMWObtOaQoZlvqkBc9BmDjRuqLyNxUaU8rRvUOP4KLtq5G3jZvUiz5BTr1fGw/exec';

// Recupera o histórico salvo ou cria um novo array vazio
let chatHistory = JSON.parse(localStorage.getItem('biblia_history')) || [];

/* ------------------------------------------------------------------
   SCROLL
   Em vez de jogar a tela lá pro fim (onde não há nada ainda, já que o
   texto vai "nascer" palavra por palavra), levamos o TOPO do novo
   bloco para o topo da área visível. Assim a tela já começa no lugar
   certo e o usuário rola pra baixo conforme o texto surge.
------------------------------------------------------------------- */
function scrollToStartOf(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------------------------
   MENSAGEM DO USUÁRIO
------------------------------------------------------------------- */
function addUserMessage(text) {
  const exchange = document.createElement('div');
  exchange.className = 'exchange';
  exchange.innerHTML = `<div class="user-msg"></div>`;
  exchange.querySelector('.user-msg').textContent = text;
  timeline.appendChild(exchange);
  scrollToStartOf(exchange);
  return exchange;
}

/* ------------------------------------------------------------------
   INDICADOR DE CARREGAMENTO
------------------------------------------------------------------- */
function showLoading() {
  const block = document.createElement('div');
  block.className = 'exchange';
  block.id = 'loading-indicator';
  block.innerHTML = `
    <div class="bible-msg is-loading">
      Buscando nas escrituras
      <span class="loading-dots"><span></span><span></span><span></span></span>
    </div>`;
  timeline.appendChild(block);
  scrollToStartOf(block);
}

function hideLoading() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.remove();
}

/* ------------------------------------------------------------------
   RESPOSTA BÍBLICA (com capitular iluminada + revelação palavra a
   palavra + botão de compartilhar)
------------------------------------------------------------------- */
function addBibleResponse(text) {
  const exchange = document.createElement('div');
  exchange.className = 'exchange';

  const textContainer = document.createElement('div');
  textContainer.className = 'bible-msg';
  const msgId = 'msg-' + Date.now();
  textContainer.id = msgId;
  exchange.appendChild(textContainer);

  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.textContent = 'Compartilhar';
  shareBtn.onclick = () => gerarCard(msgId);
  exchange.appendChild(shareBtn);

  timeline.appendChild(exchange);

  // Leva a tela para o INÍCIO deste novo bloco, não para o fim da timeline.
  scrollToStartOf(exchange);

  const words = text.trim().split(/\s+/);

  words.forEach((word, index) => {
    let content = word;
    const span = document.createElement('span');

    // Primeira palavra: separa a primeira letra como capitular iluminada.
    if (index === 0 && word.length > 0) {
      const firstChar = word.charAt(0);
      const rest = word.slice(1);
      const dropCap = document.createElement('span');
      dropCap.className = 'drop-cap';
      dropCap.textContent = firstChar;
      span.appendChild(dropCap);
      span.appendChild(document.createTextNode(rest + ' '));
    } else {
      span.appendChild(document.createTextNode(word + ' '));
    }

    span.classList.add('word-reveal');
    span.style.animationDelay = `${index * 0.12}s`;
    textContainer.appendChild(span);
  });

  return exchange;
}

/* ------------------------------------------------------------------
   GERAR CARD DE COMPARTILHAMENTO (Instagram)
------------------------------------------------------------------- */
function gerarCard(elementId) {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) return;

  const cardContentElement = document.getElementById('card-content');
  const cardContainer = document.getElementById('share-card-container');
  const cardElement = document.getElementById('share-card');

  // Texto limpo (sem as spans de animação) preenche o card oculto.
  cardContentElement.textContent = originalElement.textContent.trim();
  cardContainer.style.display = 'block';

  html2canvas(cardElement, {
    scale: 1,
    backgroundColor: '#060504',
    logging: false,
    useCORS: true
  }).then(canvas => {
    cardContainer.style.display = 'none';

    const link = document.createElement('a');
    link.download = 'conselho-biblico.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    console.error('Erro ao gerar card:', err);
    cardContainer.style.display = 'none';
  });
}

/* ------------------------------------------------------------------
   ENVIO / COMUNICAÇÃO COM A API (Apps Script)
------------------------------------------------------------------- */
async function handleSend() {
  const text = inputField.value.trim();
  if (!text) return;

  addUserMessage(text);
  inputField.value = '';

  if (!API_URL.includes('script.google.com')) {
    addBibleResponse('Atenção: o link da API_URL parece incorreto.');
    return;
  }

  showLoading();

  chatHistory.push({ role: 'user', content: text });
  if (chatHistory.length > 6) chatHistory = chatHistory.slice(chatHistory.length - 6);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ mensagem: text, historico: chatHistory })
    });

    const data = await response.json();
    hideLoading();

    if (data.resposta) {
      addBibleResponse(data.resposta);
      chatHistory.push({ role: 'ia', content: data.resposta });
      localStorage.setItem('biblia_history', JSON.stringify(chatHistory));
    } else if (data.erro) {
      addBibleResponse('Sinto muito, houve uma perturbação no caminho: ' + data.erro);
    }
  } catch (error) {
    hideLoading();
    addBibleResponse('A paz esteja com você. No momento, não consegui me conectar.');
  }
}

sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});
