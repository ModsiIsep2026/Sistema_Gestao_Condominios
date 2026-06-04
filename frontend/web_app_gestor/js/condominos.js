(async function () {

    let edificios   = [];
    let edificioSel = null;

    const layout       = document.getElementById("cond-layout");
    const painel       = document.getElementById("cond-painel");
    const tbody        = document.getElementById("cond-tbody");
    const tituloEl     = document.getElementById("cond-titulo");
    const btnAdicionar = document.getElementById("btn-adicionar-cond");
    const modal        = document.getElementById("modal-cond");
    const erroModal    = document.getElementById("erro-cond");
    const selApt       = document.getElementById("cond-apt");
    const infoEdif     = document.getElementById("modal-cond-edificio");

    const ICONE_EDIFICIO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/><path d="M10 22v-4h4v4"/></svg>`;
    const ICONE_PESSOA   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

    function skeletonLinhas(n) {
        const w = [65, 70, 40, 35, 20];
        return Array(n).fill(0).map(() =>
            `<tr>${w.map(p => `<td><span class="sk-cel" style="width:${p}%"></span></td>`).join("")}</tr>`
        ).join("");
    }

    // ── Carregar e renderizar cards de edifícios ──────────────────────────────

    async function carregarEdificios() {
        const grid = document.getElementById("edificio-picker-cards");
        grid.innerHTML = Array(3).fill(0).map(() =>
            `<div class="ed-picker-card ed-picker-card--skeleton"></div>`
        ).join("");

        try {
            edificios = await window.api.get("/edificios");

            if (!edificios.length) {
                grid.innerHTML = `<div class="app-vazio"><p>Sem edifícios registados.</p></div>`;
                return;
            }

            grid.innerHTML = edificios.map((e) => `
                <button class="ed-picker-card" data-id="${e.id}" type="button">
                    <span class="ed-picker-card__check">✓</span>
                    <div class="ed-picker-card__icone">${ICONE_EDIFICIO}</div>
                    <div>
                        <div class="ed-picker-card__rua">${e.rua}</div>
                        <div class="ed-picker-card__cidade">${e.cidade || "—"}</div>
                    </div>
                    <span class="ed-picker-card__badge" id="badge-cond-${e.id}">
                        <span class="skeleton" style="width:52px;height:9px;display:inline-block;border-radius:4px;"></span>
                    </span>
                </button>
            `).join("");

            grid.querySelectorAll(".ed-picker-card").forEach((card) => {
                card.addEventListener("click", () => selecionarEdificio(parseInt(card.dataset.id)));
            });

            // Contagem de condóminos por edifício em background
            window.api.get("/condominos").then((todos) => {
                edificios.forEach((e) => {
                    const n = todos.filter((c) => c.apartamento?.id_edificio === e.id).length;
                    const badge = document.getElementById(`badge-cond-${e.id}`);
                    if (badge) badge.innerHTML = `${ICONE_PESSOA} ${n} condómino${n !== 1 ? "s" : ""}`;
                });
            }).catch(() => {});

        } catch {
            grid.innerHTML = `<div class="app-vazio"><p>Erro ao carregar edifícios.</p></div>`;
        }
    }

    // ── Selecionar edifício ───────────────────────────────────────────────────

    async function selecionarEdificio(id) {
        document.querySelectorAll(".ed-picker-card").forEach((c) => c.classList.remove("selecionado"));
        const card = document.querySelector(`.ed-picker-card[data-id="${id}"]`);
        if (card) card.classList.add("selecionado");

        edificioSel = edificios.find((e) => e.id === id) || null;
        if (!edificioSel) return;

        tituloEl.textContent    = `Condóminos de ${edificioSel.rua}`;
        painel.style.display    = "";
        btnAdicionar.style.display = "";
        layout.classList.add("com-selecao");

        await carregarCondominos();
    }

    // ── Carregar condóminos ───────────────────────────────────────────────────

    async function carregarCondominos() {
        tbody.innerHTML = skeletonLinhas(5);
        try {
            const todos = await window.api.get("/condominos");
            const lista = todos.filter((c) => c.apartamento?.id_edificio === edificioSel.id);
            renderizarCondominos(lista);

            // Atualizar badge do card ativo
            const badge = document.getElementById(`badge-cond-${edificioSel.id}`);
            if (badge) {
                const n = lista.length;
                badge.innerHTML = `${ICONE_PESSOA} ${n} condómino${n !== 1 ? "s" : ""}`;
            }
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    function renderizarCondominos(lista) {
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <h3>Sem condóminos</h3>
                        <p>Adicione o primeiro condómino a este edifício.</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((c) => {
            const apt   = c.apartamento;
            const aptTx = apt ? `Fração ${apt.fracao}${apt.andar != null ? " · " + apt.andar + "º" : ""}` : "—";
            const tel   = (c.telemovel && !c.telemovel.startsWith("_p")) ? c.telemovel : "—";
            return `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td style="color:var(--cor-texto-secundario);font-size:13px;">${c.email}</td>
                    <td style="font-size:13px;">${tel}</td>
                    <td><span style="font-size:12px;font-weight:600;background:var(--cor-fundo-alt);border:1px solid var(--cor-borda);padding:2px 8px;border-radius:4px;">${aptTx}</span></td>
                    <td class="app-tabela__acoes">
                        <button data-acao="remover" data-id="${c.id}" data-nome="${c.nome}" class="perigo">Remover</button>
                    </td>
                </tr>`;
        }).join("");
    }

    // ── Delegação: remover ────────────────────────────────────────────────────

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao='remover']");
        if (!btn) return;
        const ok = await window.confirmar(
            `Remover o condómino <strong>${btn.dataset.nome}</strong>? Esta ação é irreversível.`,
            { confirmar: "Remover" }
        );
        if (!ok) return;
        btn.disabled = true;
        try {
            await window.api.delete(`/condominos/${btn.dataset.id}`);
            await carregarCondominos();
            window.toast?.success("Condómino removido.");
        } catch {
            btn.disabled = false;
            window.toast?.error("Não foi possível remover.");
        }
    });

    // ── Modal: adicionar ─────────────────────────────────────────────────────

    btnAdicionar.addEventListener("click", () => { if (edificioSel) abrirModal(); });

    async function abrirModal() {
        infoEdif.textContent = `${edificioSel.rua}${edificioSel.cidade ? " — " + edificioSel.cidade : ""}`;
        erroModal.style.display = "none";
        document.getElementById("form-cond").reset();
        selApt.innerHTML = `<option value="">A carregar frações...</option>`;
        selApt.disabled  = true;
        modal.removeAttribute("hidden");

        try {
            const [apts, condominos] = await Promise.all([
                window.api.get(`/apartamentos?id_edificio=${edificioSel.id}`),
                window.api.get("/condominos"),
            ]);
            const ocupados = new Set(condominos.map((c) => c.id_apartamento));
            const livres   = apts.filter((a) => !ocupados.has(a.id));

            if (!livres.length) {
                selApt.innerHTML = `<option value="">Todas as frações já têm condómino</option>`;
            } else {
                selApt.disabled  = false;
                selApt.innerHTML = `<option value="">Selecionar fração...</option>` +
                    livres.map((a) =>
                        `<option value="${a.id}">Fração ${a.fracao}${a.andar != null ? " — " + a.andar + "º andar" : ""}</option>`
                    ).join("");
            }
        } catch {
            selApt.innerHTML = `<option value="">Erro ao carregar frações</option>`;
        }
    }

    function fecharModal() { modal.setAttribute("hidden", ""); }

    document.querySelectorAll("[data-fechar-cond]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-guardar-cond").addEventListener("click", async () => {
        erroModal.style.display = "none";
        const nome           = document.getElementById("cond-nome").value.trim();
        const email          = document.getElementById("cond-email").value.trim();
        const id_apartamento = parseInt(selApt.value);

        if (!nome)               { erroModal.textContent = "Indique o nome.";        erroModal.style.display = ""; return; }
        if (!email)              { erroModal.textContent = "Indique o email.";       erroModal.style.display = ""; return; }
        if (isNaN(id_apartamento)) { erroModal.textContent = "Selecione a fração."; erroModal.style.display = ""; return; }

        const btn = document.getElementById("btn-guardar-cond");
        btn.disabled = true; btn.textContent = "A adicionar...";
        try {
            await window.api.post("/condominos", { nome, email, id_apartamento });
            fecharModal();
            await carregarCondominos();
            window.toast?.success("Condómino adicionado com sucesso.");
        } catch (e) {
            erroModal.textContent   = e.message || "Não foi possível criar o condómino.";
            erroModal.style.display = "";
        } finally {
            btn.disabled = false; btn.textContent = "Adicionar";
        }
    });

    await carregarEdificios();

})();
