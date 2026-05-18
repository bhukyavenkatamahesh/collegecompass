# CollegeCompass — Full Project Documentation

> **Purpose of this document:** This file contains everything needed to understand, build, run, populate with data, and deploy the CollegeCompass college prediction website for GATE and JEE counselling.

---

## 1. PROJECT OVERVIEW

**What this app does:**
- Students enter their GATE score or JEE Mains rank + category + branch.
- They see a preview of 3 colleges for free.
- They pay **₹49** via Razorpay.
- They get a full list of colleges sorted by admission probability, with interdisciplinary options.
- They can download a PDF report of their results.

**Who uses it:**
- Students — to predict colleges during counselling season.
- Admin (you) — to update cutoff data every year.

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite (development) → PostgreSQL (production) |
| ORM | Prisma |
| Payment | Razorpay |
| PDF Generation | jsPDF + jsPDF-autotable |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Custom CSS + Tailwind CSS (Dark Glassmorphism Theme) |
| Data Scraping | Python (BeautifulSoup + requests) |
| Deployment | Vercel (frontend) + Neon.tech (PostgreSQL) |

---

## 3. COMPLETE PROJECT STRUCTURE

```
college-predictor/
├── app/
│   ├── globals.css                  ← Design system (CSS variables, fonts, animations)
│   ├── layout.tsx                   ← Root layout (loads fonts: Syne & DM Sans)
│   ├── page.tsx                     ← Landing page (hero, how it works, pricing)
│   ├── predict/
│   │   └── page.tsx                 ← Step 1: Form (exam, rank, category, branch)
│   │                                   Step 2: Preview 3 colleges + collect name/email + payment
│   ├── results/
│   │   └── page.tsx                 ← Full college list table + filters + PDF download
│   ├── admin/
│   │   └── page.tsx                 ← Admin panel (login, manage cutoffs, view stats)
│   └── api/
│       ├── predict/
│       │   └── route.ts             ← POST: { examType, rank, score, category, branch } → college list
│       ├── payment/
│       │   ├── create-order/
│       │   │   └── route.ts         ← POST: creates Razorpay order, returns orderId + amount
│       │   └── verify/
│       │       └── route.ts         ← POST: verifies Razorpay payment signature
│       └── admin/
│           ├── login/
│           │   └── route.ts         ← POST: admin login, sets JWT cookie
│           └── cutoffs/
│               └── route.ts         ← GET/POST/PUT/DELETE cutoff entries
├── lib/
│   ├── db.ts                        ← Prisma client singleton
│   ├── predictor.ts                 ← Prediction logic (includes Interdisciplinary matching)
│   └── auth.ts                      ← JWT sign/verify + bcrypt hash/compare
├── prisma/
│   └── schema.prisma                ← Database models
├── scripts/
│   ├── scrape_josaa.py              ← Scrapes JoSAA cutoff data (JEE)
│   ├── scrape_ccmt.py               ← Scrapes CCMT cutoff data (GATE)
│   ├── enrich_gate_papers.py        ← Enriches GATE cutoffs with paper eligibility
│   └── import_josaa2025.py          ← Imports 2025 CSV data into the database
├── .env.local                       ← Environment variables
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. DATABASE SCHEMA (Prisma)

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String
  phone       String?
  createdAt   DateTime     @default(now())
  payments    Payment[]
  predictions Prediction[]
}

model Payment {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  razorpayOrderId   String   @unique
  razorpayPaymentId String?  @unique
  amount            Int      // in paise (4900 = ₹49)
  currency          String   @default("INR")
  status            String   @default("created") // created | paid | failed
  examType          String   // GATE | JEE
  createdAt         DateTime @default(now())
}

model Prediction {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  examType  String   // GATE | JEE
  rank      Int
  category  String   // GEN | OBC | SC | ST | EWS
  branch    String?  // for GATE (CS, EC, EE, ME, CE...)
  results   String   // JSON string of college list
  createdAt DateTime @default(now())
}

model Cutoff {
  id            String   @id @default(cuid())
  examType      String   // GATE | JEE
  year          Int
  institute     String
  program       String
  category      String   // GEN | OBC | SC | ST | EWS | GEN-PwD | OBC-PwD | SC-PwD | ST-PwD
  round         Int      @default(1)
  openRank      Int      @default(0)
  closeRank     Int      @default(0)
  openScore     Int      @default(0)
  closeScore    Int      @default(0)
  paper         String?  // For GATE eligibility mapping (e.g. "CS/EC/DA")
  state         String?
  instituteType String?  // IIT | NIT | IIIT | GFTI
  updatedAt     DateTime @updatedAt
  createdAt     DateTime @default(now())
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
}
```

---

## 5. ENVIRONMENT VARIABLES

File: `.env.local` (never commit to git)

