
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="avarias"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <h3>Sem avarias</h3>
                        <p>Ainda não reportou nenhuma avaria.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((a) => `
            <tr>
                <td>${fmtData(a.data_registo)}</td>
                <td>${a.zona || "—"}</td>
                <td>${(a.descricao || "").substring(0, 60)}</td>
                <td>${a.resolucao?.status === 1
                    ? '<span class="estado estado--ok">Resolvida</span>'
                    : '<span class="estado estado--alerta">Aberta</span>'}</td>
            </tr>`).join("");
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

    const modal = document.getElementById("modal-avaria");
    const erro  = document.getElementById("erro-avaria");

    document.getElementById("btn-reportar")?.addEventListener("click", () => {
        if (erro) erro.style.display = "none";
        document.getElementById("form-avaria")?.reset();
        if (modal) modal.hidden = false;
    });
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", () => { if (modal) modal.hidden = true; })
    );
    modal?.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

    document.getElementById("btn-submeter-avaria")?.addEventListener("click", async () => {
        if (erro) erro.style.display = "none";

        const id_edificio = parseInt(document.getElementById("a-edificio")?.value);
        const zona        = document.getElementById("a-zona")?.value.trim();
        const descricao   = document.getElementById("a-descricao")?.value.trim() || null;

        if (isNaN(id_edificio)) {
            if (erro) { erro.textContent = "Indique o edifício."; erro.style.display = ""; }
            return;
        }
        if (!zona) {
            if (erro) { erro.textContent = "Indique a zona."; erro.style.display = ""; }
            return;
        }

        const btn = document.getElementById("btn-submeter-avaria");
        btn.disabled    = true;
        btn.textContent = "A enviar...";

        try {
            await window.api.post("/avarias", { id_edificio, zona, descricao });
            if (modal) modal.hidden = true;
            await carregar();
        } catch (e) {
            if (erro) { erro.textContent = e.message || "Erro ao reportar."; erro.style.display = ""; }
        } finally {
            btn.disabled    = false;
            btn.textContent = "Reportar avaria";
        }
    });

})();
