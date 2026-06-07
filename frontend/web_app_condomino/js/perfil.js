(async function () {

    for (let i = 0; i < 30; i++) {
        if (window.utilizadorAtual) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    const u = window.utilizadorAtual || {};

    const inputNome = document.getElementById("perfil-nome");
    const inputEmail = document.getElementById("perfil-email");
    const inputTelemovel = document.getElementById("perfil-telemovel");
    const msgPerfil = document.getElementById("msg-perfil");
    const msgPw = document.getElementById("msg-pw");

    const telReal = (u.telemovel && !u.telemovel.startsWith("_p")) ? u.telemovel : "";
    if (inputNome)      inputNome.value      = u.nome  || "";
    if (inputEmail)     inputEmail.value     = u.email || "";
    if (inputTelemovel) inputTelemovel.value = telReal;

    // Hero
    const iniciais = (u.nome || "?").split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    const heroAvatar = document.getElementById("hero-avatar");
    const heroNome   = document.getElementById("hero-nome");
    const heroEmail  = document.getElementById("hero-email");
    if (heroAvatar) heroAvatar.textContent = iniciais;
    if (heroNome)   heroNome.textContent   = u.nome  || "—";
    if (heroEmail)  heroEmail.textContent  = u.email || "";

    document.getElementById("form-perfil")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dados = {
            nome: inputNome?.value.trim() || undefined,
            email: inputEmail?.value.trim() || undefined,
            telemovel: inputTelemovel?.value.trim() || undefined,
        };

        msgPerfil.style.display = "none";

        try {
            const atualizado = await window.api.put("/condominos/conta", dados);
            window.utilizadorAtual = {
                ...(window.utilizadorAtual || {}),
                nome: atualizado.nome,
                email: atualizado.email,
                telemovel: atualizado.telemovel,
            };

            if (inputNome) inputNome.value = atualizado.nome || "";
            if (inputEmail) inputEmail.value = atualizado.email || "";
            if (inputTelemovel) inputTelemovel.value = (atualizado.telemovel && !atualizado.telemovel.startsWith("_p")) ? atualizado.telemovel : "";

            msgPerfil.textContent = "Alterações guardadas com sucesso.";
            msgPerfil.className = "perfil-msg perfil-msg--ok";
            msgPerfil.style.display = "block";
            setTimeout(() => { msgPerfil.style.display = "none"; }, 3000);
        } catch (err) {
            msgPerfil.textContent = err.message || "Não foi possível guardar as alterações.";
            msgPerfil.className = "perfil-msg perfil-msg--err";
            msgPerfil.style.display = "block";
        }
    });

    document.getElementById("form-pw")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pwAtual = document.getElementById("pw-atual").value;
        const pwNova = document.getElementById("pw-nova").value;
        const pwConfirma = document.getElementById("pw-confirma").value;

        msgPw.style.display = "none";

        if (pwNova.length < 8 || !/[A-Z]/.test(pwNova) || !/\d/.test(pwNova)) {
            msgPw.textContent = "A nova password precisa de ter pelo menos 8 caracteres, uma maiuscula e um numero.";
            msgPw.className = "login-erro";
            msgPw.style.display = "";
            return;
        }
        if (pwNova !== pwConfirma) {
            msgPw.textContent = "As passwords nao coincidem.";
            msgPw.className = "login-erro";
            msgPw.style.display = "";
            return;
        }

        try {
            const res = await window.api.put("/auth/alterar-password", { pw_atual: pwAtual, pw_nova: pwNova });
            msgPw.textContent = res?.mensagem || "Enviámos um email de confirmação. Clique no link para concluir.";
            msgPw.className = "perfil-msg perfil-msg--ok";
            msgPw.style.display = "block";
            document.getElementById("form-pw").reset();
        } catch (err) {
            msgPw.textContent = err.message || "Não foi possível alterar a password.";
            msgPw.className = "perfil-msg perfil-msg--err";
            msgPw.style.display = "block";
        }
    });

})();
