// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

// arena.js — logica completa da batalha por turnos

// === Refs DOM ===
const $loading = document.getElementById('loading');
const $arena = document.getElementById('arena');
const $subtituloDif = document.getElementById('subtitulo-dificuldade');
const $caixaMsg = document.getElementById('caixa-mensagem');

const $painelInimigo = document.getElementById('painel-inimigo');
const $painelJogador = document.getElementById('painel-jogador');
const $spriteInimigo = document.getElementById('sprite-inimigo');
const $spriteJogador = document.getElementById('sprite-jogador');
const $nomeInimigo = document.getElementById('nome-inimigo');
const $nomeJogador = document.getElementById('nome-jogador');
const $tipoInimigo = document.getElementById('tipo-inimigo');
const $tipoJogador = document.getElementById('tipo-jogador');
const $barraInimigo = document.getElementById('barra-inimigo');
const $barraJogador = document.getElementById('barra-jogador');
const $hpInimigo = document.getElementById('hp-inimigo');
const $hpJogador = document.getElementById('hp-jogador');
const $modInimigo = document.getElementById('mod-inimigo');
const $modJogador = document.getElementById('mod-jogador');

const $movimentosGrid = document.getElementById('movimentos-grid');
const $btnTrocar = document.getElementById('btn-trocar');
const $btnFugir = document.getElementById('btn-fugir');

const $overlayTroca = document.getElementById('overlay-troca');
const $msgTroca = document.getElementById('msg-troca');
const $trocaGrid = document.getElementById('troca-grid');
const $btnFecharTroca = document.getElementById('btn-fechar-troca');

const $overlayVitoria = document.getElementById('overlay-vitoria');
const $estatisticaVitoria = document.getElementById('estatistica-vitoria');
const $btnNovaBatalha = document.getElementById('btn-nova-batalha');
const $btnVoltarAventura = document.getElementById('btn-voltar-aventura');

const $overlayDerrota = document.getElementById('overlay-derrota');
const $btnTentarNovamente = document.getElementById('btn-tentar-novamente');
const $btnVoltarAventuraDerrota = document.getElementById('btn-voltar-aventura-derrota');

// === Estado global ===
const params = new URLSearchParams(window.location.search);
const dificuldade = params.get('dif') || 'iniciante';
const ativoIdInicial = parseInt(params.get('ativo'), 10);

const estado = {
    jogador: { equipe: [], ativoIdx: 0 },
    maquina: { pokemon: null },
    turnoDoJogador: true,
    batalhaEmAndamento: true,
    turnos: 0
};

$subtituloDif.textContent = `Dificuldade: ${dificuldade}`;

