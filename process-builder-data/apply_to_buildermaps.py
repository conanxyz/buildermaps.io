#!/usr/bin/env python3
"""
Apply a CSV update to this repo's split data structure WITHOUT deleting anything.

What it does:
- Create/update project JSON files in: public/data/projects/{projectId}.json
- Create/update map JSON files in:     public/data/maps/{sectorSlug}.json
- Only adds/updates entries referenced by the CSV
- Never removes existing projects or map entries

CSV columns (case-insensitive):
Required: name, sector, type, website
Optional: x/twitter, github, description
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path


def slugify_repo(text: str) -> str:
    """Match repo conventions (same as scripts/process-issue.js)."""
    text = (text or "").lower()
    text = text.replace("&", "and")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def apply_csv(csv_file: Path, repo_root: Path) -> None:
    projects_dir = repo_root / "public" / "data" / "projects"
    maps_dir = repo_root / "public" / "data" / "maps"

    if not csv_file.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_file}")

    with csv_file.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        raise ValueError("CSV has no rows")

    # Case-insensitive header mapping
    headers = {k.lower(): k for k in rows[0].keys()}

    def get(row: dict, field: str) -> str:
        key = headers.get(field.lower())
        return (row.get(key, "") if key else "") or ""

    updated_projects = 0
    updated_maps = 0

    for row in rows:
        name = get(row, "name").strip()
        sector = get(row, "sector").strip()
        type_name = get(row, "type").strip()
        website = get(row, "website").strip()

        if not name or not sector or not type_name or not website:
            raise ValueError(
                f"Missing required fields (name/sector/type/website) in row: {row}"
            )

        twitter = (get(row, "x").strip() or get(row, "twitter").strip())
        github = get(row, "github").strip()
        description = get(row, "description").strip()

        project_id = slugify_repo(name)
        if not project_id:
            raise ValueError(f"Could not compute project id from name: {name}")

        # ---- projects ----
        project_path = projects_dir / f"{project_id}.json"
        if project_path.exists():
            project = load_json(project_path)
        else:
            project = {"id": project_id}

        project["id"] = project_id
        project["name"] = name

        if description:
            project["description"] = description
        else:
            # Keep existing description if present; otherwise add a safe placeholder
            project.setdefault("description", f"{name} - crypto project")

        # Merge links (update only fields present in CSV; preserve other link fields)
        links = project.get("links") if isinstance(project.get("links"), dict) else {}

        if website:
            links["homepage"] = website
        if twitter:
            links["twitter"] = twitter
        if github:
            links["github"] = github

        if links:
            project["links"] = links

        write_json(project_path, project)
        updated_projects += 1

        # ---- maps ----
        sector_slug = slugify_repo(sector)
        if not sector_slug:
            raise ValueError(f"Could not compute sector slug from sector: {sector}")

        map_path = maps_dir / f"{sector_slug}.json"
        if map_path.exists():
            map_data = load_json(map_path)
        else:
            map_data = {"sector": sector, "types": []}

        # Ensure canonical sector display name is preserved for existing maps
        map_data.setdefault("sector", sector)
        if not isinstance(map_data.get("types"), list):
            map_data["types"] = []

        type_id = slugify_repo(type_name)
        type_entry = None
        for t in map_data["types"]:
            if isinstance(t, dict) and t.get("id") == type_id:
                type_entry = t
                break

        if type_entry is None:
            type_entry = {"id": type_id, "name": type_name, "projects": []}
            map_data["types"].append(type_entry)

        if not isinstance(type_entry.get("projects"), list):
            type_entry["projects"] = []

        if project_id not in type_entry["projects"]:
            type_entry["projects"].append(project_id)
            type_entry["projects"].sort()

        write_json(map_path, map_data)
        updated_maps += 1

    print(f"Applied CSV: {csv_file}")
    print(f"Updated/created project files: {updated_projects}")
    print(f"Updated/created map files: {updated_maps}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Apply CSV changes into buildermaps.io public/data (merge, no deletions)."
    )
    parser.add_argument("csv_file", help="Path to the input CSV file")
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repo root path (default: current working directory)",
    )
    args = parser.parse_args()

    try:
        apply_csv(Path(args.csv_file).resolve(), Path(args.repo_root).resolve())
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

