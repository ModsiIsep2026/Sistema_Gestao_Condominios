(async function () {

    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u = window.utilizadorAtual || {};

    document.getElementById("perfil-nome").value = u.nome || "";
    document.getElementById("perfil-email").value = u.email || "";
    document.getElementById("perfil-telemovel").value = u.telemovel || "";
    document.getElementById("perfil-nif").value = u.nif || "";

    document.getElementById("form-perfil").addEventListener("submit", async (e) => {
        e.preventDefault();
        const dados = {
            nome:      document.getElementById("perfil-nome").value.trim(),
            telemovel: document.getElementById("perfil-telemovel").value.trim() || null,
            nif:       document.getElementById("perfil-nif").value.trim() || null,
        };

        const msgPerfil = document.getElementById("msg-perfil");
        if (msgPerfil) msgPerfil.hidden = true;

        try {
            await window.api.put(`/utilizadores/${u.id_utilizador}`, dados);
            if (msgPerfil) {
                msgPerfil.textContent = "Alterações guardadas.";
                msgPerfil.className = "login-sucesso";
                msgPerfil.hidden = false;
                setTimeout(() => { msgPerfil.hidden = true; }, 3000);
            }
        } catch (err) {
            if (msgPerfil) {
                msgPerfil.textContent = err.message || "Não foi possível guardar.";
                msgPerfil.className = "login-erro";
                msgPerfil.hidden = false;
            }
        }
    });

    const btnPw = document.getElementById("btn-pedir-pw");
    const msgPw = document.getElementById("msg-pw");

    function mostrarMsg(texto, tipo) {
        msgPw.textContent = texto;
        msgPw.className = tipo === "erro" ? "login-erro" : "login-sucesso";
        msgPw.hidden = false;
    }

    btnPw?.addEventListener("click", async () => {
        if (!u.email) {
            mostrarMsg("Não foi possível identificar o seu email.", "erro");
            return;
        }
        btnPw.disabled = true;
        btnPw.textContent = "A enviar...";
        msgPw.hidden = true;

        try {
            await window.api.post("/auth/pass-err", { email: u.email });
            mostrarMsg(`Email enviado para ${u.email} com as instruções.`, "sucesso");
            btnPw.textContent = "Enviar novamente";
        } catch (err) {
            mostrarMsg(err.message || "Não foi possível enviar o email.", "erro");
            btnPw.textContent = "Enviar link para alteração de password";
        } finally {
            btnPw.disabled = false;
        }
    });

})();
