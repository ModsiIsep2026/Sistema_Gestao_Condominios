/* nao está implementado */
(function () {

    const form = document.getElementById("contacto-form");
    if (!form) return;

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nome = form.querySelector("#nome")?.value.trim();
        const email = form.querySelector("#email")?.value.trim();
        const mensagem = form.querySelector("#mensagem")?.value.trim();

        if (!nome || !email || !mensagem) {
            alert("Preencha o nome, email e mensagem.");
            return;
        }

        
        alert("Obrigado pelo contacto. Vamos responder dentro de 24h em dias úteis.");
        form.reset();
    });

})();
