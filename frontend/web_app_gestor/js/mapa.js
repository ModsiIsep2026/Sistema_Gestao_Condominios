
(async function () {

    await new Promise((r) => setTimeout(r, 100));

    const mapa = L.map("mapa", { minZoom: 4, maxZoom: 18 }).setView([39.7, -8.0], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(mapa);

    setTimeout(() => mapa.invalidateSize(), 200);


    const iconeEdificio = L.divIcon({
        className: "",
        html: `<div style="background:#0B2240;width:40px;height:40px;display:flex;align-items:center;
                            justify-content:center;border:2px solid #F08A24;box-shadow:0 2px 6px rgba(0,0,0,0.35);">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#F08A24" stroke="none">
                    <rect x="3"  y="8"  width="8"  height="13"/>
                    <rect x="13" y="3"  width="8"  height="18"/>
                    <rect x="5"  y="10" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="7.5" y="10" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="5"  y="13" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="7.5" y="13" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="15" y="5"  width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="17.5" y="5" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="15" y="8"  width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="17.5" y="8" width="1.5" height="1.5" fill="#0B2240"/>
                    <rect x="16" y="17" width="2" height="4" fill="#0B2240"/>
                </svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -36],
    });

    try {

        for (let i = 0; i < 30 && window.tipoAtual == null; i++) {
            await new Promise((r) => setTimeout(r, 50));
        }
        const endpoint = window.tipoAtual === "admin" ? "/edificios/todos" : "/edificios";
        const edificios = await window.api.get(endpoint);

        const markers = [];
        let semCoords = 0;

        for (const e of edificios) {
            const coords = await window.geocodificarMorada(e.rua, e.cp, e.cidade);
            if (!coords) { semCoords++; continue; }

            const { latitude: lat, longitude: lng } = coords;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.rua, e.cp, e.cidade].filter(Boolean).join(", "))}`;

            const marker = L.marker([lat, lng], { icon: iconeEdificio })
                .addTo(mapa)
                .bindPopup(`
                    <div style="font-family:Inter,sans-serif;min-width:220px;">
                        <strong style="color:#0B2240;font-size:14px;">${e.rua}</strong><br>
                        ${e.cidade ? `<span style="color:#5A5A5A;font-size:12px;">${e.cidade}</span><br>` : ""}
                        <div style="margin-top:10px;display:flex;gap:8px;flex-direction:column;">
                            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                               style="color:#F08A24;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;">
                                Ver no mapa ↗
                            </a>
                            <a href="edificios.html?id=${e.id}"
                               style="color:#0B2240;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;">
                                Ver detalhes →
                            </a>
                        </div>
                    </div>`);
            markers.push(marker);
        }

        if (markers.length > 0) {
            const grupo = L.featureGroup(markers);
            mapa.fitBounds(grupo.getBounds(), { padding: [60, 60], maxZoom: 11 });
        }

        if (semCoords > 0) {
            const aviso = L.control({ position: "bottomleft" });
            aviso.onAdd = function () {
                const div = L.DomUtil.create("div");
                div.style.cssText = `background:#FFF;border:1px solid #D4D4D4;border-left:3px solid #F08A24;
                                     padding:8px 14px;font-family:Inter,sans-serif;font-size:12px;color:#1A1A1A;max-width:300px;`;
                div.innerHTML = `<strong>${semCoords}</strong> edifício(s) sem localização encontrada.`;
                return div;
            };
            aviso.addTo(mapa);
        }

    } catch (e) {
    }

})();
