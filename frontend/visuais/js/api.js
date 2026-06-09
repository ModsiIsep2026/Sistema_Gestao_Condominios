
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
