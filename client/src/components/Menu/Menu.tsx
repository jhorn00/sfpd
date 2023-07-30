import React from "react";
import "./Menu.css";
import { MenuProps } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Menu(props: MenuProps) {
  const {
    mapOptions,
    mapStyle,
    onMapStyleChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
  } = props;
  return (
    <div className="menu-container">
      <div className="map-style">
        <label htmlFor="map-style-select">Map Style:</label>
        <select
          id="map-style-select"
          onChange={(e) => onMapStyleChange(e.target.value)}
        >
          {mapOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
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
  );
}

export default Menu;
