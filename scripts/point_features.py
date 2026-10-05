"""Street-view attributes stored on download points, not on the map."""

from __future__ import annotations

# 59 image features: segmentation, detection counts, colour/texture, scene.
IMAGE_FEATURES = (
    "seg_road",
    "seg_sidewalk",
    "seg_building",
    "seg_wall",
    "seg_fence",
    "seg_pole",
    "seg_traffic light",
    "seg_traffic sign",
    "seg_vegetation",
    "seg_terrain",
    "seg_sky",
    "seg_person",
    "seg_rider",
    "seg_car",
    "seg_truck",
    "seg_bus",
    "seg_train",
    "seg_motorcycle",
    "seg_bicycle",
    "det_person",
    "det_bicycle",
    "det_car",
    "det_motorcycle",
    "det_bus",
    "det_truck",
    "det_traffic light",
    "det_fire hydrant",
    "det_stop sign",
    "det_bench",
    "Colorfulness",
    "Canny_Edges",
    "Hue_Mean",
    "Hue_Std",
    "Saturation_Mean",
    "Saturation_Std",
    "Lightness_Mean",
    "Lightness_Std",
    "Contrast",
    "Sharpness",
    "Entropy",
    "Image_Variance",
    "scene_downtown",
    "scene_office_building",
    "scene_apartment_building/outdoor",
    "scene_residential_neighborhood",
    "scene_food_court",
    "scene_parking_lot",
    "scene_driveway",
    "scene_highway",
    "scene_plaza",
    "scene_market/outdoor",
    "scene_campus",
    "scene_promenade",
    "scene_field/wild",
    "scene_forest_path",
    "scene_forest/broadleaf",
    "scene_park",
    "scene_construction_site",
    "scene_industrial_area",
)

# Predicted visual-perceptual indicators. VATA itself stays in the VATA column.
VPI_FEATURES = (
    "visual_comfort",
    "temp_intensity",
    "sun_intensity",
    "humidity_inference",
    "wind_inference",
    "traffic_flow",
    "greenery_rate",
    "shading_area",
    "material_comfort",
    "imageability",
    "enclosure",
    "human_scale",
    "transparency",
    "complexity",
    "safe",
    "lively",
    "beautiful",
    "wealthy",
    "boring",
    "depressing",
    "thermal_comfort",
)

CONTEXT_FIELDS = (
    ("heading", "REAL", "Camera heading in degrees"),
    ("captured_at", "TEXT", "Street-view capture timestamp"),
    ("panorama_id", "TEXT", "Source panorama identifier"),
)

FEATURE_FIELDS = IMAGE_FEATURES + VPI_FEATURES


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
    for source in IMAGE_FEATURES:
        rows.append((source, gpkg_name(source), "REAL", "Image feature used by the VATA model"))
    for source in VPI_FEATURES:
        rows.append((source, gpkg_name(source), "REAL", "Predicted visual-perceptual indicator"))
    names = [name for _, name, _, _ in rows]
    if len(names) != len(set(names)):
        raise ValueError("Duplicate GeoPackage field names")
    return rows
