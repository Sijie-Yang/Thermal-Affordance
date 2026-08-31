# Thermal Affordance — data guide

Eight-city TCIS VATA exports: Singapore, Hong Kong, Cape Town, Johannesburg,
Melbourne, New York, Rio de Janeiro and Tokyo. Exact record counts and download
SHA-256 checksums are listed in cities.json on the website.

Each city ZIP contains two GeoPackages, this guide, schema.json and LICENSE.txt:

- *_VATA_perception_points.gpkg: vata_points layer, street-view image locations
  and predicted thermal_affordance (VATA) values.
- *_VATA_hex.gpkg: vata_hex layer, H3 resolution 9 cells containing the mean
  VATA, point count and standard deviation of the points in each cell.

Coordinates use EPSG:4326 (longitude, latitude). Open GeoPackages in a GIS tool.
VATA represents visual thermal affordance; it is not an air-temperature reading
or a real-time measure of thermal comfort. Multiple images may share a location.
Street-view sampling coverage differs between cities. A missing cell is not zero.

## Map interpretation

Absolute uses the same continuous scale across cities, with reference thresholds
1.76 and 3.24. Within city uses the 5th, 15th, 50th, 85th and 95th percentiles
of the selected city's selected layer, clipping color beyond the end stops.
Identical colors in Within city mode do not imply identical scores across cities.
Hex percentiles rank each cell's mean among all cell means in that city, without
weighting by point count; tied values use the fraction of cells at or below them.
Hexes with few observations should be interpreted with caution.

## Citation

Yang, S., Chong, A., Liu, P., & Biljecki, F. (2025). Thermal comfort in sight:
Thermal affordance and its visual assessment for sustainable streetscape design.
Building and Environment, 271, 112569.

## Usage and licensing

See LICENSE.txt. No standalone data reuse license has been confirmed in this
repository. Availability for download does not itself grant reuse rights.
Confirm permission and relevant source-image terms with the research team.
