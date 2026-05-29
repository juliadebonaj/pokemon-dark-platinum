// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

const tabuleiro = document.getElementById('tabuleiro');
const contadorJogadas = document.getElementById('contador-jogadas');
const contadorPares = document.getElementById('contador-pares');
const contadorIntruso = document.getElementById('contador-intruso');
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnVoltar = document.getElementById('btn-voltar');

const overlayIntruso = document.getElementById('overlay-intruso');
const spriteIntruso = document.getElementById('sprite-intruso');
const nomeIntrusoEl = document.getElementById('nome-intruso');
const btnFecharIntruso = document.getElementById('btn-fechar-intruso');

const overlayVitoria = document.getElementById('overlay-vitoria');
const estatisticaJogadas = document.getElementById('estatistica-jogadas');
const estatisticaIntruso = document.getElementById('estatistica-intruso');
const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
const btnVoltarAventura = document.getElementById('btn-voltar-aventura');

let cartas = [];
let cartasViradas = [];
let bloqueado = false;
let jogadas = 0;
let paresEncontrados = 0;
let totalPares = 0;
let intrusoEncontrado = false;
let pokemonIntruso = null;

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

    // Imagens base (treinador + equipe) duplicadas em pares
    const imagensUnicas = [
        {
            id: 'treinador',
            src: treinador.avatar === 'menina' ? '../../photos/girl.png' : '../../photos/boy.png',
            alt: treinador.nome || 'Treinador',
            intrusa: false
        },
        ...equipe.map(p => ({
            id: `poke-${p.id}`,
            src: p.sprite,
            alt: p.nome,
            intrusa: false
        }))
    ];

    const baralho = imagensUnicas.flatMap(img => [
        { ...img, uid: `${img.id}-a` },
        { ...img, uid: `${img.id}-b` }
    ]);

    // Sorteia 1 pokemon aleatorio que NAO esta na equipe
    const idsEquipe = new Set(equipeIds);
    const candidatos = pokedex.filter(p => !idsEquipe.has(p.id) && p.sprite);
    if (candidatos.length > 0) {
        pokemonIntruso = candidatos[Math.floor(Math.random() * candidatos.length)];
        baralho.push({
            id: `intruso-${pokemonIntruso.id}`,
            src: pokemonIntruso.sprite,
            alt: pokemonIntruso.nome,
            intrusa: true,
            uid: `intruso-${pokemonIntruso.id}`
        });
    } else {
        pokemonIntruso = null;
    }

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
        if (carta.intrusa) btn.classList.add('intrusa');
        btn.dataset.id = carta.id;
        btn.dataset.uid = carta.uid;
        btn.dataset.intrusa = carta.intrusa ? 'true' : 'false';
        btn.dataset.nome = carta.alt;
        btn.dataset.src = carta.src;

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

    // Carta intrusa: trata separadamente, ela nao precisa de par
    if (cartaEl.dataset.intrusa === 'true') {
        bloqueado = true;
        setTimeout(() => {
            cartaEl.classList.add('combinada');
            intrusoEncontrado = true;
            contadorIntruso.textContent = '✔';
            mostrarPopupIntruso(cartaEl.dataset.nome, cartaEl.dataset.src);
            // libera bloqueio so quando o popup for fechado
        }, 600);
        return;
    }

    cartasViradas.push(cartaEl);

    if (cartasViradas.length === 2) {
        jogadas++;
        contadorJogadas.textContent = jogadas;
        verificarPar();
    }
}

function verificarPar() {
    const [c1, c2] = cartasViradas;
    if (c1.dataset.id === c2.dataset.id) {
        c1.classList.add('combinada');
        c2.classList.add('combinada');
        cartasViradas = [];
        paresEncontrados++;
        contadorPares.textContent = `${paresEncontrados} / ${totalPares}`;
        verificarFimDeJogo();
    } else {
        bloqueado = true;
        setTimeout(() => {
            c1.classList.remove('virada');
            c2.classList.remove('virada');
            cartasViradas = [];
            bloqueado = false;
        }, 900);
    }
}

function mostrarPopupIntruso(nome, src) {
    spriteIntruso.src = src;
    spriteIntruso.alt = nome;
    nomeIntrusoEl.textContent = nome;
    overlayIntruso.classList.add('ativo');
}

btnFecharIntruso.addEventListener('click', () => {
    overlayIntruso.classList.remove('ativo');
    bloqueado = false;
    verificarFimDeJogo();
});

function verificarFimDeJogo() {
    const todosParesOk = paresEncontrados === totalPares;
    const intrusoOk = !pokemonIntruso || intrusoEncontrado;
    if (todosParesOk && intrusoOk) {
        setTimeout(mostrarVitoria, 600);
    }
}

function mostrarVitoria() {
    estatisticaJogadas.textContent = jogadas;
    estatisticaIntruso.textContent = pokemonIntruso ? pokemonIntruso.nome : '—';
    overlayVitoria.classList.add('ativo');
}

function iniciarJogo() {
    cartas = montarBaralho();
    if (cartas.length === 0) return;

    // total de pares = cartas pares (excluindo a intrusa) / 2
    totalPares = Math.floor(cartas.filter(c => !c.intrusa).length / 2);
    jogadas = 0;
    paresEncontrados = 0;
    cartasViradas = [];
    bloqueado = false;
    intrusoEncontrado = false;

    contadorJogadas.textContent = '0';
    contadorPares.textContent = `0 / ${totalPares}`;
    contadorIntruso.textContent = '?';
    overlayVitoria.classList.remove('ativo');
    overlayIntruso.classList.remove('ativo');

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
