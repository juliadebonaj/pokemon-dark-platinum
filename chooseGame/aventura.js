// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

const spriteTreinador = document.getElementById('sprite-treinador');
const nomeTreinador = document.getElementById('nome-treinador');
const btnVoltarEquipe = document.getElementById('btn-voltar-equipe');
const btnLogout = document.getElementById('btn-logout');
const btnMemoria = document.getElementById('btn-memoria');
const btnBatalha = document.getElementById('btn-batalha');
const btnExtra = document.getElementById('btn-extra');
const spriteMemoria = document.getElementById('sprite-memoria');
const spriteBatalha = document.getElementById('sprite-batalha');
const spriteExtra = document.getElementById('sprite-extra');
const overlayMemoria = document.getElementById('overlay-memoria');
const btnFecharOverlay = document.getElementById('btn-fechar-overlay');
const btnIniciante = document.getElementById('btn-iniciante');
const btnDificil = document.getElementById('btn-dificil');
const btnMaluco = document.getElementById('btn-maluco');

const overlayExtra = document.getElementById('overlay-extra');
const btnFecharOverlayExtra = document.getElementById('btn-fechar-overlay-extra');
const btnExtraIniciante = document.getElementById('btn-extra-iniciante');
const btnExtraDificil = document.getElementById('btn-extra-dificil');
const btnExtraMaluco = document.getElementById('btn-extra-maluco');

const overlayBatalha = document.getElementById('overlay-batalha');
const btnFecharOverlayBatalha = document.getElementById('btn-fechar-overlay-batalha');
const btnBatIniciante = document.getElementById('btn-bat-iniciante');
const btnBatDificil = document.getElementById('btn-bat-dificil');
const btnBatMaluco = document.getElementById('btn-bat-maluco');

// Carrega dados do treinador
function carregarTreinador() {
    const dados = localStorage.getItem('treinador');
    if (!dados) {
        window.location.href = '../register/registrar.html';
        return;
    }
    const treinador = JSON.parse(dados);
    spriteTreinador.src = treinador.avatar === 'menina' ? '../photos/girl.png' : '../photos/boy.png';
    spriteTreinador.alt = `Sprite ${treinador.avatar}`;
    nomeTreinador.textContent = treinador.nome;
}

// Carrega sprites dos cards de modo: usa pokemons da equipe e completa com sprites do treinador (alternando boy/girl) se faltar
function carregarSpritesEquipe() {
    const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
    const pokedex = JSON.parse(localStorage.getItem('pokemons_g1_g3') || '[]');
    const treinador = JSON.parse(localStorage.getItem('treinador') || 'null');
    const equipe = equipeIds
        .map(id => pokedex.find(p => p.id === id))
        .filter(Boolean);

    // Comeca pelo sprite escolhido pelo usuario, alterna pro outro nos proximos slots
    const escolhido = treinador?.avatar === 'menina' ? '../photos/girl.png' : '../photos/boy.png';
    const oposto = treinador?.avatar === 'menina' ? '../photos/boy.png' : '../photos/girl.png';
    const fallbacks = [escolhido, oposto];

    const slots = [spriteMemoria, spriteBatalha, spriteExtra];
    let usadosFallback = 0;
    slots.forEach((img, i) => {
        const pokemon = equipe[i];
        if (pokemon) {
            img.src = pokemon.sprite;
            img.alt = pokemon.nome;
        } else {
            img.src = fallbacks[usadosFallback % fallbacks.length];
            img.alt = treinador?.nome || 'Treinador';
            usadosFallback++;
        }
    });
}

btnVoltarEquipe.addEventListener('click', () => {
    window.location.href = '../pokeTeam/equipe.html';
});

btnLogout.addEventListener('click', async () => {
    if (await mostrarConfirmacao('Sair e apagar treinador + equipe?', 'Sair')) {
        localStorage.removeItem('treinador');
        localStorage.removeItem('equipe');
        localStorage.removeItem('equipeConfirmada');
        window.location.href = '../register/registrar.html';
    }
});

btnMemoria.addEventListener('click', () => {
    overlayMemoria.classList.add('ativo');
});

btnFecharOverlay.addEventListener('click', () => {
    overlayMemoria.classList.remove('ativo');
});

// Fecha o overlay ao clicar no fundo (fora do card)
overlayMemoria.addEventListener('click', (e) => {
    if (e.target === overlayMemoria) {
        overlayMemoria.classList.remove('ativo');
    }
});

btnIniciante.addEventListener('click', () => {
    window.location.href = '../memoryGame/begginer/memoriaIniciante.html';
});

btnDificil.addEventListener('click', () => {
    window.location.href = '../memoryGame/pro/memoriaDificil.html';
});

btnMaluco.addEventListener('click', () => {
    window.location.href = '../memoryGame/crazy/memoriaMaluco.html';
});

btnBatalha.addEventListener('click', () => {
    overlayBatalha.classList.add('ativo');
});

btnFecharOverlayBatalha.addEventListener('click', () => {
    overlayBatalha.classList.remove('ativo');
});

overlayBatalha.addEventListener('click', (e) => {
    if (e.target === overlayBatalha) {
        overlayBatalha.classList.remove('ativo');
    }
});

btnBatIniciante.addEventListener('click', () => {
    window.location.href = '../battleGame/selecao/selecao.html?dif=iniciante';
});

btnBatDificil.addEventListener('click', () => {
    window.location.href = '../battleGame/selecao/selecao.html?dif=dificil';
});

btnBatMaluco.addEventListener('click', () => {
    window.location.href = '../battleGame/selecao/selecao.html?dif=maluco';
});

btnExtra.addEventListener('click', () => {
    overlayExtra.classList.add('ativo');
});

btnFecharOverlayExtra.addEventListener('click', () => {
    overlayExtra.classList.remove('ativo');
});

overlayExtra.addEventListener('click', (e) => {
    if (e.target === overlayExtra) {
        overlayExtra.classList.remove('ativo');
    }
});

btnExtraIniciante.addEventListener('click', () => {
    window.location.href = '../extraGame/begginer/extraIniciante.html';
});

btnExtraDificil.addEventListener('click', () => {
    window.location.href = '../extraGame/pro/extraDificil.html';
});

btnExtraMaluco.addEventListener('click', () => {
    window.location.href = '../extraGame/crazy/extraMaluco.html';
});

carregarTreinador();
carregarSpritesEquipe();
