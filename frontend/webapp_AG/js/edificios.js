
(async function () {


    function perfilDoToken() {
        try {
            const token = sessionStorage.getItem("condo_token");
            if (!token) return null;
            const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            return payload.perfil ?? null;
        } catch { return null; }
    }
    const perfilAtual = perfilDoToken();
    const eSoAdmin = perfilAtual === 5;

    let dadosEdificios = [];
    let filtroId = null;

    const params = new URLSearchParams(window.location.search);
    const idDaURL = params.get("id");
    if (idDaURL) filtroId = parseInt(idDaURL);

    function temCoords(e) {
        return e.latitude != null && e.longitude != null;
    }

    function aplicarFiltroId(lista) {
        if (filtroId == null) return lista;
        return lista.filter((e) => e.id_edificio === filtroId);
    }

    function mostrarBannerFiltro(edificio) {
        let banner = document.getElementById("filtro-id-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "filtro-id-banner";
            banner.style.cssText = `
                background-color: rgba(240, 138, 36, 0.10);
                border: 1px solid var(--cor-acento);
                border-left-width: 4px;
                padding: var(--esp-3) var(--esp-4);
                margin-bottom: var(--esp-4);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: var(--tam-sm);
                color: var(--cor-primaria);
            `;
            const filtros = document.querySelector(".app-filtros");
            filtros.parentNode.insertBefore(banner, filtros);
        }
        banner.innerHTML = `
            <span>A mostrar apenas <strong>${edificio?.nome || "edifício seleccionado"}</strong> (vindo do mapa).</span>
            <button type="button" id="limpar-filtro-id"
                    style="background:none;border:1px solid var(--cor-primaria);padding:6px 14px;cursor:pointer;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;font-size:var(--tam-xs);">
                Ver todos
            </button>
        `;
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
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <h3>Sem edifícios</h3>
                        <p>${eSoAdmin ? "Não existem edifícios registados." : "Crie o primeiro edifício para começar."}</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((e) => {
            const streetView = temCoords(e)
                ? `<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${e.latitude},${e.longitude}"
                       target="_blank" rel="noopener noreferrer"
                       title="Abrir no Google Street View"
                       style="margin-right:6px;">Street View ↗</a>`
                : "";

            const acoes = eSoAdmin
                ? (streetView || "—")
                : `${streetView}
                   <button data-acao="editar" data-id="${e.id_edificio}">Editar</button>
                   <button class="perigo" data-acao="remover" data-id="${e.id_edificio}">Remover</button>`;

            return `
                <tr>
                    <td><strong>${e.nome}</strong></td>
                    <td>${e.morada}</td>
                    <td>${e.cidade || "—"}</td>
                    <td class="app-tabela__acoes">${acoes}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dadosEdificios = await window.api.get("/edificios");
            const filtrados = aplicarFiltroId(dadosEdificios);
            renderizar(filtrados);

            if (filtroId != null) {
                const edificio = dadosEdificios.find((e) => e.id_edificio === filtroId);
                mostrarBannerFiltro(edificio);
            }
        } catch (e) {
            document.querySelector('[data-tabela="edificios"]').innerHTML =
                `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();


    if (eSoAdmin) {
        const btnNovo = document.getElementById("btn-novo");
        if (btnNovo) btnNovo.hidden = true;
        return;
    }



    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const base = aplicarFiltroId(dadosEdificios);
        if (!termo) return renderizar(base);
        renderizar(base.filter((ed) =>
            (ed.nome || "").toLowerCase().includes(termo) ||
            (ed.cidade || "").toLowerCase().includes(termo) ||
            (ed.morada || "").toLowerCase().includes(termo)
        ));
    });

    const modal = document.getElementById("modal-edificio");
    const erro  = document.getElementById("erro-edificio");
    const titulo = document.getElementById("modal-titulo");

    function abrirModal(edificio = null) {
        erro.hidden = true;
        document.getElementById("form-edificio").reset();
        const btn = document.getElementById("btn-guardar");
        if (edificio) {
            titulo.textContent = "Editar edifício";
            btn.textContent = "Guardar";
            document.getElementById("e-id").value = edificio.id_edificio;
            document.getElementById("e-nome").value = edificio.nome || "";
            document.getElementById("e-morada").value = edificio.morada || "";
            document.getElementById("e-codigo-postal").value = edificio.codigo_postal || "";
            document.getElementById("e-cidade").value = edificio.cidade || "";
        } else {
            titulo.textContent = "Novo edifício";
            btn.textContent = "Adicionar";
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

        const id      = document.getElementById("e-id").value;
        const nome    = document.getElementById("e-nome").value.trim();
        const morada  = document.getElementById("e-morada").value.trim();
        const codigo_postal = document.getElementById("e-codigo-postal").value.trim() || null;
        const cidade  = document.getElementById("e-cidade").value.trim() || null;

        if (!nome || !morada) {
            erro.textContent = "Indique o nome e a morada.";
            erro.hidden = false;
            return;
        }

        const btn = document.getElementById("btn-guardar");
        const labelOriginal = btn.textContent;
        btn.disabled = true;
        btn.textContent = id ? "A guardar..." : "A adicionar...";

        const coords = await window.geocodificarMorada(morada, codigo_postal, cidade);
        const dados  = { nome, morada, codigo_postal, cidade,
            latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null };

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
            btn.disabled = false;
            btn.textContent = labelOriginal;
        }
    });

    document.querySelector('[data-tabela="edificios"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;

        const id = parseInt(btn.dataset.id);
        const edificio = dadosEdificios.find((ed) => ed.id_edificio === id);

        if (btn.dataset.acao === "editar") {
            abrirModal(edificio);
        }
        if (btn.dataset.acao === "remover") {
            if (!confirm(`Remover o edifício "${edificio.nome}"?`)) return;
            try {
                await window.api.delete(`/edificios/${id}`);
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
