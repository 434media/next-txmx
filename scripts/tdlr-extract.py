#!/usr/bin/env python3
"""
Extract structured data from TDLR boxing results PDFs.
Outputs JSON to stdout for consumption by the Node.js admin import tool.

Usage: python3 scripts/tdlr-extract.py <path-to-pdf>

Requires: pip install pdfplumber
"""

from __future__ import annotations

import sys
import json
import pdfplumber


def extract_header(text: str, tables: list) -> dict:
    """Extract event metadata from the PDF text and table data."""
    import re
    header = {
        "date": "",
        "eventNumber": "",
        "city": "",
        "promoter": "",
        "venue": "",
        "address": "",
        "referees": [],
        "judges": [],
    }

    m = re.search(r"Date:\s*(\d{2}/\d{2}/\d{2,4})", text)
    if m:
        parts = m.group(1).split("/")
        year = f"20{parts[2]}" if len(parts[2]) == 2 else parts[2]
        header["date"] = f"{year}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"

    m = re.search(r"Event\s*#:\s*(\d+)", text)
    if m:
        header["eventNumber"] = m.group(1)

    m = re.search(r"City:\s*([A-Za-z\s]+?)(?=\s+Promoter)", text)
    if m:
        header["city"] = m.group(1).strip()

    m = re.search(r"Promoter:\s*([A-Za-z\s]+?)(?=\s+Judges|\n)", text)
    if m:
        header["promoter"] = m.group(1).strip()

    # Extract judge names from table header to strip from venue string
    judge_names = []
    if tables:
        for row in tables[0][:5]:
            for cell in row:
                if cell and "Judges:" in cell:
                    lines = cell.replace("Judges:", "").strip().split("\n")
                    judge_names = [n.strip() for n in lines if n.strip()]

    m = re.search(r"Location:\s*(.+?)(?=\n)", text)
    if m:
        venue = m.group(1).strip()
        # Remove judge names that bleed into the venue line
        for name in judge_names:
            venue = venue.replace(name, "").strip()
        header["venue"] = venue

    m = re.search(r"Location:\s*.+?\n(.+?\d{5})(?=\s|$)", text)
    if m:
        header["address"] = m.group(1).strip()

    return header


def safe_get(row: list, idx: int) -> str | None:
    """Safely get a value from a row by index."""
    return row[idx] if idx < len(row) else None


def parse_table_row(row: list) -> dict:
    """Parse a single table row into a structured dict."""
    return {
        "boutRef": safe_get(row, 0),
        "nameCity": safe_get(row, 1),
        "boxerId": safe_get(row, 2),
        "txLicense": safe_get(row, 3),
        "extra": safe_get(row, 4),
        "weight": safe_get(row, 5),
        "rounds": safe_get(row, 6),
        "results": safe_get(row, 7),
        "suspension": safe_get(row, 9),
    }


def parse_fighter(row_data: dict) -> dict:
    """Extract fighter info from a parsed row."""
    name_city = (row_data["nameCity"] or "").split("\n")
    name = name_city[0].strip() if len(name_city) > 0 else ""
    location = name_city[1].strip() if len(name_city) > 1 else ""

    city, state = "", ""
    if "," in location:
        parts = location.split(",")
        city = parts[0].strip()
        state = parts[1].strip() if len(parts) > 1 else ""

    # Boxer ID: second line of the boxerId field
    boxer_id_lines = (row_data["boxerId"] or "").split("\n")
    boxer_id = boxer_id_lines[1].strip() if len(boxer_id_lines) > 1 else ""

    weight_str = (row_data["weight"] or "").strip()
    weight = 0.0
    try:
        weight = float(weight_str)
    except (ValueError, TypeError):
        pass

    return {
        "name": name,
        "city": city,
        "state": state,
        "boxerId": boxer_id,
        "weight": weight,
    }


