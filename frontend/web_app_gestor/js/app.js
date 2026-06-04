
(function () {

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

    if (!token || !payload || payload.tipo !== "gestor") {
        sessionStorage.removeItem("condo_token");
        window.location.replace("../web_app_visitante/login.html");
        return;
    }

    const NAV = [
        {
            titulo: "Principal",
            links: [
                { url: "index.html", icone: iconeDashboard(), nome: "Dashboard" },
                {
                    url: "edificios.html", icone: iconeEdificio(), nome: "Edifícios",
                    sublinks: [
                        { url: "mapa.html", nome: "Mapa" },
                    ],
                },
            ],
        },
        {
            titulo: "Operação",
            links: [
                {
                    url: "espacos.html", icone: iconeEspaco(), nome: "Espaços & Materiais",
                    sublinks: [
                        { url: "reservas.html", nome: "Reservas de Espaço" },
                    ],
                },
                { url: "avarias.html", icone: iconeAlerta(), nome: "Avarias" },
            ],
        },
        {
            titulo: "Financeiro",
            links: [
                {
                    url: "quotas.html", icone: iconeMoeda(), nome: "Pagamentos",
                    sublinks: [
                        { url: "relatorios.html", nome: "Relatórios" },
                    ],
                },
            ],
        },
        {
            titulo: "Pessoas",
            links: [
                { url: "condominos.html", icone: iconePessoas(), nome: "Condóminos" },
                { url: "tecnicos.html",   icone: iconeTecnico(), nome: "Técnicos" },
            ],
        },
        {
            titulo: "Conta",
            links: [
                { url: "perfil.html", icone: iconeUtilizador(), nome: "A minha conta" },
            ],
        },
    ];

    const PAGINAS_PERMITIDAS = [
        "index.html", "edificios.html", "edificio.html", "mapa.html",
        "espacos.html", "reservas.html", "avarias.html",
        "quotas.html", "relatorios.html",
        "condominos.html", "tecnicos.html",
        "perfil.html",
    ];

    function renderizarSidebar(paginaAtual) {
        const sidebar = document.querySelector(".app-sidebar");
        if (!sidebar) return;

        let html = `
            <div class="app-sidebar__logo">
                <img src="../visuais/img/logo.png" alt="">
                <div class="app-sidebar__logo-texto">Gestão<br>Condomínios</div>
            </div>
            <nav class="app-sidebar__nav">`;

        NAV.forEach((s) => {
            html += `<div class="app-sidebar__seccao">${s.titulo}</div>`;
            s.links.forEach((link) => {
                const temSub    = link.sublinks && link.sublinks.length > 0;
                const ativoPai  = link.url === paginaAtual;
                const ativoSub  = temSub && link.sublinks.some((sl) => sl.url === paginaAtual);
                const expandido = ativoPai || ativoSub;

                if (temSub) {
                    html += `
                        <div class="app-sidebar__item-com-sub${expandido ? " expandido" : ""}">
                            <a href="${link.url}" class="app-sidebar__link${ativoPai ? " ativo" : ""}">
                                ${link.icone}
                                <span>${link.nome}</span>
                                <span class="app-sidebar__chevron-wrap"
                                      onclick="event.preventDefault();event.stopPropagation();this.closest('.app-sidebar__item-com-sub').classList.toggle('expandido')">
                                    <svg class="app-sidebar__chevron-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </span>
                            </a>
                            <div class="app-sidebar__submenu">
                                ${link.sublinks.map((sl) => `
                                    <a href="${sl.url}" class="app-sidebar__sublink${sl.url === paginaAtual ? " ativo" : ""}">${sl.nome}</a>
                                `).join("")}
                            </div>
                        </div>`;
                } else {
                    html += `
                        <a href="${link.url}" class="app-sidebar__link${ativoPai ? " ativo" : ""}">
                            ${link.icone}
                            <span>${link.nome}</span>
                        </a>`;
                }
            });
        });

        html += `</nav>`;
        sidebar.innerHTML = html;
    }

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
                            <span class="app-topbar__user-perfil">Gestor</span>
                        </span>
                    </button>
                    <div class="app-topbar__menu" id="menu-user" style="display:none">
                        <a href="perfil.html">A minha conta</a>
                        <button type="button" class="sair" id="botao-sair">Terminar sessão</button>
                    </div>
                </div>
            </div>`;

        document.getElementById("botao-user").addEventListener("click", (e) => {
            e.stopPropagation();
            const m = document.getElementById("menu-user");
            m.style.display = m.style.display === "none" ? "" : "none";
        });
        document.addEventListener("click", () => {
            const m = document.getElementById("menu-user");
            if (m) m.style.display = "none";
        });
        document.getElementById("botao-sair").addEventListener("click", () => {
            window.api.logout();
            window.location.replace("../web_app_visitante/login.html");
        });
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

        if (!PAGINAS_PERMITIDAS.includes(paginaAtual)) {
            window.location.replace("index.html");
            return;
        }

        renderizarSidebar(paginaAtual);
        carregarBadgeSidebar();

        try {
            const utilizador = await window.api.me();
            window.utilizadorAtual = utilizador;
            window.tipoAtual = "gestor";
            renderizarTopbar(utilizador.nome || "Gestor");
        } catch {
            renderizarTopbar("Gestor");
            window.tipoAtual = "gestor";
        }
    });

    async function carregarBadgeSidebar() {
        try {
            const edificios = await window.api.get("/edificios").catch(() => []);
            const listas    = await Promise.all(
                edificios.map((e) => window.api.get(`/avarias?id_edificio=${e.id}`).catch(() => []))
            );
            const abertas = listas.flat().filter((a) => !a.resolucao || a.resolucao.status !== 1).length;
            if (abertas > 0) {
                const linkAv = document.querySelector('.app-sidebar__link[href="avarias.html"]');
                if (linkAv) {
                    const badge = document.createElement("span");
                    badge.className   = "app-sidebar__badge";
                    badge.textContent = abertas > 99 ? "99+" : String(abertas);
                    linkAv.appendChild(badge);
                }
            }
        } catch { /* falha silenciosa */ }
    }

    function iconeDashboard()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>'; }
    function iconeEdificio()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/><path d="M10 22v-4h4v4"/></svg>'; }
    function iconeMapa()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>'; }
    function iconeEspaco()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'; }
    function iconeCalendario() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'; }
    function iconeAlerta()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
    function iconeMoeda()      { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 6a8 8 0 1 0 0 12"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="2" y1="14" x2="14" y2="14"/></svg>'; }
    function iconeRecibo()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'; }
    function iconePessoas()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'; }
    function iconeTecnico()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-3V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"/><line x1="9" y1="7" x2="15" y2="7"/></svg>'; }
    function iconeUtilizador() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }

})();
