
(function () {

    const form = document.getElementById("esqueci-form");
    const erro = document.getElementById("esqueci-erro");
    const sucesso = document.getElementById("esqueci-sucesso");
    const inputEmail = document.getElementById("email");

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

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparMensagens();

        const email = inputEmail.value.trim();

        if (!email) {
            mostrarErro("Insira o seu email.");
            return;
        }

        form.classList.add("a-carregar");

        try {
            await window.api.post("/auth/pass-err", { email });
            mostrarSucesso("Email enviado com as instruções.");
            form.reset();
        } catch (e) {
            mostrarErro(e.message || "Não foi possível processar o pedido. Tente mais tarde.");
        } finally {
            form.classList.remove("a-carregar");
        }
    });

})();
