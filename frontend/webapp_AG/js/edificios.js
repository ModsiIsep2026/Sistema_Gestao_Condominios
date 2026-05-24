
(async function () {

    // Aguardar app.js
    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    const eAdmin = window.tipoAtual === "admin";

    let dadosEdificios = [];
    let filtroId = null;

    const params = new URLSearchParams(window.location.search);
    const idDaURL = params.get("id");
    if (idDaURL) filtroId = parseInt(idDaURL);

    function aplicarFiltroId(lista) {
        return filtroId == null ? lista : lista.filter((e) => e.id === filtroId);
    }

    function mostrarBannerFiltro(edificio) {
        let banner = document.getElementById("filtro-id-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "filtro-id-banner";
            banner.style.cssText = `background:rgba(240,138,36,.1);border:1px solid var(--cor-acento);
                border-left-width:4px;padding:var(--esp-3) var(--esp-4);margin-bottom:var(--esp-4);
                display:flex;justify-content:space-between;align-items:center;
                font-size:var(--tam-sm);color:var(--cor-primaria);`;
            document.querySelector(".app-filtros").parentNode
                .insertBefore(banner, document.querySelector(".app-filtros"));
        }
        banner.innerHTML = `
            <span>A mostrar apenas <strong>${edificio?.rua || "edifício seleccionado"}</strong> (vindo do mapa).</span>
            <button type="button" id="limpar-filtro-id"
                style="background:none;border:1px solid var(--cor-primaria);padding:6px 14px;cursor:pointer;
                       font-weight:600;text-transform:uppercase;letter-spacing:0.04em;font-size:var(--tam-xs);">
                Ver todos
            </button>`;
        document.getElementById("limpar-filtro-id").addEventListener("click", () => {
            filtroId = null;
            history.replaceState({}, "", "edificios.html");
            banner.remove();
            renderizar(dadosEdificios);
        });
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="edificios"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem edifícios</h3>
                        <p>${eAdmin ? "Não existem edifícios registados." : "Crie o primeiro edifício para começar."}</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((e) => {
            const temCoords = e.lat != null && e.lng != null;
            const streetView = temCoords
                ? `<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${e.lat},${e.lng}"
                       target="_blank" rel="noopener noreferrer" style="margin-right:6px;">Street View ↗</a>`
                : "";

            const acoes = eAdmin
                ? (streetView || "—")
                : `${streetView}
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
            const filtrados = aplicarFiltroId(dadosEdificios);
            renderizar(filtrados);
            if (filtroId != null) {
                mostrarBannerFiltro(dadosEdificios.find((e) => e.id === filtroId));
            }
        } catch (e) {
            document.querySelector('[data-tabela="edificios"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    // Admin só vê, não cria
    if (eAdmin) return;

    // Gestor pode adicionar
    const btnNovoEl = document.getElementById("btn-novo");
    if (btnNovoEl) btnNovoEl.style.display = "";

    // ── Pesquisa ──────────────────────────────────────────────────────────────
    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const base  = aplicarFiltroId(dadosEdificios);
        if (!termo) return renderizar(base);
        renderizar(base.filter((ed) =>
            (ed.rua    || "").toLowerCase().includes(termo) ||
            (ed.cidade || "").toLowerCase().includes(termo) ||
            (ed.cp     || "").toLowerCase().includes(termo)
        ));
    });

    // ── Modal ─────────────────────────────────────────────────────────────────
    const modal  = document.getElementById("modal-edificio");
    const erro   = document.getElementById("erro-edificio");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(edificio = null) {
        erro.hidden = true;
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

        const id          = document.getElementById("e-id").value;
        const rua         = document.getElementById("e-rua").value.trim();
        const cp          = document.getElementById("e-cp").value.trim()     || null;
        const cidade      = document.getElementById("e-cidade").value.trim() || null;
        const iban        = document.getElementById("e-iban").value.trim();
        const valorBase   = parseFloat(document.getElementById("e-valor-base").value);

        if (!rua) {
            erro.textContent = "Indique a morada do edifício.";
            erro.hidden = false;
            return;
        }
        if (!iban) {
            erro.textContent = "Indique o IBAN.";
            erro.hidden = false;
            return;
        }
        if (isNaN(valorBase) || valorBase <= 0) {
            erro.textContent = "Indique o valor base mensal.";
            erro.hidden = false;
            return;
        }

        const btn = document.getElementById("btn-guardar");
        btn.disabled    = true;
        btn.textContent = id ? "A guardar..." : "A adicionar...";

        // Geocodificar morada
        const coords = window.geocodificarMorada
            ? await window.geocodificarMorada(rua, cp, cidade)
            : null;

        const dados = {
            rua, cp, cidade, iban,
            valor_base_mensal: valorBase,
            lat: coords?.latitude  ?? null,
            lng: coords?.longitude ?? null,
        };

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
            erro.hidden = false;
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
            if (!confirm(`Remover o edifício "${edificio.rua}"?`)) return;
            try {
                await window.api.delete(`/edificios/${id}`);
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
