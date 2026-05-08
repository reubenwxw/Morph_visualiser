import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/019e05e6-d600-76b0-9116-f24f280c326d/style.json?key=jAOfgGHZBrcduoa4kDep',
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    const nav = new maplibregl.NavigationControl({ visualizePitch: true });
    mapRef.current.addControl(nav, 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">MapLibre Sidebar App</div>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#data">Data</a>
          <a href="#settings">Settings</a>
        </nav>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <section>
            <h2>Controls</h2>
            <p>Use the map controls to zoom, rotate, and pan.</p>
          </section>
          <section>
            <h3>Layers</h3>
            <button type="button">Toggle Basemap</button>
            <button type="button">Show Grid</button>
          </section>
          <section>
            <h3>Details</h3>
            <ul>
              <li>Map center: USA</li>
              <li>Zoom level: 3</li>
              <li>Style: placeholder basemap</li>
            </ul>
          </section>
        </aside>

        <main className="app-main">
          <div className="map-container" ref={mapContainer} />
        </main>
      </div>
    </div>
  );
}

export default App;
