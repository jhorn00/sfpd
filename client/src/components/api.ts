import axios from "axios";
import { SOCRATA_ACCESS_TOKEN, SOCRATA_SFPD_DATA } from "./constants";
import {
  IncidentMap,
  IncidentCategoryMap,
  IncidentType,
  GeoJsonPoint,
} from "./types";
import {
  populateIncidentList,
  populateIncidentMap,
  populateIncidentCategoryMap,
} from "./utils";

// Socrata datapoint request
export async function makeSocrataCall(
  startDate: Date,
  endDate: Date,
  queryLimit: number
) {
  // Query requires ISO format
  let startDateISO = startDate.toISOString();
  let endDateISO = endDate.toISOString();
  // Query requires no timezone
  startDateISO = startDateISO.slice(0, -1);
  endDateISO = endDateISO.slice(0, -1);
  // Request data
  try {
    const response = await axios.get(SOCRATA_SFPD_DATA, {
      params: {
        $$app_token: SOCRATA_ACCESS_TOKEN,
        $limit: queryLimit,
        // incident_code: "07041",
        $where: `incident_date >= '${startDateISO}' AND incident_date <= '${endDateISO}'`,
      },
    });

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

    // Populate IncidentType list
    const newTotalIncidents = populateIncidentList(data); // Update query results

    // Update incidentMap
    const newIncidentMap: IncidentMap = populateIncidentMap(newTotalIncidents); // use local object because state might not be updated

    // Update incidentCategoryList menu options
    const incidentCategoryStrings = Array.from(newIncidentMap.keys()); // use local object because state might not be updated
    const newIncidentCategoryMap: IncidentCategoryMap =
      populateIncidentCategoryMap(incidentCategoryStrings);
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

    // setDataPoints(newTotalGeoJsonPoints); // use local object because state might not be updated
    return {
      newTotalIncidents,
      newIncidentMap,
      newIncidentCategoryMap,
      newTotalGeoJsonPoints,
    };
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
}
