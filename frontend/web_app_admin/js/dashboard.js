(async function () {

    for (let i = 0; i < 50 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }

    const conteudo = document.getElementById("dashboard-conteudo");
    const rotulo = document.querySelector('[data-rotulo="dashboard"]');
    if (rotulo) rotulo.textContent = "Visão geral da plataforma.";

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

        <div class="painel" style="border-left: 4px solid var(--cor-acento);">
            <div class="painel__corpo" style="display:flex;align-items:center;justify-content:space-between;gap:var(--esp-4);">
                <div>
                    <div style="font-weight:700;font-size:var(--tam-base);margin-bottom:4px;">Análise de Adesões</div>
                    <div style="color:var(--cor-texto-suave);font-size:var(--tam-sm);">Veja quantos gestores aderiram por período na página dedicada.</div>
                </div>
                <a href="adesoes.html" class="btn btn--primario" style="white-space:nowrap;">Ver análise</a>
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

    const set = (id, valor) => {
        const el = document.getElementById(id);
        if (!el) return;
        const num = parseInt(valor, 10);
        if (!isNaN(num) && window.countUp) {
            window.countUp(el, num, 600);
        } else {
            el.textContent = valor;
        }
    };

    let gestoresMap = {};
    try {
        const [edificios, gestores] = await Promise.all([
            window.api.get("/edificios/todos"),
            window.api.get("/gestores"),
        ]);

        gestores.forEach((g) => { gestoresMap[g.id] = g.nome; });
        set("kpi-edificios", edificios.length);
        set("kpi-gestores", gestores.length);

        const tbody = document.getElementById("tabela-edificios");
        if (!edificios.length) {
            tbody.innerHTML = `<tr><td colspan="3"><div class="app-vazio"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg><h3>Sem edifícios</h3><p>Ainda não existem edifícios registados na plataforma.</p></div></td></tr>`;
        } else {
            tbody.innerHTML = edificios.slice(0, 10).map((e) => `
                <tr>
                    <td><strong>${e.rua}</strong></td>
                    <td>${e.cidade || "—"}</td>
                    <td>${gestoresMap[e.id_gestor] || "—"}</td>
                </tr>`).join("");
        }
    } catch {
        set("kpi-edificios", "0");
        set("kpi-gestores", "0");
    }

    try {
        const parceiros = await window.api.get("/parceiros");
        set("kpi-parceiros", parceiros.length);
    } catch {
        set("kpi-parceiros", "0");
    }

})();
