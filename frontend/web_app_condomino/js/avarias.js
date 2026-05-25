
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const modal  = document.getElementById("modal-avaria");
    const erro   = document.getElementById("erro-avaria");

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    function estadoBadge(avaria) {
        if (!avaria.resolucao) return `<span class="estado estado--alerta">Aberta</span>`;
        if (avaria.resolucao.status === 1) return `<span class="estado estado--ok">Resolvida</span>`;
        return `<span class="estado estado--neutro">Em progresso</span>`;
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="avarias"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        <h3>Sem avarias</h3>
                        <p>Ainda não reportou nenhuma avaria. Tudo bem por aqui!</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((a) => {
            const descLimpa = (a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
            const descExibir = descLimpa.length > 60 ? descLimpa.substring(0, 60) + "…" : (descLimpa || "—");
            return `
                <tr>
                    <td style="white-space:nowrap;">${fmtData(a.data_registo)}</td>
                    <td><strong>${a.zona || "—"}</strong></td>
                    <td style="font-size:13px;color:var(--cor-texto-suave);">${descExibir}</td>
                    <td>${estadoBadge(a)}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/avarias/condomino");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="avarias"]').innerHTML =
                `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    // Abrir / fechar modal
    function abrirModal() {
        if (erro) erro.style.display = "none";
        document.getElementById("form-avaria")?.reset();
        if (modal) modal.removeAttribute("hidden");
    }

    function fecharModal() {
        if (modal) modal.setAttribute("hidden", "");
    }

    document.getElementById("btn-reportar")?.addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) fecharModal();
    });

    // Submeter avaria
    document.getElementById("btn-submeter-avaria")?.addEventListener("click", async () => {
        const zona      = document.getElementById("a-zona")?.value.trim();
        const descricao = document.getElementById("a-descricao")?.value.trim() || null;

        if (!zona) {
            if (erro) {
                erro.textContent    = "Indique o local da avaria.";
                erro.style.display  = "";
            }
            return;
        }

        // id_edificio vem do perfil do utilizador autenticado
        for (let i = 0; i < 30; i++) {
            if (window.utilizadorAtual) break;
            await new Promise((r) => setTimeout(r, 100));
        }
        const idEdificio = window.utilizadorAtual?.id_edificio;
        if (!idEdificio) {
            if (erro) {
                erro.textContent   = "Nao foi possivel determinar o seu edificio.";
                erro.style.display = "";
            }
            return;
        }

        const btn = document.getElementById("btn-submeter-avaria");
        btn.disabled    = true;
        btn.textContent = "A enviar...";

        try {
            await window.api.post("/avarias", {
                id_edificio: idEdificio,
                zona,
                descricao,
            });
            fecharModal();
            await carregar();
        } catch (e) {
            if (erro) {
                erro.textContent   = e.message || "Nao foi possivel reportar a avaria.";
                erro.style.display = "";
            }
        } finally {
            btn.disabled    = false;
            btn.textContent = "Reportar avaria";
        }
    });

})();
