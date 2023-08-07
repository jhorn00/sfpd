import { BarGraphFields, GeoJsonPoint, IncidentCategoryMap, IncidentMap, IncidentType } from "./types";

export function adjustDate(targetDate: string): Date {
    const originalDate = new Date(targetDate);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = new Date(
        originalDate.toLocaleString("en-US", { timeZone: timezone })
    );
    return localDate;
}

export function generateBarGraphFields(dataPoints: GeoJsonPoint[]): BarGraphFields {
    // Handle empty list
    if (dataPoints.length === 0){
        return {
            title: "No Insight",
            dates: [],
            occurrances: []
        };
    }
    // Make sure points are sorted by date (shallow copy to avoid updating state)
    const sortedDataPoints = dataPoints.slice().sort((a, b) => a.properties.incident_date.localeCompare(b.properties.incident_date));
    // Result variables
    let title = sortedDataPoints[0].properties.incident_category;
    const dates = Array<string>();
    const occurrances = Array<number>();
    // First element
    let previousDate = sortedDataPoints[0].properties.incident_date;
    dates.push(previousDate);
    occurrances.push(1);
    for (let i = 1; i < sortedDataPoints.length; i++){
        const currentDataPoint = sortedDataPoints[i];
        // Same date as previous
        if (currentDataPoint.properties.incident_date === previousDate) {
            // Update the count
            occurrances[occurrances.length - 1]++;
            // Make sure Label catches mutitple categories
            // Just put it in here so it happens a little less frequently
            if (currentDataPoint.properties.incident_category !== title) {
                title = "Incidents";
            }
        }
        // New date
        else{
            // Set the date we are looking for and update lists
            previousDate = currentDataPoint.properties.incident_date;
            dates.push(previousDate);
            occurrances.push(1);
        }
    }
    return {
        title: title,
        dates: dates,
        occurrances: occurrances
    }
}

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
        // Violent Crimes
        case "assault":
        case "homicide":
        case "rape":
        case "robbery":
            return [211, 84, 0, 250]; // Red-orange

        // Property Crimes
        case "arson":
        case "burglary":
        case "larceny theft":
        case "motor vehicle theft":
        case "motor vehicle theft?":
        case "stolen property":
        case "vandalism":
        case "vehicle misplaced":
            return [52, 152, 219, 250]; // Blue

        // White-Collar Crimes
        case "embezzlement":
        case "forgery and counterfeiting":
        case "fraud":
            return [200, 150, 11, 250]; // Gold

        // Drug-Related Crimes
        case "drug violation":
        case "drug offense":
            return [128, 0, 128, 250]; // Dark Purple

        // Public Order Crimes
        case "disorderly conduct":
        case "gambling":
        case "liquor laws":
        case "prostitution":
            return [155, 89, 182, 250]; // Purple

        // Domestic Crimes
        case "offences against the family and children":
        case "sex offense":
            return [192, 57, 43, 250]; // Dark red

        case "human trafficking (a), commercial sex acts":
        case "human trafficking, commercial sex acts":
            return [255, 0, 0, 250];

        // Miscellaneous Crimes
        case "civil sidewalks":
        case "courtesy report":
        case "fire report":
        case "miscellaneous investigation":
        case "missing person":
        case "non-criminal":
        case "other":
        case "other miscellaneous":
        case "other offenses":
        case "suicide":
        case "suspicious":
        case "suspicious occ":
        case "traffic violation arrest":
        case "unknown":
        case "weapons carrying etc":
        case "weapons offense":
        case "weapons offence":
            return [192, 57, 43, 250]; // Dark red

        // Other Categories
        case "case closure":
            return [44, 62, 80, 250]; // Dark blue

        case "lost property":
            return [149, 165, 166, 250]; // Gray

        case "malicious mischief":
            return [211, 84, 0, 250]; // Red-orange

        case "recovered vehicle":
        case "vehicle impounded":
            return [46, 204, 113, 250]; // Green

        case "traffic collision":
            return [231, 76, 60, 250]; // Dark red

        case "warrant":
            return [52, 152, 219, 250]; // Blue

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
