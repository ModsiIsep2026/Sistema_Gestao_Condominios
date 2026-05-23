
(function () {

    // ── Auth ──────────────────────────────────────────────────────────────────
    function obterToken() {
        return sessionStorage.getItem("condo_token");
    }

    function decodificarToken(token) {
        try {
            const payload = token.split(".")[1];
            return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        } catch {
            return null;
        }
    }

    const token   = obterToken();
    const payload = token ? decodificarToken(token) : null;

    if (!token || !payload) {
        window.location.replace("../website_C/login.html");
        return;
    }

    // tipo: "admin" | "gestor" | "tecnico"   (condómino vai para webapp_C)
    const tipo = payload.tipo;
    const TIPOS_PERMITIDOS = ["admin", "gestor", "tecnico"];

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
        sessionStorage.removeItem("condo_token");
        window.location.replace("../website_C/login.html");
        return;
    }

    const NOMES_TIPO = {
        admin:   "Administrador",
        gestor:  "Gestor",
        tecnico: "Técnico",
    };

    // ── Navegação por tipo ────────────────────────────────────────────────────
    function obterNavegacao() {
        if (tipo === "admin") {
            return [
                {
                    titulo: "Principal",
                    links: [
                        { url: "index.html",       icone: iconeDashboard(),  nome: "Dashboard" },
                        { url: "edificios.html",   icone: iconeEdificio(),   nome: "Edifícios" },
                        { url: "mapa.html",        icone: iconeMapa(),       nome: "Mapa de Edifícios" },
                    ],
                },
                {
                    titulo: "Recursos",
                    links: [
                        { url: "gestores.html",    icone: iconeGestor(),     nome: "Gestores" },
                        { url: "parceiros.html",   icone: iconeFornecedor(), nome: "Parceiros" },
                    ],
                },
                {
                    titulo: "Conta",
                    links: [
                        { url: "perfil.html",      icone: iconeUtilizador(), nome: "A minha conta" },
                    ],
                },
            ];
        }

        if (tipo === "gestor") {
            return [
                {
                    titulo: "Principal",
                    links: [
                        { url: "index.html",       icone: iconeDashboard(),  nome: "Dashboard" },
                        { url: "edificios.html",   icone: iconeEdificio(),   nome: "Edifícios" },
                        { url: "mapa.html",        icone: iconeMapa(),       nome: "Mapa" },
                    ],
                },
                {
                    titulo: "Operação",
                    links: [
                        { url: "reservas.html",    icone: iconeCalendario(), nome: "Reservas de Espaço" },
                        { url: "avarias.html",     icone: iconeAlerta(),     nome: "Avarias" },
                    ],
                },
                {
                    titulo: "Financeiro",
                    links: [
                        { url: "quotas.html",      icone: iconeMoeda(),      nome: "Pagamentos" },
                        { url: "relatorios.html",  icone: iconeRecibo(),     nome: "Relatórios" },
                    ],
                },
                {
                    titulo: "Pessoas",
                    links: [
                        { url: "condominos.html",  icone: iconePessoas(),    nome: "Condóminos" },
                        { url: "tecnicos.html",    icone: iconeTecnico(),    nome: "Técnicos" },
                    ],
                },
                {
                    titulo: "Conta",
                    links: [
                        { url: "perfil.html",      icone: iconeUtilizador(), nome: "A minha conta" },
                    ],
                },
            ];
        }

        if (tipo === "tecnico") {
            return [
                {
                    titulo: "Principal",
                    links: [
                        { url: "index.html",       icone: iconeDashboard(),  nome: "Dashboard" },
                        { url: "avarias.html",     icone: iconeAlerta(),     nome: "As minhas avarias" },
                    ],
                },
                {
                    titulo: "Conta",
                    links: [
                        { url: "perfil.html",      icone: iconeUtilizador(), nome: "A minha conta" },
                    ],
                },
            ];
        }

        return [];
    }

    // ── Páginas permitidas por tipo ───────────────────────────────────────────
    const PAGINAS_PERMITIDAS = {
        admin:   ["index.html", "edificios.html", "mapa.html", "gestores.html", "parceiros.html", "perfil.html"],
        gestor:  ["index.html", "edificios.html", "mapa.html", "reservas.html", "avarias.html",
                  "quotas.html", "relatorios.html", "condominos.html", "tecnicos.html", "perfil.html"],
        tecnico: ["index.html", "avarias.html", "perfil.html"],
    };

    function paginaPermitida(pagina) {
        return (PAGINAS_PERMITIDAS[tipo] || []).includes(pagina);
    }

    // ── Sidebar ───────────────────────────────────────────────────────────────
    function renderizarSidebar(paginaAtual) {
        const sidebar = document.querySelector(".app-sidebar");
        if (!sidebar) return;

        const seccoes = obterNavegacao();
        let html = `
            <div class="app-sidebar__logo">
                <img src="../shared/img/logo.png" alt="">
                <div class="app-sidebar__logo-texto">Gestão<br>Condomínios</div>
            </div>
            <nav class="app-sidebar__nav">
        `;

        seccoes.forEach((s) => {
            html += `<div class="app-sidebar__seccao">${s.titulo}</div>`;
            s.links.forEach((link) => {
                const ativo = link.url === paginaAtual ? "ativo" : "";
                html += `
                    <a href="${link.url}" class="app-sidebar__link ${ativo}">
                        ${link.icone}
                        <span>${link.nome}</span>
                    </a>`;
            });
        });

        html += `</nav>`;
        sidebar.innerHTML = html;
    }

    // ── Topbar ────────────────────────────────────────────────────────────────
    function renderizarTopbar(nomeUtilizador) {
        const topbar = document.querySelector(".app-topbar");
        if (!topbar) return;

        const iniciais = nomeUtilizador
            .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

        topbar.innerHTML = `
            <div class="app-topbar__esquerda"></div>
            <div class="app-topbar__direita">
                <div class="app-topbar__dropdown">
                    <button class="app-topbar__user" type="button" id="botao-user">
                        <span class="app-topbar__avatar">${iniciais}</span>
                        <span class="app-topbar__user-info">
                            <span class="app-topbar__user-nome">${nomeUtilizador}</span>
                            <span class="app-topbar__user-perfil">${NOMES_TIPO[tipo] || tipo}</span>
                        </span>
                    </button>
                    <div class="app-topbar__menu" id="menu-user" hidden>
                        <a href="perfil.html">A minha conta</a>
                        <button type="button" class="sair" id="botao-sair">Terminar sessão</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("botao-user").addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = document.getElementById("menu-user");
            menu.hidden = !menu.hidden;
        });
        document.addEventListener("click", () => {
            const menu = document.getElementById("menu-user");
            if (menu) menu.hidden = true;
        });
        document.getElementById("botao-sair").addEventListener("click", () => {
            window.api.logout();
            window.location.replace("../website_C/login.html");
        });
    }

    // ── Arranque ──────────────────────────────────────────────────────────────
    document.addEventListener("DOMContentLoaded", async () => {
        const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

        if (!paginaPermitida(paginaAtual)) {
            alert("Não tem permissão para aceder a esta página.");
            window.location.replace("index.html");
            return;
        }

        renderizarSidebar(paginaAtual);

        try {
            const utilizador = await window.api.me();
            window.utilizadorAtual = utilizador;
            window.tipoAtual = tipo;
            renderizarTopbar(utilizador.nome || "Utilizador");
        } catch {
            renderizarTopbar("Utilizador");
            window.tipoAtual = tipo;
        }
    });

    // ── Ícones ────────────────────────────────────────────────────────────────
    function iconeDashboard()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>'; }
    function iconeEdificio()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/><path d="M10 22v-4h4v4"/></svg>'; }
    function iconeCalendario() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
    function iconeAlerta()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
    function iconeMoeda()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'; }
    function iconeRecibo()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'; }
    function iconePessoas()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'; }
    function iconeTecnico()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-3V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"/><line x1="9" y1="7" x2="15" y2="7"/></svg>'; }
    function iconeFornecedor() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16h6v6H16z"/><path d="M2 2h6v6H2z"/><path d="M16 2h6v6h-6z"/><path d="M2 16h6v6H2z"/><line x1="11" y1="11" x2="11" y2="11"/></svg>'; }
    function iconeMapa()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>'; }
    function iconeUtilizador() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }
    function iconeGestor()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>'; }

})();
