class SystemTerminal {
    constructor() {
        this.container = document.getElementById('system-terminal');
        this.output = document.getElementById('terminal-output');
        this.minimizeBtn = document.getElementById('term-minimize');
        this.maximizeBtn = document.querySelector('.ctrl-btn.maximize');
        this.closeBtn = document.querySelector('.ctrl-btn.close');
        
        this.isMinimized = true;
        this.isMaximized = false;

        // Initial State - Minimized
        if (this.output) this.output.style.display = 'none';

        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener('click', () => {
                this.isMinimized = !this.isMinimized;
                if(this.isMinimized) {
                    this.output.style.display = 'none';
                    if (this.isMaximized) {
                        this.container.style.position = 'static';
                        this.container.style.zIndex = 'auto';
                        this.container.style.width = 'auto';
                        this.output.style.height = '250px';
                        this.isMaximized = false;
                    }
                } else {
                    this.output.style.display = 'block';
                    this.container.style.display = 'flex';
                }
            });
        }
        
        if (this.maximizeBtn) {
            this.maximizeBtn.addEventListener('click', () => {
                if(this.isMinimized) {
                    this.isMinimized = false;
                    this.output.style.display = 'block';
                    this.container.style.display = 'flex';
                }
                
                this.isMaximized = !this.isMaximized;
                if(this.isMaximized) {
                    this.container.style.position = 'fixed';
                    this.container.style.top = '10%';
                    this.container.style.left = '10%';
                    this.container.style.width = '80vw';
                    this.container.style.height = '80vh';
                    this.container.style.zIndex = '9999';
                    this.output.style.height = 'calc(100% - 40px)';
                } else {
                    this.container.style.position = 'static';
                    this.container.style.width = 'auto';
                    this.container.style.height = 'auto';
                    this.container.style.zIndex = 'auto';
                    this.output.style.height = '250px';
                }
            });
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.container.style.display = 'none';
            });
        }
    }

    log(message, type = 'info') {
        this.output = document.getElementById('terminal-output');
        if (!this.output) return;
        
        const div = document.createElement('div');
        div.className = `term-line ${type}`;
        
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
        
        let color = '#a0aec0'; // info
        if (type === 'error') color = '#ff3366';
        if (type === 'warn') color = '#ffcc00';
        if (type === 'success') color = '#00f3ff';
        
        div.innerHTML = `<span style="color: #666">[${timestamp}]</span> <span style="color: ${color}">> ${message}</span>`;
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }

    printJSON(label, obj) {
        this.output = document.getElementById('terminal-output');
        if (!this.output) return;
        
        const div = document.createElement('div');
        div.className = 'term-line json-block';
        
        const str = JSON.stringify(obj, null, 2);
        const highlighted = str
            .replace(/(".*?"|null|true|false|\d+)/g, match => {
                if(match.startsWith('"')) return `<span style="color: #00f3ff">${match}</span>`;
                if(match === 'true' || match === 'false') return `<span style="color: #9d00ff">${match}</span>`;
                return `<span style="color: #00ff00">${match}</span>`;
            });
            
        div.innerHTML = `<div style="color: #a0aec0">--- ${label} ---</div><pre style="margin:0; font-family:var(--font-mono); font-size:0.85em;">${highlighted}</pre>`;
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }
}


