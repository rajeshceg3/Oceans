import './styles/main.css';
import './pwa.js'; // Register PWA
import { fetchOceanData } from './modules/DataManager.js';
import { MapController } from './modules/MapController.js';
import { UIManager } from './modules/UIManager.js';

// Application State
const state = {
    oceans: [],
    activeIndex: -1
};

// Initialize Modules
const mapController = new MapController('map');
const uiManager = new UIManager();

async function initApp() {
    try {
        // Initialize Map
        mapController.init();

        // Fetch Data
        const data = await fetchOceanData();
        state.oceans = data.oceans;

        // Initialize UI with Data
        uiManager.renderNav(state.oceans, (index) => handleOceanSelect(index));

        // Add Markers to Map
        state.oceans.forEach((ocean, index) => {
            const markerHtml = `<div class="ocean-pulse"></div><div class="ocean-dot"></div>`;

            const marker = mapController.addMarker(ocean.lat, ocean.lng, markerHtml, () => {
                handleOceanSelect(index);
            });

            // Add tooltip
            marker.bindTooltip(ocean.name, {
                direction: 'top',
                offset: [0, -40],
                className: 'ocean-tooltip',
                opacity: 1
            });
        });

        // Hide Loader
        // Use a slight delay to ensure map tiles are ready-ish
        setTimeout(() => uiManager.hideLoader(), 800);

        // Listen for panel closed event to reset map
        document.addEventListener('panel:closed', () => {
            mapController.resetView();
            state.activeIndex = -1;
        });

    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Critical Mission Failure: Initialization', error);
        // Fallback or Toast here
    }
}

function handleOceanSelect(index) {
    if (index < 0 || index >= state.oceans.length) return;

    state.activeIndex = index;
    const ocean = state.oceans[index];

    // 1. Move Map
    mapController.flyTo(ocean.lat, ocean.lng, uiManager.config.zoomLevel, {
        desktopPanelWidth: uiManager.config.desktopPanelWidth
    });

    // 2. Open Panel
    uiManager.openOceanDetails(ocean);

    // 3. Update Nav
    uiManager.highlightNav(index);
}

// Start Mission
initApp();
