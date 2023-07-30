import { useState } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import axios from "axios";
import NATIONAL_PARKS_DATA from "../data/test_data.json";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";

function MapSF() {
  // Map component constants
  const SOCRATA_ACCESS_TOKEN = process.env.REACT_APP_SOCRATA_ACCESS_TOKEN;
  const SOCRATA_SFPD_DATA = "https://data.sfgov.org/resource/wg3w-h783.json";
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const INITIAL_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
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

  // State variables
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE); // map view
  const [mapStyle, setMapStyle] = useState(INITIAL_MAP_STYLE); // map style
  const [dataPoints, setDataPoints] = useState([]); // data points

  // Menu map style options
  const mapOptions = [
    { label: "Streets", value: "streets-v12" },
    { label: "Satellite", value: "satellite-streets-v12" },
  ];

  // Function to handle changes in map style
  const handleMapStyleChange = (selectedMapStyle: string) => {
    const baseStyle: string = "mapbox://styles/mapbox/";
    setMapStyle(baseStyle + selectedMapStyle);
  };

  // Data point onClick
  const onClick = (info: any) => {
    if (info.object) {
      alert(info.object.properties.Name);
    }
    makeSocrataCall(); // TODO: relocate this
  };

  // Map layer properties
  const layers = [
    new GeoJsonLayer({
      id: "nationalParks",
      data: NATIONAL_PARKS_DATA, // TODO: Stop using static data
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

  // Socrata datapoint request
  async function makeSocrataCall() {
    const startDate = "2022-07-01T00:00:00.000";
    const endDate = "2022-07-15T23:59:59.999";
    await axios
      .get(SOCRATA_SFPD_DATA, {
        params: {
          $$app_token: SOCRATA_ACCESS_TOKEN,
          incident_code: "07041",
          // $where: `incident_date between '${startDate}' and '${endDate}'`,
          // $where: `incident_date = 2022-05-03T00:00:00.000`,
          $where: `incident_date >= '${startDate}' AND incident_date <= '${endDate}'`,
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
