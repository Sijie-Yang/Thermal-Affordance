"""Attach street-view features to city point GeoPackages.

The website map keeps reading longitude, latitude and VATA only.
Feature columns are added to the downloadable vata_points layer.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from point_features import feature_columns

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA = ROOT / "static/data"
DEFAULT_FEATURES = Path("/Users/sijieyang/Documents/Heat-Resilience-In-Sight/data/svi_vata")
SINGAPORE_GPKG = Path("/Users/sijieyang/Documents/Thermal-Comfort-In-Sight/data/svi_sg_92233.gpkg")

CITY_CSV = {
    "hongkong": "svi_hk.csv",
    "capetown": "svi_capetown.csv",
    "johannesburg": "svi_jh.csv",
    "melbourne": "svi_melbourne.csv",
    "newyork": "svi_ny.csv",
    "rio": "svi_rio.csv",
    "tokyo": "svi_tokyo.csv",
}


RTREE_UPDATE_TRIGGERS = (
    (
        "rtree_vata_points_geom_update5",
        """CREATE TRIGGER "rtree_vata_points_geom_update5" AFTER UPDATE ON "vata_points" WHEN OLD."fid" != NEW."fid" AND (NEW."geom" NOTNULL AND NOT ST_IsEmpty(NEW."geom")) BEGIN DELETE FROM "rtree_vata_points_geom" WHERE id = OLD."fid"; INSERT OR REPLACE INTO "rtree_vata_points_geom" VALUES (NEW."fid",ST_MinX(NEW."geom"), ST_MaxX(NEW."geom"),ST_MinY(NEW."geom"), ST_MaxY(NEW."geom")); END""",
    ),
    (
        "rtree_vata_points_geom_update4",
        """CREATE TRIGGER "rtree_vata_points_geom_update4" AFTER UPDATE ON "vata_points" WHEN OLD."fid" != NEW."fid" AND (NEW."geom" ISNULL OR ST_IsEmpty(NEW."geom")) BEGIN DELETE FROM "rtree_vata_points_geom" WHERE id IN (OLD."fid", NEW."fid"); END""",
    ),
)


def _quote(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def load_frame(path: Path, columns: list[tuple[str, str, str, str]], table: str | None = None) -> pd.DataFrame:
    sources = ["image_id", *[source for source, _, _, _ in columns]]
    if table is None:
        frame = pd.read_csv(path, usecols=sources)
    else:
        selected = ", ".join(_quote(name) for name in sources)
        with sqlite3.connect(path) as source:
            frame = pd.read_sql(f"SELECT {selected} FROM {_quote(table)}", source)
    frame = frame.rename(columns={source: name for source, name, _, _ in columns})
    frame["image_id"] = frame["image_id"].astype(str)
    if frame["image_id"].duplicated().any():
        raise ValueError(f"Duplicate image_id in {path.name}")
    return frame


def attach_frame(gpkg: Path, frame: pd.DataFrame, columns: list[tuple[str, str, str, str]], label: str) -> None:
    connection = sqlite3.connect(gpkg)
    try:
        # These rtree triggers call SpatiaLite functions on any row update.
        paused = connection.execute(
            """
            SELECT name, sql FROM sqlite_master
            WHERE type = 'trigger'
              AND tbl_name = 'vata_points'
              AND sql LIKE '%AFTER UPDATE ON%'
            """
        ).fetchall()
        for name, _ in paused:
            connection.execute(f"DROP TRIGGER {_quote(name)}")
        existing = {row[1] for row in connection.execute("PRAGMA table_info(vata_points)")}
        point_ids = {
            row[0] for row in connection.execute("SELECT image_id FROM vata_points")
        }
        feature_ids = set(frame["image_id"])
        if point_ids != feature_ids:
            raise ValueError(
                f"{gpkg.name} does not match {label}: "
                f"points {len(point_ids)}, features {len(feature_ids)}, "
                f"overlap {len(point_ids & feature_ids)}"
            )
        for _, name, sql_type, _ in columns:
            if name not in existing:
                connection.execute(
                    f"ALTER TABLE vata_points ADD COLUMN {_quote(name)} {sql_type}"
                )
        connection.execute("DROP TABLE IF EXISTS _point_features")
        definitions = ", ".join(
            f"{_quote(name)} {sql_type}" for _, name, sql_type, _ in columns
        )
        connection.execute(
            f"CREATE TEMP TABLE _point_features (image_id TEXT PRIMARY KEY, {definitions})"
        )
        names = [name for _, name, _, _ in columns]
        placeholders = ", ".join(["?"] * (len(names) + 1))
        rows = frame[["image_id", *names]].itertuples(index=False, name=None)
        connection.executemany(
            f"INSERT INTO _point_features VALUES ({placeholders})",
            rows,
        )
        assignments = ", ".join(
            f"{_quote(name)} = _point_features.{_quote(name)}" for name in names
        )
        connection.execute(
            f"""
            UPDATE vata_points
            SET {assignments}
            FROM _point_features
            WHERE vata_points.image_id = _point_features.image_id
            """
        )
        # heading can be entirely null; use an image feature that is populated.
        filled = connection.execute(
            f"SELECT COUNT(*) FROM vata_points WHERE {_quote('seg_vegetation')} IS NOT NULL"
        ).fetchone()[0]
        if filled != len(frame):
            raise ValueError(f"{gpkg.name} attached features for {filled} of {len(frame)} points")
        connection.commit()
        present = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='trigger'")}
        for name, sql in paused:
            if name not in present:
                connection.execute(sql)
        for name, sql in RTREE_UPDATE_TRIGGERS:
            if name not in present:
                connection.execute(sql)
        connection.commit()
    finally:
        connection.close()
    print(f"Attached {len(columns)} fields to {gpkg.name} ({len(frame):,} points)", flush=True)


def attach_city(gpkg: Path, csv_path: Path, columns: list[tuple[str, str, str, str]]) -> None:
    attach_frame(gpkg, load_frame(csv_path, columns), columns, csv_path.name)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--features-dir", type=Path, default=DEFAULT_FEATURES)
    parser.add_argument("--singapore-gpkg", type=Path, default=SINGAPORE_GPKG)
    parser.add_argument("--only", choices=["singapore", *CITY_CSV], help="Attach one city")
    args = parser.parse_args()
    columns = feature_columns()
    if args.only in (None, "singapore"):
        frame = load_frame(args.singapore_gpkg, columns, table="svi_sg_92233")
        attach_frame(
            args.data_dir / "singapore_VATA_perception_points.gpkg",
            frame,
            columns,
            args.singapore_gpkg.name,
        )
    if args.only != "singapore":
        cities = CITY_CSV if args.only is None else {args.only: CITY_CSV[args.only]}
        for city, filename in cities.items():
            attach_city(
                args.data_dir / f"{city}_VATA_perception_points.gpkg",
                args.features_dir / filename,
                columns,
            )


if __name__ == "__main__":
    main()
