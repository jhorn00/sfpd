import React from "react";
import "./Menu.css";

interface MapOption {
  label: string;
  value: string;
}

interface MenuProps {
  mapOptions: MapOption[];
  mapStyle: string;
  onMapStyleChange: (mapStyle: string) => void;
}

function Menu({ mapOptions, mapStyle, onMapStyleChange }: MenuProps) {
  return (
    <div className="menu-container">
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
  );
}

export default Menu;
