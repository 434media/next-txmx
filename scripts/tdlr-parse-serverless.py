"""
TDLR (Texas Dept of Licensing and Regulation) boxing results PDF parser.

Vercel Python Serverless Function — accepts a PDF upload and returns
structured event/bout JSON for the TXMX admin import tool.
"""

from http.server import BaseHTTPRequestHandler
import json
import tempfile
import os
import re


def extract_header(text, tables):
    """Extract event metadata from the PDF text and table data."""
    header = {
        "date": "",
        "eventNumber": "",
        "city": "",
        "promoter": "",
        "venue": "",
        "address": "",
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
        for name in judge_names:
            venue = venue.replace(name, "").strip()
        header["venue"] = venue

    m = re.search(r"Location:\s*.+?\n(.+?\d{5})(?=\s|$)", text)
    if m:
        header["address"] = m.group(1).strip()

    return header


def parse_fighter(row_data):
    """Extract fighter info from a parsed table row."""
    name_city = (row_data.get("nameCity") or "").split("\n")
    name = name_city[0].strip() if len(name_city) > 0 else ""
    location = name_city[1].strip() if len(name_city) > 1 else ""

    city, state = "", ""
    if "," in location:
        parts = location.split(",")
        city = parts[0].strip()
        state = parts[1].strip() if len(parts) > 1 else ""

    boxer_id_lines = (row_data.get("boxerId") or "").split("\n")
    boxer_id = boxer_id_lines[1].strip() if len(boxer_id_lines) > 1 else ""

    weight = 0.0
    try:
        weight = float((row_data.get("weight") or "").strip())
    except (ValueError, TypeError):
        pass

    return {
        "name": name,
        "city": city,
        "state": state,
        "boxerId": boxer_id,
        "weight": weight,
    }


def normalize_method(method):
    mapping = {
        "decision": "UD",
        "tko": "TKO",
        "ko": "KO",
        "rtd": "RTD",
        "dq": "DQ",
        "nc": "NC",
        "draw": "Draw",
    }
    return mapping.get(method.lower(), method.upper())


def parse_bout(f1_row, f2_row):
    """Parse a bout from two fighter table rows."""
    bout_ref = (f1_row[0] or "").split("\n")
    bout_number = 0
    referee = ""
    if len(bout_ref) > 0:
        try:
            bout_number = int(bout_ref[0].strip())
        except ValueError:
            pass
    if len(bout_ref) > 1:
        referee = bout_ref[1].strip()

    rounds = 0
    try:
        rounds = int((f1_row[6] or "").strip())
    except (ValueError, TypeError):
        pass

    results_raw = (f1_row[7] or "").strip()
    results_lines = results_raw.split("\n")
    result = results_lines[0].strip() if results_lines else ""
    method = ""
    scores = []

    m = re.search(r"by\s+(Decision|Tko|Ko|Rtd|Dq|Nc|Draw)", result, re.IGNORECASE)
    if m:
        method = m.group(1)

    for line in results_lines[1:]:
        line = line.strip()
        if not line:
            continue
        if re.search(r"\d+:\d+\s+of\s+Round", line, re.IGNORECASE):
            result = f"{result} / {line}"
        elif re.match(r"[A-Za-z]+\s+\d+-\d+", line):
            scores.append(line)

    extra = (f1_row[4] or "").strip()
    weight_class = None
    title_fight = None
    if extra:
        for el in extra.split("\n"):
            el = el.strip()
            if not el:
                continue
            if "title" in el.lower():
                title_fight = el
            else:
                weight_class = el.lower()

    f1_data = {
        "nameCity": f1_row[1],
        "boxerId": f1_row[2],
        "weight": f1_row[5],
    }
    f2_data = {
        "nameCity": f2_row[1],
        "boxerId": f2_row[2],
        "weight": f2_row[5],
    }

    return {
        "boutNumber": bout_number,
        "referee": referee,
        "fighter1": parse_fighter(f1_data),
        "fighter2": parse_fighter(f2_data),
        "rounds": rounds,
        "result": result,
        "method": normalize_method(method),
        "scores": scores,
        "weightClass": weight_class,
        "titleFight": title_fight,
    }


def extract_tdlr_pdf(pdf_path):
    """Main extraction: parse TDLR PDF into structured event data."""
    import pdfplumber

    pdf = pdfplumber.open(pdf_path)
    header = {}
    all_bouts = []

    for page in pdf.pages:
        text = page.extract_text() or ""
        tables = page.extract_tables()

        if page.page_number == 1:
            header = extract_header(text, tables)

        for table in tables:
            data_start = 0
            for i, row in enumerate(table):
                if (row[0] or "").strip().startswith("Bout"):
                    data_start = i + 1
                    break

            i = data_start
            while i < len(table) - 1:
                row1 = table[i]
                row2 = table[i + 1]

                if not (row1[0] or "").strip():
                    i += 1
                    continue

                bout = parse_bout(row1, row2)
                all_bouts.append(bout)
                i += 2

    pdf.close()

    return {
        "date": header.get("date", ""),
        "eventNumber": header.get("eventNumber", ""),
        "city": header.get("city", ""),
        "promoter": header.get("promoter", ""),
        "venue": header.get("venue", ""),
        "address": header.get("address", ""),
        "bouts": all_bouts,
    }


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_type = self.headers.get("Content-Type", "")
        content_length = int(self.headers.get("Content-Length", 0))

        if content_length == 0:
            self._send_json(400, {"error": "No PDF data provided"})
            return

        if content_length > 10 * 1024 * 1024:
            self._send_json(400, {"error": "File too large (max 10MB)"})
            return

        body = self.rfile.read(content_length)

        # Handle multipart form data
        if "multipart/form-data" in content_type:
            pdf_bytes = self._extract_multipart(body, content_type)
            if pdf_bytes is None:
                self._send_json(400, {"error": "No PDF file found in form data"})
                return
        elif "application/pdf" in content_type:
            pdf_bytes = body
        else:
            # Try treating as raw PDF
            pdf_bytes = body

        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
        try:
            os.write(tmp_fd, pdf_bytes)
            os.close(tmp_fd)
            result = extract_tdlr_pdf(tmp_path)
            self._send_json(200, result)
        except Exception as e:
            self._send_json(500, {"error": str(e)})
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    def _extract_multipart(self, body, content_type):
        """Extract PDF bytes from multipart form data."""
        boundary = None
        for part in content_type.split(";"):
            part = part.strip()
            if part.startswith("boundary="):
                boundary = part[9:].strip().strip('"')
                break

        if not boundary:
            return None

        boundary_bytes = boundary.encode()
        parts = body.split(b"--" + boundary_bytes)

        for part in parts:
            if b"filename=" in part and (b"application/pdf" in part or b".pdf" in part):
                # Find the blank line separating headers from content
                header_end = part.find(b"\r\n\r\n")
                if header_end != -1:
                    data = part[header_end + 4:]
                    # Remove trailing boundary markers
                    if data.endswith(b"\r\n"):
                        data = data[:-2]
                    return data
        return None

    def _send_json(self, status, data):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
