/**
 * College logo URLs — mapped by partial institute name.
 * Uses official logos from Wikipedia/Wikimedia (public domain) and
 * fallback colored initials for unmatched institutes.
 */

interface LogoEntry {
  url: string
  bg?: string // fallback background color for initials avatar
}

// Key = lowercase substring to match against institute name
const LOGO_MAP: Record<string, LogoEntry> = {
  // ── IITs ──────────────────────────────────────────────────────────
  'iit bombay': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Indian_Institute_of_Technology_Bombay_Logo.svg/1200px-Indian_Institute_of_Technology_Bombay_Logo.svg.png',
  },
  'iit delhi': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/IIT_Delhi_logo.svg/1200px-IIT_Delhi_logo.svg.png',
  },
  'iit madras': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/1200px-IIT_Madras_Logo.svg.png',
  },
  'iit kanpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/IIT_Kanpur_Logo.svg/1200px-IIT_Kanpur_Logo.svg.png',
  },
  'iit kharagpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/1200px-IIT_Kharagpur_Logo.svg.png',
  },
  'iit roorkee': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/IIT_Roorkee_Logo.svg/1200px-IIT_Roorkee_Logo.svg.png',
  },
  'iit guwahati': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/IIT_Guwahati_Logo.svg/1200px-IIT_Guwahati_Logo.svg.png',
  },
  'iit hyderabad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Indian_Institute_of_Technology_Hyderabad_Logo.png/120px-Indian_Institute_of_Technology_Hyderabad_Logo.png',
  },
  'iit bhu': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/IIT_BHU_logo.svg/1200px-IIT_BHU_logo.svg.png',
  },
  'iit jodhpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/IIT_Jodhpur_logo.svg/1200px-IIT_Jodhpur_logo.svg.png',
  },
  'iit gandhinagar': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/IIT_Gandhinagar_Logo.svg/1200px-IIT_Gandhinagar_Logo.svg.png',
  },
  'iit indore': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/IIT_Indore_Color_Logo.svg/1200px-IIT_Indore_Color_Logo.svg.png',
  },
  'iit patna': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/IIT_Patna_Logo.svg/1200px-IIT_Patna_Logo.svg.png',
  },
  'iit mandi': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/IIT_Mandi_logo.svg/1200px-IIT_Mandi_logo.svg.png',
  },
  'iit tirupati': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/IIT_Tirupati_logo.png/120px-IIT_Tirupati_logo.png',
  },
  'iit palakkad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/IIT_Palakkad_logo.png/120px-IIT_Palakkad_logo.png',
  },
  'iit dharwad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/IIT_Dharwad_Logo.png/120px-IIT_Dharwad_Logo.png',
  },

  // ── NITs ──────────────────────────────────────────────────────────
  'nit trichy': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/NIT_Trichy_Logo.svg/1200px-NIT_Trichy_Logo.svg.png',
  },
  'nit warangal': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/NIT_Warangal_Logo.svg/1200px-NIT_Warangal_Logo.svg.png',
  },
  'nit surathkal': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/37/National_Institute_of_Technology%2C_Karnataka_Logo.svg/1200px-National_Institute_of_Technology%2C_Karnataka_Logo.svg.png',
  },
  'nit calicut': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/National_Institute_of_Technology_Calicut_logo.svg/1200px-National_Institute_of_Technology_Calicut_logo.svg.png',
  },
  'nit rourkela': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/NIT_Rourkela_Logo.svg/1200px-NIT_Rourkela_Logo.svg.png',
  },
  'nit allahabad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Motilal_Nehru_National_Institute_of_Technology_Logo.svg/1200px-Motilal_Nehru_National_Institute_of_Technology_Logo.svg.png',
  },
  'motilal nehru': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Motilal_Nehru_National_Institute_of_Technology_Logo.svg/1200px-Motilal_Nehru_National_Institute_of_Technology_Logo.svg.png',
  },
  'nit jaipur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/MNIT_jaipur.png/120px-MNIT_jaipur.png',
  },
  malaviya: {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/MNIT_jaipur.png/120px-MNIT_jaipur.png',
  },
  'nit durgapur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/NIT_Durgapur_logo.svg/1200px-NIT_Durgapur_logo.svg.png',
  },
  'nit silchar': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/NIT_Silchar_Logo.svg/1200px-NIT_Silchar_Logo.svg.png',
  },
  'nit surat': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Svnit_logo.png/120px-Svnit_logo.png',
  },
  'sardar vallabhbhai': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Svnit_logo.png/120px-Svnit_logo.png',
  },
  'nit kurukshetra': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/NIT_Kurukshetra_logo.png/120px-NIT_Kurukshetra_logo.png',
  },
  'nit nagpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/VNIT_Nagpur_Logo.svg/1200px-VNIT_Nagpur_Logo.svg.png',
  },
  visvesvaraya: {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/VNIT_Nagpur_Logo.svg/1200px-VNIT_Nagpur_Logo.svg.png',
  },
  'nit bhopal': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Maulana_Azad_National_Institute_of_Technology_Logo.png/120px-Maulana_Azad_National_Institute_of_Technology_Logo.png',
  },
  'maulana azad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Maulana_Azad_National_Institute_of_Technology_Logo.png/120px-Maulana_Azad_National_Institute_of_Technology_Logo.png',
  },
  'nit hamirpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/49/NIT_Hamirpur_logo.png/120px-NIT_Hamirpur_logo.png',
  },
  'nit srinagar': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/National_Institute_of_Technology_Srinagar_Logo.png/120px-National_Institute_of_Technology_Srinagar_Logo.png',
  },
  'nit jamshedpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/NIT_Jamshedpur_logo.png/120px-NIT_Jamshedpur_logo.png',
  },
  'nit meghalaya': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/NIT_Meghalaya_Logo.png/120px-NIT_Meghalaya_Logo.png',
  },
  'nit agartala': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/National_Institute_of_Technology_Agartala_logo.png/120px-National_Institute_of_Technology_Agartala_logo.png',
  },
  'nit puducherry': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/NIT_Puducherry_logo.png/120px-NIT_Puducherry_logo.png',
  },
  'nit goa': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/National_Institute_of_Technology_Goa_logo.png/120px-National_Institute_of_Technology_Goa_logo.png',
  },
  'nit manipur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/45/National_Institute_of_Technology_Manipur_Logo.png/120px-National_Institute_of_Technology_Manipur_Logo.png',
  },
  'nit mizoram': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/NIT_Mizoram_logo.png/120px-NIT_Mizoram_logo.png',
  },
  'nit sikkim': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/National_Institute_of_Technology_Sikkim_logo.png/120px-National_Institute_of_Technology_Sikkim_logo.png',
  },
  'nit arunachal': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/NIT_Arunachal_Pradesh_logo.png/120px-NIT_Arunachal_Pradesh_logo.png',
  },
  'nit andhra': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/National_Institute_of_Technology_Andhra_Pradesh_Logo.png/120px-National_Institute_of_Technology_Andhra_Pradesh_Logo.png',
  },

  // ── IIITs ─────────────────────────────────────────────────────────
  'iiit hyderabad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/IIIT_Hyderabad_Logo.svg/1200px-IIIT_Hyderabad_Logo.svg.png',
  },
  'iiit allahabad': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/IIIT_Allahabad_Logo.png/120px-IIIT_Allahabad_Logo.png',
  },
  'iiit bangalore': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/IIIT-Bangalore-Logo.png/120px-IIIT-Bangalore-Logo.png',
  },
  'iiit gwalior': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Iiitm_logo.png/120px-Iiitm_logo.png',
  },
  'iiit jabalpur': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/IIITDM_Jabalpur_logo.png/120px-IIITDM_Jabalpur_logo.png',
  },
  'iiit kancheepuram': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/IIITDM_Kancheepuram_logo.png/120px-IIITDM_Kancheepuram_logo.png',
  },
  'iiit kurnool': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/IIIT_Kurnool_logo.png/120px-IIIT_Kurnool_logo.png',
  },
  'iiit lucknow': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/IIIT_Lucknow_Logo.png/120px-IIIT_Lucknow_Logo.png',
  },
  'iiit pune': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/IIIT_Pune_Logo.png/120px-IIIT_Pune_Logo.png',
  },
  'iiit vadodara': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/IIIT_Vadodara_Logo.png/120px-IIIT_Vadodara_Logo.png',
  },
  'iiit sri city': {
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/ff/IIIT-Sri-City-logo.png/120px-IIIT-Sri-City-logo.png',
  },
}

