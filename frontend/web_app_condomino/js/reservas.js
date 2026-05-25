(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let minhasReservas = [];
    let reservasEspaco = [];
    let espacos = [];
    let contaAtual = null;

    const selectEspaco = document.getElementById("sel-espaco");
    const selectEspacoModal = document.getElementById("r-espaco");
    const inputInicio = document.getElementById("r-inicio");
    const inputFim = document.getElementById("r-fim");
    const calContainer = document.getElementById("calendario-reservas");
    const diasIndisponiveis = document.getElementById("dias-indisponiveis");
    const modal = document.getElementById("modal-reserva");
    const erro = document.getElementById("erro-reserva");

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "-";

    function toIsoDate(date) {
        return date.toISOString().slice(0, 10);
    }

    function enumerarDias(inicioIso, fimIso) {
        const dias = [];
        const atual = new Date(`${inicioIso}T00:00:00`);
        const fim = new Date(`${fimIso}T00:00:00`);
        while (atual <= fim) {
            dias.push(toIsoDate(atual));
            atual.setDate(atual.getDate() + 1);
        }
        return dias;
    }

    function diasReservadosDaLista(lista) {
        const ocupados = new Set();
        lista.forEach((r) => {
            const inicio = (r.data_inicio || "").slice(0, 10);
            const fimBase = new Date(r.data_fim);
            fimBase.setDate(fimBase.getDate() - 1);
            const fim = toIsoDate(fimBase);
            if (inicio && fim >= inicio) {
                enumerarDias(inicio, fim).forEach((dia) => ocupados.add(dia));
            }
        });
        return ocupados;
    }

    function renderizarOpcoesEspaco() {
        const opcoes = espacos.map((espaco) =>
            `<option value="${espaco.id}">${espaco.nome}</option>`
        ).join("");

        if (selectEspaco) {
            selectEspaco.innerHTML = `<option value="">- Selecione um espaco -</option>${opcoes}`;
        }
        if (selectEspacoModal) {
            selectEspacoModal.innerHTML = `<option value="">- Selecione um espaco -</option>${opcoes}`;
        }
    }

    async function carregarMinhasReservas() {
        const tbody = document.querySelector('[data-tabela="minhas-reservas"]');
        if (!tbody) return;
        try {
            minhasReservas = await window.api.get("/alugueres-espaco/condomino");
            if (!minhasReservas.length) {
                tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem reservas ativas.</p></td></tr>`;
                return;
            }
            tbody.innerHTML = minhasReservas.map((r) => {
                const espaco = espacos.find((e) => e.id === r.id_espaco);
                return `
                    <tr>
                        <td>${espaco?.nome || `Espaco #${r.id_espaco}`}</td>
                        <td>${fmtData(r.data_inicio)}</td>
                        <td>${fmtData(r.data_fim)}</td>
                        <td>${fmtEur(r.preco_total)}</td>
                    </tr>`;
            }).join("");
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    async function carregarEspacos() {
        contaAtual = await window.api.me();
        if (!contaAtual?.id_edificio) {
            throw new Error("Sem edificio associado.");
        }

        espacos = await window.api.get(`/espacos?id_edificio=${contaAtual.id_edificio}`);
        renderizarOpcoesEspaco();
    }

    async function carregarCalendario(idEspaco) {
        if (!calContainer) return;
        calContainer.innerHTML = "<p>A carregar disponibilidade...</p>";
        try {
            reservasEspaco = await window.api.get(`/alugueres-espaco/espaco/${idEspaco}`);
            const dias = [...diasReservadosDaLista(reservasEspaco)];
            if (!dias.length) {
                calContainer.innerHTML = `<p style="color:var(--cor-ok);">Espaco sem reservas, disponivel.</p>`;
                return;
            }
            calContainer.innerHTML = `
                <p style="margin-bottom:var(--esp-3);">Dias ja reservados:</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${dias.map((dia) => `<span class="estado estado--alerta">${dia}</span>`).join("")}
                </div>`;
        } catch (e) {
            calContainer.innerHTML = `<p style="color:var(--cor-erro);">${e.message}</p>`;
        }
    }

    async function atualizarDiasIndisponiveis(idEspaco) {
        if (!diasIndisponiveis) return;
        if (!idEspaco) {
            diasIndisponiveis.textContent = "Escolha um espaco para ver os dias ja reservados.";
            return;
        }

        const lista = await window.api.get(`/alugueres-espaco/espaco/${idEspaco}`);
        const dias = [...diasReservadosDaLista(lista)];
        diasIndisponiveis.innerHTML = dias.length
            ? `Dias ocupados: ${dias.join(", ")}`
            : "Nao existem dias reservados para este espaco.";
    }

    function mostrarModalReserva() {
        if (erro) {
            erro.style.display = "none";
            erro.textContent = "";
        }
        document.getElementById("form-reserva")?.reset();
        if (selectEspaco && selectEspaco.value && selectEspacoModal) {
            selectEspacoModal.value = selectEspaco.value;
            atualizarDiasIndisponiveis(selectEspaco.value).catch(() => {});
        }
        if (modal) modal.removeAttribute("hidden");
    }

    function esconderModalReserva() {
        if (modal) modal.setAttribute("hidden", "");
    }

    function mostrarErro(msg) {
        if (erro) {
            erro.textContent = msg;
            erro.style.display = "";
        }
    }

    document.getElementById("btn-nova-reserva")?.addEventListener("click", mostrarModalReserva);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", esconderModalReserva)
    );
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) esconderModalReserva();
    });

    selectEspaco?.addEventListener("change", async () => {
        if (selectEspaco.value) {
            await carregarCalendario(parseInt(selectEspaco.value, 10));
        } else if (calContainer) {
            calContainer.innerHTML = "Selecione um espaco para ver os dias ocupados.";
        }
    });

    selectEspacoModal?.addEventListener("change", async () => {
        await atualizarDiasIndisponiveis(parseInt(selectEspacoModal.value, 10) || null);
    });

    document.getElementById("btn-confirmar-reserva")?.addEventListener("click", async () => {
        const idEspaco = parseInt(selectEspacoModal?.value, 10);
        const dataInicio = inputInicio?.value;
        const dataFim = inputFim?.value;

        if (isNaN(idEspaco)) return mostrarErro("Selecione um espaco.");
        if (!dataInicio) return mostrarErro("Indique o dia de inicio.");
        if (!dataFim) return mostrarErro("Indique o dia de fim.");
        if (dataFim < dataInicio) return mostrarErro("O dia de fim nao pode ser anterior ao dia de inicio.");

        const ocupados = diasReservadosDaLista(await window.api.get(`/alugueres-espaco/espaco/${idEspaco}`));
        const diasPedido = enumerarDias(dataInicio, dataFim);
        if (diasPedido.some((dia) => ocupados.has(dia))) {
            return mostrarErro("Existem dias ja reservados dentro do periodo escolhido.");
        }

        const btn = document.getElementById("btn-confirmar-reserva");
        btn.disabled = true;
        btn.textContent = "A reservar...";

        try {
            await window.api.post("/alugueres-espaco", {
                id_espaco: idEspaco,
                data_inicio: `${dataInicio}T00:00:00`,
                data_fim: `${dataFim}T23:59:59`,
            });
            esconderModalReserva();
            await carregarMinhasReservas();
            if (selectEspaco?.value) {
                await carregarCalendario(parseInt(selectEspaco.value, 10));
            }
        } catch (e) {
            mostrarErro(e.message || "Nao foi possivel reservar.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Confirmar reserva";
        }
    });

    try {
        await carregarEspacos();
        await carregarMinhasReservas();
    } catch (e) {
        if (calContainer) calContainer.innerHTML = `<p style="color:var(--cor-erro);">${e.message}</p>`;
    }

})();
