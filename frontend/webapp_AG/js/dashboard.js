
(async function () {

    for (let i = 0; i < 50 && window.perfilAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    const perfil = window.perfilAtual;
    const conteudo = document.getElementById("dashboard-conteudo");
    const rotulo = document.querySelector('[data-rotulo="dashboard"]');

    if (perfil === 5) {
        rotulo.textContent = "Visão geral dos edifícios na plataforma.";
        await renderizarAdmin();
    } else if (perfil === 3) {
        rotulo.textContent = "Vista geral dos edifícios que gere.";
        await renderizarGestor();
    } else if (perfil === 4) {
        rotulo.textContent = "Ordens de trabalho atribuídas a si.";
        await renderizarTecnico();
    }



    async function renderizarAdmin() {
        conteudo.innerHTML = `
            <div class="kpis" style="grid-template-columns: repeat(3, 1fr);">
                <div class="kpi">
                    <div class="kpi__rotulo">Edifícios</div>
                    <div class="kpi__valor" id="kpi-total">—</div>
               
                </div>
                <div class="kpi kpi--ok">
                    <div class="kpi__rotulo">Gestores</div>
                    <div class="kpi__valor" id="kpi-gestores">—</div>
                  
                </div>
                <div class="kpi kpi--alerta">
                    <div class="kpi__rotulo">Fornecedores</div>
                    <div class="kpi__valor" id="kpi-fornecedores">—</div>
                </div>
            </div>

            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>Edifícios na plataforma</h2>
                    <a href="edificios.html" class="btn btn--outline">Ver todos</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead><tr><th>Nome</th><th>Morada</th><th>Cidade</th></tr></thead>
                        <tbody id="tabela-edificios"><tr><td colspan="3" class="app-vazio"><p>A carregar...</p></td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const edificios = await window.api.get("/edificios");
            document.getElementById("kpi-total").textContent = edificios.length;
            renderizarTabelaEdificios(edificios);
        } catch {
            document.getElementById("kpi-total").textContent = "0";
        }

        try {
            const gestores = await window.api.get("/utilizadores");
            document.getElementById("kpi-gestores").textContent = gestores.length;
        } catch {
            document.getElementById("kpi-gestores").textContent = "0";
        }

        try {
            const fornecedores = await window.api.get("/fornecedores");
            document.getElementById("kpi-fornecedores").textContent = fornecedores.length;
        } catch {
            document.getElementById("kpi-fornecedores").textContent = "0";
        }
    }

    function renderizarTabelaEdificios(edificios) {
        const tbody = document.getElementById("tabela-edificios");
        if (!edificios.length) {
            tbody.innerHTML = `<tr><td colspan="3" class="app-vazio"><p>Sem edifícios.</p></td></tr>`;
            return;
        }
        tbody.innerHTML = edificios.slice(0, 10).map((e) => `
            <tr>
                <td><strong>${e.nome}</strong></td>
                <td>${e.morada}</td>
                <td>${e.cidade || "—"}</td>
            </tr>
        `).join("");
    }

    function inicializarMiniMapa(edificios) {
        const PT = L.latLngBounds([36.5, -10.0], [42.5, -6.0]);
        const m = L.map("mini-mapa", {
            zoomControl: false,
            attributionControl: false,
            maxBounds: PT,
            minZoom: 6,
            maxZoom: 12,
        }).fitBounds(PT);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        }).addTo(m);

        const comCoords = edificios.filter((e) => e.latitude != null && e.longitude != null);
        comCoords.forEach((e) => {
            L.circleMarker([e.latitude, e.longitude], {
                radius: 6, color: "#F08A24", fillColor: "#F08A24",
                fillOpacity: 0.9, weight: 2,
            }).addTo(m).bindPopup(`<strong>${e.nome}</strong><br>${e.cidade || ""}`);
        });
    }


    async function renderizarGestor() {
        conteudo.innerHTML = `
            <div class="kpis">
                <div class="kpi">
                    <div class="kpi__rotulo">Edifícios</div>
                    <div class="kpi__valor" data-kpi="edificios">—</div>
                    <div class="kpi__sub">Sob gestão</div>
                </div>
                <div class="kpi kpi--ok">
                    <div class="kpi__rotulo">Quotas pagas (mês)</div>
                    <div class="kpi__valor" data-kpi="quotas-pagas">—</div>
                    <div class="kpi__sub">Percentagem</div>
                </div>
                <div class="kpi kpi--alerta">
                    <div class="kpi__rotulo">Reservas pendentes</div>
                    <div class="kpi__valor" data-kpi="reservas-pendentes">—</div>
                    <div class="kpi__sub">A aguardar aprovação</div>
                </div>
                <div class="kpi kpi--erro">
                    <div class="kpi__rotulo">Avarias abertas</div>
                    <div class="kpi__valor" data-kpi="avarias-abertas">—</div>
                    <div class="kpi__sub">A precisar de OT</div>
                </div>
            </div>

            <div class="dois-paineis">
                <div class="painel">
                    <div class="painel__cabecalho">
                        <h2>Últimas avarias reportadas</h2>
                        <a href="avarias.html" class="btn btn--outline">Ver todas</a>
                    </div>
                    <div class="painel__corpo painel__corpo--sem-pad">
                        <table class="app-tabela">
                            <thead><tr><th>Data</th><th>Edifício</th><th>Categoria</th><th>Estado</th></tr></thead>
                            <tbody data-tabela="avarias-recentes"><tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr></tbody>
                        </table>
                    </div>
                </div>
                <div class="painel">
                    <div class="painel__cabecalho">
                        <h2>Reservas pendentes</h2>
                        <a href="reservas.html" class="btn btn--outline">Ver todas</a>
                    </div>
                    <div class="painel__corpo painel__corpo--sem-pad">
                        <table class="app-tabela">
                            <thead><tr><th>Espaço</th><th>Quando</th></tr></thead>
                            <tbody data-tabela="reservas-pendentes"><tr><td colspan="2" class="app-vazio"><p>A carregar...</p></td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        const setKpi = (n, v) => { const el = document.querySelector(`[data-kpi="${n}"]`); if (el) el.textContent = v; };
        const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "—";

        try {
            const edificios = await window.api.get("/edificios");
            setKpi("edificios", edificios.length);
        } catch { setKpi("edificios", "0"); }

        try {
            const reservas = await window.api.get("/reservas");
            const pendentes = reservas.filter((r) => (r.estado?.nome_pt || "").toLowerCase() === "pendente");
            setKpi("reservas-pendentes", pendentes.length);
            document.querySelector('[data-tabela="reservas-pendentes"]').innerHTML =
                pendentes.slice(0, 5).map((r) => `
                    <tr><td><strong>${r.espaco?.nome || "Espaço " + r.espaco_id}</strong></td><td>${fmt(r.data_inicio)}</td></tr>
                `).join("") || `<tr><td colspan="2" class="app-vazio"><p>Sem reservas pendentes.</p></td></tr>`;
        } catch { setKpi("reservas-pendentes", "0"); }

        try {
            const avarias = await window.api.get("/avarias");
            setKpi("avarias-abertas", avarias.length);
            document.querySelector('[data-tabela="avarias-recentes"]').innerHTML =
                avarias.slice(-5).reverse().map((a) => `
                    <tr>
                        <td>${fmt(a.created_at)}</td>
                        <td>${a.edificio?.nome || "—"}</td>
                        <td>${a.categoria?.nome_pt || "—"}</td>
                        <td><span class="estado estado--alerta">Aberta</span></td>
                    </tr>
                `).join("") || `<tr><td colspan="4" class="app-vazio"><p>Sem avarias.</p></td></tr>`;
        } catch { setKpi("avarias-abertas", "0"); }

        try {
            const quotas = await window.api.get("/quotas");
            const pagamentos = await window.api.get("/pagamentos");
            const pct = quotas.length === 0 ? 0 : Math.round((pagamentos.length / quotas.length) * 100);
            setKpi("quotas-pagas", `${Math.min(pct, 100)}%`);
        } catch { setKpi("quotas-pagas", "—"); }
    }


    async function renderizarTecnico() {
        conteudo.innerHTML = `
            <div class="painel">
                <div class="painel__cabecalho">
                    <h2>As minhas ordens de trabalho</h2>
                    <a href="ordens-trabalho.html" class="btn btn--outline">Ver todas</a>
                </div>
                <div class="painel__corpo painel__corpo--sem-pad">
                    <table class="app-tabela">
                        <thead><tr><th>Avaria</th><th>Edifício</th><th>Início</th><th>Estado</th></tr></thead>
                        <tbody id="tabela-ots-tecnico"><tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr></tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            const ots = await window.api.get("/ordens-trabalho");
            const tbody = document.getElementById("tabela-ots-tecnico");
            if (!ots.length) {
                tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem ordens de trabalho atribuídas.</p></td></tr>`;
                return;
            }
            tbody.innerHTML = ots.map((o) => `
                <tr>
                    <td>${o.avaria?.descricao?.substring(0, 40) || "—"}</td>
                    <td>${o.avaria?.edificio?.nome || "—"}</td>
                    <td>${o.data_inicio ? new Date(o.data_inicio).toLocaleDateString("pt-PT") : "—"}</td>
                    <td><span class="estado estado--alerta">${o.estado?.nome_pt || "—"}</span></td>
                </tr>
            `).join("");
        } catch (e) {
            document.getElementById("tabela-ots-tecnico").innerHTML =
                `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

})();
