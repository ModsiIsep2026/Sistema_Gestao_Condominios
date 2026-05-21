(async function () {
    await new Promise((r) => setTimeout(r, 50));

    await window.renderizarListagem({
        endpoint: "/utilizadores",
        tabelaSeletor: '[data-tabela="condominos"]',
        colunas: [
            { transformar: (l) => `<strong>${l.nome}</strong>` },
            { chave: "email" },
            { chave: "telemovel", transformar: (l) => l.telemovel || "—" },
            { chave: "nif",       transformar: (l) => l.nif || "—" },
        ],
        acoes: (l) => `<button data-acao="ver" data-id="${l.id_utilizador}">Ver</button>`,
        estadoVazio: { titulo: "Sem condóminos", texto: "Ainda não há condóminos registados." },
        filtro: (l, t) => l.nome.toLowerCase().includes(t) || l.email.toLowerCase().includes(t),
    });


    setTimeout(() => {
        const linhas = document.querySelectorAll('[data-tabela="condominos"] tr[data-id]');
    
    }, 100);
})();
