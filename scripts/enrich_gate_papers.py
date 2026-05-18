"""
Enrich the GATE Cutoff rows that have NULL paper codes.

Two strategies:
  1. IIT program codes (AIB, JTM, MCS etc.) → looked up from our WITH-paper rows
     in the same DB (same institute, same program code but different category/round)
  2. NIT/GFTI full program names → keyword-to-paper mapping based on well-known
     CCMT program eligibility patterns

Run:
    python3 scripts/enrich_gate_papers.py
"""
import sqlite3
import re
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'dev.db')

# ── Step 1: build lookup from existing WITH-paper rows ──────────────────────
# For each (institute, program) that already has a paper value, propagate it
# to NULL-paper rows of the same (institute, program).

# ── Step 2: keyword map for NIT/GFTI full program names ─────────────────────
# Maps program name keywords → GATE paper code(s)
# Ordered from most specific to most general.
# Sources: CCMT official portal descriptions + GATE syllabus matches
KEYWORD_PAPER_MAP = [
    # CS/IT
    ('computer science', 'CS'),
    ('information technology', 'CS'),
    ('information security', 'CS'),
    ('cyber security', 'CS'),
    ('software engineering', 'CS'),
    ('advanced computing', 'CS'),
    ('data analytics', 'CS/DA'),
    ('data science', 'CS/DA'),
    ('artificial intelligence & data', 'CS/DA'),
    ('artificial intelligence and data', 'CS/DA'),
    ('artificial intelligence and machine learning', 'CS/DA'),
    ('artificial intelligence', 'CS/DA'),
    ('machine learning', 'CS/DA'),
    ('cognitive systems', 'CS/DA/EC'),
    ('human computer interaction', 'CS'),
    ('internet of things', 'CS/EC'),
    ('geoinformatics', 'CS/EC/CE'),

    # ECE / Signal Processing / VLSI
    ('vlsi', 'EC'),
    ('signal processing', 'EC/EE'),
    ('communication systems', 'EC'),
    ('communication engineering', 'EC'),
    ('electronics', 'EC'),
    ('embedded systems', 'EC/EE/IN'),
    ('wireless', 'EC'),
    ('photonics', 'EC/PH'),
    ('rf and microwave', 'EC'),
    ('microelectronics', 'EC'),
    ('automotive electronics', 'EC/EE'),

    # EE / Power
    ('power systems', 'EE'),
    ('power electronics', 'EE'),
    ('smart grid', 'EE'),
    ('renewable energy', 'EE'),
    ('electric vehicles', 'EE/ME'),
    ('energy engineering', 'EE/ME'),
    ('industrial automation', 'EE/EC/IN'),
    ('process control and instrumentation', 'IN'),
    ('instrumentation', 'IN'),
    ('control systems', 'EE/IN'),
    ('automation and robotics', 'EE/EC/ME'),

    # ME / Manufacturing
    ('mechanical engineering', 'ME'),
    ('thermal', 'ME'),
    ('manufacturing technology', 'ME/PI'),
    ('advanced manufacturing', 'ME/PI'),
    ('additive manufacturing', 'ME'),
    ('industrial engineering', 'ME/PI'),
    ('industrial safety', 'ME/CE'),
    ('automobile engineering', 'ME'),
    ('automotive engineering', 'ME'),
    ('machine design', 'ME'),
    ('cad', 'ME'),
    ('cam', 'ME/PI'),
    ('welding engineering', 'ME'),
    ('non destructive testing', 'ME'),
    ('production engineering', 'ME/PI'),
    ('mechatronics', 'ME'),
    ('robotics', 'ME/CS/EC'),
    ('smart manufacturing', 'ME/CS/EC'),
    ('mobility engineering', 'ME/CS/EC'),

    # CE / Structural
    ('structural engineering', 'CE'),
    ('geotechnical engineering', 'CE'),
    ('transportation engineering', 'CE'),
    ('environmental engineering', 'CE'),
    ('water resources', 'CE'),
    ('construction management', 'CE'),
    ('urban planning', 'CE/AR'),
    ('civil engineering', 'CE'),
    ('architecture', 'AR'),

    # CH / Chemical
    ('chemical engineering', 'CH'),
    ('biochemical engineering', 'BT/CH'),
    ('bioprocess engineering', 'BT/CH'),
    ('petroleum engineering', 'CH'),
    ('polymer engineering', 'CH/XE'),
    ('pharmaceutical engineering', 'CH/BT'),
    ('process engineering', 'CH'),

    # Biomedical
    ('biomedical engineering', 'BM/BT/EC/EE'),
    ('biomedical devices', 'BM/BT/EC'),
    ('bioinformatics', 'BT/DA'),
    ('biotechnology', 'BT'),
    ('biological engineering', 'BT'),

    # Materials / Metallurgy / Mining
    ('material science', 'MT'),
    ('materials science', 'MT'),
    ('metallurgy', 'MT'),
    ('mining engineering', 'MN'),
    ('mineral processing', 'MN'),
    ('corrosion', 'MT'),
    ('industrial metallurgy', 'MT'),

    # Aerospace
    ('aerospace engineering', 'AE'),
    ('aeronautical engineering', 'AE'),
    ('aerodynamics', 'AE'),
    ('flight mechanics', 'AE'),
    ('propulsion', 'AE'),
    ('unmanned aerial', 'AE'),

    # Applied sciences
    ('engineering physics', 'PH'),
    ('applied physics', 'PH'),
    ('quantum technology', 'PH/CS'),
    ('nano', 'PH/CH/MT'),
    ('mathematics', 'MA'),
    ('operations research', 'MA'),
    ('statistics', 'MA'),
    ('geological', 'GG'),
    ('geophysics', 'GG'),
    ('earth science', 'GG'),
    ('agricultural engineering', 'AG'),
    ('food technology', 'AG/XE'),

    # General / Interdisciplinary (catch-all)
    ('energy efficient', 'CE/ME'),
    ('sustainable', 'CE/ME/CH'),
    ('management sciences', 'CS/EC/ME/CE'),
    ('technology management', 'CS/EC/ME'),
    ('systems science', 'CS/EC/ME/EE'),
]


