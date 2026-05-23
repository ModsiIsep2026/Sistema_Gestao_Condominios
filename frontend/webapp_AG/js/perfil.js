
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

})();
