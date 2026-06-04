
(async function () {

    await new Promise((r) => setTimeout(r, 150));

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    const u = window.utilizadorAtual || {};
    const primeiroNome = (u.nome || "").split(" ")[0] || "Bem-vindo";
    const apt = u.apartamento;
    const aptTx = apt ? `Fração ${apt.fracao}${apt.andar != null ? " · " + apt.andar + "º andar" : ""}` : null;
    const edifTx = apt?.edificio?.rua || null;

    const conteudo = document.getElementById("dashboard-conteudo");
    conteudo.innerHTML = `
        <div style="background:linear-gradient(130deg,#0B2240 0%,#1A3D6B 100%);border-radius:12px;padding:28px 32px;margin-bottom:28px;display:flex;align-items:center;gap:20px;position:relative;overflow:hidden;">
            <div style="position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,0.05);pointer-events:none;"></div>
            <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0;">
                ${primeiroNome[0].toUpperCase()}
            </div>
            <div style="position:relative;z-index:1;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,0.5);margin-bottom:4px;">Bem-vindo de volta</div>
                <div style="font-size:22px;font-weight:800;color:#fff;line-height:1.2;">${primeiroNome}</div>
                ${aptTx || edifTx ? `<div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:4px;">${[aptTx, edifTx].filter(Boolean).join(" · ")}</div>` : ""}
            </div>
        </div>
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
