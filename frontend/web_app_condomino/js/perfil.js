
(async function () {

    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u = window.utilizadorAtual || {};

    document.getElementById("perfil-nome").value  = u.nome  || "";
    document.getElementById("perfil-email").value = u.email || "";
    const telInput = document.getElementById("perfil-telemovel");
    if (telInput) telInput.value = u.telemovel || "";

    document.getElementById("form-perfil")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dados = {
            nome:      document.getElementById("perfil-nome").value.trim()  || undefined,
            email:     document.getElementById("perfil-email").value.trim() || undefined,
            telemovel: telInput?.value.trim() || undefined,
        };

        const msgPerfil = document.getElementById("msg-perfil");
        msgPerfil.style.display = "none";

        try {
            await window.api.put("/condominos/me", dados);
            msgPerfil.textContent   = "Alterações guardadas com sucesso.";
            msgPerfil.className     = "login-sucesso";
            msgPerfil.style.display = "";
            setTimeout(() => { msgPerfil.style.display = "none"; }, 3000);
        } catch (err) {
            msgPerfil.textContent   = err.message || "Não foi possível guardar as alterações.";
            msgPerfil.className     = "login-erro";
            msgPerfil.style.display = "";
        }
    });

    document.getElementById("form-pw")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pwAtual    = document.getElementById("pw-atual").value;
        const pwNova     = document.getElementById("pw-nova").value;
        const pwConfirma = document.getElementById("pw-confirma").value;
        const msgPw      = document.getElementById("msg-pw");

        msgPw.style.display = "none";

        if (pwNova.length < 8 || !/[A-Z]/.test(pwNova) || !/\d/.test(pwNova)) {
            msgPw.textContent   = "A nova password precisa de ter pelo menos 8 caracteres, uma maiúscula e um número.";
            msgPw.className     = "login-erro";
            msgPw.style.display = "";
            return;
        }
        if (pwNova !== pwConfirma) {
            msgPw.textContent   = "As passwords não coincidem.";
            msgPw.className     = "login-erro";
            msgPw.style.display = "";
            return;
        }

        try {
            await window.api.put("/auth/alterar-password", { pw_atual: pwAtual, pw_nova: pwNova });
            msgPw.textContent   = "Password alterada com sucesso.";
            msgPw.className     = "login-sucesso";
            msgPw.style.display = "";
            document.getElementById("form-pw").reset();
        } catch (err) {
            msgPw.textContent   = err.message || "Não foi possível alterar a password.";
            msgPw.className     = "login-erro";
            msgPw.style.display = "";
        }
    });

})();
