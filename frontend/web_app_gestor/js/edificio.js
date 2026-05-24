
(async function () {

    const params  = new URLSearchParams(window.location.search);
    const idEdif  = parseInt(params.get("id"));

    if (!idEdif) {
        window.location.replace("edificios.html");
        return;
    }

    let apartamentos = [];
    let condominos   = [];
    let edificio     = null;

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    // ── Carregar edifício ─────────────────────────────────────────────────────
    try {
        const todos = await window.api.get("/edificios");
        edificio = todos.find((e) => e.id === idEdif);
        if (edificio) {
            document.getElementById("titulo-edificio").textContent = edificio.rua;
            document.getElementById("subtitulo-edificio").textContent =
                [edificio.cp, edificio.cidade].filter(Boolean).join(" — ");
            document.title = edificio.rua + " — Gestão de Condomínios";
        }
    } catch {}

    // ── Tabs ──────────────────────────────────────────────────────────────────
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("ativo"));
            document.querySelectorAll(".tab-painel").forEach((p) => p.classList.remove("ativo"));
            btn.classList.add("ativo");
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add("ativo");
        });
    });

    // ── Apartamentos ──────────────────────────────────────────────────────────
    async function carregarApartamentos() {
        const tbody = document.querySelector('[data-tabela="apartamentos"]');
        try {
            apartamentos = await window.api.get(`/apartamentos?id_edificio=${idEdif}`);
            if (!apartamentos.length) {
                tbody.innerHTML = `
                    <tr><td colspan="5">
                        <div class="app-vazio">
                            <h3>Sem apartamentos</h3>
                            <p>Adicione o primeiro apartamento a este edifício.</p>
                        </div>
                    </td></tr>`;
                return;
            }

            // Mapa condómino por apartamento
            const condPorApt = {};
            condominos.forEach((c) => { condPorApt[c.id_apartamento] = c.nome; });

            tbody.innerHTML = apartamentos.map((a) => `
                <tr>
                    <td><strong>Fração ${a.fracao}</strong></td>
                    <td>${a.andar != null ? a.andar + "º" : "—"}</td>
                    <td>${a.permilagem != null ? a.permilagem + "‰" : "—"}</td>
                    <td style="font-size:13px;color:var(--cor-texto-secundario);">
                        ${condPorApt[a.id] || '<span style="color:#bbb;">Sem condómino</span>'}
                    </td>
                    <td class="app-tabela__acoes">
                        <button data-acao-apt="editar" data-id="${a.id}">Editar</button>
                        <button data-acao-apt="remover" data-id="${a.id}" class="perigo">Remover</button>
                    </td>
                </tr>`).join("");

            // Actualizar select do modal de condómino
            popularSelectApt();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    function popularSelectApt() {
        const sel = document.getElementById("cond-apt");
        sel.innerHTML = `<option value="">Selecionar fração...</option>` +
            apartamentos.map((a) =>
                `<option value="${a.id}">Fração ${a.fracao}${a.andar != null ? " — " + a.andar + "º andar" : ""}</option>`
            ).join("");
    }

    // Modal apartamento
    const modalApt = document.getElementById("modal-apt");
    const erroApt  = document.getElementById("erro-apt");

    function abrirModalApt(apt = null) {
        erroApt.style.display = "none";
        document.getElementById("form-apt").reset();
        const btn = document.getElementById("btn-guardar-apt");
        if (apt) {
            document.getElementById("modal-apt-titulo").textContent = "Editar apartamento";
            btn.textContent = "Guardar";
            document.getElementById("apt-id").value          = apt.id;
            document.getElementById("apt-fracao").value      = apt.fracao || "";
            document.getElementById("apt-andar").value       = apt.andar ?? "";
            document.getElementById("apt-permilagem").value  = apt.permilagem ?? "";
        } else {
            document.getElementById("modal-apt-titulo").textContent = "Adicionar apartamento";
            btn.textContent = "Adicionar";
            document.getElementById("apt-id").value = "";
        }
        modalApt.hidden = false;
    }
    function fecharModalApt() { modalApt.hidden = true; }

    document.getElementById("btn-novo-apt").addEventListener("click", () => abrirModalApt());
    document.querySelectorAll("[data-fechar-apt]").forEach((el) => el.addEventListener("click", fecharModalApt));
    modalApt.addEventListener("click", (e) => { if (e.target === modalApt) fecharModalApt(); });

    document.getElementById("btn-guardar-apt").addEventListener("click", async () => {
        erroApt.style.display = "none";
        const id         = document.getElementById("apt-id").value;
        const fracao     = document.getElementById("apt-fracao").value.trim();
        const andar      = document.getElementById("apt-andar").value !== ""
                           ? parseInt(document.getElementById("apt-andar").value) : null;
        const permilagem = parseFloat(document.getElementById("apt-permilagem").value);

        if (!fracao) { erroApt.textContent = "Indique a fração."; erroApt.style.display = ""; return; }
        if (isNaN(permilagem)) { erroApt.textContent = "Indique a permilagem."; erroApt.style.display = ""; return; }

        const btn = document.getElementById("btn-guardar-apt");
        btn.disabled = true;
        try {
            if (id) {
                await window.api.put(`/apartamentos/${id}`, { fracao, andar, permilagem });
            } else {
                await window.api.post("/apartamentos", { fracao, andar, permilagem, id_edificio: idEdif });
            }
            fecharModalApt();
            await carregarApartamentos();
        } catch (e) {
            erroApt.textContent = e.message || "Erro ao guardar.";
            erroApt.style.display = "";
        } finally { btn.disabled = false; }
    });

    // Ações na tabela apartamentos
    document.querySelector('[data-tabela="apartamentos"]').addEventListener("click", async (e) => {
        const btn  = e.target.closest("[data-acao-apt]");
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const apt  = apartamentos.find((a) => a.id === id);
        const acao = btn.dataset.acaoApt;

        if (acao === "editar") { abrirModalApt(apt); return; }

        if (acao === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/apartamentos/${id}`);
                await carregarApartamentos();
            } catch { btn.disabled = false; }
        }
    });

    // ── Condóminos ────────────────────────────────────────────────────────────
    async function carregarCondominos() {
        const tbody = document.querySelector('[data-tabela="condominos"]');
        try {
            const todos = await window.api.get("/condominos");
            condominos = todos.filter((c) => {
                const apt = apartamentos.find((a) => a.id === c.id_apartamento);
                return apt != null;
            });
            if (!condominos.length) {
                tbody.innerHTML = `
                    <tr><td colspan="5">
                        <div class="app-vazio">
                            <h3>Sem condóminos</h3>
                            <p>Adicione condóminos às frações deste edifício.</p>
                        </div>
                    </td></tr>`;
                return;
            }
            tbody.innerHTML = condominos.map((c) => {
                const apt = apartamentos.find((a) => a.id === c.id_apartamento);
                return `
                    <tr>
                        <td><strong>${c.nome}</strong></td>
                        <td>${c.email}</td>
                        <td>${c.telemovel || "—"}</td>
                        <td>${apt ? `Fração ${apt.fracao}` : "—"}</td>
                        <td class="app-tabela__acoes">
                            <button data-acao-cond="remover" data-id="${c.id}" class="perigo">Remover</button>
                        </td>
                    </tr>`;
            }).join("");
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    // Modal condómino
    const modalCond = document.getElementById("modal-cond");
    const erroCond  = document.getElementById("erro-cond");

    function abrirModalCond() {
        erroCond.style.display = "none";
        document.getElementById("form-cond").reset();
        popularSelectApt();
        modalCond.hidden = false;
    }
    function fecharModalCond() { modalCond.hidden = true; }

    document.getElementById("btn-novo-cond").addEventListener("click", abrirModalCond);
    document.querySelectorAll("[data-fechar-cond]").forEach((el) => el.addEventListener("click", fecharModalCond));
    modalCond.addEventListener("click", (e) => { if (e.target === modalCond) fecharModalCond(); });

    document.getElementById("btn-guardar-cond").addEventListener("click", async () => {
        erroCond.style.display = "none";
        const nome  = document.getElementById("cond-nome").value.trim();
        const email = document.getElementById("cond-email").value.trim();
        const tel   = document.getElementById("cond-tel").value.trim();
        const idApt = parseInt(document.getElementById("cond-apt").value);

        if (!nome)        { erroCond.textContent = "Indique o nome.";          erroCond.style.display = ""; return; }
        if (!email)       { erroCond.textContent = "Indique o email.";         erroCond.style.display = ""; return; }
        if (!tel)         { erroCond.textContent = "Indique o telemóvel.";     erroCond.style.display = ""; return; }
        if (isNaN(idApt)) { erroCond.textContent = "Selecione o apartamento."; erroCond.style.display = ""; return; }

        const btn = document.getElementById("btn-guardar-cond");
        btn.disabled = true;
        btn.textContent = "A adicionar...";
        try {
            await window.api.post("/condominos", { nome, email, telemovel: tel, id_apartamento: idApt });
            fecharModalCond();
            await carregarCondominos();
        } catch (e) {
            erroCond.textContent = e.message || "Erro ao criar condómino.";
            erroCond.style.display = "";
        } finally {
            btn.disabled = false;
            btn.textContent = "Adicionar";
        }
    });

    // Ações na tabela condóminos
    document.querySelector('[data-tabela="condominos"]').addEventListener("click", async (e) => {
        const btn  = e.target.closest("[data-acao-cond]");
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const cond = condominos.find((c) => c.id === id);

        if (btn.dataset.acaoCond === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/condominos/${id}`);
                await carregarCondominos();
            } catch { btn.disabled = false; }
        }
    });

    // ── Arranque ──────────────────────────────────────────────────────────────
    await carregarApartamentos();
    await carregarCondominos();

})();
