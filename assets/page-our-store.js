var map;

var BlsCreateMapStoreLocation = (function () {
    return {
        init: function () {
            mapboxgl.accessToken = 'pk.eyJ1Ijoia2hpZW1waGFtIiwiYSI6ImNsam01eHhnaTAyNmczZmxzcnQ1MTVqN3gifQ.WVqIQlSk52FSN8W7G5gsnw';
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/light-v11',
                center: [-77.04, 38.907],
                zoom: 12,
                pitch: 60,
                bearing: 0
            });
            const stores = document.querySelectorAll('.store-infor__items');
            const storeArray = Array.from(stores).map((element) => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: "Point",
                        coordinates: [this.isNumeric(element.dataset?.lng) ? Number(element.dataset?.lng) : 0, this.isNumeric(element.dataset?.lat) ? Number(element.dataset?.lat) : 0]
                    },
                    properties: {
                        phone: element.dataset.phone,
                        address: element.dataset.address,
                        name: element.dataset.name,
                        email: element.dataset.email,
                        link: element.dataset.link,
                        text: element.dataset.textLink,
                        store: element.dataset.storeNumber
                    }
                }
            })
            const listStore = {
                type: 'FeatureCollection',
                features: storeArray
            }
            listStore.features.forEach((store, index) => {
                store.properties.id = `store_${index}`;
            })
            map.on('load', () => {
                map.addSource('places', {
                    type: 'geojson',
                    data: listStore
                });
            });
            this.addMarker(listStore)
            this.storeInforAction(listStore)
        },
        isNumeric(str) {
            if (typeof str != "string") return false;
            return !isNaN(str) && !isNaN(parseFloat(str));
        },
        addMarker: function (listStore) {
            listStore.features.forEach((store,index) => {
                const marker = document.createElement('div');
                const numberMarker = document.createTextNode(index+1);
                marker.appendChild(numberMarker);
                marker.id = `marker-${store.properties.id}`;
                marker.addEventListener('click', e => {
                    this.createPopupMarker(store);
                    this.zoomMarker(store)
                })
                marker.classList.add('marker');
                new mapboxgl.Marker(marker, { offset: [0, -23] })
                    .setLngLat(store.geometry.coordinates)
                    .addTo(map);
            })
        },
        createPopupMarker: function (listStore) {
            const closePopup = document.getElementsByClassName('mapboxgl-popup');
            if (closePopup[0]) closePopup[0].remove();
            const { address, phone, name, email, link, text, store } = listStore.properties;
            const popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(listStore.geometry.coordinates)
                .setHTML(`<div class="store-popup-header d-flex gap-10 space-between align-center mb-40"><span class="store-number btn-text-transform">${store}</span>${link ? `<a href="${link}" target="_blank" aria-label="store link" class="store-popup-link outline-style remove-underline btn-text-transform fs-small">${text}</a>` : ''}</div><h3 class="store-popup-name mb-20 mt-0">${name}</h3><div class="class="store-popup-info">${address}<br>${phone}</div>${email ? `<a href="mailto:${email}" aria-label="store mail" class="store-popup-email">${email}</a>` : ''}`)
                .addTo(map)
        },
        zoomMarker: function (listStore) {
            map.flyTo({
                center: listStore.geometry.coordinates,
                zoom: 15,
            })
        },
        storeInforAction: function (listStore) {
            const listStoresInfor = document.querySelectorAll('.store-infor__items .store-infor__name');
            listStoresInfor.forEach(items => {
                items.addEventListener("click", e => {
                    e.preventDefault();
                    const target = e.currentTarget;
                    if (!target.closest('.store-infor__items').classList.contains('store-active')) {
                        document.querySelectorAll('.store-infor__items').forEach(item => {
                            item.classList.remove('store-active')
                        })
                        target.closest('.store-infor__items').classList.add('store-active')
                    }else{
                        target.closest('.store-infor__items').classList.remove('store-active')
                        
                    }
                    const lng = target.closest('.store-infor__items').dataset.lng;
                    const lat = target.closest('.store-infor__items').dataset.lat;
                    if (this.isNumeric(lng) && this.isNumeric(lat)) {
                        const currentFeature = listStore.features.find(feature => target.id === `infor-${feature.properties.id}`);
                        this.createPopupMarker(currentFeature);
                        this.zoomMarker(currentFeature)
                    }
                })
            })
        }
    }
})();
BlsCreateMapStoreLocation.init();

document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target) {
      const ourstore = target.querySelector(".bls__location-page");
      if (ourstore) {
        BlsCreateMapStoreLocation.init();
      };
    }
  });