
(async function () {

    // Aguardar utilizadorAtual do app.js
    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u = window.utilizadorAtual || {};

    // Preencher campos
    document.getElementById("perfil-nome").value     = u.nome  || "";
    document.getElementById("perfil-email").value    = u.email || "";

    const telInput = document.getElementById("perfil-telemovel");
    if (telInput) telInput.value = u.telemovel || "";

    // Guardar alterações
    document.getElementById("form-perfil")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!u.id) { alert("Não foi possível identificar o utilizador."); return; }

        const dados = {
            nome:      document.getElementById("perfil-nome").value.trim()  || undefined,
            email:     document.getElementById("perfil-email").value.trim() || undefined,
            telemovel: telInput?.value.trim() || undefined,
        };

        const msgPerfil = document.getElementById("msg-perfil");
        if (msgPerfil) msgPerfil.hidden = true;

        try {
            await window.api.put(`/condominos/${u.id}`, dados);
            if (msgPerfil) {
                msgPerfil.textContent = "Alterações guardadas com sucesso.";
                msgPerfil.className   = "login-sucesso";
                msgPerfil.hidden      = false;
                setTimeout(() => { msgPerfil.hidden = true; }, 3000);
            }
        } catch (err) {
            if (msgPerfil) {
                msgPerfil.textContent = err.message || "Não foi possível guardar as alterações.";
                msgPerfil.className   = "login-erro";
                msgPerfil.hidden      = false;
            }
        }
    });

    // Alterar password
    document.getElementById("form-pw")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nova     = document.getElementById("pw-nova").value;
        const confirma = document.getElementById("pw-confirma").value;
        const msgPw    = document.getElementById("msg-pw");

        if (msgPw) msgPw.hidden = true;

        if (nova !== confirma) {
            if (msgPw) {
                msgPw.textContent = "As passwords não coincidem.";
                msgPw.className   = "login-erro";
                msgPw.hidden      = false;
            }
            return;
        }
        if (nova.length < 6) {
            if (msgPw) {
                msgPw.textContent = "A password deve ter pelo menos 6 caracteres.";
                msgPw.className   = "login-erro";
                msgPw.hidden      = false;
            }
            return;
        }

        try {
            await window.api.put(`/condominos/${u.id}`, { pw: nova });
            if (msgPw) {
                msgPw.textContent = "Password alterada com sucesso.";
                msgPw.className   = "login-sucesso";
                msgPw.hidden      = false;
            }
            document.getElementById("form-pw").reset();
        } catch (err) {
            if (msgPw) {
                msgPw.textContent = err.message || "Não foi possível alterar a password.";
                msgPw.className   = "login-erro";
                msgPw.hidden      = false;
            }
        }
    });

})();
