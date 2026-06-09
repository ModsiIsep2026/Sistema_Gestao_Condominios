
// === SISTEMA DE TEMA ===
(function () {
    const CHAVE = "condo_tema";
    const t = localStorage.getItem(CHAVE) || "claro";
    document.documentElement.setAttribute("data-tema", t);
    let _escuro = t === "escuro";

    const _sol = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const _lua = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    function toggle() {
        _escuro = !_escuro;
        document.documentElement.setAttribute("data-tema", _escuro ? "escuro" : "claro");
        localStorage.setItem(CHAVE, _escuro ? "escuro" : "claro");
        document.querySelectorAll("[data-btn-tema]").forEach((b) => {
            b.innerHTML = _escuro ? _sol() : _lua();
            b.title = _escuro ? "Modo claro" : "Modo escuro";
        });
    }

    window.tema = {
        toggle,
        icone:  () => _escuro ? _sol() : _lua(),
        titulo: () => _escuro ? "Modo claro" : "Modo escuro",
    };

    // CSS para páginas visitante (usam vars próprias, não carregam tokens.css)
    const _styleVisitante = document.createElement("style");
    _styleVisitante.textContent = `
        [data-tema="escuro"] {
            --azul:  #E8E9EE;
            --azul2: #C8C9D0;
            --cinza: #363740;
            --borda: #4A4B58;
            --texto: #E8E9EE;
            --suave: #9698A9;
            --branco: #2C2D35;
            --erro:  #C74040;
            --ok:    #3A9B5E;
        }
        /* body/page background */
        [data-tema="escuro"] body { background: #2C2D35 !important; color: #E8E9EE !important; }

        /* navbar */
        [data-tema="escuro"] .navbar { background: rgba(44,45,53,0.97) !important; border-bottom-color: #4A4B58 !important; }

        /* botões primários — eram var(--azul), agora laranja */
        [data-tema="escuro"] .btn--primario        { background: #F08A24 !important; border-color: #F08A24 !important; color: #fff !important; }
        [data-tema="escuro"] .btn--primario:hover  { background: #D4711A !important; border-color: #D4711A !important; }
        [data-tema="escuro"] .btn--outline         { border-color: #E8E9EE !important; color: #E8E9EE !important; }
        [data-tema="escuro"] .btn-entrar           { background: #F08A24 !important; color: #fff !important; }
        [data-tema="escuro"] .btn-entrar:hover     { background: #D4711A !important; }
        [data-tema="escuro"] .btn-registar,
        [data-tema="escuro"] .btn-enviar,
        [data-tema="escuro"] .btn-submit           { background: #F08A24 !important; color: #fff !important; }

        /* secções com fundo azul-marinho — manter escuras */
        [data-tema="escuro"] .perfis   { background: #0F2744 !important; }
        [data-tema="escuro"] .footer   { background: #0F2744 !important; }
        [data-tema="escuro"] .numeros  { background: #0F2744 !important; }

        /* cards de serviços */
        [data-tema="escuro"] .card-func             { background: #363740 !important; border-color: #4A4B58 !important; }
        [data-tema="escuro"] .card-func:hover       { background: #43444F !important; }
        [data-tema="escuro"] .card-func.ativo       { background: #F08A24 !important; }

        /* formulário de contacto */
        [data-tema="escuro"] .contactos            { background: #363740 !important; }
        [data-tema="escuro"] .campo-c input,
        [data-tema="escuro"] .campo-c textarea     { background: #2C2D35 !important; color: #E8E9EE !important; border-color: #4A4B58 !important; }
        [data-tema="escuro"] .campo-c label        { color: #9698A9 !important; }

        /* parceiros/marquee */
        [data-tema="escuro"] .marquee-wrap { background: #363740 !important; border-color: #4A4B58 !important; }
        [data-tema="escuro"] .marquee-wrap::before { background: linear-gradient(to right, #363740, transparent) !important; }
        [data-tema="escuro"] .marquee-wrap::after  { background: linear-gradient(to left,  #363740, transparent) !important; }
        [data-tema="escuro"] .parceiro-logo        { filter: none !important; opacity: 0.8 !important; }
        [data-tema="escuro"] .parceiro-logo:hover  { opacity: 1 !important; }

        /* formulários login/registo */
        [data-tema="escuro"] .painel-form          { background: #363740 !important; }
        [data-tema="escuro"] .campo input,
        [data-tema="escuro"] .campo select         { background: #525252; color: #E8E9EE; border-color: #4A4B58; }
        [data-tema="escuro"] .campo input:focus,
        [data-tema="escuro"] .campo select:focus   { background: #585858; border-color: #9698A9; }
        [data-tema="escuro"] #login-erro           { background: #3A1A1A; }
        [data-tema="escuro"] .btn-oauth            { background: #2C2D35; border-color: #4A4B58; color: #E8E9EE; }
        [data-tema="escuro"] .btn-oauth:hover      { background: #43444F; border-color: #5A5B6A; }
        [data-tema="escuro"] .separador::before,
        [data-tema="escuro"] .separador::after     { background: #4A4B58; }
        [data-tema="escuro"] .perfil-tab           { border-color: #4A4B58; }
        [data-tema="escuro"] .registo-card,
        [data-tema="escuro"] .card-form            { background: #363740 !important; }
        [data-tema="escuro"] .bloco-info,
        [data-tema="escuro"] .destaque             { background: #363740; border-color: #4A4B58; }
    `;
    document.head.appendChild(_styleVisitante);

    // Botão flutuante para páginas públicas (sem .app-topbar)
    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector(".app-topbar")) return;
        const btn = document.createElement("button");
        btn.setAttribute("data-btn-tema", "1");
        btn.type = "button";
        btn.title = _escuro ? "Modo claro" : "Modo escuro";
        btn.innerHTML = _escuro ? _sol() : _lua();
        Object.assign(btn.style, {
            position: "fixed", top: "16px", right: "16px", zIndex: "9999",
            width: "40px", height: "40px", borderRadius: "50%",
            border: "1.5px solid rgba(11,34,64,0.18)",
            background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)",
            color: "#0B2240", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)", transition: "transform 0.15s ease",
        });
        btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.1)"; });
        btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
        btn.addEventListener("click", toggle);
        document.body.appendChild(btn);
    });
})();
// === FIM SISTEMA DE TEMA ===

