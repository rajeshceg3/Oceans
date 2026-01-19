// Initialize map with premium settings
// Dark Matter tiles for a sophisticated, deep-ocean aesthetic
var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: true,
    zoomSnap: 0.05, // Ultra-smooth zooming
    wheelDebounceTime: 150,
    wheelPxPerZoomLevel: 120 // refined scroll feel
}).setView([20, 0], 2.5);

L.control.attribution({
    position: 'bottomleft'
}).addTo(map);

// Loader Animation Logic
var loader = document.getElementById('loader');
window.addEventListener('load', function() {
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    }, 1200);
});

// Map Tiles - Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; OpenStreetMap &copy; CARTO',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

// Custom Zoom Control (bottom-right)
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// UI References
var panel = document.getElementById('info-panel');
var panelContent = document.getElementById('panel-content');
var closeButton = document.getElementById('close-panel');
var oceanList = document.getElementById('ocean-list');
var panelScroll = document.getElementById('panel-scroll-container');

// Configuration
const CONFIG = {
    desktopPanelWidth: 520,
    mobileSheetHeightRatio: 0.5, // Approx 50% of screen effective for centering
    zoomLevel: 4.2
};

// --- Core Interactions ---

function closePanel() {
    panel.classList.remove('active');

    // Deactivate nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Reset map view slightly for context
    map.flyTo([20, 0], 2.5, {
        duration: 1.8,
        easeLinearity: 0.2
    });
}

closeButton.addEventListener('click', closePanel);

// Handle mobile pull-tab (Swipe Down to Close)
const handle = document.querySelector('.panel-handle');
let startY = 0;

handle.addEventListener('click', function() {
    closePanel();
});

handle.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
}, { passive: true });

handle.addEventListener('touchend', function(e) {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;

    // Detect swipe down (positive diff)
    if (diff > 50) {
        closePanel();
    }
}, { passive: true });

map.on('click', function(e) {
    // Close panel when clicking empty map space
    closePanel();
});

function openOceanDetails(ocean) {
    // Generate Hero Layout with polished typography and layout
    var html = `
        <div class="ocean-hero">
            <img src="${ocean.image_url}" alt="${ocean.name}">
        </div>
        <div class="panel-body">
            <h2 class="ocean-title">${ocean.name}</h2>

            <div class="stats-row">
                <div class="stat-box">
                    <span class="stat-label">Max Depth</span>
                    <span class="stat-value">${ocean.depth.split(' ')[0]}</span>
                    <span class="stat-label" style="opacity:0.7; margin-top:4px; font-size:0.65rem;">${ocean.depth.split(' ').slice(1).join(' ')}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Area</span>
                    <span class="stat-value">${ocean.area}</span>
                    <span class="stat-label" style="opacity:0.7; margin-top:4px; font-size:0.65rem;">Million km²</span>
                </div>
            </div>

            <p class="ocean-desc">
                ${ocean.description}
            </p>

            <div class="fact-box">
                <h4>Expedition Notes</h4>
                <ul class="fact-list">
                    ${ocean.fun_facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    panelContent.innerHTML = html;

    // Reset scroll position with smooth behavior
    panelScroll.scrollTo({ top: 0, behavior: 'instant' });

    // Activate Panel
    panel.classList.add('active');
}

/**
 * Calculates the center point offset based on active UI elements (Panel/Sheet)
 * to ensure the marker remains perfectly visible.
 */
function flyToOcean(lat, lng) {
    var targetLat = lat;
    var targetLng = lng;

    var zoom = CONFIG.zoomLevel;

    // Determine Offset
    if (window.innerWidth > 768) {
        // Desktop: Offset center to the left (content is on the right)
        // We want the target to be centered in the remaining space: (Screen - Panel) / 2
        // So the offset from true center is PanelWidth / 2

        var offsetPixels = CONFIG.desktopPanelWidth / 2;

        // Project current lat/lng to pixels at target zoom
        var point = map.project([lat, lng], zoom);

        // Add offset to x (shifting map center right, puts point left)
        var targetPoint = point.add([offsetPixels, 0]);

        // Unproject back to coordinates
        var targetCoords = map.unproject(targetPoint, zoom);
        targetLat = targetCoords.lat;
        targetLng = targetCoords.lng;

    } else {
        // Mobile: Offset center down (content is at bottom)
        // We want point in top portion.
        // Let's shift map center "down" (y + offset) so point moves "up"

        var offsetPixelsY = window.innerHeight * 0.30; // Shift up by 30% of screen

        var point = map.project([lat, lng], zoom);
        var targetPoint = point.subtract([0, -offsetPixelsY]); // Subtract negative = add

        var targetCoords = map.unproject(targetPoint, zoom);
        targetLat = targetCoords.lat;
        targetLng = targetCoords.lng;
    }

    map.flyTo([targetLat, targetLng], zoom, {
        duration: 2.5,
        easeLinearity: 0.1 // More ease-in-out
    });
}

// Fetch and Initialize Data
fetch('oceans.json')
    .then(response => response.json())
    .then(data => {
        data.oceans.forEach((ocean, index) => {
            // Create Custom Marker Icon
            var icon = L.divIcon({
                className: 'ocean-marker-wrap',
                html: `<div class="ocean-pulse"></div><div class="ocean-dot"></div>`,
                iconSize: [80, 80], // Increased to avoid clipping pulse
                iconAnchor: [40, 40],
                tooltipAnchor: [0, -20]
            });

            var marker = L.marker([ocean.lat, ocean.lng], { icon: icon }).addTo(map);

            // Add Tooltip (Desktop Hover)
            marker.bindTooltip(ocean.name, {
                direction: 'top',
                offset: [0, -40], // Adjusted for larger icon
                className: 'ocean-tooltip',
                opacity: 1
            });

            // Click Handler
            const handleClick = (e) => {
                if(e) L.DomEvent.stopPropagation(e);

                flyToOcean(ocean.lat, ocean.lng);
                openOceanDetails(ocean);

                // Update Nav State
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                const navItem = document.getElementById(`nav-${index}`);
                if (navItem) {
                    navItem.classList.add('active');
                    // Scroll nav into view if needed (mobile)
                    navItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            };

            marker.on('click', handleClick);

            // Create Nav Item
            var li = document.createElement('li');
            var displayIndex = (index + 1).toString().padStart(2, '0');

            li.innerHTML = `<button class="nav-item" id="nav-${index}" aria-label="Explore ${ocean.name}">
                                <span class="nav-number">${displayIndex}</span>
                                <span class="nav-name">${ocean.name}</span>
                            </button>`;

            li.querySelector('button').addEventListener('click', (e) => {
                handleClick();
            });

            oceanList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
