
(function () {
    "use strict";


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


        $scope.carregando    = true;
        $scope.totalPeriodo  = 0;
        $scope.totalHoje     = 0;
        $scope.totalGeral    = 0;
        $scope.mediaDia      = 0;
        $scope.acumuladoFinal = 0;
        $scope.maiorDia      = { total: 0, dataFormatada: "—" };
        $scope.diasComAdesoes = 0;
        $scope.periodoAtivo  = 30;
        $scope.labelPeriodo  = "nos últimos 30 dias";
        $scope.linhasTabela  = [];
        $scope.maxDia        = 1;

        $scope.periodos = [
            { dias: 1,   label: "Hoje"    },
            { dias: 7,   label: "7 dias"  },
            { dias: 15,  label: "15 dias" },
            { dias: 30,  label: "30 dias" },
            { dias: 180, label: "6 meses" },
            { dias: 365, label: "1 ano"   },
        ];

        var grafico = null;

        var MESES = ["Jan","Fev","Mar","Abr","Mai","Jun",
                     "Jul","Ago","Set","Out","Nov","Dez"];

        function formatarData(iso, curto) {
            var partes = iso.split("-");
            if (curto) return partes[2] + "/" + partes[1];
            return partes[2] + " " + MESES[parseInt(partes[1], 10) - 1] + " " + partes[0];
        }

        function agruparPorMes(dados) {
            var mapa = {}, ordem = [];
            dados.forEach(function (r) {
                var partes = r.data.split("-");
                var chave  = partes[0] + "-" + partes[1];
                var label  = MESES[parseInt(partes[1], 10) - 1] + "/" + partes[0].slice(2);
                if (!mapa[chave]) {
                    mapa[chave] = { label: label, total: 0 };
                    ordem.push(chave);
                }
                mapa[chave].total += r.total;
            });
            return ordem.map(function (k) { return mapa[k]; });
        }

        function labelPeriodoTexto(dias) {
            if (dias === 1)  return "hoje";
            return "nos últimos " + dias + " dias";
        }

     
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

            
                        $scope.linhasTabela = comAdes.map(function (r) {
                            return {
                                data:         r.data,
                                dataFormatada: formatarData(r.data, false),
                                total:        r.total,
                            };
                        });

                      
                        var hoje = dados[dados.length - 1];
                        if (dias === 1 && hoje) $scope.totalHoje = hoje.total;

                        var valores = dados.map(function (r) { return r.total; });

                        $scope.mediaDia       = dias > 0 ? (total / dias).toFixed(1) : "0";

                 
                        var labels, valoresGrafico;
                        if (dias >= 180) {
                            var porMes     = agruparPorMes(dados);
                            labels         = porMes.map(function (m) { return m.label; });
                            valoresGrafico = porMes.map(function (m) { return m.total; });
                        } else {
                            labels         = dados.map(function (r) {
                                return dias === 1 ? "Hoje" : formatarData(r.data, true);
                            });
                            valoresGrafico = valores;
                        }

                        $timeout(function () { renderizarGrafico(labels, valoresGrafico, dias); }, 0);
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

        
        function renderizarGrafico(labels, valores, dias) {
            var canvas = document.getElementById("grafico-adesoes");
            if (!canvas) return;

            var corPrimaria  = "#F08A24";

            if (grafico) {
                grafico.data.labels = labels;
                grafico.data.datasets[0].data = valores;
                grafico.update();
                return;
            }

            var escuro = document.documentElement.getAttribute("data-tema") === "escuro";
            var corTick = escuro ? "#9698A9" : "#6B7280";
            var corGrid = escuro ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

            grafico = new Chart(canvas.getContext("2d"), {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Adesões",
                            data: valores,
                            backgroundColor: "rgba(240,138,36,0.7)",
                            borderColor: corPrimaria,
                            borderWidth: 1,
                            borderRadius: 5,
                            hoverBackgroundColor: corPrimaria,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    var v = ctx.parsed.y;
                                    return "Adesões: " + v + " gestor" + (v !== 1 ? "es" : "");
                                },
                            },
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, precision: 0, color: corTick },
                            grid: { color: corGrid },
                            title: { display: true, text: "Adesões/dia", color: corTick },
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                maxTicksLimit: dias <= 15 ? dias : 15,
                                maxRotation: 45,
                                color: corTick,
                            },
                        },
                    },
                },
            });
        }


        $scope.selecionarPeriodo = function (dias) {
            $scope.periodoAtivo = dias;
            if (grafico) { grafico.destroy(); grafico = null; }
            carregarDados(dias);
        };


        esperarApi(function () {
            carregarDados($scope.periodoAtivo);
            carregarKpiHoje();
            carregarTotalGeral();
        });
    }

})();
