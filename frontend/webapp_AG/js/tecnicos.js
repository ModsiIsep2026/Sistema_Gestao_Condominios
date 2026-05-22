(async function () {

    let dados = [];
    let filtroEstado = "ativos";
    let filtroPesquisa = "";

    function badge(status) {
        return status === 1
            ? `<span class="estado estado--ok">Ativo</span>`
            : `<span class="estado estado--erro">Inativo</span>`;
    }

    function aplicarFiltros() {
        return dados.filter((u) => {
            if (filtroEstado === "ativos"   && u.status !== 1) return false;
            if (filtroEstado === "inativos" && u.status !== 0) return false;
            if (filtroPesquisa) {
                const t = filtroPesquisa;
                if (!u.nome.toLowerCase().includes(t) && !u.email.toLowerCase().includes(t)) return false;
            }
            return true;
        });
    }

    function renderizar() {
        const lista = aplicarFiltros();
        const tbody = document.querySelector('[data-tabela="tecnicos"]');

        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <h3>Sem técnicos</h3>
                        <p>${filtroEstado === "ativos" ? "Adicione o primeiro técnico para começar." : "Sem registos para este filtro."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((u) => {
            const ativo = u.status === 1;
            const btnEstado = ativo
                ? `<button class="perigo" data-acao="desativar" data-id="${u.id_utilizador}">Desativar</button>`
                : `<button data-acao="ativar" data-id="${u.id_utilizador}">Ativar</button>`;
            return `
                <tr style="${ativo ? "" : "opacity:0.55;"}">
                    <td><strong>${u.nome}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.telemovel || "—"}</td>
                    <td>${u.nif || "—"}</td>
                    <td>${badge(u.status)}</td>
                    <td class="app-tabela__acoes">${btnEstado}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            const todos = await window.api.get("/utilizadores?incluir_inativos=true");
            dados = todos.filter((u) => u.perfil_id === 4);
            renderizar();
        } catch (e) {
            document.querySelector('[data-tabela="tecnicos"]').innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        filtroPesquisa = e.target.value.toLowerCase().trim();
        renderizar();
    });

    document.getElementById("filtro-estado")?.addEventListener("change", (e) => {
        filtroEstado = e.target.value;
        renderizar();
    });

    // ── Modal ──────────────────────────────────────────────────────────────
    const modal    = document.getElementById("modal-tecnico");
    const erroModal = document.getElementById("erro-tecnico");

    function abrirModal() {
        erroModal.hidden = true;
        document.getElementById("form-tecnico").reset();
        modal.hidden = false;
    }
    function fecharModal() { modal.hidden = true; }

    document.getElementById("btn-novo-tecnico").addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-criar-tecnico").addEventListener("click", async () => {
        erroModal.hidden = true;

        const nome     = document.getElementById("t-nome").value.trim();
        const email    = document.getElementById("t-email").value.trim();
        const telemovel = document.getElementById("t-telemovel").value.trim() || null;
        const nif      = document.getElementById("t-nif").value.trim() || null;

        if (!nome || nome.length < 2) {
            erroModal.textContent = "Indique o nome completo.";
            erroModal.hidden = false; return;
        }
        if (!email) {
            erroModal.textContent = "Indique o email.";
            erroModal.hidden = false; return;
        }
        if (nif && !/^\d{9}$/.test(nif)) {
            erroModal.textContent = "O NIF tem de ter 9 dígitos.";
            erroModal.hidden = false; return;
        }

        try {
            const resultado = await window.api.post("/utilizadores/convidar", {
                nome, email, telemovel, nif, lingua: "pt", perfil_id: 4,
            });
            fecharModal();
            if (resultado.aviso_email) {
                alert(`Conta criada para ${email}.\n\n⚠️ ${resultado.aviso_email}\n\nPassword temporária: ${resultado.password_temporaria}`);
            } else {
                alert(`Técnico adicionado. Foi enviado um email para ${email} com as credenciais.`);
            }
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível adicionar o técnico.";
            erroModal.hidden = false;
        }
    });

    // ── Ativar / Desativar ─────────────────────────────────────────────────
    document.querySelector('[data-tabela="tecnicos"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        const novoStatus = btn.dataset.acao === "ativar" ? 1 : 0;
        btn.disabled = true;
        try {
            await window.api.put(`/utilizadores/${id}`, { status: novoStatus });
            await carregar();
        } catch (err) {
            alert(err.message);
            btn.disabled = false;
        }
    });

})();
