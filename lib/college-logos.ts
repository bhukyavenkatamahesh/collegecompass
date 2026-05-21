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
 * Generate initials avatar (2 chars) + bg color for unknown institutes.
 */
export function getInstituteInitials(name: string): { initials: string; bg: string } {
  const words = name.trim().split(/\s+/).filter(Boolean)
  let initials = ''
  if (words.length === 1) {
    initials = words[0].slice(0, 2).toUpperCase()
  } else {
    initials = (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
  }

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
