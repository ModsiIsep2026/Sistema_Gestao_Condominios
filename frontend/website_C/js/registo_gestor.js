(function () {

    const formDados      = document.getElementById("form-dados");
    const secaoPagamento = document.getElementById("secao-pagamento");
    const mesesSecao     = document.getElementById("meses-secao");
    const stripeSec      = document.getElementById("stripe-secao");
    const msgErro        = document.getElementById("msg-erro");
    const passo1         = document.getElementById("passo-1-ind");
    const passo2         = document.getElementById("passo-2-ind");
    const licencasBox    = document.getElementById("licencas-container");

    let stripe         = null;
    let cardElement    = null;
    let clientSecret   = null;
    let dadosUtilizador = null;
    let licencaSelecionada = null;
    let mesesSelecionados  = null;


    function mostrarErro(txt) {
        msgErro.textContent = txt;
        msgErro.hidden = false;
        msgErro.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    function limparErro() { msgErro.hidden = true; }

    function fmt(centimos) {
        return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" })
            .format(centimos / 100);
    }



    async function carregarLicencas() {
        try {
            const lista = await window.api.get("/licencas");
            if (!lista || lista.length === 0) {
                licencasBox.innerHTML = "<p style='font-size:13px;color:var(--cor-texto-suave)'>Nenhum plano disponível.</p>";
                return;
            }

            const grid = document.createElement("div");
            grid.className = "licencas-grid";

            lista.forEach((lic) => {
                const mensal = Math.max(50, Math.round(parseFloat(lic.ppem) * lic.num_edificios * 100));
                const card = document.createElement("div");
                card.className = "licenca-card";
                card.innerHTML = `
                    <div class="licenca-card__edificios">${lic.num_edificios}</div>
                    <div class="licenca-card__label">edifício${lic.num_edificios > 1 ? "s" : ""}</div>
                    <div class="licenca-card__preco">${fmt(mensal)}<br><small>/mês</small></div>
                `;
                card.addEventListener("click", () => aoEscolherPlano(card, lic));
                grid.appendChild(card);
            });

            licencasBox.innerHTML = "";
            licencasBox.appendChild(grid);

        } catch (_) {
            licencasBox.innerHTML = "<p style='font-size:13px;color:var(--cor-erro)'>Não foi possível carregar os planos.</p>";
        }
    }



    function aoEscolherPlano(card, lic) {
        document.querySelectorAll(".licenca-card").forEach(c => c.classList.remove("selecionado"));
        card.classList.add("selecionado");
        licencaSelecionada = lic;

        mesesSelecionados = null;
        document.querySelectorAll(".mes-btn").forEach(b => b.classList.remove("selecionado"));
        mesesSecao.style.display = "block";

   
        stripeSec.classList.add("oculto");
        if (cardElement) { cardElement.unmount(); cardElement = null; stripe = null; }
        clientSecret = null;
        limparErro();
    }


    document.querySelectorAll(".mes-btn").forEach(btn => {
        btn.addEventListener("click", () => aoEscolherMeses(btn));
    });

    async function aoEscolherMeses(btn) {
        if (!licencaSelecionada) return mostrarErro("Selecione primeiro um plano.");

        document.querySelectorAll(".mes-btn").forEach(b => b.classList.remove("selecionado"));
        btn.classList.add("selecionado");
        mesesSelecionados = parseInt(btn.dataset.meses, 10);


        stripeSec.classList.add("oculto");
        if (cardElement) { cardElement.unmount(); cardElement = null; stripe = null; }
        clientSecret = null;

        btn.disabled = true;
        limparErro();

        try {
            const resp = await fetch("/contratos/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome:       dadosUtilizador.nome,
                    email:      dadosUtilizador.email,
                    telemovel:  dadosUtilizador.telemovel,
                    nif:        dadosUtilizador.nif,
                    id_licenca: licencaSelecionada.id,
                    num_meses:  mesesSelecionados,
                }),
            });

            const dados = await resp.json();
            if (!resp.ok) throw new Error(dados.detail || "Erro ao preparar pagamento.");

            clientSecret = dados.client_secret;

       
            const nEd = licencaSelecionada.num_edificios;
            document.getElementById("resumo-edificios").textContent = nEd;
            document.getElementById("resumo-label-ed").textContent  = `edifício${nEd > 1 ? "s" : ""}`;
            document.getElementById("resumo-mensal").textContent    = `${fmt(dados.preco_mensal_centimos)}/mês`;
            document.getElementById("resumo-preco").textContent     = fmt(dados.preco_centimos);
            document.getElementById("resumo-detalhe").textContent   =
                `${fmt(dados.preco_mensal_centimos)} × ${dados.num_meses} mês${dados.num_meses > 1 ? "es" : ""} = total`;

         
            stripe = Stripe(dados.publishable_key);
            const elements = stripe.elements();
            cardElement = elements.create("card", {
                hidePostalCode: true,
                disableLink: true,
                style: {
                    base:    { fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1A1A" },
                    invalid: { color: "#c0392b" },
                },
            });
            cardElement.mount("#stripe-card");
            cardElement.on("change", ev => {
                document.getElementById("stripe-erro").textContent = ev.error ? ev.error.message : "";
            });

            stripeSec.classList.remove("oculto");

        } catch (err) {
            mostrarErro(err.message);
            btn.classList.remove("selecionado");
            mesesSelecionados = null;
        } finally {
            btn.disabled = false;
        }
    }



    formDados.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparErro();

        const nome      = document.getElementById("nome").value.trim();
        const email     = document.getElementById("email").value.trim();
        const telemovel = document.getElementById("telemovel").value.trim();
        const nif       = document.getElementById("nif").value.trim() || null;

        if (!nome || nome.length < 2)    return mostrarErro("Indique o seu nome completo.");
        if (!email)                       return mostrarErro("Indique o seu email.");
        if (!telemovel)                   return mostrarErro("Indique o seu telemóvel.");
        if (nif && !/^\d{9}$/.test(nif)) return mostrarErro("O NIF tem de ter 9 dígitos.");

        dadosUtilizador = { nome, email, telemovel, nif };

        formDados.style.display      = "none";
        secaoPagamento.style.display = "block";
        passo1.classList.remove("passo--ativo");
        passo1.classList.add("passo--feito");
        passo2.classList.add("passo--ativo");

        if (!licencasBox.querySelector(".licencas-grid")) await carregarLicencas();
    });



    document.getElementById("btn-voltar").addEventListener("click", () => {
        limparErro();
        secaoPagamento.style.display = "none";
        formDados.style.display      = "block";
        mesesSecao.style.display     = "none";
        stripeSec.classList.add("oculto");
        passo2.classList.remove("passo--ativo");
        passo1.classList.remove("passo--feito");
        passo1.classList.add("passo--ativo");

        if (cardElement) { cardElement.unmount(); cardElement = null; }
        stripe = null; clientSecret = null;
        licencaSelecionada = null; mesesSelecionados = null;
        document.querySelectorAll(".licenca-card").forEach(c => c.classList.remove("selecionado"));
        document.querySelectorAll(".mes-btn").forEach(b => b.classList.remove("selecionado"));
    });



    document.getElementById("form-pagamento").addEventListener("submit", async (e) => {
        e.preventDefault();
        limparErro();

        if (!licencaSelecionada) return mostrarErro("Selecione um plano.");
        if (!mesesSelecionados)  return mostrarErro("Selecione a duração do contrato.");
        if (!clientSecret)       return mostrarErro("Erro ao preparar pagamento. Selecione o plano novamente.");

        const btn = document.getElementById("btn-pagar");
        btn.disabled = true;
        btn.textContent = "A processar…";

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (error) {
                document.getElementById("stripe-erro").textContent = error.message;
                return;
            }
            if (paymentIntent.status !== "succeeded") {
                mostrarErro("O pagamento não foi confirmado. Tente novamente.");
                return;
            }

            const resp = await fetch("/contratos/concluir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    payment_intent_id: paymentIntent.id,
                    ...dadosUtilizador,
                    id_licenca: licencaSelecionada.id,
                    num_meses:  mesesSelecionados,
                }),
            });

            const dados = await resp.json();
            if (!resp.ok) throw new Error(dados.detail || "Erro ao criar conta.");

            sessionStorage.setItem("registo_email", dados.email || "");
            window.location.replace("registo_sucesso.html");

        } catch (err) {
            mostrarErro(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Confirmar pagamento";
        }
    });

})();
