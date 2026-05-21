(async function () {
    await new Promise((r) => setTimeout(r, 50));

    await window.renderizarListagem({
        endpoint: "/avarias",
        tabelaSeletor: '[data-tabela="avarias"]',
        colunas: [
            { transformar: (l) => l.utilizador?.nome || "—" },
            { transformar: (l) => l.edificio?.nome || "—" },
            { transformar: (l) => l.fracao?.codigo_fracao || "—" },
            { transformar: (l) => l.categoria?.nome_pt || "—" },
            { transformar: (l) => (l.descricao || "").substring(0, 60) + (l.descricao?.length > 60 ? "..." : "") },
        ],
        acoes: (l) => `
            <a href="ordens-trabalho.html?avaria=${l.id_avaria}">Criar OT</a>
            <button type="button" data-acao="ver" data-id="${l.id_avaria}">Ver</button>
        `,
        estadoVazio: { titulo: "Sem avarias", texto: "Ainda não foram reportadas avarias." },
        filtro: (l, termo) =>
            (l.descricao || "").toLowerCase().includes(termo) ||
            (l.edificio?.nome || "").toLowerCase().includes(termo) ||
            (l.categoria?.nome_pt || "").toLowerCase().includes(termo),
    });
})();
