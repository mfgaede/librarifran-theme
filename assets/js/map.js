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

  // Colors
  const colors = {
    lived: '#ff6105',
    visited: '#ffc905'
  };

  // Create a DivIcon with Font Awesome icons (house for lived, plane for visited)
  function createSvgIcon(color, type) {
    const size = 16;
    let iconClass = 'fa-solid fa-circle'; // default fallback

    if (type === 'lived') {
      iconClass = 'fa-solid fa-house';
    } else if (type === 'visited') {
      iconClass = 'fa-solid fa-plane';
    }

    const html = `<i class="${iconClass}" style="color: ${color}; font-size: ${size}px;"></i>`;
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

    // Load Leaflet.markercluster plugin
    function loadMarkerCluster(callback) {
      if (typeof L !== 'undefined' && L.markerClusterGroup) return callback();

      // Add CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(css);

      const cssDefault = document.createElement('link');
      cssDefault.rel = 'stylesheet';
      cssDefault.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
      document.head.appendChild(cssDefault);

      // Add JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
      script.onload = () => callback();
      script.onerror = () => {
        showError('Failed to load clustering library.');
      };
      document.head.appendChild(script);
    }

    loadLeaflet(() => {
      if (typeof L === 'undefined') return;
      loadMarkerCluster(() => {
        if (typeof L === 'undefined' || !L.markerClusterGroup) return;
        try {
          // Start more zoomed-in over the continental United States
          const map = L.map('places-map', { scrollWheelZoom: false }).setView([39.8283, -98.5795], 4);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }).addTo(map);

          // Load data and add markers with clustering
          fetch(dataUrl).then(resp => {
            if (!resp.ok) throw new Error('Failed to load places data');
            return resp.json();
          }).then(data => {
            // Store markers by type for filtering
            const markersByType = {
              lived: [],
              visited: []
            };

            // Active filters (all enabled by default)
            const activeFilters = new Set(['lived', 'visited']);

            // Create cluster groups for each type
            const clusterGroups = {
              lived: L.markerClusterGroup({
                iconCreateFunction: function(cluster) {
                  return L.divIcon({
                    html: `<div style="background-color: ${colors.lived}; border-color: ${colors.visited}"><span>${cluster.getChildCount()}</span></div>`,
                    className: 'marker-cluster marker-cluster-lived',
                    iconSize: L.point(40, 40)
                  });
                }
              }),
              visited: L.markerClusterGroup({
                iconCreateFunction: function(cluster) {
                  return L.divIcon({
                    html: `<div style="background-color: ${colors.visited}; border-color: ${colors.lived}; color: #333"><span>${cluster.getChildCount()}</span></div>`,
                    className: 'marker-cluster marker-cluster-visited',
                    iconSize: L.point(40, 40)
                  });
                }
              })
            };

            // Add all cluster groups to map
            Object.values(clusterGroups).forEach(group => group.addTo(map));

            // Create markers and add to appropriate cluster group
            data.forEach(place => {
              const color = colors[place.type] || '#777';
              const icon = createSvgIcon(color, place.type);
              const marker = L.marker([place.lat, place.lng], { icon });
              // Popup: name and optional year (centered, medium grey)
              const yearHtml = place.year ? `<div class="map-popup-year">${place.year}</div>` : '';
              marker.bindPopup(`<div class="map-popup"><strong>${place.name}</strong>${yearHtml}</div>`);

              if (markersByType[place.type]) {
                markersByType[place.type].push(marker);
                clusterGroups[place.type].addLayer(marker);
              }
            });

            // Create interactive legend
            const legend = L.control({ position: 'topright' });
            legend.onAdd = function() {
              const div = L.DomUtil.create('div', 'map-legend');
              div.innerHTML = `
                <div class="legend-item ${activeFilters.has('lived') ? 'active' : ''}" data-type="lived">
                  <i class="fa-solid fa-house" style="color: ${colors.lived}"></i>
                  <span>Lived</span>
                </div>
                <div class="legend-item ${activeFilters.has('visited') ? 'active' : ''}" data-type="visited">
                  <i class="fa-solid fa-plane" style="color: ${colors.visited}"></i>
                  <span>Visited</span>
                </div>
              `;

              // Add click handlers for filtering
              div.querySelectorAll('.legend-item').forEach(item => {
                item.addEventListener('click', function() {
                  const type = this.getAttribute('data-type');

                  if (activeFilters.has(type)) {
                    activeFilters.delete(type);
                    this.classList.remove('active');
                    map.removeLayer(clusterGroups[type]);
                  } else {
                    activeFilters.add(type);
                    this.classList.add('active');
                    map.addLayer(clusterGroups[type]);
                  }
                });
              });

              return div;
            };
            legend.addTo(map);

            // Fit bounds to all markers
            const allMarkers = [...markersByType.lived, ...markersByType.visited];
            if (allMarkers.length) {
              const group = L.featureGroup(allMarkers);
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
