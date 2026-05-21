(async function () {
    await new Promise((r) => setTimeout(r, 50));

    function fmt(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
    }
    function badge(nome) {
        const n = (nome || "").toLowerCase();
        if (n === "aberta" || n === "em espera") return `<span class="estado estado--alerta">${nome}</span>`;
        if (n === "em curso") return `<span class="estado estado--alerta">${nome}</span>`;
        if (n === "concluida") return `<span class="estado estado--ok">Concluída</span>`;
        if (n === "cancelada") return `<span class="estado estado--erro">Cancelada</span>`;
        return `<span class="estado estado--neutro">${nome || "—"}</span>`;
    }

    await window.renderizarListagem({
        endpoint: "/ordens-trabalho",
        tabelaSeletor: '[data-tabela="ots"]',
        colunas: [
            { transformar: (l) => l.avaria?.descricao?.substring(0, 40) + "..." || "Avaria " + l.avaria_id },
            { transformar: (l) => l.tecnico?.nome || "<em>Não atribuído</em>" },
            { transformar: (l) => l.fornecedor?.nome || "—" },
            { transformar: (l) => fmt(l.data_inicio) },
            { transformar: (l) => badge(l.estado?.nome_pt) },
        ],
        acoes: (l) => `<button data-acao="ver" data-id="${l.id_ordem}">Ver</button>`,
        estadoVazio: { titulo: "Sem ordens de trabalho", texto: "Ainda não há OTs registadas." },
    });
})();
