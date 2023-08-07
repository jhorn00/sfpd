import { useState, useEffect, useCallback } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";
import { debounce } from "lodash";
import {
  IncidentMap,
  GeoJsonPoint,
  IncidentType,
  MenuProps,
  IncidentCategoryMap,
} from "./types";
import {
  MAPBOX_ACCESS_TOKEN,
  INITIAL_MAP_STYLE,
  MAP_STYLE_OPTIONS,
  INITIAL_VIEW_STATE,
  BOUNDS,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_POINT_RADIUS,
  MAX_POINT_RADIUS,
} from "./constants";
import { adjustDate, getColorCode } from "./utils";
import { makeSocrataCall } from "./api";

///// Added the following lines to correct transpiler issues with mapbox v2. /////
import mapboxgl from "mapbox-gl";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
mapboxgl.workerClass =
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved
////////////////////////////////////////////////////////////////////////////////////

function MapSF() {
  // State variables
  // Map states
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE); // map view - defined initial val
  const [mapStyle, setMapStyle] = useState(INITIAL_MAP_STYLE); // map style - defined initial val
  const [dataPoints, setDataPoints] = useState(Array<GeoJsonPoint>()); // data points - empty list
  const [hoveredObject, setHoveredObject] = useState<any | null>(null); // hovered datapoint object on map
  const [incidentMap, setIncidentMap] = useState<IncidentMap>(new window.Map()); // TODO: make use of this or get rid of it
  // Query options
  const [queryLimit, setQueryLimit] = useState(1000); // socrata query response limit - default to responsive value of 1000
  // Query results
  const [totalIncidents, setTotalIncidents] = useState(Array<IncidentType>());
  const [totalGeoJsonPoints, setTotalGeoJsonPoints] = useState(
    Array<GeoJsonPoint>()
  );
  // Menu
  const [incidentCategoryMap, setIncidentCategoryMap] =
    useState<IncidentCategoryMap>(new window.Map());
  // Misc/Other
  const initialDate = new Date(adjustDate("2018-1-01")); // TODO: stop adjustDate from being called repeatedly on state changes
  const [startDate, setStartDate] = useState(initialDate); // start date - earliest year in sfpd dataset
  const [endDate, setEndDate] = useState(new Date()); // end date - current date (dataset is maintained)

  // TODO: fix the date timezones!

  // Function to handle changes in map style
  const handleMapStyleChange = (selectedMapStyle: string) => {
    const baseStyle: string = "mapbox://styles/mapbox/";
    setMapStyle(baseStyle + selectedMapStyle);
  };

  // Function to handle changes in start date
  const handleStartDateChange = (startDate: Date | null) => {
    // TODO: consider additional date checking
    if (startDate) {
      setStartDate(startDate);
    }
  };

  // Function to handle changes in end date
  const handleEndDateChange = (endDate: Date | null) => {
    // TODO: consider additional date checking
    if (endDate) {
      setEndDate(endDate);
    }
  };

  // Function to handle changes in query limit changes
  const handleQueryLimitChange = (queryLimit: number) => {
    setQueryLimit(queryLimit);
  };

  // Function to handle changes in query limit changes
  const handleIncidentCategoriesChange = (
    incidentCategories: IncidentCategoryMap
  ) => {
    setIncidentCategoryMap(incidentCategories);
  };

  // Data point onClick
  const onClick = (info: any) => {
    if (info.object) {
      alert(info.object.properties.Name); // TODO: remove this
    }
    // TODO: popup code here?
  };

  // Data point onHover
  const debouncedOnHover = useCallback(
    debounce((info: any) => {
      if (info.object) {
        setHoveredObject({
          ...info.object,
          x: info.x,
          y: info.y,
        });
      } else {
        setHoveredObject(null);
      }
    }, 10),
    []
  );

  // Use the debounced function for the onHover event
  const onHover = (info: any) => {
    debouncedOnHover(info);
  };

  // Watch for changes to incidentCategoryMap and update visible datapoints
  useEffect(() => {
    // Get the current selected categories
    const selectedCategories: string[] = [];
    incidentCategoryMap.forEach((value, key) => {
      if (value) {
        selectedCategories.push(key);
      }
    });

    // Grab only the datapoints in the selected field
    const newDataPoints: GeoJsonPoint[] = [];
    totalGeoJsonPoints.forEach((geoJsonPoint) => {
      if (
        selectedCategories.includes(geoJsonPoint.properties.incident_category)
      ) {
        newDataPoints.push(geoJsonPoint);
      }
    });

    setDataPoints(newDataPoints);
  }, [incidentCategoryMap, totalGeoJsonPoints]);

  // TODO: Define a second scale for different zoom levels
  const [pointRadius, setPointRadius] = useState<number>(0.4);
  useEffect(() => {
    let newPointRadius: number = MIN_POINT_RADIUS;
    const zoom = viewState.zoom;
    // console.log(zoom);
    const zoomRange = MAX_ZOOM - MIN_ZOOM; // The old range
    if (zoomRange !== 0) {
      const pointRadiusRange = MAX_POINT_RADIUS - MIN_POINT_RADIUS; // The new range
      newPointRadius =
        ((MAX_ZOOM - zoom) * pointRadiusRange) / zoomRange + MIN_POINT_RADIUS;
      // console.log(newPointRadius);
    }
    setPointRadius(newPointRadius);
  }, [viewState.zoom]);

  // Map layer properties
  const layers = [
    new GeoJsonLayer({
      id: "dataPoints",
      data: dataPoints,
      // Styles
      filled: true,
      pointRadiusMinPixels: 5,
      pointRadiusScale: 2000,
      getPointRadius: pointRadius,
      getFillColor: (data) => {
        if (
          !data.properties ||
          !data.properties.incident_category ||
          !(typeof data.properties.incident_category === "string")
        ) {
          return [0, 0, 0, 0]; // Default color for null properties
        }
        return getColorCode(data.properties.incident_category);
      },
      pickable: true,
      autoHighlight: true,
      onClick,
      onHover,
    }),
  ];

  async function fetchData() {
    const result = await makeSocrataCall(startDate, endDate, queryLimit);
    if (result) {
      const {
        newTotalIncidents,
        newIncidentMap,
        newIncidentCategoryMap,
        newTotalGeoJsonPoints,
      } = result;
      console.log("result");
      // Update state or perform other actions based on the fetched data
      setTotalIncidents(newTotalIncidents);
      setIncidentMap(newIncidentMap);
      setIncidentCategoryMap(newIncidentCategoryMap);
      setTotalGeoJsonPoints(newTotalGeoJsonPoints);
      // setDataPoints(newTotalGeoJsonPoints);
    }
  }

  const debouncedViewStateChange = useCallback(
    debounce((e: any) => {
      console.log("handle viewstate change");
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
    }, 5),
    []
  );

  const handleViewStateChange = (e: any) => {
    debouncedViewStateChange(e);
  };

  // Properties for the map context menu
  const menuProps: MenuProps = {
    mapStyleOptions: MAP_STYLE_OPTIONS,
    mapStyle: mapStyle,
    onMapStyleChange: handleMapStyleChange,
    startDate: startDate,
    onStartDateChange: handleStartDateChange,
    endDate: endDate,
    onEndDateChange: handleEndDateChange,
    queryLimit: queryLimit,
    onQueryLimitChange: handleQueryLimitChange,
    incidentCategories: incidentCategoryMap,
    onIncidentCategoriesChange: handleIncidentCategoriesChange,
    dataPoints: dataPoints,
    onUpdateData: fetchData,
  };

  return (
    <>
      <Menu {...menuProps} />
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={true}
        layers={layers}
        onHover={onHover}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_ACCESS_TOKEN}></Map>
      </DeckGL>
      {hoveredObject && (
        <div
          style={{
            position: "fixed",
            zIndex: 1,
            pointerEvents: "none",
            left: hoveredObject.x,
            top: hoveredObject.y,
            backgroundColor: "#d3d3d3",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div>
            <h3>{hoveredObject.properties.incident_description}</h3>
            <p>Latitude: {hoveredObject.geometry.coordinates[1]}</p>
            <p>Longitude: {hoveredObject.geometry.coordinates[0]}</p>
          </div>
          {hoveredObject.properties.Name}
        </div>
      )}
    </>
  );
}

export default MapSF;
