import logo from './logo.svg';
import './App.css';
import NATIONAL_PARKS_DATA from "./data/test_data.json";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl";

const MAPBOX_ACCESS_TOKEN = process.env.REACT_MAPBOX_ACCESS_TOKEN;
const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
// const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const INITIAL_VIEW_STATE = {
  latitude: 37.773972,
  longitude: -122.431297,
  zoom: 12,
  bearing: 0,
  pitch: 0
};

function App() {

  const onClick = info => {
    if(info.object) {
      alert(info.object.properties.Name);
    }
  }

  const layers = [
    new GeoJsonLayer({
      id: "nationalParks",
      data: NATIONAL_PARKS_DATA,
      // Styles
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 2000,
      getPointRadius: f => 5,
      getFillColor: data => data.properties.Name.includes("National Park") ? [0, 0, 0, 100] : [86, 144, 58, 100],
      pickable:true,
      autoHighlight: true,
      onClick
    })
  ];

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
