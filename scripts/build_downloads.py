"""Rebuild downloadable ZIPs from existing GPKGs, or verify release assets.

Uses only Python's standard library; no access to the original parquet is needed.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import zipfile
import zlib


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(data_dir, check=False):
    manifest_path = data_dir / "cities.json"
    manifest = json.loads(manifest_path.read_text())
    docs = [data_dir / name for name in ("README.md", "schema.json", "LICENSE.txt")]
    bundles = []
    all_sources = []
    for city in manifest["cities"]:
        sources = [data_dir / city[key] for key in ("point_gpkg", "hex_gpkg")]
        for path in sources + [data_dir / city["hex_geojson"], data_dir / f'{city["city"]}_VATA_points.json'] + docs:
            if not path.is_file() or not path.stat().st_size:
                raise ValueError(f"Missing or empty data asset: {path}")
        name = f'{city["city"]}_VATA.zip'
        bundles.append((name, sources + docs, city))
        all_sources.extend(sources)
    bundles.append(("all_cities_VATA.zip", all_sources + docs, manifest))
    for name, sources, metadata in bundles:
        path = data_dir / name
        if not check:
            temporary = path.with_suffix(".zip.tmp")
            try:
                with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
                    for source in sources:
                        bundle.write(source, source.name)
                os.replace(temporary, path)
            finally:
                temporary.unlink(missing_ok=True)
        with zipfile.ZipFile(path) as bundle:
            if set(bundle.namelist()) != {p.name for p in sources} or bundle.testzip():
                raise ValueError(f"Invalid or incomplete archive: {path}")
            for source in sources:
                entry = bundle.getinfo(source.name)
                if entry.file_size != source.stat().st_size or entry.CRC != zlib.crc32(source.read_bytes()):
                    raise ValueError(f"Stale archive entry: {path} / {source.name}")
        expected = {"file": name, "bytes": path.stat().st_size, "sha256": checksum(path)}
        if check and metadata.get("download") != expected:
            raise ValueError(f"Outdated download metadata: {name}; run npm run data:build")
        metadata["download"] = expected
        print(f'{"Verified" if check else "Built"} {name} ({expected["bytes"]:,} bytes)', flush=True)
    if not check:
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path(__file__).resolve().parents[1] / "static/data")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        build(args.data_dir, args.check)
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Data validation failed: {error}\n")
