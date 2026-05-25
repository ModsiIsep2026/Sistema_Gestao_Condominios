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
    if (inputNome) inputNome.value = u.nome || "";
    if (inputEmail) inputEmail.value = u.email || "";
    if (inputTelemovel) inputTelemovel.value = telReal;

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

            msgPerfil.textContent = "Alteracoes guardadas com sucesso.";
            msgPerfil.className = "login-sucesso";
            msgPerfil.style.display = "";
            setTimeout(() => { msgPerfil.style.display = "none"; }, 3000);
        } catch (err) {
            msgPerfil.textContent = err.message || "Nao foi possivel guardar as alteracoes.";
            msgPerfil.className = "login-erro";
            msgPerfil.style.display = "";
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
            msgPw.textContent = res?.mensagem || "Enviamos um email de confirmacao. Clique no link para concluir.";
            msgPw.className = "login-sucesso";
            msgPw.style.display = "";
            document.getElementById("form-pw").reset();
        } catch (err) {
            msgPw.textContent = err.message || "Nao foi possivel alterar a password.";
            msgPw.className = "login-erro";
            msgPw.style.display = "";
        }
    });

})();
