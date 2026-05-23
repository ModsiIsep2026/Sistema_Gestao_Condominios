
(async function () {

    // Aguardar app.js terminar
    for (let i = 0; i < 50 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }

    const tipo      = window.tipoAtual;
    const conteudo  = document.getElementById("dashboard-conteudo");
    const rotulo    = document.querySelector('[data-rotulo="dashboard"]');

    if (tipo === "admin") {
        if (rotulo) rotulo.textContent = "Visão geral da plataforma.";
        await renderizarAdmin();
    } else if (tipo === "gestor") {
        if (rotulo) rotulo.textContent = "Vista geral dos edifícios que gere.";
        await renderizarGestor();
    } else if (tipo === "tecnico") {
        if (rotulo) rotulo.textContent = "Avarias que lhe foram atribuídas.";
        await renderizarTecnico();
    }


    // ── Admin ─────────────────────────────────────────────────────────────────
    async function renderizarAdmin() {
        conteudo.innerHTML = `
            <div class="kpis" style="grid-template-columns: repeat(3, 1fr);">
                <div class="kpi">
                    <div class="kpi__rotulo">Edifícios</div>
                    <div class="kpi__valor" id="kpi-edificios">—</div>
                </div>
                <div class="kpi kpi--ok">
                    <div class="kpi__rotulo">Gestores</div>
                    <div class="kpi__valor" id="kpi-gestores">—</div>
                </div>
                <div class="kpi kpi--alerta">
                    <div class="kpi__rotulo">Parceiros</div>
                    <div class="kpi__valor" id="kpi-parceiros">—</div>
                </div>
            </div>

            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>Edifícios na plataforma</h2>
                    <a href="edificios.html" class="btn btn--outline">Ver todos</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead><tr><th>Morada</th><th>Cidade</th><th>Gestor</th></tr></thead>
                        <tbody id="tabela-edificios">
                            <tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

        try {
            const edificios = await window.api.get("/edificios/todos");
            set("kpi-edificios", edificios.length);
            const tbody = document.getElementById("tabela-edificios");
            if (!edificios.length) {
                tbody.innerHTML = `<tr><td colspan="3" class="app-vazio"><p>Sem edifícios.</p></td></tr>`;
            } else {
                tbody.innerHTML = edificios.slice(0, 10).map((e) => `
                    <tr>
                        <td><strong>${e.rua}</strong></td>
                        <td>${e.cidade || "—"}</td>
                        <td>${e.id_gestor}</td>
                    </tr>`).join("");
            }
        } catch { set("kpi-edificios", "0"); }

        try {
            const gestores = await window.api.get("/gestores");
            set("kpi-gestores", gestores.length);
        } catch { set("kpi-gestores", "0"); }

        try {
            const parceiros = await window.api.get("/parceiros");
            set("kpi-parceiros", parceiros.length);
        } catch { set("kpi-parceiros", "0"); }
    }


    // ── Gestor ────────────────────────────────────────────────────────────────
    async function renderizarGestor() {
        conteudo.innerHTML = `
            <div class="kpis">
                <div class="kpi">
                    <div class="kpi__rotulo">Edifícios</div>
                    <div class="kpi__valor" data-kpi="edificios">—</div>
                    <div class="kpi__sub">Sob gestão</div>
                </div>
                <div class="kpi kpi--ok">
                    <div class="kpi__rotulo">Pagamentos este mês</div>
                    <div class="kpi__valor" data-kpi="pagamentos-pagos">—</div>
                    <div class="kpi__sub">Estado pago</div>
                </div>
                <div class="kpi kpi--alerta">
                    <div class="kpi__rotulo">Pagamentos pendentes</div>
                    <div class="kpi__valor" data-kpi="pagamentos-pendentes">—</div>
                    <div class="kpi__sub">Por pagar</div>
                </div>
                <div class="kpi kpi--erro">
                    <div class="kpi__rotulo">Avarias abertas</div>
                    <div class="kpi__valor" data-kpi="avarias">—</div>
                    <div class="kpi__sub">A precisar de resolução</div>
                </div>
            </div>

            <div class="dois-paineis">
                <div class="painel">
                    <div class="painel__cabecalho">
                        <h2>Últimas avarias</h2>
                        <a href="avarias.html" class="btn btn--outline">Ver todas</a>
                    </div>
                    <div class="painel__corpo painel__corpo--sem-pad">
                        <table class="app-tabela">
                            <thead><tr><th>Data</th><th>Zona</th><th>Descrição</th></tr></thead>
                            <tbody data-tabela="avarias-recentes">
                                <tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="painel">
                    <div class="painel__cabecalho">
                        <h2>Últimos pagamentos</h2>
                        <a href="quotas.html" class="btn btn--outline">Ver todos</a>
                    </div>
                    <div class="painel__corpo painel__corpo--sem-pad">
                        <table class="app-tabela">
                            <thead><tr><th>Mês</th><th>Valor</th><th>Estado</th></tr></thead>
                            <tbody data-tabela="pagamentos-recentes">
                                <tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;

        const setKpi = (n, v) => {
            const el = document.querySelector(`[data-kpi="${n}"]`);
            if (el) el.textContent = v;
        };
        const fmtData = (iso) => iso
            ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
            : "—";
        const fmtEur = (v) => v != null
            ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
            : "—";

        try {
            const edificios = await window.api.get("/edificios");
            setKpi("edificios", edificios.length);
        } catch { setKpi("edificios", "0"); }

        try {
            const pagamentos = await window.api.get("/pagamentos/gestor");
            const pagos     = pagamentos.filter((p) => p.estado === 1);
            const pendentes = pagamentos.filter((p) => p.estado === 0);
            setKpi("pagamentos-pagos",     pagos.length);
            setKpi("pagamentos-pendentes", pendentes.length);

            const recentes = [...pagamentos].reverse().slice(0, 5);
            document.querySelector('[data-tabela="pagamentos-recentes"]').innerHTML =
                recentes.length
                    ? recentes.map((p) => `
                        <tr>
                            <td>${p.mes}</td>
                            <td>${fmtEur(p.valor)}</td>
                            <td>${p.estado === 1
                                ? '<span class="estado estado--ok">Pago</span>'
                                : '<span class="estado estado--alerta">Pendente</span>'}</td>
                        </tr>`).join("")
                    : `<tr><td colspan="3" class="app-vazio"><p>Sem pagamentos.</p></td></tr>`;
        } catch {
            setKpi("pagamentos-pagos", "0");
            setKpi("pagamentos-pendentes", "0");
        }

        // Avarias — tenta o primeiro edifício para mostrar algo no dashboard
        try {
            const edificios = await window.api.get("/edificios");
            if (edificios.length) {
                const avarias = await window.api.get(`/avarias?id_edificio=${edificios[0].id}`);
                setKpi("avarias", avarias.length);
                document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
                    avarias.length
                        ? avarias.slice(-5).reverse().map((a) => `
                            <tr>
                                <td>${fmtData(a.data_registo)}</td>
                                <td>${a.zona || "—"}</td>
                                <td>${(a.descricao || "").substring(0, 40)}</td>
                            </tr>`).join("")
                        : `<tr><td colspan="3" class="app-vazio"><p>Sem avarias.</p></td></tr>`;
            } else {
                setKpi("avarias", "0");
                document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
                    `<tr><td colspan="3" class="app-vazio"><p>Sem edifícios registados.</p></td></tr>`;
            }
        } catch { setKpi("avarias", "0"); }
    }


    // ── Técnico ───────────────────────────────────────────────────────────────
    async function renderizarTecnico() {
        conteudo.innerHTML = `
            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>As minhas avarias atribuídas</h2>
                    <a href="avarias.html" class="btn btn--outline">Ver todas</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead>
                            <tr><th>Data</th><th>Zona</th><th>Descrição</th><th>Estado resolução</th></tr>
                        </thead>
                        <tbody id="tabela-avarias-tecnico">
                            <tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;

        const fmtData = (iso) => iso
            ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
            : "—";

        try {
            const avarias = await window.api.get("/avarias/tecnico");
            const tbody   = document.getElementById("tabela-avarias-tecnico");
            if (!avarias.length) {
                tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem avarias atribuídas.</p></td></tr>`;
                return;
            }
            tbody.innerHTML = avarias.map((a) => {
                const resolvida = a.resolucao?.status === 1;
                return `
                    <tr>
                        <td>${fmtData(a.data_registo)}</td>
                        <td>${a.zona || "—"}</td>
                        <td>${(a.descricao || "").substring(0, 50)}</td>
                        <td>${resolvida
                            ? '<span class="estado estado--ok">Resolvida</span>'
                            : '<span class="estado estado--alerta">Pendente</span>'}</td>
                    </tr>`;
            }).join("");
        } catch (e) {
            document.getElementById("tabela-avarias-tecnico").innerHTML =
                `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

})();
