(async function () {
    await new Promise((r) => setTimeout(r, 50));

    await window.renderizarListagem({
        endpoint: "/utilizadores",
        tabelaSeletor: '[data-tabela="tecnicos"]',
        colunas: [
            { transformar: (l) => `<strong>${l.nome}</strong>` },
            { chave: "email" },
            { chave: "telemovel", transformar: (l) => l.telemovel || "—" },
        ],
        acoes: (l) => `<button data-acao="ver" data-id="${l.id_utilizador}">Ver</button>`,
        estadoVazio: { titulo: "Sem técnicos", texto: "Ainda não há técnicos registados." },
        filtro: (l, t) => l.nome.toLowerCase().includes(t) || l.email.toLowerCase().includes(t),
    });
})();
