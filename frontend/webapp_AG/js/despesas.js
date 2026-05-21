(async function () {
    await new Promise((r) => setTimeout(r, 50));

    function fmt(iso) { return iso ? new Date(iso).toLocaleDateString("pt-PT") : "—"; }
    function eur(v)   { return v == null ? "—" : new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v); }

    await window.renderizarListagem({
        endpoint: "/despesas",
        tabelaSeletor: '[data-tabela="despesas"]',
        colunas: [
            { transformar: (l) => fmt(l.data_despesa) },
            { transformar: (l) => l.edificio?.nome || "—" },
            { transformar: (l) => l.categoria?.nome_pt || "—" },
            { transformar: (l) => l.fornecedor?.nome || "—" },
            { transformar: (l) => `<strong>${eur(l.valor)}</strong>` },
        ],
        acoes: (l) => `<button data-acao="ver" data-id="${l.id_despesa}">Ver</button>`,
        estadoVazio: { titulo: "Sem despesas", texto: "Registe a primeira despesa." },
    });
})();
