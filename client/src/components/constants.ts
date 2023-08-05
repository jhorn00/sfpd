// File for (real) constant definitions
// Query Constants
export const SOCRATA_ACCESS_TOKEN: string | undefined = process.env.REACT_APP_SOCRATA_ACCESS_TOKEN; // Author's Socrata access token in .gitignored .env file
export const SOCRATA_SFPD_DATA: string = "https://data.sfgov.org/resource/wg3w-h783.json"; // Base Socrata SFPD Incident query endpoint
// Map Constants
export const MAPBOX_ACCESS_TOKEN: string | undefined = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN; // Author's Mapbox access token in .gitignored .env file
export const INITIAL_MAP_STYLE: string = "mapbox://styles/mapbox/dark-v11"; // Initial style/theme of map
export const MAP_STYLE_OPTIONS = [ // Menu map style options
  { label: "Dark", value: "dark-v11" },
  { label: "Light", value: "light-v11" },
  { label: "Streets", value: "streets-v12" },
  { label: "Satellite", value: "satellite-streets-v12" },
];
export const INITIAL_VIEW_STATE = { // Initial view/camera posistion of map - contents self-explanatory
  latitude: 37.773972,
  longitude: -122.431297,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};
export const BOUNDS = [
  [-122.531297, 37.673972], // Southwest-most coordinates
  [-122.331297, 37.873972], // Northeast-most coordinates
];
export const MIN_ZOOM = 10; // Minimum zoom set by author
export const MAX_ZOOM = 20; // Maximum zoom as defined by Mapbox (determined via testing)
export const MIN_POINT_RADIUS = 0.003; // Minimum radius of a datapoint
export const MAX_POINT_RADIUS = 0.05; // Maximum radius of a datapoint