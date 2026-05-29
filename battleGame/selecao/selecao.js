// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

const gridEquipe = document.getElementById('grid-equipe');
const btnIniciar = document.getElementById('btn-iniciar');
const btnCancelar = document.getElementById('btn-cancelar');
const subtituloDif = document.getElementById('subtitulo-dificuldade');

// Le dificuldade da URL (?dif=iniciante|dificil|maluco)
const params = new URLSearchParams(window.location.search);
const dificuldade = params.get('dif') || 'iniciante';
subtituloDif.textContent = `Dificuldade: ${dificuldade}`;

let escolhidoId = null;

function carregarEquipe() {
    const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
    const pokedex = JSON.parse(localStorage.getItem('pokemons_g1_g3') || '[]');
    const equipe = equipeIds
        .map(id => pokedex.find(p => p.id === id))
        .filter(Boolean);

    if (equipe.length === 0) {
        mostrarAlerta('Voce precisa ter uma equipe pra batalhar! Volte e escolha seus Pokemons.', 'Sem equipe').then(() => {
            window.location.href = '../../chooseGame/aventura.html';
        });
        return;
    }

    gridEquipe.innerHTML = '';
    equipe.forEach(p => {
        const card = document.createElement('button');
        card.type = 'button';
        card.classList.add('selecao-card');
        card.dataset.id = p.id;

        const img = document.createElement('img');
        img.src = p.sprite;
        img.alt = p.nome;
        card.appendChild(img);

        const nome = document.createElement('span');
        nome.classList.add('selecao-nome');
        nome.textContent = p.nome;
        card.appendChild(nome);

        const tipo = document.createElement('span');
        tipo.classList.add('selecao-tipo');
        tipo.textContent = p.tipo;
        card.appendChild(tipo);

        card.addEventListener('click', () => escolher(p.id, card));
        gridEquipe.appendChild(card);
    });
}

function escolher(id, cardEl) {
    document.querySelectorAll('.selecao-card.escolhido').forEach(c => c.classList.remove('escolhido'));
    cardEl.classList.add('escolhido');
    escolhidoId = id;
    btnIniciar.disabled = false;
}

btnIniciar.addEventListener('click', () => {
    if (!escolhidoId) return;
    window.location.href = `../arena/arena.html?dif=${dificuldade}&ativo=${escolhidoId}`;
});

btnCancelar.addEventListener('click', () => {
    window.location.href = '../../chooseGame/aventura.html';
});

carregarEquipe();
