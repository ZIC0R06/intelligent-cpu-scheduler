class TypewriterEffect {
    constructor(selector, sequences) {
        this.element = document.querySelector(selector);
        if (!this.element) return;
        
        // Remove existing CSS animation by resetting content and inline styles
        this.element.style.animation = 'none';
        this.element.style.whiteSpace = 'pre-wrap';
        this.element.style.borderRight = '2px solid var(--neon-cyan)';
        this.element.innerHTML = '';
        
        this.sequences = sequences;
        this.sequenceIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        this.typingSpeed = 40;
        this.deletingSpeed = 20;
        this.pauseEnd = 2500;
        this.pauseStart = 600;
        
        this.type();
        this.blinkCursor();
    }
    
    blinkCursor() {
        setInterval(() => {
            this.element.style.borderColor = 
                this.element.style.borderColor === 'transparent' ? 'var(--neon-cyan)' : 'transparent';
        }, 500);
    }
    
    type() {
        const currentSequence = this.sequences[this.sequenceIndex];
        
        if (this.isDeleting) {
            this.charIndex--;
        } else {
            this.charIndex++;
        }
        
        this.element.innerHTML = currentSequence.substring(0, this.charIndex);
        
        let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        // Randomize typing speed slightly for realism
        if (!this.isDeleting) {
            typeSpeed += Math.random() * 40;
        }
        
        if (!this.isDeleting && this.charIndex === currentSequence.length) {
            typeSpeed = this.pauseEnd;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.sequenceIndex = (this.sequenceIndex + 1) % this.sequences.length;
            typeSpeed = this.pauseStart;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lines = [
        "> Accessing quantum core...\n> Optimizing thread distribution...\n> Awaiting command input.",
        "> Initializing neural pathways...\n> Calibrating load balancers...\n> System state: NOMINAL.",
        "> Syncing orbital nodes...\n> Rerouting background processes...\n> Ready for workload allocation."
    ];
    
    new TypewriterEffect('.typewriter-text', lines);
});
