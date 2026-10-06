"""Street-view attributes stored on download points, not on the map."""

from __future__ import annotations

# 59 image features: segmentation, detection counts, colour/texture, scene.
# Descriptions follow the TCIS column dictionary (paper Appendix C).
IMAGE_FEATURES = (
    ("seg_road", "Pixel share of roads and paved paths for vehicles"),
    ("seg_sidewalk", "Pixel share of pedestrian pathways"),
    ("seg_building", "Pixel share of buildings"),
    ("seg_wall", "Pixel share of vertical concrete barriers"),
    ("seg_fence", "Pixel share of wood or metal fences"),
    ("seg_pole", "Pixel share of poles"),
    ("seg_traffic light", "Pixel share of traffic lights"),
    ("seg_traffic sign", "Pixel share of traffic signs"),
    ("seg_vegetation", "Pixel share of plants, trees, and bushes"),
    ("seg_terrain", "Pixel share of bare ground, soil, or rocks"),
    ("seg_sky", "Pixel share of sky"),
    ("seg_person", "Pixel share of people"),
    ("seg_rider", "Pixel share of riders"),
    ("seg_car", "Pixel share of cars"),
    ("seg_truck", "Pixel share of trucks"),
    ("seg_bus", "Pixel share of buses"),
    ("seg_train", "Pixel share of trains"),
    ("seg_motorcycle", "Pixel share of motorcycles"),
    ("seg_bicycle", "Pixel share of bicycles"),
    ("det_person", "Number of detected persons"),
    ("det_bicycle", "Number of detected bicycles"),
    ("det_car", "Number of detected cars"),
    ("det_motorcycle", "Number of detected motorcycles"),
    ("det_bus", "Number of detected buses"),
    ("det_truck", "Number of detected trucks"),
    ("det_traffic light", "Number of detected traffic lights"),
    ("det_fire hydrant", "Number of detected fire hydrants"),
    ("det_stop sign", "Number of detected stop signs"),
    ("det_bench", "Number of detected benches"),
    ("Colorfulness", "Colour richness"),
    ("Canny_Edges", "Edge-pixel ratio from a Canny edge detector"),
    ("Hue_Mean", "Mean hue"),
    ("Hue_Std", "Standard deviation of hue"),
    ("Saturation_Mean", "Mean saturation"),
    ("Saturation_Std", "Standard deviation of saturation"),
    ("Lightness_Mean", "Mean lightness"),
    ("Lightness_Std", "Standard deviation of lightness"),
    ("Contrast", "Difference between light and dark intensity"),
    ("Sharpness", "Texture clarity"),
    ("Entropy", "Texture randomness"),
    ("Image_Variance", "Variance of grayscale pixel values"),
    ("scene_downtown", "Places365 probability of a central business district"),
    ("scene_office_building", "Places365 probability of office buildings"),
    ("scene_apartment_building/outdoor", "Places365 probability of an outdoor apartment view"),
    ("scene_residential_neighborhood", "Places365 probability of a residential neighbourhood"),
    ("scene_food_court", "Places365 probability of a food court or dining area"),
    ("scene_parking_lot", "Places365 probability of a parking lot"),
    ("scene_driveway", "Places365 probability of a driveway"),
    ("scene_highway", "Places365 probability of a highway"),
    ("scene_plaza", "Places365 probability of a plaza or public square"),
    ("scene_market/outdoor", "Places365 probability of an outdoor market"),
    ("scene_campus", "Places365 probability of campus grounds"),
    ("scene_promenade", "Places365 probability of a promenade or walkway"),
    ("scene_field/wild", "Places365 probability of open natural land"),
    ("scene_forest_path", "Places365 probability of a forest path"),
    ("scene_forest/broadleaf", "Places365 probability of broadleaf forest"),
    ("scene_park", "Places365 probability of a park"),
    ("scene_construction_site", "Places365 probability of a construction site"),
    ("scene_industrial_area", "Places365 probability of an industrial area"),
)

# Predicted visual-perceptual indicators. VATA itself stays in the VATA column.
# Higher means a stronger perceived presence of that quality, on about a 0–5 scale.
VPI_FEATURES = (
    ("visual_comfort", "Predicted overall visual comfort. City-scale name for the survey dimension comfort"),
    ("temp_intensity", "Predicted outdoor temperature"),
    ("sun_intensity", "Predicted sunlight intensity"),
    ("humidity_inference", "Predicted humidity"),
    ("wind_inference", "Predicted wind"),
    ("traffic_flow", "Predicted traffic volume"),
    ("greenery_rate", "Predicted amount of greenery"),
    ("shading_area", "Predicted shaded area"),
    ("material_comfort", "Predicted comfort of surfaces and materials"),
    ("imageability", "Predicted memorability or distinctiveness of the place"),
    ("enclosure", "Predicted feeling of enclosure"),
    ("human_scale", "Predicted human scale of the streetscape"),
    ("transparency", "Predicted visual openness of the streetscape"),
    ("complexity", "Predicted visual or spatial complexity"),
    ("safe", "Predicted safety of the place"),
    ("lively", "Predicted liveliness of the place"),
    ("beautiful", "Predicted beauty of the place"),
    ("wealthy", "Predicted wealth or upkeep of the place"),
    ("boring", "Predicted boredom of the place"),
    ("depressing", "Predicted how depressing the place looks"),
    ("thermal_comfort", "Same predicted VATA score as the VATA column: perceived outdoor thermal comfort potential of the streetscape"),
)

CONTEXT_FIELDS = (
    ("heading", "REAL", "Camera heading in degrees"),
    ("captured_at", "TEXT", "Street-view capture timestamp"),
    ("panorama_id", "TEXT", "Source panorama identifier"),
)

FEATURE_FIELDS = tuple(source for source, _description in IMAGE_FEATURES + VPI_FEATURES)


def gpkg_name(source: str) -> str:
    """GeoPackage-safe name. Spaces and slashes in the source tables are flattened."""
    chars = []
    previous_break = False
    for char in source:
        if char.isalnum():
            chars.append(char)
            previous_break = False
        elif not previous_break:
            chars.append("_")
            previous_break = True
    return "".join(chars).strip("_")


def feature_columns() -> list[tuple[str, str, str, str]]:
    """Return source name, GeoPackage name, SQL type, and description."""
    rows = []
    for source, sql_type, description in CONTEXT_FIELDS:
        rows.append((source, gpkg_name(source), sql_type, description))
    for source, description in IMAGE_FEATURES:
        rows.append((source, gpkg_name(source), "REAL", description))
    for source, description in VPI_FEATURES:
        rows.append((source, gpkg_name(source), "REAL", description))
    names = [name for _, name, _, _ in rows]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate GeoPackage field names")
    return rows
