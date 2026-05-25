
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

    function localAvaria(a) {
        const rua    = a.edificio?.rua;
        const fracao = a.condomino?.apartamento?.fracao;
        const andar  = a.condomino?.apartamento?.andar;
        if (!rua) return "—";
        let txt = `<span style="font-size:12px;font-weight:600;">${rua}</span>`;
        if (fracao) txt += `<br><span style="font-size:11px;color:var(--cor-texto-secundario);">Fração ${fracao}${andar != null ? " · " + andar + "º" : ""}</span>`;
        return txt;
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="avarias"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        <h3>Sem avarias</h3>
                        <p>Sem ocorrências atribuídas de momento. Continue o bom trabalho!</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((a) => {
            const resolvida = a.resolucao?.status === 1;
            const descBase  = (a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").replace(/\nNota:.*$/s, "").trim();
            const descExibir = descBase.length > 60 ? descBase.substring(0, 60) + "…" : (descBase || "—");
            return `
                <tr>
                    <td style="white-space:nowrap;">${fmtData(a.data_registo)}</td>
                    <td><strong>${a.zona || "—"}</strong></td>
                    <td style="font-size:13px;color:var(--cor-texto-secundario);">${descExibir}</td>
                    <td style="font-size:12px;">${localAvaria(a)}</td>
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

    function calcularPassosTecnico(resolucao) {
        // Passos: Atribuída → Em progresso → Resolvida
        const passos = ["Atribuída", "Em progresso", "Resolvida"];
        let atual = 0;
        if (resolucao) {
            if (resolucao.status === 1) atual = 2;
            else atual = 1;
        }
        return { passos, atual };
    }

    function renderizarPipelineTecnico(passos, atual) {
        return `<div class="av-pipeline">` +
            passos.map((nome, i) => {
                let cls = "av-pipeline__passo";
                let icone = "";
                if (i < atual) {
                    cls += " av-pipeline__passo--feito";
                    icone = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                } else if (i === atual) {
                    cls += " av-pipeline__passo--ativo";
                    icone = `<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;"></span>`;
                }
                return `<div class="${cls}">
                    <div class="av-pipeline__circulo">${icone}</div>
                    <div class="av-pipeline__rotulo">${nome}</div>
                </div>`;
            }).join("") +
        `</div>`;
    }

    function abrirModalDetalhe(avaria) {
        const corpo     = document.getElementById("detalhe-corpo");
        const descLimpa = (avaria.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
        const matchNota = descLimpa.match(/\nNota: (.+)$/s);
        const descBase  = descLimpa.replace(/\nNota:.*$/s, "").trim();
        const matchExt  = (avaria.descricao || "").match(/\[Externo: ([^\]]+)\]/);

        const edRua     = avaria.edificio?.rua;
        const condNome  = avaria.condomino?.nome;
        const aptFracao = avaria.condomino?.apartamento?.fracao;
        const aptAndar  = avaria.condomino?.apartamento?.andar;

        const { passos, atual } = calcularPassosTecnico(avaria.resolucao);
        let html = renderizarPipelineTecnico(passos, atual);

        html += `
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);width:130px;">Data</td>
                    <td>${fmtData(avaria.data_registo)}</td></tr>
                ${edRua ? `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Edifício</td>
                    <td>${edRua}</td></tr>` : ""}
                ${aptFracao ? `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Apartamento</td>
                    <td>Fração ${aptFracao}${aptAndar != null ? " — " + aptAndar + "º andar" : ""}</td></tr>` : ""}
                ${condNome ? `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Reportado por</td>
                    <td><strong>${condNome}</strong></td></tr>` : ""}
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Zona</td>
                    <td><strong>${avaria.zona || "—"}</strong></td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Estado</td>
                    <td>${estadoBadge(avaria.resolucao)}</td></tr>`;

        if (matchExt) {
            html += `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Serviço externo</td>
                         <td>🏢 ${matchExt[1]}</td></tr>`;
        }
        if (matchNota) {
            html += `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Nota do gestor</td>
                         <td style="font-style:italic;">${matchNota[1].replace(/\n/g, "<br>")}</td></tr>`;
        }
        html += `</table>`;

        if (descBase) {
            html += `
                <hr style="margin:16px 0;border:none;border-top:1px solid var(--cor-borda);">
                <p style="font-size:12px;color:var(--cor-texto-secundario);margin:0 0 6px;
                          text-transform:uppercase;letter-spacing:.05em;">Descrição</p>
                <p style="font-size:13px;color:var(--cor-texto-secundario);white-space:pre-wrap;">${descBase.replace(/\n/g, "<br>")}</p>`;
        }

        corpo.innerHTML = html;
        modalDetalhe.removeAttribute("hidden");
    }

    document.querySelectorAll("[data-fechar-modal-detalhe]").forEach((el) =>
        el.addEventListener("click", () => { modalDetalhe.setAttribute("hidden", ""); })
    );
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.setAttribute("hidden", "");
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
