import React from "react";
import "./Menu.css";
import { MenuProps } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactSlider from "react-slider";

function Menu(props: MenuProps) {
  const {
    mapStyleOptions,
    mapStyle,
    onMapStyleChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    queryLimit,
    onQueryLimitChange,
    incidentCategories,
    onIncidentCategoriesChange,
    onUpdateData,
  } = props;

  const handleCategoryCheckboxChange = (categoryLabel: string) => {
    const updatedCategories = new Map(incidentCategories);
    updatedCategories.set(categoryLabel, !updatedCategories.get(categoryLabel));
    onIncidentCategoriesChange(updatedCategories);
  };

  return (
    <div className="menu-container">
      <div className="map-style-container">
        <label htmlFor="map-style-select">Map Style:</label>
        <select
          id="map-style-select"
          onChange={(e) => onMapStyleChange(e.target.value)}
        >
          {mapStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="date-container">
        <div className="start-date">
          <DatePicker
            selected={startDate}
            onChange={(date) => onStartDateChange(date)}
          />
        </div>
        <div className="end-date">
          <DatePicker
            selected={endDate}
            onChange={(date) => onEndDateChange(date)}
          />
        </div>
      </div>
      <div className="slider-container">
        <span>
          <label>Max Incidents:</label>
          <input
            type="number"
            value={queryLimit}
            onChange={(e) => onQueryLimitChange(+e.target.value)} // Parse the input string to a number
            min={1}
            max={1000000}
            step={1}
          />
        </span>
        <ReactSlider
          className="slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          value={queryLimit}
          min={1}
          max={1000000}
          step={1}
          onChange={(value) => onQueryLimitChange(value)}
        />
      </div>
      <div className="incident-categories-container">
        <label>Incident Categories:</label>
        <div className="incident-categories-list">
          {Array.from(incidentCategories.keys())
            .sort()
            .map((categoryLabel) => (
              <label key={categoryLabel}>
                <input
                  type="checkbox"
                  checked={incidentCategories.get(categoryLabel)}
                  onChange={() => handleCategoryCheckboxChange(categoryLabel)}
                />
                {categoryLabel.length > 22 // Limit the number of characters
                  ? `${categoryLabel.substring(0, 22)}...` // Truncate and add ellipsis
                  : categoryLabel}
              </label>
            ))}
        </div>
      </div>
      <button className="update-button" onClick={onUpdateData}>
        Update
      </button>
    </div>
  );
}

export default Menu;