const _LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = _LOCAL
    ? ""
    : "/~1211405/modsi/Sistema_Gestao_Condominios/frontend/proxy.php?path=";
const CHAVE_TOKEN = "condo_token";


function obterToken() {
    return sessionStorage.getItem(CHAVE_TOKEN);
}
function guardarToken(token) {
    sessionStorage.setItem(CHAVE_TOKEN, token);
}
function limparToken() {
    sessionStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem("condo_tipo");
    sessionStorage.removeItem("condo_id");
}

async function pedido(metodo, endpoint, corpo = null) {
    const headers = { "Content-Type": "application/json" };
    const token = obterToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;


    const metodosNativos = ["GET", "POST"];
    let metodoHttp = metodo;
    let urlExtra = "";
    if (!_LOCAL && !metodosNativos.includes(metodo.toUpperCase())) {
        metodoHttp = "POST";
        urlExtra = `&_method=${metodo}`;
    }

    const opcoes = { method: metodoHttp, headers };
    if (corpo) opcoes.body = JSON.stringify(corpo);

    const resposta = await fetch(`${API_BASE}${endpoint}${urlExtra}`, opcoes);

    if (resposta.status === 401) {
        limparToken();
    }

   
    if (resposta.status === 204) return null;

    const tipo = resposta.headers.get("content-type") || "";
    const dados = tipo.includes("application/json") ? await resposta.json() : null;

    if (!resposta.ok) {
        let mensagem = "Erro na chamada à API";
        if (dados) {
            const detalhe = dados.detail || dados.detalhe;
            if (typeof detalhe === "string") {
                mensagem = detalhe;
            } else if (Array.isArray(detalhe)) {

                mensagem = detalhe.map((e) => {
                    const campo = (e.loc || []).slice(1).join(" → ") || "campo";
                    return `${campo}: ${e.msg}`;
                }).join(" | ");
            }
        }
        throw new Error(mensagem);
    }
    return dados;
}

const api = {
    get:    (endpoint)        => pedido("GET",    endpoint),
    post:   (endpoint, corpo) => pedido("POST",   endpoint, corpo),
    put:    (endpoint, corpo) => pedido("PUT",    endpoint, corpo),
    patch:  (endpoint, corpo) => pedido("PATCH",  endpoint, corpo),
    delete: (endpoint)        => pedido("DELETE", endpoint),

    login: async (email, pw) => {
        const dados = await pedido("POST", "/auth/login", { email, pw });
        if (dados?.access_token) {
            guardarToken(dados.access_token);
            sessionStorage.setItem("condo_tipo", dados.perfil_utilizador);
            sessionStorage.setItem("condo_id",   String(dados.id));
        }
        return dados;
    },

    logout: () => {
        limparToken();
    },

    me: () => pedido("GET", "/auth/conta"),

    autenticado: () => !!obterToken(),
};

window.api = api;
