
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    // Aguardar tipo
    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    const tipo = window.tipoAtual;

    let dados      = [];
    let edificios  = [];
    let idEdificio = null;

    const tbody    = document.querySelector('[data-tabela="avarias"]');
    const selectEd = document.getElementById("filtro-edificio");

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    function renderizar(lista) {
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem avarias</h3>
                        <p>Ainda não foram reportadas avarias.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((a) => {
            const resolvida = a.resolucao?.status === 1;
            const estadoBadge = resolvida
                ? `<span class="estado estado--ok">Resolvida</span>`
                : `<span class="estado estado--alerta">Aberta</span>`;
            const acoes = tipo === "gestor"
                ? `<button data-acao="alocar" data-id="${a.id}">Alocar técnico</button>`
                : `<button data-acao="resolver" data-id="${a.id}">Marcar resolvida</button>`;

            return `
                <tr>
                    <td>${fmtData(a.data_registo)}</td>
                    <td>${a.zona || "—"}</td>
                    <td>${(a.descricao || "").substring(0, 60)}${(a.descricao || "").length > 60 ? "..." : ""}</td>
                    <td>${estadoBadge}</td>
                    <td class="app-tabela__acoes">${acoes}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        if (!idEdificio) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Selecione um edifício.</p></td></tr>`;
            return;
        }
        try {
            // Gestor usa avarias por edificio; Técnico usa as suas
            if (tipo === "gestor") {
                dados = await window.api.get(`/avarias?id_edificio=${idEdificio}`);
            } else {
                dados = await window.api.get("/avarias/tecnico");
            }
            renderizar(dados);
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    // Técnico vê directamente as suas avarias sem seleccionar edifício
    if (tipo === "tecnico") {
        if (selectEd) selectEd.parentElement?.remove();
        idEdificio = -1; // trigger
        try {
            dados = await window.api.get("/avarias/tecnico");
            renderizar(dados);
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    } else {
        // Gestor — carregar lista de edifícios para o selector
        try {
            edificios = await window.api.get("/edificios");
            if (selectEd) {
                selectEd.innerHTML = `<option value="">— Selecione um edifício —</option>` +
                    edificios.map((e) => `<option value="${e.id}">${e.rua}${e.cidade ? ", " + e.cidade : ""}</option>`).join("");
                selectEd.addEventListener("change", () => {
                    idEdificio = selectEd.value ? parseInt(selectEd.value) : null;
                    carregar();
                });
                // Auto-seleccionar primeiro edifício
                if (edificios.length) {
                    selectEd.value = edificios[0].id;
                    idEdificio     = edificios[0].id;
                    await carregar();
                }
            }
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="5" class="app-vazio"><p>Erro a carregar edifícios: ${e.message}</p></td></tr>`;
        }
    }

    // Pesquisa
    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((a) =>
            (a.zona      || "").toLowerCase().includes(termo) ||
            (a.descricao || "").toLowerCase().includes(termo)
        ));
    });

    // ── Ações na tabela ───────────────────────────────────────────────────────
    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id    = parseInt(btn.dataset.id);
        const acao  = btn.dataset.acao;

        if (acao === "alocar") {
            const idTecnico = prompt("ID do técnico a alocar:");
            if (!idTecnico) return;
            try {
                await window.api.post(`/avarias/${id}/resolucao`, { id_tecnico: parseInt(idTecnico) });
                await carregar();
            } catch (err) { alert(err.message); }
        }

        if (acao === "resolver") {
            if (!confirm("Marcar esta avaria como resolvida?")) return;
            try {
                await window.api.put(`/avarias/${id}/resolucao`, { status: 1 });
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
