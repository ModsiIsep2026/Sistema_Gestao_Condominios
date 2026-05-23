
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
                <td>Apt. ${c.id_apartamento}</td>
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

    // ── Modal criar condómino ─────────────────────────────────────────────────
    const modal    = document.getElementById("modal-condomino");
    const erroModal = document.getElementById("erro-condomino");

    function abrirModal() {
        erroModal.hidden = true;
        document.getElementById("form-condomino").reset();
        modal.hidden = false;
    }
    function fecharModal() { modal.hidden = true; }

    document.getElementById("btn-novo-condomino")?.addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal?.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-criar-condomino")?.addEventListener("click", async () => {
        erroModal.hidden = true;

        const nome          = document.getElementById("c-nome").value.trim();
        const email         = document.getElementById("c-email").value.trim();
        const telemovel     = document.getElementById("c-telemovel").value.trim();
        const id_apartamento = parseInt(document.getElementById("c-apartamento").value);
        const pw            = document.getElementById("c-pw").value.trim();

        if (!nome)              { erroModal.textContent = "Indique o nome.";           erroModal.hidden = false; return; }
        if (!email)             { erroModal.textContent = "Indique o email.";          erroModal.hidden = false; return; }
        if (!telemovel)         { erroModal.textContent = "Indique o telemóvel.";      erroModal.hidden = false; return; }
        if (isNaN(id_apartamento)) { erroModal.textContent = "Selecione o apartamento."; erroModal.hidden = false; return; }
        if (!pw)                { erroModal.textContent = "Defina uma password.";      erroModal.hidden = false; return; }

        try {
            await window.api.post("/condominos", { nome, email, telemovel, id_apartamento, pw });
            fecharModal();
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível criar o condómino.";
            erroModal.hidden = false;
        }
    });

    // ── Remover ───────────────────────────────────────────────────────────────
    document.querySelector('[data-tabela="condominos"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn || btn.dataset.acao !== "remover") return;
        const id        = parseInt(btn.dataset.id);
        const condomino = dados.find((c) => c.id === id);
        if (!confirm(`Remover o condómino "${condomino?.nome}"?`)) return;
        btn.disabled = true;
        try {
            await window.api.delete(`/condominos/${id}`);
            await carregar();
        } catch (err) {
            alert(err.message);
            btn.disabled = false;
        }
    });

})();
