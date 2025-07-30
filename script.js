var map = L.map('map', {
    zoomControl: false
}).setView([0, 0], 2);

var loader = document.getElementById('loader');
map.on('load', function() {
    loader.style.display = 'none';
});

var cartoDBLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

cartoDBLayer.addTo(map);

fetch('oceans.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        loader.style.display = 'none';
        data.oceans.forEach(ocean => {
            var icon = L.divIcon({
                className: 'ocean-marker',
                iconSize: [12, 12]
            });
            var marker = L.marker([ocean.lat, ocean.lng], { icon: icon }).addTo(map);
            marker.bindPopup("<b>" + ocean.name + "</b>");

            marker.on('mouseover', function (e) {
                this.openPopup();
            });
            marker.on('mouseout', function (e) {
                this.closePopup();
            });
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
