
(async function () {

    let edificios       = [];
    let espacos         = [];
    let edificioAtual   = null;
    let espacoAtualId   = null;   

    const fmtEur = (v) => v != null
        ? new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v)
        : "—";


    async function carregarEdificios() {
        try {
            edificios = await window.api.get("/edificios");
            const sel = document.getElementById("sel-edificio");
            sel.innerHTML = `<option value="">Selecione um edifício...</option>`;
            edificios.forEach((e) => {
                sel.innerHTML += `<option value="${e.id}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`;
            });
        } catch (err) {
        }
    }


    async function carregarEspacos(idEdificio) {
        const tbody = document.querySelector('[data-tabela="espacos"]');
        tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr>`;
        try {
            espacos = await window.api.get(`/espacos?id_edificio=${idEdificio}`);
            renderizarEspacos();
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Erro: ${err.message}</p></td></tr>`;
        }
    }

    function renderizarEspacos() {
        const tbody = document.querySelector('[data-tabela="espacos"]');
        if (!espacos.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <h3>Sem espaços</h3>
                        <p>Adicione o primeiro espaço a este edifício.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = espacos.map((e) => {
            const ativo = e.status === 1;
            return `
                <tr style="${ativo ? "" : "opacity:0.5;"}">
                    <td><strong>${e.nome}</strong></td>
                    <td>${e.preco_hora > 0 ? fmtEur(e.preco_hora) + "/h" : "Gratuito"}</td>
                    <td>${ativo
                        ? '<span class="estado estado--ok">Ativo</span>'
                        : '<span class="estado estado--erro">Inativo</span>'}</td>
                    <td class="app-tabela__acoes">
                        <button data-acao="materiais"  data-id="${e.id}" data-nome="${e.nome}">Materiais</button>
                        <button data-acao="editar"     data-id="${e.id}">Editar</button>
                        <button data-acao="remover"    data-id="${e.id}" class="perigo">Remover</button>
                    </td>
                </tr>`;
        }).join("");
    }


    document.getElementById("sel-edificio").addEventListener("change", async (e) => {
        const id = parseInt(e.target.value);
        const painel = document.getElementById("painel-espacos");
        const btnNovo = document.getElementById("btn-novo-espaco");

        if (!id) {
            painel.style.display = "none";
            btnNovo.style.display = "none";
            return;
        }

        edificioAtual = id;
        const edif = edificios.find((ed) => ed.id === id);
        document.getElementById("titulo-espacos").textContent =
            `Espaços de ${edif?.rua || "edifício"}`;

        painel.style.display = "";
        btnNovo.style.display = "";
        await carregarEspacos(id);
    });


    const modalEspaco = document.getElementById("modal-espaco");
    const erroEspaco  = document.getElementById("erro-espaco");

    function abrirModalEspaco(espaco = null) {
        erroEspaco.style.display = "none";
        document.getElementById("form-espaco").reset();
        const btn = document.getElementById("btn-guardar-espaco");
        if (espaco) {
            document.getElementById("modal-espaco-titulo").textContent = "Editar espaço";
            btn.textContent = "Guardar";
            document.getElementById("es-id").value    = espaco.id;
            document.getElementById("es-nome").value  = espaco.nome || "";
            document.getElementById("es-preco").value = espaco.preco_hora ?? 0;
        } else {
            document.getElementById("modal-espaco-titulo").textContent = "Novo espaço";
            btn.textContent = "Adicionar";
            document.getElementById("es-id").value = "";
        }
        modalEspaco.style.display = "";
    }

    function fecharModalEspaco() { modalEspaco.style.display = "none"; }

    document.getElementById("btn-novo-espaco").addEventListener("click", () => abrirModalEspaco());
    document.querySelectorAll("[data-fechar-espaco]").forEach((el) =>
        el.addEventListener("click", fecharModalEspaco)
    );
    modalEspaco.addEventListener("click", (e) => { if (e.target === modalEspaco) fecharModalEspaco(); });


    document.getElementById("btn-guardar-espaco").addEventListener("click", async () => {
        erroEspaco.style.display = "none";
        const id        = document.getElementById("es-id").value;
        const nome      = document.getElementById("es-nome").value.trim();
        const precoHora = parseFloat(document.getElementById("es-preco").value) || 0;

        if (!nome) {
            erroEspaco.textContent = "Indique o nome do espaço.";
            erroEspaco.style.display = "";
            return;
        }

        const btn = document.getElementById("btn-guardar-espaco");
        btn.disabled = true;
        try {
            if (id) {
                await window.api.put(`/espacos/${id}`, { nome, preco_hora: precoHora });
            } else {
                await window.api.post("/espacos", { nome, id_edificio: edificioAtual, preco_hora: precoHora });
            }
            fecharModalEspaco();
            await carregarEspacos(edificioAtual);
        } catch (err) {
            erroEspaco.textContent = err.message || "Erro ao guardar.";
            erroEspaco.style.display = "";
        } finally {
            btn.disabled = false;
        }
    });


    document.querySelector('[data-tabela="espacos"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id    = parseInt(btn.dataset.id);
        const acao  = btn.dataset.acao;
        const espaco = espacos.find((es) => es.id === id);

        if (acao === "editar") {
            abrirModalEspaco(espaco);
        }
        if (acao === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/espacos/${id}`);
                await carregarEspacos(edificioAtual);
            } catch (err) {
                btn.disabled = false;
            }
        }
        if (acao === "materiais") {
            espacoAtualId = id;
            document.getElementById("modal-materiais-titulo").textContent =
                `Materiais — ${btn.dataset.nome || "espaço"}`;
            await abrirModalMateriais(id);
        }
    });


    const modalMateriais = document.getElementById("modal-materiais");

    async function abrirModalMateriais(idEspaco) {
        resetarFormMaterial();
        modalMateriais.style.display = "";
        await carregarMateriais(idEspaco);
    }

    function fecharModalMateriais() {
        modalMateriais.style.display = "none";
        espacoAtualId = null;
    }

    document.querySelectorAll("[data-fechar-materiais]").forEach((el) =>
        el.addEventListener("click", fecharModalMateriais)
    );
    modalMateriais.addEventListener("click", (e) => {
        if (e.target === modalMateriais) fecharModalMateriais();
    });

    async function carregarMateriais(idEspaco) {
        const tbody = document.getElementById("tabela-materiais");
        tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr>`;
        try {
            const materiais = await window.api.get(`/materiais?id_espaco=${idEspaco}`);
            renderizarMateriais(materiais);
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Erro: ${err.message}</p></td></tr>`;
        }
    }

    function renderizarMateriais(lista) {
        const tbody = document.getElementById("tabela-materiais");
        if (!lista.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem materiais registados.</p></td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((m) => `
            <tr>
                <td><strong>${m.material}</strong></td>
                <td>${m.qtd}</td>
                <td>${fmtEur(m.preco_unitario)}</td>
                <td class="app-tabela__acoes">
                    <button data-acao-mat="editar"  data-id="${m.id}"
                            data-nome="${m.material}" data-qtd="${m.qtd}"
                            data-preco="${m.preco_unitario}">Editar</button>
                    <button data-acao-mat="remover" data-id="${m.id}"
                            data-nome="${m.material}" class="perigo">Remover</button>
                </td>
            </tr>`).join("");
    }

    function resetarFormMaterial() {
        document.getElementById("m-id").value    = "";
        document.getElementById("m-nome").value  = "";
        document.getElementById("m-qtd").value   = "0";
        document.getElementById("m-preco").value = "0";
        document.getElementById("form-material-titulo").textContent = "Adicionar material";
        document.getElementById("btn-guardar-material").textContent = "Adicionar";
        document.getElementById("btn-cancelar-material").style.display = "none";
        document.getElementById("erro-material").style.display = "none";
    }

    document.getElementById("btn-cancelar-material").addEventListener("click", resetarFormMaterial);

    document.getElementById("btn-guardar-material").addEventListener("click", async () => {
        const erroMat = document.getElementById("erro-material");
        erroMat.style.display = "none";

        const id    = document.getElementById("m-id").value;
        const nome  = document.getElementById("m-nome").value.trim();
        const qtd   = parseInt(document.getElementById("m-qtd").value)   || 0;
        const preco = parseFloat(document.getElementById("m-preco").value) || 0;

        if (!nome) {
            erroMat.textContent = "Indique o nome do material.";
            erroMat.style.display = "";
            return;
        }

        const btn = document.getElementById("btn-guardar-material");
        btn.disabled = true;
        try {
            if (id) {
                await window.api.put(`/materiais/${id}`, { material: nome, qtd, preco_unitario: preco });
            } else {
                await window.api.post("/materiais", { material: nome, qtd, preco_unitario: preco, id_espaco: espacoAtualId });
            }
            resetarFormMaterial();
            await carregarMateriais(espacoAtualId);
        } catch (err) {
            erroMat.textContent = err.message || "Erro ao guardar material.";
            erroMat.style.display = "";
        } finally {
            btn.disabled = false;
        }
    });


    document.getElementById("tabela-materiais").addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao-mat]");
        if (!btn) return;
        const id   = parseInt(btn.dataset.id);
        const acao = btn.dataset.acaoMat;

        if (acao === "editar") {
            document.getElementById("m-id").value    = id;
            document.getElementById("m-nome").value  = btn.dataset.nome;
            document.getElementById("m-qtd").value   = btn.dataset.qtd;
            document.getElementById("m-preco").value = btn.dataset.preco;
            document.getElementById("form-material-titulo").textContent = "Editar material";
            document.getElementById("btn-guardar-material").textContent = "Guardar";
            document.getElementById("btn-cancelar-material").style.display = "";
            document.getElementById("m-nome").focus();
        }

        if (acao === "remover") {
            btn.disabled = true;
            try {
                await window.api.delete(`/materiais/${id}`);
                await carregarMateriais(espacoAtualId);
            } catch (err) {
                btn.disabled = false;
            }
        }
    });
    await carregarEdificios();

})();
