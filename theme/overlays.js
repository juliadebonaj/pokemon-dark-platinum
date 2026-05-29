// Sistema de overlays bonitos para substituir alert() e confirm()
// Uso:
//   await mostrarAlerta('Mensagem aqui');
//   const ok = await mostrarConfirmacao('Tem certeza?');

(function () {
    if (window.__overlaysCarregados) return;
    window.__overlaysCarregados = true;

    function criarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay-dialog';

        const conteudo = document.createElement('div');
        conteudo.className = 'overlay-dialog-conteudo';
        overlay.appendChild(conteudo);

        document.body.appendChild(overlay);
        return { overlay, conteudo };
    }

    function fecharOverlay(overlay) {
        overlay.classList.remove('ativo');
        setTimeout(() => overlay.remove(), 300);
    }

    function mostrarAlerta(mensagem, titulo = 'Aviso') {
        return new Promise((resolve) => {
            const { overlay, conteudo } = criarOverlay();

            const h2 = document.createElement('h2');
            h2.textContent = titulo;
            conteudo.appendChild(h2);

            const p = document.createElement('p');
            p.textContent = mensagem;
            conteudo.appendChild(p);

            const botoes = document.createElement('div');
            botoes.className = 'overlay-dialog-botoes';

            const btnOk = document.createElement('button');
            btnOk.type = 'button';
            btnOk.className = 'overlay-dialog-btn';
            btnOk.textContent = 'OK';
            btnOk.addEventListener('click', () => {
                fecharOverlay(overlay);
                resolve();
            });

            botoes.appendChild(btnOk);
            conteudo.appendChild(botoes);

            requestAnimationFrame(() => overlay.classList.add('ativo'));
            setTimeout(() => btnOk.focus(), 100);
        });
    }

    function mostrarConfirmacao(mensagem, titulo = 'Confirmar') {
        return new Promise((resolve) => {
            const { overlay, conteudo } = criarOverlay();

            const h2 = document.createElement('h2');
            h2.textContent = titulo;
            conteudo.appendChild(h2);

            const p = document.createElement('p');
            p.textContent = mensagem;
            conteudo.appendChild(p);

            const botoes = document.createElement('div');
            botoes.className = 'overlay-dialog-botoes';

            const btnCancelar = document.createElement('button');
            btnCancelar.type = 'button';
            btnCancelar.className = 'overlay-dialog-btn overlay-dialog-btn-cancelar';
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => {
                fecharOverlay(overlay);
                resolve(false);
            });

            const btnOk = document.createElement('button');
            btnOk.type = 'button';
            btnOk.className = 'overlay-dialog-btn';
            btnOk.textContent = 'Confirmar';
            btnOk.addEventListener('click', () => {
                fecharOverlay(overlay);
                resolve(true);
            });

            botoes.appendChild(btnCancelar);
            botoes.appendChild(btnOk);
            conteudo.appendChild(botoes);

            // Clica no fundo cancela
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    fecharOverlay(overlay);
                    resolve(false);
                }
            });

            requestAnimationFrame(() => overlay.classList.add('ativo'));
            setTimeout(() => btnOk.focus(), 100);
        });
    }

    window.mostrarAlerta = mostrarAlerta;
    window.mostrarConfirmacao = mostrarConfirmacao;
})();
