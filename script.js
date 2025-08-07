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

var modal = document.getElementById('modal');
var modalBody = document.getElementById('modal-body');
var closeButton = document.getElementsByClassName('close-button')[0];
var originalCenter;
var originalZoom;

function closeModal() {
    modal.classList.add('hide-modal');
    modal.classList.remove('show-modal');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('hide-modal');
    }, 300); // Should match animation duration

    if (originalCenter && originalZoom) {
        map.flyTo(originalCenter, originalZoom);
    }
}

closeButton.onclick = function() {
    closeModal();
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

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

            marker.on('click', function (e) {
                originalCenter = map.getCenter();
                originalZoom = map.getZoom();

                map.flyTo([ocean.lat, ocean.lng], 4);

                var modalContent = `
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

                modalBody.innerHTML = modalContent;
                modal.style.display = 'block';
                modal.classList.add('show-modal');
            });
        });
    })
    .catch(error => console.error('Error fetching ocean data:', error));
