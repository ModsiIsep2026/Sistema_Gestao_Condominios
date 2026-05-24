
(async function () {

    let dados          = [];
    let filtroPesquisa = "";


    function renderizar(lista) {
        const tbody = document.querySelector('[data-tabela="condominos"]');
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem condóminos</h3>
                        <p>Adicione o primeiro condómino para começar.</p>
                    </div>
                </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map((c) => `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.email}</td>
                <td>${c.telemovel || "—"}</td>
                <td>${c.fracao ? `Fração ${c.fracao}` : `Apt. ${c.id_apartamento}`}</td>
                <td class="app-tabela__acoes">
                    <button data-acao="remover" data-id="${c.id}" class="perigo">Remover</button>
                </td>
            </tr>`).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/condominos");
            renderizar(dados);
        } catch (e) {
            document.querySelector('[data-tabela="condominos"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    
    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        filtroPesquisa = e.target.value.toLowerCase().trim();
        if (!filtroPesquisa) return renderizar(dados);
        renderizar(dados.filter((c) =>
            (c.nome  || "").toLowerCase().includes(filtroPesquisa) ||
            (c.email || "").toLowerCase().includes(filtroPesquisa)
        ));
    });


    const modal     = document.getElementById("modal-condomino");
    const erroModal = document.getElementById("erro-condomino");
    const selEdif   = document.getElementById("c-edificio");
    const selApt    = document.getElementById("c-apartamento");


    async function carregarEdificios() {
        try {
            const edificios = await window.api.get("/edificios");
            selEdif.innerHTML = `<option value="">Selecionar edifício...</option>`;
            edificios.forEach((e) => {
                selEdif.innerHTML += `<option value="${e.id}">${e.rua}${e.cidade ? " — " + e.cidade : ""}</option>`;
            });
        } catch {  }
    }


    const linkEdificio = document.getElementById("c-link-edificio");

    selEdif.addEventListener("change", async () => {
        const idEdif = parseInt(selEdif.value);
        selApt.innerHTML = `<option value="">A carregar...</option>`;
        selApt.disabled = true;
        linkEdificio.style.display = "none";

        if (!idEdif) {
            selApt.innerHTML = `<option value="">Primeiro selecione o edifício</option>`;
            return;
        }

        try {
            const apts = await window.api.get(`/apartamentos?id_edificio=${idEdif}`);
            if (!apts.length) {
                selApt.innerHTML = `<option value="">Sem apartamentos neste edifício</option>`;
                linkEdificio.innerHTML = `
                    ⚠️ Este edifício ainda não tem apartamentos.
                    <a href="edificio.html?id=${idEdif}" target="_blank"
                       style="color:var(--cor-primaria);font-weight:600;margin-left:4px;">
                        Adicionar apartamentos →
                    </a>`;
                linkEdificio.style.display = "";
                return;
            }
            selApt.innerHTML = `<option value="">Selecionar fração...</option>`;
            apts.forEach((a) => {
                const label = a.fracao
                    ? `Fração ${a.fracao}${a.andar != null ? " — " + a.andar + "º andar" : ""}`
                    : `Apt. ${a.id}`;
                selApt.innerHTML += `<option value="${a.id}">${label}</option>`;
            });
            selApt.disabled = false;
        } catch (err) {
            selApt.innerHTML = `<option value="">Erro ao carregar apartamentos</option>`;
        }
    });

    function abrirModal() {
        erroModal.style.display = "none";
        document.getElementById("form-condomino").reset();
        selApt.innerHTML = `<option value="">Primeiro selecione o edifício</option>`;
        selApt.disabled = true;
        modal.hidden = false;
    }
    function fecharModal() { modal.hidden = true; }

    document.getElementById("btn-novo-condomino")?.addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal?.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });


    document.getElementById("btn-criar-condomino")?.addEventListener("click", async () => {
        erroModal.style.display = "none";

        const nome           = document.getElementById("c-nome").value.trim();
        const email          = document.getElementById("c-email").value.trim();
        const telemovel      = document.getElementById("c-telemovel").value.trim();
        const id_apartamento = parseInt(selApt.value);

        if (!nome)               { erroModal.textContent = "Indique o nome.";             erroModal.style.display = ""; return; }
        if (!email)              { erroModal.textContent = "Indique o email.";            erroModal.style.display = ""; return; }
        if (!telemovel)          { erroModal.textContent = "Indique o telemóvel.";        erroModal.style.display = ""; return; }
        if (!selEdif.value)      { erroModal.textContent = "Selecione o edifício.";       erroModal.style.display = ""; return; }
        if (isNaN(id_apartamento)) { erroModal.textContent = "Selecione o apartamento."; erroModal.style.display = ""; return; }

        const btn = document.getElementById("btn-criar-condomino");
        btn.disabled = true;
        btn.textContent = "A adicionar...";
        try {
            await window.api.post("/condominos", { nome, email, telemovel, id_apartamento });
            fecharModal();
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível criar o condómino.";
            erroModal.style.display = "";
        } finally {
            btn.disabled = false;
            btn.textContent = "Adicionar";
        }
    });

   
    document.querySelector('[data-tabela="condominos"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn || btn.dataset.acao !== "remover") return;
        const id = parseInt(btn.dataset.id);
        btn.disabled = true;
        try {
            await window.api.delete(`/condominos/${id}`);
            await carregar();
        } catch (err) {
            btn.disabled = false;
        }
    });


    await carregarEdificios();

})();