/**
 * Get the best-fit logo entry for an institute name.
 * Tries exact then progressive substring matches.
 */
export function getCollegeLogo(instituteName: string): string | null {
  const lower = instituteName.toLowerCase()
  for (const [key, entry] of Object.entries(LOGO_MAP)) {
    if (lower.includes(key)) return entry.url
  }
  return null
}

/**
 * Maps name fragment → student abbreviation. ORDERING IS CRITICAL — first match wins.
 *
 * DB storage forms observed:
 *  - IITs: both "IIT Delhi" (short) AND "Indian Institute of Technology Bombay" (full)
 *  - NITs: always full "National Institute of Technology [City]"
 *  - IIITs: both "IIIT Hyderabad" and "Indian Institute of Information Technology [City]"
 *           and "(IIIT) [City]" parenthesised variants (handled by paren-stripping in normaliser)
 *
 * Strategy:
 *  1. IISc
 *  2. IITs — 'iit [city]' keys (short form) then 'indian institute of technology [city]' (full form)
 *     Full-form IIT keys MUST come before generic 'technology [city]' NIT patterns
 *  3. Named NITs — distinctive prefix (motilal nehru, malaviya, sardar, visvesvaraya, maulana azad)
 *  4. IIITs with conflict-prone cities first ('information technology tiruchirappalli',
 *     'information technology agartala', etc.) then general IIIT patterns
 *  5. GFTIs & universities (before generic 'technology [city]' to avoid false NIT matches)
 *  6. Generic NITs — 'technology [city]'
 */
