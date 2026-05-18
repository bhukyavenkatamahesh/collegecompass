"""
JoSAA 2025 + CSAB 2025 Opening/Closing Rank scraper.

Uses Playwright (headless Chromium). The site uses jQuery 'chosen-select'
which hides native <select> elements — we bypass it via page.evaluate()
and trigger ASP.NET __doPostBack via expect_navigation context.

Sources:
  JoSAA: https://josaa.admissions.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx
  CSAB:  https://csab.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx

Output:
  data/josaa_2025_cutoffs.csv   — JoSAA rounds 1-6
  data/csab_2025_cutoffs.csv    — CSAB special rounds 1-2

Usage:
    python3 -m playwright install chromium   (once)
    python3 scripts/scrape_josaa2025.py
"""

import asyncio
import csv
import os
import re
import sys

OUT_DIR   = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(OUT_DIR, exist_ok=True)

JOSAA_URL   = "https://josaa.admissions.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx"
CSAB_URL    = "https://csab.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx"
JOSAA_ROUNDS = ["1", "2", "3", "4", "5", "6"]
CSAB_ROUNDS  = ["1", "2"]

CATEGORY_MAP = {
    "OPEN":          "GEN",
    "OPEN (PwD)":    "GEN-PwD",
    "OBC-NCL":       "OBC",
    "OBC-NCL (PwD)": "OBC-PwD",
    "SC":            "SC",
    "SC (PwD)":      "SC-PwD",
    "ST":            "ST",
    "ST (PwD)":      "ST-PwD",
    "EWS":           "EWS",
    "EWS (PwD)":     "EWS-PwD",
}

STATE_MAP = {
    "national institute of technology karnataka":       "Karnataka",
    "national institute of technology warangal":        "Telangana",
    "national institute of technology tiruchirappalli": "Tamil Nadu",
    "national institute of technology calicut":         "Kerala",
    "national institute of technology rourkela":        "Odisha",
    "national institute of technology jamshedpur":      "Jharkhand",
    "national institute of technology patna":           "Bihar",
    "national institute of technology silchar":         "Assam",
    "national institute of technology hamirpur":        "Himachal Pradesh",
    "national institute of technology kurukshetra":     "Haryana",
    "national institute of technology delhi":           "Delhi",
    "national institute of technology durgapur":        "West Bengal",
    "national institute of technology raipur":          "Chhattisgarh",
    "maulana azad national institute":                  "Madhya Pradesh",
    "motilal nehru national institute":                 "Uttar Pradesh",
    "national institute of technology andhra pradesh":  "Andhra Pradesh",
    "national institute of technology goa":             "Goa",
    "national institute of technology puducherry":      "Puducherry",
    "national institute of technology sikkim":          "Sikkim",
    "sardar vallabhbhai national institute":            "Gujarat",
    "visvesvaraya national institute":                  "Maharashtra",
    "dr. b r ambedkar national institute":              "Punjab",
    "malaviya national institute":                      "Rajasthan",
    "iit bombay":     "Maharashtra",
    "iit delhi":      "Delhi",
    "iit madras":     "Tamil Nadu",
    "iit kanpur":     "Uttar Pradesh",
    "iit kharagpur":  "West Bengal",
    "iit roorkee":    "Uttarakhand",
    "iit guwahati":   "Assam",
    "iit hyderabad":  "Telangana",
    "iit indore":     "Madhya Pradesh",
    "iit (bhu)":      "Uttar Pradesh",
    "iit patna":      "Bihar",
    "iit jodhpur":    "Rajasthan",
    "iit gandhinagar":"Gujarat",
    "iit mandi":      "Himachal Pradesh",
    "iit palakkad":   "Kerala",
    "iit tirupati":   "Andhra Pradesh",
    "iit dharwad":    "Karnataka",
    "iit bhilai":     "Chhattisgarh",
    "iit goa":        "Goa",
    "iit jammu":      "J&K",
}


def to_int(s):
    try:
        return int(str(s).strip().replace(",", ""))
    except (ValueError, TypeError):
        return 0


def guess_state(inst):
    low = inst.strip().lower()
    for k, v in STATE_MAP.items():
        if k in low:
            return v
    return ""


def guess_type(inst):
    low = inst.strip().lower()
    if "indian institute of technology" in low or re.match(r"iit\b", low):
        return "IIT"
    if "national institute of technology" in low:
        return "NIT"
    if "iiit" in low or "indian institute of information" in low:
        return "IIIT"
    return "GFTI"


# ------------------------------------------------------------------
# JS helpers (embedded values — no multi-arg evaluate)
# ------------------------------------------------------------------
def js_set(elem_id, value):
    v = str(value).replace("'", "\\'")
    return f"""(function(){{
        var s=document.getElementById('{elem_id}');
        if(!s)return false;
        s.value='{v}';
        s.dispatchEvent(new Event('change',{{bubbles:true}}));
        return true;
    }})()"""