```bash
# Database
DATABASE_URL="file:./dev.db"
# For production use: DATABASE_URL="postgresql://user:pass@host/dbname"

# Auth
NEXTAUTH_SECRET="generate-a-random-32-char-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay (get from razorpay.com → Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"

# Pricing (in paise: 4900 = ₹49)
GATE_PRICE=4900
JEE_PRICE=4900

# Admin login
ADMIN_EMAIL="admin@yoursite.com"
ADMIN_PASSWORD="choose-a-strong-password"
```

---

## 6. SETUP STEPS

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Initialize Prisma
```bash
npx prisma generate
npx prisma db push
```

### Step 3 — Run development server
```bash
npm run dev
```
Visit http://localhost:3000

---

## 7. KEY BUSINESS LOGIC

### Prediction Algorithm (`lib/predictor.ts`)

1. Take the student's rank (JEE) or score (GATE) and category.
2. Apply a category multiplier to get "effective rank" for JEE:
   - GEN = 1.0x (no change)
   - EWS = 1.1x
   - OBC = 1.3x
   - SC = 2.0x
   - ST = 2.5x
   - PwD categories get additional multiplier
3. Compare against every cutoff in the database (2025 data):
   - **For JEE (Rank-based)**: Compare against `openRank` and `closeRank`.
   - **For GATE (Score-based)**: Compare against `openScore` and `closeScore`. (Uses absolute max/min to handle varying formats).
   - If user metrics are better than max/open → 90% chance (High)
   - If user metrics are between max and min → calculate % based on position (Medium/High)
   - If user metrics are worse than min + 5-10% buffer → Low chance (~15%)
4. Filter by **Interdisciplinary Branches**: Checks if the user's base paper (e.g., CS) is eligible for programs in AI, Data Science, Cyber Security, etc.
5. Sort results by chance percentage (highest first).

### Payment Flow (₹49)

1. Student fills form → sees 3 college preview (free, no payment).
2. Student enters name/email/phone → clicks "Pay ₹49 & Get Full List".
3. Frontend calls `POST /api/payment/create-order` → gets Razorpay order ID.
4. Razorpay checkout opens in a popup.
5. Razorpay calls frontend handler with payment ID + signature.
6. Frontend calls `POST /api/payment/verify` → backend verifies signature.
7. Redirects to `/results?paid=true`.

---

## 8. DESIGN SYSTEM

### Color Variables (in `globals.css`)
```css
:root {
  --bg: #0a0e1a;              /* Main dark background */
  --bg-card: #0f1628;         /* Card/glass background */
  --bg-card2: #141c32;        /* Secondary card */
  --border: rgba(99,140,255,0.15);  /* Subtle blue border */
  --accent: #4f6ef7;           /* Primary blue */
  --accent2: #38c9a0;          /* Green (High chance) */
  --accent3: #f7854f;          /* Orange (Medium chance) */
  --text: #e8eeff;             /* Primary text */
  --text-muted: #7a8ab0;       /* Secondary text */
  --gradient: linear-gradient(135deg, #4f6ef7 0%, #38c9a0 100%);
}
```

### Typography
- **Headings:** Syne (Google Fonts) — weight 700/800
- **Body:** DM Sans (Google Fonts) — weight 300/400/500

### Chance Color Coding
- **High** (≥75%) → green (`var(--accent2)` = #38c9a0)
- **Medium** (30–74%) → orange (`var(--accent3)` = #f7854f)
- **Low** (<30%) → red (#f74f4f)

---

## 9. PAGES

### `/` — Landing Page
- Hero section with headline, stats bar, and exam selection cards.
- How it works (4 steps: Enter Details → Pay ₹49 → Get List → Download PDF).
- Pricing section (₹49 one-time fee).

### `/predict` — Prediction Form
- Step 1: Input rank/score, category, branch. Form validates inputs.
- Step 2: Show top 3 colleges with chance % (blurred list below).
- Razorpay Payment modal triggers here.

### `/results` — Full Results
- Accessible only after payment validation.
- Summary cards for High / Medium / Low chance colleges.
- Filters for Institute Type (IIT / NIT / etc.) and Interdisciplinary search.
- Client-side PDF generation using jsPDF with full cutoff data included.

---

## 10. DEPLOYMENT

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/college-predictor.git
git push -u origin main
```

### Step 2 — Create Production Database (Neon.tech)
1. Create a free account at https://neon.tech.
2. Create a new project → copy the connection string.
3. Update `.env` or Vercel environment variables with the `DATABASE_URL`.

### Step 3 — Deploy to Vercel
1. Connect GitHub account on https://vercel.com.
2. Import the repository.
3. Add all environment variables (Razorpay Keys, DB URL, Auth Secrets).
4. Deploy.

### Step 4 — Update Razorpay
- Change to live keys in Vercel environment variables.
- Update webhook URL in Razorpay dashboard to your Vercel domain.

---

## 11. AFTER DEPLOYMENT — CHECKLIST

- [ ] Test full prediction flow (enter rank → preview → pay → results → PDF download)
- [ ] Test admin panel login and cutoff viewer
- [ ] Test Razorpay payment flow in Live mode (after KYC)
- [ ] Add domain to Razorpay allowed origins
- [ ] Add Google Analytics for tracking
