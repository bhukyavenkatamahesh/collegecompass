'use client'
import Link from 'next/link'
import { useState } from 'react'

const STATS = [
  ['1.8 Lakh+', 'Official cutoff records'],
  ['197', 'Institutes covered'],
  ['19', 'IITs (M.Tech via COAP)'],
  ['2025', 'Latest counselling data'],
]

const SOURCES = ['JoSAA 2025', 'CSAB 2025', 'COAP 2025', 'CCMT 2025']

const EXAMS = [
  {
    id: 'GATE', tag: 'M.Tech', title: 'GATE Predictor',
    desc: 'Enter your GATE score, paper and category to see M.Tech programmes you can get across IITs, NITs, IIITs and GFTIs.',
    chips: ['IITs (COAP)', 'NITs/IIITs (CCMT)', 'Score-based', 'Category + PwD'],
    href: '/predict?exam=GATE',
  },
  {
    id: 'JEE_MAIN', tag: 'B.Tech', title: 'JEE Main Predictor',
    desc: 'Predict B.Tech seats at NITs, IIITs and GFTIs — with home-state quota, gender pool and category-rank handling exactly like JoSAA.',
    chips: ['NITs', 'IIITs', 'GFTIs', 'Home-state quota'],
    href: '/predict?exam=JEE_MAIN',
  },
  {
    id: 'JEE_ADV', tag: 'B.Tech', title: 'JEE Advanced Predictor',
    desc: 'IIT-only B.Tech prediction on your JEE Advanced rank, with reserved category ranks and female-supernumerary seats.',
    chips: ['23 IITs', 'All-India', 'Female pool', 'Category rank'],
    href: '/predict?exam=JEE_ADV',
  },
]

