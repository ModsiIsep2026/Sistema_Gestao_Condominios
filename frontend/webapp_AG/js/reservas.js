(async function () {
    await new Promise((r) => setTimeout(r, 50));

    function fmt(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    }

    function badge(nome) {
        const n = (nome || "").toLowerCase();
        if (n === "pendente")  return `<span class="estado estado--alerta">Pendente</span>`;
        if (n === "aprovada")  return `<span class="estado estado--ok">Aprovada</span>`;
        if (n === "rejeitada") return `<span class="estado estado--erro">Rejeitada</span>`;
        if (n === "cancelada") return `<span class="estado estado--erro">Cancelada</span>`;
        if (n === "concluida") return `<span class="estado estado--ok">Concluída</span>`;
        return `<span class="estado estado--neutro">${nome || "—"}</span>`;
    }

    const dados = await window.renderizarListagem({
        endpoint: "/reservas",
        tabelaSeletor: '[data-tabela="reservas"]',
        colunas: [
            { chave: "utilizador", transformar: (l) => l.utilizador?.nome || "—" },
            { chave: "espaco",     transformar: (l) => `<strong>${l.espaco?.nome || "Espaço " + l.espaco_id}</strong>` },
            { chave: "data_inicio", transformar: (l) => fmt(l.data_inicio) },
            { chave: "data_fim",    transformar: (l) => fmt(l.data_fim) },
            { chave: "estado",     transformar: (l) => badge(l.estado?.nome_pt) },
        ],
        acoes: (l) => {
            const estado = (l.estado?.nome_pt || "").toLowerCase();
            if (estado === "pendente") {
                return `
                    <button type="button" data-acao="aprovar" data-id="${l.id_reserva}">Aprovar</button>
                    <button type="button" class="perigo" data-acao="rejeitar" data-id="${l.id_reserva}">Rejeitar</button>
                `;
            }
            return `<button type="button" data-acao="ver" data-id="${l.id_reserva}">Ver</button>`;
        },
        estadoVazio: { titulo: "Sem reservas", texto: "Ainda não há pedidos de reserva." },
        filtro: (l, termo) =>
            (l.utilizador?.nome || "").toLowerCase().includes(termo) ||
            (l.espaco?.nome || "").toLowerCase().includes(termo),
    });


    document.getElementById("filtro-estado")?.addEventListener("change", (e) => {
        const valor = e.target.value;
  
        const tabela = document.querySelector('[data-tabela="reservas"]');
        const linhas = valor === "" ? dados : dados.filter((l) => (l.estado?.nome_pt || "").toLowerCase() === valor);
        tabela.innerHTML = linhas.map((l) => `
            <tr>
                <td>${l.utilizador?.nome || "—"}</td>
                <td><strong>${l.espaco?.nome || "—"}</strong></td>
                <td>${fmt(l.data_inicio)}</td>
                <td>${fmt(l.data_fim)}</td>
                <td>${badge(l.estado?.nome_pt)}</td>
                <td class="app-tabela__acoes">
                    ${(l.estado?.nome_pt || "").toLowerCase() === "pendente"
                        ? `<button data-acao="aprovar" data-id="${l.id_reserva}">Aprovar</button>
                           <button class="perigo" data-acao="rejeitar" data-id="${l.id_reserva}">Rejeitar</button>`
                        : `<button data-acao="ver" data-id="${l.id_reserva}">Ver</button>`}
                </td>
            </tr>`).join("") || `<tr><td colspan="6" class="app-vazio"><p>Sem resultados.</p></td></tr>`;
    });

    // Aprovação / rejeição
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const acao = btn.dataset.acao;
        const id = btn.dataset.id;

        if (acao === "aprovar") {
            if (!confirm("Aprovar esta reserva?")) return;
            try {
                await window.api.patch(`/reservas/${id}`, { estado_id: 2 }); // 2 = aprovada
                location.reload();
            } catch (err) { alert(err.message); }
        }
        if (acao === "rejeitar") {
            if (!confirm("Rejeitar esta reserva?")) return;
            try {
                await window.api.patch(`/reservas/${id}`, { estado_id: 3 }); // 3 = rejeitada
                location.reload();
            } catch (err) { alert(err.message); }
        }
    });
})();
