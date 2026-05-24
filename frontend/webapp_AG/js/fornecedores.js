
// Parceiros (antigos fornecedores)
(async function () {

    let dados = [];

    // ── Modal de confirmação ──────────────────────────────────────────────────
    function confirmar(texto) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("modal-confirmar");
            document.getElementById("confirmar-texto").textContent = texto;
            overlay.hidden = false;

            function fechar(resultado) {
                overlay.hidden = true;
                btnOk.removeEventListener("click", onOk);
                btnCancelar.removeEventListener("click", onCancelar);
                btnCancelar2.removeEventListener("click", onCancelar);
                resolve(resultado);
            }
            const btnOk       = document.getElementById("confirmar-ok");
            const btnCancelar  = document.getElementById("confirmar-cancelar");
            const btnCancelar2 = document.getElementById("confirmar-cancelar2");
            const onOk       = () => fechar(true);
            const onCancelar = () => fechar(false);
            btnOk.addEventListener("click", onOk);
            btnCancelar.addEventListener("click", onCancelar);
            btnCancelar2.addEventListener("click", onCancelar);
        });
    }

    // ── Renderização ─────────────────────────────────────────────────────────
    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="fornecedores"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem parceiros</h3>
                        <p>Adicione o primeiro parceiro ao diretório de serviços externos.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((p) => {
            const ativo = p.status === 1;
            const site = p.site
                ? `<a href="${p.site.startsWith("http") ? p.site : "https://" + p.site}"
                       target="_blank" rel="noopener noreferrer" style="color:var(--cor-primaria);">
                       ${p.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                   </a>`
                : "—";
            const acoes = ativo
                ? `<button data-acao="editar"  data-id="${p.id}">Editar</button>
                   <button class="perigo" data-acao="desativar" data-id="${p.id}" data-nome="${p.nome}">Remover</button>`
                : `<button data-acao="ativar" data-id="${p.id}">Ativar</button>`;
            return `
                <tr style="${ativo ? "" : "opacity:0.45;"}">
                    <td><strong>${p.nome}</strong></td>
                    <td>${p.servico ? `<span class="estado estado--neutro">${p.servico}</span>` : "—"}</td>
                    <td>${p.localizacao || "—"}</td>
                    <td>${site}</td>
                    <td class="app-tabela__acoes">${acoes}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/parceiros/todos");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="fornecedores"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    // ── Pesquisa ─────────────────────────────────────────────────────────────
    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((p) =>
            (p.nome        || "").toLowerCase().includes(termo) ||
            (p.servico     || "").toLowerCase().includes(termo) ||
            (p.localizacao || "").toLowerCase().includes(termo)
        ));
    });

    // ── Modal criar/editar ────────────────────────────────────────────────────
    const modal  = document.getElementById("modal-fornecedor");
    const erro   = document.getElementById("erro-fornecedor");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(parceiro = null) {
        erro.hidden = true;
        document.getElementById("form-fornecedor").reset();
        if (parceiro) {
            titulo.textContent = "Editar parceiro";
            document.getElementById("f-id").value          = parceiro.id;
            document.getElementById("f-nome").value        = parceiro.nome        || "";
            document.getElementById("f-servico").value     = parceiro.servico     || "";
            document.getElementById("f-localizacao").value = parceiro.localizacao || "";
            document.getElementById("f-site").value        = parceiro.site        || "";
        } else {
            titulo.textContent = "Adicionar parceiro";
            document.getElementById("f-id").value = "";
        }
        modal.hidden = false;
    }

    function fecharModal() { modal.hidden = true; }

    document.getElementById("btn-novo").addEventListener("click", () => abrirModal());
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-guardar").addEventListener("click", async () => {
        erro.hidden = true;

        const id          = document.getElementById("f-id").value;
        const nome        = document.getElementById("f-nome").value.trim();
        const servico     = document.getElementById("f-servico").value.trim()     || null;
        const localizacao = document.getElementById("f-localizacao").value.trim() || null;
        const siteRaw     = document.getElementById("f-site").value.trim();

        if (!nome || nome.length < 2) {
            erro.textContent = "Indique o nome da empresa.";
            erro.hidden = false;
            return;
        }

        const site = siteRaw
            ? (siteRaw.startsWith("http") ? siteRaw : `https://${siteRaw}`)
            : null;

        try {
            if (id) {
                await window.api.put(`/parceiros/${id}`, { nome, servico, localizacao, site });
            } else {
                await window.api.post("/parceiros", { nome, servico, localizacao, site });
            }
            fecharModal();
            await carregar();
        } catch (e) {
            erro.textContent = e.message || "Não foi possível guardar.";
            erro.hidden = false;
        }
    });

    // ── Ações na tabela ───────────────────────────────────────────────────────
    document.querySelector('[data-tabela="fornecedores"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id      = parseInt(btn.dataset.id);
        const parceiro = dados.find((p) => p.id === id);

        if (btn.dataset.acao === "editar") {
            abrirModal(parceiro);
        }

        if (btn.dataset.acao === "desativar") {
            try { await window.api.delete(`/parceiros/${id}`); } catch (_) {}
            await carregar();
        }

        if (btn.dataset.acao === "ativar") {
            try { await window.api.put(`/parceiros/${id}`, { status: 1 }); } catch (_) {}
            await carregar();
        }
    });

})();
