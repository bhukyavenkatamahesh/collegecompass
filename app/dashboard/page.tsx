'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* ── Types ────────────────────────────────────────────────── */
type PredictionInputs = {
  examType?: string
  category?: string
  branch?: string
  gender?: string
  homeState?: string
  rank?: number
  score?: number
  crlRank?: number
  counselling?: string
}

type SavedPrediction = {
  id: string
  examType: string
  counselling: string | null
  inputs: PredictionInputs
  totalResults: number
  accessToken: string
  paidAt: string
  createdAt: string
}

/* ── Static maps ──────────────────────────────────────────── */
const EXAM_LABELS: Record<string, string> = {
  GATE: 'GATE · CCMT / COAP',
  JEE_MAIN_JOSAA: 'JEE Main · JoSAA',
  JEE_MAIN_CSAB: 'JEE Main · CSAB',
  JEE_ADVANCED: 'JEE Advanced · IITs',
}

const EXAM_EMOJI: Record<string, string> = {
  GATE: '🎓',
  JEE_MAIN_JOSAA: '📐',
  JEE_MAIN_CSAB: '📐',
  JEE_ADVANCED: '🏆',
}

// All badge colours use the design-system palette (orange / green / amber)
const EXAM_COLORS: Record<string, { bg: string; color: string }> = {
  GATE: { bg: 'var(--accent-bg)', color: 'var(--accent-2)' },
  JEE_MAIN_JOSAA: { bg: 'rgba(16,185,129,0.10)', color: '#059669' },
  JEE_MAIN_CSAB: { bg: 'rgba(20,184,166,0.10)', color: '#0d9488' },
  JEE_ADVANCED: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
}

const BRANCH_NAMES: Record<string, string> = {
  ALL: 'All Branches',
  CS: 'Computer Science',
  EC: 'Electronics & Comm.',
  EE: 'Electrical',
  ME: 'Mechanical',
  CE: 'Civil',
  CH: 'Chemical',
  BT: 'Biotechnology',
  MA: 'Mathematics',
  DA: 'Data Science & AI',
  MATH: 'Mathematics / Computing',
  PHYSICS: 'Physics',
}

