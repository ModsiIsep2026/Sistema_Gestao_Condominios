/* Login — autentica e redireciona conforme o perfil do utilizador.
   Apenas gestor (3), técnico (4) e administrador (5) entram no backoffice.
   Condóminos (2) ficam na zona pública até existir área pessoal. */

(function () {

    const form = document.getElementById("login-form");
    const erro = document.getElementById("login-erro");
    const inputEmail = document.getElementById("email");
    const inputPassword = document.getElementById("password");

    const PERFIS_BACKOFFICE = [3, 4, 5];

    function decodificarToken(token) {
        try {
            const payload = token.split(".")[1];
            return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        } catch {
            return null;
        }
    }

    function redirecionarPorPerfil(token) {
        const payload = decodificarToken(token);
        const perfil = payload?.perfil;

        if (PERFIS_BACKOFFICE.includes(perfil)) {
            window.location.replace("../webapp_AG/");
        } else {
            // Condómino — sem área dedicada ainda. Avisa e volta à landing.
            alert("Sessão iniciada. A sua área pessoal estará disponível em breve.");
            window.location.replace("index.html");
        }
    }

    // Olho — alterna visibilidade
    document.querySelectorAll(".toggle-pass").forEach((botao) => {
        botao.addEventListener("click", () => {
            const alvo = document.getElementById(botao.dataset.target);
            if (!alvo) return;
            const mostrar = alvo.type === "password";
            alvo.type = mostrar ? "text" : "password";
            botao.classList.toggle("toggle-pass--ativo", mostrar);
            botao.setAttribute("aria-label", mostrar ? "Esconder password" : "Mostrar password");
        });
    });

    function mostrarErro(mensagem) {
        erro.textContent = mensagem;
        erro.hidden = false;
    }

    function limparErro() {
        erro.hidden = true;
        erro.textContent = "";
    }

    // Aviso herdado do webapp_AG (quando perfil sem permissão tenta entrar)
    const avisoLogin = sessionStorage.getItem("aviso_login");
    if (avisoLogin) {
        mostrarErro(avisoLogin);
        sessionStorage.removeItem("aviso_login");
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparErro();

        const email = inputEmail.value.trim();
        const password = inputPassword.value;

        if (!email || !password) {
            mostrarErro("Preencha o email e a password.");
            return;
        }

        form.classList.add("a-carregar");

        try {
            const dados = await window.api.login(email, password);
            redirecionarPorPerfil(dados.access_token);
        } catch (e) {
            mostrarErro(e.message || "Email ou password inválidos.");
            inputPassword.value = "";
            inputPassword.focus();
        } finally {
            form.classList.remove("a-carregar");
        }
    });

    // Login social — backend redireciona para login com #token=...
    document.querySelectorAll(".btn-social").forEach((botao) => {
        botao.addEventListener("click", () => {
            const provedor = botao.dataset.provider === "outlook" ? "microsoft" : botao.dataset.provider;
            window.location.href = `/auth/${provedor}/inicio`;
        });
    });

    // OAuth callback — token no fragment da URL
    if (window.location.hash.startsWith("#token=")) {
        const token = window.location.hash.replace("#token=", "");
        if (token) {
            sessionStorage.setItem("condo_token", token);
            redirecionarPorPerfil(token);
            return;
        }
    }

    // Erro de OAuth no query string
    const params = new URLSearchParams(window.location.search);
    if (params.has("erro")) {
        mostrarErro(decodeURIComponent(params.get("erro")));
    }

})();
