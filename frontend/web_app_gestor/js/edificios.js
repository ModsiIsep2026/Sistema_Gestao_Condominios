
(async function () {


    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    const eAdmin = window.tipoAtual === "admin";

    let dadosEdificios = [];

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="edificios"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><rect x="2" y="7" width="20" height="14" rx="1"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>
                        <h3>Sem edifícios</h3>
                        <p>${eAdmin ? "Não existem edifícios registados na plataforma." : "Crie o primeiro edifício para começar."}</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((e) => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.rua, e.cp, e.cidade].filter(Boolean).join(", "))}`;
            const streetView = `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="margin-right:6px;">Ver no mapa ↗</a>`;

            const acoes = eAdmin
                ? (streetView || "—")
                : `${streetView}
                   <a href="edificio.html?id=${e.id}" style="text-decoration:none;">Gerir →</a>
                   <button data-acao="editar" data-id="${e.id}">Editar</button>
                   <button class="perigo" data-acao="remover" data-id="${e.id}">Remover</button>`;

            return `
                <tr>
                    <td><strong>${e.rua}</strong></td>
                    <td>${e.cp || "—"}</td>
                    <td>${e.cidade || "—"}</td>
                    <td>${e.valor_base_mensal != null
                        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(e.valor_base_mensal)
                        : "—"}</td>
                    <td class="app-tabela__acoes">${acoes}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            const endpoint = eAdmin ? "/edificios/todos" : "/edificios";
            dadosEdificios = await window.api.get(endpoint);
            renderizar(dadosEdificios);
        } catch (e) {
            document.querySelector('[data-tabela="edificios"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    if (eAdmin) return;


    const btnNovoEl = document.getElementById("btn-novo");
    if (btnNovoEl) btnNovoEl.style.display = "";


    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dadosEdificios);
        renderizar(dadosEdificios.filter((ed) =>
            (ed.rua    || "").toLowerCase().includes(termo) ||
            (ed.cidade || "").toLowerCase().includes(termo) ||
            (ed.cp     || "").toLowerCase().includes(termo)
        ));
    });

    const modal  = document.getElementById("modal-edificio");
    const erro   = document.getElementById("erro-edificio");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(edificio = null) {
        erro.style.display = "none";
        document.getElementById("form-edificio").reset();
        const btn = document.getElementById("btn-guardar");
        if (edificio) {
            titulo.textContent = "Editar edifício";
            btn.textContent    = "Guardar";
            document.getElementById("e-id").value              = edificio.id;
            document.getElementById("e-rua").value             = edificio.rua || "";
            document.getElementById("e-cp").value              = edificio.cp  || "";
            document.getElementById("e-cidade").value          = edificio.cidade || "";
            document.getElementById("e-iban").value            = edificio.iban || "";
            document.getElementById("e-valor-base").value      = edificio.valor_base_mensal ?? "";
        } else {
            titulo.textContent = "Novo edifício";
            btn.textContent    = "Adicionar";
            document.getElementById("e-id").value = "";
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

        const id        = document.getElementById("e-id").value;
        const rua       = document.getElementById("e-rua").value.trim();
        const cp        = document.getElementById("e-cp").value.trim()     || null;
        const cidade    = document.getElementById("e-cidade").value.trim() || null;
        const iban      = document.getElementById("e-iban").value.trim();
        const valorBase = parseFloat(document.getElementById("e-valor-base").value);

        if (!rua) {
            erro.textContent = "Indique a morada do edifício.";
            erro.style.display = "";
            return;
        }
        if (!iban) {
            erro.textContent = "Indique o IBAN.";
            erro.style.display = "";
            return;
        }
        if (isNaN(valorBase) || valorBase <= 0) {
            erro.textContent = "Indique a quota base mensal.";
            erro.style.display = "";
            return;
        }

        const btn = document.getElementById("btn-guardar");
        btn.disabled    = true;
        btn.textContent = id ? "A guardar..." : "A adicionar...";

        const dados = { rua, cp, cidade, iban, valor_base_mensal: valorBase };

        try {
            if (id) {
                await window.api.put(`/edificios/${id}`, dados);
            } else {
                await window.api.post("/edificios", dados);
            }
            fecharModal();
            await carregar();
        } catch (e) {
            erro.textContent = e.message || "Não foi possível guardar.";
            erro.style.display = "";
        } finally {
            btn.disabled    = false;
            btn.textContent = id ? "Guardar" : "Adicionar";
        }
    });

    document.querySelector('[data-tabela="edificios"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;

        const id       = parseInt(btn.dataset.id);
        const edificio = dadosEdificios.find((ed) => ed.id === id);

        if (btn.dataset.acao === "editar") {
            abrirModal(edificio);
        }
        if (btn.dataset.acao === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/edificios/${id}`);
                await carregar();
            } catch (err) {
                erro.textContent = err.message;
                erro.style.display = "";
                btn.disabled = false;
            }
        }
    });

})();
