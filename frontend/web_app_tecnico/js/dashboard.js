
(async function () {

    for (let i = 0; i < 50 && window.tipoAtual == null; i++) {
        await new Promise((r) => setTimeout(r, 50));
    }

    const conteudo = document.getElementById("dashboard-conteudo");
    conteudo.innerHTML = `
        <div class="painel">
            <div class="painel__cabecalho">
                <h2>Avarias atribuídas</h2>
                <a href="avarias.html" class="btn btn--outline">Ver todas</a>
            </div>
            <div class="painel__corpo painel__corpo--sem-pad">
                <table class="app-tabela">
                    <thead>
                        <tr><th>Data</th><th>Zona</th><th>Descrição</th><th>Estado</th></tr>
                    </thead>
                    <tbody id="tabela-avarias">
                        <tr><td colspan="4" class="app-vazio"><p>A carregar...</p></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    try {
        const avarias = await window.api.get("/avarias/tecnico");
        const tbody   = document.getElementById("tabela-avarias");

        if (!avarias.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="app-vazio"><p>Sem avarias atribuídas de momento.</p></td></tr>`;
            return;
        }

        tbody.innerHTML = avarias.map((a) => {
            const resolvida = a.resolucao?.status === 1;
            return `
                <tr>
                    <td>${fmtData(a.data_registo)}</td>
                    <td><strong>${a.zona || "—"}</strong></td>
                    <td style="font-size:13px;color:var(--cor-texto-secundario);">${(a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim().substring(0, 50) || "—"}</td>
                    <td>${resolvida
                        ? '<span class="estado estado--ok">Resolvida</span>'
                        : '<span class="estado estado--alerta">Pendente</span>'}</td>
                </tr>`;
        }).join("");
    } catch (e) {
        document.getElementById("tabela-avarias").innerHTML =
            `<tr><td colspan="4" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
    }

})();
