(async function () {

    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    if (window.tipoAtual !== "admin") {
        window.location.replace("index.html");
        return;
    }

    let dados          = [];
    let filtroEstado   = "ativos";
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
        const tbody = document.querySelector('[data-tabela="gestores-ver"]');

        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <h3>Sem gestores</h3>
                        <p>${filtroEstado === "ativos" ? "Nenhum gestor ativo de momento." : "Sem registos para este filtro."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((u) => {
            const ativo     = u.status === 1;
            const btnEstado = ativo
                ? `<button class="perigo" data-acao="desativar" data-id="${u.id}">Desativar</button>`
                : `<button data-acao="ativar" data-id="${u.id}">Ativar</button>`;
            return `
                <tr style="${ativo ? "" : "opacity:0.55;"}">
                    <td><strong>${u.nome}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.telemovel || "—"}</td>
                    <td>${u.empresa || "—"}</td>
                    <td>${badge(u.status)}</td>
                    <td class="app-tabela__acoes">${btnEstado}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/gestores");
            renderizar();
        } catch (e) {
            document.querySelector('[data-tabela="gestores-ver"]').innerHTML =
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

    document.querySelector('[data-tabela="gestores-ver"]').addEventListener("click", async (e) => {
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
