"""Build website GPKG + hex GeoJSON from ual-chark TCIS parquet.

Run on ual-chark:

    python scripts/export_tcis_web.py \\
      --tcis-root /data/sijie/svi_data/tcis \\
      --out /data/sijie/svi_data/tcis/web
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from build_downloads import build
from point_features import feature_columns

import geopandas as gpd
import h3
import pandas as pd
from shapely.geometry import Point, Polygon

CITIES = {
    "singapore": {
        "parquet": "svi_sg_92233/predictions.parquet",
        "label": "Singapore",
        "center": [103.8198, 1.3521],
        "zoom": 11,
    },
    "hongkong": {
        "parquet": "svi_hk/predictions.parquet",
        "label": "Hong Kong",
        "center": [114.1694, 22.3193],
        "zoom": 11,
    },
    "capetown": {
        "parquet": "svi_capetown/predictions.parquet",
        "label": "Cape Town",
        "center": [18.4241, -33.9249],
        "zoom": 11,
    },
    "johannesburg": {
        "parquet": "svi_jh/predictions.parquet",
        "label": "Johannesburg",
        "center": [28.0473, -26.2041],
        "zoom": 11,
    },
    "melbourne": {
        "parquet": "svi_melbourne/predictions.parquet",
        "label": "Melbourne",
        "center": [144.9631, -37.8136],
        "zoom": 10,
    },
    "newyork": {
        "parquet": "svi_ny/predictions.parquet",
        "label": "New York",
        "center": [-74.006, 40.7128],
        "zoom": 11,
    },
    "rio": {
        "parquet": "svi_rio/predictions.parquet",
        "label": "Rio de Janeiro",
        "center": [-43.1729, -22.9068],
        "zoom": 11,
    },
    "tokyo": {
        "parquet": "svi_tokyo/predictions.parquet",
        "label": "Tokyo",
        "center": [139.6917, 35.6895],
        "zoom": 10,
    },
}

H3_RES = 9
POINT_COLS = ("image_id", "thermal_affordance", "longitude", "latitude")


def _hex_poly(cell: str) -> Polygon:
    ring = [(lng, lat) for lat, lng in h3.cell_to_boundary(cell)]
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    return Polygon(ring)


def export_city(parquet_path: Path, dest_dir: Path, city_id: str) -> dict:
    # Map JSON stays longitude/latitude/VATA. Extra columns go only into the point download.
    frame = pd.read_parquet(parquet_path)
    frame = frame.dropna(subset=["longitude", "latitude", "thermal_affordance"])
    attributes = {
        "image_id": frame["image_id"].astype(str),
        "VATA": frame["thermal_affordance"].astype(float),
    }
    for source, name, _, _ in feature_columns():
        if source in frame.columns:
            attributes[name] = frame[source]
    points = gpd.GeoDataFrame(
        attributes,
        geometry=[
            Point(lon, lat)
            for lon, lat in zip(frame["longitude"], frame["latitude"])
        ],
        crs="EPSG:4326",
    )
    web_rows = [
        [round(float(lon), 6), round(float(lat), 6), round(float(score), 3)]
        for lon, lat, score in zip(frame["longitude"], frame["latitude"], frame["thermal_affordance"])
    ]
    (dest_dir / f"{city_id}_VATA_points.json").write_text(
        json.dumps(web_rows, separators=(",", ":"), allow_nan=False), encoding="utf-8"
    )
    point_gpkg = dest_dir / f"{city_id}_VATA_perception_points.gpkg"
    points.to_file(point_gpkg, driver="GPKG", layer="vata_points")

    cells = [
        h3.latlng_to_cell(lat, lon, H3_RES)
        for lat, lon in zip(frame["latitude"], frame["longitude"])
    ]
    hex_frame = pd.DataFrame({"h3": cells, "VATA": frame["thermal_affordance"]})
    stats = (
        hex_frame.groupby("h3")["VATA"]
        .agg(VATA="mean", n="count", VATA_std="std")
        .reset_index()
    )
    hexes = gpd.GeoDataFrame(
        stats,
        geometry=[_hex_poly(cell) for cell in stats["h3"]],
        crs="EPSG:4326",
    )
    hex_geojson = dest_dir / f"{city_id}_VATA_hex.geojson"
    hex_gpkg = dest_dir / f"{city_id}_VATA_hex.gpkg"
    hexes.to_file(hex_geojson, driver="GeoJSON")
    hexes.to_file(hex_gpkg, driver="GPKG", layer="vata_hex")
    return {
        "city": city_id,
        "n_points": int(len(points)),
        "n_hex": int(len(hexes)),
        "vata_mean": float(points["VATA"].mean()),
        "point_gpkg": point_gpkg.name,
        "hex_geojson": hex_geojson.name,
        "hex_gpkg": hex_gpkg.name,
    }


def main(argv: list[str] | None = None) -> dict:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tcis-root", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args(argv)
    args.out.mkdir(parents=True, exist_ok=True)
    cities = []
    for city_id, meta in CITIES.items():
        src = args.tcis_root / meta["parquet"]
        print(f"export {city_id} {src}", flush=True)
        summary = export_city(src, args.out, city_id)
        summary.update({k: meta[k] for k in ("label", "center", "zoom")})
        cities.append(summary)
        print(summary, flush=True)
    manifest = {
        "h3_resolution": H3_RES,
        "score": "thermal_affordance (VATA)",
        "cities": cities,
    }
    (args.out / "cities.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    # Package from the same manifest used by the website, after exports finish.
    docs = Path(__file__).resolve().parents[1] / "static/data"
    for name in ("README.md", "schema.json", "LICENSE.txt"):
        if args.out.resolve() != docs.resolve():
            (args.out / name).write_bytes((docs / name).read_bytes())
    return build(args.out)



if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
