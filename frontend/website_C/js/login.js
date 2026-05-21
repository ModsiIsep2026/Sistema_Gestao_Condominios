
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
         
            alert("Sessão iniciada. A sua área pessoal estará disponível em breve.");
            window.location.replace("index.html");
        }
    }

  
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

   
    document.querySelectorAll(".btn-social").forEach((botao) => {
        botao.addEventListener("click", () => {
            const servico = botao.dataset.provider === "outlook" ? "microsoft" : botao.dataset.provider;
            window.location.href = `/auth/${servico}/inicio`;
        });
    });

   
    if (window.location.hash.startsWith("#token=")) {
        const token = window.location.hash.replace("#token=", "");
        if (token) {
            sessionStorage.setItem("condo_token", token);
            redirecionarPorPerfil(token);
            return;
        }
    }

  
    const params = new URLSearchParams(window.location.search);
    if (params.has("erro")) {
        mostrarErro(decodeURIComponent(params.get("erro")));
    }

})();
