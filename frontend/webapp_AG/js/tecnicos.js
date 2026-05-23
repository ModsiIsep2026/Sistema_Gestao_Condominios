
(async function () {

    let dados          = [];
    let filtroEstado   = "ativos";
    let filtroPesquisa = "";

    function badge(status) {
        return status === 1
            ? `<span class="estado estado--ok">Ativo</span>`
            : `<span class="estado estado--erro">Inativo</span>`;
    }

    function aplicarFiltros() {
        return dados.filter((t) => {
            if (filtroEstado === "ativos"   && t.status !== 1) return false;
            if (filtroEstado === "inativos" && t.status !== 0) return false;
            if (filtroPesquisa) {
                const term = filtroPesquisa;
                if (!(t.nome  || "").toLowerCase().includes(term) &&
                    !(t.email || "").toLowerCase().includes(term)) return false;
            }
            return true;
        });
    }

    function renderizar() {
        const lista = aplicarFiltros();
        const tbody = document.querySelector('[data-tabela="tecnicos"]');

        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem técnicos</h3>
                        <p>${filtroEstado === "ativos" ? "Adicione o primeiro técnico." : "Sem registos para este filtro."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((t) => {
            const ativo = t.status === 1;
            const btnEstado = ativo
                ? `<button class="perigo" data-acao="desativar" data-id="${t.id}">Desativar</button>`
                : `<button data-acao="ativar" data-id="${t.id}">Ativar</button>`;
            return `
                <tr style="${ativo ? "" : "opacity:0.55;"}">
                    <td><strong>${t.nome}</strong></td>
                    <td>${t.funcao || "—"}</td>
                    <td>${t.email}</td>
                    <td>${badge(t.status)}</td>
                    <td class="app-tabela__acoes">${btnEstado}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/tecnicos");
            renderizar();
        } catch (e) {
            document.querySelector('[data-tabela="tecnicos"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
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

    // ── Modal criar técnico ───────────────────────────────────────────────────
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

        const nome    = document.getElementById("t-nome").value.trim();
        const funcao  = document.getElementById("t-funcao").value.trim()  || null;
        const email   = document.getElementById("t-email").value.trim();
        const pw      = document.getElementById("t-pw").value.trim();

        if (!nome)  { erroModal.textContent = "Indique o nome.";    erroModal.hidden = false; return; }
        if (!email) { erroModal.textContent = "Indique o email.";   erroModal.hidden = false; return; }
        if (!pw)    { erroModal.textContent = "Defina uma password."; erroModal.hidden = false; return; }

        // id_gestor vem do token — o backend pega via verificar_g
        try {
            await window.api.post("/tecnicos", { nome, funcao, email, pw });
            fecharModal();
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível criar o técnico.";
            erroModal.hidden = false;
        }
    });

    // ── Ativar / Desativar ────────────────────────────────────────────────────
    document.querySelector('[data-tabela="tecnicos"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id        = parseInt(btn.dataset.id);
        const novoStatus = btn.dataset.acao === "ativar" ? 1 : 0;
        btn.disabled = true;
        try {
            await window.api.put(`/tecnicos/${id}`, { status: novoStatus });
            await carregar();
        } catch (err) {
            alert(err.message);
            btn.disabled = false;
        }
    });

})();
