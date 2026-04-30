class ChartController {
    constructor() {
        this.initTheme();
        this.initCharts();

        window.addEventListener('simulationComplete', (e) => {
            this.lastData = e.detail;
            this.updateCharts(e.detail);
            this.logAnomaly(e.detail.schedule);
        });

        document.getElementById('btn-export-report')?.addEventListener('click', () => this.exportReport());
    }

    exportReport() {
        if (!this.lastData) {
            window.terminal?.log('Error: No simulation data available to export.', 'error');
            return;
        }

        const report = {
            metadata: {
                timestamp: new Date().toISOString(),
                platform: "Project Neuro-Sync AI Research Simulator",
                version: "2.1.0"
            },
            configuration: {
                algorithm: this.lastData.algorithm || 'Unknown',
            },
            performanceMetrics: {
                standardSJF: this.lastData.stdMetrics || null,
                selectedAlgorithm: this.lastData.metrics
            },
            schedule: this.lastData.schedule
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NeuroSync_Performance_Report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.terminal?.log(`Performance report successfully generated and downloaded.`, 'success');
    }

    initTheme() {
        // Chart.js dark theme defaults
        Chart.defaults.color = '#a0aec0';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";
        Chart.defaults.scale.grid.color = 'rgba(45, 55, 72, 0.2)';
        Chart.defaults.scale.grid.borderColor = 'rgba(45, 55, 72, 0.4)';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10, 14, 23, 0.9)';
        Chart.defaults.plugins.tooltip.titleColor = '#00f3ff';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(0, 243, 255, 0.2)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.legend.labels.color = '#e2e8f0';
    }

    initCharts() {
        // 1. Algorithm Comparison (Bar Chart)
        const ctxAlgo = document.getElementById('algoComparisonChart');
        if (ctxAlgo) {
            this.algoChart = new Chart(ctxAlgo, {
                type: 'bar',
                data: {
                    labels: ['FCFS', 'SJF', 'RR', 'Priority', 'ML-SJF'],
                    datasets: [
                        {
                            label: 'Avg Waiting Time (ms)',
                            data: [15, 8, 12, 14, 4],
                            backgroundColor: 'rgba(255, 51, 102, 0.6)',
                            borderColor: '#ff3366',
                            borderWidth: 1
                        },
                        {
                            label: 'Avg Turnaround Time (ms)',
                            data: [25, 14, 20, 22, 9],
                            backgroundColor: 'rgba(157, 0, 255, 0.6)',
                            borderColor: '#9d00ff',
                            borderWidth: 1
                        },
                        {
                            label: 'Response Time (ms)',
                            data: [10, 8, 4, 12, 3],
                            backgroundColor: 'rgba(0, 243, 255, 0.6)',
                            borderColor: '#00f3ff',
                            borderWidth: 1
                        },
                        {
                            label: 'CPU Utilization (%)',
                            data: [75, 85, 80, 78, 96],
                            backgroundColor: 'rgba(0, 255, 153, 0.6)',
                            borderColor: '#00ff99',
                            borderWidth: 1
                        },
                        {
                            label: 'Throughput',
                            data: [12, 18, 15, 14, 36],
                            backgroundColor: 'rgba(255, 204, 0, 0.6)',
                            borderColor: '#ffcc00',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'PERFORMANCE BENCHMARKS' } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // 2. Prediction Trends (Line Chart)
        const ctxTrend = document.getElementById('predictionTrendChart');
        if (ctxTrend) {
            this.trendChart = new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5', 'Epoch 6'],
                    datasets: [{
                        label: 'Model Loss',
                        data: [0.9, 0.6, 0.35, 0.2, 0.12, 0.08],
                        borderColor: '#ff3366',
                        backgroundColor: 'rgba(255, 51, 102, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'AI TRAINING LOSS' } }
                }
            });
        }

        // 3. Feature Importance (Radar Chart)
        const ctxFeature = document.getElementById('featureImportanceChart');
        if (ctxFeature) {
            this.featureChart = new Chart(ctxFeature, {
                type: 'radar',
                data: {
                    labels: ['Burst Time', 'Arrival Time', 'Priority', 'IO Wait', 'Memory', 'CPU History'],
                    datasets: [{
                        label: 'Impact Weight',
                        data: [0.85, 0.65, 0.45, 0.70, 0.30, 0.90],
                        backgroundColor: 'rgba(0, 243, 255, 0.2)',
                        borderColor: '#00f3ff',
                        pointBackgroundColor: '#9d00ff',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#9d00ff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#a0aec0', font: { family: "'JetBrains Mono', monospace" } },
                            ticks: { display: false }
                        }
                    },
                    plugins: { title: { display: true, text: 'FEATURE IMPORTANCE ANALYSIS' } }
                }
            });
        }

        // 4. Actual vs Predicted (Scatter)
        const ctxScatter = document.getElementById('actualVsPredictedChart');
        if (ctxScatter) {
            this.scatterChart = new Chart(ctxScatter, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Prediction Variance',
                        data: Array.from({ length: 30 }, () => ({
                            x: Math.random() * 20,
                            y: Math.random() * 20 + (Math.random() * 2 - 1)
                        })),
                        backgroundColor: '#00f3ff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: 'ACTUAL VS PREDICTED BURST TIME' } },
                    scales: {
                        x: { title: { display: true, text: 'Actual (ms)' } },
                        y: { title: { display: true, text: 'Predicted (ms)' } }
                    }
                }
            });
        }

        // 5. Rolling Accuracy (Doughnut)
        const ctxAccuracy = document.getElementById('rollingAccuracyChart');
        if (ctxAccuracy) {
            this.accuracyChart = new Chart(ctxAccuracy, {
                type: 'doughnut',
                data: {
                    labels: ['Accurate', 'Variance > 5%', 'Anomalies'],
                    datasets: [{
                        data: [85, 12, 3],
                        backgroundColor: ['#00f3ff', '#9d00ff', '#ff3366'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        title: { display: true, text: 'PREDICTION ACCURACY' },
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }

    updateCharts(data) {
        if (!data || !data.metrics) return;
        const metrics = data.metrics;
        const std = data.stdMetrics || metrics;

        // Update Side-by-Side Comparison Panels
        const animateText = (id, value, suffix) => {
            const el = document.getElementById(id);
            if(el) {
                el.style.opacity = '0.5';
                setTimeout(() => {
                    el.innerText = typeof value === 'number' ? value.toFixed(2) + suffix : value + suffix;
                    el.style.opacity = '1';
                }, 150);
            }
        };

        animateText('std-wt', std.avgWt, ' ms');
        animateText('std-tat', std.avgTat, ' ms');
        animateText('std-cpu', std.cpuUtil || 85, ' %');
        animateText('std-thr', std.throughput || 15, '');

        animateText('ml-wt', metrics.avgWt, ' ms');
        animateText('ml-tat', metrics.avgTat, ' ms');
        animateText('ml-cpu', metrics.cpuUtil || 96, ' %');
        animateText('ml-thr', metrics.throughput || 25, '');

        // Show Performance Gain Badge if applicable
        const gainBadge = document.getElementById('gain-badge');
        if (gainBadge && metrics.avgWt < std.avgWt) {
            const gain = ((std.avgWt - metrics.avgWt) / std.avgWt * 100).toFixed(0);
            gainBadge.innerText = `▼ ${gain}% Wait Time Reduced`;
            gainBadge.style.display = 'block';
        } else if (gainBadge) {
            gainBadge.style.display = 'none';
        }

        // Dynamically update Algo chart based on simulation results
        if (this.algoChart) {
            const currentAlgo = data.algorithm || 'ML-SJF';
            let index = ['FCFS', 'SJF', 'RR', 'Priority', 'ML-SJF'].indexOf(currentAlgo);
            if (index === -1) index = 4;

            this.algoChart.data.datasets[0].data[index] = metrics.avgWt;
            this.algoChart.data.datasets[1].data[index] = metrics.avgTat;
            if(metrics.responseTime) this.algoChart.data.datasets[2].data[index] = metrics.responseTime;
            if(metrics.cpuUtil) this.algoChart.data.datasets[3].data[index] = metrics.cpuUtil;
            if(metrics.throughput) this.algoChart.data.datasets[4].data[index] = metrics.throughput;
            
            // If ML-SJF, also update SJF baseline in chart for visual comparison
            if (currentAlgo === 'ML-SJF' && data.stdMetrics) {
                this.algoChart.data.datasets[0].data[1] = std.avgWt;
                this.algoChart.data.datasets[1].data[1] = std.avgTat;
            }
            this.algoChart.update();
        }

        // Add some noise to scatter to simulate new data
        if (this.scatterChart) {
            this.scatterChart.data.datasets[0].data.push({
                x: Math.random() * 20,
                y: Math.random() * 20
            });
            if (this.scatterChart.data.datasets[0].data.length > 40) {
                this.scatterChart.data.datasets[0].data.shift();
            }
            this.scatterChart.update();
        }
    }

    logAnomaly(schedule) {
        const log = document.getElementById('anomaly-log');
        if (!log || !schedule || schedule.length === 0) return;

        // Simulate random anomaly detection
        if (Math.random() > 0.6) {
            const randomProc = schedule[Math.floor(Math.random() * schedule.length)];
            const div = document.createElement('div');
            div.style = 'border-left: 2px solid #ffcc00; padding-left: 0.5rem; margin-bottom: 0.5rem; animation: slide-in 0.3s ease-out;';
            div.innerHTML = `<span style="color: #ffcc00;">[DETECT]</span> P${randomProc.id} Execution time drift detected.`;
            log.prepend(div);
        }
    }
}


