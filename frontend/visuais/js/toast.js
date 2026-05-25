/**
 * Sistema de Toasts — API global: window.toast.success(msg), .error(msg), .info(msg)
 */
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

        // Se já há MAX_TOASTS visíveis, remove o mais antigo
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

        // Fallback se animationend não disparar
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
 * Count-up — anima um elemento de 0 até targetValue em duration ms
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
