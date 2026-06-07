(function () {

    const tabelaRecebidas = document.getElementById("tabela-recebidas");
    const tabelaEnviadas  = document.getElementById("tabela-enviadas");
    const painelRecebidas = document.getElementById("painel-recebidas");
    const painelEnviadas  = document.getElementById("painel-enviadas");
    const tabRecebidas    = document.getElementById("tab-recebidas");
    const tabEnviadas     = document.getElementById("tab-enviadas");
    const badgeRecebidas  = document.getElementById("badge-recebidas");
    const modalNova       = document.getElementById("modal-nova");
    const modalVer        = document.getElementById("modal-ver");

    function formatarData(iso) {
        try {
            return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch { return iso; }
    }

    function abrirModal(modal) { modal.hidden = false; document.body.style.overflow = "hidden"; }
    function fecharModal(modal) { modal.hidden = true; document.body.style.overflow = ""; }

    document.querySelectorAll("[data-fechar-modal]").forEach((btn) => {
        btn.addEventListener("click", () => fecharModal(btn.closest(".modal-overlay")));
    });

    function escHtml(str) {
        return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function mostrarTab(tab) {
        const isRecebidas = tab === "recebidas";
        painelRecebidas.style.display = isRecebidas ? "" : "none";
        painelEnviadas.style.display  = isRecebidas ? "none" : "";
        tabRecebidas.classList.toggle("btn--primario", isRecebidas);
        tabRecebidas.classList.toggle("btn--outline",  !isRecebidas);
        tabEnviadas.classList.toggle("btn--primario",  !isRecebidas);
        tabEnviadas.classList.toggle("btn--outline",   isRecebidas);
    }

    tabRecebidas.addEventListener("click", () => mostrarTab("recebidas"));
    tabEnviadas.addEventListener("click",  () => mostrarTab("enviadas"));
    mostrarTab("recebidas");

    async function carregarRecebidas() {
        try {
            const msgs = await window.api.get("/suporte/recebidas");
            const naoLidas = msgs.filter((m) => !m.lida).length;
            badgeRecebidas.textContent   = naoLidas > 0 ? naoLidas : "";
            badgeRecebidas.style.display = naoLidas > 0 ? "inline-flex" : "none";

            if (!msgs.length) {
                tabelaRecebidas.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Nenhuma resposta do gestor.</p></td></tr>`;
                return;
            }

            tabelaRecebidas.innerHTML = msgs.map((m) => `
                <tr style="cursor:pointer;${!m.lida ? "font-weight:600;" : ""}"
                    data-id="${m.id}"
                    data-assunto="${escHtml(m.assunto)}"
                    data-de="${escHtml(m.nome_remetente)}"
                    data-data="${formatarData(m.data_envio)}"
                    data-msg="${escHtml(m.mensagem)}"
                    data-lida="${m.lida}">
                    <td>${escHtml(m.nome_remetente)}</td>
                    <td>${escHtml(m.assunto)}</td>
                    <td>${formatarData(m.data_envio)}</td>
                    <td><span class="chip ${m.lida ? "chip--ok" : "chip--alerta"}">${m.lida ? "Lida" : "Não lida"}</span></td>
                </tr>
            `).join("");

            tabelaRecebidas.querySelectorAll("tr[data-id]").forEach((tr) => {
                tr.addEventListener("click", async () => {
                    const id   = parseInt(tr.dataset.id);
                    const lida = tr.dataset.lida === "true";
                    document.getElementById("ver-assunto").textContent  = tr.dataset.assunto;
                    document.getElementById("ver-de").textContent       = tr.dataset.de;
                    document.getElementById("ver-data").textContent     = tr.dataset.data;
                    document.getElementById("ver-mensagem").textContent = tr.dataset.msg;
                    abrirModal(modalVer);
                    if (!lida) {
                        try {
                            await window.api.patch(`/suporte/${id}/lida`, {});
                            carregarRecebidas();
                        } catch { /* falha silenciosa */ }
                    }
                });
            });
        } catch {
            tabelaRecebidas.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Erro ao carregar mensagens.</p></td></tr>`;
        }
    }

    async function carregarEnviadas() {
        try {
            const msgs = await window.api.get("/suporte/enviadas");
            if (!msgs.length) {
                tabelaEnviadas.innerHTML = `<tr><td colspan="3" class="app-vazio"><p>Ainda não enviou nenhuma mensagem.</p></td></tr>`;
                return;
            }
            tabelaEnviadas.innerHTML = msgs.map((m) => `
                <tr style="cursor:pointer;"
                    data-assunto="${escHtml(m.assunto)}"
                    data-data="${formatarData(m.data_envio)}"
                    data-msg="${escHtml(m.mensagem)}">
                    <td>${escHtml(m.assunto)}</td>
                    <td>${formatarData(m.data_envio)}</td>
                    <td><span class="chip chip--ok">Enviada</span></td>
                </tr>
            `).join("");

            tabelaEnviadas.querySelectorAll("tr[data-assunto]").forEach((tr) => {
                tr.addEventListener("click", () => {
                    document.getElementById("ver-assunto").textContent  = tr.dataset.assunto;
                    document.getElementById("ver-de").textContent       = "Eu";
                    document.getElementById("ver-data").textContent     = tr.dataset.data;
                    document.getElementById("ver-mensagem").textContent = tr.dataset.msg;
                    abrirModal(modalVer);
                });
            });
        } catch {
            tabelaEnviadas.innerHTML = `<tr><td colspan="3" class="app-vazio"><p>Erro ao carregar mensagens.</p></td></tr>`;
        }
    }

    document.getElementById("btn-nova").addEventListener("click", () => {
        document.getElementById("form-nova").reset();
        document.getElementById("erro-nova").style.display = "none";
        abrirModal(modalNova);
    });

    document.getElementById("btn-enviar").addEventListener("click", async () => {
        const assunto  = document.getElementById("s-assunto").value.trim();
        const mensagem = document.getElementById("s-mensagem").value.trim();
        const erro     = document.getElementById("erro-nova");

        if (!assunto || !mensagem) {
            erro.textContent = "Preencha todos os campos.";
            erro.style.display = "block";
            return;
        }

        try {
            await window.api.post("/suporte", { assunto, mensagem });
            fecharModal(modalNova);
            carregarEnviadas();
            mostrarTab("enviadas");
            if (typeof window.mostrarToast === "function") window.mostrarToast("Mensagem enviada ao gestor.");
        } catch (err) {
            erro.textContent = err.message || "Erro ao enviar mensagem.";
            erro.style.display = "block";
        }
    });

    carregarRecebidas();
    carregarEnviadas();

})();
