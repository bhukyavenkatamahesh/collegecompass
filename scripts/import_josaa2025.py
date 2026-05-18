"""
Import JoSAA / CSAB 2025 cutoff CSV into the SQLite database.

Usage:
    python3 scripts/import_josaa2025.py data/josaa_2025_cutoffs.csv
    python3 scripts/import_josaa2025.py data/csab_2025_cutoffs.csv

CSV columns expected (from scrape_josaa2025.py):
    institute, program, quota, category, gender,
    year, round, openRank, closeRank, state, instituteType
"""

import csv
import os
import sqlite3
import sys
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "dev.db")

CATEGORY_MAP = {
    "OPEN":          "GEN",
    "OPEN (PWD)":    "GEN-PwD",
    "OBC-NCL":       "OBC",
    "OBC-NCL (PWD)": "OBC-PwD",
    "SC":            "SC",
    "SC (PWD)":      "SC-PwD",
    "ST":            "ST",
    "ST (PWD)":      "ST-PwD",
    "EWS":           "EWS",
    "EWS (PWD)":     "EWS-PwD",
    # pass-through already-normalised values
    "GEN": "GEN", "OBC": "OBC",
    "GEN-PWD": "GEN-PwD", "OBC-PWD": "OBC-PwD",
    "SC-PWD": "SC-PwD", "ST-PWD": "ST-PwD", "EWS-PWD": "EWS-PwD",
}

# NIT state lookup
NIT_STATE = {
    "national institute of technology karnataka":      "Karnataka",
    "national institute of technology warangal":        "Telangana",
    "national institute of technology tiruchirappalli": "Tamil Nadu",
    "national institute of technology calicut":         "Kerala",
    "national institute of technology rourkela":        "Odisha",
    "national institute of technology jamshedpur":      "Jharkhand",
    "national institute of technology patna":           "Bihar",
    "national institute of technology silchar":         "Assam",
    "national institute of technology agartala":        "Tripura",
    "national institute of technology meghalaya":       "Meghalaya",
    "national institute of technology manipur":         "Manipur",
    "national institute of technology mizoram":         "Mizoram",
    "national institute of technology nagaland":        "Nagaland",
    "national institute of technology srinagar":        "J&K",
    "national institute of technology hamirpur":        "Himachal Pradesh",
    "national institute of technology kurukshetra":     "Haryana",
    "national institute of technology delhi":           "Delhi",
    "national institute of technology durgapur":        "West Bengal",
    "national institute of technology raipur":          "Chhattisgarh",
    "maulana azad national institute of technology":    "Madhya Pradesh",
    "motilal nehru national institute of technology":   "Uttar Pradesh",
    "national institute of technology andhra pradesh":  "Andhra Pradesh",
    "national institute of technology goa":             "Goa",
    "national institute of technology puducherry":      "Puducherry",
    "national institute of technology sikkim":          "Sikkim",
    "national institute of technology arunachal":       "Arunachal Pradesh",
    "national institute of technology uttarakhand":     "Uttarakhand",
    "sardar vallabhbhai national institute":            "Gujarat",
    "visvesvaraya national institute":                  "Maharashtra",
    "dr. b r ambedkar national institute":              "Punjab",
    "malaviya national institute of technology":        "Rajasthan",
    "iit bombay":        "Maharashtra",
    "iit delhi":         "Delhi",
    "iit madras":        "Tamil Nadu",
    "iit kanpur":        "Uttar Pradesh",
    "iit kharagpur":     "West Bengal",
    "iit roorkee":       "Uttarakhand",
    "iit guwahati":      "Assam",
    "iit hyderabad":     "Telangana",
    "iit indore":        "Madhya Pradesh",
    "iit bhu":           "Uttar Pradesh",
    "iit patna":         "Bihar",
    "iit jodhpur":       "Rajasthan",
    "iit gandhinagar":   "Gujarat",
    "iit mandi":         "Himachal Pradesh",
    "iit palakkad":      "Kerala",
    "iit tirupati":      "Andhra Pradesh",
    "iit dharwad":       "Karnataka",
    "iit bhilai":        "Chhattisgarh",
    "iit goa":           "Goa",
    "iit jammu":         "J&K",
    "iit dharwad":       "Karnataka",
    "iisc bangalore":    "Karnataka",
}


def guess_state(institute: str) -> str:
    low = institute.strip().lower()
    for k, v in NIT_STATE.items():
        if k in low:
            return v
    return ""


def import_csv(csv_file: str):
    if not os.path.exists(csv_file):
        sys.exit(f"Error: file not found: {csv_file}")
    if not os.path.exists(DB_PATH):
        sys.exit(f"Error: DB not found at {DB_PATH}\nRun `npx prisma db push` first.")

    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    inserted = skipped = 0

    with open(csv_file, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            try:
                raw_cat  = row.get("category", "GEN").strip().upper().replace(" ", "-")
                category = CATEGORY_MAP.get(raw_cat, raw_cat)

                institute = row.get("institute", "").strip()
                program   = row.get("program", "").strip()
                state     = row.get("state", "").strip() or guess_state(institute)
                itype     = row.get("instituteType", "").strip() or "GFTI"
                rnd       = int(row.get("round", 1) or 1)
                year      = int(row.get("year", 2025) or 2025)
                open_r    = int(str(row.get("openRank",  0)).replace(",", "") or 0)
                close_r   = int(str(row.get("closeRank", 0)).replace(",", "") or 0)

                if not institute or (open_r == 0 and close_r == 0):
                    skipped += 1
                    continue

                cursor.execute("""
                    INSERT OR IGNORE INTO Cutoff
                    (id, examType, year, institute, program, category, round,
                     openRank, closeRank, openScore, closeScore,
                     state, instituteType, createdAt, updatedAt)
                    VALUES (?, 'JEE', ?, ?, ?, ?, ?,
                            ?, ?, 0, 0,
                            ?, ?, datetime('now'), datetime('now'))
                """, (
                    str(uuid.uuid4()).replace("-", ""),
                    year, institute, program, category, rnd,
                    open_r, close_r, state or None, itype or None,
                ))
                inserted += 1
            except Exception as e:
                print(f"  Skipped: {e} | {dict(row)}")
                skipped += 1

    conn.commit()
    conn.close()
    print(f"Done. Inserted: {inserted:,}  |  Skipped: {skipped}")
    print(f"Database: {DB_PATH}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 import_josaa2025.py <csv_file>")
        print("  e.g. python3 import_josaa2025.py data/josaa_2025_cutoffs.csv")
        sys.exit(1)
    import_csv(sys.argv[1])
