(async function () {

    let espacos        = [];
    let reservasEspaco = [];   // reservas do espaço selecionado (para verificar conflitos)

    const modal      = document.getElementById("modal-reserva");
    const erroDiv    = document.getElementById("erro-reserva");
    const selEspaco  = document.getElementById("r-espaco");
    const precoHora  = document.getElementById("r-preco-hora");
    const inputDia   = document.getElementById("r-dia");
    const inputInicio = document.getElementById("r-hora-inicio");
    const inputFim    = document.getElementById("r-hora-fim");
    const slotsDia   = document.getElementById("slots-ocupados-dia");
    const preview    = document.getElementById("reserva-preview");
    const tbody      = document.querySelector('[data-tabela="minhas-reservas"]');

    const fmtEur  = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";
    const fmtHora = (iso) => iso ? new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "—";
    const fmtDia  = (iso) => iso ? new Date(iso).toLocaleDateString("pt-PT") : "—";

    // ── Tabela de reservas ────────────────────────────────────────────────────

    async function carregarMinhasReservas() {
        try {
            const lista = await window.api.get("/alugueres-espaco/condomino");
            if (!lista.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Ainda não tens reservas.</p></td></tr>`;
                return;
            }
            tbody.innerHTML = lista.map((r) => {
                const nome  = r.espaco?.nome || `Espaço #${r.id_espaco}`;
                const horas = ((new Date(r.data_fim) - new Date(r.data_inicio)) / 3_600_000).toFixed(1);
                return `
                <tr>
                    <td>${nome}</td>
                    <td>${fmtDia(r.data_inicio)}</td>
                    <td>${fmtHora(r.data_inicio)}</td>
                    <td>${fmtHora(r.data_fim)}</td>
                    <td>${horas} h</td>
                    <td>${fmtEur(r.preco_total)}</td>
                </tr>`;
            }).join("");
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    // ── Carregar espaços do edifício ──────────────────────────────────────────

    async function carregarEspacos() {
        const conta = await window.api.me();
        const idEdif = conta?.id_edificio;
        if (!idEdif) throw new Error("A tua conta não tem edifício associado.");

        espacos = await window.api.get(`/espacos?id_edificio=${idEdif}`);
        selEspaco.innerHTML = `<option value="">Selecionar espaço...</option>` +
            espacos.map((e) =>
                `<option value="${e.id}" data-preco="${e.preco_hora ?? 0}">${e.nome}</option>`
            ).join("");
    }

    // ── Slots ocupados para o dia selecionado ─────────────────────────────────

    function mostrarSlotsOcupados() {
        const dia = inputDia.value;
        if (!dia || !reservasEspaco.length) {
            slotsDia.style.display = "none";
            return;
        }
        const ocupados = reservasEspaco.filter((r) => r.data_inicio.slice(0, 10) === dia);
        if (!ocupados.length) {
            slotsDia.style.display = "none";
            return;
        }
        slotsDia.style.display = "";
        slotsDia.innerHTML = "Horas ocupadas: " +
            ocupados.map((r) => `<span>${fmtHora(r.data_inicio)} – ${fmtHora(r.data_fim)}</span>`).join(" ");
    }

    // ── Preview de valor ──────────────────────────────────────────────────────

    function atualizarPreview() {
        const opt     = selEspaco.selectedOptions[0];
        const preco   = parseFloat(opt?.dataset.preco ?? 0);
        const dia     = inputDia.value;
        const inicio  = inputInicio.value;
        const fim     = inputFim.value;

        if (!opt?.value || !dia || !inicio || !fim) {
            preview.innerHTML = "Seleciona o espaço, dia e horas para ver o valor.";
            return;
        }

        const dtInicio = new Date(`${dia}T${inicio}:00`);
        const dtFim    = new Date(`${dia}T${fim}:00`);
        const horas    = (dtFim - dtInicio) / 3_600_000;

        if (horas <= 0) {
            preview.innerHTML = `<span style="color:var(--cor-erro);">A hora de fim deve ser posterior à hora de início.</span>`;
            return;
        }

        const total = preco * horas;
        preview.innerHTML = `<strong>${fmtEur(total)}</strong>`;
    }

    // ── Evento: mudar espaço ──────────────────────────────────────────────────

    selEspaco.addEventListener("change", async () => {
        const id = parseInt(selEspaco.value);
        const opt = selEspaco.selectedOptions[0];

        // mostrar preço/hora
        if (opt?.value) {
            const preco = parseFloat(opt.dataset.preco ?? 0);
            precoHora.style.display = "";
            precoHora.textContent   = `${fmtEur(preco)} / hora`;
        } else {
            precoHora.style.display = "none";
        }

        // carregar reservas do espaço
        reservasEspaco = [];
        if (id) {
            try {
                reservasEspaco = await window.api.get(`/alugueres-espaco/espaco/${id}`);
            } catch {}
        }

        mostrarSlotsOcupados();
        atualizarPreview();
    });

    // ── Eventos: mudar dia / horas ────────────────────────────────────────────

    inputDia.addEventListener("change", () => { mostrarSlotsOcupados(); atualizarPreview(); });
    inputInicio.addEventListener("change", atualizarPreview);
    inputFim.addEventListener("change", atualizarPreview);

    // ── Modal: abrir / fechar ─────────────────────────────────────────────────

    function abrirModal() {
        erroDiv.style.display = "none";
        document.getElementById("form-reserva").reset();
        precoHora.style.display  = "none";
        slotsDia.style.display   = "none";
        reservasEspaco           = [];
        preview.textContent      = "Seleciona o espaço, dia e horas para ver o valor.";

        // mínimo = hoje
        inputDia.min = new Date().toISOString().slice(0, 10);

        modal.removeAttribute("hidden");
    }

    function fecharModal() {
        modal.setAttribute("hidden", "");
    }

    document.getElementById("btn-nova-reserva").addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    // ── Confirmar reserva ─────────────────────────────────────────────────────

    document.getElementById("btn-confirmar-reserva").addEventListener("click", async () => {
        erroDiv.style.display = "none";

        const idEspaco = parseInt(selEspaco.value);
        const dia      = inputDia.value;
        const inicio   = inputInicio.value;
        const fim      = inputFim.value;

        if (!idEspaco)  { mostrarErro("Seleciona um espaço."); return; }
        if (!dia)       { mostrarErro("Indica o dia."); return; }
        if (!inicio)    { mostrarErro("Indica a hora de início."); return; }
        if (!fim)       { mostrarErro("Indica a hora de fim."); return; }

        const dtInicio = new Date(`${dia}T${inicio}:00`);
        const dtFim    = new Date(`${dia}T${fim}:00`);

        if (dtFim <= dtInicio) {
            mostrarErro("A hora de fim deve ser posterior à hora de início.");
            return;
        }

        // verificar conflito local antes de enviar
        const conflito = reservasEspaco.some((r) =>
            new Date(r.data_inicio) < dtFim && new Date(r.data_fim) > dtInicio
        );
        if (conflito) {
            mostrarErro("O período escolhido sobrepõe-se com uma reserva existente.");
            return;
        }

        const btn = document.getElementById("btn-confirmar-reserva");
        btn.disabled    = true;
        btn.textContent = "A reservar...";

        try {
            await window.api.post("/alugueres-espaco", {
                id_espaco:   idEspaco,
                data_inicio: `${dia}T${inicio}:00`,
                data_fim:    `${dia}T${fim}:00`,
            });
            fecharModal();
            await carregarMinhasReservas();
        } catch (e) {
            mostrarErro(e.message || "Não foi possível criar a reserva.");
        } finally {
            btn.disabled    = false;
            btn.textContent = "Confirmar reserva";
        }
    });

    function mostrarErro(msg) {
        erroDiv.textContent   = msg;
        erroDiv.style.display = "";
    }

    // ── Arranque ──────────────────────────────────────────────────────────────

    try {
        await carregarEspacos();
        await carregarMinhasReservas();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
    }

})();
