
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

    if (!token || !payload || payload.tipo !== "admin") {
        sessionStorage.removeItem("condo_token");
        window.location.replace("../web_app_visitante/login.html");
        return;
    }

    const NAV = [
        {
            titulo: "Principal",
            links: [
                {
                    url: "index.html", icone: iconeDashboard(), nome: "Dashboard",
                    sublinks: [
                        { url: "edificios.html", nome: "Edifícios" },
                        { url: "gestores.html",  nome: "Gestores" },
                        { url: "parceiros.html", nome: "Parceiros" },
                        { url: "adesoes.html",   nome: "Adesões" },
                    ],
                },
                { url: "edificios.html", icone: iconeEdificio(),  nome: "Edifícios" },
                { url: "mapa.html",      icone: iconeMapa(),      nome: "Mapa de Edifícios" },
            ],
        },
        {
            titulo: "Recursos",
            links: [
                {
                    url: "gestores.html", icone: iconeGestor(), nome: "Gestores",
                    sublinks: [
                        { url: "adesoes.html", nome: "Adesões" },
                    ],
                },
                {
                    url: "parceiros.html", icone: iconeFornecedor(), nome: "Parceiros",
                    sublinks: [
                        { url: "fornecedores.html", nome: "Fornecedores" },
                    ],
                },
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
        "index.html", "edificios.html", "mapa.html",
        "gestores.html", "gestores_ver.html", "adesoes.html",
        "parceiros.html", "fornecedores.html", "perfil.html",
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
                            <span class="app-topbar__user-perfil">Administrador</span>
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

        try {
            const utilizador = await window.api.me();
            window.utilizadorAtual = utilizador;
            window.tipoAtual = "admin";
            renderizarTopbar(utilizador.nome || "Administrador");
        } catch {
            renderizarTopbar("Administrador");
            window.tipoAtual = "admin";
        }
    });

    function iconeDashboard()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>'; }
    function iconeEdificio()   { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><path d="M10 22v-4h4v4"/></svg>'; }
    function iconeMapa()       { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>'; }
    function iconeGestor()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>'; }
    function iconeGrafico()    { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>'; }
    function iconeFornecedor() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16h6v6H16z"/><path d="M2 2h6v6H2z"/><path d="M16 2h6v6h-6z"/><path d="M2 16h6v6H2z"/><line x1="11" y1="11" x2="11" y2="11"/></svg>'; }
    function iconeUtilizador() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }

})();
