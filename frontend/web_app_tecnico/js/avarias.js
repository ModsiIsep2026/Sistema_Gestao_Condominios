
(async function () {

    await new Promise((r) => setTimeout(r, 50));

    let dados = [];

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    function estadoBadge(resolucao) {
        if (!resolucao) return `<span class="estado estado--nova">Aberta</span>`;
        if (resolucao.status === 1) return `<span class="estado estado--ok">Resolvida</span>`;
        return `<span class="estado estado--prog">Em progresso</span>`;
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="avarias"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem avarias</h3>
                        <p>Não tem avarias atribuídas de momento.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((a) => {
            const resolvida = a.resolucao?.status === 1;
            const descLimpa = (a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
            return `
                <tr>
                    <td style="white-space:nowrap;">${fmtData(a.data_registo)}</td>
                    <td><strong>${a.zona || "—"}</strong></td>
                    <td style="font-size:13px;color:var(--cor-texto-secundario);">${descLimpa.substring(0, 60) || "—"}</td>
                    <td>${estadoBadge(a.resolucao)}</td>
                    <td class="app-tabela__acoes">
                        <button data-acao="detalhe" data-id="${a.id}"
                                style="font-size:12px;background:transparent;border:1px solid var(--cor-borda);color:var(--cor-texto-secundario);">Ver</button>
                        ${resolvida ? "" : `<button data-acao="resolver" data-id="${a.id}">✓ Resolvida</button>`}
                    </td>
                </tr>`;
        }).join("");
    }

    function filtrarERenderizar() {
        let lista = [...dados];
        const pesquisa = (document.querySelector("[data-pesquisa]")?.value || "").toLowerCase().trim();
        const estado   = document.getElementById("filtro-estado")?.value || "";

        if (pesquisa) lista = lista.filter((a) =>
            (a.zona || "").toLowerCase().includes(pesquisa) ||
            (a.descricao || "").toLowerCase().includes(pesquisa)
        );
        if (estado === "pendente")  lista = lista.filter((a) => !a.resolucao || a.resolucao.status !== 1);
        if (estado === "resolvida") lista = lista.filter((a) => a.resolucao?.status === 1);

        renderizar(lista);
    }

    async function carregar() {
        try {
            dados = await window.api.get("/avarias/tecnico");
            filtrarERenderizar();
        } catch (e) {
            document.querySelector('[data-tabela="avarias"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", filtrarERenderizar);
    document.getElementById("filtro-estado")?.addEventListener("change", filtrarERenderizar);

    const modalDetalhe = document.getElementById("modal-detalhe");

    function abrirModalDetalhe(avaria) {
        const corpo     = document.getElementById("detalhe-corpo");
        const descLimpa = (avaria.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
        const matchExt  = (avaria.descricao || "").match(/\[Externo: ([^\]]+)\]/);

        let html = `
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);width:130px;">Data</td>
                    <td>${fmtData(avaria.data_registo)}</td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Zona</td>
                    <td><strong>${avaria.zona || "—"}</strong></td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Estado</td>
                    <td>${estadoBadge(avaria.resolucao)}</td></tr>`;

        if (matchExt) {
            html += `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Serviço externo</td>
                         <td>🏢 ${matchExt[1]}</td></tr>`;
        }
        html += `</table>`;

        if (descLimpa) {
            html += `
                <hr style="margin:16px 0;border:none;border-top:1px solid var(--cor-borda);">
                <p style="font-size:12px;color:var(--cor-texto-secundario);margin:0 0 6px;
                          text-transform:uppercase;letter-spacing:.05em;">Descrição</p>
                <p style="font-size:13px;color:var(--cor-texto-secundario);white-space:pre-wrap;">${descLimpa.replace(/\n/g, "<br>")}</p>`;
        }

        corpo.innerHTML = html;
        modalDetalhe.hidden = false;
    }

    document.querySelectorAll("[data-fechar-modal-detalhe]").forEach((el) =>
        el.addEventListener("click", () => { modalDetalhe.hidden = true; })
    );
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.hidden = true;
    });

    document.querySelector('[data-tabela="avarias"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        const av = dados.find((a) => a.id === id);
        if (!av) return;

        if (btn.dataset.acao === "detalhe") {
            abrirModalDetalhe(av);
            return;
        }

        if (btn.dataset.acao === "resolver") {
            btn.disabled    = true;
            btn.textContent = "A guardar...";
            try {
                await window.api.put(`/avarias/${id}/resolucao`, { status: 1 });
                await carregar();
            } catch {
                btn.disabled    = false;
                btn.textContent = "✓ Resolvida";
            }
        }
    });

})();
