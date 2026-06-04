
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const estadoChipAtivo = () =>
        document.querySelector("#chips-estado .filtro-chip.ativo")?.dataset.estado || "";

    document.querySelectorAll("#chips-estado .filtro-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#chips-estado .filtro-chip").forEach((c) => c.classList.remove("ativo"));
            chip.classList.add("ativo");
            aplicarFiltros();
        });
    });

    function skeletonTabela(cols, linhas) {
        const widths = [70, 50, 45, 45, 35, 25];
        return Array(linhas).fill(0).map(() =>
            `<tr>${Array(cols).fill(0).map((_, i) =>
                `<td><span class="sk-cel" style="width:${widths[i] || 60}%;"></span></td>`
            ).join("")}</tr>`
        ).join("");
    }

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
            const cancelada  = r.status === 0;
            const clsLinha   = cancelada ? "tr--cancelada" : "tr--aprovada";
            return `
            <tr class="${clsLinha}">
                <td>
                    <strong>${nomeCondomino}</strong>
                    <div style="font-size:var(--tam-xs);color:var(--cor-texto-suave);margin-top:2px;">${apt}</div>
                </td>
                <td>${nomeEspaco}</td>
                <td>${fmtData(r.data_inicio)}</td>
                <td>${fmtData(r.data_fim)}</td>
                <td>${fmtEur(r.preco_total)}</td>
                <td class="app-tabela__acoes">
                    ${!cancelada ? `<button class="perigo" data-acao="cancelar" data-id="${r.id}">Cancelar</button>` : `<span style="font-size:12px;color:var(--cor-texto-suave);">Cancelada</span>`}
                </td>
            </tr>`;
        }).join("");
    }

    function aplicarFiltros() {
        const termo  = (document.querySelector("[data-pesquisa]")?.value || "").toLowerCase().trim();
        const estado = estadoChipAtivo();
        let lista = [...dados];
        if (termo) lista = lista.filter((r) =>
            (r.condomino?.nome    || "").toLowerCase().includes(termo) ||
            (r.espaco?.nome       || "").toLowerCase().includes(termo) ||
            String(r.id_condomino).includes(termo) ||
            String(r.id_espaco).includes(termo)
        );
        if (estado === "cancelada") lista = lista.filter((r) => r.status === 0);
        else if (estado === "ativa") lista = lista.filter((r) => r.status !== 0);
        renderizar(lista);
    }

    async function carregar() {
        const tbody = document.querySelector('[data-tabela="reservas"]');
        tbody.innerHTML = skeletonTabela(6, 4);
        try {
            dados = await window.api.get("/alugueres-espaco");
            aplicarFiltros();
        } catch (e) {
            tbody.innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", aplicarFiltros);

    document.querySelector('[data-tabela="reservas"]')?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn || btn.dataset.acao !== "cancelar") return;
        const id = parseInt(btn.dataset.id);
        const ok = await window.confirmar("Tem a certeza que quer cancelar esta reserva?", {
            confirmar: "Cancelar reserva", cancelar: "Manter"
        });
        if (!ok) return;
        btn.disabled = true;
        try {
            await window.api.delete(`/alugueres-espaco/${id}`);
            await carregar();
        } catch { btn.disabled = false; }
    });

})();
