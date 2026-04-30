document.addEventListener('DOMContentLoaded', () => {
    // Inject mobile menu CSS
    const style = document.createElement('style');
    style.textContent = `
        .mobile-menu-toggle {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 30px;
            height: 21px;
            cursor: pointer;
            z-index: 1001;
        }
        .mobile-menu-toggle span {
            display: block;
            height: 3px;
            width: 100%;
            background-color: var(--neon-cyan);
            border-radius: 3px;
            transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
            .mobile-menu-toggle { display: flex; }
            .hidden-mobile { display: none !important; }
            .nav-links {
                position: fixed;
                top: 0; right: -100%;
                width: 250px; height: 100vh;
                background: var(--void-panel);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                flex-direction: column;
                padding: 100px 2rem 2rem;
                transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: -5px 0 30px rgba(0,0,0,0.5);
                z-index: 1000;
                border-left: 1px solid var(--void-border);
            }
            .nav-links.show { right: 0; }
        }
    `;
    document.head.appendChild(style);

    // 1. Premium Smart Navbar Behavior
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    // Set smooth transition for all states
    navbar.style.transition = 'padding 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease';

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const overviewSection = document.getElementById('overview');
        const overviewHeight = overviewSection ? overviewSection.clientHeight - 100 : 500;
        
        // Appearance styling based on scroll position
        if (currentScrollY > 50) {
            navbar.style.padding = '0.5rem 2rem';
            navbar.style.background = 'rgba(10, 14, 23, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.padding = '0 2rem';
            navbar.style.background = 'var(--void-panel)';
            navbar.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
        }
        
        // Visibility logic
        if (currentScrollY > overviewHeight) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down past overview -> hide
                navbar.style.transform = 'translateY(-150%)';
                navbar.style.opacity = '0';
            } else {
                // Scrolling up -> reveal
                navbar.style.transform = 'translateY(0)';
                navbar.style.opacity = '1';
            }
        } else {
            // In overview section -> always visible
            navbar.style.transform = 'translateY(0)';
            navbar.style.opacity = '1';
        }
        
        lastScrollY = currentScrollY;
    });

    // Reveal on cursor near top edge
    window.addEventListener('mousemove', (e) => {
        if (e.clientY < 60) {
            navbar.style.transform = 'translateY(0)';
            navbar.style.opacity = '1';
        }
    });

    // Hide when cursor leaves navbar area, if past overview
    navbar.addEventListener('mouseleave', () => {
        const overviewSection = document.getElementById('overview');
        const overviewHeight = overviewSection ? overviewSection.clientHeight - 100 : 500;
        
        if (window.scrollY > overviewHeight) {
            navbar.style.transform = 'translateY(-150%)';
            navbar.style.opacity = '0';
        }
    });

    // 2. Smooth Scroll & Active Nav Highlighting
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if(targetId.startsWith('#')) {
                e.preventDefault();
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu if open
                    const navLinksContainer = document.querySelector('.nav-links');
                    const mobileToggle = document.querySelector('.mobile-menu-toggle');
                    if (navLinksContainer && navLinksContainer.classList.contains('show')) {
                        mobileToggle.click();
                    }
                }
            }
        });
    });

    // Note: Smooth Scroll logic is moved to componentsLoaded to ensure all dynamic sections exist

    // 3. Mobile Hamburger Menu Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('show');
            mobileToggle.classList.toggle('active');
            const spans = mobileToggle.querySelectorAll('span');
            if(mobileToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 4. Stat Counter Animations
    const statValues = document.querySelectorAll('.stat-value');
    
    const animateValue = (obj, start, end, duration, formatStr) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const current = easeProgress * (end - start) + start;
            
            if (formatStr.includes('%')) {
                obj.innerHTML = current.toFixed(1) + '<span style="font-size: 0.6em">%</span>';
            } else if (formatStr.includes('ms')) {
                obj.innerHTML = current.toFixed(2) + '<span style="font-size: 0.6em">ms</span>';
            } else {
                obj.innerHTML = Math.floor(current);
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const finalStr = el.textContent || el.innerText;
                let finalNum = parseFloat(finalStr);
                if (!isNaN(finalNum)) {
                    animateValue(el, 0, finalNum, 2000, finalStr);
                }
                observer.unobserve(el);
            }
        });
    });

    statValues.forEach(stat => statsObserver.observe(stat));

    // 5. Scroll-triggered Animations for Elements
    const animatedElements = document.querySelectorAll('.glass-panel');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                elementObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    animatedElements.forEach(el => elementObserver.observe(el));

    // 6. CPU Load Reaction (Listening to Particles event)
    const efficiencyStat = document.querySelector('.stat-item:nth-child(1) .stat-value');
    const latencyStat = document.querySelector('.stat-item:nth-child(2) .stat-value');
    
    window.addEventListener('cpuLoadUpdate', (e) => {
        const load = e.detail.load;
        if(efficiencyStat && Math.random() > 0.7) { 
            const eff = 99.9 - (load * 2);
            efficiencyStat.innerHTML = eff.toFixed(1) + '<span style="font-size: 0.6em">%</span>';
        }
        if(latencyStat && Math.random() > 0.7) {
            const lat = 0.02 + (load * 0.15);
            latencyStat.innerHTML = lat.toFixed(2) + '<span style="font-size: 0.6em">ms</span>';
        }
    });

    // Hero Section Buttons (Navigation)
    document.getElementById('hero-run-sim')?.addEventListener('click', () => {
        document.getElementById('algorithms')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('hero-compare-algo')?.addEventListener('click', () => {
        document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('hero-ml-engine')?.addEventListener('click', () => {
        document.getElementById('ml-engine')?.scrollIntoView({ behavior: 'smooth' });
    });
});

window.addEventListener('componentsLoaded', () => {
    // Centralized Initialization to prevent race conditions
    if (typeof SystemTerminal !== 'undefined') window.terminal = new SystemTerminal();
    if (typeof GanttChart !== 'undefined') window.gantt = new GanttChart();
    if (typeof SimulationController !== 'undefined') window.simulation = new SimulationController();
    if (typeof ChartController !== 'undefined' && window.Chart) window.chartController = new ChartController();
    if (typeof NeuralMap !== 'undefined') window.neuralMap = new NeuralMap();

    // Setup active state tracking for dynamically loaded sections
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.3 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if(section.id) sectionObserver.observe(section);
    });

    // Initialize Button smooth scroll
    const initBtn = document.getElementById('btn-initialize');
    if (initBtn) {
        initBtn.addEventListener('click', () => {
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
