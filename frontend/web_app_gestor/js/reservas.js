
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "—";
    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="reservas"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <h3>Sem reservas</h3>
                        <p>Nenhuma reserva encontrada para este período.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((r) => {
            const nomeCondomino = r.condomino?.nome || `#${r.id_condomino}`;
            const apt = r.condomino?.apartamento
                ? `Fração ${r.condomino.apartamento.fracao}${r.condomino.apartamento.andar != null ? ` · ${r.condomino.apartamento.andar}º andar` : ""}`
                : "—";
            const nomeEspaco = r.espaco?.nome || `#${r.id_espaco}`;
            return `
            <tr>
                <td>
                    <strong>${nomeCondomino}</strong>
                    <div style="font-size:var(--tam-xs);color:var(--cor-texto-suave);margin-top:2px;">${apt}</div>
                </td>
                <td>${nomeEspaco}</td>
                <td>${fmtData(r.data_inicio)}</td>
                <td>${fmtData(r.data_fim)}</td>
                <td>${fmtEur(r.preco_total)}</td>
                <td class="app-tabela__acoes">
                    <button class="perigo" data-acao="cancelar" data-id="${r.id}">Cancelar</button>
                </td>
            </tr>`;
        }).join("");
    }

    function aplicarFiltros() {
        const termo  = (document.querySelector("[data-pesquisa]")?.value || "").toLowerCase().trim();
        const estado = document.getElementById("filtro-estado")?.value || "";
        let lista = [...dados];
        if (termo) lista = lista.filter((r) =>
            (r.condomino?.nome    || "").toLowerCase().includes(termo) ||
            (r.espaco?.nome       || "").toLowerCase().includes(termo) ||
            String(r.id_condomino).includes(termo) ||
            String(r.id_espaco).includes(termo)
        );
        if (estado === "cancelada") lista = lista.filter((r) => r.status === 0);
        else if (estado) lista = lista.filter((r) => r.status !== 0);
        renderizar(lista);
    }

    async function carregar() {
        try {
            dados = await window.api.get("/alugueres-espaco");
            aplicarFiltros();
        } catch (e) {
            document.querySelector('[data-tabela="reservas"]').innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-estado")?.addEventListener("change", aplicarFiltros);

    document.querySelector('[data-tabela="reservas"]')?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn || btn.dataset.acao !== "cancelar") return;
        const id = parseInt(btn.dataset.id);
        btn.disabled = true;
        try {
            await window.api.delete(`/alugueres-espaco/${id}`);
            await carregar();
        } catch { btn.disabled = false; }
    });

})();
