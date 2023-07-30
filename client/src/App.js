import './App.css';
import { useState } from 'react';
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import axios from "axios";
import NATIONAL_PARKS_DATA from "./data/test_data.json";

function App() {
  const SOCRATA_ACCESS_TOKEN = process.env.REACT_APP_SOCRATA_ACCESS_TOKEN;
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
  // const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
  const INITIAL_VIEW_STATE = {
    latitude: 37.773972,
    longitude: -122.431297,
    zoom: 12,
    bearing: 0,
    pitch: 0
  };
  const SOCRATA_SFPD_DATA = "https://data.sfgov.org/resource/wg3w-h783.json";

  const [dataPoints, setDataPoints] = useState([]);

  const onClick = info => {
    if(info.object) {
      alert(info.object.properties.Name);
    }
    makeSocrataCall(); // TODO: relocate this
  }

  const layers = [
    new GeoJsonLayer({
      id: "nationalParks",
      data: NATIONAL_PARKS_DATA, // TODO: Stop using fake data
      // Styles
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 2000,
      getPointRadius: f => 0.04, // TODO: Make radius scale with view in some capacity
      getFillColor: data => data.properties.Name.includes("National Park") ? [0, 0, 0, 250] : [86, 144, 58, 250],
      pickable:true,
      autoHighlight: true,
      onClick
    })
  ];

  async function makeSocrataCall() {
    await axios
      .get(SOCRATA_SFPD_DATA, {
        params: {
          $$app_token: SOCRATA_ACCESS_TOKEN,
          incident_code: "07041"
        }
      })
      .then((response) => {
        const data = response.data;
        console.log(data);
        setDataPoints(data);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }

  return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN}>

        </Map>
      </DeckGL>
  );
}

export default App;
