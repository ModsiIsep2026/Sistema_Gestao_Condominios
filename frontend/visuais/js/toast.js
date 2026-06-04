
(function () {
    const MAX_TOASTS = 4;
    const DURACAO    = 3500;

    let container = null;
    const fila    = [];

    function obterContainer() {
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONES = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };

    function mostrar(tipo, mensagem) {
        const cont = obterContainer();

   
        if (fila.length >= MAX_TOASTS) {
            remover(fila[0]);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast--${tipo}`;
        toast.innerHTML = `
            <span class="toast__icone">${ICONES[tipo]}</span>
            <span class="toast__msg">${mensagem}</span>
        `;

        cont.appendChild(toast);
        fila.push(toast);

        // Força reflow para activar animação
        void toast.offsetWidth;
        toast.classList.add("toast--visivel");

        const timer = setTimeout(() => remover(toast), DURACAO);
        toast._timer = timer;
    }

    function remover(toast) {
        if (!toast || !toast.parentNode) return;
        clearTimeout(toast._timer);
        toast.classList.remove("toast--visivel");
        toast.classList.add("toast--saindo");

        const idx = fila.indexOf(toast);
        if (idx !== -1) fila.splice(idx, 1);

        toast.addEventListener("animationend", () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, { once: true });

      
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 500);
    }

    window.toast = {
        success: (msg) => mostrar("success", msg),
        error:   (msg) => mostrar("error",   msg),
        info:    (msg) => mostrar("info",     msg),
    };
})();


/**
 * 
 * @param {HTMLElement} element
 * @param {number} targetValue
 * @param {number} duration  (ms, default 600)
 */
function countUp(element, targetValue, duration) {
    if (!element) return;
    const target = parseInt(targetValue, 10);
    if (isNaN(target)) return;
    duration = duration || 600;

    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current  = Math.round(startVal + (target - startVal) * progress);
        element.textContent = current;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

window.countUp = countUp;


window.confirmar = function (mensagem, opcoes) {
    return new Promise((resolve) => {
        const existing = document.getElementById("_confirmar-overlay");
        if (existing) existing.remove();

        const opt = Object.assign({ confirmar: "Confirmar", cancelar: "Cancelar", perigo: true }, opcoes || {});

        const overlay = document.createElement("div");
        overlay.id        = "_confirmar-overlay";
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal" style="max-width:420px;">
                <div class="modal__cabecalho">
                    <h3>Confirmação</h3>
                    <button type="button" class="modal__fechar" id="_conf-x">&times;</button>
                </div>
                <div class="modal__corpo">
                    <p style="font-size:14px;line-height:1.65;">${mensagem}</p>
                </div>
                <div class="modal__rodape">
                    <button type="button" class="btn btn--outline" id="_conf-nao">${opt.cancelar}</button>
                    <button type="button" class="btn ${opt.perigo ? "btn--perigo" : "btn--primario"}" id="_conf-sim">${opt.confirmar}</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const fechar = (res) => { overlay.remove(); resolve(res); };
        document.getElementById("_conf-sim").addEventListener("click", () => fechar(true));
        document.getElementById("_conf-nao").addEventListener("click", () => fechar(false));
        document.getElementById("_conf-x").addEventListener("click",   () => fechar(false));
        overlay.addEventListener("click", (e) => { if (e.target === overlay) fechar(false); });
    });
};
