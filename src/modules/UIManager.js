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
                </div>

                <p class="ocean-desc">
                    ${DOMPurify.sanitize(ocean.description)}
                </p>

                <div class="fact-box">
                    <h4>Expedition Notes</h4>
                    <ul class="fact-list">
                        ${funFactsList}
                    </ul>
                </div>
            </div>
        `;

        // Safe Injection
        this.panelContent.innerHTML = DOMPurify.sanitize(html, { ADD_TAGS: ['img'], ADD_ATTR: ['src', 'alt'] });

        if (this.panelScroll) this.panelScroll.scrollTo({ top: 0, behavior: 'instant' });
        if (this.panel) this.panel.classList.add('active');
    }
}
