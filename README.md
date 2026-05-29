# Pokemon Dark Platinum

Um mini-universo Pokemon feito em **HTML, CSS e JavaScript puro** (sem frameworks). Inclui registro de treinador, montagem de equipe via PokeAPI, jogo da memória, batalhas por turnos e um modo extra com a turma **StartCodingBatch**.

---

## Screenshots

> _Espaço reservado para capturas de tela do projeto._

### Tela de Registro
![Registro Light](screenshots/light/registro.png)
![Registrado Light](screenshots/light/registrado.png)
![Registro Dark](screenshots/dark/registro.png)
![Registrado Dark](screenshots/dark/registrado.png)

### Tela de Equipe Vazia
![Equipe Vazia Light](screenshots/light/equipeVazia.png)
![Equipe Vazia Dark](screenshots/dark/equipeVazia.png)

### Pokedex / Seleção de Equipe
![Pokedex Light](screenshots/light/selecao.png)
![Pokedex Dark](screenshots/dark/selecao.png)
![Pokedex Confirmar Light](screenshots/light/equipeEscolhida.png)
![Pokedex Confirmar Dark](screenshots/dark/equipeEscolhida.png)

### Tela de Equipe Cheia ou Quase
![Equipe Cheia Light](screenshots/light/equipeCheia.png)
![Equipe Cheia Dark](screenshots/dark/equipeCheia.png)
![Equipe Cheia Light](screenshots/light/menosUmEquipe.png)
![Equipe Cheia Dark](screenshots/dark/menosUmEquipe.png)

### Escolha de Aventura
![Modos Aventura Light](screenshots/light/escolherGame.png)
![Modos Aventura Light](screenshots/dark/escolherGame.png)

### Jogo da Memória
![Modos Memória Light](screenshots/light/escolherModo.png)
![Modos Memória Dark](screenshots/dark/modosMemoria.png)
![Memória Maluco Light](screenshots/light/memoriaAcertosIntruso.png)
![Memória Maluco Dark](screenshots/dark/memoriaAcertosIntruso.png)
![Memória Maluco Intruso Light](screenshots/light/memoriaMalucoIntruso.png)
![Memória Maluco Intruso Dark](screenshots/dark/memoriaIntruso.png)
![Memória Maluco Vitória Light](screenshots/light/memoriaVitoria.png)
![Memória Maluco Vitória Dark](screenshots/dark/vitoriaMemoria.png)

### Batalha
![Modos Batalha Light](screenshots/light/batalhaModos.png)
![Modos Batalha Dark](screenshots/dark/modosBatalha.png)
![Batalha Seleção Light](screenshots/light/escolhendoPokeBatalha.png)
![Batalha Seleção Dark](screenshots/dark/escolherPokeBatalha.png)
![Batalha Light](screenshots/light/telaBatalha.png)
![Batalha Dark](screenshots/dark/batalha.png)
![Batalha Troca Light](screenshots/light/mudarPokeBatalha.png)
![Batalha Troca Dark](screenshots/dark/trocarPokeBatalha.png)
![Batalha Fuga Light](screenshots/light/fugaBatalha.png)
![Batalha Fuga Dark](screenshots/dark/fugirBatalha.png)

### Modo Extra
![Modos Extra Light](screenshots/light/extraModos.png)
![Modos Extra Dark](screenshots/dark/modosExtra.png)
![Extra Maluco Light](screenshots/light/extraAcertosIntrusa.png)
![Extra Maluco Dark](screenshots/dark/extraAcertosIntrusa.png)
![Extra Maluco Intrusa Light](screenshots/light/extraMalucoIntrusa.png)
![Extra Maluco Intrusa Dark](screenshots/dark/extraIntrusa.png)
![Extra Maluco Vitória Light](screenshots/light/vitoriaExtra.png)
![Extra Maluco Vitória Dark](screenshots/dark/extraVitoria.png)

### Trilha Sonora
![Trilha Sonora](screenshots/light/trilhaSonora.png)
![Trilha Sonora](screenshots/dark/trilhaSonora.png)

---

## Como rodar

Abra `register/registrar.html` (ou qualquer arquivo html que achar, temos camada de segurança).

Fluxo recomendado: `register/` → `index/` → `pokeTeam/` → `chooseGame/` → modo escolhido.

---

## Estrutura do projeto

```
PokemonDarkPlatinum/
├── register/        Cadastro do treinador
├── index/           Pokedex e seleção de equipe (até 6 Pokemons)
├── pokeTeam/        Visualização da equipe montada
├── chooseGame/      Hub de escolha do modo de jogo
├── memoryGame/      Jogo da memória (3 dificuldades)
├── battleGame/      Batalha por turnos contra a CPU (3 dificuldades)
├── extraGame/       Modo extra com colegas da turma (3 dificuldades)
├── theme/           Tema claro/escuro, música, overlays e proteção de navegação
├── photos/          Sprites e imagens (treinador, fundo, colegas)
└── font/            Fontes pixeladas e estilo Pokemon
```

