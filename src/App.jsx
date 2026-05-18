import {
  useEffect,
  useRef,
  useState
} from 'react';
import maplibregl from 'maplibre-gl';
import {
  Protocol
} from 'pmtiles';


function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [cityData, setCityData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [buildingsVisible, setBuildingsVisible] = useState(false);
  const [basemapVisible, setBasemapVisible] = useState(true);
  const [availablePmtiles, setAvailablePmtiles] = useState([]);
  const [availablePmtilesCities, setAvailablePmtilesCities] = useState([]);
  const [catchmentVisible, setCatchmentVisible] = useState(false);
  const [availableCatchments, setAvailableCatchments] = useState([]);
  const [availableCatchmentCities, setAvailableCatchmentCities] = useState([]);

  useEffect(() => {
    fetch('/tiles')
      .then(response => response.json())
      .then(data => {
        setAvailablePmtiles(data);
        const cities = data.map(url => {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          return filename.split('_merged.pmtiles')[0].replace('_', ' ');
        });
        setAvailablePmtilesCities(cities);
      });
  }, []);

  useEffect(() => {
    console.log('1. useEffect triggered. Fetching from /catchment...');

    fetch('/catchment')
      .then(response => {
        console.log('2. Network response status:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('3. Raw data received from server:', data);

        if (!data || data.length === 0) {
          console.warn('Warning: Server returned an empty array or null data.');
        }

        setAvailableCatchments(data);

        const cities = data.map(url => {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          return filename.split('_catchment.geojson')[0].replace(/_/g, ' ').replace('(GA)', ' (GA)');
        });

        console.log('4. Processed catchment cities:', cities);
        setAvailableCatchmentCities(cities);
      })
      .catch(error => {
        console.error('Error caught during fetch or parsing:', error);
      });
  }, []);


  useEffect(() => {

    fetch('/CityRankings2024.json')
      .then(response => response.json())
      .then(data => {
        setCityData(data);
        setSelectedCity(data[0]);
      });

  }, []);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const handleToggleBasemap = () => {
    setBasemapVisible(prev => !prev);
  };

  const handleToggleBuildings = () => {
    setBuildingsVisible(prev => !prev);
  };

  const handleToggleCatchment = () => {
    setCatchmentVisible(prev => !prev);
  };

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
    if (!selectedCity || mapRef.current || !mapContainer.current) return;

    const styleUrl = 'https://api.maptiler.com/maps/base-v4-dark/style.json?key=jAOfgGHZBrcduoa4kDep';
    const blankStyle = {
      version: 8,
      name: 'Blank',
      sources: {},
      layers: [{
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#111'
        }
      }]
    };

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: basemapVisible ? styleUrl : blankStyle,
      center: [selectedCity.Lon, selectedCity.Lat],
      zoom: 10,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [selectedCity, basemapVisible]);

  useEffect(() => {
    if (!mapRef.current || !selectedCity) return;
    const map = mapRef.current;

    const updateCatchmentLayer = async () => {
      const sourceId = 'catchment-source';
      const layerId = 'catchment-layer';

      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
if (catchmentVisible) {
        const cityCatchmentGeojsonUrl = availableCatchments.find(url => {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          const cityNameFromUrl = filename.split('_catchment.geojson')[0].replace(/_/g, ' ').replace('(GA)', ' (GA)');
          return cityNameFromUrl === selectedCity.City;
        });

        if (cityCatchmentGeojsonUrl) {
          try {
            const response = await fetch(cityCatchmentGeojsonUrl);
            const geojsonData = await response.json();
            map.addSource(sourceId, {
              type: 'geojson',
              data: geojsonData,
            });

            map.addLayer({
              id: layerId,
              source: sourceId,
              type: 'line',
              paint: {
                'line-color': '#ff0000',
                'line-width': 8,
                'line-opacity': 0.4,
              },
            });
          } catch (error) {
            console.error("Failed to load catchment data", error);
          }
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateCatchmentLayer();
    } else {
      map.once('load', updateCatchmentLayer);
    }
  }, [catchmentVisible, selectedCity, availableCatchments]);

  useEffect(() => {
    if (!mapRef.current || !selectedCity) return;
    const map = mapRef.current;

    const updateBuildingsLayer = () => {
      const sourceId = 'buildings-source';
      const layerId = 'buildings-layer';

      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (buildingsVisible) {
        const cityPmtilesUrl = availablePmtiles.find(url => {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          const cityNameFromUrl = filename.split('_merged.pmtiles')[0].replace('_', ' ');
          return cityNameFromUrl === selectedCity.City;
        });

        if (cityPmtilesUrl) {
          const filename = cityPmtilesUrl.substring(cityPmtilesUrl.lastIndexOf('/') + 1);
          const sourceLayer = filename.replace('.pmtiles', '');

          map.addSource(sourceId, {
            type: 'vector',
            url: `pmtiles://${window.location.origin}${cityPmtilesUrl}`,
            attribution: '© Global Building Atlas',
          });

          map.addLayer({
            id: layerId,
            source: sourceId,
            'source-layer': sourceLayer,
            type: 'fill',
            minzoom: 7,
            paint: {
              'fill-color': '#6294ff',
              'fill-opacity': 0.7
            },
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateBuildingsLayer();
    } else {
      map.once('load', updateBuildingsLayer);
    }
  }, [selectedCity, buildingsVisible, basemapVisible, availablePmtiles]);

  if (!selectedCity) {
    return <div> Loading... </div>;
  }

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
              >
                {availablePmtilesCities.includes(city.City) ? `${city.City}🗺️ ` : city.City}
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
            <p className="city-coords">{selectedCity.Lat}, {selectedCity.Lon} - {selectedCity.Ranking}(GaWC 2024)</p>
          </section>
          <section>
            <h3>Layers</h3>
            <button type="button" onClick={handleToggleBuildings}>
              {buildingsVisible ? 'Hide Buildings' : 'Show Buildings'}
            </button>
            <button type="button">Show Grid</button>
            <button 
              type="button" 
              onClick={handleToggleCatchment}
              disabled={!availableCatchmentCities.includes(selectedCity.City)}
            >
              {catchmentVisible ? 'Hide Catchment' : 'Show Catchment'}
            </button>
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
          <div className="map-container" ref={mapContainer}/>
        </main>
      </div>
    </div>
  );
}

export default App;