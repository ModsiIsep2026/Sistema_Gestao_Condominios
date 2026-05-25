
(async function () {

    for (let i = 0; i < 50 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }

    const conteudo = document.getElementById("dashboard-conteudo");
    const rotulo   = document.querySelector('[data-rotulo="dashboard"]');
    if (rotulo) rotulo.textContent = "Vista geral dos edifícios que gere.";

    // Skeleton inicial
    conteudo.innerHTML = `
        <div class="kpis" id="kpis-dash" style="grid-template-columns:repeat(4,1fr);">
            <div class="kpi"><div class="skeleton skeleton-kpi"></div></div>
            <div class="kpi"><div class="skeleton skeleton-kpi"></div></div>
            <div class="kpi"><div class="skeleton skeleton-kpi"></div></div>
            <div class="kpi"><div class="skeleton skeleton-kpi"></div></div>
        </div>
        <div class="painel" style="margin-bottom:var(--esp-5);">
            <div class="painel__cabecalho"><h2>Edifícios</h2><a href="edificios.html" class="btn btn--outline">Ver todos</a></div>
            <div class="painel__corpo" id="painel-edificios-cards">
                <div class="skeleton skeleton-linha" style="width:80%;"></div>
                <div class="skeleton skeleton-linha" style="width:60%;"></div>
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
                            <tr><td colspan="3"><div class="skeleton skeleton-linha"></div></td></tr>
                            <tr><td colspan="3"><div class="skeleton skeleton-linha"></div></td></tr>
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
                            <tr><td colspan="3"><div class="skeleton skeleton-linha"></div></td></tr>
                            <tr><td colspan="3"><div class="skeleton skeleton-linha"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

    // Aguarda render
    await new Promise((r) => requestAnimationFrame(r));

    // Substitui KPIs reais
    document.getElementById("kpis-dash").innerHTML = `
        <div class="kpi">
            <div class="kpi__rotulo">Edifícios</div>
            <div class="kpi__valor" data-kpi="edificios">—</div>
        </div>
        <div class="kpi kpi--ok">
            <div class="kpi__rotulo">Pagamentos realizados</div>
            <div class="kpi__valor" data-kpi="pagamentos-pagos">—</div>
        </div>
        <div class="kpi kpi--alerta">
            <div class="kpi__rotulo">Pagamentos pendentes</div>
            <div class="kpi__valor" data-kpi="pagamentos-pendentes">—</div>
        </div>
        <div class="kpi kpi--erro">
            <div class="kpi__rotulo">Avarias abertas</div>
            <div class="kpi__valor" data-kpi="avarias">—</div>
        </div>`;

    const setKpi = (n, v) => {
        const el = document.querySelector(`[data-kpi="${n}"]`);
        if (el) {
            const num = parseInt(v, 10);
            if (!isNaN(num) && window.countUp) {
                window.countUp(el, num, 600);
            } else {
                el.textContent = v;
            }
        }
    };
    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
        : "—";
    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    // Mapa para guardar avarias e pagamentos por edifício (para os cards)
    const avPorEdificio = {};
    const pagPorEdificio = {};

    let todosEdificios = [];
    let todosPagamentos = [];

    try {
        todosEdificios = await window.api.get("/edificios");
        setKpi("edificios", todosEdificios.length);
    } catch { setKpi("edificios", "0"); }

    try {
        todosPagamentos = await window.api.get("/pagamentos/gestor");
        const pagos     = todosPagamentos.filter((p) => p.estado === 1);
        const pendentes = todosPagamentos.filter((p) => p.estado === 0);
        setKpi("pagamentos-pagos",     pagos.length);
        setKpi("pagamentos-pendentes", pendentes.length);

        const recentes = [...todosPagamentos].reverse().slice(0, 5);
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
                : `<tr><td colspan="3"><div class="app-vazio"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 8px;display:block;"><path d="M19 6a8 8 0 1 0 0 12"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="2" y1="14" x2="14" y2="14"/></svg><p>Sem pagamentos registados.</p></div></td></tr>`;
    } catch {
        setKpi("pagamentos-pagos", "0");
        setKpi("pagamentos-pendentes", "0");
        document.querySelector('[data-tabela="pagamentos-recentes"]').innerHTML =
            `<tr><td colspan="3"><div class="app-vazio"><p>Sem pagamentos.</p></div></td></tr>`;
    }

    // Carregar avarias do primeiro edifício (tabela recentes) e dados para cards
    try {
        if (todosEdificios.length) {
            // Avarias do primeiro edifício para a tabela recente
            const avarias = await window.api.get(`/avarias?id_edificio=${todosEdificios[0].id}`);
            setKpi("avarias", avarias.length);
            avPorEdificio[todosEdificios[0].id] = avarias;

            document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
                avarias.length
                    ? avarias.slice(-5).reverse().map((a) => `
                        <tr>
                            <td>${fmtData(a.data_registo)}</td>
                            <td>${a.zona || "—"}</td>
                            <td>${(a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim().substring(0, 40) || "—"}</td>
                        </tr>`).join("")
                    : `<tr><td colspan="3"><div class="app-vazio"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 8px;display:block;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><p>Sem ocorrências registadas. Bom trabalho!</p></div></td></tr>`;

            // Carregar avarias + apartamentos para todos os edifícios em paralelo (para cards de saúde)
            // Mapa id_apartamento → id_edificio (necessário porque /pagamentos/gestor não inclui id_edificio)
            const aptEdMap = {};

            await Promise.all(todosEdificios.map(async (ed) => {
                // Avarias (já carregadas para o primeiro)
                if (avPorEdificio[ed.id] === undefined) {
                    try {
                        avPorEdificio[ed.id] = await window.api.get(`/avarias?id_edificio=${ed.id}`);
                    } catch { avPorEdificio[ed.id] = []; }
                }
                // Apartamentos para construir o mapa apt→edificio
                try {
                    const apts = await window.api.get(`/apartamentos?id_edificio=${ed.id}`);
                    apts.forEach((a) => { aptEdMap[a.id] = ed.id; });
                } catch { /* continuar mesmo sem apartamentos */ }
            }));

            // Calcular pagamentos pendentes por edifício usando o mapa de apartamentos
            todosEdificios.forEach((ed) => {
                pagPorEdificio[ed.id] = todosPagamentos.filter((p) =>
                    aptEdMap[p.id_apartamento] === ed.id && p.estado === 0
                );
            });

            // Renderizar cards
            const painelCards = document.getElementById("painel-edificios-cards");
            if (painelCards) {
                painelCards.innerHTML = `<div class="edificios-grid">` +
                    todosEdificios.map((ed) => {
                        const avariasEd   = avPorEdificio[ed.id] || [];
                        const abertas     = avariasEd.filter((a) => !a.resolucao || a.resolucao.status !== 1).length;
                        const pendentesEd = (pagPorEdificio[ed.id] || []).length;

                        let cor = "verde";
                        if (abertas >= 3 || pendentesEd > 5) cor = "vermelho";
                        else if (abertas >= 1 || pendentesEd > 0) cor = "amarelo";

                        return `
                            <div class="edificio-card">
                                <div class="edificio-card__cabecalho">
                                    <div>
                                        <div class="edificio-card__nome">${ed.rua}</div>
                                        <div class="edificio-card__cidade">${ed.cidade || "—"}</div>
                                    </div>
                                    <div class="edificio-card__saude edificio-card__saude--${cor}" title="Saúde: ${cor}"></div>
                                </div>
                                <div class="edificio-card__barra edificio-card__barra--${cor}">
                                    <div class="edificio-card__barra-fill"></div>
                                </div>
                                <div class="edificio-card__metricas">
                                    <div class="edificio-card__metrica edificio-card__metrica--avarias">
                                        <span class="edificio-card__metrica-valor">${abertas}</span>
                                        <span class="edificio-card__metrica-rotulo">Avarias abertas</span>
                                    </div>
                                    <div class="edificio-card__metrica edificio-card__metrica--quotas">
                                        <span class="edificio-card__metrica-valor">${pendentesEd}</span>
                                        <span class="edificio-card__metrica-rotulo">Quotas pendentes</span>
                                    </div>
                                </div>
                            </div>`;
                    }).join("") +
                `</div>`;
            }
        } else {
            setKpi("avarias", "0");
            document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
                `<tr><td colspan="3"><div class="app-vazio"><p>Sem edifícios registados.</p></div></td></tr>`;
            const painelCards = document.getElementById("painel-edificios-cards");
            if (painelCards) {
                painelCards.innerHTML = `<div class="app-vazio"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg><h3>Sem edifícios</h3><p>Crie o primeiro edifício para começar.</p></div>`;
            }
        }
    } catch {
        setKpi("avarias", "0");
        document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
            `<tr><td colspan="3"><div class="app-vazio"><p>Sem avarias.</p></div></td></tr>`;
    }

})();
