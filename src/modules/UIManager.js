import DOMPurify from 'dompurify';

export class UIManager {
    constructor() {
        this.panel = document.getElementById('info-panel');
        this.panelContent = document.getElementById('panel-content');
        this.closeButton = document.getElementById('close-panel');
        this.oceanList = document.getElementById('ocean-list');
        this.panelScroll = document.getElementById('panel-scroll-container');
        this.loader = document.getElementById('loader');
        this.handle = document.querySelector('.panel-handle');

        this.config = {
            desktopPanelWidth: 520,
            zoomLevel: 4.2
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closePanel());
        }

        // Mobile swipe handle
        let startY = 0;
        if (this.handle) {
            this.handle.addEventListener('click', () => this.closePanel());
            this.handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });

            this.handle.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                if (endY - startY > 50) this.closePanel();
            }, { passive: true });
        }

        // Listen for global map click to close panel
        document.addEventListener('map:clicked', () => this.closePanel());
    }

    hideLoader() {
        if (this.loader) {
            this.loader.style.opacity = '0';
            setTimeout(() => {
                this.loader.style.display = 'none';
            }, 1000);
        }
    }

    closePanel() {
        if (this.panel) this.panel.classList.remove('active');
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.dispatchEvent(new CustomEvent('panel:closed'));
    }

    renderNav(oceans, onOceanSelect) {
        if (!this.oceanList) return;
        this.oceanList.innerHTML = ''; // clear

        oceans.forEach((ocean, index) => {
            const li = document.createElement('li');
            const displayIndex = (index + 1).toString().padStart(2, '0');

            // XSS Prevention: Use textContent where possible or sanitize if innerHTML is needed
            // Here we construct a safe string
            const safeName = DOMPurify.sanitize(ocean.name);

            li.innerHTML = `<button class="nav-item" id="nav-${index}" aria-label="Explore ${safeName}">
                                <span class="nav-number">${displayIndex}</span>
                                <span class="nav-name">${safeName}</span>
                            </button>`;

            li.querySelector('button').addEventListener('click', () => onOceanSelect(index));
            this.oceanList.appendChild(li);
        });
    }

    highlightNav(index) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = document.getElementById(`nav-${index}`);
        if (navItem) {
            navItem.classList.add('active');
            navItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    openOceanDetails(ocean) {
        const funFactsList = ocean.fun_facts.map(fact => `<li>${DOMPurify.sanitize(fact)}</li>`).join('');

        // New Content Processing
        const marineLifeTags = (ocean.marine_life || []).map(life =>
            `<span class="life-tag">${DOMPurify.sanitize(life)}</span>`
        ).join('');

        const tempValue = ocean.avg_temp ? DOMPurify.sanitize(ocean.avg_temp) : 'N/A';
        const climateText = ocean.climate_impact ? DOMPurify.sanitize(ocean.climate_impact) : '';

        // Sanitize all inputs
        const html = `
            <div class="ocean-hero">
                <img src="${DOMPurify.sanitize(ocean.image_url)}" alt="${DOMPurify.sanitize(ocean.name)}">
            </div>
            <div class="panel-body">
                <h2 class="ocean-title">${DOMPurify.sanitize(ocean.name)}</h2>

                <div class="stats-row">
                    <div class="stat-box">
                        <span class="stat-label">Max Depth</span>
                        <span class="stat-value">${DOMPurify.sanitize(ocean.depth.split(' ')[0])}</span>
                        <span class="stat-label" style="opacity:0.7; margin-top:4px; font-size:0.65rem;">${DOMPurify.sanitize(ocean.depth.split(' ').slice(1).join(' '))}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Area</span>
                        <span class="stat-value">${DOMPurify.sanitize(ocean.area)}</span>
                        <span class="stat-label" style="opacity:0.7; margin-top:4px; font-size:0.65rem;">Million km²</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Avg Temp</span>
                        <span class="stat-value" style="font-size: 1.5rem;">${tempValue.split(' ')[0]}</span>
                        <span class="stat-label" style="opacity:0.7; margin-top:4px; font-size:0.65rem;">${tempValue.substring(tempValue.indexOf(' ') + 1)}</span>
                    </div>
                </div>

                <div class="marine-life-section" style="margin-bottom: 32px;">
                    <h4 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-accent); margin-bottom: 16px;">Marine Life</h4>
                    <div class="marine-life-tags">
                        ${marineLifeTags}
                    </div>
                </div>

                <p class="ocean-desc">
                    ${DOMPurify.sanitize(ocean.description)}
                </p>

                ${climateText ? `
                <div class="climate-section">
                    <div class="climate-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </div>
                    <div class="climate-content">
                        <h4>Climate Pulse</h4>
                        <p>${climateText}</p>
                    </div>
                </div>
                ` : ''}

                <div class="fact-box">
                    <h4>Expedition Notes</h4>
                    <ul class="fact-list">
                        ${funFactsList}
                    </ul>
                </div>

                <button id="log-discovery-btn" class="log-btn">
                    <span>Log Discovery</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </button>
            </div>
        `;

        // Safe Injection
        this.panelContent.innerHTML = DOMPurify.sanitize(html, { ADD_TAGS: ['img', 'svg', 'path', 'polyline', 'line', 'circle'], ADD_ATTR: ['src', 'alt', 'viewBox', 'd', 'points', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'style'] });

        // Add Listener
        const logBtn = document.getElementById('log-discovery-btn');
        if (logBtn) {
            logBtn.addEventListener('click', () => {
                this.showToast('Discovery logged to expedition journal.');
                logBtn.classList.add('logged');
                logBtn.innerHTML = `<span>Logged</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            });
        }

        if (this.panelScroll) this.panelScroll.scrollTo({ top: 0, behavior: 'instant' });
        if (this.panel) this.panel.classList.add('active');
    }

    setupTourControls(onPrev, onNext, onExit) {
        const prevBtn = document.getElementById('tour-prev');
        const nextBtn = document.getElementById('tour-next');
        const exitBtn = document.getElementById('tour-exit');

        if (prevBtn) prevBtn.addEventListener('click', onPrev);
        if (nextBtn) nextBtn.addEventListener('click', onNext);
        if (exitBtn) exitBtn.addEventListener('click', onExit);
    }

    setTourMode(isActive) {
        const controls = document.getElementById('tour-controls');

        if (isActive) {
            document.body.classList.add('tour-active');
            if (controls) controls.classList.remove('hidden');
        } else {
            document.body.classList.remove('tour-active');
            if (controls) controls.classList.add('hidden');
        }
    }

    showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
