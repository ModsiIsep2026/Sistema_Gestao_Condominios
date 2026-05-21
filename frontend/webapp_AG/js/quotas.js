(async function () {
    await new Promise((r) => setTimeout(r, 50));

    function fmtMes(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
    }
    function fmtEuros(v) {
        if (v == null) return "—";
        return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
    }

    await window.renderizarListagem({
        endpoint: "/quotas",
        tabelaSeletor: '[data-tabela="quotas"]',
        colunas: [
            { transformar: (l) => `<strong>${l.fracao?.codigo_fracao || "Fração " + l.fracao_id}</strong>` },
            { transformar: (l) => fmtMes(l.mes_referencia) },
            { transformar: (l) => fmtEuros(l.valor) },
            { transformar: (l) => l.paga
                ? `<span class="estado estado--ok">Paga</span>`
                : `<span class="estado estado--alerta">Em aberto</span>` },
        ],
        acoes: (l) => `<button data-acao="ver" data-id="${l.id_quota}">Detalhes</button>`,
        estadoVazio: { titulo: "Sem quotas", texto: "Ainda não foram geradas quotas." },
        filtro: (l, t) => (l.fracao?.codigo_fracao || "").toLowerCase().includes(t),
    });
})();
