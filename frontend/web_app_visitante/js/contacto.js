(function () {

    const form = document.getElementById("contacto-form");
    const feedback = document.getElementById("contacto-mensagem");
    if (!form) return;

    function mostrarFeedback(msg, tipo) {
        feedback.textContent = msg;
        feedback.style.display = "block";
        feedback.style.padding = "12px 16px";
        feedback.style.fontSize = "14px";
        feedback.style.borderLeft = `3px solid ${tipo === "sucesso" ? "#2E7D32" : "#C0392B"}`;
        feedback.style.background = tipo === "sucesso" ? "#F0FBF0" : "#FEF2F2";
        feedback.style.color = tipo === "sucesso" ? "#2E7D32" : "#C0392B";
    }

    function limparFeedback() {
        feedback.style.display = "none";
        feedback.textContent = "";
    }

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparFeedback();

        const nome = document.getElementById("contacto-nome")?.value.trim();
        const email = document.getElementById("contacto-email")?.value.trim();
        const telefone = document.getElementById("contacto-telefone")?.value.trim() || null;
        const mensagem = document.getElementById("contacto-msg")?.value.trim();

        if (!nome || !email || !mensagem) {
            mostrarFeedback("Preencha o nome, email e mensagem.", "erro");
            return;
        }

        const btn = form.querySelector("button[type='submit']");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "A enviar...";
        }

        try {
            await window.api.post("/contacto", { nome, email, telefone, mensagem });
            mostrarFeedback("Mensagem enviada! Responderemos dentro de 24 h!", "sucesso");
            form.reset();
        } catch (_) {
            mostrarFeedback("Erro de ligacao. Verifique a sua internet e tente novamente.", "erro");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Enviar mensagem";
            }
        }
    });

})();
