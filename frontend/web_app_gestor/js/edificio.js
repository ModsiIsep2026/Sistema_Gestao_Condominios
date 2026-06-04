
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


    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("ativo"));
            document.querySelectorAll(".tab-painel").forEach((p) => p.classList.remove("ativo"));
            btn.classList.add("ativo");
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add("ativo");
        });
    });


    function renderizarApartamentos() {
        const tbody = document.querySelector('[data-tabela="apartamentos"]');
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

        popularSelectApt();
    }


    function renderizarCondominos() {
        const tbody = document.querySelector('[data-tabela="condominos"]');
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
            const apt   = c.apartamento || apartamentos.find((a) => a.id === c.id_apartamento);
            const aptTx = apt ? `Fração ${apt.fracao}${apt.andar != null ? " · " + apt.andar + "º" : ""}` : "—";
            const tel   = (c.telemovel && !c.telemovel.startsWith("_p")) ? c.telemovel : "—";
            return `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.email}</td>
                    <td>${tel}</td>
                    <td>${aptTx}</td>
                    <td class="app-tabela__acoes">
                        <button data-acao-cond="remover" data-id="${c.id}" class="perigo">Remover</button>
                    </td>
                </tr>`;
        }).join("");
    }

  
    async function carregarApartamentos() {
        try {
            apartamentos = await window.api.get(`/apartamentos?id_edificio=${idEdif}`);
        } catch (e) {
            document.querySelector('[data-tabela="apartamentos"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }


    async function carregarCondominos() {
        try {
            const todos = await window.api.get("/condominos");
            condominos = todos.filter((c) =>
                apartamentos.some((a) => a.id === c.id_apartamento)
            );
        } catch (e) {
            document.querySelector('[data-tabela="condominos"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

  
    function popularSelectApt() {
        const sel = document.getElementById("cond-apt");
        // IDs de apartamentos já ocupados
        const ocupados = new Set(condominos.map((c) => c.id_apartamento));
        const livres   = apartamentos.filter((a) => !ocupados.has(a.id));

        if (!livres.length) {
            sel.innerHTML = `<option value="">Todas as frações já têm condómino</option>`;
            sel.disabled  = true;
        } else {
            sel.disabled  = false;
            sel.innerHTML = `<option value="">Selecionar fração...</option>` +
                livres.map((a) =>
                    `<option value="${a.id}">Fração ${a.fracao}${a.andar != null ? " — " + a.andar + "º andar" : ""}</option>`
                ).join("");
        }
    }

  
    async function recarregarTudo() {
        await carregarApartamentos();
        await carregarCondominos();
        renderizarApartamentos();
        renderizarCondominos();
    }

    
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
        modalApt.removeAttribute("hidden");
    }
    function fecharModalApt() { modalApt.setAttribute("hidden", ""); }

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

        if (!fracao)          { erroApt.textContent = "Indique a fração.";     erroApt.style.display = ""; return; }
        if (isNaN(permilagem)){ erroApt.textContent = "Indique a permilagem."; erroApt.style.display = ""; return; }

        const btn = document.getElementById("btn-guardar-apt");
        btn.disabled = true;
        try {
            if (id) {
                await window.api.put(`/apartamentos/${id}`, { fracao, andar, permilagem });
            } else {
                await window.api.post("/apartamentos", { fracao, andar, permilagem, id_edificio: idEdif });
            }
            fecharModalApt();
            await recarregarTudo();
        } catch (e) {
            erroApt.textContent = e.message || "Erro ao guardar.";
            erroApt.style.display = "";
        } finally { btn.disabled = false; }
    });

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
                await recarregarTudo();
            } catch { btn.disabled = false; }
        }
    });


    const modalCond = document.getElementById("modal-cond");
    const erroCond  = document.getElementById("erro-cond");

    function abrirModalCond() {
        erroCond.style.display = "none";
        document.getElementById("form-cond").reset();
        popularSelectApt();
        modalCond.removeAttribute("hidden");
    }
    function fecharModalCond() { modalCond.setAttribute("hidden", ""); }

    document.getElementById("btn-novo-cond").addEventListener("click", abrirModalCond);
    document.querySelectorAll("[data-fechar-cond]").forEach((el) => el.addEventListener("click", fecharModalCond));
    modalCond.addEventListener("click", (e) => { if (e.target === modalCond) fecharModalCond(); });

    document.getElementById("btn-guardar-cond").addEventListener("click", async () => {
        erroCond.style.display = "none";
        const nome  = document.getElementById("cond-nome").value.trim();
        const email = document.getElementById("cond-email").value.trim();
        const idApt = parseInt(document.getElementById("cond-apt").value);

        if (!nome)        { erroCond.textContent = "Indique o nome.";          erroCond.style.display = "block"; return; }
        if (!email)       { erroCond.textContent = "Indique o email.";         erroCond.style.display = "block"; return; }
        if (isNaN(idApt)) { erroCond.textContent = "Selecione o apartamento."; erroCond.style.display = "block"; return; }

        const btn = document.getElementById("btn-guardar-cond");
        btn.disabled = true;
        btn.textContent = "A adicionar...";
        try {
            await window.api.post("/condominos", { nome, email, id_apartamento: idApt });
            fecharModalCond();
            await recarregarTudo();
        } catch (e) {
            erroCond.textContent = e.message || "Erro ao criar condómino.";
            erroCond.style.display = "block";
        } finally {
            btn.disabled = false;
            btn.textContent = "Adicionar";
        }
    });

    document.querySelector('[data-tabela="condominos"]').addEventListener("click", async (e) => {
        const btn  = e.target.closest("[data-acao-cond]");
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);

        if (btn.dataset.acaoCond === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/condominos/${id}`);
                await recarregarTudo();
            } catch { btn.disabled = false; }
        }
    });

    await carregarApartamentos();
    await carregarCondominos();
    renderizarApartamentos();
    renderizarCondominos();

})();
