var map = L.map('map').setView([0, 0], 2);

var stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 16,
    ext: 'jpg'
});

stamenLayer.on('tileerror', function(error, tile) {
    // Fallback to a different tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});

stamenLayer.addTo(map);

fetch('oceans.json')
    .then(response => response.json())
    .then(data => {
        data.oceans.forEach(ocean => {
            var marker = L.marker([ocean.lat, ocean.lng]).addTo(map);
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
