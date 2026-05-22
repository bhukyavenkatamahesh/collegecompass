import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// ── GATE CCMT 2025 cutoffs (score-based, CS paper) ───────────────────────────
// Columns: institute | program | instituteType | state | category | openScore | closeScore
// openScore = highest scorer admitted (round 1), closeScore = last score admitted (final round)

type Row = {
  institute: string
  program: string
  instituteType: string
  state: string
  paper: string
  category: string
  openScore: number
  closeScore: number
}

function gateRows(
  institute: string,
  program: string,
  instituteType: string,
  state: string,
  paper: string,
  scores: Record<string, [number, number]>
): Row[] {
  return Object.entries(scores).map(([category, [open, close]]) => ({
    institute,
    program,
    instituteType,
    state,
    paper,
    category,
    openScore: open,
    closeScore: close,
  }))
}

// [openScore, closeScore] per category — higher = better for GATE
const GATE_DATA: Row[] = [
  // ── IITs (top tier) ────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Bombay',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Maharashtra',
    'CS',
    {
      GEN: [820, 710],
      EWS: [780, 660],
      OBC: [770, 630],
      SC: [690, 540],
      ST: [620, 470],
      'GEN-PwD': [700, 580],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Delhi',
    'M.Tech in Computer Technology',
    'IIT',
    'Delhi',
    'CS',
    {
      GEN: [850, 740],
      EWS: [810, 700],
      OBC: [800, 660],
      SC: [710, 560],
      ST: [650, 500],
      'GEN-PwD': [720, 600],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Madras',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Tamil Nadu',
    'CS',
    {
      GEN: [830, 720],
      EWS: [790, 680],
      OBC: [780, 640],
      SC: [700, 550],
      ST: [640, 485],
      'GEN-PwD': [710, 590],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Kharagpur',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'West Bengal',
    'CS',
    {
      GEN: [800, 690],
      EWS: [760, 645],
      OBC: [750, 610],
      SC: [670, 520],
      ST: [610, 455],
      'GEN-PwD': [680, 560],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Kanpur',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Uttar Pradesh',
    'CS',
    {
      GEN: [815, 705],
      EWS: [775, 660],
      OBC: [760, 625],
      SC: [680, 535],
      ST: [620, 465],
      'GEN-PwD': [690, 570],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Roorkee',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Uttarakhand',
    'CS',
    {
      GEN: [790, 670],
      EWS: [750, 630],
      OBC: [735, 595],
      SC: [655, 505],
      ST: [595, 440],
      'GEN-PwD': [665, 545],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Hyderabad',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Telangana',
    'CS',
    {
      GEN: [750, 630],
      EWS: [710, 585],
      OBC: [700, 555],
      SC: [620, 460],
      ST: [560, 400],
      'GEN-PwD': [630, 510],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Guwahati',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Assam',
    'CS',
    {
      GEN: [730, 610],
      EWS: [690, 565],
      OBC: [680, 535],
      SC: [600, 440],
      ST: [545, 380],
      'GEN-PwD': [610, 490],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Indore',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Madhya Pradesh',
    'CS',
    {
      GEN: [700, 580],
      EWS: [660, 540],
      OBC: [650, 510],
      SC: [575, 420],
      ST: [515, 360],
      'GEN-PwD': [585, 465],
    }
  ),
  // ── IITs (new/mid tier) ────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Gandhinagar',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Gujarat',
    'CS',
    {
      GEN: [670, 555],
      EWS: [630, 515],
      OBC: [620, 485],
      SC: [545, 395],
      ST: [490, 345],
      'GEN-PwD': [555, 440],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Jodhpur',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Rajasthan',
    'CS',
    {
      GEN: [645, 530],
      EWS: [605, 490],
      OBC: [595, 460],
      SC: [520, 375],
      ST: [465, 330],
      'GEN-PwD': [530, 420],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Patna',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Bihar',
    'CS',
    {
      GEN: [620, 505],
      EWS: [580, 465],
      OBC: [570, 435],
      SC: [495, 355],
      ST: [440, 315],
      'GEN-PwD': [505, 395],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Bhubaneswar',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Odisha',
    'CS',
    {
      GEN: [600, 480],
      EWS: [560, 440],
      OBC: [550, 410],
      SC: [475, 335],
      ST: [420, 295],
      'GEN-PwD': [485, 375],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Mandi',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Himachal Pradesh',
    'CS',
    {
      GEN: [580, 460],
      EWS: [540, 420],
      OBC: [530, 390],
      SC: [455, 315],
      ST: [400, 275],
      'GEN-PwD': [465, 355],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Ropar',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Punjab',
    'CS',
    {
      GEN: [565, 445],
      EWS: [525, 405],
      OBC: [515, 375],
      SC: [440, 300],
      ST: [388, 262],
      'GEN-PwD': [450, 340],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology (ISM) Dhanbad',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Jharkhand',
    'CS',
    {
      GEN: [545, 425],
      EWS: [505, 385],
      OBC: [495, 355],
      SC: [420, 282],
      ST: [370, 248],
      'GEN-PwD': [430, 320],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Tirupati',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Andhra Pradesh',
    'CS',
    {
      GEN: [550, 430],
      EWS: [510, 390],
      OBC: [500, 360],
      SC: [425, 285],
      ST: [375, 252],
      'GEN-PwD': [435, 325],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Palakkad',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Kerala',
    'CS',
    {
      GEN: [530, 415],
      EWS: [490, 375],
      OBC: [480, 345],
      SC: [405, 270],
      ST: [358, 238],
      'GEN-PwD': [415, 310],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Dharwad',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Karnataka',
    'CS',
    {
      GEN: [515, 400],
      EWS: [475, 360],
      OBC: [465, 332],
      SC: [392, 260],
      ST: [345, 228],
      'GEN-PwD': [402, 298],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Bhilai',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Chhattisgarh',
    'CS',
    {
      GEN: [500, 388],
      EWS: [462, 348],
      OBC: [452, 320],
      SC: [380, 250],
      ST: [335, 218],
      'GEN-PwD': [390, 286],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Jammu',
    'M.Tech in Computer Science and Engineering',
    'IIT',
    'Jammu and Kashmir',
    'CS',
    {
      GEN: [488, 375],
      EWS: [450, 336],
      OBC: [440, 308],
      SC: [368, 240],
      ST: [325, 208],
      'GEN-PwD': [378, 274],
    }
  ),
  // ── NITs ──────────────────────────────────────────────────────────────
  ...gateRows(
    'National Institute of Technology Tiruchirappalli',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Tamil Nadu',
    'CS',
    {
      GEN: [680, 555],
      EWS: [640, 512],
      OBC: [628, 480],
      SC: [545, 390],
      ST: [485, 335],
      'GEN-PwD': [558, 440],
    }
  ),
  ...gateRows(
    'National Institute of Technology Warangal',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Telangana',
    'CS',
    {
      GEN: [660, 540],
      EWS: [620, 498],
      OBC: [608, 465],
      SC: [525, 376],
      ST: [468, 322],
      'GEN-PwD': [538, 425],
    }
  ),
  ...gateRows(
    'National Institute of Technology Karnataka Surathkal',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Karnataka',
    'CS',
    {
      GEN: [640, 520],
      EWS: [600, 478],
      OBC: [588, 448],
      SC: [505, 360],
      ST: [450, 308],
      'GEN-PwD': [520, 408],
    }
  ),
  ...gateRows(
    'National Institute of Technology Calicut',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Kerala',
    'CS',
    {
      GEN: [615, 498],
      EWS: [578, 458],
      OBC: [565, 428],
      SC: [485, 342],
      ST: [430, 292],
      'GEN-PwD': [498, 388],
    }
  ),
  ...gateRows(
    'National Institute of Technology Rourkela',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Odisha',
    'CS',
    {
      GEN: [595, 478],
      EWS: [558, 438],
      OBC: [545, 408],
      SC: [465, 324],
      ST: [410, 278],
      'GEN-PwD': [478, 368],
    }
  ),
  ...gateRows(
    'Motilal Nehru National Institute of Technology Allahabad',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Uttar Pradesh',
    'CS',
    {
      GEN: [580, 462],
      EWS: [542, 422],
      OBC: [530, 392],
      SC: [450, 308],
      ST: [395, 262],
      'GEN-PwD': [462, 352],
    }
  ),
  ...gateRows(
    'National Institute of Technology Kurukshetra',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Haryana',
    'CS',
    {
      GEN: [555, 440],
      EWS: [518, 400],
      OBC: [505, 372],
      SC: [428, 290],
      ST: [375, 248],
      'GEN-PwD': [440, 332],
    }
  ),
  ...gateRows(
    'Malaviya National Institute of Technology Jaipur',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Rajasthan',
    'CS',
    {
      GEN: [542, 428],
      EWS: [505, 388],
      OBC: [492, 360],
      SC: [415, 280],
      ST: [362, 238],
      'GEN-PwD': [428, 320],
    }
  ),
  ...gateRows(
    'National Institute of Technology Durgapur',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'West Bengal',
    'CS',
    {
      GEN: [520, 408],
      EWS: [484, 368],
      OBC: [472, 340],
      SC: [395, 265],
      ST: [345, 224],
      'GEN-PwD': [408, 302],
    }
  ),
  ...gateRows(
    'Maulana Azad National Institute of Technology Bhopal',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Madhya Pradesh',
    'CS',
    {
      GEN: [530, 418],
      EWS: [492, 378],
      OBC: [480, 350],
      SC: [402, 272],
      ST: [352, 230],
      'GEN-PwD': [418, 310],
    }
  ),
  ...gateRows(
    'National Institute of Technology Silchar',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Assam',
    'CS',
    {
      GEN: [498, 388],
      EWS: [462, 348],
      OBC: [450, 320],
      SC: [375, 248],
      ST: [328, 210],
      'GEN-PwD': [388, 285],
    }
  ),
  ...gateRows(
    'National Institute of Technology Hamirpur',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Himachal Pradesh',
    'CS',
    {
      GEN: [480, 372],
      EWS: [445, 332],
      OBC: [433, 305],
      SC: [358, 236],
      ST: [312, 198],
      'GEN-PwD': [372, 270],
    }
  ),
  ...gateRows(
    'National Institute of Technology Patna',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Bihar',
    'CS',
    {
      GEN: [468, 360],
      EWS: [432, 320],
      OBC: [420, 294],
      SC: [345, 225],
      ST: [300, 188],
      'GEN-PwD': [360, 258],
    }
  ),
  ...gateRows(
    'National Institute of Technology Surat',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Gujarat',
    'CS',
    {
      GEN: [475, 366],
      EWS: [438, 326],
      OBC: [426, 298],
      SC: [350, 228],
      ST: [305, 192],
      'GEN-PwD': [366, 262],
    }
  ),
  ...gateRows(
    'National Institute of Technology Jamshedpur',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Jharkhand',
    'CS',
    {
      GEN: [462, 354],
      EWS: [426, 314],
      OBC: [414, 286],
      SC: [338, 218],
      ST: [294, 182],
      'GEN-PwD': [354, 250],
    }
  ),
  // ── IIITs ─────────────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Information Technology Allahabad',
    'M.Tech in Information Technology',
    'IIIT',
    'Uttar Pradesh',
    'CS',
    {
      GEN: [580, 462],
      EWS: [542, 422],
      OBC: [530, 392],
      SC: [450, 308],
      ST: [395, 262],
      'GEN-PwD': [462, 352],
    }
  ),
  ...gateRows(
    'Indian Institute of Information Technology Hyderabad',
    'M.Tech in Computer Science and Engineering',
    'IIIT',
    'Telangana',
    'CS',
    {
      GEN: [560, 444],
      EWS: [522, 404],
      OBC: [510, 376],
      SC: [432, 295],
      ST: [378, 250],
      'GEN-PwD': [444, 335],
    }
  ),
  ...gateRows(
    'Indian Institute of Information Technology Design and Manufacturing Kancheepuram',
    'M.Tech in Computer Science and Engineering',
    'IIIT',
    'Tamil Nadu',
    'CS',
    {
      GEN: [520, 408],
      EWS: [484, 368],
      OBC: [472, 340],
      SC: [395, 265],
      ST: [345, 224],
      'GEN-PwD': [408, 302],
    }
  ),
  ...gateRows(
    'Indian Institute of Information Technology Guwahati',
    'M.Tech in Computer Science and Engineering',
    'IIIT',
    'Assam',
    'CS',
    {
      GEN: [490, 380],
      EWS: [454, 340],
      OBC: [442, 312],
      SC: [366, 242],
      ST: [320, 205],
      'GEN-PwD': [380, 278],
    }
  ),
  // ── IISc ──────────────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Science Bangalore',
    'M.Tech in Computer Science and Automation',
    'IISc',
    'Karnataka',
    'CS',
    {
      GEN: [880, 780],
      EWS: [840, 738],
      OBC: [830, 705],
      SC: [748, 598],
      ST: [680, 530],
      'GEN-PwD': [758, 635],
    }
  ),
  // ── GFTIs ─────────────────────────────────────────────────────────────
  ...gateRows(
    'Delhi Technological University',
    'M.Tech in Computer Engineering',
    'GFTI',
    'Delhi',
    'CS',
    {
      GEN: [510, 398],
      EWS: [474, 358],
      OBC: [462, 330],
      SC: [386, 258],
      ST: [338, 218],
      'GEN-PwD': [398, 295],
    }
  ),
  ...gateRows(
    'Thapar Institute of Engineering and Technology',
    'M.Tech in Computer Science and Engineering',
    'GFTI',
    'Punjab',
    'CS',
    {
      GEN: [495, 384],
      EWS: [458, 344],
      OBC: [446, 316],
      SC: [370, 245],
      ST: [324, 206],
      'GEN-PwD': [384, 282],
    }
  ),
  ...gateRows(
    'Sant Longowal Institute of Engineering and Technology',
    'M.Tech in Computer Science and Engineering',
    'GFTI',
    'Punjab',
    'CS',
    {
      GEN: [420, 318],
      EWS: [385, 280],
      OBC: [374, 254],
      SC: [302, 194],
      ST: [260, 160],
      'GEN-PwD': [318, 225],
    }
  ),
  ...gateRows(
    'National Institute of Technology Meghalaya',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Meghalaya',
    'CS',
    {
      GEN: [440, 335],
      EWS: [405, 296],
      OBC: [394, 268],
      SC: [320, 205],
      ST: [278, 170],
      'GEN-PwD': [335, 238],
    }
  ),
  ...gateRows(
    'National Institute of Technology Manipur',
    'M.Tech in Computer Science and Engineering',
    'NIT',
    'Manipur',
    'CS',
    {
      GEN: [425, 322],
      EWS: [390, 283],
      OBC: [379, 256],
      SC: [305, 194],
      ST: [264, 160],
      'GEN-PwD': [322, 226],
    }
  ),
  // ── GATE EC paper ─────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Bombay',
    'M.Tech in Electrical Engineering',
    'IIT',
    'Maharashtra',
    'EC',
    {
      GEN: [800, 685],
      EWS: [762, 645],
      OBC: [750, 615],
      SC: [668, 522],
      ST: [605, 458],
      'GEN-PwD': [678, 562],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Delhi',
    'M.Tech in Electrical Engineering',
    'IIT',
    'Delhi',
    'EC',
    {
      GEN: [820, 710],
      EWS: [782, 668],
      OBC: [770, 635],
      SC: [688, 540],
      ST: [625, 475],
      'GEN-PwD': [698, 578],
    }
  ),
  ...gateRows(
    'National Institute of Technology Tiruchirappalli',
    'M.Tech in VLSI Design',
    'NIT',
    'Tamil Nadu',
    'EC',
    {
      GEN: [650, 530],
      EWS: [612, 490],
      OBC: [600, 462],
      SC: [520, 375],
      ST: [462, 322],
      'GEN-PwD': [530, 418],
    }
  ),
  ...gateRows(
    'National Institute of Technology Warangal',
    'M.Tech in Electronics and Communication Engineering',
    'NIT',
    'Telangana',
    'EC',
    {
      GEN: [632, 515],
      EWS: [595, 475],
      OBC: [582, 446],
      SC: [502, 360],
      ST: [445, 308],
      'GEN-PwD': [515, 402],
    }
  ),
  // ── GATE ME paper ─────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Bombay',
    'M.Tech in Mechanical Engineering',
    'IIT',
    'Maharashtra',
    'ME',
    {
      GEN: [785, 668],
      EWS: [748, 628],
      OBC: [736, 598],
      SC: [652, 505],
      ST: [590, 442],
      'GEN-PwD': [662, 545],
    }
  ),
  ...gateRows(
    'Indian Institute of Technology Delhi',
    'M.Tech in Manufacturing Engineering',
    'IIT',
    'Delhi',
    'ME',
    {
      GEN: [795, 680],
      EWS: [758, 640],
      OBC: [745, 608],
      SC: [662, 515],
      ST: [600, 452],
      'GEN-PwD': [672, 555],
    }
  ),
  ...gateRows(
    'National Institute of Technology Tiruchirappalli',
    'M.Tech in Manufacturing Engineering',
    'NIT',
    'Tamil Nadu',
    'ME',
    {
      GEN: [620, 505],
      EWS: [584, 465],
      OBC: [572, 436],
      SC: [492, 352],
      ST: [435, 300],
      'GEN-PwD': [505, 394],
    }
  ),
  // ── GATE CE paper ─────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Bombay',
    'M.Tech in Civil Engineering',
    'IIT',
    'Maharashtra',
    'CE',
    {
      GEN: [760, 645],
      EWS: [722, 605],
      OBC: [710, 576],
      SC: [628, 485],
      ST: [568, 425],
      'GEN-PwD': [638, 522],
    }
  ),
  ...gateRows(
    'National Institute of Technology Tiruchirappalli',
    'M.Tech in Structural Engineering',
    'NIT',
    'Tamil Nadu',
    'CE',
    {
      GEN: [600, 488],
      EWS: [564, 448],
      OBC: [552, 420],
      SC: [474, 338],
      ST: [418, 288],
      'GEN-PwD': [488, 378],
    }
  ),
  // ── GATE EE paper ─────────────────────────────────────────────────────
  ...gateRows(
    'Indian Institute of Technology Bombay',
    'M.Tech in Power Systems',
    'IIT',
    'Maharashtra',
    'EE',
    {
      GEN: [775, 660],
      EWS: [738, 620],
      OBC: [726, 590],
      SC: [644, 498],
      ST: [582, 436],
      'GEN-PwD': [654, 536],
    }
  ),
  ...gateRows(
    'National Institute of Technology Tiruchirappalli',
    'M.Tech in Power Systems Engineering',
    'NIT',
    'Tamil Nadu',
    'EE',
    {
      GEN: [608, 496],
      EWS: [572, 456],
      OBC: [560, 428],
      SC: [480, 344],
      ST: [424, 294],
      'GEN-PwD': [496, 384],
    }
  ),
]

// ── JEE (JoSAA) rank-based cutoffs ──────────────────────────────────────────
type JeeRow = {
  institute: string
  program: string
  instituteType: string
  state: string
  source: string
  category: string
  gender: string
  openRank: number
  closeRank: number
}

function jeeRows(
  institute: string,
  program: string,
  instituteType: string,
  state: string,
  source: string,
  ranks: Record<string, [number, number]>
): JeeRow[] {
  return Object.entries(ranks).map(([category, [open, close]]) => ({
    institute,
    program,
    instituteType,
    state,
    source,
    category,
    gender: 'Gender-Neutral',
    openRank: open,
    closeRank: close,
  }))
}

const JEE_DATA: JeeRow[] = [
  // ── IITs (JoSAA — JEE Advanced) ────────────────────────────────────
  ...jeeRows(
    'Indian Institute of Technology Bombay',
    'Computer Science and Engineering',
    'IIT',
    'Maharashtra',
    'JOSAA',
    {
      GEN: [1, 65],
      EWS: [66, 120],
      OBC: [121, 185],
      SC: [1, 180],
      ST: [1, 90],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Delhi',
    'Computer Science and Engineering',
    'IIT',
    'Delhi',
    'JOSAA',
    {
      GEN: [2, 88],
      EWS: [89, 155],
      OBC: [156, 228],
      SC: [2, 220],
      ST: [2, 108],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Madras',
    'Computer Science and Engineering',
    'IIT',
    'Tamil Nadu',
    'JOSAA',
    {
      GEN: [3, 102],
      EWS: [103, 182],
      OBC: [183, 268],
      SC: [3, 252],
      ST: [3, 125],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Kharagpur',
    'Computer Science and Engineering',
    'IIT',
    'West Bengal',
    'JOSAA',
    {
      GEN: [5, 145],
      EWS: [146, 248],
      OBC: [249, 368],
      SC: [5, 345],
      ST: [5, 168],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Kanpur',
    'Computer Science and Engineering',
    'IIT',
    'Uttar Pradesh',
    'JOSAA',
    {
      GEN: [4, 128],
      EWS: [129, 222],
      OBC: [223, 325],
      SC: [4, 305],
      ST: [4, 148],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Roorkee',
    'Computer Science and Engineering',
    'IIT',
    'Uttarakhand',
    'JOSAA',
    {
      GEN: [8, 188],
      EWS: [189, 318],
      OBC: [319, 468],
      SC: [8, 440],
      ST: [8, 215],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Hyderabad',
    'Computer Science and Engineering',
    'IIT',
    'Telangana',
    'JOSAA',
    {
      GEN: [12, 268],
      EWS: [269, 445],
      OBC: [446, 652],
      SC: [12, 612],
      ST: [12, 298],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Guwahati',
    'Computer Science and Engineering',
    'IIT',
    'Assam',
    'JOSAA',
    {
      GEN: [15, 345],
      EWS: [346, 568],
      OBC: [569, 828],
      SC: [15, 778],
      ST: [15, 378],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Bhubaneswar',
    'Computer Science and Engineering',
    'IIT',
    'Odisha',
    'JOSAA',
    {
      GEN: [25, 882],
      EWS: [883, 1420],
      OBC: [1421, 2068],
      SC: [25, 1945],
      ST: [25, 945],
    }
  ),
  ...jeeRows(
    'Indian Institute of Technology Patna',
    'Computer Science and Engineering',
    'IIT',
    'Bihar',
    'JOSAA',
    {
      GEN: [28, 968],
      EWS: [969, 1558],
      OBC: [1559, 2272],
      SC: [28, 2138],
      ST: [28, 1038],
    }
  ),
  // ── NITs (JoSAA — JEE Main, Home State) ────────────────────────────
  ...jeeRows(
    'National Institute of Technology Tiruchirappalli',
    'Computer Science and Engineering',
    'NIT',
    'Tamil Nadu',
    'JOSAA',
    {
      GEN: [1200, 3850],
      EWS: [3851, 6200],
      OBC: [6201, 9800],
      SC: [1200, 9200],
      ST: [1200, 4600],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Warangal',
    'Computer Science and Engineering',
    'NIT',
    'Telangana',
    'JOSAA',
    {
      GEN: [1500, 4500],
      EWS: [4501, 7200],
      OBC: [7201, 11200],
      SC: [1500, 10600],
      ST: [1500, 5300],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Karnataka Surathkal',
    'Computer Science and Engineering',
    'NIT',
    'Karnataka',
    'JOSAA',
    {
      GEN: [1800, 5200],
      EWS: [5201, 8400],
      OBC: [8401, 13000],
      SC: [1800, 12200],
      ST: [1800, 6100],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Calicut',
    'Computer Science and Engineering',
    'NIT',
    'Kerala',
    'JOSAA',
    {
      GEN: [2200, 6800],
      EWS: [6801, 10800],
      OBC: [10801, 16500],
      SC: [2200, 15600],
      ST: [2200, 7800],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Rourkela',
    'Computer Science and Engineering',
    'NIT',
    'Odisha',
    'JOSAA',
    {
      GEN: [2800, 8200],
      EWS: [8201, 13000],
      OBC: [13001, 19800],
      SC: [2800, 18600],
      ST: [2800, 9400],
    }
  ),
  ...jeeRows(
    'Motilal Nehru National Institute of Technology Allahabad',
    'Computer Science and Engineering',
    'NIT',
    'Uttar Pradesh',
    'JOSAA',
    {
      GEN: [3200, 9600],
      EWS: [9601, 15200],
      OBC: [15201, 23200],
      SC: [3200, 21800],
      ST: [3200, 11000],
    }
  ),
  ...jeeRows(
    'Malaviya National Institute of Technology Jaipur',
    'Computer Science and Engineering',
    'NIT',
    'Rajasthan',
    'JOSAA',
    {
      GEN: [4200, 12800],
      EWS: [12801, 20200],
      OBC: [20201, 30800],
      SC: [4200, 28900],
      ST: [4200, 14600],
    }
  ),
  ...jeeRows(
    'Maulana Azad National Institute of Technology Bhopal',
    'Computer Science and Engineering',
    'NIT',
    'Madhya Pradesh',
    'JOSAA',
    {
      GEN: [4800, 14500],
      EWS: [14501, 22800],
      OBC: [22801, 34800],
      SC: [4800, 32600],
      ST: [4800, 16600],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Durgapur',
    'Computer Science and Engineering',
    'NIT',
    'West Bengal',
    'JOSAA',
    {
      GEN: [5500, 16800],
      EWS: [16801, 26500],
      OBC: [26501, 40500],
      SC: [5500, 38000],
      ST: [5500, 19200],
    }
  ),
  ...jeeRows(
    'National Institute of Technology Silchar',
    'Computer Science and Engineering',
    'NIT',
    'Assam',
    'JOSAA',
    {
      GEN: [7200, 22000],
      EWS: [22001, 34800],
      OBC: [34801, 53000],
      SC: [7200, 49800],
      ST: [7200, 25200],
    }
  ),
  // ── IIITs (JoSAA — JEE Main) ────────────────────────────────────────
  ...jeeRows(
    'Indian Institute of Information Technology Allahabad',
    'Information Technology',
    'IIIT',
    'Uttar Pradesh',
    'JOSAA',
    {
      GEN: [3800, 11500],
      EWS: [11501, 18200],
      OBC: [18201, 27800],
      SC: [3800, 26100],
      ST: [3800, 13200],
    }
  ),
  ...jeeRows(
    'Indian Institute of Information Technology Hyderabad',
    'Computer Science and Engineering',
    'IIIT',
    'Telangana',
    'JOSAA',
    {
      GEN: [2900, 8800],
      EWS: [8801, 13900],
      OBC: [13901, 21200],
      SC: [2900, 19900],
      ST: [2900, 10100],
    }
  ),
  ...jeeRows(
    'Indian Institute of Information Technology Design and Manufacturing Kancheepuram',
    'Computer Science and Engineering',
    'IIIT',
    'Tamil Nadu',
    'JOSAA',
    {
      GEN: [6200, 18800],
      EWS: [18801, 29800],
      OBC: [29801, 45500],
      SC: [6200, 42800],
      ST: [6200, 21600],
    }
  ),
]

async function main() {
  console.log('Clearing existing cutoff data…')
  await prisma.cutoff.deleteMany({})

  console.log(`Seeding ${GATE_DATA.length} GATE rows…`)
  await prisma.cutoff.createMany({
    data: GATE_DATA.map(r => ({
      examType: 'GATE',
      year: 2025,
      institute: r.institute,
      program: r.program,
      instituteType: r.instituteType,
      state: r.state,
      paper: r.paper,
      category: r.category,
      openScore: r.openScore,
      closeScore: r.closeScore,
      round: 4,
      source: 'CCMT',
    })),
    skipDuplicates: true,
  })

  console.log(`Seeding ${JEE_DATA.length} JEE rows…`)
  await prisma.cutoff.createMany({
    data: JEE_DATA.map(r => ({
      examType: 'JEE',
      year: 2025,
      institute: r.institute,
      program: r.program,
      instituteType: r.instituteType,
      state: r.state,
      source: r.source,
      category: r.category,
      gender: r.gender,
      openRank: r.openRank,
      closeRank: r.closeRank,
      round: 6,
    })),
    skipDuplicates: true,
  })

  const total = await prisma.cutoff.count()
  console.log(`Done — ${total} cutoff rows in DB.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
