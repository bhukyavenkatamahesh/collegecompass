"""
Import JoSAA + CSAB 2025 cutoffs into the Cutoff table, preserving the
gender (seat pool) and quota dimensions that the predictor needs.

Wipes existing JEE/2025 rows first so re-runs are idempotent.

Usage:
    python3 scripts/import_jee2025.py

CSV columns (from scrape_josaa2025.py):
    institute, program, quota, category, gender,
    year, round, openRank, closeRank, state, instituteType
"""
import csv
import os
import sqlite3
import uuid

HERE = os.path.dirname(__file__)
DB_PATH = os.path.join(HERE, "..", "dev.db")
DATA = os.path.join(HERE, "..", "data")
FILES = ["josaa_2025_cutoffs.csv", "csab_2025_cutoffs.csv"]

CATEGORY_MAP = {
    "OPEN": "GEN", "OPEN (PWD)": "GEN-PwD",
    "OBC-NCL": "OBC", "OBC-NCL (PWD)": "OBC-PwD",
    "SC": "SC", "SC (PWD)": "SC-PwD",
    "ST": "ST", "ST (PWD)": "ST-PwD",
    "EWS": "EWS", "EWS (PWD)": "EWS-PwD",
    "GEN": "GEN", "OBC": "OBC", "GEN-PWD": "GEN-PwD", "OBC-PWD": "OBC-PwD",
    "SC-PWD": "SC-PwD", "ST-PWD": "ST-PwD", "EWS-PWD": "EWS-PwD",
}


NIT_STATE = {
    "national institute of technology karnataka": "Karnataka",
    "national institute of technology warangal": "Telangana",
    "national institute of technology tiruchirappalli": "Tamil Nadu",
    "national institute of technology calicut": "Kerala",
    "national institute of technology rourkela": "Odisha",
    "national institute of technology jamshedpur": "Jharkhand",
    "national institute of technology patna": "Bihar",
    "national institute of technology silchar": "Assam",
    "national institute of technology agartala": "Tripura",
    "national institute of technology meghalaya": "Meghalaya",
    "national institute of technology manipur": "Manipur",
    "national institute of technology mizoram": "Mizoram",
    "national institute of technology nagaland": "Nagaland",
    "national institute of technology srinagar": "J&K",
    "national institute of technology hamirpur": "Himachal Pradesh",
    "national institute of technology kurukshetra": "Haryana",
    "national institute of technology delhi": "Delhi",
    "national institute of technology durgapur": "West Bengal",
    "national institute of technology raipur": "Chhattisgarh",
    "national institute of technology, andhra": "Andhra Pradesh",
    "national institute of technology arunachal": "Arunachal Pradesh",
    "national institute of technology uttarakhand": "Uttarakhand",
    "national institute of technology goa": "Goa",
    "national institute of technology puducherry": "Puducherry",
    "national institute of technology sikkim": "Sikkim",
    "maulana azad national institute": "Madhya Pradesh",
    "motilal nehru national institute": "Uttar Pradesh",
    "sardar vallabhbhai national institute": "Gujarat",
    "visvesvaraya national institute": "Maharashtra",
    "dr. b r ambedkar national institute": "Punjab",
    "malaviya national institute": "Rajasthan",
}


def _norm(s: str) -> str:
    return "".join(ch for ch in s.lower() if ch.isalnum() or ch == " ")


def guess_state(institute: str, given: str) -> str:
    if given:
        return given
    low = _norm(institute)
    for k, v in NIT_STATE.items():
        if _norm(k) in low:
            return v
    return ""


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM Cutoff WHERE examType='JEE' AND year=2025")
    print(f"Cleared {cur.rowcount:,} old JEE/2025 rows")

    inserted = skipped = 0
    for fname in FILES:
        path = os.path.join(DATA, fname)
        src = "CSAB" if "csab" in fname.lower() else "JOSAA"
        if not os.path.exists(path):
            print(f"  (missing {fname}, skipping)")
            continue
        with open(path, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                try:
                    raw = row.get("category", "GEN").strip().upper().replace(" ", "-")
                    category = CATEGORY_MAP.get(raw, raw)
                    institute = row.get("institute", "").strip()
                    open_r = int(str(row.get("openRank", 0)).replace(",", "") or 0)
                    close_r = int(str(row.get("closeRank", 0)).replace(",", "") or 0)
                    if not institute or (open_r == 0 and close_r == 0):
                        skipped += 1
                        continue
                    cur.execute(
                        """INSERT INTO Cutoff
                        (id, examType, year, institute, program, category, round,
                         openRank, closeRank, openScore, closeScore,
                         gender, quota, source, state, instituteType,
                         createdAt, updatedAt)
                        VALUES (?, 'JEE', ?, ?, ?, ?, ?, ?, ?, 0, 0,
                                ?, ?, ?, ?, ?, datetime('now'), datetime('now'))""",
                        (
                            uuid.uuid4().hex,
                            int(row.get("year", 2025) or 2025),
                            institute,
                            row.get("program", "").strip(),
                            category,
                            int(row.get("round", 1) or 1),
                            open_r, close_r,
                            row.get("gender", "").strip() or None,
                            row.get("quota", "").strip() or None,
                            src,
                            guess_state(institute, row.get("state", "").strip()) or None,
                            row.get("instituteType", "").strip() or "GFTI",
                        ),
                    )
                    inserted += 1
                except Exception as e:
                    print(f"  skip: {e}")
                    skipped += 1
        print(f"  {fname}: cumulative inserted={inserted:,}")

    conn.commit()
    conn.close()
    print(f"Done. Inserted: {inserted:,}  Skipped: {skipped:,}")


if __name__ == "__main__":
    main()
