(async function () {

    let dados     = [];
    let edificios = [];

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    const fmtMes = (m) => {
        if (!m) return "—";
        const [ano, mes] = m.split("-");
        const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        return `${nomes[parseInt(mes) - 1]} ${ano}`;
    };

    const selEdificio = document.getElementById("filtro-edificio");
    const inputMes    = document.getElementById("filtro-mes");
    const selEstado   = document.getElementById("filtro-estado");
    const btnGerar    = document.getElementById("btn-gerar-quota");
    const tbody       = document.querySelector('[data-tabela="quotas"]');

    // mês atual por defeito
    const hoje = new Date();
    inputMes.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

    // ── Renderizar tabela ─────────────────────────────────────────────────────

    function renderizar(lista) {
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M19 6a8 8 0 1 0 0 12"/><line x1="2" y1="10" x2="14" y2="10"/><line x1="2" y1="14" x2="14" y2="14"/></svg>
                        <h3>Sem quotas</h3>
                        <p>Não existem quotas para os filtros selecionados.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((p) => {
            const apt  = p.apartamento;
            const frac = apt ? `Fração ${apt.fracao}${apt.andar != null ? " · " + apt.andar + "º" : ""}` : `Apt. ${p.id_apartamento}`;
            const edif = apt?.edificio?.rua || "";
            return `
            <tr>
                <td>
                    <strong>${frac}</strong>
                    ${edif ? `<br><span style="font-size:12px;color:var(--cor-texto-secundario);">${edif}</span>` : ""}
                </td>
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
            </tr>`;
        }).join("");
    }

    function atualizarResumo(lista) {
        const total     = lista.length;
        const pagos     = lista.filter((p) => p.estado === 1).length;
        const montante  = lista.filter((p) => p.estado === 1).reduce((s, p) => s + parseFloat(p.valor || 0), 0);

        document.getElementById("resumo-total").textContent     = total;
        document.getElementById("resumo-pagos").textContent     = pagos;
        document.getElementById("resumo-pendentes").textContent = total - pagos;
        document.getElementById("resumo-montante").textContent  = fmtEur(montante);
    }

    function aplicarFiltros() {
        let lista = [...dados];
        const edificio = selEdificio.value;
        const mes      = inputMes.value;
        const estado   = selEstado.value;

        if (edificio) lista = lista.filter((p) => String(p.apartamento?.id_edificio) === edificio);
        if (mes)      lista = lista.filter((p) => p.mes === mes);
        if (estado === "pago")     lista = lista.filter((p) => p.estado === 1);
        if (estado === "pendente") lista = lista.filter((p) => p.estado !== 1);

        renderizar(lista);
        atualizarResumo(lista);
    }

    async function carregar() {
        try {
            dados = await window.api.get("/pagamentos/gestor");
            aplicarFiltros();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    // ── Carregar edifícios ────────────────────────────────────────────────────

    try {
        edificios = await window.api.get("/edificios");
        edificios.forEach((e) => {
            selEdificio.innerHTML += `<option value="${e.id}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`;
        });
    } catch {}

    // ── Listeners dos filtros ─────────────────────────────────────────────────

    selEdificio.addEventListener("change", () => {
        // botão "Gerar quota" só ativo quando edifício + mês estão preenchidos
        btnGerar.disabled = !selEdificio.value || !inputMes.value;
        aplicarFiltros();
    });

    inputMes.addEventListener("change", () => {
        btnGerar.disabled = !selEdificio.value || !inputMes.value;
        aplicarFiltros();
    });

    selEstado.addEventListener("change", aplicarFiltros);

    // ── Marcar paga inline ────────────────────────────────────────────────────

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao='marcar-pago']");
        if (!btn) return;
        btn.disabled = true;
        try {
            await window.api.post(`/pagamentos/${btn.dataset.id}/marcar-paga`);
            await carregar();
        } catch { btn.disabled = false; }
    });

    // ── Gerar quota ───────────────────────────────────────────────────────────

    btnGerar.addEventListener("click", async () => {
        const idEdif = parseInt(selEdificio.value);
        const mes    = inputMes.value;
        if (!idEdif || !mes) return;

        btnGerar.disabled    = true;
        btnGerar.textContent = "A gerar...";

        try {
            const apts = await window.api.get(`/apartamentos?id_edificio=${idEdif}`);
            if (!apts.length) {
                btnGerar.textContent = "Gerar quota";
                btnGerar.disabled = false;
                return;
            }

            let ok = 0, jaExistem = 0, erros = 0;
            for (const a of apts) {
                try {
                    await window.api.post("/pagamentos", { id_apartamento: a.id, mes });
                    ok++;
                } catch (e) {
                    if (e.message?.includes("já realizou") || e.message?.includes("já existe")) {
                        jaExistem++;
                    } else {
                        erros++;
                    }
                }
            }

            await carregar();

            let msg = "";
            if (ok > 0)        msg += `${ok} quota(s) gerada(s). `;
            if (jaExistem > 0) msg += `${jaExistem} já existiam. `;
            if (erros > 0)     msg += `${erros} erro(s).`;
            if (msg) {
                if (erros > 0) window.toast?.error(msg.trim());
                else window.toast?.success(msg.trim());
            }

        } catch (e) {
            window.toast?.error(e.message || "Erro ao gerar quotas.");
        } finally {
            btnGerar.textContent = "Gerar quota";
            btnGerar.disabled = !selEdificio.value || !inputMes.value;
        }
    });

})();