/* ── Helpers ──────────────────────────────────────────────── */
function buildResultsUrl(p: SavedPrediction): string {
  const inp = p.inputs
  const exam = inp.examType ?? p.examType.replace(/_JOSAA|_CSAB/, '')
  const isGate = exam === 'GATE'
  const params = new URLSearchParams({
    exam,
    rank: isGate ? String(inp.score ?? '') : String(inp.rank ?? inp.crlRank ?? ''),
    score: String(inp.score ?? ''),
    category: inp.category ?? 'GEN',
    branch: inp.branch ?? 'ALL',
    gender: inp.gender ?? 'Male',
    homeState: inp.homeState ?? '',
    crl: String(inp.crlRank ?? ''),
    counselling: inp.counselling ?? '',
    accessToken: p.accessToken,
  })
  return `/results?${params.toString()}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ── Sub-components ───────────────────────────────────────── */
function ExamBadge({ examType }: { examType: string }) {
  const c = EXAM_COLORS[examType] ?? { bg: 'var(--bg-muted)', color: 'var(--text-muted)' }
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        borderRadius: 99,
        padding: '0.22rem 0.75rem',
        fontSize: '0.74rem',
        fontWeight: 700,
        fontFamily: 'Satoshi,Inter,sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
      }}
    >
      <span>{EXAM_EMOJI[examType] ?? '📋'}</span>
      {EXAM_LABELS[examType] ?? examType}
    </span>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: '0.83rem', color: 'var(--text)' }}>
      <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>{label}: </span>
      <strong style={{ fontWeight: 600 }}>{value}</strong>
    </span>
  )
}

/* ── Skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="glass animate-pulse"
      style={{
        borderRadius: 'var(--r-lg)',
        padding: '1.4rem 1.6rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ height: 22, width: 160, borderRadius: 99, background: 'var(--bg-muted)' }} />
        <div style={{ height: 14, width: 260, borderRadius: 4, background: 'var(--bg-muted)' }} />
        <div style={{ height: 12, width: 120, borderRadius: 4, background: 'var(--bg-muted)' }} />
      </div>
      <div
        style={{
          height: 36,
          width: 120,
          borderRadius: 99,
          background: 'var(--bg-muted)',
          flexShrink: 0,
        }}
      />
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [predictions, setPredictions] = useState<SavedPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/predictions')
      .then(r => r.json())
      .then(d => {
        setPredictions(d.predictions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <span style={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>Loading…</span>
      </div>
    )
  }

  const user = session?.user
  const initials = (user?.name ?? user?.email ?? '?')[0].toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Navbar — uses the global .nav-wrapper + .nav pattern ── */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">
            college<span>compass</span>
            <span style={{ color: 'var(--accent)' }}>.</span>
          </Link>

          {/* Centre: page title */}
          <span
            className="hide-sm"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'Satoshi,Inter,sans-serif',
              color: 'var(--text-muted)',
            }}
          >
            My Dashboard
          </span>

          {/* Right: avatar + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {user?.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.image}
                  alt=""
                  width={28}
                  height={28}
                  style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
              )}
              <span
                className="hide-sm"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'Satoshi,Inter,sans-serif',
                  color: 'var(--text)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name ?? user?.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn btn-sm"
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--r-sm)',
                padding: '0.28rem 0.65rem',
                fontFamily: 'Satoshi,Inter,sans-serif',
                fontWeight: 500,
                boxShadow: 'none',
              }}
            >
              Sign out
            </button>
          </div>
        </nav>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1rem,3vw,1.5rem) 5rem',
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', marginBottom: '0.3rem' }}>
            My Predictions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            All your paid reports — re-open any time, no expiry.
          </p>
        </div>

        {/* New prediction CTA strip */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <Link href="/predict?exam=GATE" className="btn btn-primary btn-sm">
            🎓 GATE Prediction
          </Link>
          <Link href="/predict?exam=JEE_MAIN&counselling=JOSAA" className="btn btn-sm btn-ghost">
            📐 JEE Main · JoSAA
          </Link>
          <Link href="/predict?exam=JEE_MAIN&counselling=CSAB" className="btn btn-sm btn-ghost">
            📐 JEE Main · CSAB
          </Link>
          <Link href="/predict?exam=JEE_ADVANCED" className="btn btn-sm btn-ghost">
            🏆 JEE Advanced
          </Link>
        </div>

        {/* Predictions list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : predictions.length === 0 ? (
          /* Empty state */
          <div
            className="glass"
            style={{ borderRadius: 'var(--r-lg)', padding: '4rem 2rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>🔮</div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No predictions yet</h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                marginBottom: '1.8rem',
                maxWidth: 360,
                margin: '0 auto 1.8rem',
              }}
            >
              Run a prediction and unlock the full results — it will appear here automatically.
            </p>
            <Link
              href="/predict?exam=GATE"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.8rem' }}
            >
              Start Predicting →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {predictions.map(p => {
              const inp = p.inputs
              const isGate = p.examType === 'GATE'
              const scoreLabel = isGate
                ? 'Score'
                : p.examType === 'JEE_ADVANCED'
                  ? 'Category Rank'
                  : p.counselling === 'CSAB'
                    ? 'CRL'
                    : 'Category Rank'
              const scoreVal = isGate ? inp.score : (inp.rank ?? inp.crlRank)
              const branchName = BRANCH_NAMES[inp.branch ?? 'ALL'] ?? inp.branch ?? 'All Branches'

              return (
                <div
                  key={p.id}
                  className="glass glass-hover dash-prediction-card"
                  style={{
                    borderRadius: 'var(--r-lg)',
                    padding: 'clamp(1rem,2.5vw,1.3rem) clamp(1rem,2.5vw,1.5rem)',
                  }}
                >
                  {/* Left: exam details */}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ marginBottom: '0.55rem' }}>
                      <ExamBadge examType={p.examType} />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem 1rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <InfoChip label={scoreLabel} value={scoreVal?.toLocaleString() ?? '—'} />
                      <InfoChip label="Category" value={inp.category ?? 'GEN'} />
                      <InfoChip label="Branch" value={branchName} />
                      {inp.homeState && <InfoChip label="State" value={inp.homeState} />}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>
                      Purchased {formatDate(p.paidAt)}
                    </span>
                  </div>

                  {/* Right: open button */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.35rem',
                      flexShrink: 0,
                    }}
                  >
                    <Link href={buildResultsUrl(p)} className="btn btn-primary btn-sm">
                      Open Report →
                    </Link>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                      Full results · no expiry
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
