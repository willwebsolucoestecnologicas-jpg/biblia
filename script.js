const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

// O URL do seu Web App gerado no Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbx2zN4QIM5PMBa9DfhNhoPeFC62NflJfi1zNyDyA9XXQ_U3fNWRM_qXfKTb9MNfIbGJ-Q/exec';

// Adiciona a mensagem do usuário
function addUserMessage(text) {
    const block = document.createElement('div');
    block.className = 'message-block';
    block.innerHTML = `<div class="user-msg">${text}</div>`;
    timeline.appendChild(block);
    scrollToBottom();
}

// Adiciona o indicador de carregamento
function showLoading() {
    const block = document.createElement('div');
    block.className = 'message-block loading-msg';
    block.id = 'loading-indicator';
    block.innerHTML = `<div class="bible-msg" style="font-size: 1.1rem; opacity: 0.5;">Buscando nas escrituras...</div>`;
    timeline.appendChild(block);
    scrollToBottom();
}

// Remove o indicador de carregamento
function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.remove();
    }
}

// Simula a resposta da Bíblia com efeito de revelação
function addBibleResponse(text) {
    const block = document.createElement('div');
    block.className = 'message-block';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'bible-msg';
    block.appendChild(textContainer);
    timeline.appendChild(block);

    // Divide o texto em palavras para animar uma a uma
    const words = text.split(' ');
    textContainer.innerHTML = ''; 

    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'word-reveal';
        span.style.animationDelay = `${index * 0.15}s`; 
        textContainer.appendChild(span);
    });

    scrollToBottom();
}

function scrollToBottom() {
    timeline.scrollTo({
        top: timeline.scrollHeight,
        behavior: 'smooth'
    });
}

// Comunicação Real com sua API (Apps Script)
async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    addUserMessage(text);
    inputField.value = '';

    // Validação de segurança para garantir que o link foi colado e não é uma chave de API
    if (!API_URL.includes("script.google.com")) {
        addBibleResponse("Atenção: O link da API_URL parece incorreto. Certifique-se de usar o URL do Web App do Apps Script.");
        return;
    }

    showLoading();

    try {
        // Fazemos o POST como text/plain para contornar qualquer bloqueio de CORS do navegador
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ mensagem: text })
        });

        const data = await response.json();
        
        hideLoading();

        if (data.resposta) {
            addBibleResponse(data.resposta);
        } else if (data.erro) {
            addBibleResponse("Sinto muito, houve uma perturbação no caminho: " + data.erro);
        }

    } catch (error) {
        hideLoading();
        console.error("Erro na requisição:", error);
        addBibleResponse("A paz esteja com você. No momento, não consegui me conectar. Tente novamente em breve.");
    }
}

sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
