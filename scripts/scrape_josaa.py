"""
JoSAA (JEE) cutoff scraper.

Usage:
    pip install requests beautifulsoup4 pandas
    python scripts/scrape_josaa.py

JoSAA publishes cutoff data at https://josaa.nic.in
Navigate to Opening and Closing Ranks, open DevTools > Network tab,
trigger a search, and capture the exact POST URL + form body to replicate here.
The request format changes each year, so inspect the live site.

Output: data/josaa_2024_all_rounds.csv
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os

BASE_URL = "https://josaa.nic.in"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

CATEGORY_MAP = {
    'OPEN': 'GEN',
    'OBC-NCL': 'OBC',
    'SC': 'SC',
    'ST': 'ST',
    'EWS': 'EWS',
    'OPEN-PwD': 'GEN-PwD',
    'OBC-NCL-PwD': 'OBC-PwD',
    'SC-PwD': 'SC-PwD',
    'ST-PwD': 'ST-PwD',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}


def scrape_round(year: int, round_num: int, session: requests.Session) -> list[dict]:
    """
    Scrape JoSAA cutoffs for a given year and round.

    IMPORTANT: JoSAA uses a dynamic form with ViewState tokens.
    You must inspect the actual network requests on josaa.nic.in
    and replicate the exact POST body including __VIEWSTATE, __EVENTVALIDATION,
    and the dropdown selections. These parameters change every year.

    Steps to find the right request:
    1. Go to josaa.nic.in
    2. Click on "Opening and Closing Ranks"
    3. Open browser DevTools > Network tab
    4. Select year, round, category from dropdowns and click Search
    5. Find the POST request, copy the form data
    6. Replicate it here with the correct field names and values
    """
    results = []
    print(f"  [INFO] Scraping {year} Round {round_num} — update the POST body with real form values from josaa.nic.in")

    # Placeholder — replace with real POST body after inspecting the site
    # Example structure (actual field names differ year to year):
    # data = {
    #     '__VIEWSTATE': '<copy from DevTools>',
    #     '__EVENTVALIDATION': '<copy from DevTools>',
    #     'ctl00$ContentPlaceHolder1$ddlYear': str(year),
    #     'ctl00$ContentPlaceHolder1$ddlroundno': str(round_num),
    #     'ctl00$ContentPlaceHolder1$ddlInstype': 'NIT',
    #     'ctl00$ContentPlaceHolder1$ddlCategory': 'OPEN',
    #     'ctl00$ContentPlaceHolder1$Button1': 'Submit',
    # }
    # response = session.post(f"{BASE_URL}/webinfocms/Handler/getindividualCollegeCourse.ashx", data=data, headers=HEADERS)
    # soup = BeautifulSoup(response.text, 'html.parser')
    # table = soup.find('table')
    # ...parse rows...

    return results


def save_csv(data: list[dict], filename: str):
    df = pd.DataFrame(data)
    path = os.path.join(OUTPUT_DIR, filename)
    df.to_csv(path, index=False)
    print(f"Saved {len(df)} rows to {path}")


def main():
    session = requests.Session()
    all_data = []
    for round_num in range(1, 7):
        print(f"Round {round_num}...")
        data = scrape_round(year=2024, round_num=round_num, session=session)
        all_data.extend(data)
        time.sleep(2)

    if all_data:
        save_csv(all_data, 'josaa_2024_all_rounds.csv')
    else:
        print("\nNo data scraped — the scraper needs to be configured with real form values.")
        print("See the instructions in the scrape_round() function above.")
        print("\nFastest alternative: download CSV from Kaggle:")
        print("  https://www.kaggle.com/datasets — search 'JoSAA 2024 cutoff'")
        print("Then run: python scripts/import_cutoffs.py data/josaa_2024.csv JEE")


if __name__ == '__main__':
    main()
