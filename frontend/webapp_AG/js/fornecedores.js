
(async function () {

    let dados = [];

    function eur(v) {
        if (v == null || v === "") return "—";
        return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
    }

    function linkSite(url) {
        if (!url) return "—";
        const visivel = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
        const seguro = url.startsWith("http") ? url : `https://${url}`;
        return `<a href="${seguro}" target="_blank" rel="noopener noreferrer" style="color:var(--cor-primaria);">${visivel}</a>`;
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="fornecedores"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem fornecedores</h3>
                        <p>Adicione o primeiro fornecedor para o diretório de serviços externos.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((f) => `
            <tr>
                <td><strong>${f.nome}</strong></td>
                <td>${f.servico ? `<span class="estado estado--neutro">${f.servico}</span>` : "—"}</td>
                <td>${linkSite(f.site)}</td>
                <td><strong>${eur(f.preco_hora)}</strong></td>
                <td class="app-tabela__acoes">
                    <button data-acao="editar" data-id="${f.id_fornecedor}">Editar</button>
                    <button class="perigo" data-acao="remover" data-id="${f.id_fornecedor}">Remover</button>
                </td>
            </tr>
        `).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/fornecedores");
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
        renderizar(dados.filter((f) =>
            (f.nome || "").toLowerCase().includes(termo) ||
            (f.servico || "").toLowerCase().includes(termo)
        ));
    });

    const modal = document.getElementById("modal-fornecedor");
    const erro = document.getElementById("erro-fornecedor");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(fornecedor = null) {
        erro.hidden = true;
        document.getElementById("form-fornecedor").reset();
        if (fornecedor) {
            titulo.textContent = "Editar fornecedor";
            document.getElementById("f-id").value = fornecedor.id_fornecedor;
            document.getElementById("f-nome").value = fornecedor.nome || "";
            document.getElementById("f-servico").value = fornecedor.servico || "";
            document.getElementById("f-site").value = fornecedor.site || "";
            document.getElementById("f-preco-hora").value = fornecedor.preco_hora ?? "";
        } else {
            titulo.textContent = "Adicionar fornecedor";
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

        const id = document.getElementById("f-id").value;
        const nome = document.getElementById("f-nome").value.trim();
        const servico = document.getElementById("f-servico").value.trim() || null;
        const siteRaw = document.getElementById("f-site").value.trim();
        const precoRaw = document.getElementById("f-preco-hora").value.trim();

        if (!nome || nome.length < 2) {
            erro.textContent = "Indique o nome da empresa.";
            erro.hidden = false;
            return;
        }

        let site = null;
        if (siteRaw) {
            site = siteRaw.startsWith("http") ? siteRaw : `https://${siteRaw}`;
        }

        let preco_hora = null;
        if (precoRaw !== "") {
            preco_hora = parseFloat(precoRaw);
            if (isNaN(preco_hora) || preco_hora < 0) {
                erro.textContent = "Indique um preço válido (em euros).";
                erro.hidden = false;
                return;
            }
        }

        const payload = { nome, servico, site, preco_hora };

        try {
            if (id) {
                await window.api.put(`/fornecedores/${id}`, payload);
            } else {
                await window.api.post("/fornecedores", payload);
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
        const id = parseInt(btn.dataset.id);
        const fornecedor = dados.find((f) => f.id_fornecedor === id);

        if (btn.dataset.acao === "editar") {
            abrirModal(fornecedor);
        }
        if (btn.dataset.acao === "remover") {
            if (!confirm(`Remover o fornecedor "${fornecedor.nome}"?`)) return;
            try {
                await window.api.delete(`/fornecedores/${id}`);
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
