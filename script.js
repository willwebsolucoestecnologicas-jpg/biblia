const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

const API_URL = 'https://script.google.com/macros/s/AKfycbyopLIiJtMWObtOaQoZlvqkBc9BmDjRuqLyNxUaU8rRvUOP4KLtq5G3jZvUiz5BTr1fGw/exec';

function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addUserMessage(text) {
    const block = document.createElement('div');
    block.className = 'message-block user-block';
    block.innerHTML = `<div class="user-msg">${text}</div>`;
    timeline.appendChild(block);
    scrollToElement(block);
}

function showLoading() {
    const block = document.createElement('div');
    block.className = 'message-block loading-msg';
    block.id = 'loading-indicator';
    block.innerHTML = `<div class="bible-msg" style="font-size: 1.1rem; opacity: 0.5;">Consultando as escrituras...</div>`;
    timeline.appendChild(block);
    scrollToElement(block);
}

function removeLoading() {
    const loadingBlock = document.getElementById('loading-indicator');
    if (loadingBlock) {
        loadingBlock.remove();
    }
}

function typeBotMessage(text) {
    const block = document.createElement('div');
    block.className = 'message-block bot-block';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'bible-msg';
    block.appendChild(textContainer);
    
    timeline.appendChild(block);
    scrollToElement(block);

    const words = text.split(' ');
    let i = 0;

    function typeWord() {
        if (i < words.length) {
            const span = document.createElement('span');
            span.textContent = words[i]; 
            span.className = 'word-reveal';
            span.style.animationDelay = '0.1s'; 
            
            textContainer.appendChild(span);

            const space = document.createTextNode(' ');
            textContainer.appendChild(space);

            i++;
            setTimeout(typeWord, 100);
        } else {
            addShareButton(block, text);
        }
    }
    
    setTimeout(typeWord, 300);
}

function addShareButton(container, text) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = 'Compartilhar Versículo';
    shareBtn.onclick = () => shareVersicle(text);
    container.appendChild(shareBtn);
}

async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    inputField.value = '';
    inputField.disabled = true;
    sendBtn.disabled = true;

    addUserMessage(text);
    showLoading();

    try {
        // O parâmetro redirect: 'follow' é crucial para o Google Apps Script
        const response = await fetch(`${API_URL}?pergunta=${encodeURIComponent(text)}`, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        const respostaBot = data.resposta || data.mensagem || data || "Silêncio divino... não encontrei a resposta.";
        
        removeLoading();
        typeBotMessage(respostaBot);

    } catch (error) {
        removeLoading();
        typeBotMessage("Perdoe-me, houve um erro ao buscar a sabedoria. Tente novamente.");
        console.error("Detalhe do erro na API:", error);
    } finally {
        inputField.disabled = false;
        sendBtn.disabled = false;
        
        // Em celulares, voltar o foco automaticamente pode reabrir o teclado e atrapalhar a leitura.
        // Se quiser que o teclado reabra, descomente a linha abaixo:
        // inputField.focus(); 
    }
}

sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSend();
    }
});

function shareVersicle(text) {
    const cardContent = document.getElementById('card-content');
    cardContent.textContent = text;
    const card = document.getElementById('share-card');

    html2canvas(card, {
        scale: 2, 
        backgroundColor: '#07090F', 
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'versiculo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
