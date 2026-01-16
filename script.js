// Initialize map
// Use Dark Matter for a premium, slick look
var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: true
}).setView([20, 0], 2);

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
        }, 500);
    }, 800);
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
    panel.classList.add('panel-hidden');

    // Remove active class from list items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

closeButton.addEventListener('click', closePanel);

map.on('click', function(e) {
    if (!e.originalEvent.target.classList.contains('ocean-dot') &&
        !e.originalEvent.target.classList.contains('ocean-pulse')) {
        closePanel();
    }
});

function openOceanDetails(ocean) {
    var html = `
        <div class="ocean-details">
            <h2>${ocean.name}</h2>
            <div class="ocean-image-container">
                <img src="${ocean.image_url}" alt="${ocean.name}" class="ocean-image">
                <div class="image-overlay"></div>
            </div>
            <div class="ocean-description">
                ${ocean.description}
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Max Depth</span>
                    <span class="stat-value">${ocean.depth}</span>
                </div>
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

function flyToOcean(lat, lng) {
    var targetLat = lat;
    var targetLng = lng;

    map.flyTo([targetLat, targetLng], 3.5, {
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
            const handleClick = () => {
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
            li.innerHTML = `<button class="nav-item" id="nav-${index}">
                                <span class="nav-number">0${index + 1}</span>
                                <span class="nav-name">${ocean.name}</span>
                            </button>`;
            li.addEventListener('click', handleClick);
            oceanList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
