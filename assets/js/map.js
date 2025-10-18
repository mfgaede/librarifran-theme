document.addEventListener('DOMContentLoaded', function () {
  const mapEl = document.getElementById('places-map');
  if (!mapEl) return;

  // Friendly error overlay helper
  function showError(message, retryFn) {
    // remove existing
    const existing = mapEl.querySelector('.map-error');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'map-error';
    overlay.innerHTML = `<div><p>${message}</p>${retryFn ? '<button type="button">Retry</button>' : ''}</div>`;
    mapEl.style.position = mapEl.style.position || 'relative';
    mapEl.appendChild(overlay);
    if (retryFn) {
      overlay.querySelector('button').addEventListener('click', () => {
        overlay.remove();
        retryFn();
      });
    }
  }

  // Colors including new bucket type (teal)
  const colors = {
    lived: '#ff6105',
    visited: '#ffc905',
    bucket: '#0db7b3' // teal to coordinate with orange/mustard
  };

  // Create a DivIcon that renders an inline SVG circle so the icon scales crisply
  function createSvgIcon(color) {
    const size = 20;
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="7" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
    const html = `<div class="custom-marker">${svg}</div>`;
    return L.divIcon({ className: 'custom-marker-icon', html, iconSize: [size, size], iconAnchor: [size/2, size/2] });
  }

  // Initialize when scrolled into view
  let initialized = false;
  const dataUrl = mapEl.getAttribute('data-places-url') || '/assets/data/places.json';

  function initMap() {
    if (initialized) return;
    initialized = true;

    // Dynamically load Leaflet if necessary
    function loadLeaflet(callback) {
      if (typeof L !== 'undefined') return callback();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => callback();
      script.onerror = () => {
        showError('Failed to load map library. Check your connection.');
      };
      document.head.appendChild(script);
      // CSS is already included in the page head
    }

    loadLeaflet(() => {
      if (typeof L === 'undefined') return;
      try {
        // Start more zoomed-in over the continental United States
        const map = L.map('places-map', { scrollWheelZoom: false }).setView([39.8283, -98.5795], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Load data and add markers
        fetch(dataUrl).then(resp => {
          if (!resp.ok) throw new Error('Failed to load places data');
          return resp.json();
        }).then(data => {
          const group = L.featureGroup();
          data.forEach(place => {
            const color = colors[place.type] || '#777';
            const icon = createSvgIcon(color);
            const marker = L.marker([place.lat, place.lng], { icon });
            // Popup: name and optional year (centered, medium grey)
            const yearHtml = place.year ? `<div class="map-popup-year">${place.year}</div>` : '';
            marker.bindPopup(`<div class="map-popup"><strong>${place.name}</strong>${yearHtml}</div>`);
            marker.addTo(group);
          });
          group.addTo(map);
          if (group.getLayers().length) {
            // fitBounds but don't zoom out past 4 or in past 8
            map.fitBounds(group.getBounds().pad(0.2));
            const currentZoom = map.getZoom();
            if (currentZoom < 4) map.setZoom(4);
            if (currentZoom > 8) map.setZoom(8);
          }
        }).catch(err => {
          console.error('Map data error', err);
          showError('Failed to load map data. Try again?', initMap);
        });
      } catch (err) {
        console.error('Map init error', err);
        showError('Map failed to initialize.');
      }
    });
  }

  // Lazy-load when scrolled into view
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          initMap();
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(mapEl);
  } else {
    // fallback: init immediately
    initMap();
  }
});
