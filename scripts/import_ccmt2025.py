"""
Import CCMT 2025 cutoff CSV (GATE scores) into the SQLite database.

Usage:
    python scripts/import_ccmt2025.py [csv_file]

Default csv_file: data/ccmt_2025_cutoffs.csv

Uses the openScore/closeScore columns (GATE scores, not ranks).
Sets openRank = closeRank = 0 since CCMT is score-based.
"""

import csv
import sqlite3
import sys
import os
import uuid

DB_PATH  = os.path.join(os.path.dirname(__file__), "..", "dev.db")
DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "..", "data", "ccmt_2025_cutoffs.csv")

CATEGORY_MAP = {
    "OPEN":        "GEN",
    "OBC-NCL":     "OBC",
    "OPEN-PWD":    "GEN-PwD",
    "OBC-NCL-PWD": "OBC-PwD",
    "SC-PWD":      "SC-PwD",
    "ST-PWD":      "ST-PwD",
    "EWS-PWD":     "EWS-PwD",
    # already normalised values pass through unchanged
    "GEN": "GEN", "OBC": "OBC", "SC": "SC", "ST": "ST", "EWS": "EWS",
    "GEN-PWD": "GEN-PwD", "OBC-PWD": "OBC-PwD",
}


def import_csv(csv_file: str):
    if not os.path.exists(csv_file):
        sys.exit(f"Error: file not found: {csv_file}")
    if not os.path.exists(DB_PATH):
        sys.exit(f"Error: database not found at {DB_PATH}\nRun `npx prisma db push` first.")

    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    inserted = skipped = 0

    with open(csv_file, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                raw_cat  = row.get("category", "GEN").strip().upper().replace(" ", "-")
                category = CATEGORY_MAP.get(raw_cat, raw_cat)

                open_score  = int(float(row.get("openScore",  0) or 0))
                close_score = int(float(row.get("closeScore", 0) or 0))
                rnd         = int(row.get("round", 1) or 1)
                year        = int(row.get("year", 2025) or 2025)

                cursor.execute("""
                    INSERT OR IGNORE INTO Cutoff
                    (id, examType, year, institute, program, category, round,
                     openRank, closeRank, openScore, closeScore,
                     state, instituteType, createdAt, updatedAt)
                    VALUES (?, 'GATE', ?, ?, ?, ?, ?,
                            0, 0, ?, ?,
                            ?, ?, datetime('now'), datetime('now'))
                """, (
                    str(uuid.uuid4()).replace("-", ""),
                    year,
                    row["institute"].strip(),
                    row["program"].strip(),
                    category,
                    rnd,
                    open_score,
                    close_score,
                    row.get("state", "").strip() or None,
                    row.get("instituteType", "").strip() or None,
                ))
                inserted += 1
            except Exception as e:
                print(f"  Skipped: {e} | row={dict(row)}")
                skipped += 1

    conn.commit()
    conn.close()
    print(f"Done. Inserted: {inserted:,}  |  Skipped: {skipped}")
    print(f"Database: {DB_PATH}")


if __name__ == "__main__":
    csv_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV
    import_csv(csv_file)