def parse_bout(fighter1_row: dict, fighter2_row: dict) -> dict:
    """Parse a bout from two fighter rows."""
    import re

    # Bout number and referee from boutRef field: "1\nPerez"
    bout_ref = (fighter1_row["boutRef"] or "").split("\n")
    bout_number = 0
    referee = ""
    if len(bout_ref) > 0:
        try:
            bout_number = int(bout_ref[0].strip())
        except ValueError:
            pass
    if len(bout_ref) > 1:
        referee = bout_ref[1].strip()

    # Rounds
    rounds = 0
    rounds_str = (fighter1_row["rounds"] or "").strip()
    try:
        rounds = int(rounds_str)
    except (ValueError, TypeError):
        pass

    # Results
    results_raw = (fighter1_row["results"] or "").strip()
    results_lines = results_raw.split("\n")

    result = results_lines[0].strip() if results_lines else ""
    method = ""
    scores = []
    tko_detail = ""

    # Parse method from result line
    m = re.search(r"by\s+(Decision|Tko|Ko|Rtd|Dq|Nc|Draw)", result, re.IGNORECASE)
    if m:
        method = m.group(1)

    # Parse scores and TKO details from remaining lines
    for line in results_lines[1:]:
        line = line.strip()
        if not line:
            continue
        # TKO round detail: "2:47 of Round 1"
        if re.search(r"\d+:\d+\s+of\s+Round", line, re.IGNORECASE):
            tko_detail = line
        # Judge score: "Novoa 58-56"
        elif re.match(r"[A-Za-z]+\s+\d+-\d+", line):
            scores.append(line)

    if tko_detail:
        result = f"{result} / {tko_detail}"

    # Weight class / title from extra field
    extra = (fighter1_row["extra"] or "").strip()
    weight_class = ""
    title_fight = ""
    if extra:
        extra_lines = extra.split("\n")
        for el in extra_lines:
            el = el.strip()
            if not el:
                continue
            if "title" in el.lower():
                title_fight = el
            elif el.lower() in [
                "heavyweight", "cruiserweight", "light heavyweight",
                "super middleweight", "middleweight", "super welterweight",
                "welterweight", "super lightweight", "lightweight",
                "super featherweight", "featherweight", "super bantamweight",
                "bantamweight", "super flyweight", "flyweight",
                "light flyweight", "minimumweight",
            ]:
                weight_class = el.lower()
            else:
                # Could be weight class with different casing
                weight_class = el.lower()

    fighter1 = parse_fighter(fighter1_row)
    fighter2 = parse_fighter(fighter2_row)

    return {
        "boutNumber": bout_number,
        "referee": referee,
        "fighter1": fighter1,
        "fighter2": fighter2,
        "rounds": rounds,
        "result": result,
        "method": normalize_method(method),
        "scores": scores,
        "weightClass": weight_class if weight_class else None,
        "titleFight": title_fight if title_fight else None,
    }


def normalize_method(method: str) -> str:
    m = method.lower()
    mapping = {
        "decision": "UD",
        "tko": "TKO",
        "ko": "KO",
        "rtd": "RTD",
        "dq": "DQ",
        "nc": "NC",
        "draw": "Draw",
    }
    return mapping.get(m, method.upper())


def extract_tdlr_pdf(pdf_path: str) -> dict:
    """Main extraction function. Returns structured event data."""
    pdf = pdfplumber.open(pdf_path)

    all_bouts = []
    header = {}

    for page in pdf.pages:
        text = page.extract_text() or ""
        tables = page.extract_tables()

        # Extract header from first page only
        if page.page_number == 1:
            header = extract_header(text, tables)

        # Process tables
        for table in tables:
            # Skip header rows (find the row with "Bout #")
            data_start = 0
            for i, row in enumerate(table):
                cell0 = (row[0] or "").strip()
                if "Bout #" in cell0 or "Bout#" in cell0:
                    data_start = i + 1
                    break

            # Table rows come in pairs: fighter1 (with bout#), fighter2 (null bout#)
            i = data_start
            while i < len(table) - 1:
                row1 = table[i]
                row2 = table[i + 1]

                # Fighter 1 row has bout# in first cell, Fighter 2 has null/empty
                bout_ref = (row1[0] or "").strip()
                if not bout_ref:
                    i += 1
                    continue

                row1_data = parse_table_row(row1)
                row2_data = parse_table_row(row2)
                bout = parse_bout(row1_data, row2_data)
                all_bouts.append(bout)
                i += 2

    result = {
        "date": header.get("date", ""),
        "eventNumber": header.get("eventNumber", ""),
        "city": header.get("city", ""),
        "promoter": header.get("promoter", ""),
        "venue": header.get("venue", ""),
        "address": header.get("address", ""),
        "bouts": all_bouts,
    }

    pdf.close()
    return result


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python3 tdlr-extract.py <pdf-path>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    try:
        data = extract_tdlr_pdf(pdf_path)
        print(json.dumps(data, indent=2))
    except Exception as e:
        # Exit 0 so Node.js execSync doesn't throw — error is in the JSON
        print(json.dumps({"error": str(e)}))
        sys.exit(0)
