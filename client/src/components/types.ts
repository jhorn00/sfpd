import { Point } from "react-map-gl";

///// Added the following lines to correct transpiler issues with mapbox v2. /////
import mapboxgl from "mapbox-gl";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
mapboxgl.workerClass =
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved
////////////////////////////////////////////////////////////////////////////////////

export type IncidentMap = Map<string, IncidentType[]>;

export interface GeoJsonPoint {
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    properties: IncidentType;
}  

// Incident data in order from csv export
// Not technically necessary but just wanted to more clearly define incident fields
export interface IncidentType {
    incident_datetime: string;
    incident_date: string;
    incident_time: string;
    incident_year: string;
    incident_day_of_week: string;
    report_datetime: string;
    row_id: string;
    incident_id: string;
    incident_number: string;
    cad_number?: string;
    report_type_code: string;
    report_type_description: string;
    filed_online?: boolean; // will be true, if exists
    incident_code: string;
    incident_category: string;
    incident_subcategory: string;
    incident_description: string;
    resolution: string;
    intersection?: string;
    cnn?: string;
    police_district: string;
    analysis_neighborhood?: string;
    supervisor_district?: string;
    supervisor_district_2012?: string;
    latitude: number;
    longitude: number;
    point?: Point;
    neighborhoods?: string;
    // ESNCAG - Boundary File
    // Central Market/Tenderloin Boundary Polygon - Updated
    // Civic Center Harm Reduction Project Boundary
    // HSOC Zones as of 2018-06-05
    // Invest In Neighborhoods (IIN) Areas
    current_supervisor_districts?: string;
    current_police_districts?: string;
}

export interface MapStyleOption {
    label: string;
    value: string;
}

export type IncidentCategoryMap = Map<string, boolean>;
  
export interface MenuProps {
    mapStyleOptions: MapStyleOption[];
    mapStyle: string;
    onMapStyleChange: (mapStyle: string) => void;
    startDate: Date;
    onStartDateChange: (startDate: Date | null) => void;
    endDate: Date;
    onEndDateChange: (endDate: Date | null) => void;
    queryLimit: number;
    onQueryLimitChange: (queryLimit: number) => void;
    incidentCategories: IncidentCategoryMap;
    onIncidentCategoriesChange: (incidentCategories: IncidentCategoryMap) => void;
    onUpdateData: () => void;
}
