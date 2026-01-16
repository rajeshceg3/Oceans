// Initialize map
// Use Voyager for a clean, light look that contrasts well with the UI
var map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([20, 0], 2);

// Add attribution separately if needed, or stick to Leaflet's default in a cleaner way
L.control.attribution({
    position: 'bottomleft'
}).addTo(map);

// Loader logic
var loader = document.getElementById('loader');
window.addEventListener('load', function() {
    // Add a small delay for smoothness
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 800);
});

// Map Tiles
var cartoDBLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; OpenStreetMap &copy; CARTO',
	subdomains: 'abcd',
	maxZoom: 19
});
cartoDBLayer.addTo(map);

// Add Labels layer on top for better legibility if needed,
// or just use voyager (with labels). Let's stick to 'voyager' (labels included) or separate.
// Actually 'voyager_nolabels' + 'voyager_only_labels' is better for stacking, but let's keep it simple.
// The previous url was 'voyager_labels_under', which is good.
// Let's revert to that one as it looks nice.
cartoDBLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png');

// Custom Zoom Control
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// UI Elements
var panel = document.getElementById('info-panel');
var panelContent = document.getElementById('panel-content');
var closeButton = document.getElementById('close-panel');

// State
var activeMarker = null;

function closePanel() {
    panel.classList.remove('active');
    panel.classList.add('panel-hidden');

    // Reset map view if needed, or just leave it.
    // Usually nice to zoom out a bit if we were zoomed in very close,
    // but preserving state is also good UX.
    // Let's just deselect the marker visual state if we had one.

    setTimeout(() => {
        // Clear content after transition
        // panelContent.innerHTML = '';
    }, 600);
}

closeButton.addEventListener('click', closePanel);

// Handle map clicks to close panel
map.on('click', function(e) {
    // Check if click target is NOT a marker
    if (!e.originalEvent.target.classList.contains('ocean-dot') &&
        !e.originalEvent.target.classList.contains('ocean-pulse')) {
        closePanel();
    }
});

function openOceanDetails(ocean) {
    // Generate HTML
    var html = `
        <div class="ocean-details">
            <h2>${ocean.name}</h2>
            <div class="ocean-image-container">
                <img src="${ocean.image_url}" alt="${ocean.name}" class="ocean-image">
            </div>
            <div class="ocean-description">
                ${ocean.description}
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Depth</span>
                <span>${ocean.depth}</span>
            </div>
            <div class="fun-facts">
                <h4>Did You Know?</h4>
                <ul>
                    ${ocean.fun_facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    panelContent.innerHTML = html;
    panel.classList.remove('panel-hidden');
    panel.classList.add('active');
}

// Fetch Data
fetch('oceans.json')
    .then(response => response.json())
    .then(data => {
        data.oceans.forEach(ocean => {
            // Create custom icon
            var icon = L.divIcon({
                className: 'ocean-marker-wrap',
                html: '<div class="ocean-pulse"></div><div class="ocean-dot"></div>',
                iconSize: [40, 40], // Size of the pulse container
                iconAnchor: [20, 20] // Center
            });

            var marker = L.marker([ocean.lat, ocean.lng], { icon: icon }).addTo(map);

            marker.on('click', function (e) {
                // Fly to location
                // Offset for desktop panel:
                // If width > 768, panel is on right (400px).
                // We want the point to be centered in the remaining space (calc(100vw - 400px)).
                // So center target is (windowWidth - 400)/2 from left.
                // Current center is windowWidth/2.
                // We need to shift target by -200px (move right) => Map moves left.

                var targetLat = ocean.lat;
                var targetLng = ocean.lng;
                var zoomLevel = 4;

                // Simple flyTo
                map.flyTo([targetLat, targetLng], zoomLevel, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });

                // Open Panel
                openOceanDetails(ocean);
            });
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
