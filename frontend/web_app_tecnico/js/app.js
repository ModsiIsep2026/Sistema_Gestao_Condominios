
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

    if (!token || !payload || payload.tipo !== "tecnico") {
        sessionStorage.removeItem("condo_token");
        window.location.replace("../web_app_visitante/login.html");
        return;
    }

    const NAV = [
        {
            titulo: "Principal",
            links: [
                { url: "index.html",   icone: iconeDashboard(),  nome: "Dashboard" },
                { url: "avarias.html", icone: iconeAlerta(),     nome: "As minhas avarias" },
            ],
        },
        {
            titulo: "Conta",
            links: [
                { url: "perfil.html",  icone: iconeUtilizador(), nome: "A minha conta" },
            ],
        },
    ];

    const PAGINAS_PERMITIDAS = ["index.html", "avarias.html", "perfil.html"];

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
                            <span class="app-topbar__user-perfil">Técnico</span>
                        </span>
                    </button>
                    <div class="app-topbar__menu" id="menu-user" hidden>
                        <a href="perfil.html">A minha conta</a>
                        <button type="button" class="sair" id="botao-sair">Terminar sessão</button>
                    </div>
                </div>
            </div>`;

        document.getElementById("botao-user").addEventListener("click", (e) => {
            e.stopPropagation();
            document.getElementById("menu-user").hidden = !document.getElementById("menu-user").hidden;
        });
        document.addEventListener("click", () => {
            const m = document.getElementById("menu-user");
            if (m) m.hidden = true;
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
            window.tipoAtual = "tecnico";
            renderizarTopbar(utilizador.nome || "Técnico");
        } catch {
            renderizarTopbar("Técnico");
            window.tipoAtual = "tecnico";
        }
    });

    function iconeDashboard()  { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>'; }
    function iconeAlerta()     { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
    function iconeUtilizador() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }

})();
