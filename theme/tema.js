// Aplica o tema salvo no localStorage (chamar no <head> ou início da página)
(function aplicarTemaInicial() {
    const tema = localStorage.getItem('tema') || 'claro';
    if (tema === 'escuro') {
        document.documentElement.classList.add('tema-escuro');
    }
})();

function inicializarToggleTema() {
    const toggle = document.getElementById('toggle-tema');
    if (!toggle) return;

    const temaAtual = localStorage.getItem('tema') || 'claro';
    toggle.checked = temaAtual === 'escuro';

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.documentElement.classList.add('tema-escuro');
            localStorage.setItem('tema', 'escuro');
        } else {
            document.documentElement.classList.remove('tema-escuro');
            localStorage.setItem('tema', 'claro');
        }
    });
}

document.addEventListener('DOMContentLoaded', inicializarToggleTema);
