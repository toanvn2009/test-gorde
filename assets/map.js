"use-strict";
let map;
let marker;
let uluru;

class GoogleMap extends HTMLElement {
    constructor() {
        super();
        this.initGoogleMap();
    }

    loadGoogleMapsScript(apiKey) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initGoogleMap() {
        const apiKey = this.dataset.apiKey;
        const lat = this.dataset.lat;
        const lng = this.dataset.lng;
        try {
            await this.loadGoogleMapsScript(apiKey);
            uluru = { lat: Number(lat), lng: Number(lng) };
            map = new google.maps.Map(this.querySelector(".google-container"), {
                zoom: 15,
                center: uluru,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                scrollwheel: false
            });
            marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        } catch (error) {
            console.error('Failed to load Google Maps API:', error);
        }
    }
}

customElements.define("google-map", GoogleMap);