def js_opts(elem_id):
    return f"""(function(){{
        var s=document.getElementById('{elem_id}');
        if(!s)return[];
        return Array.from(s.options).map(function(o){{return{{val:o.value,text:o.text.trim()}}}});
    }})()"""


def js_pb(target):
    t = str(target).replace("'", "\\'")
    return f"""(function(){{
        if(typeof __doPostBack==='function'){{__doPostBack('{t}','');return true;}}
        return false;
    }})()"""


JS_TABLE = """(function(){
    var tbls=document.querySelectorAll('table');
    for(var i=0;i<tbls.length;i++){
        var t=tbls[i];
        var rows=t.querySelectorAll('tr');
        if(rows.length<2)continue;
        var hdr=Array.from(rows[0].querySelectorAll('th,td')).map(function(c){return c.innerText.trim();});
        if(!hdr.some(function(h){return/rank|institute/i.test(h);}))continue;
        var dat=[];
        for(var j=1;j<rows.length;j++){
            var cells=Array.from(rows[j].querySelectorAll('td')).map(function(c){return c.innerText.trim();});
            if(cells.length>0)dat.push(cells);
        }
        return{headers:hdr,data:dat};
    }
    return null;
})()"""


# ------------------------------------------------------------------
async def postback_and_wait(page, target, timeout=25000):
    """Fire __doPostBack and absorb the resulting navigation."""
    try:
        async with page.expect_navigation(wait_until="networkidle", timeout=timeout):
            await page.evaluate(js_pb(target))
    except Exception:
        await page.wait_for_timeout(2000)


async def get_opts(page, elem_id):
    return await page.evaluate(js_opts(elem_id))


# ------------------------------------------------------------------
async def parse_table(page, rnd, year):
    rows = []
    try:
        await page.wait_for_selector("table", timeout=12000)
    except Exception:
        return rows

    result = await page.evaluate(JS_TABLE)
    if not result or not result.get("data"):
        return rows

    headers = result["headers"]
    print(f"        Columns: {headers}")

    def ci(*patterns):
        for pat in patterns:
            for i, h in enumerate(headers):
                if re.search(pat, h, re.I):
                    return i
        return None

    col_inst  = ci(r"institute")
    col_prog  = ci(r"program|branch|course|academ")
    col_quota = ci(r"quota")
    col_seat  = ci(r"seat.?type|seat.?pool|category")
    col_gen   = ci(r"gender")
    col_open  = ci(r"opening|open.?rank")
    col_close = ci(r"closing|close.?rank")

    for cells in result["data"]:
        def get(idx):
            if idx is None or idx >= len(cells):
                return ""
            return cells[idx].strip()

        inst       = get(col_inst)
        program    = get(col_prog)
        quota      = get(col_quota)
        raw_seat   = get(col_seat)
        gender     = get(col_gen)
        open_rank  = to_int(get(col_open))
        close_rank = to_int(get(col_close))

        if not inst or (open_rank == 0 and close_rank == 0):
            continue

        rows.append({
            "institute":     inst,
            "program":       program,
            "quota":         quota,
            "category":      CATEGORY_MAP.get(raw_seat, raw_seat),
            "gender":        gender,
            "year":          year,
            "round":         int(rnd),
            "openRank":      open_rank,
            "closeRank":     close_rank,
            "state":         guess_state(inst),
            "instituteType": guess_type(inst),
        })

    return rows


