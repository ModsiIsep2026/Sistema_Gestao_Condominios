
const API_BASE = "http://localhost:8000";

const CHAVE_TOKEN = "condo_token";

function obterToken() {
    return sessionStorage.getItem(CHAVE_TOKEN);
}

function guardarToken(token) {
    sessionStorage.setItem(CHAVE_TOKEN, token);
}

function limparToken() {
    sessionStorage.removeItem(CHAVE_TOKEN);
}

async function pedido(metodo, endpoint, corpo = null) {
    const headers = { "Content-Type": "application/json" };
    const token = obterToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const opcoes = { method: metodo, headers };
    if (corpo) opcoes.body = JSON.stringify(corpo);

    const resposta = await fetch(`${API_BASE}${endpoint}`, opcoes);

    if (resposta.status === 401) {
        limparToken();
        
    }

    const tipo = resposta.headers.get("content-type") || "";
    const dados = tipo.includes("application/json") ? await resposta.json() : null;

    if (!resposta.ok) {
        const mensagem = (dados && (dados.detail || dados.detalhe)) || "Erro na chamada à API";
        throw new Error(mensagem);
    }
    return dados;
}

const api = {
    get:    (endpoint)         => pedido("GET",    endpoint),
    post:   (endpoint, corpo)  => pedido("POST",   endpoint, corpo),
    put:    (endpoint, corpo)  => pedido("PUT",    endpoint, corpo),
    patch:  (endpoint, corpo)  => pedido("PATCH",  endpoint, corpo),
    delete: (endpoint)         => pedido("DELETE", endpoint),

    login: async (email, password) => {
        const dados = await pedido("POST", "/auth/login", { email, password });
        if (dados && dados.access_token) guardarToken(dados.access_token);
        return dados;
    },
    logout: async () => {
        try { await pedido("POST", "/auth/logout"); } catch (e) { /* ignora */ }
        limparToken();
    },
    autenticado: () => !!obterToken(),
};

window.api = api;
