
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let minhasReservas = [];
    let reservasEspaco = [];
    let idEspacoSel    = null;

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "—";
    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";

    async function carregarMinhasReservas() {
        const tbody = document.querySelector('[data-tabela="minhas-reservas"]');
        if (!tbody) return;
        try {
            minhasReservas = await window.api.get("/alugueres-espaco/condomino");
            if (!minhasReservas.length) {
                tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem reservas ativas.</p></td></tr>`;
                return;
            }
            tbody.innerHTML = minhasReservas.map((r) => `
                <tr>
                    <td>Espaço ${r.id_espaco}</td>
                    <td>${fmtData(r.data_inicio)}</td>
                    <td>${fmtData(r.data_fim)}</td>
                    <td>${fmtEur(r.preco_total)}</td>
                </tr>`).join("");
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregarMinhasReservas();

    const selectEspaco = document.getElementById("sel-espaco");
    const calContainer = document.getElementById("calendario-reservas");

    async function carregarCalendario(idEspaco) {
        if (!calContainer) return;
        calContainer.innerHTML = `<p>A carregar disponibilidade...</p>`;
        try {
            reservasEspaco = await window.api.get(`/alugueres-espaco/espaco/${idEspaco}`);
            if (!reservasEspaco.length) {
                calContainer.innerHTML = `<p style="color:var(--cor-ok);">✓ Espaço sem reservas — disponível!</p>`;
                return;
            }
            calContainer.innerHTML = `
                <p style="margin-bottom:var(--esp-3);">Períodos já reservados:</p>
                <ul style="list-style:none;padding:0;margin:0;">
                    ${reservasEspaco.map((r) => `
                        <li style="padding:var(--esp-2) 0;border-bottom:1px solid var(--cor-borda);">
                            <span class="estado estado--alerta">Ocupado</span>
                            ${fmtData(r.data_inicio)} → ${fmtData(r.data_fim)}
                        </li>`).join("")}
                </ul>`;
        } catch (e) {
            calContainer.innerHTML = `<p style="color:var(--cor-erro);">${e.message}</p>`;
        }
    }

    selectEspaco?.addEventListener("change", async () => {
        idEspacoSel = selectEspaco.value ? parseInt(selectEspaco.value) : null;
        if (idEspacoSel) await carregarCalendario(idEspacoSel);
    });

    const modal = document.getElementById("modal-reserva");
    const erro  = document.getElementById("erro-reserva");

    document.getElementById("btn-nova-reserva")?.addEventListener("click", () => {
        if (erro) erro.style.display = "none";
        document.getElementById("form-reserva")?.reset();
        if (modal) modal.hidden = false;
    });
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", () => { if (modal) modal.hidden = true; })
    );
    modal?.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

    document.getElementById("btn-confirmar-reserva")?.addEventListener("click", async () => {
        if (erro) erro.style.display = "none";

        const idEspaco   = parseInt(document.getElementById("r-espaco")?.value);
        const dataInicio = document.getElementById("r-inicio")?.value;
        const dataFim    = document.getElementById("r-fim")?.value;

        const mostrarErro = (msg) => { if (erro) { erro.textContent = msg; erro.style.display = ""; } };

        if (isNaN(idEspaco))         { mostrarErro("Selecione o espaço.");                                    return; }
        if (!dataInicio)             { mostrarErro("Indique a data de início.");                               return; }
        if (!dataFim)                { mostrarErro("Indique a data de fim.");                                  return; }
        if (dataFim <= dataInicio)   { mostrarErro("A data de fim tem de ser posterior à de início.");        return; }

        const btn = document.getElementById("btn-confirmar-reserva");
        btn.disabled    = true;
        btn.textContent = "A reservar...";

        try {
            await window.api.post("/alugueres-espaco", { id_espaco: idEspaco, data_inicio: dataInicio, data_fim: dataFim });
            if (modal) modal.hidden = true;
            await carregarMinhasReservas();
            if (idEspacoSel) await carregarCalendario(idEspacoSel);
        } catch (e) {
            mostrarErro(e.message || "Não foi possível reservar.");
        } finally {
            btn.disabled    = false;
            btn.textContent = "Confirmar reserva";
        }
    });

})();
