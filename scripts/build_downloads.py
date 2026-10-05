"""Rebuild downloadable ZIPs from existing GPKGs, or verify release assets.

Uses only Python's standard library; no access to the original parquet is needed.
Files larger than GitHub's 100 MB limit stay out of the repository. Their
download.url field points at a GitHub release asset, and --check accepts that
when the local file is absent.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import zipfile
import zlib

GITHUB_BLOB_LIMIT = 100 * 1024 * 1024


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def download_record(path, previous):
    record = {"file": path.name, "bytes": path.stat().st_size, "sha256": checksum(path)}
    if previous.get("url"):
        record["url"] = previous["url"]
    return record


def archive_matches(path, sources):
    with zipfile.ZipFile(path) as bundle:
        if set(bundle.namelist()) != {source.name for source in sources} or bundle.testzip():
            raise ValueError(f"Invalid or incomplete archive: {path}")
        for source in sources:
            if not source.is_file():
                raise ValueError(f"Missing source for archive check: {source}")
            entry = bundle.getinfo(source.name)
            if entry.file_size != source.stat().st_size or entry.CRC != zlib.crc32(source.read_bytes()):
                raise ValueError(f"Stale archive entry: {path} / {source.name}")


def require_file(path):
    if not path.is_file() or not path.stat().st_size:
        raise ValueError(f"Missing or empty data asset: {path}")


def build(data_dir, check=False):
    manifest_path = data_dir / "cities.json"
    manifest = json.loads(manifest_path.read_text())
    docs = [data_dir / name for name in ("README.md", "schema.json", "LICENSE.txt")]
    for path in docs:
        require_file(path)
    bundles = []
    all_sources = []
    for city in manifest["cities"]:
        sources = [data_dir / city[key] for key in ("point_gpkg", "hex_gpkg")]
        for path in (data_dir / city["hex_geojson"], data_dir / f'{city["city"]}_VATA_points.json', sources[1]):
            require_file(path)
        point = sources[0]
        if not check:
            require_file(point)
        bundles.append((f'{city["city"]}_VATA.zip', sources + docs, city))
        all_sources.extend(sources)
    bundles.append(("all_cities_VATA.zip", all_sources + docs, manifest))
    for name, sources, metadata in bundles:
        path = data_dir / name
        previous = metadata.get("download") or {}
        missing = [source for source in sources if not source.is_file()]
        if not check:
            if missing:
                raise ValueError(f"Missing or empty data asset: {missing[0]}")
            temporary = path.with_suffix(".zip.tmp")
            try:
                with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
                    for source in sources:
                        bundle.write(source, source.name)
                os.replace(temporary, path)
            finally:
                temporary.unlink(missing_ok=True)
        if path.is_file() and not missing:
            archive_matches(path, sources)
            expected = download_record(path, previous)
            if path.stat().st_size > GITHUB_BLOB_LIMIT and not expected.get("url"):
                raise ValueError(f"{name} exceeds GitHub's 100 MB limit; set download.url to a release asset")
            if check and previous != expected:
                raise ValueError(f"Outdated download metadata: {name}; run npm run data:build")
            metadata["download"] = expected
        elif check and path.is_file():
            expected = download_record(path, previous)
            if previous != expected:
                raise ValueError(f"Outdated download metadata: {name}; run npm run data:build")
        elif check and previous.get("url"):
            print(f"Verified {name} via {previous['url']}", flush=True)
            continue
        else:
            raise ValueError(f"Missing archive: {path}")
        print(f'{"Verified" if check else "Built"} {name} ({metadata["download"]["bytes"]:,} bytes)', flush=True)
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
