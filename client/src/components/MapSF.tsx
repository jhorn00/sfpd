import { useState } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import axios from "axios";
import NATIONAL_PARKS_DATA from "../data/test_data.json";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";
import { MenuProps } from "./types";

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
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE); // map view - defined initial val
  const [mapStyle, setMapStyle] = useState(INITIAL_MAP_STYLE); // map style - defined initial val
  const [dataPoints, setDataPoints] = useState([]); // data points - empty list
  const [queryLimit, setQueryLimit] = useState(1000); // socrata query response limit - default to responsive value of 1000
  const [startDate, setStartDate] = useState(new Date("2018-01-01")); // start date - earliest year in sfpd dataset
  const [endDate, setEndDate] = useState(new Date()); // end date - current date (dataset is maintained)

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

  // Function to handle changes in start date
  const handleStartDateChange = (startDate: Date | null) => {
    // TODO: consider additional date checking
    console.log(startDate);
    if (startDate) {
      setStartDate(startDate);
    }
  };

  // Function to handle changes in end date
  const handleEndDateChange = (endDate: Date | null) => {
    console.log(endDate);
    // TODO: consider additional date checking
    if (endDate) {
      setEndDate(endDate);
    }
  };

  // Function to handle changes in query limit changes
  const handleQueryLimitChange = (queryLimit: number) => {
    setQueryLimit(queryLimit);
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
    // Query requires ISO format
    let startDateISO = startDate.toISOString();
    let endDateISO = endDate.toISOString();
    // Query requires no timezone
    startDateISO = startDateISO.slice(0, -1);
    endDateISO = endDateISO.slice(0, -1);
    // Request data
    await axios
      .get(SOCRATA_SFPD_DATA, {
        params: {
          $$app_token: SOCRATA_ACCESS_TOKEN,
          $limit: queryLimit,
          // incident_code: "07041",
          $where: `incident_date >= '${startDateISO}' AND incident_date <= '${endDateISO}'`,
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

  const menuProps: MenuProps = {
    mapOptions: mapOptions,
    mapStyle: mapStyle,
    onMapStyleChange: handleMapStyleChange,
    startDate: startDate,
    onStartDateChange: handleStartDateChange,
    endDate: endDate,
    onEndDateChange: handleEndDateChange,
    queryLimit: queryLimit,
    onQueryLimitChange: handleQueryLimitChange,
  };

  return (
    <>
      <Menu {...menuProps} />
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
