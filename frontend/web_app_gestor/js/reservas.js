
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
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem reservas</h3>
                        <p>Ainda não existem reservas de espaços.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((r) => `
            <tr>
                <td>${r.id_condomino}</td>
                <td>${r.id_espaco}</td>
                <td>${fmtData(r.data_inicio)}</td>
                <td>${fmtData(r.data_fim)}</td>
                <td>${fmtEur(r.preco_total)}</td>
                <td class="app-tabela__acoes">
                    <button class="perigo" data-acao="cancelar" data-id="${r.id}">Cancelar</button>
                </td>
            </tr>`).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/alugueres-espaco");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="reservas"]').innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((r) =>
            String(r.id_condomino).includes(termo) ||
            String(r.id_espaco).includes(termo)
        ));
    });

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
