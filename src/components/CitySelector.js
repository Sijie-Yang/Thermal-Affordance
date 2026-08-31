import React from "react"
import styled from "styled-components"
import { CITIES } from "../data/cities"

const Select = styled.select`
  min-height: 44px;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  width: 100%;

  &:hover {
    border-color: #888;
  }

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`

const CitySelector = ({ onSelectCity, value }) => {
  return (
    <Select
      id="explorer-city"
      aria-label="City"
      value={value || "singapore"}
      onChange={event => onSelectCity(event.target.value)}
    >
      {CITIES.map(city => (
        <option key={city.id} value={city.id}>
          {city.label}
        </option>
      ))}
    </Select>
  )
}

export default CitySelector
