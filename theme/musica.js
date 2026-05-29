// Player de musica global - injeta botao + iframe do Spotify em qualquer pagina

(function () {
    // Evita duplicar se ja foi carregado
    if (document.getElementById('player-musica-global')) return;

    function injetar() {
        // Botao
        const btn = document.createElement('button');
        btn.id = 'btn-musica';
        btn.className = 'btn-musica';
        btn.type = 'button';
        btn.textContent = 'Trilha Sonora';

        // Container do iframe
        const container = document.createElement('div');
        container.id = 'player-container';
        container.className = 'player-container';

        const iframe = document.createElement('iframe');
        iframe.setAttribute('data-testid', 'embed-iframe');
        iframe.style.borderRadius = '12px';
        iframe.src = 'https://open.spotify.com/embed/playlist/0PsgzwM6v2bPV1oQyLpAHU?utm_source=generator&theme=0';
        iframe.width = '100%';
        iframe.height = '152';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';
        container.appendChild(iframe);

        // Marcador anti-duplicacao
        const marcador = document.createElement('span');
        marcador.id = 'player-musica-global';
        marcador.style.display = 'none';

        document.body.appendChild(marcador);
        document.body.appendChild(container);
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            container.classList.toggle('ativo');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injetar);
    } else {
        injetar();
    }
})();