# ── Program code → paper (for IIT short codes) ──────────────────────────────
# IIT Delhi program codes decoded from official brochure
PROGRAM_CODE_PAPER_MAP = {
    # IIT Delhi codes
    'AIB': 'CS/DA',            # AI & related — AI/Bioinformatics
    'AMA': 'ALL',              # ALL papers
    'AST': 'XE/PH/MA/GG/AG/CE/CH/ME/AE',  # Atmosphere & Ocean Science
    'BEM': 'BT/CH',           # Biochemical Engineering
    'BMT': 'BM/BT/EC/EE',     # Biomedical Technology
    'BRE': 'BT/CH',           # Bioprocess Engineering
    'CEG': 'CE',              # Civil Engg - Geotechnical
    'CEP': 'CE',              # Civil Engg - (various CE)
    'CES': 'CE',              # Civil Engg - Structural
    'CET': 'CE',              # Civil Engg - Transportation
    'CEU': 'CE',              # Civil Engg - Urban Planning
    'CEV': 'CE',              # Civil Engg - Environmental
    'CEW': 'CE',              # Civil Engg - Water Resources
    'CHE': 'CH',              # Chemical Engineering
    'CRF': 'ME',              # Combustion / Thermal
    'CSE': 'CS',              # Computer Science and Engineering
    'CSPML': 'CS/DA',         # CS with specialization in ML
    'EEA': 'AE/BM/BT/CH/SC/EC/EE/IN/ME',  # Energy Engineering (broad)
    'EEE': 'EC',              # EEE (Electronics)
    'EEN': 'CS/DA/EE/EC/IN/PH',  # Electrical Engineering (N-specialization)
    'EEP': 'EE/EC/IN',        # Power Electronics
    'EES': 'EE',              # Electrical Energy Systems
    'EET': 'CS/DA/EC',        # Embedded/Telecom
    'JCS': 'GATE',            # Joint CS — any GATE
    'JTM': 'GATE',            # Joint Telecom Management — any GATE
    'JRB': 'GATE',            # Joint Robotics — any GATE
    'MCS': 'CS',              # M.Tech CSE
    'MEE': 'ALL',             # Mechanical (broad)
    'MEM': 'ME/PI',           # Mfg Engg & Management
    'MEP': 'ME/PI',           # ME Production
    'MET': 'ME/PI',           # ME Thermal
    'MSM': 'MT',              # Materials Science
    'PHM': 'PH',              # Physics / Materials
    'TTE': 'ME/CE',           # Transportation Technology
    'TTP': 'ME/CE',           # Transport / Traffic Planning
    'AIR': 'CS/DA/EC',        # AI & Robotics

    # IIT Dharwad
    'CSPML': 'CS/DA',
    'Design': 'ME',
    'Manufacturing': 'ME/PI',
    'PEPS': 'PH/EE',

    # IIT Goa
    'Ch.E': 'CH',
    'MST': 'MT/PH',

    # Generic short codes
    'AI': 'CS/DA',
    'BT': 'BT',
    'CE1Y': 'CE', 'CE2N': 'CE', 'CE2Y': 'CE', 'CE3N': 'CE', 'CE3Y': 'CE',
    'CE4N': 'CE', 'CE4Y': 'CE', 'CE5N': 'CE', 'CE5Y': 'CE',
    'CE6N': 'CE', 'CE6Y': 'CE',
    'AE1N': 'AE', 'AE1Y': 'AE',
    'AM1N': 'ME', 'AM1Y': 'ME', 'AM2N': 'ME', 'AM2Y': 'ME',
    'BT1N': 'BT', 'BT1Y': 'BT',
    'AG3': 'AG',
    'BBE': 'BT/CH',
    'CS1Y': 'CS', 'CSA': 'CS',
    'DA1N': 'DA', 'DA1Y': 'DA', 'DAD': 'DA',
    'EE': 'EE', 'EE5': 'EE',
    'EEC': 'EE/EC', 'EEI': 'EE/IN', 'EEV': 'EE/ME',
    'ES': 'EE/ME',
    'CIE': 'CE', 'CIN': 'CE',
    'CL1Y': 'CE',
    'ED1N': 'CS/ME', 'ED1Y': 'CS/ME',
}

