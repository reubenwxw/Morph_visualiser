import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import cityData from '../CityRankings2024.json';
import { Protocol } from 'pmtiles';

const availablePmtiles = [
  'Antwerp_merged.pmtiles',
  'Atlanta_(GA)_merged.pmtiles',
  'Bangkok_merged.pmtiles',
  'Chicago_merged.pmtiles',
  'Frankfurt_merged.pmtiles',
  'Istanbul_merged.pmtiles',
  'Jakarta_merged.pmtiles'
];

const availablePmtilesCities = availablePmtiles.map(f => f.split('_merged.pmtiles')[0].replace('_', ' '));

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState(cityData[0]);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const handleCityChange = (event) => {
    const city = cityData.find(c => c.City === event.target.value);
    setSelectedCity(city);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [city.Lon, city.Lat],
        zoom: 10
      });
    }
    if (availablePmtilesCities.includes(city.City)) {
      console.log(`${city.City} has an available pmtiles file.`);
    } else {
      console.log(`${city.City} does not have an available pmtiles file.`);
    }
  };

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/019e05e6-d600-76b0-9116-f24f280c326d/style.json?key=jAOfgGHZBrcduoa4kDep',
      center: [selectedCity.Lon, selectedCity.Lat],
      zoom: 10,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {

  }, [selectedCity]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">Reuben's PhD Data Viz Tool</div>
        <nav>
          <select onChange={handleCityChange} value={selectedCity.City}>
            {cityData.map((city) => (
              <option 
                key={city.City} 
                value={city.City}
                style={{
                  backgroundColor: availablePmtilesCities.includes(city.City) ? 'lightgreen' : 'white'
                }}
              >
                {city.City}
              </option>
            ))}
          </select>
          <a href="#overview">Overview</a>
          <a href="#data">Data</a>
          <a href="#settings">Settings</a>
        </nav>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <section>
            <h2 className='city-name'>{selectedCity.City}</h2>
            <p className="city-coords">{selectedCity.Lat}, {selectedCity.Lon}</p>
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
