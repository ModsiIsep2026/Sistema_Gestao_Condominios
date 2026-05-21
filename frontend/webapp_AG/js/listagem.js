
window.renderizarListagem = async function (config) {
    /*
     * config = {
     *   endpoint: "/edificios",
     *   tabelaSeletor: "[data-tabela]",
     *   colunas: [{ chave: "nome", titulo: "Nome" }, ...],
     *   acoes: (linha) => "<button>...</button>",
     *   estadoVazio: { titulo, texto },
     *   filtro: (linha, termo) => boolean,
     * }
     */

    const tabela = document.querySelector(config.tabelaSeletor);
    if (!tabela) return;

    let dados = [];
    try {
        dados = await window.api.get(config.endpoint);
    } catch (e) {
        tabela.innerHTML = `<tr><td colspan="99" class="app-vazio"><p>Erro a carregar: ${e.message}</p></td></tr>`;
        return;
    }

    function renderizar(lista) {
        if (!lista || lista.length === 0) {
            tabela.innerHTML = `
                <tr><td colspan="99">
                    <div class="app-vazio">
                        <h3>${config.estadoVazio?.titulo || "Sem registos"}</h3>
                        <p>${config.estadoVazio?.texto || "Nada a mostrar de momento."}</p>
                    </div>
                </td></tr>`;
            return;
        }

        tabela.innerHTML = lista.map((linha) => {
            const celulas = config.colunas.map((col) => {
                const valor = col.transformar ? col.transformar(linha) : (linha[col.chave] ?? "—");
                return `<td>${valor}</td>`;
            }).join("");
            const acoes = config.acoes ? `<td class="app-tabela__acoes">${config.acoes(linha)}</td>` : "";
            return `<tr data-id="${linha.id || linha[Object.keys(linha)[0]]}">${celulas}${acoes}</tr>`;
        }).join("");
    }

    renderizar(dados);


    const pesquisa = document.querySelector("[data-pesquisa]");
    if (pesquisa && config.filtro) {
        pesquisa.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const filtrados = termo === "" ? dados : dados.filter((l) => config.filtro(l, termo));
            renderizar(filtrados);
        });
    }

    return dados;
};
