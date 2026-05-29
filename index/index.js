const pokedexContainer = document.getElementById('pokedex-container');
const contadorSelecao = document.getElementById('contador-selecao');
const filtroSelect = document.getElementById('filtro-tipo');
const buscaInput = document.getElementById('busca-nome');
const btnResetar = document.getElementById('btn-resetar');
const btnVerEquipe = document.getElementById('btn-ver-equipe');
const overlayFinal = document.getElementById('overlay-final');
const btnComecarAventura = document.getElementById('btn-comecar-aventura');
const spriteTreinador = document.getElementById('sprite-treinador');
const nomeTreinador = document.getElementById('nome-treinador');
const btnLogout = document.getElementById('btn-logout');

// Sem treinador? Volta pro registro
if (!exigirTreinador()) {
    throw new Error('Sem treinador - redirecionando');
}

// Carrega dados do treinador do localStorage
function carregarTreinador() {
    const dados = localStorage.getItem('treinador');
    if (!dados) return;
    const treinador = JSON.parse(dados);
    spriteTreinador.src = treinador.avatar === 'menina' ? '../photos/girl.png' : '../photos/boy.png';
    spriteTreinador.alt = `Sprite ${treinador.avatar}`;
    nomeTreinador.textContent = treinador.nome;
}

// Restaura seleção previamente salva (caso o usuário tenha clicado em "Mudar Equipe")
function restaurarEquipeSalva() {
    const equipe = JSON.parse(localStorage.getItem('equipe') || '[]');
    // Se veio de "Trocar slot", remove o pokemon a ser trocado da seleção
    const slotTrocar = localStorage.getItem('slotTrocar');
    const idTrocar = slotTrocar !== null ? Number(slotTrocar) : null;
    localStorage.removeItem('slotTrocar');

    equipe.forEach(id => {
        if (id !== idTrocar) pokemonsSelecionados.add(id);
    });
}

const MAX_SELECAO = 6;
const pokemonsSelecionados = new Set();

const TIPOS_POKEMON = [
    'todos', 'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

let tipoFiltroAtivo = 'todos';
let buscaAtiva = '';

function atualizarContador() {
    contadorSelecao.textContent = `Equipe: ${pokemonsSelecionados.size} / ${MAX_SELECAO}`;
    btnResetar.disabled = pokemonsSelecionados.size === 0;
    btnVerEquipe.disabled = pokemonsSelecionados.size === 0;
    const completa = pokemonsSelecionados.size >= MAX_SELECAO;
    pokedexContainer.classList.toggle('equipe-completa', completa);
    overlayFinal.classList.toggle('ativo', completa);
}

function resetarSelecao() {
    pokemonsSelecionados.clear();
    document.querySelectorAll('.pokemon-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    atualizarContador();
}

function alternarSelecao(card, pokemonId) {
    if (pokemonsSelecionados.has(pokemonId)) {
        pokemonsSelecionados.delete(pokemonId);
        card.classList.remove('selected');
    } else {
        if (pokemonsSelecionados.size >= MAX_SELECAO) {
            return; // Limite atingido, ignora a seleção
        }
        pokemonsSelecionados.add(pokemonId);
        card.classList.add('selected');
    }
    atualizarContador();
}

// Aplica os filtros combinados (tipo + busca por nome)
function aplicarFiltros() {
    const todosCards = document.querySelectorAll('.pokemon-card');

    todosCards.forEach(card => {
        const nome = card.querySelector('.pokemon-name').textContent.toLowerCase();
        const passaTipo = tipoFiltroAtivo === 'todos' || card.classList.contains(`type-${tipoFiltroAtivo}`);
        const passaBusca = buscaAtiva === '' || nome.includes(buscaAtiva);

        if (passaTipo && passaBusca) {
            card.classList.remove('escondido');
        } else {
            card.classList.add('escondido');
        }
    });
}

function filtrarPorTipo(tipo) {
    tipoFiltroAtivo = tipo;
    aplicarFiltros();
}

function filtrarPorNome(termo) {
    buscaAtiva = termo.trim().toLowerCase();
    aplicarFiltros();
}

// Popula o dropdown de filtro com todos os tipos
function criarBotoesFiltro() {
    TIPOS_POKEMON.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo === 'todos' ? 'Todos os tipos' : tipo;
        filtroSelect.appendChild(option);
    });

    filtroSelect.addEventListener('change', (e) => filtrarPorTipo(e.target.value));
    buscaInput.addEventListener('input', (e) => filtrarPorNome(e.target.value));
}

