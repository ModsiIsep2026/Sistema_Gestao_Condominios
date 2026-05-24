
(function () {
    "use strict";

    /* ── Aguardar app.js (sidebar/topbar/auth) ───────────────────────────── */
    function esperarApi(cb, tentativas) {
        tentativas = tentativas || 0;
        if (window.api && window.tipoAtual !== undefined) {
            cb();
        } else if (tentativas < 50) {
            setTimeout(function () { esperarApi(cb, tentativas + 1); }, 50);
        }
    }

    angular
        .module("appAdesoes", [])
        .controller("AdesoesCtrl", ["$scope", "$timeout", AdesoesCtrl]);

    function AdesoesCtrl($scope, $timeout) {

        /* ── Estado inicial ─────────────────────────────────────────────── */
        $scope.carregando    = true;
        $scope.totalPeriodo  = 0;
        $scope.totalHoje     = 0;
        $scope.totalGeral    = 0;
        $scope.periodoAtivo  = 30;
        $scope.labelPeriodo  = "nos últimos 30 dias";
        $scope.linhasTabela  = [];
        $scope.maxDia        = 1;

        $scope.periodos = [
            { dias: 1,  label: "Hoje"    },
            { dias: 7,  label: "7 dias"  },
            { dias: 15, label: "15 dias" },
            { dias: 30, label: "30 dias" },
        ];

        var grafico = null;

        /* ── Helpers ────────────────────────────────────────────────────── */
        function formatarData(iso, curto) {
            var partes = iso.split("-");
            if (curto) return partes[2] + "/" + partes[1];
            var meses  = ["Jan","Fev","Mar","Abr","Mai","Jun",
                          "Jul","Ago","Set","Out","Nov","Dez"];
            return partes[2] + " " + meses[parseInt(partes[1], 10) - 1] + " " + partes[0];
        }

        function labelPeriodoTexto(dias) {
            if (dias === 1)  return "hoje";
            return "nos últimos " + dias + " dias";
        }

        /* ── Carregar dados ─────────────────────────────────────────────── */
        function carregarDados(dias) {
            $scope.carregando = true;

            window.api.get("/gestores/adesoes?dias=" + dias)
                .then(function (dados) {
                    $timeout(function () {
                        var total   = dados.reduce(function (s, r) { return s + r.total; }, 0);
                        var comAdes = dados.filter(function (r) { return r.total > 0; });
                        var max     = comAdes.length
                            ? Math.max.apply(null, comAdes.map(function (r) { return r.total; }))
                            : 1;

                        $scope.totalPeriodo = total;
                        $scope.labelPeriodo = labelPeriodoTexto(dias);
                        $scope.maxDia       = max;
                        $scope.carregando   = false;

                        /* Tabela só com dias que tiveram adesões */
                        $scope.linhasTabela = comAdes.map(function (r) {
                            return {
                                data:         r.data,
                                dataFormatada: formatarData(r.data, false),
                                total:        r.total,
                            };
                        });

                        /* Actualizar KPI "hoje" */
                        var hoje = dados[dados.length - 1];
                        if (dias === 1 && hoje) $scope.totalHoje = hoje.total;

                        /* Gráfico */
                        var labels = dados.map(function (r) {
                            return dias === 1 ? "Hoje" : formatarData(r.data, true);
                        });
                        var valores = dados.map(function (r) { return r.total; });

                        $timeout(function () { renderizarGrafico(labels, valores, dias); }, 0);
                    });
                })
                .catch(function () {
                    $timeout(function () { $scope.carregando = false; });
                });
        }

        function carregarKpiHoje() {
            window.api.get("/gestores/adesoes?dias=1")
                .then(function (dados) {
                    $timeout(function () {
                        $scope.totalHoje = dados.length ? dados[0].total : 0;
                    });
                });
        }

        function carregarTotalGeral() {
            window.api.get("/gestores")
                .then(function (gestores) {
                    $timeout(function () { $scope.totalGeral = gestores.length; });
                });
        }

        /* ── Gráfico ────────────────────────────────────────────────────── */
        function renderizarGrafico(labels, valores, dias) {
            var canvas = document.getElementById("grafico-adesoes");
            if (!canvas) return;

            var corPrimaria = "#F08A24";

            if (grafico) {
                grafico.data.labels           = labels;
                grafico.data.datasets[0].data = valores;
                grafico.update();
                return;
            }

            grafico = new Chart(canvas.getContext("2d"), {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label:           "Adesões",
                        data:            valores,
                        backgroundColor: "rgba(240,138,36,0.7)",
                        borderColor:     corPrimaria,
                        borderWidth:     1,
                        borderRadius:    5,
                        hoverBackgroundColor: corPrimaria,
                    }],
                },
                options: {
                    responsive:          true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    var v = ctx.parsed.y;
                                    return "  " + v + " gestor" + (v !== 1 ? "es" : "");
                                },
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks:       { stepSize: 1, precision: 0 },
                            grid:        { color: "rgba(0,0,0,.06)" },
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                maxTicksLimit: dias <= 15 ? dias : 15,
                                maxRotation:   45,
                            },
                        },
                    },
                },
            });
        }

        /* ── Trocar período ─────────────────────────────────────────────── */
        $scope.selecionarPeriodo = function (dias) {
            $scope.periodoAtivo = dias;
            if (grafico) { grafico.destroy(); grafico = null; }
            carregarDados(dias);
        };

        /* ── Arranque ───────────────────────────────────────────────────── */
        /* Autenticação já garantida pelo app.js — só carregar dados */
        esperarApi(function () {
            carregarDados($scope.periodoAtivo);
            carregarKpiHoje();
            carregarTotalGeral();
        });
    }

})();
