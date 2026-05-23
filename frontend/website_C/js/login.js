
(function () {

    const form       = document.getElementById("login-form");
    const erro       = document.getElementById("login-erro");
    const inputEmail = document.getElementById("email");
    const inputPw    = document.getElementById("password");

    // ── Redirecionar conforme o tipo do JWT ───────────────────────────────────
    function decodificarToken(token) {
        try {
            return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        } catch { return null; }
    }

    function redirecionarPorTipo(tipo) {
        if (tipo === "condomino") {
            window.location.replace("../webapp_C/");
        } else if (tipo === "admin" || tipo === "gestor" || tipo === "tecnico") {
            window.location.replace("../webapp_AG/");
        } else {
            mostrarErro("Tipo de conta não reconhecido.");
        }
    }

    // ── Utilitários ───────────────────────────────────────────────────────────
    function mostrarErro(msg) { erro.textContent = msg; erro.hidden = false; }
    function limparErro()     { erro.hidden = true; erro.textContent = ""; }

    const avisoLogin = sessionStorage.getItem("aviso_login");
    if (avisoLogin) {
        mostrarErro(avisoLogin);
        sessionStorage.removeItem("aviso_login");
    }

    // ── Toggle password ───────────────────────────────────────────────────────
    document.querySelectorAll(".toggle-pass").forEach((btn) => {
        btn.addEventListener("click", () => {
            const alvo = document.getElementById(btn.dataset.target);
            if (!alvo) return;
            const mostrar = alvo.type === "password";
            alvo.type = mostrar ? "text" : "password";
            btn.classList.toggle("toggle-pass--ativo", mostrar);
            btn.setAttribute("aria-label", mostrar ? "Esconder password" : "Mostrar password");
        });
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparErro();

        const email = inputEmail.value.trim();
        const pw    = inputPw.value;

        if (!email || !pw) {
            mostrarErro("Preencha o email e a password.");
            return;
        }

        form.classList.add("a-carregar");

        try {
            const dados = await window.api.login(email, pw);
            redirecionarPorTipo(dados.perfil_utilizador);
        } catch (ex) {
            mostrarErro(ex.message || "Email ou password incorretos.");
            inputPw.value = "";
            inputPw.focus();
        } finally {
            form.classList.remove("a-carregar");
        }
    });

    // ── Botões OAuth ──────────────────────────────────────────────────────────
    document.querySelectorAll(".btn-social").forEach((btn) => {
        btn.addEventListener("click", () => {
            const servico = btn.dataset.provider === "outlook" ? "microsoft" : btn.dataset.provider;
            window.location.href = `/auth/${servico}/inicio`;
        });
    });

    // ── Token via fragment (OAuth callback) ───────────────────────────────────
    if (window.location.hash.startsWith("#token=")) {
        const token = window.location.hash.slice("#token=".length);
        if (token) {
            sessionStorage.setItem("condo_token", token);
            const payload = decodificarToken(token);
            if (payload?.tipo) {
                sessionStorage.setItem("condo_tipo", payload.tipo);
                sessionStorage.setItem("condo_id",   String(payload.sub));
            }
            redirecionarPorTipo(payload?.tipo || "");
            return;
        }
    }

    // ── Erro via query string (OAuth erro) ────────────────────────────────────
    const params = new URLSearchParams(window.location.search);
    if (params.has("erro"))  mostrarErro(decodeURIComponent(params.get("erro")));
    if (params.has("aviso")) mostrarErro(decodeURIComponent(params.get("aviso")));

})();