const ABBREV_MAP: [string, string][] = [
  // ── IISc ─────────────────────────────────────────────────────────────────
  ['iisc', 'IISc'],

  // ── IITs: abbreviated "IIT [City]" form in DB ────────────────────────────
  ['iit bhu', 'IIT BHU'], // "IIT BHU" plain + "(BHU)" after paren-strip
  ['technology bhu', 'IIT BHU'], // "Indian Institute of Technology (BHU) Varanasi" after paren-strip
  ['banaras hindu university', 'IIT BHU'],
  ['iit ism', 'IIT ISM'], // "IIT ISM Dhanbad" + "(ISM)" after paren-strip
  ['ism dhanbad', 'IIT ISM'],
  ['iit kharagpur', 'IITKGP'],
  ['iit gandhinagar', 'IITGN'],
  ['iit guwahati', 'IITG'],
  ['iit hyderabad', 'IITH'],
  ['iit roorkee', 'IITR'],
  ['iit bombay', 'IITB'],
  ['iit madras', 'IITM'],
  ['iit kanpur', 'IITK'],
  ['iit delhi', 'IITD'],
  ['iit jodhpur', 'IITJ'],
  ['iit indore', 'IITI'],
  ['iit patna', 'IITP'],
  ['iit mandi', 'IITMdi'],
  ['iit tirupati', 'IITTU'],
  ['iit palakkad', 'IITPkd'],
  ['iit dharwad', 'IITDhw'],
  ['iit ropar', 'IITRpr'],
  ['iit bhilai', 'IITBhl'],
  ['iit jammu', 'IITJMU'],
  ['iit goa', 'IITGoa'],
  ['iit bhubaneswar', 'IITBbs'],
  ['iit tirupati', 'IITTU'],

  // ── IITs: full "Indian Institute of Technology [City]" form in DB ─────────
  // MUST come before generic 'technology [city]' NIT patterns
  ['indian institute of technology bhubaneswar', 'IITBbs'],
  ['indian institute of technology bombay', 'IITB'],
  ['indian institute of technology kanpur', 'IITK'],
  ['indian institute of technology madras', 'IITM'],
  ['indian institute of technology kharagpur', 'IITKGP'],
  ['indian institute of technology roorkee', 'IITR'],
  ['indian institute of technology guwahati', 'IITG'],
  ['indian institute of technology hyderabad', 'IITH'],
  ['indian institute of technology gandhinagar', 'IITGN'],
  ['indian institute of technology jodhpur', 'IITJ'],
  ['indian institute of technology indore', 'IITI'],
  ['indian institute of technology mandi', 'IITMdi'],
  ['indian institute of technology tirupati', 'IITTU'],
  ['indian institute of technology palakkad', 'IITPkd'],
  ['indian institute of technology dharwad', 'IITDhw'],
  ['indian institute of technology ropar', 'IITRpr'],
  ['indian institute of technology bhilai', 'IITBhl'],
  ['indian institute of technology jammu', 'IITJMU'],
  ['indian institute of technology delhi', 'IITD'],
  ['indian institute of technology goa', 'IITGoa'],
  ['indian institute of technology patna', 'IITP'],

  // ── Named NITs ────────────────────────────────────────────────────────────
  ['motilal nehru', 'MNNIT'],
  ['malaviya national', 'MNIT'],
  ['sardar vallabhbhai', 'SVNIT'],
  ['visvesvaraya', 'VNIT'],
  ['maulana azad', 'MANIT'],

  // ── IIITs with conflict-prone city names — must precede NIT city patterns ─
  ['information technology tiruchirappalli', 'IIITTri'], // before 'technology tiruchirappalli'→NITT
  ['information technology agartala', 'IIITAgt'], // before 'agartala'→NITA
  ['information technology bhubaneswar', 'IIITBbs'], // before any 'technology bhubaneswar'
  ['information technology naya raipur', 'IIITNRpr'], // before 'technology raipur'→NITRPR

  // ── IIITs — general (both short "IIIT [City]" and full-name forms) ────────
  ['indraprastha institute', 'IIITD'],
  ['iiit hyderabad', 'IIITH'],
  ['information technology hyderabad', 'IIITH'],
  ['iiit allahabad', 'IIITA'],
  ['information technology allahabad', 'IIITA'],
  ['iiit bangalore', 'IIITB'],
  ['information technology bangalore', 'IIITB'],
  ['iiit delhi', 'IIITD'],
  ['information technology delhi', 'IIITD'],
  ['atal bihari', 'IIITM'],
  ['iiit gwalior', 'IIITM'],
  ['information technology gwalior', 'IIITM'],
  ['gwalior', 'IIITM'],
  ['iiit nagpur', 'IIITNgp'],
  ['information technology nagpur', 'IIITNgp'],
  ['kancheepuram', 'IIITDMK'],
  ['dwarka prasad', 'IIITDMJ'],
  ['iiit jabalpur', 'IIITDMJ'],
  ['information technology jabalpur', 'IIITDMJ'],
  ['iiit kurnool', 'IIITK'],
  ['information technology kurnool', 'IIITK'],
  ['kurnool', 'IIITK'], // "Design and Manufacturing, Kurnool" — city after comma
  ['iiit lucknow', 'IIITL'],
  ['information technology lucknow', 'IIITL'],
  ['iiit pune', 'IIITP'],
  ['information technology pune', 'IIITP'],
  ['iiit vadodara', 'IIITV'],
  ['information technology vadodara', 'IIITV'],
  ['iiit sri city', 'IIITSC'],
  ['information technology sri city', 'IIITSC'],
  ['iiit guwahati', 'IIITGhy'],
  ['information technology guwahati', 'IIITGhy'],
  ['iiit sonepat', 'IIITSnp'],
  ['information technology sonepat', 'IIITSnp'],
  ['kilohrad', 'IIITSnp'], // "IIIT Kilohrad, Sonepat" variant
  ['sonepat', 'IIITSnp'],
  ['iiit bhopal', 'IIITBpl'],
  ['information technology bhopal', 'IIITBpl'],
  ['iiit senapati', 'IIITMni'],
  ['information technology senapati', 'IIITMni'], // all-caps full name form
  ['iiit una', 'IIITUna'],
  ['information technology una', 'IIITUna'],
  ['iiit ranchi', 'IIITRnc'],
  ['information technology ranchi', 'IIITRnc'],
  ['iiit surat', 'IIITSrt'],
  ['information technology surat', 'IIITSrt'],
  // NOTE: 'surat' standalone removed — it matched "Surathkal" (NITK). After paren-stripping,
  //       "(IIIT) Surat" becomes "iiit surat" which matches above.
  ['iiit kalyani', 'IIITKlni'],
  ['information technology kalyani', 'IIITKlni'],
  ['iiit dharwad', 'IIITDhw'],
  ['information technology dharwad', 'IIITDhw'],
  ['iiit kota', 'IIITKota'],
  ['information technology kota', 'IIITKota'],
  ['information technology bhagalpur', 'IIITBhg'],
  ['iiit bhagalpur', 'IIITBhg'],
  ['information technology raichur', 'IIITRcr'],
  ['iiit raichur', 'IIITRcr'],
  ['iiit kottayam', 'IIITKtm'],
  ['information technology kottayam', 'IIITKtm'],

  // ── GFTIs & universities — MUST come before generic 'technology [city]' ───
  ['gati shakti', 'GSV'], // before 'vadodara'→IIITV
  ['space science', 'IIST'],
  ['shibpur', 'IIEST'],
  ['bengal engineering', 'IIEST'],
  ['national institute of electronics', 'NIELIT'],
  ['nielit', 'NIELIT'],
  ['nitttr', 'NITTTR'], // catches "(NITTTR)" after paren-strip
  ['teachers training', 'NITTTR'],
  ['defence institute of advanced technology', 'DIAT'],
  ['jawaharlal nehru university', 'JNU'],
  ['punjab engineering college', 'PEC'],
  ['sant longowal', 'SLIET'],
  ['school of planning & architecture', 'SPA'],
  ['school of planning and architecture', 'SPA'],
  ['national institute of foundry', 'NIFFT'],
  ['tezpur university', 'TezU'],
  ['university of hyderabad', 'UoH'],
  ['delhi technological university', 'DTU'],
  ['netaji subhas', 'NSUT'],
  ['birla institute of technology', 'BIT Mesra'],
  ['institute of chemical technology', 'ICT Mumbai'],
  ['central institute of technology', 'CITKjr'], // CIT Kokrajhar; before generic 'technology'
  ['handloom technology', 'IIHT'],
  ['carpet technology', 'IICT'],
  ['maritime university', 'IMU'],
  ['indira gandhi delhi technical', 'IGDTUW'],
  ['institute of infrastructure', 'IIITRAM'],
  ['islamic university of science', 'IUST'],
  ['gour university', 'DHSGSU'],
  ['manipal institute of technology', 'MIT Manipal'],
  ['mizoram university', 'MZU'],
  ['advanced manufacturing technology', 'NIAMT'],
  ['food technology entrepreneurship', 'NIFTEM'],
  ['north eastern regional institute of science', 'NERIST'],
  ['north-eastern hill university', 'NEHU'],
  ['deendayal energy', 'PDEU'],
  ['puducherry technological university', 'PTU'], // before 'technology puducherry'→NITPY
  ['rajiv gandhi national aviation', 'RGNAU'],
  ['sardar patel university of police', 'SPUPSJ'],
  ['g. s. institute of technology', 'SGSITS'],
  ['vaishno devi', 'SMVDU'],
  ['sree chitra', 'SCTIMST'],
  ['csvtu', 'CSVTU'],
  ['assam university', 'AUSilchar'],
  ['central university of haryana', 'CUH'],
  ['central university of jammu', 'CUJammu'],
  ['central university of kashmir', 'CUK'],
  ['central university of punjab', 'CUP'],
  ['central university of rajasthan', 'CURAJ'],
  ['cu jharkhand', 'CUJhk'],
  ['gautam buddha', 'GBU'],
  ['ghani khan', 'GKCIET'],
  ['guru ghasidas', 'GGV'],
  ['gurukula kangri', 'GKV'],
  ['j.k. institute', 'JKIAP'],

  // ── Generic NITs: 'technology [city]' matches "National Institute of
  //    Technology [City]" but NOT "IIT [City]" (abbreviated form) ─────────────
  ['technology tiruchirappalli', 'NITT'],
  ['technology warangal', 'NITW'],
  ['technology karnataka', 'NITK'],
  ['surathkal', 'NITK'],
  ['technology calicut', 'NITC'],
  ['technology rourkela', 'NITR'],
  ['technology jamshedpur', 'NITJSR'],
  ['technology hamirpur', 'NITH'],
  ['technology silchar', 'NITS'],
  ['technology durgapur', 'NITDGP'],
  ['technology kurukshetra', 'NITKKR'],
  ['technology agartala', 'NITA'],
  ['agartala', 'NITA'],
  ['technology meghalaya', 'NITMGH'],
  ['technology manipur', 'NITMN'],
  ['technology mizoram', 'NITMZ'],
  ['technology sikkim', 'NITSKM'],
  ['technology puducherry', 'NITPY'],
  ['technology arunachal', 'NITARU'],
  ['technology uttarakhand', 'NITUK'],
  ['technology nagaland', 'NITNGL'],
  ['technology srinagar', 'NITSRI'],
  ['technology raipur', 'NITRPR'],
  ['technology jalandhar', 'NITJ'],
  ['technology andhra pradesh', 'NITAP'],
  ['technology andhra', 'NITAP'],
  ['technology patna', 'NITP'],
  ['technology delhi', 'NITD'],
  ['technology goa', 'NITG'],

  // ── Broad fallbacks ───────────────────────────────────────────────────────
  ['vadodara', 'IIITV'], // IIIT Vadodara campus variants (after 'gati shakti' above)
]

/** Returns the well-known student abbreviation for an institute, or null. */
export function getInstituteAbbreviation(name: string): string | null {
  // Normalise: lowercase, strip commas/parens, collapse whitespace
  // Paren-stripping fixes "(IIIT) Nagpur", "(BHU) Varanasi", "(NITTTR) Bhopal", etc.
  const lower = name.toLowerCase().replace(/[,()]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const [key, abbrev] of ABBREV_MAP) {
    if (lower.includes(key)) return abbrev
  }
  return null
}

/**
 * Returns label (abbreviation or 2-char initials) + background color for badge fallback.
 */
export function getInstituteInitials(name: string): { initials: string; bg: string } {
  const abbrev = getInstituteAbbreviation(name)
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials =
    abbrev ??
    (words.length === 1
      ? words[0].slice(0, 2).toUpperCase()
      : (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase())

  // Deterministic color from name
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const colors = [
    '#1d4ed8',
    '#7c3aed',
    '#db2777',
    '#059669',
    '#d97706',
    '#0891b2',
    '#dc2626',
    '#65a30d',
  ]
  const bg = colors[Math.abs(hash) % colors.length]
  return { initials, bg }
}
