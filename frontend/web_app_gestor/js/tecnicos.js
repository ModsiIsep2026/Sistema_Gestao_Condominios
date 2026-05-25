
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
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h3>Sem técnicos</h3>
                        <p>${filtroEstado === "ativos" ? "Adicione o primeiro técnico à equipa." : "Sem registos para este filtro."}</p>
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

  
    const modal    = document.getElementById("modal-tecnico");
    const erroModal = document.getElementById("erro-tecnico");

    function abrirModal() {
        erroModal.style.display = "none";
        document.getElementById("form-tecnico").reset();
        modal.removeAttribute("hidden");
    }
    function fecharModal() { modal.setAttribute("hidden", ""); }

    document.getElementById("btn-novo-tecnico").addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-criar-tecnico").addEventListener("click", async () => {
        erroModal.style.display = "none";

        const nome   = document.getElementById("t-nome").value.trim();
        const funcao = document.getElementById("t-funcao").value.trim() || null;
        const email  = document.getElementById("t-email").value.trim();

        if (!nome)  { erroModal.textContent = "Indique o nome.";  erroModal.style.display = ""; return; }
        if (!email) { erroModal.textContent = "Indique o email."; erroModal.style.display = ""; return; }

        const btn = document.getElementById("btn-criar-tecnico");
        btn.disabled = true;
        btn.textContent = "A adicionar...";
        try {
            await window.api.post("/tecnicos", { nome, funcao, email });
            fecharModal();
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível criar o técnico.";
            erroModal.style.display = "";
        } finally {
            btn.disabled = false;
            btn.textContent = "Adicionar";
        }
    });


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
            btn.disabled = false;
        }
    });

})();
