"""
CCMT (GATE) cutoff scraper.

Usage:
    pip install requests beautifulsoup4 pandas
    python scripts/scrape_ccmt.py

CCMT publishes cutoff data at https://ccmt.admissions.nic.in
Navigate to Cutoff Ranks, open DevTools > Network tab,
trigger a search, and capture the exact POST URL + form body to replicate here.

Output: data/ccmt_2024_all_rounds.csv
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os

BASE_URL = "https://ccmt.admissions.nic.in"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

DISCIPLINE_MAP = {
    'CS': 'Computer Science',
    'EC': 'Electronics',
    'EE': 'Electrical',
    'ME': 'Mechanical',
    'CE': 'Civil',
    'CH': 'Chemical',
    'BT': 'Biotechnology',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}


def scrape_round(year: int, round_num: int, session: requests.Session) -> list[dict]:
    """
    Scrape CCMT cutoffs for a given year and round.

    IMPORTANT: Like JoSAA, CCMT uses dynamic forms.
    Inspect actual requests on ccmt.admissions.nic.in and update this function.

    Steps:
    1. Go to ccmt.admissions.nic.in
    2. Click on Cutoff Ranks
    3. Open DevTools > Network tab
    4. Select year, round, discipline and click Search
    5. Copy the POST body fields and replicate here
    """
    results = []
    print(f"  [INFO] Scraping CCMT {year} Round {round_num} — configure with real POST body from ccmt.admissions.nic.in")
    return results


def save_csv(data: list[dict], filename: str):
    df = pd.DataFrame(data)
    path = os.path.join(OUTPUT_DIR, filename)
    df.to_csv(path, index=False)
    print(f"Saved {len(df)} rows to {path}")


def main():
    session = requests.Session()
    all_data = []
    for round_num in range(1, 5):
        print(f"Round {round_num}...")
        data = scrape_round(year=2024, round_num=round_num, session=session)
        all_data.extend(data)
        time.sleep(2)

    if all_data:
        save_csv(all_data, 'ccmt_2024_all_rounds.csv')
    else:
        print("\nNo data scraped — configure the scraper with real form values from ccmt.admissions.nic.in")
        print("\nFastest alternative: download CSV from Kaggle:")
        print("  https://www.kaggle.com/datasets — search 'CCMT 2024 cutoff'")
        print("Then run: python scripts/import_cutoffs.py data/ccmt_2024.csv GATE")


if __name__ == '__main__':
    main()
