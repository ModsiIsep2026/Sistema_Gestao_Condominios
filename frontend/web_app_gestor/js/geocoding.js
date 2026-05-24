
window.geocodificarMorada = async function (morada, codigoPostal, cidade, pais = "Portugal") {
    const partes = [morada, codigoPostal, cidade, pais].filter(Boolean);
    const query = partes.join(", ");

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

    try {
        const resposta = await fetch(url, {
            headers: {

                "Accept-Language": "pt-PT",
            },
        });

        if (!resposta.ok) return null;
        const dados = await resposta.json();
        if (!dados || dados.length === 0) return null;

        return {
            latitude:  parseFloat(dados[0].lat),
            longitude: parseFloat(dados[0].lon),
        };
    } catch (e) {
        return null;
    }
};
