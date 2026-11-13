import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import warmMapStyle from '../vendor/warm-map/style.json';

// Fix Leaflet's default icon path issues with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export class MapController {
    constructor(mapId) {
        this.mapId = mapId;
        this.map = null;
        this.config = {
            zoomControl: false,
            attributionControl: false,
            worldCopyJump: true,
            zoomSnap: 0.05,
            wheelDebounceTime: 150,
            wheelPxPerZoomLevel: 120,
            defaultView: [20, 0],
            defaultZoom: 2.5
        };
    }

    init() {
        if (!document.getElementById(this.mapId)) return;

        this.map = L.map(this.mapId, this.config).setView(this.config.defaultView, this.config.defaultZoom);

        // Warm-paper basemap (worlds shared module): OpenFreeMap vector tiles
        // via the MapLibre GL Leaflet bridge. Free public instance, no API key.
        L.maplibreGL({
            style: warmMapStyle,
            attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);

        L.control.attribution({ position: 'bottomleft' }).addTo(this.map);
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        this.map.on('click', () => {
             document.dispatchEvent(new CustomEvent('map:clicked'));
        });
    }

    addMarker(lat, lng, htmlIcon, onClick) {
        const icon = L.divIcon({
            className: 'ocean-marker-wrap',
            html: htmlIcon,
            iconSize: [80, 80],
            iconAnchor: [40, 40],
            tooltipAnchor: [0, -20]
        });

        const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onClick();
        });

        return marker;
    }

    flyTo(lat, lng, zoomLevel, offsetConfig) {
        let targetLat = lat;
        let targetLng = lng;

        if (window.innerWidth > 768) {
            // Desktop offset
            const offsetPixels = offsetConfig.desktopPanelWidth / 2;
            const point = this.map.project([lat, lng], zoomLevel);
            const targetPoint = point.add([offsetPixels, 0]);
            const targetCoords = this.map.unproject(targetPoint, zoomLevel);
            targetLat = targetCoords.lat;
            targetLng = targetCoords.lng;
        } else {
            // Mobile offset
            const offsetPixelsY = window.innerHeight * 0.30;
            const point = this.map.project([lat, lng], zoomLevel);
            const targetPoint = point.subtract([0, -offsetPixelsY]);
            const targetCoords = this.map.unproject(targetPoint, zoomLevel);
            targetLat = targetCoords.lat;
            targetLng = targetCoords.lng;
        }

        this.map.flyTo([targetLat, targetLng], zoomLevel, {
            duration: 2.5,
            easeLinearity: 0.1
        });
    }

    resetView() {
        this.map.flyTo(this.config.defaultView, this.config.defaultZoom, {
            duration: 1.8,
            easeLinearity: 0.2
        });
    }
}
