
window.geocodificarMorada = async function (morada, codigoPostal, cidade) {
    const headers = { "Accept-Language": "pt-PT" };

    async function nominatim(params) {
        const qs = new URLSearchParams({ format: "json", limit: "1", countrycodes: "pt", ...params }).toString();
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`, { headers });
            if (!r.ok) return null;
            const d = await r.json();
            if (d && d.length) return { latitude: parseFloat(d[0].lat), longitude: parseFloat(d[0].lon) };
            return null;
        } catch { return null; }
    }

    // 1. Estruturado: rua + CP + cidade
    if (morada && codigoPostal && cidade) {
        const r = await nominatim({ street: morada, postalcode: codigoPostal, city: cidade });
        if (r) return r;
    }

    // 2. Estruturado: rua + CP (sem cidade — pode estar errada)
    if (morada && codigoPostal) {
        const r = await nominatim({ street: morada, postalcode: codigoPostal });
        if (r) return r;
    }

    // 3. Só CP — sempre localiza a zona correta
    if (codigoPostal) {
        const r = await nominatim({ postalcode: codigoPostal });
        if (r) return r;
    }

    // 4. Texto livre com todos os campos como último recurso
    const partes = [morada, codigoPostal, cidade, "Portugal"].filter(Boolean);
    return await nominatim({ q: partes.join(", ") });
};
