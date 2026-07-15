const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const timeline = document.getElementById('chat-timeline');

// Substitua pelo URL do seu Web App real do Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbyopLIiJtMWObtOaQoZlvqkBc9BmDjRuqLyNxUaU8rRvUOP4KLtq5G3jZvUiz5BTr1fGw/exec';

// Nova função de scroll que foca no TOPO do elemento especificado
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
    // Cria o bloco da mensagem
    const block = document.createElement('div');
    block.className = 'message-block bot-block';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'bible-msg';
    block.appendChild(textContainer);
    
    timeline.appendChild(block);
    
    // IMPORTANTE: Foca a tela no início deste bloco ANTES de começar a digitar.
    // Assim o usuário lê de cima para baixo sem perder o foco.
    scrollToElement(block);

    // Efeito de digitação revelando palavra por palavra
    const words = text.split(' ');
    let i = 0;

    function typeWord() {
        if (i < words.length) {
            const span = document.createElement('span');
            span.textContent = words[i] + ' ';
            span.className = 'word-reveal';
            
            // Um leve atraso na animação para dar fluidez
            span.style.animationDelay = '0.1s'; 
            
            textContainer.appendChild(span);
            i++;
            setTimeout(typeWord, 150); // Velocidade da digitação (150ms por palavra)
        } else {
            // Quando terminar de digitar, adiciona o botão de compartilhar
            addShareButton(block, text);
        }
    }
    
    // Inicia a digitação
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

// 6. Lógica de envio (Conecta todas as funções)
async function handleSend() {
    const text = inputField.value.trim();
    if (!text) return;

    // Limpa o input e desabilita enquanto processa
    inputField.value = '';
    inputField.disabled = true;
    sendBtn.disabled = true;

    addUserMessage(text);
    showLoading();

    try {
        // AQUI VOCÊ FAZ SUA CHAMADA REAL PARA A API:
        // const response = await fetch(`${API_URL}?pergunta=${encodeURIComponent(text)}`);
        // const data = await response.json();
        // const respostaBot = data.resposta;
        
        // Simulação de espera de rede (remover quando integrar a API real)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulação de resposta (remover quando integrar a API real)
        const respostaBot = `"O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?" (Salmos 27:1)`;
        
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
        backgroundColor: '#07090F', // Garante o fundo escuro na imagem
        logging: false
    }).then(canvas => {
        // Converte para imagem e faz o download
        const link = document.createElement('a');
        link.download = 'versiculo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
