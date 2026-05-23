
// Parceiros (antigos fornecedores)
(async function () {

    let dados = [];

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
            const site = p.site
                ? `<a href="${p.site.startsWith("http") ? p.site : "https://" + p.site}"
                       target="_blank" rel="noopener noreferrer" style="color:var(--cor-primaria);">
                       ${p.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                   </a>`
                : "—";
            return `
                <tr>
                    <td><strong>${p.nome}</strong></td>
                    <td>${p.servico ? `<span class="estado estado--neutro">${p.servico}</span>` : "—"}</td>
                    <td>${p.localizacao || "—"}</td>
                    <td>${site}</td>
                    <td class="app-tabela__acoes">
                        <button data-acao="editar" data-id="${p.id}">Editar</button>
                        <button class="perigo" data-acao="remover" data-id="${p.id}">Remover</button>
                    </td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/parceiros");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="fornecedores"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((p) =>
            (p.nome        || "").toLowerCase().includes(termo) ||
            (p.servico     || "").toLowerCase().includes(termo) ||
            (p.localizacao || "").toLowerCase().includes(termo)
        ));
    });

    const modal    = document.getElementById("modal-fornecedor");
    const erro     = document.getElementById("erro-fornecedor");
    const titulo   = document.getElementById("modal-titulo");

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

        const dadosParaEnviar = { nome, servico, localizacao, site };

        try {
            if (id) {
                await window.api.put(`/parceiros/${id}`, dadosParaEnviar);
            } else {
                await window.api.post("/parceiros", dadosParaEnviar);
            }
            fecharModal();
            await carregar();
        } catch (e) {
            erro.textContent = e.message || "Não foi possível guardar.";
            erro.hidden = false;
        }
    });

    document.querySelector('[data-tabela="fornecedores"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id      = parseInt(btn.dataset.id);
        const parceiro = dados.find((p) => p.id === id);

        if (btn.dataset.acao === "editar")  { abrirModal(parceiro); }
        if (btn.dataset.acao === "remover") {
            if (!confirm(`Remover o parceiro "${parceiro?.nome}"?`)) return;
            try {
                await window.api.delete(`/parceiros/${id}`);
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
