
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="quotas"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M19 6a8 8 0 1 0 0 12"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="2" y1="14" x2="14" y2="14"/></svg>
                        <h3>Sem quotas</h3>
                        <p>Não há quotas registadas para o seu apartamento de momento.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((q) => {
            const paga = q.estado === 1;
            return `
                <tr>
                    <td>${q.mes}</td>
                    <td>${fmtEur(q.valor)}</td>
                    <td>${paga
                        ? `<span class="estado estado--ok">Paga</span>`
                        : `<span class="estado estado--alerta">Pendente</span>`}</td>
                    <td class="app-tabela__acoes">
                        ${paga ? "" : `<button data-acao="pagar" data-id="${q.id}">Pagar agora</button>`}
                    </td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/pagamentos/condominio");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="quotas"]').innerHTML =
                `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((q) => q.mes.includes(termo)));
    });

    document.getElementById("filtro-estado")?.addEventListener("change", (e) => {
        const v = e.target.value;
        if (!v) return renderizar(dados);
        renderizar(dados.filter((q) => q.estado === (v === "pago" ? 1 : 0)));
    });

    document.querySelector('[data-tabela="quotas"]')?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn || btn.dataset.acao !== "pagar") return;
        const id = parseInt(btn.dataset.id);
        btn.disabled    = true;
        btn.textContent = "A processar...";
        try {
            await window.api.post(`/pagamentos/${id}/pagar`);
            await carregar();
        } catch (err) {
            btn.disabled    = false;
            btn.textContent = "Pagar agora";
        }
    });

})();
