"""
CCMT 2025 NIT/GFTI M.Tech cutoff scraper.

Source: https://admissions.nic.in/admiss/admissions/orcrjacd/105012521
API:    GET https://admissions.nic.in/aisheapi/apisaishe/api/cmsservice.asmx/getConfiguredORCRInfo?boardId=105012521

Response format: text/xml containing {"d": "<json-string>"} (ASP.NET WebMethod)
Inner JSON has keys: CounsellingDetail, ColumnDetails, CounsellingData
CounsellingData fields: RoundName, InstituteName, ProgramName, groupName,
                        Category, OpeningRank (Max GATE Score), ClosingRank (Min GATE Score)

Output: data/ccmt_2025_cutoffs.csv  (10,900+ rows, all rounds, year=2025 only)

Usage:
    pip install requests
    python scripts/scrape_ccmt2025.py
"""

import json
import csv
import os
import re
import sys
import time
import requests

# ---------------------------------------------------------------------------
BOARD_ID = "105012521"   # CCMT 2025
API_URL  = (
    "https://admissions.nic.in/aisheapi/apisaishe/api/cmsservice.asmx/"
    f"getConfiguredORCRInfo?boardId={BOARD_ID}"
)
HEADERS = {
    "accept":       "application/json, text/plain, */*",
    "authtoken":    "1111",
    "clientid":     "2222",
    "content-type": "application/json",
    "User-Agent":   (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUT_CSV = os.path.join(OUT_DIR, "ccmt_2025_cutoffs.csv")

CATEGORY_MAP = {
    "OPEN":        "GEN",
    "OPEN-PWD":    "GEN-PwD",
    "OBC-NCL":     "OBC",
    "OBC-NCL-PWD": "OBC-PwD",
    "SC":          "SC",
    "SC-PWD":      "SC-PwD",
    "ST":          "ST",
    "ST-PWD":      "ST-PwD",
    "EWS":         "EWS",
    "EWS-PWD":     "EWS-PwD",
    # pass-through values already normalised
    "GEN": "GEN", "OBC": "OBC",
}

NIT_STATE_MAP = {
    "national institute of technology karnataka, surathkal":       "Karnataka",
    "national institute of technology warangal":                   "Telangana",
    "national institute of technology tiruchirappalli":            "Tamil Nadu",
    "national institute of technology calicut":                    "Kerala",
    "national institute of technology kozhikode":                  "Kerala",
    "national institute of technology rourkela":                   "Odisha",
    "national institute of technology jamshedpur":                 "Jharkhand",
    "national institute of technology patna":                      "Bihar",
    "national institute of technology silchar":                    "Assam",
    "national institute of technology agartala":                   "Tripura",
    "national institute of technology meghalaya":                  "Meghalaya",
    "national institute of technology manipur":                    "Manipur",
    "national institute of technology mizoram":                    "Mizoram",
    "national institute of technology nagaland":                   "Nagaland",
    "national institute of technology srinagar":                   "J&K",
    "national institute of technology hamirpur":                   "Himachal Pradesh",
    "national institute of technology kurukshetra":                "Haryana",
    "national institute of technology delhi":                      "Delhi",
    "national institute of technology durgapur":                   "West Bengal",
    "national institute of technology raipur":                     "Chhattisgarh",
    "national institute of technology bhopal":                     "Madhya Pradesh",
    "maulana azad national institute of technology bhopal":        "Madhya Pradesh",
    "maulana azad national institute of technology, bhopal":       "Madhya Pradesh",
    "national institute of technology allahabad":                  "Uttar Pradesh",
    "motilal nehru national institute of technology allahabad":    "Uttar Pradesh",
    "national institute of technology andhra pradesh":             "Andhra Pradesh",
    "national institute of technology goa":                        "Goa",
    "national institute of technology puducherry":                 "Puducherry",
    "national institute of technology sikkim":                     "Sikkim",
    "national institute of technology arunachal pradesh":          "Arunachal Pradesh",
    "national institute of technology uttarakhand":                "Uttarakhand",
    "sardar vallabhbhai national institute of technology surat":   "Gujarat",
    "sardar vallabhbhai national institute of technology, surat":  "Gujarat",
    "visvesvaraya national institute of technology nagpur":        "Maharashtra",
    "visvesvaraya national institute of technology, nagpur":       "Maharashtra",
    "dr. b r ambedkar national institute of technology jalandhar": "Punjab",
    "malaviya national institute of technology jaipur":            "Rajasthan",
    "national institute of foundry and forge technology":          "Jharkhand",
    "central institute of technology kokrajhar":                   "Assam",
}


def guess_state(institute: str) -> str:
    key = institute.strip().lower()
    for k, v in NIT_STATE_MAP.items():
        if k in key:
            return v
    return ""


def guess_type(institute: str) -> str:
    low = institute.strip().lower()
    if "national institute of technology" in low:
        return "NIT"
    if "iiit" in low or "indian institute of information" in low:
        return "IIIT"
    if "iit" in low:
        return "IIT"
    return "GFTI"


def fetch_data() -> list:
    print("Fetching CCMT 2025 data from API ...")
    resp = None
    for attempt in range(1, 4):
        try:
            resp = requests.get(API_URL, headers=HEADERS, timeout=90)
            resp.raise_for_status()
            break
        except requests.RequestException as e:
            print(f"  Attempt {attempt} failed: {e}")
            if attempt == 3:
                sys.exit("Failed after 3 attempts - check network/VPN.")
            time.sleep(5)

    # Response is text/xml wrapping JSON like:
    #   <?xml ...><string xmlns="...">{"d":"<json-string>"}</string>
    text = resp.text

    # Step 1: extract outer JSON from XML (first '{' to last '}')
    start = text.find('{')
    end   = text.rfind('}') + 1
    if start == -1:
        sys.exit("No JSON found in response:\n" + text[:500])
    outer = json.loads(text[start:end])
    print(f"  Outer keys: {list(outer.keys())}")

    # Step 2: unwrap ASP.NET "d" field (value is another JSON string)
    d_val = outer.get("d", outer)
    if isinstance(d_val, str):
        inner = json.loads(d_val)
    else:
        inner = d_val
    print(f"  Inner keys: {list(inner.keys())}")

    # Step 3: locate the CounsellingData list
    for key in ("CounsellingData", "counsellingData", "data", "Data"):
        if key in inner and isinstance(inner[key], list):
            return inner[key]

    # Fallback: first list value
    for v in inner.values():
        if isinstance(v, list) and len(v) > 0:
            return v

    raise ValueError(f"Cannot find data list. Keys: {list(inner.keys())}")


def to_int(s) -> int:
    try:
        return int(float(str(s).strip()))
    except (ValueError, TypeError):
        return 0


def parse_round(rnd_name: str) -> int:
    m = re.search(r"(\d+)", rnd_name)
    return int(m.group(1)) if m else 0


def normalise(records: list) -> list:
    """
    Convert raw API records to canonical CSV rows.
    Confirmed field names (CCMT 2025):
      RoundName, InstituteName, ProgramName, groupName,
      Category, OpeningRank (Max GATE Score), ClosingRank (Min GATE Score)
    """
    rows = []
    for r in records:
        institute = str(r.get("InstituteName", "")).strip()
        program   = str(r.get("ProgramName",   "")).strip()
        raw_cat   = str(r.get("Category", "")).strip().upper().replace(" ", "-")
        category  = CATEGORY_MAP.get(raw_cat, raw_cat)
        rnd_name  = str(r.get("RoundName", "Round 0")).strip()
        rnd       = parse_round(rnd_name)

        # OpeningRank = Max GATE Score (highest / opening)
        # ClosingRank = Min GATE Score (lowest / closing)
        open_score  = to_int(r.get("OpeningRank", 0))
        close_score = to_int(r.get("ClosingRank", 0))

        if open_score == 0 and close_score == 0:
            continue

        rows.append({
            "institute":     institute,
            "program":       program,
            "category":      category,
            "year":          2025,
            "round":         rnd,
            "openScore":     open_score,
            "closeScore":    close_score,
            "state":         guess_state(institute),
            "instituteType": guess_type(institute),
        })
    return rows


def save_csv(rows: list, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fields = ["institute", "program", "category", "year", "round",
              "openScore", "closeScore", "state", "instituteType"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Saved {len(rows)} rows -> {os.path.relpath(path)}")


def summary(rows: list):
    from collections import Counter
    by_inst  = Counter(r["institute"] for r in rows)
    by_round = Counter(r["round"] for r in rows)
    print(f"\n{'─'*60}")
    print(f"Total rows : {len(rows):,}")
    print(f"Institutes : {len(by_inst)}")
    print(f"Rounds     : {sorted(by_round.keys())}")
    print(f"\nTop 15 institutes by row count:")
    for inst, cnt in by_inst.most_common(15):
        print(f"  {cnt:5d}  {inst}")


def main():
    raw  = fetch_data()
    print(f"  -> {len(raw)} raw records received")

    if raw:
        sample = raw[0]
        print(f"  Sample record keys: {list(sample.keys())}")
        print(f"  Sample: {json.dumps(sample, ensure_ascii=False)[:300]}")

    rows = normalise(raw)
    save_csv(rows, OUT_CSV)
    summary(rows)
    print(f"\nNext step — import into DB:")
    print(f"  python scripts/import_ccmt2025.py")


if __name__ == "__main__":
    main()
