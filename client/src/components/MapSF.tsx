import { useState, useEffect } from "react";
import { Map } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl/typed";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import Menu from "./Menu/Menu";
import { GeoJsonPoint, IncidentType, MenuProps } from "./types";
import {
  SOCRATA_ACCESS_TOKEN,
  SOCRATA_SFPD_DATA,
  MAPBOX_ACCESS_TOKEN,
  INITIAL_MAP_STYLE,
  INITIAL_VIEW_STATE,
  BOUNDS,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_POINT_RADIUS,
  MAX_POINT_RADIUS,
} from "./constants";
import { mapIncidents } from "./utils";

function MapSF() {
  // State variables
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE); // map view - defined initial val
  const [mapStyle, setMapStyle] = useState(INITIAL_MAP_STYLE); // map style - defined initial val
  const [dataPoints, setDataPoints] = useState(Array<GeoJsonPoint>()); // data points - empty list
  const [queryLimit, setQueryLimit] = useState(1000); // socrata query response limit - default to responsive value of 1000
  const [startDate, setStartDate] = useState(new Date("2018-01-31")); // start date - earliest year in sfpd dataset
  const [endDate, setEndDate] = useState(new Date()); // end date - current date (dataset is maintained)
  const [hoveredObject, setHoveredObject] = useState<any | null>(null); // hovered datapoint object on map

  // TODO: fix the date timezones!

  // Menu map style options
  const mapOptions = [
    { label: "Dark", value: "dark-v11" },
    { label: "Light", value: "light-v11" },
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
        if (!data.properties || !data.properties.incident_category) {
          // TODO: more categories
          return [0, 0, 0, 0]; // Default color for null properties
        }
        if (data.properties.incident_category.toLowerCase().includes("theft")) {
          return [50, 50, 100, 250]; // Bluish color for Theft
        } else if (
          data.properties.incident_category.toLowerCase().includes("assault")
        ) {
          return [100, 50, 50, 250]; // Reddish color for Assault
        } else if (
          data.properties.incident_category.toLowerCase().includes("rape")
        ) {
          return [148, 0, 211, 250]; // Purple color for Rape
        } else {
          return [86, 144, 58, 250]; // Default color for other categories
        }
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
        const data = response.data;
        console.log(data);

        // Populate IncidentType
        const incidents = mapIncidents(data); // TODO: Use this for analysis or remove it

        // Convert the response data to GeoJSON objects
        const geoJsonData: GeoJsonPoint[] = incidents.map(
          (incident: IncidentType) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [incident.longitude, incident.latitude],
            },
            properties: incident,
          })
        );

        setDataPoints(geoJsonData);
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
    mapOptions: mapOptions,
    mapStyle: mapStyle,
    onMapStyleChange: handleMapStyleChange,
    startDate: startDate,
    onStartDateChange: handleStartDateChange,
    endDate: endDate,
    onEndDateChange: handleEndDateChange,
    queryLimit: queryLimit,
    onQueryLimitChange: handleQueryLimitChange,
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