// === API helpers ===
async function buscarPokemonCompleto(idOuNome) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOuNome}`);
    if (!res.ok) throw new Error(`Falha ao buscar pokemon ${idOuNome}`);
    const data = await res.json();

    const stats = {};
    data.stats.forEach(s => {
        const nome = s.stat.name;
        if (nome === 'hp') stats.hp = s.base_stat;
        else if (nome === 'attack') stats.attack = s.base_stat;
        else if (nome === 'defense') stats.defense = s.base_stat;
        else if (nome === 'speed') stats.speed = s.base_stat;
    });

    // Pega ate 4 movimentos com power
    const movsCandidatos = data.moves.slice(0, 30);
    const movimentos = [];
    for (const m of movsCandidatos) {
        if (movimentos.length >= 4) break;
        try {
            const r = await fetch(m.move.url);
            const md = await r.json();
            if (md.power) {
                movimentos.push({
                    nome: md.name.replace(/-/g, ' '),
                    tipo: md.type.name,
                    power: md.power,
                    efeito: 'dano'
                });
            }
        } catch (e) {
            // ignora movimento que falhar
        }
    }
    // Se nao achou 4, completa com tackle generico
    while (movimentos.length < 4) {
        movimentos.push({
            nome: 'tackle',
            tipo: 'normal',
            power: 40,
            efeito: 'dano'
        });
    }
    // Substitui o ultimo por um buff de defesa pra ter variedade
    movimentos[3] = {
        nome: 'defesa em garra',
        tipo: data.types[0].type.name,
        power: 0,
        efeito: 'buff-defesa'
    };

    return {
        id: data.id,
        nome: data.name,
        sprite: data.sprites.front_default,
        spriteCostas: data.sprites.back_default || data.sprites.front_default,
        tipoPrimario: data.types[0].type.name,
        stats,
        movimentos
    };
}

// === Renderizacao ===
function ativoJogador() {
    return estado.jogador.equipe[estado.jogador.ativoIdx];
}

function atualizarUI() {
    const j = ativoJogador();
    const i = estado.maquina.pokemon;

    $spriteJogador.src = j.spriteCostas;
    $nomeJogador.textContent = j.nome;
    $tipoJogador.textContent = j.tipoPrimario;
    $hpJogador.textContent = `HP: ${j.hpAtual} / ${j.hpMax}`;
    const pctJ = (j.hpAtual / j.hpMax) * 100;
    $barraJogador.style.width = `${pctJ}%`;
    $barraJogador.classList.toggle('media', pctJ <= 50 && pctJ > 25);
    $barraJogador.classList.toggle('baixa', pctJ <= 25);
    $modJogador.textContent = formatarMods(j.modificadores);

    $spriteInimigo.src = i.sprite;
    $nomeInimigo.textContent = i.nome;
    $tipoInimigo.textContent = i.tipoPrimario;
    $hpInimigo.textContent = `HP: ${i.hpAtual} / ${i.hpMax}`;
    const pctI = (i.hpAtual / i.hpMax) * 100;
    $barraInimigo.style.width = `${pctI}%`;
    $barraInimigo.classList.toggle('media', pctI <= 50 && pctI > 25);
    $barraInimigo.classList.toggle('baixa', pctI <= 25);
    $modInimigo.textContent = formatarMods(i.modificadores);

    renderizarMovimentos();
}

function formatarMods(mods) {
    const partes = [];
    if (mods.ataque !== 1.0) partes.push(`Att ${(mods.ataque * 100).toFixed(0)}%`);
    if (mods.defesa !== 1.0) partes.push(`Def ${(mods.defesa * 100).toFixed(0)}%`);
    return partes.join(' | ');
}

function renderizarMovimentos() {
    const j = ativoJogador();
    $movimentosGrid.innerHTML = '';
    j.movimentos.forEach((mov, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('btn-movimento');

        const nomeEl = document.createElement('span');
        nomeEl.textContent = mov.nome;
        btn.appendChild(nomeEl);

        const tipoEl = document.createElement('span');
        tipoEl.classList.add('mov-tipo');
        tipoEl.textContent = mov.tipo;
        btn.appendChild(tipoEl);

        const powerEl = document.createElement('span');
        powerEl.classList.add('mov-power');
        powerEl.textContent = mov.efeito === 'dano' ? `Power ${mov.power}` : 'Buff +20% def';
        btn.appendChild(powerEl);

        btn.addEventListener('click', () => acaoJogador(idx));
        $movimentosGrid.appendChild(btn);
    });
}

function definirMensagem(texto) {
    $caixaMsg.textContent = texto;
}

function definirBotoesAcao(habilitado) {
    document.querySelectorAll('.btn-movimento').forEach(b => b.disabled = !habilitado);
    $btnTrocar.disabled = !habilitado;
}

// === Logica de turnos ===
function executarMovimento(atacante, defensor, mov, painelDefensorEl, callbackDepois) {
    if (mov.efeito === 'buff-defesa') {
        aplicarEfeito(atacante, 'defesa', 0.20);
        definirMensagem(`${atacante.nome} aumentou a propria defesa!`);
    } else if (mov.efeito === 'buff-ataque') {
        aplicarEfeito(atacante, 'ataque', 0.20);
        definirMensagem(`${atacante.nome} aumentou o proprio ataque!`);
    } else if (mov.efeito === 'debuff-defesa') {
        aplicarEfeito(defensor, 'defesa', -0.15);
        definirMensagem(`${atacante.nome} enfraqueceu a defesa de ${defensor.nome}!`);
    } else {
        const dano = calcularDano(atacante, defensor, mov);
        defensor.hpAtual = Math.max(0, defensor.hpAtual - dano);
        const mult = obterMultiplicadorTipo(mov.tipo, defensor.tipoPrimario);
        let efeitoTxt = '';
        if (mult >= 2) efeitoTxt = ' Foi super efetivo!';
        else if (mult > 0 && mult < 1) efeitoTxt = ' Pouco efetivo...';
        else if (mult === 0) efeitoTxt = ' Nao teve efeito!';
        definirMensagem(`${atacante.nome} usou ${mov.nome}! Causou ${dano} de dano.${efeitoTxt}`);
        // Animacao de tremor
        painelDefensorEl.classList.add('tomou-dano');
        setTimeout(() => painelDefensorEl.classList.remove('tomou-dano'), 400);
    }

    atualizarUI();

    setTimeout(() => callbackDepois(), 1000);
}

function acaoJogador(movIdx) {
    if (!estado.batalhaEmAndamento || !estado.turnoDoJogador) return;
    definirBotoesAcao(false);

    const j = ativoJogador();
    const mov = j.movimentos[movIdx];
    const inimigo = estado.maquina.pokemon;

    executarMovimento(j, inimigo, mov, $painelInimigo, () => {
        if (verificarFimDeBatalha()) return;
        estado.turnoDoJogador = false;
        executarTurnoMaquina();
    });
}

function executarTurnoMaquina() {
    const inimigo = estado.maquina.pokemon;
    const j = ativoJogador();

    definirMensagem(`${inimigo.nome} esta pensando...`);

    setTimeout(() => {
        const mov = escolherAcaoMaquina(inimigo, j, dificuldade === 'maluco');
        executarMovimento(inimigo, j, mov, $painelJogador, () => {
            if (verificarFimDeBatalha()) return;
            estado.turnoDoJogador = true;
            estado.turnos++;
            definirBotoesAcao(true);
        });
    }, 1500);
}

function verificarFimDeBatalha() {
    const inimigo = estado.maquina.pokemon;
    if (inimigo.hpAtual <= 0) {
        finalizarVitoria();
        return true;
    }
    const j = ativoJogador();
    if (j.hpAtual <= 0) {
        return tratarPokemonDesmaiado();
    }
    return false;
}

function tratarPokemonDesmaiado() {
    definirMensagem(`${ativoJogador().nome} desmaiou!`);
    const vivos = estado.jogador.equipe.filter(p => p.hpAtual > 0);
    if (vivos.length === 0) {
        finalizarDerrota();
        return true;
    }
    // Forca troca obrigatoria
    abrirTroca(true);
    return true;
}

function finalizarVitoria() {
    estado.batalhaEmAndamento = false;
    definirBotoesAcao(false);
    $estatisticaVitoria.textContent = `Turnos: ${estado.turnos + 1}`;
    setTimeout(() => $overlayVitoria.classList.add('ativo'), 600);
}

function finalizarDerrota() {
    estado.batalhaEmAndamento = false;
    definirBotoesAcao(false);
    setTimeout(() => $overlayDerrota.classList.add('ativo'), 600);
}

// === Trocar pokemon ===
function abrirTroca(obrigatorio = false) {
    $trocaGrid.innerHTML = '';
    $msgTroca.textContent = obrigatorio
        ? 'Seu Pokemon desmaiou! Escolha outro:'
        : 'Trocar gasta seu turno. Escolha:';
    $btnFecharTroca.style.display = obrigatorio ? 'none' : 'inline-block';

    estado.jogador.equipe.forEach((p, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.classList.add('troca-card');
        if (idx === estado.jogador.ativoIdx) card.classList.add('ativo');
        if (p.hpAtual <= 0) card.classList.add('desmaiado');

        const img = document.createElement('img');
        img.src = p.sprite;
        img.alt = p.nome;
        card.appendChild(img);

        const nome = document.createElement('span');
        nome.classList.add('troca-nome');
        nome.textContent = p.nome;
        card.appendChild(nome);

        const hp = document.createElement('span');
        hp.classList.add('troca-hp');
        hp.textContent = `${p.hpAtual} / ${p.hpMax}`;
        card.appendChild(hp);

        if (idx !== estado.jogador.ativoIdx && p.hpAtual > 0) {
            card.addEventListener('click', () => confirmarTroca(idx, obrigatorio));
        }

        $trocaGrid.appendChild(card);
    });

    $overlayTroca.classList.add('ativo');
}

function confirmarTroca(novoIdx, obrigatorio) {
    const anterior = ativoJogador();
    estado.jogador.ativoIdx = novoIdx;
    const novo = ativoJogador();
    $overlayTroca.classList.remove('ativo');

    definirMensagem(`Volta ${anterior.nome}! Vai, ${novo.nome}!`);
    atualizarUI();

    if (obrigatorio) {
        // Troca por desmaio nao gasta turno (continua quem ia jogar)
        // Aqui vamos seguir: se foi turno do jogador antes, ele recomeca
        if (estado.batalhaEmAndamento) {
            setTimeout(() => {
                if (estado.turnoDoJogador) {
                    definirBotoesAcao(true);
                } else {
                    executarTurnoMaquina();
                }
            }, 1000);
        }
    } else {
        // Troca voluntaria gasta turno
        definirBotoesAcao(false);
        setTimeout(() => {
            estado.turnoDoJogador = false;
            executarTurnoMaquina();
        }, 1000);
    }
}

$btnTrocar.addEventListener('click', () => {
    if (!estado.batalhaEmAndamento || !estado.turnoDoJogador) return;
    abrirTroca(false);
});

$btnFecharTroca.addEventListener('click', () => {
    $overlayTroca.classList.remove('ativo');
});

$btnFugir.addEventListener('click', async () => {
    if (await mostrarConfirmacao('Fugir da batalha?', 'Fugir')) {
        window.location.href = '../../chooseGame/aventura.html';
    }
});

$btnVoltarAventura.addEventListener('click', () => {
    window.location.href = '../../chooseGame/aventura.html';
});

$btnVoltarAventuraDerrota.addEventListener('click', () => {
    window.location.href = '../../chooseGame/aventura.html';
});

$btnNovaBatalha.addEventListener('click', () => {
    window.location.href = `../selecao/selecao.html?dif=${dificuldade}`;
});

$btnTentarNovamente.addEventListener('click', () => {
    window.location.href = `../selecao/selecao.html?dif=${dificuldade}`;
});

// === Inicializacao ===
async function iniciar() {
    try {
        const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
        if (equipeIds.length === 0) {
            await mostrarAlerta('Sem equipe pra batalhar.', 'Aviso');
            window.location.href = '../../chooseGame/aventura.html';
            return;
        }

        // Carrega 6 pokemons da equipe + 1 inimigo aleatorio em paralelo
        // No modo maluco, inimigo eh sempre um lendario
        const LENDARIOS = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386];
        const idInimigo = dificuldade === 'maluco'
            ? LENDARIOS[Math.floor(Math.random() * LENDARIOS.length)]
            : Math.floor(Math.random() * 386) + 1;
        const promises = [
            ...equipeIds.map(id => buscarPokemonCompleto(id)),
            buscarPokemonCompleto(idInimigo)
        ];
        const resultados = await Promise.all(promises);
        const equipeBase = resultados.slice(0, equipeIds.length);
        const inimigoBase = resultados[resultados.length - 1];

        estado.jogador.equipe = equipeBase.map(instanciarParaBatalha);
        estado.maquina.pokemon = ajustarPorDificuldade(instanciarParaBatalha(inimigoBase), dificuldade);

        // Define ativo inicial
        const idxEscolhido = estado.jogador.equipe.findIndex(p => p.id === ativoIdInicial);
        estado.jogador.ativoIdx = idxEscolhido >= 0 ? idxEscolhido : 0;

        // Decide quem comeca por Speed
        estado.turnoDoJogador = ativoJogador().stats.speed >= estado.maquina.pokemon.stats.speed;

        // Mostra arena
        $loading.style.display = 'none';
        $arena.style.display = 'flex';

        atualizarUI();
        definirMensagem(`Um ${estado.maquina.pokemon.nome} selvagem apareceu!`);

        if (estado.turnoDoJogador) {
            definirBotoesAcao(true);
        } else {
            definirBotoesAcao(false);
            setTimeout(executarTurnoMaquina, 1500);
        }
    } catch (e) {
        $loading.innerHTML = `<p>Erro ao carregar batalha: ${e.message}</p><p><a href="../../chooseGame/aventura.html">Voltar</a></p>`;
    }
}

iniciar();
