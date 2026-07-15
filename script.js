const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

// URL do seu Web App real do Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyopLIiJtMWObtOaQoZlvqkBc9BmDjRuqLyNxUaU8rRvUOP4KLtq5G3jZvUiz5BTr1fGw/exec';

// Função de scroll que foca no TOPO do elemento especificado
function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 1. Adiciona a mensagem do usuário
function addUserMessage(text) {
    const block = document.createElement('div');
    block.className = 'message-block user-block';
    block.innerHTML = `<div class="user-msg">${text}</div>`;
    timeline.appendChild(block);
    
    // Foca na mensagem enviada
    scrollToElement(block);
}

// 2. Adiciona o indicador de carregamento
function showLoading() {
    const block = document.createElement('div');
    block.className = 'message-block loading-msg';
    block.id = 'loading-indicator';
    block.innerHTML = `<div class="bible-msg" style="font-size: 1.1rem; opacity: 0.5;">Consultando as escrituras...</div>`;
    timeline.appendChild(block);
    
    scrollToElement(block);
}

// 3. Remove o indicador de carregamento
function removeLoading() {
    const loadingBlock = document.getElementById('loading-indicator');
    if (loadingBlock) {
        loadingBlock.remove();
    }
}

// 4. Lida com a resposta do Bot e o efeito de digitação
function typeBotMessage(text) {
    const block = document.createElement('div');
    block.className = 'message-block bot-block';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'bible-msg';
    block.appendChild(textContainer);
    
    timeline.appendChild(block);
    
    // Foca a tela no início deste bloco ANTES de começar a digitar
    scrollToElement(block);

    const words = text.split(' ');
    let i = 0;

    function typeWord() {
        if (i < words.length) {
            // Cria o span apenas para a palavra
            const span = document.createElement('span');
            span.textContent = words[i]; 
            span.className = 'word-reveal';
            span.style.animationDelay = '0.1s'; 
            
            textContainer.appendChild(span);

            // Adiciona um espaço real no HTML após a palavra
            const space = document.createTextNode(' ');
            textContainer.appendChild(space);

            i++;
            setTimeout(typeWord, 100); // Velocidade de digitação (100ms por palavra)
        } else {
            addShareButton(block, text);
        }
    }
    
    setTimeout(typeWord, 300);
}

// 5. Adiciona o botão de compartilhar no final da mensagem do Bot
function addShareButton(container, text) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = 'Compartilhar Versículo';
    shareBtn.onclick = () => shareVersicle(text);
    container.appendChild(shareBtn);
}

// 6. Lógica de envio com a chamada REAL da API
async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    inputField.value = '';
    inputField.disabled = true;
    sendBtn.disabled = true;

    addUserMessage(text);
    showLoading();

    try {
        // Chamada real para o Google Apps Script
        const response = await fetch(`${API_URL}?pergunta=${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            throw new Error('Falha na rede');
        }

        const data = await response.json();
        
        // Extrai a resposta considerando formatos comuns do Apps Script
        const respostaBot = data.resposta || data.mensagem || data || "Não encontrei uma resposta.";
        
        removeLoading();
        typeBotMessage(respostaBot);

    } catch (error) {
        removeLoading();
        typeBotMessage("Perdoe-me, houve um erro ao buscar a sabedoria. Tente novamente.");
        console.error("Erro na API:", error);
    } finally {
        inputField.disabled = false;
        sendBtn.disabled = false;
        inputField.focus();
    }
}

// 7. Eventos de clique e tecla Enter
sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// 8. Lógica do HTML2Canvas para gerar a imagem
function shareVersicle(text) {
    const cardContainer = document.getElementById('share-card-container');
    const cardContent = document.getElementById('card-content');
    
    // Coloca o texto no card escondido
    cardContent.textContent = text;
    
    const card = document.getElementById('share-card');

    // Gera a imagem
    html2canvas(card, {
        scale: 2, 
        backgroundColor: '#07090F', // Fundo escuro na imagem
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'versiculo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}