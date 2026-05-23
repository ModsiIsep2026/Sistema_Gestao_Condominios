
(async function () {

    // Aguardar utilizadorAtual do app.js
    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u    = window.utilizadorAtual || {};
    const tipo = window.tipoAtual || u.tipo || "";

    const endpointUpdate = {
        admin:   `/admin/${u.id}`,
        gestor:  `/gestores/${u.id}`,
        tecnico: `/tecnicos/${u.id}`,
    }[tipo] || null;

    document.getElementById("perfil-nome").value     = u.nome  || "";
    document.getElementById("perfil-email").value    = u.email || "";

    const telInput = document.getElementById("perfil-telemovel");
    if (telInput) telInput.value = u.telemovel || "";

    // Guardar alterações
    document.getElementById("form-perfil")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!endpointUpdate) { alert("Não foi possível identificar o endpoint de atualização."); return; }

        const dados = {
            nome:      document.getElementById("perfil-nome").value.trim()  || undefined,
            email:     document.getElementById("perfil-email").value.trim() || undefined,
            telemovel: telInput?.value.trim() || undefined,
        };

        const msgPerfil = document.getElementById("msg-perfil");
        if (msgPerfil) msgPerfil.hidden = true;

        try {
            await window.api.put(endpointUpdate, dados);
            if (msgPerfil) {
                msgPerfil.textContent = "Alterações guardadas.";
                msgPerfil.className   = "login-sucesso";
                msgPerfil.hidden      = false;
                setTimeout(() => { msgPerfil.hidden = true; }, 3000);
            }
        } catch (err) {
            if (msgPerfil) {
                msgPerfil.textContent = err.message || "Não foi possível guardar.";
                msgPerfil.className   = "login-erro";
                msgPerfil.hidden      = false;
            }
        }
    });

    // ── Alterar password ───────────────────────────────────────────────────
    document.getElementById("form-pw")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msgPw    = document.getElementById("msg-pw");
        const pwAtual  = document.getElementById("pw-atual").value;
        const pwNova   = document.getElementById("pw-nova").value;
        const pwConf   = document.getElementById("pw-confirmar").value;

        msgPw.hidden = true;

        if (pwNova.length < 8 || !/[A-Z]/.test(pwNova) || !/\d/.test(pwNova)) {
            msgPw.textContent = "A nova password precisa de ter pelo menos 8 caracteres, uma maiúscula e um número.";
            msgPw.className   = "login-erro";
            msgPw.hidden      = false;
            return;
        }
        if (pwNova !== pwConf) {
            msgPw.textContent = "As passwords não coincidem.";
            msgPw.className   = "login-erro";
            msgPw.hidden      = false;
            return;
        }

        try {
            const res = await window.api.put("/auth/alterar-password", { pw_atual: pwAtual, pw_nova: pwNova });
            msgPw.textContent = res?.mensagem || "Enviámos um email de confirmação. Clique no link para concluir.";
            msgPw.className   = "login-sucesso";
            msgPw.hidden      = false;
            document.getElementById("form-pw").reset();
        } catch (err) {
            msgPw.textContent = err.message || "Não foi possível alterar a password.";
            msgPw.className   = "login-erro";
            msgPw.hidden      = false;
        }
    });

})();
