"""
Import cutoff data from CSV into the SQLite database.

Usage:
    python scripts/import_cutoffs.py <csv_file> <GATE|JEE>

Example:
    python scripts/import_cutoffs.py data/josaa_2024.csv JEE
    python scripts/import_cutoffs.py data/ccmt_2024.csv GATE

CSV must have these columns (case-insensitive):
    institute, program, category, year, round, openRank (or open_rank),
    closeRank (or close_rank), state, instituteType (or institute_type)

Category values must be: GEN, OBC, SC, ST, EWS, GEN-PwD, OBC-PwD, SC-PwD, ST-PwD
(JoSAA uses OPEN/OBC-NCL — these are mapped automatically)
"""

import csv
import sqlite3
import sys
import os
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'dev.db')

# Map JoSAA/CCMT category names to our DB values
CATEGORY_MAP = {
    'OPEN': 'GEN',
    'OBC-NCL': 'OBC',
    'SC': 'SC',
    'ST': 'ST',
    'EWS': 'EWS',
    'OPEN-PWD': 'GEN-PwD',
    'OBC-NCL-PWD': 'OBC-PwD',
    'SC-PWD': 'SC-PwD',
    'ST-PWD': 'ST-PwD',
    'GEN': 'GEN',
    'OBC': 'OBC',
    'GEN-PWD': 'GEN-PwD',
    'OBC-PWD': 'OBC-PwD',
}


def normalize_col(headers: list[str]) -> dict[str, str]:
    """Build a mapping from normalized header names to actual CSV column names."""
    mapping = {}
    alias = {
        'institute': ['institute', 'college', 'institution'],
        'program': ['program', 'course', 'branch', 'programme'],
        'category': ['category', 'quota', 'seat_type', 'seattype'],
        'year': ['year'],
        'round': ['round', 'round_no', 'roundno'],
        'openRank': ['openrank', 'open_rank', 'opening_rank', 'openingrank'],
        'closeRank': ['closerank', 'close_rank', 'closing_rank', 'closingrank'],
        'state': ['state', 'institute_state'],
        'instituteType': ['institutetype', 'institute_type', 'type', 'inst_type'],
    }
    lower_headers = {h.lower().replace(' ', '_'): h for h in headers}
    for field, candidates in alias.items():
        for c in candidates:
            if c in lower_headers:
                mapping[field] = lower_headers[c]
                break
    return mapping


def import_csv(csv_file: str, exam_type: str):
    if not os.path.exists(csv_file):
        print(f"Error: file not found: {csv_file}")
        sys.exit(1)

    if not os.path.exists(DB_PATH):
        print(f"Error: database not found at {DB_PATH}")
        print("Run `npx prisma db push` first to create the database.")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    inserted = skipped = 0

    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        col = normalize_col(reader.fieldnames or [])

        missing = [k for k in ('institute', 'program', 'openRank', 'closeRank') if k not in col]
        if missing:
            print(f"Error: CSV is missing required columns: {missing}")
            print(f"Found columns: {reader.fieldnames}")
            sys.exit(1)

        for row in reader:
            try:
                raw_cat = row.get(col.get('category', ''), 'GEN').strip().upper()
                category = CATEGORY_MAP.get(raw_cat, raw_cat)

                cursor.execute("""
                    INSERT OR IGNORE INTO Cutoff
                    (id, examType, year, institute, program, category, round,
                     openRank, closeRank, state, instituteType, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                """, (
                    str(uuid.uuid4()).replace('-', ''),
                    exam_type,
                    int(row.get(col.get('year', ''), 2024) or 2024),
                    row[col['institute']].strip(),
                    row[col['program']].strip(),
                    category,
                    int(row.get(col.get('round', ''), 1) or 1),
                    int(str(row[col['openRank']]).replace(',', '') or 0),
                    int(str(row[col['closeRank']]).replace(',', '') or 0),
                    row.get(col.get('state', ''), '').strip() or None,
                    row.get(col.get('instituteType', ''), '').strip() or None,
                ))
                inserted += 1
            except Exception as e:
                print(f"  Skipped row: {e}")
                skipped += 1

    conn.commit()
    conn.close()
    print(f"Done. Inserted: {inserted}, Skipped: {skipped}")
    print(f"Database: {DB_PATH}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python import_cutoffs.py <csv_file> <GATE|JEE>")
        print("Example: python import_cutoffs.py data/josaa_2024.csv JEE")
        sys.exit(1)

    import_csv(sys.argv[1], sys.argv[2].upper())
