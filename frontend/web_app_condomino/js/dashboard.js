
(async function () {

    await new Promise((r) => setTimeout(r, 150));

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    const conteudo = document.getElementById("dashboard-conteudo");
    conteudo.innerHTML = `
        <div class="kpis" style="grid-template-columns: repeat(3, 1fr);">
            <div class="kpi">
                <div class="kpi__rotulo">Quotas em aberto</div>
                <div class="kpi__valor" id="kpi-pendentes">—</div>
            </div>
            <div class="kpi kpi--ok">
                <div class="kpi__rotulo">Quotas pagas</div>
                <div class="kpi__valor" id="kpi-pagas">—</div>
            </div>
            <div class="kpi kpi--alerta">
                <div class="kpi__rotulo">Avarias reportadas</div>
                <div class="kpi__valor" id="kpi-avarias">—</div>
            </div>
        </div>

        <div class="dois-paineis">
            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>As minhas quotas</h2>
                    <a href="quotas.html" class="btn btn--outline">Ver todas</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead><tr><th>Mês</th><th>Valor</th><th>Estado</th></tr></thead>
                        <tbody id="tabela-quotas">
                            <tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>Avarias reportadas</h2>
                    <a href="avarias.html" class="btn btn--outline">Reportar</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead><tr><th>Data</th><th>Zona</th><th>Estado</th></tr></thead>
                        <tbody id="tabela-avarias">
                            <tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
        : "—";

    try {
        const quotas = await window.api.get("/pagamentos/condominio");
        const pagos    = quotas.filter((q) => q.estado === 1);
        const pendentes = quotas.filter((q) => q.estado === 0);

        document.getElementById("kpi-pagas").textContent    = pagos.length;
        document.getElementById("kpi-pendentes").textContent = pendentes.length;

        const tbQuo = document.getElementById("tabela-quotas");
        tbQuo.innerHTML = quotas.length
            ? quotas.slice(-5).reverse().map((q) => `
                <tr>
                    <td>${q.mes}</td>
                    <td>${fmtEur(q.valor)}</td>
                    <td>${q.estado === 1
                        ? '<span class="estado estado--ok">Paga</span>'
                        : '<span class="estado estado--alerta">Pendente</span>'}</td>
                </tr>`).join("")
            : `<tr><td colspan="3" class="app-vazio"><p>Sem quotas.</p></td></tr>`;
    } catch {
        document.getElementById("kpi-pagas").textContent    = "0";
        document.getElementById("kpi-pendentes").textContent = "0";
    }

    try {
        const avarias = await window.api.get("/avarias/condomino");
        document.getElementById("kpi-avarias").textContent = avarias.length;

        const tbAv = document.getElementById("tabela-avarias");
        tbAv.innerHTML = avarias.length
            ? avarias.slice(-5).reverse().map((a) => `
                <tr>
                    <td>${fmtData(a.data_registo)}</td>
                    <td>${a.zona || "—"}</td>
                    <td>${a.resolucao?.status === 1
                        ? '<span class="estado estado--ok">Resolvida</span>'
                        : '<span class="estado estado--alerta">Aberta</span>'}</td>
                </tr>`).join("")
            : `<tr><td colspan="3" class="app-vazio"><p>Sem avarias reportadas.</p></td></tr>`;
    } catch {
        document.getElementById("kpi-avarias").textContent = "0";
    }

})();