# Extended keyword map for program names not covered above
EXTENDED_KEYWORD_MAP = [
    ('autonomous systems', 'CS/EC/ME'),
    ('atmosphere and ocean', 'XE/GG/PH'),
    ('earth system science', 'GG/XE'),
    ('quantum computing', 'CS/PH'),
    ('quantum technology', 'PH/CS'),
    ('quantum and solid state', 'PH/EC'),
    ('semiconductor', 'EC/PH'),
    ('laser', 'PH/EC'),
    ('photonics', 'EC/PH'),
    ('optics', 'PH/EC'),
    ('sensor technology', 'EC/IN'),
    ('electric vehicle', 'EE/ME'),
    ('vehicle technology', 'ME/EE'),
    ('modeling and simulation', 'CS/ME/CE'),
    ('decision sciences', 'CS/ME'),
    ('systems engineering', 'CS/ME/EE'),
    ('industrial systems', 'ME/PI'),
    ('design engineering', 'ME'),
    ('machine intelligence', 'CS/DA/EC'),
    ('integrated circuits', 'EC'),
    ('lightweighting', 'ME'),
    ('mechanics and design', 'ME'),
    ('mechanics & design', 'ME'),
    ('thermo-fluid', 'ME'),
    ('thermofluid', 'ME'),
    ('smart mobility', 'CS/ME/EC'),
    ('techno-entrepreneurship', 'GATE'),
    ('e-waste', 'ME/CH'),
    ('climate change', 'CE/CH/GG'),
    ('water, climate', 'CE/GG'),
    ('space engineering', 'AE/PH'),
    ('space science', 'PH/AE'),
    ('IC design', 'EC'),
    ('dual degree program m.tech. (cse)', 'CS'),
    ('dual degree program m.tech. (it)', 'CS'),
    ('communication & signal', 'EC'),
    ('communcation & signal', 'EC'),
    ('communication signal', 'EC'),
    ('textil', 'ME/CH'),
    ('ceramic', 'MT/CH'),
    ('mine environment', 'MN'),
    ('mine planning', 'MN'),
    ('alloy technology', 'MT'),
    ('digital systems', 'EC/CS'),
    ('electrical machines', 'EE'),
    ('medical device', 'BM/BT/EC'),
    ('ophthalmic', 'BM/EC'),
    ('medical sensing', 'BM/EC'),
    ('integrated design', 'ME'),
    ('food engineering', 'AG/XE'),
    ('applied optics', 'PH/EC'),
    ('water resources', 'CE'),
    ('structural and construction', 'CE'),
]


