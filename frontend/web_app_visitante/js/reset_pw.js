
(function () {

    const form = document.getElementById("reset-form");
    const erro = document.getElementById("reset-erro");
    const sucesso = document.getElementById("reset-sucesso");
    const inputPassword = document.getElementById("password");
    const inputConfirm = document.getElementById("confirm_password");

   
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
        erro.style.display = "";
        sucesso.style.display = "none";
    }

    function mostrarSucesso(mensagem) {
        sucesso.textContent = mensagem;
        sucesso.style.display = "";
        erro.style.display = "none";
    }

    function limparMensagens() {
        erro.style.display = "none";
        erro.textContent = "";
        sucesso.style.display = "none";
        sucesso.textContent = "";
    }

    function passwordForte(pw) {
        if (pw.length < 8) return "A password tem de ter pelo menos 8 caracteres.";
        if (!/[A-Z]/.test(pw)) return "A password tem de ter pelo menos uma letra maiúscula.";
        if (!/[0-9]/.test(pw)) return "A password tem de ter pelo menos um número.";
        return null;
    }

    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (!token) {
        mostrarErro("O link de recuperação é inválido ou expirou.");
        form.querySelector("button[type='submit']").disabled = true;
        return;
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparMensagens();

        const password = inputPassword.value;
        const confirm = inputConfirm.value;

        const erroPw = passwordForte(password);
        if (erroPw) {
            mostrarErro(erroPw);
            return;
        }
        if (password !== confirm) {
            mostrarErro("As passwords não coincidem.");
            return;
        }

        form.classList.add("a-carregar");

        try {
            await window.api.post("/auth/reset-password", { token, password });
            mostrarSucesso("Password alterada. A redirecionar para o login...");
            setTimeout(() => { window.location.href = "login.html"; }, 1800);
        } catch (e) {
            mostrarErro(e.message || "Não foi possível redefinir a password.");
        } finally {
            form.classList.remove("a-carregar");
        }
    });

})();
