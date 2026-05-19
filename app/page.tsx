import Link from 'next/link'
import { prisma } from '@/lib/db'

export const revalidate = 3600

export default async function Home() {
  const [countRows, instituteRows] = await Promise.all([
    prisma.cutoff.aggregate({ _count: { id: true }, _max: { year: true } }),
    prisma.cutoff.groupBy({ by: ['institute'] }),
  ])
  const totalCutoffs = countRows._count.id
  const totalColleges = instituteRows.length
  const year = countRows._max.year ?? 2025

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Hero (DARK) ───────────────────────────── */}
      <section style={{ background: '#0a0a09', color: '#f5f3ef', overflow: 'hidden', position: 'relative' }}>
        {/* Navbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,9,.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <nav className="nav">
            <Link href="/" className="nav-logo" style={{ color: '#f5f3ef' }}>
              college<span>compass</span>
              <span style={{ color: 'var(--accent)', fontWeight: 900 }}>.</span>
            </Link>
            <div className="hide-sm" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <Link href="#how" style={{ padding: '0.4rem 0.9rem', borderRadius: 8, color: '#a8a5a0', fontSize: '0.88rem', fontWeight: 500, fontFamily: 'Satoshi,Inter,sans-serif' }}>How it works</Link>
              <Link href="#pricing" style={{ padding: '0.4rem 0.9rem', borderRadius: 8, color: '#a8a5a0', fontSize: '0.88rem', fontWeight: 500, fontFamily: 'Satoshi,Inter,sans-serif' }}>Pricing</Link>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Link href="/predict?exam=GATE" className="btn btn-sm" style={{ background: '#fff', color: '#0a0a09', borderRadius: 99, padding: '0.5rem 1.1rem', fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 700, fontSize: '0.82rem', border: 'none' }}>Get Prediction →</Link>
            </div>
          </nav>
        </div>

        <div style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="container fade-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="fade-up fade-up-1" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316', borderRadius: 99, padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Satoshi,Inter,sans-serif' }}>
              <span>🎯</span> {year} Official JoSAA · CCMT · COAP Cutoffs
            </div>

            <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(2.6rem,6.5vw,5.2rem)', maxWidth: 860, margin: '0 auto', lineHeight: 1.06, color: '#f5f3ef' }}>
              Know exactly which <span style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>IIT, NIT &amp; IIIT</span> you can get.
            </h1>

            <p className="fade-up fade-up-3" style={{ marginTop: '1.5rem', fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#a8a5a0', maxWidth: 580, margin: '1.5rem auto 0', lineHeight: 1.7 }}>
              Enter your GATE score or JEE rank — get an instant ranked list of colleges you can realistically target, sorted by admission probability.
            </p>

            <div className="fade-up fade-up-4" style={{ marginTop: '2.5rem', display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/predict?exam=GATE" className="btn" style={{ fontSize: '1rem', padding: '.85rem 2rem', background: '#fff', color: '#0a0a09', borderRadius: 99, fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 700, border: 'none', boxShadow: '0 4px 18px -6px rgba(255,255,255,.15)' }}>
                🎓 Predict GATE Colleges
              </Link>
              <Link href="/predict?exam=JEE" className="btn" style={{ fontSize: '1rem', padding: '.85rem 2rem', background: 'transparent', color: '#f5f3ef', borderRadius: 99, fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.2)' }}>
                📐 Predict JEE Colleges
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="fade-up fade-up-5" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
              {[
                { n: `${totalCutoffs.toLocaleString()}+`, l: 'Cutoff data points' },
                { n: `${totalColleges}+`, l: 'Institutes tracked' },
                { n: '9+', l: 'Categories supported' },
                { n: '₹49', l: 'One-time unlock' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 900, fontSize: '1.65rem', letterSpacing: '-0.04em', color: '#f5f3ef' }}>{s.n}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b6966', fontWeight: 500, marginTop: '0.2rem' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Exam Selector (LIGHT) ──────────────────── */}
      <section className="section" style={{ background: 'var(--bg-muted)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '0.75rem' }}>
            Pick your exam
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.05rem' }}>
            We handle different counselling rules for each — no manual lookup.
          </p>
          <div className="grid-2" style={{ maxWidth: 820, margin: '0 auto', gap: '1.5rem' }}>
            {[
              {
                exam: 'GATE', emoji: '🎓',
                label: 'M.Tech / MS Admissions',
                desc: 'Score-based matching against CCMT, COAP and direct IIT admission cutoffs across CS, EC, ME, CE and 6 more papers.',
                tags: ['IITs', 'NITs', 'IIITs', 'GFTIs', 'COAP', 'CCMT'],
                href: '/predict?exam=GATE',
              },
              {
                exam: 'JEE', emoji: '📐',
                label: 'B.Tech Admissions',
                desc: 'Rank-based matching against JoSAA and CSAB cutoffs — with home-state quota, gender pool and reserved category rules applied.',
                tags: ['IITs', 'NITs', 'IIITs', 'GFTIs', 'JoSAA', 'CSAB'],
                href: '/predict?exam=JEE',
              },
            ].map(c => (
              <Link key={c.exam} href={c.href} style={{ textDecoration: 'none' }}>
                <div className="glass glass-hover" style={{ padding: '2.2rem', borderRadius: 'var(--r-lg)', cursor: 'pointer', height: '100%' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.9rem' }}>{c.emoji}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--accent)', marginBottom: '0.4rem', fontFamily: 'Satoshi,Inter,sans-serif' }}>{c.exam}</div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>{c.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.4rem' }}>{c.desc}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {c.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="btn btn-primary btn-sm" style={{ marginTop: '1.6rem', width: '100%', textAlign: 'center', display: 'block', borderRadius: 10 }}>
                    Predict {c.exam} Colleges →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why trust us (DARK) ─────────────────────── */}
      <section className="section section-dark">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.6rem)' }}>Built on real <span className="gradient-text">counselling rules</span></h2>
            <p style={{ marginTop: '0.7rem', color: 'var(--text-muted)', fontSize: '1.05rem' }}>Not just a rank lookup — the actual algorithm used in counselling.</p>
          </div>
          <div className="grid-3">
            {[
              { icon: '📋', t: 'Official {year} cutoffs', d: 'Data sourced directly from JoSAA, CSAB, COAP and CCMT portals — not third-party scrapers.'.replace('{year}', year.toString()) },
              { icon: '⚖️', t: 'Counselling-accurate rules', d: 'GATE is score-based; JEE maps ranks to IITs/NITs/IIITs with home-state quota, gender pool and reserved category applied exactly.' },
              { icon: '📊', t: 'Last-round cutoffs', d: "We use each programme's final-round closing cutoff — the most realistic threshold for 'will I actually get a seat'." },
              { icon: '🔒', t: 'Honest predictions', d: 'We never claim a fake accuracy number. Predictions are indicative — actual allotment depends on seat matrix and choice-filling.' },
              { icon: '⚡', t: 'Instant results', d: 'No account. No waiting. Enter your details and see your matches within seconds — preview free, unlock for ₹49.' },
              { icon: '📥', t: 'PDF download', d: 'Get a formatted PDF of your complete college list to share with parents, mentors or for offline reference during counselling.' },
            ].map(x => (
              <div key={x.t} className="glass glass-hover" style={{ padding: '1.6rem', borderRadius: 'var(--r)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.9rem' }}>{x.icon}</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.45rem' }}>{x.t}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.65 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (LIGHT) ────────────────────── */}
      <section id="how" className="section" style={{ background: 'var(--bg-muted)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.7rem,4vw,2.6rem)', marginBottom: '0.7rem' }}>How it <span className="gradient-text">works</span></h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3.5rem', fontSize: '1.05rem' }}>Four steps to counselling confidence.</p>
          <div className="grid-4">
            {[
              { n: '01', t: 'Enter details', d: 'Pick exam, enter score or rank, category, gender and home state.' },
              { n: '02', t: 'Free preview', d: 'Instantly see your top 3 college matches — no payment required.' },
              { n: '03', t: 'Unlock ₹49', d: 'One-time payment via Razorpay. No account, no subscription.' },
              { n: '04', t: 'Download PDF', d: 'Filter, sort and export your full ranked list as a PDF.' },
            ].map(x => (
              <div key={x.n} className="glass" style={{ padding: '1.6rem', borderRadius: 'var(--r)', position: 'relative' }}>
                <div style={{ fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--accent)', opacity: 0.35, lineHeight: 1, marginBottom: '0.7rem' }}>{x.n}</div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.45rem' }}>{x.t}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.65 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────── */}
      <section id="pricing" className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>Stop guessing your colleges.</h2>
            <p style={{ marginTop: '0.7rem', fontSize: '1.05rem' }}>
              <span className="weak">See a free preview, </span>
              <span className="emph" style={{ fontWeight: 700 }}>then unlock everything.</span>
            </p>
          </div>

          <div className="grid-2" style={{ alignItems: 'stretch', gap: '1.5rem' }}>
            {/* Free tier */}
            <div className="glass" style={{ borderRadius: 'var(--r-lg)', padding: '2.4rem', background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.4rem' }}>
                ✦ Free Preview
              </div>
              <div style={{ fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 900, fontSize: '2.4rem', letterSpacing: '-0.05em', marginBottom: '0.4rem' }}>₹0</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.8rem' }}>No credit card. No signup.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {['Top 3 college matches', 'Real {year} cutoff per college', 'Category & exam aware'.replace('{year}', year.toString())].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.55rem', color: 'var(--text-muted)', fontSize: '0.9rem', alignItems: 'flex-start' }}>
                    <span className="emph" style={{ flexShrink: 0, marginTop: '0.1rem' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/predict" className="btn btn-ghost" style={{ width: '100%', borderRadius: 12 }}>Try it free →</Link>
            </div>

            {/* Paid tier */}
            <div className="card-dark" style={{ padding: '2.4rem' }}>
              <span className="badge-accent">Full Report</span>
              <div style={{ margin: '1.3rem 0 0.3rem', fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 900, fontSize: '2.8rem', letterSpacing: '-0.05em', color: '#fff' }}>
                ₹49 <span style={{ fontSize: '1rem', fontWeight: 500 }} className="muted-d">one-time</span>
              </div>
              <p className="muted-d" style={{ fontSize: '0.9rem', marginBottom: '1.6rem', lineHeight: 1.65 }}>
                Everything you need to walk into counselling with total confidence.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  'Full ranked list with chance %',
                  'Home-state, gender & quota aware',
                  'JoSAA + CSAB + COAP + CCMT',
                  'Downloadable PDF report',
                  'Instant — no account needed',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.92rem', color: '#f3ede8', alignItems: 'flex-start' }}>
                    <span className="emph" style={{ flexShrink: 0, marginTop: '0.1rem' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/predict" className="btn btn-accent" style={{ width: '100%', borderRadius: 12, fontSize: '1rem', padding: '0.9rem' }}>
                Get your prediction →
              </Link>
              <div className="muted-d" style={{ marginTop: '0.9rem', fontSize: '0.75rem', textAlign: 'center' }}>🔒 Secure payment via Razorpay</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer (DARK) ─────────────────────────── */}
      <footer style={{ background: '#0a0a09', color: '#f5f3ef', paddingTop: '3rem' }}>
        <div className="container">
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: '2.5rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 380 }}>
              <div className="nav-logo" style={{ marginBottom: '0.55rem', color: '#f5f3ef' }}>
                college<span style={{ color: 'var(--accent)' }}>compass</span>.
              </div>
              <p style={{ color: '#a8a5a0', fontSize: '0.83rem', lineHeight: 1.65 }}>
                An independent prediction tool. Not affiliated with JoSAA, CSAB, IIT, NIT, the GATE/JEE authorities or any institute.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 2, color: '#a8a5a0' }}>
              <div style={{ color: '#f5f3ef', fontWeight: 700, marginBottom: '0.2rem', fontFamily: 'Satoshi,Inter,sans-serif' }}>Data sources</div>
              <div>GATE {year} — COAP &amp; CCMT</div>
              <div>JEE {year} — JoSAA &amp; CSAB</div>
              <div>Updated May 2026</div>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 2, color: '#a8a5a0' }}>
              <div style={{ color: '#f5f3ef', fontWeight: 700, marginBottom: '0.2rem', fontFamily: 'Satoshi,Inter,sans-serif' }}>Links</div>
              <div><Link href="/predict?exam=GATE" style={{ color: '#a8a5a0' }}>GATE Predictor</Link></div>
              <div><Link href="/predict?exam=JEE" style={{ color: '#a8a5a0' }}>JEE Predictor</Link></div>
              <div><Link href="/admin" style={{ color: '#a8a5a0' }}>Admin</Link></div>
            </div>
          </div>
          <div style={{ fontSize: '0.77rem', color: '#6b6966', lineHeight: 1.6, paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' }}>
            © {new Date().getFullYear()} CollegeCompass. Predictions are indicative — always verify on the official counselling portal.
          </div>
        </div>
        {/* Brand wordmark */}
        <div style={{ overflow: 'hidden', textAlign: 'center', height: 'clamp(4rem,14vw,12rem)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.78, fontSize: 'clamp(5.5rem,22vw,20rem)', color: 'transparent', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', userSelect: 'none', whiteSpace: 'nowrap' }}>collegecompass.</span>
        </div>
      </footer>

    </div>
  )
}
