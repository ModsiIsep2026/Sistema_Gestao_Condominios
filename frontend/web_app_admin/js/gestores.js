
(async function () {

    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    if (window.tipoAtual !== "admin") {
        window.location.replace("index.html");
        return;
    }

    let dados          = [];
    let filtroEstado   = "todos";
    let filtroPesquisa = "";

    function badge(status) {
        return status === 1
            ? `<span class="estado estado--ok">Ativo</span>`
            : `<span class="estado estado--erro">Inativo</span>`;
    }

    function formatarData(iso) {
        if (!iso) return "—";
        const [ano, mes, dia] = iso.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function badgeValidade(dataFim, status) {
        if (!dataFim) return "—";
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fim  = new Date(dataFim);
        const dias = Math.ceil((fim - hoje) / 86400000);
        if (status !== 1) return `<span style="color:var(--cor-erro);">${formatarData(dataFim)}</span>`;
        if (dias <= 15)   return `<span style="color:#d97706;font-weight:600;">${formatarData(dataFim)} <small>(${dias}d)</small></span>`;
        return formatarData(dataFim);
    }

    function aplicarFiltros() {
        return dados.filter((g) => {
            if (filtroEstado === "ativos"   && g.status !== 1) return false;
            if (filtroEstado === "inativos" && g.status !== 0) return false;
            if (filtroPesquisa) {
                const t = filtroPesquisa;
                if (!(g.nome  || "").toLowerCase().includes(t) &&
                    !(g.email || "").toLowerCase().includes(t)) return false;
            }
            return true;
        });
    }

    function renderizar() {
        const lista = aplicarFiltros();
        const tbody = document.querySelector('[data-tabela="gestores"]');

        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <h3>Sem gestores</h3>
                        <p>${filtroEstado === "ativos" ? "Nenhum gestor ativo." : "Sem registos para este filtro."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((g) => {
            const ativo = g.status === 1;
            return `
                <tr style="${ativo ? "" : "opacity:0.45;"}">
                    <td><strong>${g.nome}</strong></td>
                    <td>${g.empresa || "—"}</td>
                    <td>${g.email}</td>
                    <td>${g.telemovel || "—"}</td>
                    <td>${badgeValidade(g.data_fim, g.status)}</td>
                    <td>${badge(g.status)}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/gestores");
            renderizar();
        } catch (e) {
            document.querySelector('[data-tabela="gestores"]').innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro ao carregar: ${e.message}</p></td></tr>`;
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

    document.querySelector('[data-tabela="gestores"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id         = parseInt(btn.dataset.id);
        const novoStatus = btn.dataset.acao === "ativar" ? 1 : 0;
        btn.disabled = true;
        try {
            await window.api.put(`/gestores/${id}`, { status: novoStatus });
            await carregar();
        } catch {
            btn.disabled = false;
        }
    });

})();
