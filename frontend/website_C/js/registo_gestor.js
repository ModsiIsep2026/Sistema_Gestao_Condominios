(function () {

    const formDados      = document.getElementById("form-dados");
    const secaoPagamento = document.getElementById("secao-pagamento");
    const msgErro        = document.getElementById("msg-erro");
    const msgSucesso     = document.getElementById("msg-sucesso");
    const labelPreco     = document.getElementById("label-preco");
    const passo1         = document.getElementById("passo-1-ind");
    const passo2         = document.getElementById("passo-2-ind");

    let stripe, cardElement, clientSecret, dadosUtilizador;

    function mostrarErro(texto) {
        msgErro.textContent = texto;
        msgErro.hidden = false;
        msgSucesso.hidden = true;
    }

    function limparErro() {
        msgErro.hidden = true;
    }

    formDados.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparErro();

        const nome     = document.getElementById("nome").value.trim();
        const email    = document.getElementById("email").value.trim();
        const telemovel = document.getElementById("telemovel").value.trim() || null;
        const nif      = document.getElementById("nif").value.trim() || null;

        if (!nome || nome.length < 2) return mostrarErro("Indique o seu nome completo.");
        if (!email)                   return mostrarErro("Indique o seu email.");
        if (nif && !/^\d{9}$/.test(nif)) return mostrarErro("O NIF tem de ter 9 dígitos.");

        const btn = document.getElementById("btn-avancar");
        btn.disabled = true;
        btn.textContent = "A preparar pagamento...";

        try {
            const resp = await fetch("/subscricao/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, telemovel, nif }),
            });

            const dados = await resp.json();
            if (!resp.ok) throw new Error(dados.detail || "Erro ao iniciar registo.");

            clientSecret = dados.client_secret;
            dadosUtilizador = { nome, email, telemovel, nif };
            const precoCentimos = dados.preco_centimos;
            const precoFormatado = new Intl.NumberFormat("pt-PT", {
                style: "currency", currency: "EUR"
            }).format(precoCentimos / 100);

            labelPreco.textContent = `Plano Gestor — ${precoFormatado}`;
            labelPreco.className = "preco-badge";

    
            stripe = Stripe(dados.publishable_key);
            const elements = stripe.elements();
            cardElement = elements.create("card", {
                hidePostalCode: true,
                disableLink: true,
                style: {
                    base: { fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#1A1A1A" },
                    invalid: { color: "#c0392b" },
                },
            });
            cardElement.mount("#stripe-card");
            cardElement.on("change", (ev) => {
                document.getElementById("stripe-erro").textContent = ev.error ? ev.error.message : "";
            });

        
            formDados.style.display = "none";
            secaoPagamento.style.display = "block";
            passo1.classList.remove("passo--ativo");
            passo1.classList.add("passo--feito");
            passo2.classList.add("passo--ativo");

        } catch (err) {
            mostrarErro(err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Avançar para pagamento →";
        }
    });

    document.getElementById("btn-voltar").addEventListener("click", () => {
        limparErro();
        secaoPagamento.style.display = "none";
        formDados.style.display = "block";
        passo2.classList.remove("passo--ativo");
        passo1.classList.remove("passo--feito");
        passo1.classList.add("passo--ativo");
        if (cardElement) cardElement.unmount();
        cardElement = null;
        clientSecret = null;
    });


    document.getElementById("form-pagamento").addEventListener("submit", async (e) => {
        e.preventDefault();
        limparErro();

        const btn = document.getElementById("btn-pagar");
        btn.disabled = true;
        btn.textContent = "A processar...";

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (error) {
                document.getElementById("stripe-erro").textContent = error.message;
                return;
            }

            if (paymentIntent.status !== "succeeded") {
                mostrarErro("O pagamento não foi confirmado. Tenta novamente.");
                return;
            }

       
            const resp = await fetch("/subscricao/concluir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_intent_id: paymentIntent.id, ...dadosUtilizador }),
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
