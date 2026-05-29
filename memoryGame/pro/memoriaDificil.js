// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

const tabuleiro = document.getElementById('tabuleiro');
const contadorJogadas = document.getElementById('contador-jogadas');
const contadorPares = document.getElementById('contador-pares'); // reutilizado para "Trincas"
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnVoltar = document.getElementById('btn-voltar');
const overlayVitoria = document.getElementById('overlay-vitoria');
const estatisticaJogadas = document.getElementById('estatistica-jogadas');
const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
const btnVoltarAventura = document.getElementById('btn-voltar-aventura');

const COPIAS_POR_IMAGEM = 3; // modo difícil = trincas

let cartas = [];
let cartasViradas = [];
let bloqueado = false;
let jogadas = 0;
let trincasEncontradas = 0;
let totalTrincas = 0;

function embaralhar(array) {
    const copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function montarBaralho() {
    const treinador = JSON.parse(localStorage.getItem('treinador') || 'null');
    const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
    const pokedex = JSON.parse(localStorage.getItem('pokemons_g1_g3') || '[]');
    const equipe = equipeIds
        .map(id => pokedex.find(p => p.id === id))
        .filter(Boolean);

    if (!treinador || equipe.length === 0) {
        mostrarAlerta('Você precisa registrar um treinador e escolher pelo menos 1 Pokémon na equipe!', 'Sem equipe').then(() => {
            window.location.href = '../../chooseGame/aventura.html';
        });
        return [];
    }

    const imagensUnicas = [
        {
            id: 'treinador',
            src: treinador.avatar === 'menina' ? '../../photos/girl.png' : '../../photos/boy.png',
            alt: treinador.nome || 'Treinador'
        },
        ...equipe.map(p => ({
            id: `poke-${p.id}`,
            src: p.sprite,
            alt: p.nome
        }))
    ];

    // Triplica cada imagem (3 cópias = trinca)
    const baralho = imagensUnicas.flatMap(img => {
        const copias = [];
        for (let i = 0; i < COPIAS_POR_IMAGEM; i++) {
            copias.push({ ...img, uid: `${img.id}-${i}` });
        }
        return copias;
    });

    return embaralhar(baralho);
}

function calcularColunas(total) {
    if (total <= 4) return 2;
    if (total <= 8) return 4;
    if (total <= 10) return 5;
    if (total <= 12) return 4;
    return Math.ceil(Math.sqrt(total));
}

function renderizarTabuleiro() {
    tabuleiro.innerHTML = '';
    const colunas = calcularColunas(cartas.length);
    tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 130px)`;

    cartas.forEach(carta => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('carta');
        btn.dataset.id = carta.id;
        btn.dataset.uid = carta.uid;

        const interior = document.createElement('div');
        interior.classList.add('carta-interior');

        const verso = document.createElement('div');
        verso.classList.add('carta-verso');

        const frente = document.createElement('div');
        frente.classList.add('carta-frente');
        const img = document.createElement('img');
        img.src = carta.src;
        img.alt = carta.alt;
        frente.appendChild(img);

        interior.appendChild(verso);
        interior.appendChild(frente);
        btn.appendChild(interior);

        btn.addEventListener('click', () => virarCarta(btn));
        tabuleiro.appendChild(btn);
    });
}

function virarCarta(cartaEl) {
    if (bloqueado) return;
    if (cartaEl.classList.contains('virada')) return;
    if (cartaEl.classList.contains('combinada')) return;

    cartaEl.classList.add('virada');
    cartasViradas.push(cartaEl);

    if (cartasViradas.length === 3) {
        jogadas++;
        contadorJogadas.textContent = jogadas;
        verificarTrinca();
    }
}

function verificarTrinca() {
    const [c1, c2, c3] = cartasViradas;
    const todosIguais = c1.dataset.id === c2.dataset.id && c2.dataset.id === c3.dataset.id;

    if (todosIguais) {
        c1.classList.add('combinada');
        c2.classList.add('combinada');
        c3.classList.add('combinada');
        cartasViradas = [];
        trincasEncontradas++;
        contadorPares.textContent = `${trincasEncontradas} / ${totalTrincas}`;

        if (trincasEncontradas === totalTrincas) {
            setTimeout(mostrarVitoria, 600);
        }
    } else {
        bloqueado = true;
        setTimeout(() => {
            cartasViradas.forEach(c => c.classList.remove('virada'));
            cartasViradas = [];
            bloqueado = false;
        }, 1100);
    }
}

function mostrarVitoria() {
    estatisticaJogadas.textContent = jogadas;
    overlayVitoria.classList.add('ativo');
}

function iniciarJogo() {
    cartas = montarBaralho();
    if (cartas.length === 0) return;

    totalTrincas = cartas.length / COPIAS_POR_IMAGEM;
    jogadas = 0;
    trincasEncontradas = 0;
    cartasViradas = [];
    bloqueado = false;

    contadorJogadas.textContent = '0';
    contadorPares.textContent = `0 / ${totalTrincas}`;
    overlayVitoria.classList.remove('ativo');

    renderizarTabuleiro();
}

btnReiniciar.addEventListener('click', iniciarJogo);
btnJogarNovamente.addEventListener('click', iniciarJogo);
btnVoltar.addEventListener('click', () => {
    window.location.href = '../../chooseGame/aventura.html';
});
btnVoltarAventura.addEventListener('click', () => {
    window.location.href = '../../chooseGame/aventura.html';
});

iniciarJogo();
