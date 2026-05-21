import Link from 'next/link'
import { prisma } from '@/lib/db'
import { NavAuth } from '@/components/nav-auth'
import AnimatedStats from '@/components/home/AnimatedStats'
import CollegeMarquee from '@/components/home/CollegeMarquee'
import RotatingText from '@/components/home/RotatingText'
import ScrollReveal from '@/components/home/ScrollReveal'

export const dynamic = 'force-dynamic'

async function getHomeStats() {
  try {
    const [countRows, instituteRows] = await Promise.all([
      prisma.cutoff.aggregate({ _count: { id: true }, _max: { year: true } }),
      prisma.cutoff.groupBy({ by: ['institute'] }),
    ])
    return {
      totalCutoffs: countRows._count.id,
      totalColleges: instituteRows.length,
      year: 2026,
    }
  } catch (error) {
    console.warn('Home stats unavailable:', error)
    return { totalCutoffs: 0, totalColleges: 0, year: 2026 }
  }
}

export default async function Home() {
  const { totalCutoffs, totalColleges, year } = await getHomeStats()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Announcement bar ──────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1d4ed8 0%, #4338ca 100%)',
          color: '#fff',
          fontSize: '0.78rem',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          fontFamily: 'Satoshi,Inter,sans-serif',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        🎯 {year} Official Cutoffs &middot; GATE &middot; JEE Main &middot; JEE Advanced &middot;
        Instant Predictions
      </div>

      {/* ── White sticky navbar ───────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <nav className="nav">
          <Link href="/" className="nav-logo">
            college<span style={{ color: '#2563eb' }}>compass</span>
            <span style={{ color: '#2563eb', fontWeight: 900 }}>.</span>
          </Link>
          <div
            className="hide-sm"
            style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}
          >
            {[
              { l: 'GATE', h: '/predict?exam=GATE' },
              { l: 'JoSAA', h: '/predict?exam=JEE_MAIN&counselling=JOSAA' },
              { l: 'CSAB', h: '/predict?exam=JEE_MAIN&counselling=CSAB' },
            ].map(n => (
              <Link
                key={n.l}
                href={n.h}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 8,
                  color: '#334155',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  fontFamily: 'Satoshi,Inter,sans-serif',
                }}
              >
                {n.l}
              </Link>
            ))}
            <Link
              href="#pricing"
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 8,
                color: '#2563eb',
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: 'Satoshi,Inter,sans-serif',
              }}
            >
              Pricing
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <NavAuth />
            <Link
              href="/predict?exam=GATE"
              className="btn btn-sm hide-xs cta-glow"
              style={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: 99,
                padding: '0.5rem 1.1rem',
                fontFamily: 'Satoshi,Inter,sans-serif',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: 'none',
              }}
            >
              Get Prediction →
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero ──────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          color: '#f1f5f9',
          overflow: 'hidden',
          position: 'relative',
          paddingTop: '5rem',
          paddingBottom: '5.5rem',
        }}
      >
        {/* Animated orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Subtle dot grid overlay */}
        <div
          className="dot-pattern"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4,
            WebkitMaskImage:
              'radial-gradient(ellipse 60% 50% at 50% 40%, #000 30%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, #000 30%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge */}
          <div
            className="fade-up fade-up-1"
            style={{
              marginBottom: '1.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#93c5fd',
              borderRadius: 99,
              padding: '0.35rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'Satoshi,Inter,sans-serif',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>✦</span>
            Counselling-Accurate Predictions &middot; {year} Data
          </div>

          {/* Hero heading with rotating text */}
          <h1
            className="fade-up fade-up-2"
            style={{
              fontSize: 'clamp(2.5rem,6.5vw,5rem)',
              maxWidth: 820,
              margin: '0 auto',
              lineHeight: 1.06,
              color: '#fff',
            }}
          >
            Find Your Perfect
            <br />
            <RotatingText />
          </h1>

          <p
            className="fade-up fade-up-3"
            style={{
              fontSize: 'clamp(1rem,2vw,1.18rem)',
              color: '#94a3b8',
              maxWidth: 560,
              margin: '1.4rem auto 0',
              lineHeight: 1.7,
            }}
          >
            Enter your GATE 2026 score or JEE 2026 rank. Get an instant ranked list of IITs, NITs
            &amp; IIITs you can realistically target.
          </p>

          {/* ── White exam picker card with glow ──── */}
          <div
            className="fade-up fade-up-4"
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '1.2rem',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35), 0 0 80px -20px rgba(37,99,235,0.15)',
              maxWidth: 700,
              margin: '2.8rem auto 0',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              {[
                {
                  emoji: '🎓',
                  label: 'GATE M.Tech',
                  href: '/predict?exam=GATE',
                  desc: 'Score-based',
                },
                {
                  emoji: '📐',
                  label: 'JEE Main · JoSAA',
                  href: '/predict?exam=JEE_MAIN&counselling=JOSAA',
                  desc: 'Rank-based',
                },
                {
                  emoji: '🔄',
                  label: 'JEE Main · CSAB',
                  href: '/predict?exam=JEE_MAIN&counselling=CSAB',
                  desc: 'CRL-based',
                },
              ].map(e => (
                <Link
                  key={e.label}
                  href={e.href}
                  style={{
                    flex: '1 1 160px',
                    padding: '0.9rem 0.75rem',
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 650,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all .2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                  }}
                >
                  <span>
                    {e.emoji} {e.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                    {e.desc}
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/predict?exam=GATE"
              className="cta-glow"
              style={{
                display: 'block',
                marginTop: '0.7rem',
                padding: '0.9rem 1.5rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                color: '#fff',
                borderRadius: 14,
                fontFamily: 'Satoshi,Inter,sans-serif',
                fontWeight: 700,
                fontSize: '0.98rem',
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'filter .2s',
              }}
            >
              Start Predicting →
            </Link>

            {/* Trust chips */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                marginTop: '0.9rem',
                paddingTop: '0.8rem',
                borderTop: '1px solid #f1f5f9',
                flexWrap: 'wrap',
              }}
            >
              {['Official cutoffs', 'Free preview', 'PDF download', 'No signup'].map(t => (
                <span
                  key={t}
                  style={{
                    fontSize: '0.74rem',
                    color: '#64748b',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span style={{ color: '#2563eb', fontSize: '0.8rem' }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Animated stats */}
          <div className="fade-up fade-up-5">
            <AnimatedStats
              stats={[
                { value: `${totalCutoffs}`, label: 'Cutoff Data Points', suffix: '+' },
                { value: `${totalColleges}`, label: 'Institutes Tracked', suffix: '+' },
                { value: '9', label: 'Categories Supported', suffix: '+' },
                { value: '49', label: 'One-time Unlock', prefix: '₹' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── College marquee ───────────────────────── */}
      <CollegeMarquee />

      {/* ── Why CollegeCompass ─────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                Why CollegeCompass?
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>
                The smartest way to plan your counselling
              </p>
            </div>
          </ScrollReveal>

          <div className="grid-4">
            {[
              {
                icon: '📋',
                title: 'Official Cutoff Data',
                desc: `Data sourced directly from JoSAA, CSAB, COAP and CCMT portals. ${year} final-round closing cutoffs.`,
                color: '#2563eb',
                bg: '#eff6ff',
              },
              {
                icon: '⚖️',
                title: 'Counselling-Accurate',
                desc: 'GATE score-based, JEE rank-based — with home-state quota, gender pool and reserved category applied.',
                color: '#7c3aed',
                bg: '#f5f3ff',
              },
              {
                icon: '⚡',
                title: 'Instant Results',
                desc: 'No account required. Enter details and see matches within seconds — preview free, full list ₹49.',
                color: '#059669',
                bg: '#ecfdf5',
              },
              {
                icon: '📥',
                title: 'PDF Download',
                desc: 'Formatted PDF of your complete college list for parents or offline reference during counselling.',
                color: '#ea580c',
                bg: '#fff7ed',
              },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i + 1}>
                <div
                  className="card-lift"
                  style={{
                    padding: '1.6rem',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: f.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      marginBottom: '1.1rem',
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: '1.02rem',
                      color: '#0f172a',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.87rem', lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exam Cards ────────────────────────────── */}
      <section className="dot-pattern" style={{ padding: '5rem 0', background: '#f1f5f9' }}>
        <div className="container">
          <ScrollReveal>
            <h2
              style={{
                textAlign: 'center',
                fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              Pick your exam
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: '#64748b',
                marginBottom: '3rem',
                fontSize: '1rem',
              }}
            >
              We handle different counselling rules for each — no manual lookup.
            </p>
          </ScrollReveal>

          <div className="grid-3" style={{ maxWidth: 1080, margin: '0 auto', gap: '1.2rem' }}>
            {[
              {
                exam: 'GATE',
                emoji: '🎓',
                label: 'M.Tech / MS',
                desc: 'Score-based matching against CCMT, COAP and direct IIT cutoffs across CS, EC, ME, CE and 6 more papers.',
                tags: ['IITs', 'NITs', 'IIITs', 'GFTIs', 'COAP', 'CCMT'],
                href: '/predict?exam=GATE',
                cta: 'GATE Predictor 2026 →',
                accent: '#2563eb',
                accentBg: '#eff6ff',
              },
              {
                exam: 'JoSAA',
                emoji: '📐',
                label: 'JEE Main · JoSAA',
                desc: 'Main counselling rounds for NITs, IIITs & GFTIs. Category rank with home-state quota applied.',
                tags: ['NITs', 'IIITs', 'GFTIs', 'JoSAA'],
                href: '/predict?exam=JEE_MAIN&counselling=JOSAA',
                cta: 'JoSAA Predictor 2026 →',
                accent: '#7c3aed',
                accentBg: '#f5f3ff',
              },
              {
                exam: 'CSAB',
                emoji: '🔄',
                label: 'JEE Main · CSAB',
                desc: 'Special rounds to fill vacant NIT/IIIT/GFTI seats after JoSAA. Uses CRL for all seats.',
                tags: ['NITs', 'IIITs', 'GFTIs', 'CSAB'],
                href: '/predict?exam=JEE_MAIN&counselling=CSAB',
                cta: 'CSAB Predictor 2026 →',
                accent: '#0891b2',
                accentBg: '#ecfeff',
              },
            ].map((c, i) => (
              <ScrollReveal key={c.exam} delay={i + 1}>
                <Link
                  href={c.href}
                  style={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <div
                    className="card-lift"
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 18,
                      padding: '1.8rem',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: c.accentBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {c.emoji}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.09em',
                        color: c.accent,
                        marginBottom: '0.35rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                      }}
                    >
                      {c.exam}
                    </div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: '0.6rem',
                      }}
                    >
                      {c.label}
                    </h3>
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.87rem',
                        lineHeight: 1.65,
                        marginBottom: '1rem',
                        flex: 1,
                      }}
                    >
                      {c.desc}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.3rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.2rem',
                      }}
                    >
                      {c.tags.map(t => (
                        <span
                          key={t}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            padding: '0.18rem 0.5rem',
                            fontSize: '0.72rem',
                            color: '#64748b',
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 12,
                        padding: '0.72rem 1rem',
                        background: c.accent,
                        color: '#fff',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        transition: 'filter .2s',
                      }}
                    >
                      {c.cta}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <h2
              style={{
                textAlign: 'center',
                fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.5rem',
              }}
            >
              How it <span className="gradient-text">works</span>
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: '#64748b',
                marginBottom: '3rem',
                fontSize: '1rem',
              }}
            >
              Four steps to counselling confidence.
            </p>
          </ScrollReveal>

          <div className="grid-4">
            {[
              {
                n: '01',
                t: 'Enter details',
                d: 'Pick exam, enter score or rank, category, gender and home state.',
                icon: '✏️',
              },
              {
                n: '02',
                t: 'Free preview',
                d: 'Instantly see your top 3 college matches — no payment required.',
                icon: '👁️',
              },
              {
                n: '03',
                t: 'Unlock ₹49',
                d: 'One-time payment via Razorpay. No account, no subscription.',
                icon: '🔓',
              },
              {
                n: '04',
                t: 'Download PDF',
                d: 'Filter, sort and export your full ranked list as a PDF.',
                icon: '📄',
              },
            ].map((x, i) => (
              <ScrollReveal key={x.n} delay={i + 1}>
                <div
                  className="card-lift"
                  style={{
                    padding: '1.6rem',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* Step number watermark */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      fontFamily: 'Satoshi,Inter,sans-serif',
                      fontWeight: 900,
                      fontSize: '4.5rem',
                      lineHeight: 1,
                      background:
                        'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.04))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {x.n}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.7rem' }}>{x.icon}</div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize: '1.02rem',
                      color: '#0f172a',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {x.t}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.65 }}>{x.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                Students love it
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>
                Trusted by GATE and JEE aspirants across India
              </p>
            </div>
          </ScrollReveal>

          <div className="grid-3" style={{ gap: '1.2rem' }}>
            {[
              {
                name: 'Arjun S.',
                exam: 'GATE CS',
                text: 'Saved me hours of manual lookup. The predictions matched exactly with my CCMT allotment.',
                score: 'Score: 680',
              },
              {
                name: 'Priya M.',
                exam: 'JEE Main · JoSAA',
                text: "The home-state quota feature was a game changer. Got seats I didn't even know I was eligible for.",
                score: 'Rank: 45,000',
              },
              {
                name: 'Rahul K.',
                exam: 'GATE EC',
                text: 'Worth every rupee. The PDF report was so handy during counselling — parents loved it.',
                score: 'Score: 540',
              },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={i + 1}>
                <div
                  className="card-lift"
                  style={{
                    padding: '1.6rem',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    height: '100%',
                  }}
                >
                  <div className="quote-mark">&ldquo;</div>
                  <p
                    style={{
                      color: '#334155',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      marginBottom: '1.2rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {t.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        flexShrink: 0,
                      }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: '#0f172a',
                          fontFamily: 'Satoshi,Inter,sans-serif',
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {t.exam} &middot; {t.score}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built on real rules (DARK) ────────────── */}
      <section style={{ padding: '5rem 0', background: '#0f172a', color: '#f1f5f9' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', color: '#f1f5f9' }}>
                Built on real{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  counselling rules
                </span>
              </h2>
              <p style={{ marginTop: '0.6rem', color: '#94a3b8', fontSize: '1rem' }}>
                Not just a rank lookup — the actual algorithm used in counselling.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid-3">
            {[
              {
                icon: '📋',
                t: `Official ${year} cutoffs`,
                d: 'Data from JoSAA, CSAB, COAP and CCMT portals — not third-party scrapers.',
              },
              {
                icon: '⚖️',
                t: 'Counselling-accurate rules',
                d: 'Home-state quota, gender pool and reserved category applied exactly as in real counselling.',
              },
              {
                icon: '📊',
                t: 'Last-round cutoffs',
                d: "Each programme's final-round closing cutoff — the most realistic admission threshold.",
              },
              {
                icon: '🔒',
                t: 'Honest predictions',
                d: 'No fake accuracy claims. Predictions are indicative — actual allotment depends on seat matrix.',
              },
              {
                icon: '⚡',
                t: 'Instant results',
                d: 'No account. No waiting. See your matches within seconds.',
              },
              {
                icon: '📥',
                t: 'PDF download',
                d: 'Formatted PDF for offline reference and sharing during counselling.',
              },
            ].map((x, i) => (
              <ScrollReveal key={x.t} delay={(i % 3) + 1}>
                <div
                  style={{
                    padding: '1.5rem',
                    borderRadius: 14,
                    background: '#1e293b',
                    border: '1px solid rgba(148,163,184,0.1)',
                    transition: 'all .25s',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: 'rgba(37,99,235,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      marginBottom: '0.9rem',
                    }}
                  >
                    {x.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem',
                      color: '#f1f5f9',
                    }}
                  >
                    {x.t}
                  </h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.87rem', lineHeight: 1.65 }}>{x.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────── */}
      <section id="pricing" style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                Stop guessing your colleges.
              </h2>
              <p style={{ marginTop: '0.6rem', fontSize: '1rem', color: '#64748b' }}>
                See a free preview, then unlock everything.
              </p>
            </div>
          </ScrollReveal>

          <div
            className="grid-2"
            style={{ alignItems: 'stretch', gap: '1.2rem', maxWidth: 760, margin: '0 auto' }}
          >
            <ScrollReveal delay={1}>
              <div
                className="card-lift"
                style={{
                  borderRadius: 20,
                  padding: '2rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    marginBottom: '1rem',
                    color: '#0f172a',
                  }}
                >
                  ✦ Free Preview
                </div>
                <div
                  style={{
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 900,
                    fontSize: '2.2rem',
                    letterSpacing: '-0.05em',
                    marginBottom: '0.3rem',
                    color: '#0f172a',
                  }}
                >
                  ₹0
                </div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                  No credit card. No signup.
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    marginBottom: '1.8rem',
                  }}
                >
                  {[
                    'Top 3 college matches',
                    `Real ${year} cutoff data`,
                    'Category & exam aware',
                  ].map(f => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ color: '#2563eb' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/predict"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', borderRadius: 12 }}
                >
                  Try it free →
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="card-dark" style={{ padding: '2rem', height: '100%' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    background: '#2563eb',
                    color: '#fff',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 700,
                    borderRadius: 99,
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.72rem',
                  }}
                >
                  Most Popular
                </span>
                <div
                  style={{
                    margin: '1rem 0 0.2rem',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 900,
                    fontSize: '2.6rem',
                    letterSpacing: '-0.05em',
                    color: '#fff',
                  }}
                >
                  ₹49{' '}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8' }}>
                    one-time
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                  Everything you need for counselling confidence.
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    marginBottom: '1.8rem',
                  }}
                >
                  {[
                    'Full ranked list with chance %',
                    'Home-state, gender & quota aware',
                    'JoSAA + CSAB + COAP + CCMT',
                    'Downloadable PDF report',
                    'Instant — no account needed',
                  ].map(f => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#e2e8f0',
                      }}
                    >
                      <span style={{ color: '#60a5fa' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/predict"
                  className="btn btn-sm cta-glow"
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    border: 'none',
                  }}
                >
                  Get your prediction →
                </Link>
                <div
                  style={{
                    marginTop: '0.7rem',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  🔒 Secure payment via Razorpay
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────── */}
      <section
        style={{
          padding: '3.5rem 0',
          background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #1e40af 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            top: -100,
            right: -80,
            pointerEvents: 'none',
          }}
        />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: 'clamp(1.4rem,3vw,2rem)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.5rem',
            }}
          >
            Predict Your College — 2026 Admissions
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Join thousands of students who planned their counselling with confidence.
          </p>
          <Link
            href="/predict?exam=GATE"
            className="btn"
            style={{
              background: '#fff',
              color: '#1e40af',
              borderRadius: 99,
              padding: '0.85rem 2.2rem',
              fontFamily: 'Satoshi,Inter,sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.2)',
            }}
          >
            Enter Your 2026 Rank — It&apos;s Free →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer style={{ background: '#0f172a', color: '#f1f5f9' }}>
        <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '1.5rem' }}>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo" style={{ marginBottom: '0.7rem', color: '#f1f5f9' }}>
                college<span style={{ color: '#60a5fa' }}>compass</span>.
              </div>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.83rem',
                  lineHeight: 1.65,
                  marginBottom: '1rem',
                }}
              >
                Counselling-accurate college prediction tool. Not affiliated with JoSAA, CSAB, IIT,
                NIT, or any institute.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['X', 'In'].map(label => (
                  <span
                    key={label}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      transition: 'background .15s',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Predictors',
                links: [
                  { l: 'GATE Predictor 2026', h: '/predict?exam=GATE' },
                  { l: 'JoSAA Predictor 2026', h: '/predict?exam=JEE_MAIN&counselling=JOSAA' },
                  { l: 'CSAB Predictor 2026', h: '/predict?exam=JEE_MAIN&counselling=CSAB' },
                  { l: 'JEE Advanced 2026', h: '/predict?exam=JEE_ADVANCED' },
                ],
              },
              {
                title: 'Data Sources',
                links: [
                  { l: `GATE ${year} — COAP & CCMT`, h: '#' },
                  { l: `JEE ${year} — JoSAA & CSAB`, h: '#' },
                  { l: 'Updated May 2026', h: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { l: 'Dashboard', h: '/dashboard' },
                  { l: 'Admin', h: '/admin' },
                  { l: 'Privacy', h: '#' },
                  { l: 'Contact', h: '#' },
                ],
              },
            ].map(col => (
              <div key={col.title}>
                <h4
                  style={{
                    color: '#f1f5f9',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    marginBottom: '0.8rem',
                  }}
                >
                  {col.title}
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {col.links.map(x => (
                    <li key={x.l}>
                      <Link href={x.h} style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                        {x.l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(148,163,184,0.1)',
              paddingTop: '1.3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.8rem',
              fontSize: '0.77rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>CollegeCompass</span>
              <span>© {new Date().getFullYear()}. All rights reserved.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569' }}>
              <span>Built with</span>
              {['Next.js 16', 'Prisma', 'PostgreSQL', 'Vercel'].map((tech, i) => (
                <span key={tech} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {i > 0 && <span>&middot;</span>}
                  <span style={{ color: '#94a3b8' }}>{tech}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            overflow: 'hidden',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'Satoshi,Inter,sans-serif',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 0.85,
              fontSize: 'clamp(3rem,13vw,16rem)',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              background:
                'linear-gradient(180deg, rgba(148,163,184,0.2) 0%, rgba(148,163,184,0.04) 60%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              padding: '0.8rem 0',
            }}
          >
            collegecompass.
          </span>
        </div>
      </footer>
    </div>
  )
}