def infer_paper_from_name(program: str):
    low = program.strip().lower()
    prog_stripped = program.strip()

    # Exact code match
    if prog_stripped in PROGRAM_CODE_PAPER_MAP:
        return PROGRAM_CODE_PAPER_MAP[prog_stripped]
    # Code match without asterisk
    prog_clean = prog_stripped.rstrip('*').strip()
    if prog_clean in PROGRAM_CODE_PAPER_MAP:
        return PROGRAM_CODE_PAPER_MAP[prog_clean]

    # Extended keyword match first (more specific)
    for kw, paper in EXTENDED_KEYWORD_MAP:
        if kw in low:
            return paper

    # Original keyword map
    for kw, paper in KEYWORD_PAPER_MAP:
        if kw in low:
            return paper

    # Special pattern: "ANY GATE PAPER" in program name
    if 'any gate' in low or 'all gate' in low:
        return 'GATE'

    # Regex: CCMT matrix codes like CE5Y, CH1N, CS1Y, DA1N, EC2N etc.
    # Format: 2-letter discipline prefix + digit + N/Y + optional *
    import re
    code_match = re.match(r'^([A-Z]{2,3})\d+[NY\*]', prog_stripped)
    if code_match:
        prefix = code_match.group(1)
        prefix_paper_map = {
            'CE': 'CE', 'CS': 'CS', 'EC': 'EC', 'EE': 'EE', 'ME': 'ME',
            'CH': 'CH', 'AE': 'AE', 'BT': 'BT', 'MT': 'MT', 'MN': 'MN',
            'IN': 'IN', 'PH': 'PH', 'MA': 'MA', 'GG': 'GG', 'AG': 'AG',
            'PI': 'PI', 'DA': 'DA', 'XE': 'XE', 'AR': 'AR', 'TF': 'TF',
            'CY': 'CY', 'ST': 'MA', 'GE': 'GG', 'BM': 'BM',
        }
        if prefix in prefix_paper_map:
            return prefix_paper_map[prefix]

    # Remaining full program name patterns
    remaining_kw = [
        ('bioengineering', 'BT/BM/EC'),
        ('civil and infrastructure', 'CE'),
        ('communication & networks', 'EC'),
        ('communication system', 'EC'),
        ('computer engineering', 'CS'),
        ('computer networking', 'CS/EC'),
        ('computer integrated manufacturing', 'CS/ME/PI'),
        ('construction technology', 'CE'),
        ('control & automation', 'EE/IN'),
        ('control system', 'EE/IN'),
        ('control and automation', 'EE/IN'),
        ('cyber forensics', 'CS'),
        ('image processing', 'CS/EC'),
        ('network security', 'CS'),
        ('energy storage', 'EE/CH/ME'),
        ('heat transfer', 'ME'),
        ('fluid mechanics', 'ME/XE'),
        ('nanoelectronics', 'EC/PH'),
        ('nanoscience', 'PH/CH/MT'),
        ('microsystem', 'EC/ME'),
        ('computational mechanics', 'ME/CE'),
        ('communication networks', 'EC'),
        ('computational fluid', 'ME/AE/CE'),
        ('infrastructure engineering', 'CE'),
        ('power system', 'EE'),
        ('structural health', 'CE'),
        ('electromagnetic', 'EC/EE/PH'),
        ('signal & image', 'EC'),
        ('signal and image', 'EC'),
        ('advanced materials', 'MT/CH'),
        ('tribology', 'ME'),
        ('turbo machinery', 'ME/AE'),
        ('reliability engineering', 'ME'),
        ('supply chain', 'ME/PI'),
        ('logistics', 'ME/PI/CS'),
        ('health informatics', 'CS/BT'),
        ('bioinstrumentation', 'BM/IN'),
        ('computational biology', 'BT/CS'),
        ('computational fluid dynamics', 'ME/AE'),
        ('heat power', 'ME'),
        ('geo-technical', 'CE'),
        ('geotech', 'CE'),
        ('transportation', 'CE'),
        ('pavement', 'CE'),
        ('remote sensing', 'CE/GG/CS'),
        ('gis', 'CE/CS/GG'),
        ('environmental science', 'CE/CH'),
        ('chemical technology', 'CH'),
        ('energy and environment', 'CH/ME/CE'),
        ('advanced signal', 'EC'),
        ('bioelectronics', 'EC/BM'),
        ('process systems', 'CH'),
        # Final batch
        ('data engineering', 'CS/DA'),
        ('defence technology', 'ME/AE'),
        ('design & manufacturing', 'ME/PI'),
        ('design and automation', 'ME'),
        ('dual degree m.tech', 'CS'),
        ('earthquake engineering', 'CE'),
        ('electrical engineering', 'EE'),
        ('electrical power', 'EE'),
        ('electronic systems', 'EC'),
        ('embedded system', 'EC/EE/IN'),
        ('energy science', 'EE/ME/CH'),
        ('energy systems', 'EE/ME/CH'),
        ('energy technology', 'EE/ME/CH'),
        ('engineering education', 'GATE'),
        ('engineering structures', 'CE'),
        ('environmental management', 'CE/CH'),
        ('geomatics', 'CE/CS'),
        ('hydrological', 'CE'),
        ('industrial design', 'ME'),
        ('integrated product', 'ME'),
        ('machine design', 'ME'),
        ('mechanical systems', 'ME'),
        ('micro and nano', 'EC/ME/PH'),
        ('microwave', 'EC'),
        ('ocean engineering', 'CE/ME'),
        ('optical', 'EC/PH'),
        ('petroleum', 'CH'),
        ('precision engineering', 'ME'),
        ('process control', 'CH/IN'),
        ('radar', 'EC'),
        ('rock mechanics', 'MN/CE'),
        ('soil mechanics', 'CE'),
        ('soil and water', 'CE/AG'),
        ('solid state', 'PH/EC'),
        ('structural dynamics', 'CE'),
        ('systems and control', 'EE/IN'),
        ('thermal engineering', 'ME'),
        ('thermal power', 'ME'),
        ('traffic engineering', 'CE'),
        ('urban water', 'CE'),
        ('waste management', 'CE/CH'),
        ('waveguide', 'EC'),
        ('wind energy', 'EE/ME'),
    ]
    for kw, paper in remaining_kw:
        if kw in low:
            return paper

    return None


