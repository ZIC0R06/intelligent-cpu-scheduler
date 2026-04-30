class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.particles = [];
        this.particleCount = 50; // Reduced for performance
        this.cpuLoad = 0.5; // Current smoothed load
        this.targetCpuLoad = 0.5; // Target load for interpolation
        this.connections = true;
        
        this.init();
        this.animate();
        this.handleResize();
        this.simulateCPULoad();
    }
    
    init() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radius: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.4 ? '#00f3ff' : '#9d00ff'
            });
        }
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.init();
        });
    }

    simulateCPULoad() {
        // Randomly assign target load, eliminating abrupt jumps
        setInterval(() => {
            this.targetCpuLoad = Math.random();
            
            // Dispatch custom event for other components to react
            window.dispatchEvent(new CustomEvent('cpuLoadUpdate', { 
                detail: { load: this.targetCpuLoad } 
            }));
        }, 1500);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Smooth continuous interpolation per frame (no jitter)
        this.cpuLoad += (this.targetCpuLoad - this.cpuLoad) * 0.02;
        
        const speedMultiplier = 1 + (this.cpuLoad * 1.2);
        const connectionDistance = 80 + (this.cpuLoad * 20); // Reduced for performance
        
        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            p.x += p.vx * speedMultiplier;
            p.y += p.vy * speedMultiplier;
            
            // Wrap around edges
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // Draw connections
            if (this.connections) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    let p2 = this.particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < connectionDistance) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        let opacity = 1 - (dist / connectionDistance);
                        this.ctx.strokeStyle = `rgba(157, 0, 255, ${opacity * 0.3})`;
                        if (p.color === '#00f3ff' || p2.color === '#00f3ff') {
                            this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.3})`;
                        }
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new ParticleSystem('particle-canvas-container');
});
