class GanttChart {
    constructor() {
        this.container = document.getElementById('gantt-chart');
        this.metricsContainer = document.getElementById('simulation-metrics');
        
        window.addEventListener('simulationComplete', (e) => {
            this.render(e.detail.schedule, e.detail.metrics);
        });
    }

    render(schedule, metrics) {
        this.container = document.getElementById('gantt-chart');
        this.metricsContainer = document.getElementById('simulation-metrics');
        
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.style.display = 'flex';
        this.container.style.width = '100%';
        this.container.style.overflowX = 'auto';
        
        const totalTime = schedule[schedule.length - 1]?.end || 1;
        
        schedule.forEach((block, index) => {
            const widthPct = ((block.end - block.start) / totalTime) * 100;
            
            const div = document.createElement('div');
            div.className = 'gantt-block';
            div.style.width = `${widthPct}%`;
            div.style.backgroundColor = this.getColorForPid(block.id);
            div.style.animationDelay = `${index * 0.1}s`;
            
            div.innerHTML = `
                <span class="gantt-pid">P${block.id}</span>
                <span class="gantt-time">${block.start} - ${block.end}</span>
            `;
            
            this.container.appendChild(div);
        });

        if (this.metricsContainer && metrics) {
            this.metricsContainer.style.display = 'grid';
            document.getElementById('avg-wt').innerText = metrics.avgWt.toFixed(2) + ' ms';
            document.getElementById('avg-tat').innerText = metrics.avgTat.toFixed(2) + ' ms';
            document.getElementById('cpu-util').innerText = metrics.utilization.toFixed(1) + '%';
        }
    }

    getColorForPid(pid) {
        const colors = [
            'rgba(0, 243, 255, 0.7)',
            'rgba(157, 0, 255, 0.7)',
            'rgba(255, 0, 128, 0.7)',
            'rgba(0, 255, 128, 0.7)',
            'rgba(255, 200, 0, 0.7)',
            'rgba(0, 150, 255, 0.7)'
        ];
        return colors[(pid - 1) % colors.length];
    }
}


