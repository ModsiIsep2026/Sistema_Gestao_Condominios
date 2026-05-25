
(async function () {

    let dados      = [];
    let edificios  = [];
    let apartamentos = [];

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    const fmtMes = (m) => {
        if (!m) return "—";
        const [ano, mes] = m.split("-");
        const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        return `${nomes[parseInt(mes) - 1]} ${ano}`;
    };

    // ── Renderizar tabela ─────────────────────────────────────────────────────
    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="quotas"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>
                        <h3>Sem pagamentos</h3>
                        <p>Ainda não foram gerados pagamentos neste edifício.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((p) => `
            <tr>
                <td>Apt. ${p.id_apartamento}</td>
                <td>${fmtMes(p.mes)}</td>
                <td>${fmtEur(p.valor)}</td>
                <td>${p.estado === 1
                    ? '<span class="estado estado--ok">Paga</span>'
                    : '<span class="estado estado--alerta">Pendente</span>'}</td>
                <td>${p.data_p ? new Date(p.data_p).toLocaleDateString("pt-PT") : "—"}</td>
                <td class="app-tabela__acoes">
                    ${p.estado !== 1
                        ? `<button data-acao="marcar-pago" data-id="${p.id}">Marcar paga</button>`
                        : ""}
                </td>
            </tr>`).join("");
    }

    function atualizarResumo(lista) {
        const total    = lista.length;
        const pagos    = lista.filter((p) => p.estado === 1).length;
        const pendentes = total - pagos;
        const montante = lista.filter((p) => p.estado === 1).reduce((s, p) => s + parseFloat(p.valor || 0), 0);

        document.getElementById("resumo-total").textContent    = total;
        document.getElementById("resumo-pagos").textContent    = pagos;
        document.getElementById("resumo-pendentes").textContent = pendentes;
        document.getElementById("resumo-montante").textContent  = fmtEur(montante);
    }

    async function carregar() {
        try {
            dados = await window.api.get("/pagamentos/gestor");
            aplicarFiltros();
        } catch (e) {
            document.querySelector('[data-tabela="quotas"]').innerHTML =
                `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    function aplicarFiltros() {
        let lista = [...dados];
        const pesquisa = (document.querySelector("[data-pesquisa]")?.value || "").toLowerCase().trim();
        const estado   = document.getElementById("filtro-estado")?.value || "";
        const edificio = document.getElementById("filtro-edificio")?.value || "";

        if (pesquisa) lista = lista.filter((p) =>
            p.mes.includes(pesquisa) || String(p.id_apartamento).includes(pesquisa));
        if (estado === "pago")     lista = lista.filter((p) => p.estado === 1);
        if (estado === "pendente") lista = lista.filter((p) => p.estado !== 1);

        renderizar(lista);
        atualizarResumo(lista);
    }

    await carregar();

    // Carregar edifícios para o filtro e para o modal
    try {
        edificios = await window.api.get("/edificios");
        const selFiltro = document.getElementById("filtro-edificio");
        edificios.forEach((e) => {
            selFiltro.innerHTML += `<option value="${e.id}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`;
        });
    } catch {}

    document.querySelector("[data-pesquisa]")?.addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-estado")?.addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-edificio")?.addEventListener("change", aplicarFiltros);

    // Marcar pago inline
    document.querySelector('[data-tabela="quotas"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao='marcar-pago']");
        if (!btn) return;
        btn.disabled = true;
        try {
            await window.api.post(`/pagamentos/${btn.dataset.id}/marcar-paga`);
            await carregar();
        } catch (err) { btn.disabled = false; }
    });

    // ── Modal gerar quota ─────────────────────────────────────────────────────
    const modal        = document.getElementById("modal-gerar");
    const erroGerar    = document.getElementById("erro-gerar");
    const sucessoGerar = document.getElementById("sucesso-gerar");
    const btnGerar     = document.getElementById("btn-gerar");
    const selEdif      = document.getElementById("g-edificio");
    const inputMes     = document.getElementById("g-mes");
    const aptsWrapper  = document.getElementById("g-apts-wrapper");
    const aptsLista    = document.getElementById("g-apts-lista");
    const aptsSemApts  = document.getElementById("g-sem-apts");
    const chkTodos     = document.getElementById("g-todos");
    const aptsInfo     = document.getElementById("g-apts-info");

    function abrirModal() {
        erroGerar.style.display    = "none";
        sucessoGerar.style.display = "none";
        aptsWrapper.style.display  = "none";
        aptsSemApts.style.display  = "none";
        btnGerar.disabled = true;
        selEdif.value = "";
        aptsLista.innerHTML = "";
        chkTodos.checked = false;

        // Preencher edifícios no modal
        selEdif.innerHTML = `<option value="">Selecione um edifício...</option>` +
            edificios.map((e) =>
                `<option value="${e.id}" data-quota="${e.valor_base_mensal || 0}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`
            ).join("");

        // Default: mês actual
        const hoje = new Date();
        inputMes.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

        modal.style.display = "";
    }

    function fecharModal() { modal.style.display = "none"; }

    document.getElementById("btn-gerar-quota").addEventListener("click", abrirModal);
    document.getElementById("btn-fechar-gerar").addEventListener("click", fecharModal);
    document.getElementById("btn-fechar-gerar2").addEventListener("click", fecharModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    // Quando muda o edifício → carrega apartamentos
    selEdif.addEventListener("change", async () => {
        const idEdif = parseInt(selEdif.value);
        aptsWrapper.style.display  = "none";
        aptsSemApts.style.display  = "none";
        btnGerar.disabled = true;
        aptsLista.innerHTML = "";
        chkTodos.checked = false;

        if (!idEdif) return;

        const quotaBase = parseFloat(selEdif.selectedOptions[0]?.dataset.quota || 0);

        try {
            apartamentos = await window.api.get(`/apartamentos?id_edificio=${idEdif}`);
            if (!apartamentos.length) {
                aptsSemApts.style.display = "";
                return;
            }
            aptsLista.innerHTML = apartamentos.map((a) => `
                <label class="apt-check-item">
                    <input type="checkbox" class="apt-check" data-id="${a.id}" value="${a.id}">
                    <span>
                        <strong>Fração ${a.fracao}</strong>
                        ${a.andar != null ? ` — ${a.andar}º andar` : ""}
                        <span style="color:var(--cor-texto-secundario);font-size:12px;margin-left:8px;">
                            ${fmtEur(quotaBase)}
                        </span>
                    </span>
                </label>`).join("");

            aptsWrapper.style.display = "";
            atualizarBotaoGerar();
        } catch (err) {
            aptsSemApts.textContent = "Erro ao carregar apartamentos.";
            aptsSemApts.style.display = "";
        }
    });

    // Selecionar todos
    chkTodos.addEventListener("change", () => {
        document.querySelectorAll(".apt-check").forEach((c) => { c.checked = chkTodos.checked; });
        atualizarBotaoGerar();
    });

    // Qualquer checkbox individual
    aptsLista.addEventListener("change", () => {
        const total    = document.querySelectorAll(".apt-check").length;
        const marcados = document.querySelectorAll(".apt-check:checked").length;
        chkTodos.checked = marcados === total;
        chkTodos.indeterminate = marcados > 0 && marcados < total;
        atualizarBotaoGerar();
    });

    function atualizarBotaoGerar() {
        const sel = document.querySelectorAll(".apt-check:checked").length;
        btnGerar.disabled = sel === 0;
        aptsInfo.textContent = sel > 0 ? `${sel} apartamento(s) selecionado(s)` : "";
    }

    // Gerar quotas para os selecionados
    btnGerar.addEventListener("click", async () => {
        erroGerar.style.display    = "none";
        sucessoGerar.style.display = "none";

        const mes = inputMes.value;
        if (!mes) {
            erroGerar.textContent = "Selecione o mês.";
            erroGerar.style.display = "";
            return;
        }

        const selecionados = [...document.querySelectorAll(".apt-check:checked")]
            .map((c) => parseInt(c.dataset.id));

        if (!selecionados.length) return;

        btnGerar.disabled = true;
        btnGerar.textContent = "A gerar...";

        let ok = 0, erros = 0;
        for (const idApt of selecionados) {
            try {
                await window.api.post("/pagamentos", { id_apartamento: idApt, mes });
                ok++;
            } catch {
                erros++;
            }
        }

        btnGerar.textContent = "Gerar quota";

        if (erros === 0) {
            sucessoGerar.textContent = `${ok} quota(s) gerada(s) com sucesso!`;
            sucessoGerar.style.display = "";
            await carregar();
            setTimeout(fecharModal, 1500);
        } else {
            erroGerar.textContent = `${ok} geradas, ${erros} falharam (quota já existente para esse mês?).`;
            erroGerar.style.display = "";
            btnGerar.disabled = false;
            await carregar();
        }
    });

})();
