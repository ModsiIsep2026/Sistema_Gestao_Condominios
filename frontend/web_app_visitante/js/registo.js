

(function () {

    const form = document.getElementById("registo-form");
    const erro = document.getElementById("registo-erro");
    const inputNome = document.getElementById("nome");
    const inputEmail = document.getElementById("email");
    const inputTelemovel = document.getElementById("telemovel");
    const inputNif = document.getElementById("nif");
    const inputPassword = document.getElementById("password");
    const inputPassword2 = document.getElementById("password2");


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
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function limparErro() {
        erro.hidden = true;
        erro.textContent = "";
    }

    function passwordForte(pw) {
        if (pw.length < 8) return "A password tem de ter pelo menos 8 caracteres.";
        if (!/[A-Z]/.test(pw)) return "A password tem de ter pelo menos uma letra maiúscula.";
        if (!/[0-9]/.test(pw)) return "A password tem de ter pelo menos um número.";
        return null;
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparErro();

        const nome = inputNome.value.trim();
        const email = inputEmail.value.trim();
        const telemovel = inputTelemovel.value.trim() || null;
        const nif = inputNif.value.trim() || null;
        const password = inputPassword.value;
        const password2 = inputPassword2.value;

        if (!nome || nome.length < 2) {
            mostrarErro("Indique o seu nome completo.");
            return;
        }
        if (!email) {
            mostrarErro("Indique o seu email.");
            return;
        }

        const erroPw = passwordForte(password);
        if (erroPw) {
            mostrarErro(erroPw);
            return;
        }
        if (password !== password2) {
            mostrarErro("As passwords não coincidem.");
            return;
        }
        if (nif && !/^\d{9}$/.test(nif)) {
            mostrarErro("O NIF está incompleto.");
            return;
        }

        form.classList.add("a-carregar");

        try {
            const resposta = await window.api.post("/auth/registo", {
                nome, email, password, telemovel, nif, lingua: "pt",
            });
            if (resposta && resposta.access_token) {
                sessionStorage.setItem("condo_token", resposta.access_token);
            }
            
            window.location.href = "index.html";
        } catch (e) {
            mostrarErro(e.message || "Não foi possível criar a conta. Tente novamente.");
            inputPassword.value = "";
            inputPassword2.value = "";
        } finally {
            form.classList.remove("a-carregar");
        }
    });

})();