---

## Pastas e arquivos

### `register/` — Cadastro do treinador
- **`registrar.html`** — Formulário: nome, idade e seletor de avatar (menino / menina / Valdo / Valda).
- **`registrar.js`** — Valida o formulário, salva o treinador em `localStorage` e habilita o botão "Começar Jornada".
- **`registrar.css`** — Estilos do formulário e dos cards de avatar.

### `index/` — Pokedex e seleção de equipe
- **`index.html`** — Tela principal: cabeçalho com nome do treinador, contador `Equipe: X / 6`, busca por nome, filtro por tipo e overlay "Equipe Completa".
- **`index.js`** — Lógica da Pokedex: consome a [PokeAPI](https://pokeapi.co/), renderiza cards, controla seleção (máx. 6), busca, filtro e persiste a equipe em `localStorage`.
- **`index.css`** — Estilos da grade de cards e da barra de filtros.

### `pokeTeam/` — Equipe montada
- **`equipe.html`** — Tela que mostra os 6 (ou menos) Pokemons selecionados.
- **`equipe.js`** — Lê a equipe do `localStorage` e renderiza os cards detalhados.
- **`equipe.css`** — Layout em grid da equipe.

### `chooseGame/` — Hub de modos
- **`aventura.html`** — Cards "Jogo da Memória", "Batalha" e "Modo Extra" + overlays internos para escolha de dificuldade (Iniciante, Difícil, Maluco).
- **`aventura.js`** — Roteamento entre os modos e abertura/fechamento dos overlays.
- **`aventura.css`** — Estilos dos cards de modo.

### `memoryGame/` — Jogo da memória
Três dificuldades, cada uma em sua pasta com HTML+JS próprios e CSS compartilhado:
- **`begginer/memoriaIniciante.{html,js}`** — Pares (sprite + nome) com a equipe do jogador.
- **`pro/memoriaDificil.{html,js}`** — Trincas em vez de pares.
- **`crazy/memoriaMaluco.{html,js}`** — Encontre o intruso entre os Pokemons.
- **`memoria.css`** — Estilos do tabuleiro, cartas e animação de virar.

### `battleGame/` — Batalha por turnos
- **`battleEngine.js`** — Funções puras de cálculo: dano com base em `Att/Def`, multiplicador de tipo, buffs/debuffs e IA da CPU em 3 prioridades (finalizar → buff → ataque mais forte).
- **`tabelaTipos.js`** — Tabela de efetividade entre tipos (Fogo > Grama, etc.).
- **`selecao/selecao.{html,js}`** — Tela onde o jogador escolhe um Pokemon ativo da equipe.
- **`arena/arena.{html,js}`** — Arena de batalha: HP bars, animações, log de turno e fim de jogo.
- **`battle.css`** — Estilos da arena, barras e botões de movimento.

### `extraGame/` — Modo extra (turma StartCodingBatch)
Mesma mecânica do jogo da memória, mas com **fotos dos colegas** no lugar de Pokemons:
- **`colegas.js`** — Lista dos colegas e a "intrusa" Jucieli (coordenadora) — só aparece no modo Maluco.
- **`begginer/extraIniciante.{html,js}`** — Pares de colegas.
- **`pro/extraDificil.{html,js}`** — Trincas de colegas.
- **`crazy/extraMaluco.{html,js}`** — Quem é a intrusa?
- **`extra.css`** — Estilo específico do modo extra.

### `theme/` — Camada compartilhada
- **`tema.{js,css}`** — Toggle de modo escuro/claro (persiste em `localStorage`).
- **`musica.{js,css}`** — Player de música de fundo com botão flutuante.
- **`overlays.{js,css}`** — Sistema de overlays/modais reutilizáveis.
- **`guard.js`** — Guarda de navegação: se faltar treinador ou equipe, redireciona para `register/` ou `index/` automaticamente, calculando o caminho relativo conforme a profundidade da página.

### `photos/`
- **`boy.png`, `girl.png`** — Sprites dos avatares de treinador.
- **`bg.jpg`** — Imagem de fundo.
- **`StartCodingBatch/`** — Fotos dos colegas da turma usadas no Modo Extra.

### `font/`
Fontes utilizadas no projeto:
- **`PokemonSolid.ttf`**, **`PokemonHollow.ttf`** — Estilo logo Pokemon.
- **`PixelGameFont.ttf`** — Fonte pixelada para textos.

---

## Tecnologias

- HTML5, CSS3, JavaScript (ES6+) — sem frameworks
- [PokeAPI](https://pokeapi.co/) para dados e sprites dos Pokemons
- `localStorage` para persistir treinador e equipe entre páginas

---

## Créditos

Projeto desenvolvido durante a turma **StartCodingBatch2026**. Sprites e dados de Pokemons fornecidos pela PokeAPI; fotos da turma usadas com permissão dos colegas.
