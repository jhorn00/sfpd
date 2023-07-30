import { useState } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import axios from "axios";
import NATIONAL_PARKS_DATA from "../data/test_data.json";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";

function MapSF() {
  const SOCRATA_ACCESS_TOKEN = process.env.REACT_APP_SOCRATA_ACCESS_TOKEN;
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const INITIAL_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
  // const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
  const INITIAL_VIEW_STATE = {
    latitude: 37.773972,
    longitude: -122.431297,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  };
  const BOUNDS = [
    [-122.531297, 37.673972], // Southwest coordinates
    [-122.331297, 37.873972], // Northeast coordinates
  ];
  const MIN_ZOOM = 10;
  const SOCRATA_SFPD_DATA = "https://data.sfgov.org/resource/wg3w-h783.json";

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [dataPoints, setDataPoints] = useState([]);

  // State variables for menu options
  const [mapStyle, setMapStyle] = useState(INITIAL_MAP_STYLE);

  // Menu options and their values
  const mapOptions = [
    { label: "Streets", value: "streets-v12" },
    { label: "Satellite", value: "satellite-streets-v12" },
    // Add more options here if needed
  ];

  // Function to handle menu selection
  const handleMapStyleChange = (selectedMapStyle: string) => {
    const baseStyle: string = "mapbox://styles/mapbox/";
    console.log(selectedMapStyle);
    setMapStyle(baseStyle + selectedMapStyle);
  };

  const onClick = (info: any) => {
    if (info.object) {
      alert(info.object.properties.Name);
    }
    makeSocrataCall(); // TODO: relocate this
  };

  const layers = [
    new GeoJsonLayer({
      id: "nationalParks",
      data: NATIONAL_PARKS_DATA, // TODO: Stop using fake data
      // Styles
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 2000,
      getPointRadius: (f) => 0.04, // TODO: Make radius scale with view in some capacity
      getFillColor: (data) => {
        // Check if data.properties exists and has a valid Name property
        if (
          data.properties &&
          data.properties.Name &&
          data.properties.Name.includes("National Park")
        ) {
          return [0, 0, 0, 250];
        } else {
          return [86, 144, 58, 250];
        }
      },
      pickable: true,
      autoHighlight: true,
      onClick,
    }),
  ];

  async function makeSocrataCall() {
    await axios
      .get(SOCRATA_SFPD_DATA, {
        params: {
          $$app_token: SOCRATA_ACCESS_TOKEN,
          incident_code: "07041",
        },
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

  const handleViewStateChange = (e: any) => {
    const { viewState } = e;
    const [minLng, minLat] = BOUNDS[0];
    const [maxLng, maxLat] = BOUNDS[1];

    // Restrict lat, lng, zoom
    const boundedViewState = {
      ...viewState,
      latitude: Math.min(Math.max(viewState.latitude, minLat), maxLat),
      longitude: Math.min(Math.max(viewState.longitude, minLng), maxLng),
      zoom: Math.max(viewState.zoom, MIN_ZOOM),
    };

    setViewState(boundedViewState);
  };

  return (
    <>
      <Menu
        mapOptions={mapOptions}
        mapStyle={mapStyle}
        onMapStyleChange={handleMapStyleChange}
      />
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_ACCESS_TOKEN}></Map>
      </DeckGL>
    </>
  );
}

export default MapSF;
