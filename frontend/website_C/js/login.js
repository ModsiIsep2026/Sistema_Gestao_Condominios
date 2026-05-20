

(function () {

    const form = document.getElementById("login-form");
    const erro = document.getElementById("login-erro");
    const inputEmail = document.getElementById("email");
    const inputPassword = document.getElementById("password");

    
    
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
            await window.api.login(email, password);

            window.location.href = "../webapp_AG/";
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
            const provedor = botao.dataset.provider === "outlook" ? "microsoft" : botao.dataset.provider;
            window.location.href = `/auth/${provedor}/inicio`;
        });
    });

    if (window.location.hash.startsWith("#token=")) {
        const token = window.location.hash.replace("#token=", "");
        if (token) {
            sessionStorage.setItem("condo_token", token);
            window.location.replace("../webapp_AG/");
            return;
        }
    }


    const params = new URLSearchParams(window.location.search);
    if (params.has("erro")) {
        mostrarErro(decodeURIComponent(params.get("erro")));
    }

})();
