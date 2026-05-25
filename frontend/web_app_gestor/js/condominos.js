(async function () {

    let edificios    = [];
    let edificioSel  = null;   // objeto do edifício selecionado

    const container  = document.getElementById("condominos-container");
    const selEdif    = document.getElementById("sel-edificio");
    const btnAdicionar = document.getElementById("btn-adicionar-cond");
    const modal      = document.getElementById("modal-cond");
    const erroModal  = document.getElementById("erro-cond");
    const selApt     = document.getElementById("cond-apt");
    const infoEdif   = document.getElementById("modal-cond-edificio");

    // ── Carregar edifícios para o select ──────────────────────────────────────

    try {
        edificios = await window.api.get("/edificios");
        selEdif.innerHTML = `<option value="">Selecionar edifício...</option>` +
            edificios.map((e) =>
                `<option value="${e.id}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`
            ).join("");
    } catch (e) {
        container.innerHTML = `<p style="color:var(--cor-texto-secundario);">Erro: ${e.message}</p>`;
    }

    // ── Carregar e renderizar condóminos do edifício selecionado ──────────────

    async function carregarCondominos() {
        if (!edificioSel) return;
        container.innerHTML = `<p style="color:var(--cor-texto-secundario);">A carregar...</p>`;

        try {
            const todos = await window.api.get("/condominos");
            const lista = todos.filter((c) => c.apartamento?.id_edificio === edificioSel.id);

            if (!lista.length) {
                container.innerHTML = `
                    <div class="painel">
                        <table class="app-tabela">
                            <thead><tr>
                                <th>Nome</th><th>Email</th><th>Telemóvel</th><th>Fração</th><th></th>
                            </tr></thead>
                            <tbody>
                                <tr><td colspan="5" class="app-vazio"><p>Sem condóminos neste edifício.</p></td></tr>
                            </tbody>
                        </table>
                    </div>`;
                return;
            }

            const linhas = lista.map((c) => {
                const apt   = c.apartamento;
                const aptTx = apt
                    ? `Fração ${apt.fracao}${apt.andar != null ? " · " + apt.andar + "º" : ""}`
                    : "—";
                const tel = (c.telemovel && !c.telemovel.startsWith("_p")) ? c.telemovel : "—";
                return `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.email}</td>
                    <td>${tel}</td>
                    <td>${aptTx}</td>
                    <td class="app-tabela__acoes">
                        <button data-acao="remover" data-id="${c.id}" class="perigo">Remover</button>
                    </td>
                </tr>`;
            }).join("");

            container.innerHTML = `
                <div class="painel">
                    <table class="app-tabela">
                        <thead><tr>
                            <th>Nome</th><th>Email</th><th>Telemóvel</th><th>Fração</th><th></th>
                        </tr></thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>`;
        } catch (e) {
            container.innerHTML = `<p style="color:var(--cor-texto-secundario);">Erro: ${e.message}</p>`;
        }
    }

    // ── Mudar edifício ────────────────────────────────────────────────────────

    selEdif.addEventListener("change", async () => {
        const id = parseInt(selEdif.value);
        if (!id) {
            edificioSel = null;
            btnAdicionar.style.display = "none";
            container.innerHTML = `<p style="color:var(--cor-texto-secundario);">Seleciona um edifício para ver os condóminos.</p>`;
            return;
        }
        edificioSel = edificios.find((e) => e.id === id) || null;
        btnAdicionar.style.display = "";
        await carregarCondominos();
    });

    // ── Botão adicionar (cabeçalho) ───────────────────────────────────────────

    btnAdicionar.addEventListener("click", () => {
        if (edificioSel) abrirModal();
    });

    // ── Modal ─────────────────────────────────────────────────────────────────

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

    function fecharModal() {
        modal.setAttribute("hidden", "");
    }

    document.querySelectorAll("[data-fechar-cond]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    // ── Guardar condómino ─────────────────────────────────────────────────────

    document.getElementById("btn-guardar-cond").addEventListener("click", async () => {
        erroModal.style.display = "none";

        const nome           = document.getElementById("cond-nome").value.trim();
        const email          = document.getElementById("cond-email").value.trim();
        const id_apartamento = parseInt(selApt.value);

        if (!nome)               { erroModal.textContent = "Indique o nome.";        erroModal.style.display = ""; return; }
        if (!email)              { erroModal.textContent = "Indique o email.";       erroModal.style.display = ""; return; }
        if (isNaN(id_apartamento)) { erroModal.textContent = "Selecione a fração."; erroModal.style.display = ""; return; }

        const btn = document.getElementById("btn-guardar-cond");
        btn.disabled    = true;
        btn.textContent = "A adicionar...";
        try {
            await window.api.post("/condominos", { nome, email, id_apartamento });
            fecharModal();
            await carregarCondominos();
        } catch (e) {
            erroModal.textContent   = e.message || "Não foi possível criar o condómino.";
            erroModal.style.display = "";
        } finally {
            btn.disabled    = false;
            btn.textContent = "Adicionar";
        }
    });

    // ── Delegação: remover ────────────────────────────────────────────────────

    container.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao='remover']");
        if (!btn) return;
        btn.disabled = true;
        try {
            await window.api.delete(`/condominos/${btn.dataset.id}`);
            await carregarCondominos();
        } catch {
            btn.disabled = false;
        }
    });

})();
