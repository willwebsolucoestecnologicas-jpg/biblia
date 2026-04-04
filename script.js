const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

// O URL do seu Web App gerado no Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyopLIiJtMWObtOaQoZlvqkBc9BmDjRuqLyNxUaU8rRvUOP4KLtq5G3jZvUiz5BTr1fGw/exec';

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
// ... (seu código existente: inputField, sendBtn, etc.) ...

// Função para adicionar a mensagem da IA com o botão de compartilhamento
function addBibleResponse(text) {
    const block = document.createElement('div');
    block.className = 'message-block';
    
    // Conteúdo da mensagem com ID único
    const textContainer = document.createElement('div');
    textContainer.className = 'bible-msg';
    const msgId = 'msg-' + Date.now(); // Gera um ID único com base no tempo
    textContainer.id = msgId;
    block.appendChild(textContainer);

    // Cria o botão de compartilhamento sutil
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = 'Compartilhar';
    // Define a ação do botão, passando o ID da mensagem para a função
    shareBtn.onclick = function() {
        compartilharMensagem(msgId);
    };
    block.appendChild(shareBtn);

    timeline.appendChild(block);

    // Divide o texto em palavras para animar uma a uma (mantendo sua animação)
    const words = text.split(' ');
    textContainer.innerHTML = ''; 

    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'word-reveal';
        // Atraso escalonado para cada palavra
        span.style.animationDelay = `${index * 0.15}s`; 
        textContainer.appendChild(span);
    });

    scrollToBottom();
}

// NOVA FUNÇÃO MÁGICA: Lógica para popular e capturar o card formatado
function compartilharMensagem(messageId) {
    const originalMessageElement = document.getElementById(messageId);
    if (!originalMessageElement) return;

    // 1. Pega o texto limpo da mensagem (sem as spans de animação)
    const textToShare = originalMessageElement.textContent;

    // 2. Popula o Card de Compartilhamento oculto com este texto
    const cardContentElement = document.getElementById('card-content');
    cardContentElement.textContent = textToShare;

    // 3. Torna o card visível temporariamente para a captura
    const cardContainer = document.getElementById('share-card-container');
    const cardElement = document.getElementById('share-card');
    cardContainer.style.display = 'block';

    // 4. Usa o html2canvas para capturar APENAS o card
    html2canvas(cardElement, {
        scale: 1, // Capture na escala 1:1 do elemento, que já é alta (1080px)
        backgroundColor: '#050505', // Garante o fundo preto do tema
        logging: false, // Desativa logs no console
    }).then(canvas => {
        // 5. Esconde o card novamente
        cardContainer.style.display = 'none';

        // 6. Converte o canvas para imagem (dataURL)
        const imgData = canvas.toDataURL('image/png');

        // 7. Dispara o download da imagem final
        const link = document.createElement('a');
        link.download = 'conselho-biblico.png';
        link.href = imgData;
        link.click();
    });
}

// ... (resto do seu código: scrollToBottom, handleSend, etc.) ...

function scrollToBottom() {
    timeline.scrollTo({
        top: timeline.scrollHeight,
        behavior: 'smooth'
    });
}

// Comunicação Real com sua API (Apps Script)
// Recupera o histórico salvo ou cria um novo array vazio
let chatHistory = JSON.parse(localStorage.getItem('biblia_history')) || [];

async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    addUserMessage(text);
    inputField.value = '';

    if (!API_URL.includes("script.google.com")) {
        addBibleResponse("Atenção: O link da API_URL parece incorreto.");
        return;
    }

    showLoading();

    // Salva a mensagem do usuário no histórico (mantendo as últimas 6 mensagens para não pesar)
    chatHistory.push({ role: 'user', content: text });
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(chatHistory.length - 6);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            // Enviamos o histórico junto com a mensagem atual!
            body: JSON.stringify({ mensagem: text, historico: chatHistory }) 
        });

        const data = await response.json();
        hideLoading();

        if (data.resposta) {
            addBibleResponse(data.resposta);
            // Salva a resposta da IA no histórico
            chatHistory.push({ role: 'ia', content: data.resposta });
            localStorage.setItem('biblia_history', JSON.stringify(chatHistory));
        } else if (data.erro) {
            addBibleResponse("Sinto muito, houve uma perturbação no caminho: " + data.erro);
        }

    } catch (error) {
        hideLoading();
        addBibleResponse("A paz esteja com você. No momento, não consegui me conectar.");
    }
}
sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Atualize sua função addBibleResponse para incluir o botão de compartilhar
function addBibleResponse(text) {
    const block = document.createElement('div');
    block.className = 'message-block';
    // Colocamos um ID único para o canvas conseguir capturar
    const msgId = 'msg-' + Date.now(); 
    
    block.innerHTML = `
        <div class="bible-msg" id="${msgId}" style="padding: 20px; border-radius: 10px;"></div>
        <button onclick="gerarCard('${msgId}')" style="background: transparent; border: 1px solid #E8D3A2; color: #E8D3A2; padding: 5px 15px; border-radius: 20px; cursor: pointer; margin-top: 15px; font-family: 'Inter'; font-size: 0.8rem;">
            Compartilhar no Instagram
        </button>
    `;
    timeline.appendChild(block);

    const textContainer = block.querySelector('.bible-msg');
    const words = text.split(' ');
    
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.className = 'word-reveal';
        span.style.animationDelay = `${index * 0.15}s`; 
        textContainer.appendChild(span);
    });

    scrollToBottom();
}

// Função Mágica DEFINITIVA para capturar animações (html2canvas)
function gerarCard(elementId) {
    const elemento = document.getElementById(elementId);
    
    // Adiciona a marca d'água temporária para a foto
    const marcaAgua = document.createElement('div');
    marcaAgua.style.cssText = "font-family: Inter, sans-serif; font-size: 0.8rem; color: rgba(232, 211, 162, 0.5); font-weight: 300; margin-top: 15px; text-align: center;";
    marcaAgua.innerHTML = "Gerado no Chat Bíblico Imersivo";
    elemento.appendChild(marcaAgua);

    // Configurações do html2canvas focadas em desativar a animação
    html2canvas(elemento, {
        backgroundColor: '#050505', // Fundo dark
        scale: 2, // Alta resolução
        logging: false, 
        useCORS: true, 
        
        // A SOLUÇÃO ESTÁ AQUI: No processamento do clone
        onclone: function(clonedDocument) {
            // Localiza o elemento clonado específico
            const elementoNoClone = clonedDocument.getElementById(elementId);
            
            // Encontra todas as palavras que teriam a animação
            const palavrasNoClone = elementoNoClone.querySelectorAll('.word-reveal');
            
            // Força a desativação da animação e a visibilidade total
            palavrasNoClone.forEach(span => {
                // Removemos qualquer animação ativa usando !important
                span.style.setProperty('animation', 'none', 'important');
                span.style.setProperty('-webkit-animation', 'none', 'important'); // Segurança para Safari
                
                // Forçamos o estado final da animação (visível e no lugar)
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
                span.style.visibility = 'visible'; // Garante que não esteja hidden
            });
            
            console.log('DOM clonado: Animações CSS desativadas à força no card.');
        }
    }).then(canvas => {
        // Remove a marca d'água da tela do chat original
        elemento.removeChild(marcaAgua);
        
        // Dispara o download da imagem
        const link = document.createElement('a');
        link.download = 'conselho_biblico.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Erro ao gerar card:', err);
        // Garante a remoção da marca d'água mesmo em caso de erro
        if (elemento.contains(marcaAgua)) elemento.removeChild(marcaAgua);
    });
}