export default function HomePage() {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="min-h-screen relative" style={{ overflowX: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, height: '70vh', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav className="nav-pad" style={{ position: 'relative', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1180px', margin: '0 auto', gap: '1rem' }}>
        <div style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em', color: 'var(--text)' }}>
          collegecompass<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '1.7rem', alignItems: 'center' }}>
          <Link href="#how" className="hide-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>How it works</Link>
          <Link href="#trust" className="hide-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>Our data</Link>
          <Link href="#pricing" className="hide-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500 }}>Pricing</Link>
          <Link href="/predict" className="btn-ghost hide-sm" style={{ padding: '0.55rem 1.15rem', borderRadius: 10, fontSize: '0.88rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Sign in</Link>
          <Link href="/predict" className="btn-primary" style={{ padding: '0.6rem 1.3rem', borderRadius: 10, fontSize: '0.88rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-pad" style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', padding: '5rem 2rem 3.5rem', position: 'relative' }}>
        <div className="pill fade-up fade-up-1" style={{ marginBottom: '1.6rem' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', flexShrink: 0 }} />
          Built on official 2025 counselling cutoffs
        </div>
        <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(2rem, 6vw, 3.7rem)', fontWeight: 800, marginBottom: '1.3rem' }}>
          Know exactly which colleges your rank can get you
        </h1>
        <p className="fade-up fade-up-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.12rem)', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 2.4rem', lineHeight: 1.7 }}>
          A GATE &amp; JEE predictor built on real JoSAA, CSAB, COAP and CCMT 2025 data — with the same category, quota and gender rules the official counselling uses.
        </p>
        <div className="fade-up fade-up-4 hero-cta" style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/predict?exam=GATE" className="btn-primary" style={{ padding: '0.9rem 1.9rem', borderRadius: 12, fontSize: '1rem', textDecoration: 'none' }}>Predict GATE colleges</Link>
          <Link href="/predict?exam=JEE_MAIN" className="btn-ghost" style={{ padding: '0.9rem 1.9rem', borderRadius: 12, fontSize: '1rem', textDecoration: 'none' }}>Predict JEE colleges</Link>
        </div>

        <div className="fade-up fade-up-5 grid-stats" style={{ marginTop: '3.5rem' }}>
          {STATS.map(([num, label]) => (
            <div key={label} className="glass" style={{ padding: '1.1rem 0.75rem' }}>
              <div className="gradient-text" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.55rem' }}>{num}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="sec-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 1rem' }}>
        <div className="glass" style={{ padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>Data sourced directly from</span>
          {SOURCES.map(s => <span key={s} className="tag" style={{ fontWeight: 600, color: 'var(--text)' }}>{s}</span>)}
        </div>
      </section>

      {/* Exam cards */}
      <section className="sec-pad grid-auto" style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 2rem' }}>
        {EXAMS.map(card => (
          <Link key={card.id} href={card.href} style={{ textDecoration: 'none' }}
            onMouseEnter={() => setHover(card.id)} onMouseLeave={() => setHover(null)}>
            <div className="glass card-hover" style={{ padding: '1.75rem', height: '100%', borderColor: hover === card.id ? 'var(--border-strong)' : 'var(--border)' }}>
              <span className="tag" style={{ color: 'var(--accent-2)', borderColor: 'rgba(45,212,167,0.3)' }}>{card.tag}</span>
              <h3 style={{ fontWeight: 700, fontSize: '1.3rem', margin: '0.9rem 0 0.6rem' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.2rem' }}>{card.desc}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {card.chips.map(c => <span key={c} className="tag">{c}</span>)}
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'Syne' }}>Start prediction →</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Trust / methodology */}
      <section id="trust" className="sec-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '2rem' }}>Why you can <span className="gradient-text">trust</span> these predictions</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.6rem', fontSize: '0.95rem' }}>No black box. Here is exactly how the prediction works.</p>
        </div>
        <div className="grid-auto">
          {[
            { t: 'Official data only', d: 'Every cutoff comes from the institutes’ own COAP/CCMT reports and the JoSAA/CSAB 2025 results — not crowd-sourced guesses.' },
            { t: 'Real counselling rules', d: 'GATE is score-based; JEE Advanced maps to IITs and JEE Main to NITs/IIITs/GFTIs — with home-state quota, gender pool and reserved category ranks applied exactly as in counselling.' },
            { t: 'Last-round cutoffs', d: 'Chances use each programme’s final-round closing cutoff, the most realistic threshold for "will I actually get a seat".' },
            { t: 'Honest about limits', d: 'Predictions are indicative. Actual allotment depends on seat matrix and choice-filling each year — we never claim a fake accuracy number.' },
          ].map(x => (
            <div key={x.t} className="glass" style={{ padding: '1.4rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(91,124,250,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '0.85rem' }}>✓</div>
              <h4 style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: '0.45rem' }}>{x.t}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.6 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="sec-pad" style={{ maxWidth: 980, margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: '2.5rem' }}>How it <span className="gradient-text">works</span></h2>
        <div className="grid-auto">
          {[
            { s: '01', t: 'Enter your details', d: 'Pick your exam, then enter score/rank, category, gender and home state where relevant.' },
            { s: '02', t: 'See a free preview', d: 'Get a sample of your top matches instantly — before paying anything.' },
            { s: '03', t: 'Unlock the full list', d: 'One-time ₹49 via secure Razorpay. No signup, no subscription.' },
            { s: '04', t: 'Download your report', d: 'Filter by chance and institute type, then export a PDF for counselling.' },
          ].map(x => (
            <div key={x.s} className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent)', opacity: 0.4 }}>{x.s}</div>
              <h4 style={{ fontWeight: 700, margin: '0.6rem 0 0.4rem' }}>{x.t}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — light "preview" vs dark "full report" */}
      <section id="pricing" className="sec-pad" style={{ maxWidth: 1000, margin: '0 auto', padding: '4rem 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.6rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Stop guessing your colleges.</h2>
          <p style={{ marginTop: '0.7rem', fontSize: '1.05rem' }}>
            <span className="weak">See a free preview,&nbsp;</span><span className="emph" style={{ fontWeight: 700 }}>then unlock everything</span>
          </p>
        </div>

        <div className="grid-2">
          {/* Free */}
          <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontFamily: 'Satoshi', fontSize: '1.05rem' }}>✦ Free preview</div>
            <div style={{ margin: '1.3rem 0 1rem', fontFamily: 'Satoshi', fontWeight: 900, fontSize: '2rem' }}>₹0</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.6rem' }}>
              {['Your top 3 matched colleges', 'Real 2025 cutoff each', 'Category & exam aware'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}><span className="emph">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/predict" className="btn-ghost" style={{ display: 'block', textAlign: 'center', padding: '0.85rem', borderRadius: 12, textDecoration: 'none', fontSize: '0.95rem' }}>Try it free →</Link>
          </div>

          {/* Paid */}
          <div className="card-dark" style={{ padding: '2.2rem' }}>
            <span className="badge-accent">Full Report</span>
            <div style={{ margin: '1.3rem 0 0.3rem', fontFamily: 'Satoshi', fontWeight: 900, fontSize: '2.6rem', color: '#fff' }}>
              ₹49 <span style={{ fontSize: '1rem', fontWeight: 500 }} className="muted-d">one-time</span>
            </div>
            <p className="muted-d" style={{ fontSize: '0.9rem', margin: '0.4rem 0 1.4rem', lineHeight: 1.6 }}>Everything you need to make confident counselling choices.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.7rem' }}>
              {['Full ranked list with chance %', 'Home-state, gender & quota aware', 'JoSAA + CSAB + COAP + CCMT', 'Downloadable PDF report', 'Instant — no account needed'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.92rem', color: '#f3ede8' }}><span className="emph">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/predict" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.9rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}>Get your prediction →</Link>
            <div className="muted-d" style={{ marginTop: '0.9rem', fontSize: '0.75rem', textAlign: 'center' }}>🔒 Secure payment via Razorpay</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', paddingTop: '2.5rem' }}>
        <div className="sec-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div className="divider" style={{ marginBottom: '2.2rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ maxWidth: 400 }}>
              <div style={{ fontFamily: 'Satoshi', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>collegecompass<span style={{ color: 'var(--accent)' }}>.</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>An independent prediction tool. Not affiliated with JoSAA, CSAB, IIT, NIT, the GATE/JEE authorities or any institute.</p>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--text-muted)' }}>
              <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '0.3rem', fontFamily: 'Satoshi' }}>Data</div>
              <div>GATE 2025 — COAP &amp; CCMT</div>
              <div>JEE 2025 — JoSAA &amp; CSAB</div>
              <div>Updated May 2026</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', lineHeight: 1.6, paddingTop: '1.2rem' }}>
            Predictions are indicative and based on previous-round cutoffs. They do not guarantee admission — always verify on the official counselling portal.
            <span style={{ float: 'right' }}>© 2026 CollegeCompass · <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link></span>
          </div>
        </div>
        {/* Oversized clipped brand */}
        <div style={{ overflow: 'hidden', textAlign: 'center', marginTop: '1.5rem', height: 'clamp(3.2rem, 13vw, 12rem)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <span className="brand-giant">collegecompass.</span>
        </div>
      </footer>
    </div>
  )
}
