// Initialize map
// Use Dark Matter for a premium, slick look
var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: true,
    zoomSnap: 0.5 // Smoother zooming
}).setView([20, 0], 2.5);

L.control.attribution({
    position: 'bottomleft'
}).addTo(map);

// Loader logic
var loader = document.getElementById('loader');
window.addEventListener('load', function() {
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 800);
    }, 1500); // Slightly longer for dramatic effect
});

// Map Tiles - Dark Matter
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; OpenStreetMap &copy; CARTO',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

// Custom Zoom Control
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// UI Elements
var panel = document.getElementById('info-panel');
var panelContent = document.getElementById('panel-content');
var closeButton = document.getElementById('close-panel');
var oceanList = document.getElementById('ocean-list');

// State
var activeMarker = null;

function closePanel() {
    panel.classList.remove('active');
    // Deselect all nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Zoom out slightly if needed
    map.flyTo([20, 0], 2.5, { duration: 1.5 });
}

closeButton.addEventListener('click', closePanel);

map.on('click', function(e) {
    // If clicking map (not marker), close panel
    // The event target check in original code was slightly buggy with divIcons,
    // relying on the fact that map click fires if marker click doesn't stop propagation.
    // We will handle close in the map click, but ensure marker click stops propagation.
    closePanel();
});

function openOceanDetails(ocean) {
    // Generate Hero Layout
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
                    <span class="stat-label" style="margin-top:4px; opacity:0.6;">${ocean.depth.split(' ').slice(1).join(' ')}</span>
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

    // Reset scroll
    document.getElementById('panel-scroll-container').scrollTop = 0;

    panel.classList.add('active');
}

function flyToOcean(lat, lng) {
    // Offset center slightly to account for panel on desktop
    var targetLat = lat;
    var targetLng = lng;

    // Check if mobile
    if (window.innerWidth > 768) {
        // Shift map center to the left so the point is visible when panel is open on right
        // This is a rough approximation, can be improved with projection math
        targetLng = lng - 20;
    } else {
        // Shift map center up so point is visible above bottom sheet
        targetLat = lat - 10;
    }

    map.flyTo([targetLat, targetLng], 4, {
        duration: 2.0,
        easeLinearity: 0.2
    });
}

// Fetch Data
fetch('oceans.json')
    .then(response => response.json())
    .then(data => {
        data.oceans.forEach((ocean, index) => {
            // Add Marker
            var icon = L.divIcon({
                className: 'ocean-marker-wrap',
                html: `<div class="ocean-pulse"></div><div class="ocean-dot"></div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            var marker = L.marker([ocean.lat, ocean.lng], { icon: icon }).addTo(map);

            // Click Handler
            const handleClick = (e) => {
                if(e) L.DomEvent.stopPropagation(e); // Prevent map click

                flyToOcean(ocean.lat, ocean.lng);
                openOceanDetails(ocean);

                // Update Nav State
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                const navItem = document.getElementById(`nav-${index}`);
                if (navItem) navItem.classList.add('active');
            };

            marker.on('click', handleClick);

            // Add to Nav
            var li = document.createElement('li');
            // Format index for display (01, 02...)
            var displayIndex = (index + 1).toString().padStart(2, '0');

            li.innerHTML = `<button class="nav-item" id="nav-${index}">
                                <span class="nav-number">${displayIndex}</span>
                                <span class="nav-name">${ocean.name}</span>
                            </button>`;

            // Note: We need to bind the click properly
            li.querySelector('button').addEventListener('click', (e) => {
                // Prevent bubbling if needed, though button is inside li
                handleClick();
            });

            oceanList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
