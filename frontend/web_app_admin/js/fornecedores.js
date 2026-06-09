

(async function () {

    let dados = [];


    function confirmar(texto) {
        return new Promise((resolve) => {
            const overlay = document.getElementById("modal-confirmar");
            document.getElementById("confirmar-texto").textContent = texto;
            overlay.removeAttribute("hidden");

            function fechar(resultado) {
                overlay.setAttribute("hidden", "");
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

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="fornecedores"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
                       target="_blank" rel="noopener noreferrer">
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

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dados);
        renderizar(dados.filter((p) =>
            (p.nome        || "").toLowerCase().includes(termo) ||
            (p.servico     || "").toLowerCase().includes(termo) ||
            (p.localizacao || "").toLowerCase().includes(termo)
        ));
    });

    const modal  = document.getElementById("modal-fornecedor");
    const erro   = document.getElementById("erro-fornecedor");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(parceiro = null) {
        erro.style.display = "none";
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
        modal.removeAttribute("hidden");
    }

    function fecharModal() { modal.setAttribute("hidden", ""); }

    document.getElementById("btn-novo").addEventListener("click", () => abrirModal());
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-guardar").addEventListener("click", async () => {
        erro.style.display = "none";

        const id          = document.getElementById("f-id").value;
        const nome        = document.getElementById("f-nome").value.trim();
        const servico     = document.getElementById("f-servico").value.trim()     || null;
        const localizacao = document.getElementById("f-localizacao").value.trim() || null;
        const siteRaw     = document.getElementById("f-site").value.trim();

        if (!nome || nome.length < 2) {
            erro.textContent = "Indique o nome da empresa.";
            erro.style.display = "";
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
            erro.style.display = "";
        }
    });


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
