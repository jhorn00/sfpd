import { IncidentCategoryMap, IncidentMap, IncidentType } from "./types";

export function populateIncidentList(data: any[]): IncidentType[] {
    const validCoordinatesData = data.filter(
      (item: any) =>
        item.hasOwnProperty("latitude") &&
        item.hasOwnProperty("longitude") &&
        typeof item.latitude === "string" &&
        typeof item.longitude === "string"
    );
  
    return validCoordinatesData
      .map((incident: any) => {
        const {
          incident_datetime,
          incident_date,
          incident_time,
          year,
          day_of_week,
          report_datetime,
          row_id,
          incident_id,
          incident_number,
          cad_number = "",
          report_type_code,
          report_type_description,
          filed_online = false,
          incident_code,
          incident_category = "Unknown",
          incident_subcategory = "Unknown",
          incident_description,
          resolution,
          intersection = "",
          cnn = "",
          police_district,
          analysis_neighborhood = "",
          supervisor_district = "",
          supervisor_district_2012 = "",
          latitude,
          longitude,
          point = null,
          neighborhoods = "",
          current_supervisor_districts = "",
          current_police_districts = "",
        } = incident;
  
        const parsedLatitude = parseFloat(latitude);
        const parsedLongitude = parseFloat(longitude);
  
        if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
          return null; // Skip this incident
        }
  
        return {
          incident_datetime,
          incident_date,
          incident_time,
          incident_year: year,
          incident_day_of_week: day_of_week,
          report_datetime,
          row_id,
          incident_id,
          incident_number,
          cad_number,
          report_type_code,
          report_type_description,
          filed_online,
          incident_code,
          incident_category,
          incident_subcategory,
          incident_description,
          resolution,
          intersection,
          cnn,
          police_district,
          analysis_neighborhood,
          supervisor_district,
          supervisor_district_2012,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          point,
          neighborhoods,
          current_supervisor_districts,
          current_police_districts,
          // ... other properties ...
        };
      })
      .filter((incident: IncidentType | null) => incident !== null) as IncidentType[];
}
  
export function populateIncidentMap(incidents: IncidentType[]) {
    const incidentMap: IncidentMap = new window.Map();
    incidents.forEach((incident) => {
        const key = incident.incident_category;
        if (incidentMap.has(key)) {
          incidentMap.get(key)?.push(incident);
        } else {
          incidentMap.set(key, []);
        }
    });
    return incidentMap;
}

export function populateIncidentCategoryMap(incidentCategoryStrings: string[]) {
    const incidentCategoryMap: IncidentCategoryMap = new window.Map();
    incidentCategoryStrings.forEach((key) => {
        if (!incidentCategoryMap.has(key)) {
            incidentCategoryMap.set(key, false);
        }
    });
    return incidentCategoryMap;
}
