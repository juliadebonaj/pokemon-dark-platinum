// Funcoes puras de calculo de batalha (sem manipular DOM)
// Depende de obterMultiplicadorTipo() vindo de tabelaTipos.js

// Formula: Dano = (Att*ModAtt / Def*ModDef) * 10 * MultiplicadorTipo
function calcularDano(atacante, defensor, movimento) {
    const attEfetivo = atacante.stats.attack * (atacante.modificadores?.ataque ?? 1.0);
    const defEfetivo = defensor.stats.defense * (defensor.modificadores?.defesa ?? 1.0);
    const multTipo = obterMultiplicadorTipo(movimento.tipo, defensor.tipoPrimario);
    const power = movimento.power || 50;
    const base = (attEfetivo / Math.max(1, defEfetivo)) * (power / 5) * multTipo;
    return Math.max(1, Math.floor(base));
}

// Aplica buff/debuff em um pokemon (limita pra nao explodir)
function aplicarEfeito(alvo, stat, delta) {
    const atual = alvo.modificadores[stat] ?? 1.0;
    const novo = Math.max(0.3, Math.min(3.0, atual + delta));
    alvo.modificadores[stat] = novo;
}

// IA - 3 niveis de prioridade
function escolherAcaoMaquina(maquina, jogadorAtivo, modoAgressivo = false) {
    const ataques = maquina.movimentos.filter(m => m.power > 0);
    const buffs = maquina.movimentos.filter(m => m.efeito === 'buff-defesa' || m.efeito === 'buff-ataque');

    // P1: Pode finalizar?
    for (const mov of ataques) {
        const dano = calcularDano(maquina, jogadorAtivo, mov);
        if (dano >= jogadorAtivo.hpAtual) {
            return mov;
        }
    }

    // P2: Vida baixa? Tenta buff de defesa
    const vidaPct = maquina.hpAtual / maquina.hpMax;
    if (vidaPct < 0.3 && buffs.length > 0 && !modoAgressivo) {
        return buffs[0];
    }

    // P3: Ataque mais forte
    if (ataques.length === 0) {
        // Sem ataques (caso raro), usa qualquer movimento
        return maquina.movimentos[0];
    }

    return ataques.reduce((melhor, atual) => {
        const danoMelhor = calcularDano(maquina, jogadorAtivo, melhor);
        const danoAtual = calcularDano(maquina, jogadorAtivo, atual);
        return danoAtual > danoMelhor ? atual : melhor;
    });
}

// Aplica os stats da dificuldade no pokemon inimigo
function ajustarPorDificuldade(pokemon, dificuldade) {
    const fator = dificuldade === 'iniciante' ? 0.7
                : dificuldade === 'maluco' ? 1.3
                : 1.0;
    pokemon.stats.hp = Math.max(1, Math.floor(pokemon.stats.hp * fator));
    pokemon.stats.attack = Math.max(1, Math.floor(pokemon.stats.attack * fator));
    pokemon.stats.defense = Math.max(1, Math.floor(pokemon.stats.defense * fator));
    pokemon.stats.speed = Math.max(1, Math.floor(pokemon.stats.speed * fator));
    pokemon.hpMax = pokemon.stats.hp;
    pokemon.hpAtual = pokemon.hpMax;
    return pokemon;
}

// Cria uma instancia de batalha do pokemon (com hpAtual e modificadores zerados)
function instanciarParaBatalha(pokemonBase) {
    return {
        ...pokemonBase,
        hpMax: pokemonBase.stats.hp,
        hpAtual: pokemonBase.stats.hp,
        modificadores: { ataque: 1.0, defesa: 1.0 }
    };
}
