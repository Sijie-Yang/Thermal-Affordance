# Thermal Affordance — data guide

Eight-city TCIS VATA exports: Singapore, Hong Kong, Cape Town, Johannesburg,
Melbourne, New York, Rio de Janeiro and Tokyo. Exact record counts and download
SHA-256 checksums are listed in cities.json on the website.

Each city ZIP contains two GeoPackages, this guide, schema.json and LICENSE.txt:

- *_VATA_perception_points.gpkg: vata_points layer. The map shows VATA only.
  The download stores image features and predicted visual-perceptual
  indicators for every point in all eight cities. Each column is defined
  below and, in the same words, in schema.json.
- *_VATA_hex.gpkg: vata_hex layer, H3 resolution 9 cells containing the mean
  VATA, point count and standard deviation of the points in each cell. Hexes
  do not carry the point-level features.

Melbourne and the combined eight-city archive exceed GitHub's file-size limit.
The website links those two downloads to a GitHub release. The other city
archives in the repository contain the same full point tables.

Coordinates use EPSG:4326 (longitude, latitude). Open GeoPackages in a GIS tool.
VATA represents visual thermal affordance; it is not an air-temperature reading
or a real-time measure of thermal comfort. Multiple images may share a location.
Street-view sampling coverage differs between cities. A missing cell is not zero.

## Point columns

Names below are the GeoPackage columns. A source name that contained a space
or a slash is written with underscores. Those source names are also given in
schema.json.

`heading`, `captured_at`, and `panorama_id` record the camera heading in
degrees, the capture time, and the source panorama id. Any of them can be empty.

Image features come from DeepLabV3+ / Cityscapes segmentation, a Faster R-CNN /
COCO detector, OpenCV colour and texture statistics, and ResNet-50 / Places365
scene recognition.

### Segmentation proportions

Share of pixels in each Cityscapes-style class, about 0 to 1.

| Column | Meaning |
|--------|---------|
| `seg_road` | Roads and paved paths for vehicles |
| `seg_sidewalk` | Pedestrian pathways |
| `seg_building` | Buildings |
| `seg_wall` | Vertical concrete barriers |
| `seg_fence` | Wood or metal fences |
| `seg_pole` | Poles |
| `seg_traffic_light` | Traffic lights |
| `seg_traffic_sign` | Traffic signs |
| `seg_vegetation` | Plants, trees, and bushes |
| `seg_terrain` | Bare ground, soil, or rocks |
| `seg_sky` | Sky |
| `seg_person` | People |
| `seg_rider` | Riders |
| `seg_car` | Cars |
| `seg_truck` | Trucks |
| `seg_bus` | Buses |
| `seg_train` | Trains |
| `seg_motorcycle` | Motorcycles |
| `seg_bicycle` | Bicycles |

### Object counts

Integer counts from a COCO-style detector.

| Column | Meaning |
|--------|---------|
| `det_person` | Persons |
| `det_bicycle` | Bicycles |
| `det_car` | Cars |
| `det_motorcycle` | Motorcycles |
| `det_bus` | Buses |
| `det_truck` | Trucks |
| `det_traffic_light` | Traffic lights |
| `det_fire_hydrant` | Fire hydrants |
| `det_stop_sign` | Stop signs |
| `det_bench` | Benches |

### Colour and texture

| Column | Meaning |
|--------|---------|
| `Colorfulness` | Colour richness |
| `Canny_Edges` | Edge-pixel ratio from a Canny edge detector |
| `Hue_Mean` | Mean hue |
| `Hue_Std` | Standard deviation of hue |
| `Saturation_Mean` | Mean saturation |
| `Saturation_Std` | Standard deviation of saturation |
| `Lightness_Mean` | Mean lightness |
| `Lightness_Std` | Standard deviation of lightness |
| `Contrast` | Difference between light and dark intensity |
| `Sharpness` | Texture clarity |
| `Entropy` | Texture randomness |
| `Image_Variance` | Variance of grayscale pixel values |

### Scene probabilities

Selected Places365 scene probabilities, about 0 to 1. These are not all 365
scene classes.

| Column | Meaning |
|--------|---------|
| `scene_downtown` | Central business district |
| `scene_office_building` | Office buildings |
| `scene_apartment_building_outdoor` | Outdoor view of apartments |
| `scene_residential_neighborhood` | Residential neighbourhood |
| `scene_food_court` | Food court or dining area |
| `scene_parking_lot` | Parking lot |
| `scene_driveway` | Driveway |
| `scene_highway` | Highway |
| `scene_plaza` | Plaza or public square |
| `scene_market_outdoor` | Outdoor market |
| `scene_campus` | Campus grounds |
| `scene_promenade` | Promenade or walkway |
| `scene_field_wild` | Open natural land |
| `scene_forest_path` | Forest path |
| `scene_forest_broadleaf` | Broadleaf forest |
| `scene_park` | Park |
| `scene_construction_site` | Construction site |
| `scene_industrial_area` | Industrial area |

### Predicted indicators

Model predictions on about a 0–5 scale. A higher value means a stronger
perceived presence of that quality. Scores can fall slightly outside 0–5.
They are not the answers from the 500-image survey.

`VATA` and `thermal_comfort` are the same score: the perceived outdoor thermal
comfort potential of the streetscape. `VATA` is not an air-temperature reading.

| Column | Meaning |
|--------|---------|
| `visual_comfort` | Overall visual comfort. This is the city-scale name for the survey dimension comfort |
| `temp_intensity` | Perceived outdoor temperature |
| `sun_intensity` | Perceived sunlight intensity |
| `humidity_inference` | Perceived humidity |
| `wind_inference` | Perceived wind |
| `traffic_flow` | Perceived traffic volume |
| `greenery_rate` | Perceived amount of greenery |
| `shading_area` | Perceived shaded area |
| `material_comfort` | Perceived comfort of surfaces and materials |
| `imageability` | How memorable or distinctive the place looks |
| `enclosure` | How enclosed the space feels |
| `human_scale` | How human-scaled the streetscape feels |
| `transparency` | How visually open the streetscape feels |
| `complexity` | How visually or spatially complex the environment feels |
| `safe` | How safe the place looks |
| `lively` | How lively the place looks |
| `beautiful` | How beautiful the place looks |
| `wealthy` | How wealthy or well-maintained the place looks |
| `boring` | How boring the place looks |
| `depressing` | How depressing the place looks |
| `thermal_comfort` | Same score as `VATA` |

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
