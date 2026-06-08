(async function () {
    await new Promise((r) => setTimeout(r, 200));

    const erroEl            = document.getElementById("rel-erro");
    const selPeriodo        = document.getElementById("sel-periodo");
    const datasPersonalizadas = document.getElementById("datas-personalizadas");
    const inputInicio       = document.getElementById("rel-data-inicio");
    const inputFim          = document.getElementById("rel-data-fim");

    let pagamentosGestor = [];

    function mostrarErro(msg) { erroEl.textContent = msg; erroEl.style.display = ""; }
    function limparErro()     { erroEl.style.display = "none"; erroEl.textContent = ""; }

    function fmtEur(valor) {
        return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(valor || 0);
    }

    function formatarDataISO(data) { return data.toISOString().slice(0, 10); }

    function preencherDatasRapidas(tipo) {
        const hoje = new Date();
        const fim  = formatarDataISO(hoje);

        if (tipo === "todos") {
            inputInicio.value = "";
            inputFim.value    = "";
        } else if (tipo === "mes-atual") {
            inputInicio.value = formatarDataISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
            inputFim.value    = fim;
        } else if (tipo !== "personalizado") {
            const dias = parseInt(tipo, 10);
            const inicioDate = new Date(hoje);
            inicioDate.setDate(inicioDate.getDate() - (dias - 1));
            inputInicio.value = formatarDataISO(inicioDate);
            inputFim.value    = fim;
        }
    }

    function obterPeriodoSelecionado() {
        return { dataInicio: inputInicio.value || null, dataFim: inputFim.value || null };
    }

    function filtrarPagamentos() {
        const { dataInicio, dataFim } = obterPeriodoSelecionado();
        return pagamentosGestor.filter((p) => {
            const dataBase = (p.data_p || p.data_i || "").slice(0, 10);
            if (!dataBase) return !dataInicio && !dataFim;
            if (dataInicio && dataBase < dataInicio) return false;
            if (dataFim   && dataBase > dataFim)    return false;
            return true;
        });
    }

    function atualizarKpisFinanceiros() {
        const lista     = filtrarPagamentos();
        const pagos     = lista.filter((p) => p.estado === 1);
        const pendentes = lista.filter((p) => p.estado !== 1);
        const total     = lista.reduce((acc, p) => acc + Number(p.valor || 0), 0);

        document.getElementById("kpi-pag-total").textContent     = String(lista.length);
        document.getElementById("kpi-pag-pagos").textContent     = String(pagos.length);
        document.getElementById("kpi-pag-pendentes").textContent = String(pendentes.length);
        document.getElementById("kpi-pag-montante").textContent  = fmtEur(total);
    }

    function montarQueryPeriodo() {
        const { dataInicio, dataFim } = obterPeriodoSelecionado();
        const params = new URLSearchParams();
        if (dataInicio) params.set("data_inicio", dataInicio);
        if (dataFim)    params.set("data_fim", dataFim);
        const query = params.toString();
        return query ? `?${query}` : "";
    }

    function montarNomeFicheiro(formato) {
        const { dataInicio, dataFim } = obterPeriodoSelecionado();
        const periodo = dataInicio || dataFim
            ? `${dataInicio || "inicio"}_${dataFim || "ate-hoje"}`
            : "completo";
        return formato === "excel"
            ? `relatorio_pagamentos_${periodo}.xlsx`
            : `relatorio_pagamentos_${periodo}.pdf`;
    }

    async function descarregarRelatorio(formato) {
        limparErro();

        const token = sessionStorage.getItem("condo_token");
        if (!token) {
            mostrarErro("Sessao expirada. Faca login novamente.");
            return;
        }

        const { dataInicio, dataFim } = obterPeriodoSelecionado();
        if (dataInicio && dataFim && dataInicio > dataFim) {
            mostrarErro("A data de início não pode ser posterior à data de fim.");
            return;
        }

        const botao = document.getElementById(`btn-rel-${formato}`);
        const textoOriginal = botao.textContent;
        botao.disabled = true;
        botao.querySelector("svg") && (botao.querySelector("svg").style.display = "none");
        botao.textContent = formato === "excel" ? "A exportar..." : "A gerar PDF...";

        try {
            const proxyBase = "/~1211405/modsi/Sistema_Gestao_Condominios/frontend/proxy.php";
            const periodo = montarQueryPeriodo().replace(/^\?/, "&");
            const resposta = await fetch(`${proxyBase}?path=/relatorios/${formato}${periodo}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => ({}));
                throw new Error(dados.detail || "Nao foi possivel exportar o relatorio.");
            }

            const blob = await resposta.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = montarNomeFicheiro(formato);
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            mostrarErro(e.message || "Não foi possível exportar o relatório.");
        } finally {
            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    }

    try {
        pagamentosGestor = await window.api.get("/pagamentos/gestor");
    } catch (e) {
        mostrarErro(e.message || "Não foi possível carregar o resumo financeiro.");
    }

    try {
        const edificios = await window.api.get("/edificios");
        if (edificios.length) {
            const avarias = await window.api.get(`/avarias?id_edificio=${edificios[0].id}`);
            document.getElementById("kpi-av-abertas").textContent = String(avarias.filter((a) => !a.resolucao || a.resolucao.status !== 1).length);
            document.getElementById("kpi-av-resolvidas").textContent = String(avarias.filter((a) => a.resolucao?.status === 1).length);
        }
    } catch {}

    selPeriodo.addEventListener("change", () => {
        preencherDatasRapidas(selPeriodo.value);
        atualizarKpisFinanceiros();
    });

    inputInicio.addEventListener("change", atualizarKpisFinanceiros);
    inputFim.addEventListener("change",    atualizarKpisFinanceiros);

    document.getElementById("btn-rel-excel")?.addEventListener("click", () => descarregarRelatorio("excel"));
    document.getElementById("btn-rel-pdf")?.addEventListener("click",   () => descarregarRelatorio("pdf"));

    atualizarKpisFinanceiros();
})();
