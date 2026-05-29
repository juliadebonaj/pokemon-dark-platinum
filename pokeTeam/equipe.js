// Guarda: redireciona pro registro se nao tiver treinador
if (!window.exigirTreinador || !exigirTreinador()) throw new Error('sem treinador');

const TAMANHO_EQUIPE = 6;

const spriteImg = document.getElementById('sprite-treinador');
const nomeEl = document.getElementById('nome-treinador');
const idadeEl = document.getElementById('idade-treinador');
const slotsContainer = document.getElementById('slots-equipe');
const btnEscolher = document.getElementById('btn-escolher');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnResetar = document.getElementById('btn-resetar');
const btnLogout = document.getElementById('btn-logout');

// Carrega dados do treinador do localStorage
function carregarTreinador() {
    const dados = localStorage.getItem('treinador');
    if (!dados) {
        // Se ninguém se registrou, volta para o registro
        window.location.href = '../register/registrar.html';
        return;
    }

    const treinador = JSON.parse(dados);
    spriteImg.src = treinador.avatar === 'menina' ? '../photos/girl.png' : '../photos/boy.png';
    spriteImg.alt = `Sprite ${treinador.avatar}`;
    nomeEl.textContent = treinador.nome;
    idadeEl.textContent = `Idade: ${treinador.idade}`;
}

// Remove um pokemon específico da equipe
function removerSlot(pokemonId) {
    const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
    const novaEquipe = equipeIds.filter(id => id !== pokemonId);
    localStorage.setItem('equipe', JSON.stringify(novaEquipe));
    renderizarSlots();
}

// "Trocar" leva para a main com o slot a ser trocado guardado
function trocarSlot(pokemonId) {
    localStorage.setItem('slotTrocar', String(pokemonId));
    window.location.href = '../index/index.html';
}

// Renderiza os 6 slots, preenchidos com a equipe escolhida (se houver)
function renderizarSlots() {
    const equipeIds = JSON.parse(localStorage.getItem('equipe') || '[]');
    const pokedex = JSON.parse(localStorage.getItem('pokemons_g1_g3') || '[]');
    const equipe = equipeIds
        .map(id => pokedex.find(p => p.id === id))
        .filter(Boolean);

    const temEquipe = equipe.length > 0;

    // Atualiza o título conforme a equipe esteja preenchida ou não
    const status = document.querySelector('.status-equipe');
    if (status) {
        status.textContent = temEquipe
            ? `Equipe: ${equipe.length} / ${TAMANHO_EQUIPE}`
            : 'Nenhum Pokemon capturado';
    }

    // Alterna botões: sem equipe -> "Escolher". Com equipe -> "Confirmar"
    btnEscolher.hidden = temEquipe;
    btnEscolher.disabled = temEquipe;
    btnConfirmar.hidden = !temEquipe;
    btnResetar.disabled = !temEquipe;

    slotsContainer.innerHTML = '';
    for (let i = 0; i < TAMANHO_EQUIPE; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot-equipe');

        const numero = document.createElement('span');
        numero.classList.add('slot-numero');
        numero.textContent = `Slot ${i + 1}`;
        slot.appendChild(numero);

        const pokemon = equipe[i];
        if (pokemon) {
            slot.classList.add('preenchido', `type-${pokemon.tipo}`);

            // Container dos botões trocar/remover
            const acoes = document.createElement('div');
            acoes.classList.add('slot-acoes');

            const btnTrocar = document.createElement('button');
            btnTrocar.type = 'button';
            btnTrocar.classList.add('slot-btn', 'slot-btn-trocar');
            btnTrocar.title = 'Trocar';
            btnTrocar.textContent = '✎';
            btnTrocar.addEventListener('click', () => trocarSlot(pokemon.id));

            const btnRemover = document.createElement('button');
            btnRemover.type = 'button';
            btnRemover.classList.add('slot-btn', 'slot-btn-remover');
            btnRemover.title = 'Remover';
            btnRemover.textContent = '✕';
            btnRemover.addEventListener('click', () => removerSlot(pokemon.id));

            acoes.appendChild(btnTrocar);
            acoes.appendChild(btnRemover);
            slot.appendChild(acoes);

            const img = document.createElement('img');
            img.classList.add('slot-img');
            img.src = pokemon.sprite;
            img.alt = pokemon.nome;
            slot.appendChild(img);

            const nome = document.createElement('span');
            nome.classList.add('slot-nome');
            nome.textContent = pokemon.nome;
            slot.appendChild(nome);
        } else {
            const btnAdd = document.createElement('button');
            btnAdd.type = 'button';
            btnAdd.classList.add('slot-btn-add');
            btnAdd.title = 'Adicionar Pokémon';
            btnAdd.textContent = '+';
            btnAdd.addEventListener('click', () => {
                window.location.href = '../index/index.html';
            });
            slot.appendChild(btnAdd);

            const nome = document.createElement('span');
            nome.classList.add('slot-nome', 'slot-nome-vazio');
            nome.textContent = 'vazio';
            slot.appendChild(nome);
        }

        slotsContainer.appendChild(slot);
    }
}

btnEscolher.addEventListener('click', () => {
    window.location.href = '../index/index.html';
});

btnConfirmar.addEventListener('click', () => {
    localStorage.setItem('equipeConfirmada', 'true');
    window.location.href = '../chooseGame/aventura.html';
});

btnResetar.addEventListener('click', async () => {
    if (await mostrarConfirmacao('Resetar toda a equipe?', 'Resetar')) {
        localStorage.removeItem('equipe');
        renderizarSlots();
    }
});

btnLogout.addEventListener('click', async () => {
    if (await mostrarConfirmacao('Sair e apagar treinador + equipe?', 'Sair')) {
        localStorage.removeItem('treinador');
        localStorage.removeItem('equipe');
        window.location.href = '../register/registrar.html';
    }
});

carregarTreinador();
renderizarSlots();
