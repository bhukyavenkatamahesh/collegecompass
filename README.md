# CollegeCompass — GATE & JEE College Predictor

> Predict your best-fit college using **official 2025 cutoff data** from JoSAA, CSAB, CCMT, and COAP. Supports GATE, JEE Main (JoSAA & CSAB), and JEE Advanced.

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone
git clone https://github.com/bhukyavenkatamahesh/collegecompass.git
cd collegecompass

# 2. Install
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — add your DATABASE_URL and Razorpay keys

# 4. Generate Prisma client
npx prisma generate

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧱 Project Structure

```
/app          → Next.js App Router pages & API routes
/components   → Reusable UI components
/constants    → App-wide enums, pricing, config
/hooks        → Custom React hooks
/lib          → Prisma client, auth helpers, utilities
/services     → Client-side API call wrappers (prediction, payment)
/types        → Shared TypeScript interfaces
/scripts      → Data scraping & cutoff import scripts
/tests        → Unit tests (Vitest)
/docs         → Architecture docs, DB schema, deployment guide
/.github      → CI workflows, PR templates, issue templates
/prisma       → Prisma schema & migrations
```

---

## 🌿 Git Workflow

```
main        → Production (auto-deploys to Vercel)
dev         → Integration branch (all PRs land here first)
feature/*   → New features  (branch off dev)
fix/*       → Bug fixes      (branch off dev)
```

### Day-to-day flow:

```bash
# Start new work
git checkout dev && git pull
git checkout -b feature/my-feature

# When done — push and open PR → dev
git push origin feature/my-feature
# Create PR on GitHub: feature/my-feature → dev

# When dev is stable → PR: dev → main (auto-deploys)
```

> ⚠️ **NEVER push directly to `main`**

---

## 🔑 Environment Variables

| Variable                      | Description                  | Required                |
| ----------------------------- | ---------------------------- | ----------------------- |
| `DATABASE_URL`                | Supabase PostgreSQL URI      | ✅                      |
| `NEXTAUTH_SECRET`             | NextAuth signing secret      | ✅                      |
| `RAZORPAY_KEY_ID`             | Razorpay public key          | ✅                      |
| `RAZORPAY_KEY_SECRET`         | Razorpay secret key          | ✅                      |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (client) | ✅                      |
| `ADMIN_EMAIL`                 | Admin panel login email      | ✅                      |
| `ADMIN_PASSWORD`              | Admin panel login password   | ✅                      |
| `GATE_PRICE`                  | GATE report price in paise   | optional (default 4900) |
| `JEE_PRICE`                   | JEE report price in paise    | optional (default 4900) |

Copy `.env.example` → `.env.local` for local dev.  
Add the same variables in **Vercel Dashboard > Project Settings > Environment Variables** for production.

---

## 🗄️ Database

**ORM:** Prisma v7  
**Local dev:** SQLite (`dev.db`)  
**Production:** PostgreSQL (Supabase)

```bash
# Push schema to DB
npx prisma db push

# View data (GUI)
npx prisma studio

# Import cutoff data
npm run import:cutoffs
```

### Separate environments:

- **Dev DB** → Supabase project named `collegecompass-dev`
- **Prod DB** → Supabase project named `collegecompass-prod`

---

## 🧪 Testing

```bash
npm test             # Run all unit tests
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm run format:check # Prettier check
```

---

## 🚀 Deployment (Vercel)

1. Push code to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Set environment variables in Vercel Dashboard
4. Vercel auto-deploys on push to `main`

### Vercel settings:

- **Production** branch: `main`
- **Preview** branches: all PRs get auto-preview URLs

---

## 💳 Payment

Razorpay handles payments. Use **test keys** in dev, **live keys** in production.

- Test card: `4111 1111 1111 1111` | CVV: any 3 digits | Expiry: any future date
- UPI test: `success@razorpay`

---

## 📝 Commit Convention

```
feat: add CSAB predictor flow
fix: correct category rank filtering
chore: update dependencies
docs: add deployment guide
refactor: move payment logic to service layer
```

---

## 🤝 Contributing

1. Branch off `dev` (`feature/your-feature` or `fix/your-fix`)
2. Make changes + write tests
3. Run `npm run typecheck && npm test` — must pass
4. Open PR → `dev` with description + screenshots
5. Get 1 review → merge

---

## 📄 License

Private & Proprietary — © 2025 CollegeCompass
