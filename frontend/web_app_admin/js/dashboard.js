
(async function () {

    for (let i = 0; i < 50 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }

    const conteudo = document.getElementById("dashboard-conteudo");
    const rotulo   = document.querySelector('[data-rotulo="dashboard"]');
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
                    <div style="color:var(--cor-texto-suave);font-size:var(--tam-sm);">Veja quantos gestores aderiram por período — hoje, 7, 15 ou 30 dias.</div>
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

    let grafico = null;

    async function carregarGrafico(dias) {
        try {
            const dados = await window.api.get(`/gestores/adesoes?dias=${dias}`);

            const fmtLabel = (iso) => {
                const [, m, d] = iso.split("-");
                return dias === 1 ? "Hoje" : `${d}/${m}`;
            };

            const labels = dados.map((r) => fmtLabel(r.data));
            const totais = dados.map((r) => r.total);
            const total  = totais.reduce((a, b) => a + b, 0);

            const titulo = document.querySelector(".painel__cabecalho h2");
            if (titulo) titulo.textContent =
                `Adesões de gestores — ${total} no${dias === 1 ? " dia de" : "s últimos"} ${dias === 1 ? "hoje" : dias + " dias"}`;

            if (grafico) {
                grafico.data.labels           = labels;
                grafico.data.datasets[0].data = totais;
                grafico.update();
            } else {
                const ctx = document.getElementById("grafico-adesoes")?.getContext("2d");
                if (!ctx) return;
                grafico = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels,
                        datasets: [{
                            label: "Gestores",
                            data:  totais,
                            backgroundColor: "rgba(240,138,36,0.75)",
                            borderColor:     "rgba(240,138,36,1)",
                            borderWidth: 1,
                            borderRadius: 4,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => ` ${ctx.parsed.y} gestor${ctx.parsed.y !== 1 ? "es" : ""}`,
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, precision: 0 },
                                grid: { color: "rgba(0,0,0,.06)" },
                            },
                            x: { grid: { display: false } },
                        },
                    },
                });
            }
        } catch { }
    }

    await carregarGrafico(1);

    document.querySelectorAll(".btn-periodo").forEach((btn) => {
        btn.addEventListener("click", async () => {
            document.querySelectorAll(".btn-periodo").forEach((b) => b.classList.remove("ativo-periodo"));
            btn.classList.add("ativo-periodo");
            await carregarGrafico(parseInt(btn.dataset.dias));
        });
    });

})();
