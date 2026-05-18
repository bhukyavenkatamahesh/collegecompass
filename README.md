# CollegeCompass — GATE & JEE College Predictor

A full-stack Next.js app for predicting college admissions based on GATE and JEE Mains rank.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite via Prisma ORM
- **Payment**: Razorpay
- **PDF**: jsPDF + jsPDF-autotable
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Styling**: Custom CSS + Tailwind

## Project Structure
```
app/
├── page.tsx              ← Landing page
├── predict/page.tsx      ← Prediction form (Step 1 & 2)
├── results/page.tsx      ← Full college list + PDF download
├── admin/page.tsx        ← Admin panel (cutoffs + stats)
└── api/
    ├── predict/          ← POST: rank → college list
    ├── payment/
    │   ├── create-order/ ← POST: create Razorpay order
    │   └── verify/       ← POST: verify payment signature
    └── admin/
        ├── login/        ← POST: admin login
        └── cutoffs/      ← GET/POST/PUT/DELETE cutoffs

lib/
├── db.ts                 ← Prisma client
├── predictor.ts          ← Prediction logic + sample data
└── auth.ts               ← JWT + bcrypt helpers

prisma/
└── schema.prisma         ← DB schema (User, Payment, Prediction, Cutoff, Admin)
```

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key"
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_KEY_SECRET"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
ADMIN_EMAIL="admin@yoursite.com"
ADMIN_PASSWORD="yourpassword"
```

### 3. Setup database
```bash
npx prisma generate
npx prisma db push
```

### 4. Uncomment Prisma in lib/db.ts
After running generate, uncomment the PrismaClient code in `lib/db.ts`

### 5. Setup Razorpay
1. Go to razorpay.com → create account
2. Get test API keys from Dashboard → Settings → API Keys
3. Paste into `.env.local`
4. In `app/predict/page.tsx`, uncomment the real Razorpay payment flow

### 6. Run development server
```bash
npm run dev
```

### 7. Build for production
```bash
npm run build
npm start
```

## Deployment (Recommended: Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. For DB in production: switch from SQLite to PostgreSQL (Neon.tech is free)

## Admin Panel
Visit `/admin` → login with credentials from `.env.local`

## Revenue Model
- ₹99 per prediction (configurable via GATE_PRICE / JEE_PRICE env vars in paise)
- Each new batch of students = recurring seasonal revenue

## To-Do for Production
- [ ] Replace sample cutoff data with real scraped/purchased data
- [ ] Add email delivery of PDF report (Resend / SendGrid)
- [ ] Switch SQLite → PostgreSQL for production
- [ ] Add rate limiting to API routes
- [ ] Add OTP-based phone verification
- [ ] SEO optimization (already has metadata)
