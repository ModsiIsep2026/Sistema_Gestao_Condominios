
(async function () {

    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u = window.utilizadorAtual || {};

    document.getElementById("perfil-nome").value   = u.nome   || "";
    document.getElementById("perfil-email").value  = u.email  || "";
    document.getElementById("perfil-funcao").value = u.funcao || "";

    // Hero
    const iniciais = (u.nome || "?").split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    const heroAvatar = document.getElementById("hero-avatar");
    const heroNome   = document.getElementById("hero-nome");
    const heroEmail  = document.getElementById("hero-email");
    const heroRole   = document.getElementById("hero-role");
    if (heroAvatar) heroAvatar.textContent = iniciais;
    if (heroNome)   heroNome.textContent   = u.nome  || "—";
    if (heroEmail)  heroEmail.textContent  = u.email || "";
    if (heroRole && u.funcao) heroRole.textContent = u.funcao;

    const msgPerfil = document.getElementById("msg-perfil");

    document.getElementById("form-perfil")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        msgPerfil.style.display = "none";

        const dados = {
            nome:  document.getElementById("perfil-nome").value.trim()  || undefined,
            email: document.getElementById("perfil-email").value.trim() || undefined,
            funcao: document.getElementById("perfil-funcao").value.trim() || undefined,
        };

        try {
            await window.api.put("/tecnicos/conta", dados);
            msgPerfil.textContent   = "Alterações guardadas com sucesso.";
            msgPerfil.className     = "perfil-msg perfil-msg--ok";
            msgPerfil.style.display = "";
            setTimeout(() => { msgPerfil.style.display = "none"; }, 3000);
        } catch (err) {
            msgPerfil.textContent   = err.message || "Não foi possível guardar.";
            msgPerfil.className     = "perfil-msg perfil-msg--err";
            msgPerfil.style.display = "";
        }
    });

    const msgPw = document.getElementById("msg-pw");

    document.getElementById("form-pw")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const pwAtual = document.getElementById("pw-atual").value;
        const pwNova  = document.getElementById("pw-nova").value;
        const pwConf  = document.getElementById("pw-confirmar").value;

        msgPw.style.display = "none";

        if (pwNova.length < 8 || !/[A-Z]/.test(pwNova) || !/\d/.test(pwNova)) {
            msgPw.textContent   = "A nova password precisa de ter pelo menos 8 caracteres, uma maiúscula e um número.";
            msgPw.className     = "login-erro";
            msgPw.style.display = "";
            return;
        }
        if (pwNova !== pwConf) {
            msgPw.textContent   = "As passwords não coincidem.";
            msgPw.className     = "login-erro";
            msgPw.style.display = "";
            return;
        }

        try {
            const res = await window.api.put("/auth/alterar-password", { pw_atual: pwAtual, pw_nova: pwNova });
            msgPw.textContent   = res?.mensagem || "Enviámos um email de confirmação. Clique no link para concluir.";
            msgPw.className     = "perfil-msg perfil-msg--ok";
            msgPw.style.display = "";
            document.getElementById("form-pw").reset();
        } catch (err) {
            msgPw.textContent   = err.message || "Não foi possível alterar a password.";
            msgPw.className     = "perfil-msg perfil-msg--err";
            msgPw.style.display = "";
        }
    });

})();
