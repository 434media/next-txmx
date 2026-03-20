#!/usr/bin/env python3
"""
Scrape TDLR boxing results PDFs.

Fetches the public CSV at tdlr.texas.gov, filters for Boxing category
entries that have a results PDF link, downloads any PDFs not already
saved locally, and optionally runs the parser on each new file.

Usage:
  python3 scripts/tdlr-scrape-boxing.py                  # download only
  python3 scripts/tdlr-scrape-boxing.py --parse           # download + parse to JSON
  python3 scripts/tdlr-scrape-boxing.py --output ./pdfs   # custom output dir
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import sys
import urllib.request
import urllib.error
import urllib.parse

CSV_URL = "https://www.tdlr.texas.gov/sports/_events-list.csv"
BASE_URL = "https://www.tdlr.texas.gov"
DEFAULT_OUT = os.path.join(os.path.dirname(__file__), "..", "tdlr-downloads")


def fetch_csv() -> list[dict[str, str]]:
    """Download and parse the TDLR events CSV."""
    req = urllib.request.Request(CSV_URL, headers={"User-Agent": "TXMX-Scraper/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        text = resp.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


def filter_boxing(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    """Return only Boxing rows that have a PDF results link."""
    filtered = []
    for row in rows:
        category = (row.get("CATEGORY") or "").strip().lower()
        results = (row.get("RESULTS") or "").strip()
        if category == "boxing" and results and results.endswith(".pdf"):
            filtered.append(row)
    return filtered


def download_pdf(pdf_path: str, out_dir: str, force: bool = False) -> str | None:
    """Download a single PDF if not already on disk. Returns local path."""
    filename = os.path.basename(pdf_path).replace(" ", "-")
    local_path = os.path.join(out_dir, filename)

    if os.path.exists(local_path) and not force:
        return None  # already downloaded

    url = BASE_URL + urllib.parse.quote(pdf_path, safe="/:")
    req = urllib.request.Request(url, headers={"User-Agent": "TXMX-Scraper/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        with open(local_path, "wb") as f:
            f.write(data)
        return local_path
    except urllib.error.HTTPError as e:
        print(f"  ✗ HTTP {e.code} downloading {filename}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"  ✗ Error downloading {filename}: {e}", file=sys.stderr)
        return None


def parse_pdf(pdf_path: str) -> dict | None:
    """Parse a downloaded PDF using the existing TDLR parser."""
    script = os.path.join(os.path.dirname(__file__), "tdlr-extract.py")
    if not os.path.exists(script):
        print("  ✗ Parser script not found at", script, file=sys.stderr)
        return None

    import subprocess

    result = subprocess.run(
        [sys.executable, script, pdf_path],
        capture_output=True,
        text=True,
        timeout=30,
    )

    if result.returncode != 0 and not result.stdout.strip():
        print(f"  ✗ Parser failed: {result.stderr.strip()}", file=sys.stderr)
        return None

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"  ✗ Invalid JSON from parser", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="Scrape TDLR boxing results PDFs")
    parser.add_argument(
        "--output", "-o",
        default=DEFAULT_OUT,
        help="Directory to save downloaded PDFs (default: tdlr-downloads/)",
    )
    parser.add_argument(
        "--parse", "-p",
        action="store_true",
        help="Parse each new PDF to JSON after downloading",
    )
    parser.add_argument(
        "--json-output", "-j",
        default=None,
        help="Directory for parsed JSON files (default: same as --output)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Re-download even if PDF already exists locally",
    )
    args = parser.parse_args()

    out_dir = os.path.abspath(args.output)
    json_dir = os.path.abspath(args.json_output) if args.json_output else out_dir
    os.makedirs(out_dir, exist_ok=True)
    if args.parse:
        os.makedirs(json_dir, exist_ok=True)

    print(f"Fetching TDLR events CSV...")
    rows = fetch_csv()
    boxing = filter_boxing(rows)
    print(f"Found {len(boxing)} boxing events with results PDFs")

    new_count = 0
    skipped = 0

    for row in boxing:
        pdf_path = row["RESULTS"].strip()
        filename = os.path.basename(pdf_path)
        date = row.get("DATE", "").strip()
        promoter = row.get("PROMOTER", "").strip()
        location = row.get("LOCATION", "").strip()

        local_file = os.path.join(out_dir, filename.replace(" ", "-"))

        if os.path.exists(local_file) and not args.all:
            skipped += 1
            # Still parse existing files if --parse and JSON doesn't exist yet
            if args.parse:
                json_path = os.path.join(
                    json_dir, os.path.basename(local_file).replace(".pdf", ".json")
                )
                if not os.path.exists(json_path):
                    parsed = parse_pdf(local_file)
                    if parsed:
                        with open(json_path, "w") as f:
                            json.dump(parsed, f, indent=2)
                        bout_count = len(parsed.get("bouts", []))
                        print(f"  ✓ {date} | {promoter} → {bout_count} bouts parsed")
            continue

        print(f"  ↓ {date} | {promoter} | {location}")
        result = download_pdf(pdf_path, out_dir, force=args.all)
        if result:
            new_count += 1

            if args.parse:
                print(f"    Parsing {filename}...")
                parsed = parse_pdf(result)
                if parsed:
                    json_path = os.path.join(
                        json_dir, os.path.basename(result).replace(".pdf", ".json")
                    )
                    with open(json_path, "w") as f:
                        json.dump(parsed, f, indent=2)
                    bout_count = len(parsed.get("bouts", []))
                    print(f"    ✓ {bout_count} bouts parsed → {os.path.basename(json_path)}")

    print(f"\nDone: {new_count} new PDFs downloaded, {skipped} already on disk")


if __name__ == "__main__":
    main()