def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ── Strategy 1: propagate from same (institute, program) with paper ──
    print('Step 1: Propagating paper from existing rows...')
    c.execute("""
        SELECT DISTINCT institute, program, paper
        FROM Cutoff
        WHERE examType = 'GATE'
          AND paper IS NOT NULL AND paper != ''
          AND paper NOT LIKE 'IIT graduates%'
    """)
    propagate_map: dict[tuple, str] = {}
    for row in c.fetchall():
        key = (row[0], row[1])
        if key not in propagate_map:
            propagate_map[key] = row[2]

    updated_prop = 0
    for (institute, program), paper in propagate_map.items():
        c.execute("""
            UPDATE Cutoff
            SET paper = ?
            WHERE examType = 'GATE'
              AND institute = ?
              AND program = ?
              AND (paper IS NULL OR paper = '')
        """, (paper, institute, program))
        updated_prop += c.rowcount

    print(f'  Propagated to {updated_prop:,} rows')

    # ── Strategy 2: keyword inference for remaining NULL rows ────────────────
    print('Step 2: Keyword inference for remaining NULL-paper rows...')
    c.execute("""
        SELECT id, program FROM Cutoff
        WHERE examType = 'GATE'
          AND (paper IS NULL OR paper = '')
    """)
    rows = c.fetchall()
    print(f'  {len(rows):,} rows still missing paper')

    updated_kw = 0
    skipped = 0
    for row_id, program in rows:
        inferred = infer_paper_from_name(program)
        if inferred:
            c.execute("UPDATE Cutoff SET paper = ? WHERE id = ?", (inferred, row_id))
            updated_kw += 1
        else:
            skipped += 1

    print(f'  Keyword-inferred: {updated_kw:,}')
    print(f'  Still NULL: {skipped:,}')

    conn.commit()

    # ── Verify ───────────────────────────────────────────────────────────────
    c.execute("SELECT COUNT(*) FROM Cutoff WHERE examType='GATE' AND (paper IS NULL OR paper='')")
    remaining = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM Cutoff WHERE examType='GATE' AND paper IS NOT NULL AND paper != ''")
    covered = c.fetchone()[0]
    print(f'\n=== Final coverage ===')
    print(f'  With paper:    {covered:,}')
    print(f'  Without paper: {remaining:,}')
    print(f'  Coverage: {covered/(covered+remaining)*100:.1f}%')

    # Show still-missing
    if remaining > 0:
        print(f'\n  Still missing paper (sample):')
        c.execute("""SELECT DISTINCT program FROM Cutoff 
            WHERE examType='GATE' AND (paper IS NULL OR paper='') 
            ORDER BY program LIMIT 30""")
        for r in c.fetchall():
            print(f'    {r[0]!r}')

    conn.close()


if __name__ == '__main__':
    main()