# ------------------------------------------------------------------
async def scrape_portal(pw, url, rounds, label, year):
    browser = await pw.chromium.launch(headless=True, args=["--no-sandbox"])
    ctx = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        viewport={"width": 1280, "height": 900},
    )
    page = await ctx.new_page()
    all_rows = []

    print(f"\n{'='*60}")
    print(f"{label} — {len(rounds)} rounds")
    print(f"{'='*60}")

    for rnd in rounds:
        print(f"\n  Round {rnd}...")
        try:
            await page.goto(url, wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(2000)

            # 1. Select round
            await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlroundno", rnd))
            await postback_and_wait(page, "ctl00$ContentPlaceHolder1$ddlroundno")
            await page.wait_for_timeout(1500)

            # 2. Get InstType options
            inst_opts = await get_opts(page, "ctl00_ContentPlaceHolder1_ddlInstype")
            real = [o for o in inst_opts if o["val"] not in ("0", "", "--Select--")]
            print(f"    InstTypes: {[o['val']+'='+o['text'] for o in real]}")

            if not real:
                # No cascade — submit directly
                await page.click("#ctl00_ContentPlaceHolder1_btnSubmit", force=True)
                await page.wait_for_load_state("networkidle", timeout=30000)
                await page.wait_for_timeout(2000)
                rows = await parse_table(page, rnd, year)
                all_rows.extend(rows)
                print(f"    -> {len(rows)} rows")
                continue

            for inst_opt in real:
                inst_val  = inst_opt["val"]
                inst_text = inst_opt["text"]
                print(f"    InstType={inst_text!r}...")

                # Fresh navigation per combo
                await page.goto(url, wait_until="networkidle", timeout=60000)
                await page.wait_for_timeout(1500)

                await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlroundno", rnd))
                await postback_and_wait(page, "ctl00$ContentPlaceHolder1$ddlroundno")
                await page.wait_for_timeout(1500)

                await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlInstype", inst_val))
                await postback_and_wait(page, "ctl00$ContentPlaceHolder1$ddlInstype")
                await page.wait_for_timeout(1500)

                # Institute = ALL
                iname_opts = await get_opts(page, "ctl00_ContentPlaceHolder1_ddlInstitute")
                iall = next(
                    (o["val"] for o in iname_opts if "all" in o["text"].lower()),
                    iname_opts[0]["val"] if iname_opts else "0"
                )
                await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlInstitute", iall))
                await postback_and_wait(page, "ctl00$ContentPlaceHolder1$ddlInstitute", timeout=15000)
                await page.wait_for_timeout(1000)

                # Branch = ALL
                b_opts = await get_opts(page, "ctl00_ContentPlaceHolder1_ddlBranch")
                ball = next(
                    (o["val"] for o in b_opts if "all" in o["text"].lower()),
                    b_opts[0]["val"] if b_opts else "0"
                )
                await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlBranch", ball))
                await postback_and_wait(page, "ctl00$ContentPlaceHolder1$ddlBranch", timeout=15000)
                await page.wait_for_timeout(1000)

                # SeatType = ALL
                s_opts = await get_opts(page, "ctl00_ContentPlaceHolder1_ddlSeattype")
                sall = next(
                    (o["val"] for o in s_opts if "all" in o["text"].lower()),
                    s_opts[0]["val"] if s_opts else "0"
                )
                await page.evaluate(js_set("ctl00_ContentPlaceHolder1_ddlSeattype", sall))
                await page.wait_for_timeout(500)

                # Submit
                try:
                    async with page.expect_navigation(wait_until="networkidle", timeout=30000):
                        await page.click("#ctl00_ContentPlaceHolder1_btnSubmit", force=True)
                except Exception:
                    await page.wait_for_timeout(3000)

                rows = await parse_table(page, rnd, year)
                all_rows.extend(rows)
                print(f"      -> {len(rows)} rows (total so far: {len(all_rows)})")

        except Exception as e:
            print(f"    ERROR round {rnd}: {e}")
            import traceback; traceback.print_exc()

    await browser.close()
    return all_rows


# ------------------------------------------------------------------
def save_csv(rows, path):
    if not rows:
        print(f"  No rows — skipping {path}")
        return
    fields = ["institute", "program", "quota", "category", "gender",
              "year", "round", "openRank", "closeRank", "state", "instituteType"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"Saved {len(rows):,} rows -> {os.path.relpath(path)}")


def print_summary(rows, label):
    from collections import Counter
    print(f"\n{'─'*60}")
    print(f"{label}: {len(rows):,} rows")
    if not rows:
        return
    by_type = Counter(r["instituteType"] for r in rows)
    by_rnd  = Counter(r["round"] for r in rows)
    print(f"  By type  : {dict(sorted(by_type.items()))}")
    print(f"  By round : {dict(sorted(by_rnd.items()))}")
    print(f"  Institutes: {len(Counter(r['institute'] for r in rows))}")


# ------------------------------------------------------------------
async def main():
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        sys.exit("pip3 install playwright && python3 -m playwright install chromium")

    async with async_playwright() as pw:
        # JoSAA
        josaa = await scrape_portal(pw, JOSAA_URL, JOSAA_ROUNDS, "JoSAA 2025", 2025)
        save_csv(josaa, os.path.join(OUT_DIR, "josaa_2025_cutoffs.csv"))
        print_summary(josaa, "JoSAA 2025")

        # CSAB
        print(f"\nCSAB URL: {CSAB_URL}")
        try:
            csab = await scrape_portal(pw, CSAB_URL, CSAB_ROUNDS, "CSAB 2025", 2025)
        except Exception as e:
            print(f"CSAB failed: {e}")
            csab = []
        save_csv(csab, os.path.join(OUT_DIR, "csab_2025_cutoffs.csv"))
        print_summary(csab, "CSAB 2025")

    print("\nNext:")
    print("  python3 scripts/import_josaa2025.py data/josaa_2025_cutoffs.csv")
    if csab:
        print("  python3 scripts/import_josaa2025.py data/csab_2025_cutoffs.csv")


if __name__ == "__main__":
    asyncio.run(main())
