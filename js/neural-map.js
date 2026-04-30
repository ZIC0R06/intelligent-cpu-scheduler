class NeuralMap {
    constructor() {
        this.canvas = document.getElementById('neural-map');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.signals = [];
        
        // Setup scaling and observers
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initNodes();
        
        // Listeners for triggers
        window.addEventListener('processAdded', () => this.triggerSignals(true));
        window.addEventListener('simulationComplete', () => {
            // Rapid processing simulation
            let count = 0;
            const interval = setInterval(() => {
                this.triggerSignals(false);
                count++;
                if (count > 5) clearInterval(interval);
            }, 300);
        });

        this.animate();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
        this.initNodes();
    }

    initNodes() {
        if (!this.width) return;
        
        const padding = 30;
        const inputX = 150;
        const outputX = this.width - 150;
        
        // Define input features
        const features = [
            { id: 'at', label: 'Arrival Time', weight: 0.65 },
            { id: 'prio', label: 'Priority', weight: 0.45 },
            { id: 'mem', label: 'Memory', weight: 0.30 },
            { id: 'io', label: 'I/O Wait', weight: 0.70 },
            { id: 'hist', label: 'History', weight: 0.90 }
        ];

        this.nodes = [];
        
        // Input nodes
        const spacing = (this.height - padding * 2) / (features.length - 1);
        features.forEach((f, i) => {
            this.nodes.push({
                x: inputX,
                y: padding + (i * spacing),
                label: f.label,
                weight: f.weight,
                type: 'input',
                radius: 6 + (f.weight * 6),
                color: f.weight > 0.6 ? '#00f3ff' : '#9d00ff'
            });
        });

        // Output node (Prediction)
        this.nodes.push({
            x: outputX,
            y: this.height / 2,
            label: 'Burst Prediction',
            weight: 1.0,
            type: 'output',
            radius: 20,
            color: '#00ff99'
        });
    }

    triggerSignals(isSingle) {
        if (!this.nodes.length) return;
        
        const inputs = this.nodes.filter(n => n.type === 'input');
        const output = this.nodes.find(n => n.type === 'output');
        
        inputs.forEach(input => {
            // High weight nodes have a higher chance of firing brighter/faster
            if (Math.random() < input.weight + 0.2 || !isSingle) {
                this.signals.push({
                    startX: input.x,
                    startY: input.y,
                    endX: output.x,
                    endY: output.y,
                    progress: 0,
                    speed: 0.02 + (input.weight * 0.03),
                    color: input.color,
                    size: 2 + (input.weight * 2)
                });
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const inputs = this.nodes.filter(n => n.type === 'input');
        const output = this.nodes.find(n => n.type === 'output');

        // Draw connections
        if (output) {
            inputs.forEach(input => {
                this.ctx.beginPath();
                this.ctx.moveTo(input.x, input.y);
                
                // Draw bezier curve for "neural" feel
                const cpX = (input.x + output.x) / 2;
                this.ctx.bezierCurveTo(cpX, input.y, cpX, output.y, output.x, output.y);
                
                // Base line opacity on node weight
                this.ctx.strokeStyle = `rgba(157, 0, 255, ${0.1 + input.weight * 0.3})`;
                this.ctx.lineWidth = 1 + (input.weight * 2);
                this.ctx.stroke();
            });
        }

        // Draw and update signals
        for (let i = this.signals.length - 1; i >= 0; i--) {
            let s = this.signals[i];
            s.progress += s.speed;
            
            if (s.progress >= 1) {
                this.signals.splice(i, 1);
                // Simple pulse effect on output node when signal hits
                if (output) {
                    output.radius = 25;
                    setTimeout(() => { if (output.radius > 20) output.radius = 20; }, 100);
                }
                continue;
            }

            // Calculate current position along bezier curve
            const t = s.progress;
            const cpX = (s.startX + s.endX) / 2;
            
            const x = Math.pow(1 - t, 3) * s.startX + 
                      3 * Math.pow(1 - t, 2) * t * cpX + 
                      3 * (1 - t) * Math.pow(t, 2) * cpX + 
                      Math.pow(t, 3) * s.endX;
                      
            const y = Math.pow(1 - t, 3) * s.startY + 
                      3 * Math.pow(1 - t, 2) * t * s.startY + 
                      3 * (1 - t) * Math.pow(t, 2) * s.endY + 
                      Math.pow(t, 3) * s.endY;

            this.ctx.beginPath();
            this.ctx.arc(x, y, s.size, 0, Math.PI * 2);
            this.ctx.fillStyle = s.color;
            this.ctx.fill();
        }

        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.type === 'input' ? 'rgba(10, 14, 23, 1)' : 'rgba(0, 243, 255, 0.1)';
            this.ctx.fill();
            
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = node.color;
            this.ctx.stroke();

            // Draw Labels
            this.ctx.fillStyle = node.color;
            this.ctx.font = "10px 'JetBrains Mono', monospace";
            this.ctx.textAlign = node.type === 'input' ? 'right' : 'left';
            const xOffset = node.type === 'input' ? -20 : 30;
            this.ctx.fillText(node.label, node.x + xOffset, node.y + 4);
            
            // Draw weight value for inputs
            if (node.type === 'input') {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = "8px 'Orbitron', sans-serif";
                this.ctx.fillText(`W:${node.weight.toFixed(2)}`, node.x + xOffset, node.y + 16);
            }
        });
    }
}
