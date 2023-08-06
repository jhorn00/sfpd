import { useState, useEffect } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";
import {
  IncidentMap,
  GeoJsonPoint,
  IncidentType,
  MenuProps,
  IncidentCategoryMap,
} from "./types";
import {
  SOCRATA_ACCESS_TOKEN,
  SOCRATA_SFPD_DATA,
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
import {
  adjustDate,
  getColorCode,
  populateIncidentCategoryMap,
  populateIncidentList,
  populateIncidentMap,
} from "./utils";

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
  const [incidentMap, setIncidentMap] = useState<IncidentMap>(new window.Map());
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
  const [startDate, setStartDate] = useState(adjustDate("2018-1-01")); // start date - earliest year in sfpd dataset
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
    console.log(incidentCategories);
  };

  // Data point onClick
  const onClick = (info: any) => {
    if (info.object) {
      alert(info.object.properties.Name); // TODO: remove this
    }
    // TODO: popup code here?
  };

  // Data point onHover
  const onHover = (info: any) => {
    // TODO: Change variable name
    if (info.object) {
      setHoveredObject({
        ...info.object,
        x: info.x,
        y: info.y,
      });
    } else {
      setHoveredObject(null);
    }
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
    console.log(selectedCategories);

    // Grab only the datapoints in the selected field
    const newDataPoints: GeoJsonPoint[] = [];
    console.log(totalGeoJsonPoints);
    totalGeoJsonPoints.forEach((geoJsonPoint) => {
      if (
        selectedCategories.includes(geoJsonPoint.properties.incident_category)
      ) {
        newDataPoints.push(geoJsonPoint);
      }
    });
    console.log(newDataPoints);

    setDataPoints(newDataPoints);

    // You can add more logic and actions here based on incidentCategoryMap changes.
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
  }, [viewState]);

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
        if (!Array.isArray(response.data)) {
          console.error(
            "Received empty data or non-array response from Socrata API"
          );
          alert(
            "Socrata API unable to process such a large incident request at the moment. Please try something smaller."
          );
          return; // Skip the rest of the function
        }
        const data = response.data;
        console.log(data);

        // Populate IncidentType list
        const newTotalIncidents = populateIncidentList(data); // Update query results
        setTotalIncidents(newTotalIncidents);
        console.log(
          "Identified " +
            totalIncidents.length.toString() +
            " mappable totalIncidents."
        );

        // Update incidentMap
        const newIncidentMap: IncidentMap =
          populateIncidentMap(newTotalIncidents); // use local object because state might not be updated
        setIncidentMap(newIncidentMap);
        console.log(newIncidentMap);

        // Update incidentCategoryList menu options
        const incidentCategoryStrings = Array.from(newIncidentMap.keys()); // use local object because state might not be updated
        const newIncidentCategoryMap: IncidentCategoryMap =
          populateIncidentCategoryMap(incidentCategoryStrings);
        setIncidentCategoryMap(newIncidentCategoryMap);
        console.log(newIncidentCategoryMap);

        // Convert the response data to GeoJSON objects
        // use local object because state might not be updated
        const newTotalGeoJsonPoints: GeoJsonPoint[] = newTotalIncidents.map(
          (incident: IncidentType) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [incident.longitude, incident.latitude],
            },
            properties: incident,
          })
        );
        setTotalGeoJsonPoints(newTotalGeoJsonPoints); // use local object because state might not be updated
        console.log(newTotalGeoJsonPoints);

        setDataPoints(newTotalGeoJsonPoints); // use local object because state might not be updated
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
    onUpdateData: makeSocrataCall,
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
