
(async function () {

    // Só admin
    for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }
    if (window.tipoAtual !== "admin") {
        alert("Exclusivo a administradores.");
        window.location.replace("index.html");
        return;
    }

    let dados         = [];
    let filtroEstado  = "ativos";
    let filtroPesquisa = "";

    function badge(status) {
        return status === 1
            ? `<span class="estado estado--ok">Ativo</span>`
            : `<span class="estado estado--erro">Inativo</span>`;
    }

    function aplicarFiltros() {
        return dados.filter((g) => {
            if (filtroEstado === "ativos"   && g.status !== 1) return false;
            if (filtroEstado === "inativos" && g.status !== 0) return false;
            if (filtroPesquisa) {
                const t = filtroPesquisa;
                if (!(g.nome  || "").toLowerCase().includes(t) &&
                    !(g.email || "").toLowerCase().includes(t)) return false;
            }
            return true;
        });
    }

    function renderizar() {
        const lista  = aplicarFiltros();
        const tbody  = document.querySelector('[data-tabela="gestores"]');

        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="app-vazio">
                        <h3>Sem gestores</h3>
                        <p>${filtroEstado === "ativos" ? "Adicione o primeiro gestor." : "Sem registos para este filtro."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((g) => {
            const ativo = g.status === 1;
            const btnEstado = ativo
                ? `<button class="perigo" data-acao="desativar" data-id="${g.id}">Desativar</button>`
                : `<button data-acao="ativar" data-id="${g.id}">Ativar</button>`;
            return `
                <tr style="${ativo ? "" : "opacity:0.55;"}">
                    <td><strong>${g.nome}</strong></td>
                    <td>${g.empresa || "—"}</td>
                    <td>${g.email}</td>
                    <td>${badge(g.status)}</td>
                    <td class="app-tabela__acoes">${btnEstado}</td>
                </tr>`;
        }).join("");
    }

    async function carregar() {
        try {
            dados = await window.api.get("/gestores");
            renderizar();
        } catch (e) {
            document.querySelector('[data-tabela="gestores"]').innerHTML =
                `<tr><td colspan="5" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    await carregar();

    document.querySelector("[data-pesquisa]")?.addEventListener("input", (e) => {
        filtroPesquisa = e.target.value.toLowerCase().trim();
        renderizar();
    });
    document.getElementById("filtro-estado")?.addEventListener("change", (e) => {
        filtroEstado = e.target.value;
        renderizar();
    });

    // ── Modal criar gestor ────────────────────────────────────────────────────
    const modal    = document.getElementById("modal-gestor");
    const erroModal = document.getElementById("erro-gestor");

    function abrirModal() {
        erroModal.hidden = true;
        document.getElementById("form-gestor").reset();
        modal.hidden = false;
    }
    function fecharModal() { modal.hidden = true; }

    document.getElementById("btn-novo-gestor").addEventListener("click", abrirModal);
    document.querySelectorAll("[data-fechar-modal]").forEach((el) =>
        el.addEventListener("click", fecharModal)
    );
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

    document.getElementById("btn-criar-gestor").addEventListener("click", async () => {
        erroModal.hidden = true;

        const nome     = document.getElementById("g-nome").value.trim();
        const empresa  = document.getElementById("g-empresa").value.trim()   || null;
        const email    = document.getElementById("g-email").value.trim();
        const telemovel = document.getElementById("g-telemovel").value.trim();
        const pw       = document.getElementById("g-pw").value.trim();

        if (!nome)     { erroModal.textContent = "Indique o nome.";     erroModal.hidden = false; return; }
        if (!email)    { erroModal.textContent = "Indique o email.";    erroModal.hidden = false; return; }
        if (!telemovel){ erroModal.textContent = "Indique o telemóvel.";erroModal.hidden = false; return; }
        if (!pw)       { erroModal.textContent = "Defina uma password.";erroModal.hidden = false; return; }

        try {
            await window.api.post("/gestores", { nome, empresa, email, telemovel, pw });
            fecharModal();
            await carregar();
        } catch (e) {
            erroModal.textContent = e.message || "Não foi possível criar o gestor.";
            erroModal.hidden = false;
        }
    });

    // ── Ativar / Desativar ────────────────────────────────────────────────────
    document.querySelector('[data-tabela="gestores"]').addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id        = parseInt(btn.dataset.id);
        const novoStatus = btn.dataset.acao === "ativar" ? 1 : 0;
        btn.disabled = true;
        try {
            await window.api.put(`/gestores/${id}`, { status: novoStatus });
            await carregar();
        } catch (err) {
            alert(err.message);
            btn.disabled = false;
        }
    });

})();