// Função responsável por criar os elementos HTML de forma segura no DOM
function criarCardPokemon(pokemon) {
    // Cria a div do Card
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.classList.add(`type-${pokemon.tipo}`);

    // Cria a imagem
    const img = document.createElement('img');
    img.classList.add('pokemon-img');
    img.src = pokemon.sprite;
    img.alt = pokemon.nome;

    // Cria o nome
    const nome = document.createElement('h3');
    nome.classList.add('pokemon-name');
    nome.textContent = `#${pokemon.id} ${pokemon.nome}`;

    // Cria o tipo
    const tipo = document.createElement('span');
    tipo.classList.add('pokemon-type');
    tipo.textContent = pokemon.tipo;

    // Junta tudo dentro do card
    card.appendChild(img);
    card.appendChild(nome);
    card.appendChild(tipo);

    // Listener de clique para selecionar/deselecionar
    card.addEventListener('click', () => alternarSelecao(card, pokemon.id));

    // Restaura visualmente se este pokemon já estava na equipe salva
    if (pokemonsSelecionados.has(pokemon.id)) {
        card.classList.add('selected');
    }

    // Coloca o card pronto dentro da nossa flexbox na tela
    pokedexContainer.appendChild(card);
}

// Função para renderizar a lista inteira na tela
function renderizarPokedex(listaPokemon) {
    listaPokemon.forEach(pokemon => {
        criarCardPokemon(pokemon);
    });
}

// Função principal que gerencia o cache e as requisições
async function carregarPokemons() {
    // 1. Verifica se já existem os Pokémon salvos no localStorage
    const pokemonsSalvos = localStorage.getItem('pokemons_g1_g3');

    if (pokemonsSalvos) {
        // Se existir, transforma de volta em array e renderiza direto
        const listaPokemon = JSON.parse(pokemonsSalvos);
        renderizarPokedex(listaPokemon);
    } else {
        // Se não existir, faz a requisição em lote (386 Pokémon = Geração 1 a 3)
        try {
            // Buscando a lista inicial com os nomes e URLs detalhadas
            const resposta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=386');
            const dados = await resposta.json();
            
            // Mapeando as URLs para pegar os dados detalhados de cada um simultaneamente
            const promises = dados.results.map(async (poke) => {
                const resDetalhes = await fetch(poke.url);
                const dadosDetalhes = await resDetalhes.json();
                
                // Retorna apenas as informações básicas estruturadas que precisamos
                return {
                    id: dadosDetalhes.id,
                    nome: dadosDetalhes.name,
                    sprite: dadosDetalhes.sprites.front_default,
                    tipo: dadosDetalhes.types[0].type.name
                };
            });

            // Aguarda a resolução de todos os detalhes
            const listaTratada = await Promise.all(promises);

            // 2. Guarda a lista completa no localStorage para os próximos acessos
            localStorage.setItem('pokemons_g1_g3', JSON.stringify(listaTratada));

            // Renderiza na tela
            renderizarPokedex(listaTratada);

        } catch (erro) {
            console.error("Erro ao buscar dados da PokéAPI:", erro);
        }
    }
}

// Inicia o processo assim que a página carrega
carregarTreinador();
restaurarEquipeSalva();
criarBotoesFiltro();
btnResetar.addEventListener('click', resetarSelecao);
btnVerEquipe.addEventListener('click', () => {
    localStorage.setItem('equipe', JSON.stringify([...pokemonsSelecionados]));
    window.location.href = '../pokeTeam/equipe.html';
});
btnLogout.addEventListener('click', async () => {
    if (await mostrarConfirmacao('Sair e apagar treinador + equipe?', 'Sair')) {
        localStorage.removeItem('treinador');
        localStorage.removeItem('equipe');
        window.location.href = '../register/registrar.html';
    }
});
btnComecarAventura.addEventListener('click', () => {
    localStorage.setItem('equipe', JSON.stringify([...pokemonsSelecionados]));
    window.location.href = '../pokeTeam/equipe.html';
});
atualizarContador();
carregarPokemons();