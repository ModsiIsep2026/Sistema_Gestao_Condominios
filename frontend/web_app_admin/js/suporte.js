(function () {

    const tabelaRecebidas = document.getElementById("tabela-recebidas");
    const modalVer        = document.getElementById("modal-ver");
    const btnResponder    = document.getElementById("btn-responder");
    const erroResposta    = document.getElementById("erro-resposta");

    let idRemetenteAtual = null;
    let assuntoAtual     = null;

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

    async function carregarRecebidas() {
        try {
            const msgs = await window.api.get("/suporte/recebidas");
            if (!msgs.length) {
                tabelaRecebidas.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Nenhuma mensagem recebida.</p></td></tr>`;
                return;
            }
            tabelaRecebidas.innerHTML = msgs.map((m) => `
                <tr style="cursor:pointer;${!m.lida ? "font-weight:600;" : ""}"
                    data-id="${m.id}"
                    data-assunto="${escHtml(m.assunto)}"
                    data-de="${escHtml(m.nome_remetente)}"
                    data-id-remetente="${m.id_remetente}"
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

                    idRemetenteAtual = parseInt(tr.dataset.idRemetente);
                    assuntoAtual     = tr.dataset.assunto;

                    document.getElementById("ver-assunto").textContent  = tr.dataset.assunto;
                    document.getElementById("ver-de").textContent       = tr.dataset.de;
                    document.getElementById("ver-data").textContent     = tr.dataset.data;
                    document.getElementById("ver-mensagem").textContent = tr.dataset.msg;
                    document.getElementById("resp-mensagem").value      = "";
                    erroResposta.style.display = "none";

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

    btnResponder.addEventListener("click", async () => {
        const texto = document.getElementById("resp-mensagem").value.trim();
        if (!texto) {
            erroResposta.textContent = "Escreva uma resposta antes de enviar.";
            erroResposta.style.display = "block";
            return;
        }
        if (!idRemetenteAtual) {
            erroResposta.textContent = "Não foi possível identificar o destinatário.";
            erroResposta.style.display = "block";
            return;
        }

        try {
            await window.api.post("/suporte", {
                assunto:         `Re: ${assuntoAtual}`,
                mensagem:        texto,
                id_destinatario: idRemetenteAtual,
            });
            fecharModal(modalVer);
            if (typeof window.mostrarToast === "function") window.mostrarToast("Resposta enviada ao gestor.");
        } catch (err) {
            erroResposta.textContent = err.message || "Erro ao enviar resposta.";
            erroResposta.style.display = "block";
        }
    });

    carregarRecebidas();

})();
