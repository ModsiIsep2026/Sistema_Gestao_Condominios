
// Pagamentos — gestor vê todos os seus edifícios
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
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem pagamentos</h3>
                        <p>Ainda não foram gerados pagamentos.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((p) => `
            <tr>
                <td>Apt. ${p.id_apartamento}</td>
                <td>${p.mes}</td>
                <td>${fmtEur(p.valor)}</td>
                <td>${p.estado === 1
                    ? '<span class="estado estado--ok">Pago</span>'
                    : '<span class="estado estado--alerta">Pendente</span>'}</td>
                <td>${p.data_p
                    ? new Date(p.data_p).toLocaleDateString("pt-PT")
                    : "—"}</td>
            </tr>`).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/pagamentos/gestor");
            renderizar(dados);
            atualizarResumo(dados);
        } catch (e) {
            document.querySelector('[data-tabela="quotas"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    function atualizarResumo(lista) {
        const total    = lista.length;
        const pagos    = lista.filter((p) => p.estado === 1).length;
        const pendentes = total - pagos;
        const montante = lista.filter((p) => p.estado === 1).reduce((s, p) => s + parseFloat(p.valor), 0);

        const elTotal    = document.getElementById("resumo-total");
        const elPagos    = document.getElementById("resumo-pagos");
        const elPendentes = document.getElementById("resumo-pendentes");
        const elMontante = document.getElementById("resumo-montante");

        if (elTotal)     elTotal.textContent    = total;
        if (elPagos)     elPagos.textContent    = pagos;
        if (elPendentes) elPendentes.textContent = pendentes;
        if (elMontante)  elMontante.textContent  = fmtEur(montante);
    }

    await carregar();

    // Filtros
    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((p) =>
            p.mes.includes(termo) ||
            String(p.id_apartamento).includes(termo)
        ));
    });

    document.getElementById("filtro-estado")?.addEventListener("change", (e) => {
        const v = e.target.value;
        if (!v) return renderizar(dados);
        const estado = v === "pago" ? 1 : 0;
        renderizar(dados.filter((p) => p.estado === estado));
    });

    // Gerar pagamento
    document.getElementById("btn-gerar")?.addEventListener("click", async () => {
        const idApt = parseInt(document.getElementById("g-apartamento")?.value);
        const mes   = document.getElementById("g-mes")?.value?.trim();
        if (!idApt || !mes) { alert("Indique o apartamento e o mês (YYYY-MM)."); return; }
        try {
            await window.api.post("/pagamentos", { id_apartamento: idApt, mes });
            await carregar();
        } catch (e) { alert(e.message); }
    });

})();
