

(async function () {

    let dadosEdificios = [];

    function temCoords(e) {
        return e.latitude != null && e.longitude != null;
    }

    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="edificios"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <h3>Sem edifícios</h3>
                        <p>Crie o primeiro edifício para começar.</p>
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
            return `
                <tr>
                    <td><strong>${e.nome}</strong></td>
                    <td>${e.morada}</td>
                    <td>${e.cidade || "—"}</td>
                    <td class="app-tabela__acoes">
                        ${streetView}
                        <button data-acao="editar" data-id="${e.id_edificio}">Editar</button>
                        <button class="perigo" data-acao="remover" data-id="${e.id_edificio}">Remover</button>
                    </td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dadosEdificios = await window.api.get("/edificios");
            renderizar(dadosEdificios);
        } catch (e) {
            document.querySelector('[data-tabela="edificios"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();


    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase().trim();
        if (!termo) return renderizar(dadosEdificios);
        renderizar(dadosEdificios.filter((ed) =>
            (ed.nome || "").toLowerCase().includes(termo) ||
            (ed.cidade || "").toLowerCase().includes(termo) ||
            (ed.morada || "").toLowerCase().includes(termo)
        ));
    });


    const modal = document.getElementById("modal-edificio");
    const erro = document.getElementById("erro-edificio");
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

        const id = document.getElementById("e-id").value;
        const nome = document.getElementById("e-nome").value.trim();
        const morada = document.getElementById("e-morada").value.trim();
        const codigo_postal = document.getElementById("e-codigo-postal").value.trim() || null;
        const cidade = document.getElementById("e-cidade").value.trim() || null;

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

        const dados = {
            nome, morada, codigo_postal, cidade,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
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
            if (!confirm(`Remover o edifício "${edificio.nome}"? Esta ação é irreversível.`)) return;
            try {
                await window.api.delete(`/edificios/${id}`);
                await carregar();
            } catch (err) { alert(err.message); }
        }
    });

})();
