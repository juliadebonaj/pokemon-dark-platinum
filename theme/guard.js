// Guardas de navegacao - redireciona pra registrar/equipe se faltar dados

(function () {
    if (window.__guardCarregado) return;
    window.__guardCarregado = true;

    // Calcula caminho relativo pra register/registrar.html baseado na profundidade da pagina atual
    function caminhoRegister() {
        const path = window.location.pathname;
        const partes = path.split('/').filter(Boolean);
        // Remove o nome do arquivo (ultimo)
        partes.pop();
        // Procura o indice da pasta do projeto pra contar quantos niveis subir
        // Assumindo estrutura: .../PokemonDarkPlatinum/<pasta>/<arquivo.html> ou .../PokemonDarkPlatinum/<pasta>/<sub>/<arquivo.html>
        // Se a ultima pasta for "register" estamos na propria pagina - nao precisa redirecionar
        if (partes[partes.length - 1] === 'register') return null;

        // Conta niveis ate a raiz do projeto: 1 se direto em <pasta>/, 2 se em <pasta>/<sub>/
        // Heuristica: se a pasta atual eh begginer/pro/crazy/selecao/arena, sao 2 niveis
        const pastasNivel2 = ['begginer', 'pro', 'crazy', 'selecao', 'arena'];
        const niveis = pastasNivel2.includes(partes[partes.length - 1]) ? 2 : 1;
        return '../'.repeat(niveis) + 'register/registrar.html';
    }

    function caminhoEquipe() {
        const path = window.location.pathname;
        const partes = path.split('/').filter(Boolean);
        partes.pop();
        if (partes[partes.length - 1] === 'pokeTeam') return null;
        const pastasNivel2 = ['begginer', 'pro', 'crazy', 'selecao', 'arena'];
        const niveis = pastasNivel2.includes(partes[partes.length - 1]) ? 2 : 1;
        return '../'.repeat(niveis) + 'pokeTeam/equipe.html';
    }

    // Retorna true se pode continuar; false se redirecionou
    window.exigirTreinador = function () {
        const dados = localStorage.getItem('treinador');
        if (!dados) {
            const url = caminhoRegister();
            if (url) window.location.href = url;
            return false;
        }
        return true;
    };

    // Retorna true se tem treinador E equipe nao vazia
    window.exigirEquipe = function () {
        if (!window.exigirTreinador()) return false;
        const equipe = JSON.parse(localStorage.getItem('equipe') || '[]');
        if (equipe.length === 0) {
            const url = caminhoEquipe();
            if (url) window.location.href = url;
            return false;
        }
        return true;
    };
})();
