
(async function () {

    let dados      = [];
    let tecnicos   = [];
    let edificios  = [];
    let idEdificio = null;
    let avariaSel  = null;
    let tipoAlocar = "interno";

    const tbody    = document.querySelector('[data-tabela="avarias"]');
    const selectEd = document.getElementById("filtro-edificio");
    const filtroEst = document.getElementById("filtro-estado");

    const fmtData = (iso) => iso
        ? new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    function estadoBadge(avaria) {
        if (!avaria.resolucao) return `<span class="estado estado--nova">Aberta</span>`;
        if (avaria.resolucao.status === 1) return `<span class="estado estado--ok">Resolvida</span>`;
        return avaria.resolucao.id_tecnico == null
            ? `<span class="estado estado--ext">Serviço externo</span>`
            : `<span class="estado estado--prog">Em progresso</span>`;
    }

    function atribuidoA(avaria) {
        if (!avaria.resolucao) {
            const match = (avaria.descricao || "").match(/\[Externo: ([^\]]+)\]/);
            return match ? `🏢 ${match[1]}` : "—";
        }
        if (avaria.resolucao.id_tecnico == null) {
            const match = (avaria.descricao || "").match(/\[Externo: ([^\]]+)\]/);
            return match ? `🏢 ${match[1]}` : "🏢 Externo";
        }
        return avaria.resolucao.tecnico?.nome || `Técnico #${avaria.resolucao.id_tecnico}`;
    }

    function renderizar(lista) {
        if (!lista.length) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="app-vazio">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cor-texto-suave)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        <h3>Sem avarias</h3>
                        <p>Sem ocorrências registadas. Bom trabalho!</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = lista.map((a) => {
            const resolvida   = a.resolucao?.status === 1;
            const emProgresso = a.resolucao && a.resolucao.status === 0;
            const temExterno  = !a.resolucao && (a.descricao || "").includes("[Externo:");
            const descLimpa   = (a.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
            const descExibir  = descLimpa.length > 55 ? descLimpa.substring(0, 55) + "…" : (descLimpa || "—");

            let acoes = "";
            if (!resolvida) {
                const labelBtn = (emProgresso || temExterno) ? "Reatribuir" : "Alocar";
                acoes += `<button data-acao="alocar" data-id="${a.id}">🔧 ${labelBtn}</button> `;
            }
            acoes += `<button data-acao="detalhe" data-id="${a.id}" style="font-size:12px;background:transparent;border:1px solid var(--cor-borda);color:var(--cor-texto-secundario);">Ver</button>`;

            return `
                <tr>
                    <td style="white-space:nowrap;">${fmtData(a.data_registo)}</td>
                    <td><strong>${a.zona || "—"}</strong></td>
                    <td style="color:var(--cor-texto-secundario);font-size:13px;">${descExibir}</td>
                    <td>${estadoBadge(a)}</td>
                    <td style="font-size:13px;">${atribuidoA(a)}</td>
                    <td class="app-tabela__acoes">${acoes}</td>
                </tr>`;
        }).join("");
    }

    function filtrarERenderizar() {
        let lista = [...dados];
        const pesquisa = (document.querySelector("[data-pesquisa]")?.value || "").toLowerCase().trim();
        const estado   = filtroEst?.value || "";

        if (pesquisa) lista = lista.filter((a) =>
            (a.zona || "").toLowerCase().includes(pesquisa) ||
            (a.descricao || "").toLowerCase().includes(pesquisa)
        );
        if (estado === "nova") lista = lista.filter((a) => !a.resolucao && !(a.descricao || "").includes("[Externo:"));
        else if (estado === "prog") lista = lista.filter((a) => a.resolucao && a.resolucao.status === 0);
        else if (estado === "ext")  lista = lista.filter((a) => !a.resolucao && (a.descricao || "").includes("[Externo:"));
        else if (estado === "ok")   lista = lista.filter((a) => a.resolucao?.status === 1);

        renderizar(lista);
    }

    async function carregar() {
        if (!idEdificio) {
            tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Selecione um edifício.</p></td></tr>`;
            return;
        }
        try {
            dados = await window.api.get(`/avarias?id_edificio=${idEdificio}`);
            filtrarERenderizar();
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
        }
    }

    try {
        [edificios, tecnicos] = await Promise.all([
            window.api.get("/edificios"),
            window.api.get("/tecnicos").catch(() => []),
        ]);

        if (selectEd) {
            selectEd.innerHTML =
                `<option value="">— Selecione um edifício —</option>` +
                edificios.map((e) =>
                    `<option value="${e.id}">${e.rua}${e.cidade ? ", " + e.cidade : ""}</option>`
                ).join("");
            selectEd.addEventListener("change", () => {
                idEdificio = selectEd.value ? parseInt(selectEd.value) : null;
                carregar();
            });
            if (edificios.length) {
                selectEd.value = edificios[0].id;
                idEdificio     = edificios[0].id;
                await carregar();
            }
        }

        const selTec = document.getElementById("sel-tecnico");
        if (selTec) {
            const ativos = tecnicos.filter((t) => t.status !== 0);
            selTec.innerHTML = ativos.length
                ? `<option value="">Selecionar técnico…</option>` +
                  ativos.map((t) =>
                      `<option value="${t.id}">${t.nome}${t.funcao ? " — " + t.funcao : ""}</option>`
                  ).join("")
                : `<option value="">Sem técnicos ativos</option>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="app-vazio"><p>Erro: ${e.message}</p></td></tr>`;
    }

    document.querySelector("[data-pesquisa]")?.addEventListener("input", filtrarERenderizar);
    filtroEst?.addEventListener("change", filtrarERenderizar);

    const modalAlocar  = document.getElementById("modal-alocar");
    const erroAlocar   = document.getElementById("erro-alocar");
    const btnConfirmar = document.getElementById("btn-confirmar-alocar");

    function abrirModalAlocar(avaria) {
        avariaSel  = avaria;
        tipoAlocar = "interno";

        document.getElementById("av-resumo-zona").textContent = avaria.zona || "—";
        const descLimpa = (avaria.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
        document.getElementById("av-resumo-desc").textContent = descLimpa || "(sem descrição)";

        erroAlocar.style.display = "none";
        document.getElementById("inp-nota").value     = "";
        document.getElementById("inp-empresa").value  = "";
        document.getElementById("inp-contacto").value = "";
        const selTec = document.getElementById("sel-tecnico");
        if (selTec) selTec.value = "";

        document.getElementById("btn-tipo-interno").classList.add("ativo");
        document.getElementById("btn-tipo-externo").classList.remove("ativo");
        document.getElementById("painel-interno").classList.add("visivel");
        document.getElementById("painel-externo").classList.remove("visivel");

        modalAlocar.style.display = "";
    }

    function fecharModalAlocar() { modalAlocar.style.display = "none"; avariaSel = null; }

    document.querySelectorAll("[data-fechar-modal-alocar]").forEach((el) =>
        el.addEventListener("click", fecharModalAlocar)
    );
    modalAlocar?.addEventListener("click", (e) => { if (e.target === modalAlocar) fecharModalAlocar(); });

    document.getElementById("btn-tipo-interno")?.addEventListener("click", () => {
        tipoAlocar = "interno";
        document.getElementById("btn-tipo-interno").classList.add("ativo");
        document.getElementById("btn-tipo-externo").classList.remove("ativo");
        document.getElementById("painel-interno").classList.add("visivel");
        document.getElementById("painel-externo").classList.remove("visivel");
    });
    document.getElementById("btn-tipo-externo")?.addEventListener("click", () => {
        tipoAlocar = "externo";
        document.getElementById("btn-tipo-externo").classList.add("ativo");
        document.getElementById("btn-tipo-interno").classList.remove("ativo");
        document.getElementById("painel-externo").classList.add("visivel");
        document.getElementById("painel-interno").classList.remove("visivel");
    });

    btnConfirmar?.addEventListener("click", async () => {
        if (!avariaSel) return;
        erroAlocar.style.display = "none";
        btnConfirmar.disabled    = true;
        btnConfirmar.textContent = "A guardar…";

        try {
            const nota = document.getElementById("inp-nota").value.trim();

            if (tipoAlocar === "interno") {
                const idTec = parseInt(document.getElementById("sel-tecnico").value);
                if (!idTec) {
                    erroAlocar.textContent   = "Selecione um técnico.";
                    erroAlocar.style.display = "";
                    return;
                }
                if (avariaSel.resolucao) {
                    await window.api.put(`/avarias/${avariaSel.id}/resolucao`, { id_tecnico: idTec, status: 0 });
                } else {
                    await window.api.post(`/avarias/${avariaSel.id}/resolucao`, {
                        id_registo_avaria: avariaSel.id,
                        id_tecnico: idTec,
                    });
                }
                let descAtual = (avariaSel.descricao || "").replace(/\[Externo:[^\]]*\]\n?/g, "").trim();
                if (nota) descAtual = descAtual ? `${descAtual}\nNota: ${nota}` : `Nota: ${nota}`;
                if (descAtual !== (avariaSel.descricao || "").trim()) {
                    await window.api.put(`/avarias/${avariaSel.id}`, { descricao: descAtual.substring(0, 255) });
                }
            } else {
                const empresa = document.getElementById("inp-empresa").value.trim();
                if (!empresa) {
                    erroAlocar.textContent   = "Indique o nome da empresa ou serviço.";
                    erroAlocar.style.display = "";
                    return;
                }
                const contacto = document.getElementById("inp-contacto").value.trim();
                const infoExt  = contacto ? `${empresa} (${contacto})` : empresa;
                let descAtual  = (avariaSel.descricao || "").replace(/\[Externo:[^\]]*\]\n?/g, "").trim();
                let novaDesc   = descAtual ? `${descAtual}\n[Externo: ${infoExt}]` : `[Externo: ${infoExt}]`;
                if (nota) novaDesc += `\nNota: ${nota}`;
                await window.api.put(`/avarias/${avariaSel.id}`, { descricao: novaDesc.substring(0, 255) });
            }

            fecharModalAlocar();
            await carregar();
        } catch (err) {
            erroAlocar.textContent   = err.message || "Erro ao guardar atribuição.";
            erroAlocar.style.display = "";
        } finally {
            btnConfirmar.disabled    = false;
            btnConfirmar.textContent = "Confirmar atribuição";
        }
    });

    const modalDetalhe = document.getElementById("modal-detalhe");

    function calcularPassosGestor(avaria) {
        // Passos: Reportada → Atribuída → Em progresso → Resolvida
        const passos = ["Reportada", "Atribuída", "Em progresso", "Resolvida"];
        let atual = 0;
        if (avaria.resolucao) {
            if (avaria.resolucao.status === 1) atual = 3;
            else if (avaria.resolucao.id_tecnico != null) atual = 2;
            else atual = 1;
        } else if ((avaria.descricao || "").includes("[Externo:")) {
            atual = 1;
        }
        return { passos, atual };
    }

    function renderizarPipeline(passos, atual) {
        return `<div class="av-pipeline">` +
            passos.map((nome, i) => {
                let cls = "av-pipeline__passo";
                let icone = "";
                if (i < atual) {
                    cls += " av-pipeline__passo--feito";
                    icone = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
                } else if (i === atual) {
                    cls += " av-pipeline__passo--ativo";
                    icone = `<span style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;"></span>`;
                }
                return `<div class="${cls}">
                    <div class="av-pipeline__circulo">${icone}</div>
                    <div class="av-pipeline__rotulo">${nome}</div>
                </div>`;
            }).join("") +
        `</div>`;
    }

    function abrirModalDetalhe(avaria) {
        const corpo     = document.getElementById("detalhe-corpo");
        const descLimpa = (avaria.descricao || "").replace(/\[Externo:[^\]]*\]/g, "").trim();
        const matchExt  = (avaria.descricao || "").match(/\[Externo: ([^\]]+)\]/);

        const { passos, atual } = calcularPassosGestor(avaria);
        let html = renderizarPipeline(passos, atual);

        html += `
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);width:130px;">Data</td>
                    <td>${fmtData(avaria.data_registo)}</td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Zona</td>
                    <td><strong>${avaria.zona || "—"}</strong></td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Estado</td>
                    <td>${estadoBadge(avaria)}</td></tr>
                <tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Atribuído a</td>
                    <td>${atribuidoA(avaria)}</td></tr>`;

        if (avaria.resolucao?.data_resolucao) {
            html += `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Resolvida em</td>
                         <td>${fmtData(avaria.resolucao.data_resolucao)}</td></tr>`;
        }
        if (matchExt) {
            html += `<tr><td style="padding:6px 0;color:var(--cor-texto-secundario);">Serviço externo</td>
                         <td>🏢 ${matchExt[1]}</td></tr>`;
        }
        html += `</table>`;

        if (descLimpa) {
            html += `
                <hr style="margin:16px 0;border:none;border-top:1px solid var(--cor-borda);">
                <p style="font-size:12px;color:var(--cor-texto-secundario);margin:0 0 6px;
                          text-transform:uppercase;letter-spacing:.05em;">Descrição</p>
                <p class="av-desc-completa">${descLimpa.replace(/\n/g, "<br>")}</p>`;
        }

        corpo.innerHTML = html;
        modalDetalhe.style.display = "";
    }

    document.querySelectorAll("[data-fechar-modal-detalhe]").forEach((el) =>
        el.addEventListener("click", () => { modalDetalhe.style.display = "none"; })
    );
    modalDetalhe?.addEventListener("click", (e) => {
        if (e.target === modalDetalhe) modalDetalhe.style.display = "none";
    });

    tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-acao]");
        if (!btn) return;
        const id  = parseInt(btn.dataset.id);
        const av  = dados.find((a) => a.id === id);
        if (!av) return;

        if (btn.dataset.acao === "alocar")  { abrirModalAlocar(av);  return; }
        if (btn.dataset.acao === "detalhe") { abrirModalDetalhe(av); return; }
    });

})();
