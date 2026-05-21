(function () {
    const form = document.getElementById("reset-form");
    const erro = document.getElementById("reset-erro");
    const sucesso = document.getElementById("reset-sucesso");
    const inputPassword = document.getElementById("password");
    const inputConfirm = document.getElementById("confirm_password");

    function mostrarErro(mensagem) {
        erro.textContent = mensagem;
        erro.hidden = false;
        sucesso.hidden = true;
    }

    function mostrarSucesso(mensagem) {
        sucesso.textContent = mensagem;
        sucesso.hidden = false;
        erro.hidden = true;
    }

    function limparMensagens() {
        erro.hidden = true;
        erro.textContent = "";
        sucesso.hidden = true;
        sucesso.textContent = "";
    }

    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (!token) {
        mostrarErro("O link de recuperação é inválido ou expirou.");
        form.querySelector("button").disabled = true;
        form.querySelector("button").textContent = "Link inválido";
        return;
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparMensagens();

        const password = inputPassword.value.trim();
        const confirm = inputConfirm.value.trim();

        if (!password || !confirm) {
            mostrarErro("Preencha todos os campos.");
            return;
        }

        if (password !== confirm) {
            mostrarErro("As passwords não coincidem.");
            return;
        }

        try {
            await window.api.post("/auth/reset-password", { token, password });
            mostrarSucesso("A sua password foi redefinida com sucesso.");
            form.reset();
        } catch (e) {
            mostrarErro(e.message || "Não foi possível redefinir a password.");
        }
    });
})();
