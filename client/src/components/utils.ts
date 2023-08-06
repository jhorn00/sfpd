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

export function getColorCode(category: string): [number, number, number, number] {
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
        case "assault":
            return [192, 57, 43, 250]; // Dark red for Assault
        case "case closure":
            return [44, 62, 80, 250]; // Dark blue for Case Closure
        case "disorderly conduct":
            return [243, 156, 18, 250]; // Orange for Disorderly Conduct
        case "drug violation":
            return [241, 196, 15, 250]; // Yellow for Drug Violation
        case "fraud":
            return [230, 126, 34, 250]; // Orange for Fraud
        case "gambling":
            return [155, 89, 182, 250]; // Purple for Gambling
        case "liquor laws":
            return [46, 204, 113, 250]; // Green for Liquor Laws
        case "larceny theft":
            return [52, 152, 219, 250]; // Blue for Larceny Theft
        case "lost property":
            return [149, 165, 166, 250]; // Gray for Lost Property
        case "malicious mischief":
            return [211, 84, 0, 250]; // Red-orange for Malicious Mischief
        case "missing person":
            return [189, 195, 199, 250]; // Light gray for Missing Person
        case "motor vehicle theft":
            return [26, 188, 156, 250]; // Teal for Motor Vehicle Theft
        case "non-criminal":
            return [155, 89, 182, 250]; // Purple for Non-Criminal
        case "prostitution":
            return [155, 89, 182, 250]; // Purple for Prostitution
        case "rape":
            return [142, 68, 173, 250]; // Dark purple for Rape
        case "recovered vehicle":
            return [46, 204, 113, 250]; // Green for Recovered Vehicle
        case "robbery":
            return [211, 84, 0, 250]; // Red-orange for Robbery
        case "sex offense":
            return [192, 57, 43, 250]; // Dark red for Sex Offense
        case "stolen property":
            return [155, 89, 182, 250]; // Purple for Stolen Property
        case "traffic collision":
            return [231, 76, 60, 250]; // Dark red for Traffic Collision
        case "vehicle impounded":
            return [46, 204, 113, 250]; // Green for Vehicle Impounded
        case "warrant":
            return [52, 152, 219, 250]; // Blue for Warrant
        default:
            return [149, 165, 166, 250]; // Default color for other categories (Gray)
    }
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
