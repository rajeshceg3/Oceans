var map = L.map('map', {
    zoomControl: false
}).setView([0, 0], 2);

var loader = document.getElementById('loader');
map.on('load', function() {
    loader.style.display = 'none';
});

var cartoDBLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

cartoDBLayer.addTo(map);

L.control.zoom({
    position: 'topright'
}).addTo(map);

fetch('oceans.json')
    .then(response => {
        console.log('Response from fetch:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Data from oceans.json:', data);
        loader.style.display = 'none';
        data.oceans.forEach(ocean => {
            var icon = L.divIcon({
                className: 'ocean-marker',
                iconSize: [12, 12]
            });
            var marker = L.marker([ocean.lat, ocean.lng], { icon: icon }).addTo(map);

            var popupContent = `
                <div class="ocean-popup">
                    <h2>${ocean.name}</h2>
                    <img src="${ocean.image_url}" alt="${ocean.name}" class="popup-image">
                    <p>${ocean.description}</p>
                    <h4>Fun Facts:</h4>
                    <ul>
                        ${ocean.fun_facts.map(fact => `<li>${fact}</li>`).join('')}
                    </ul>
                    <p><strong>Max Depth:</strong> ${ocean.depth}</p>
                </div>
            `;
            marker.bindPopup(popupContent);

            marker.on('click', function (e) {
                map.flyTo([ocean.lat, ocean.lng], 4);
            });
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
