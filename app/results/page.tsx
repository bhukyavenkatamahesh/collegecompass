'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NavAuth } from '@/components/nav-auth'
import { getCollegeLogo, getInstituteInitials } from '@/lib/college-logos'

interface College {
  institute: string
  program: string
  instituteType: string
  state: string
  openRank: number
  closeRank: number
  openScore: number
  closeScore: number
  isInterdisciplinary?: boolean
  seatPool?: string
  quota?: string
  seatType?: string
  source?: string
  rankBasis?: string
  chance: 'High' | 'Medium' | 'Low'
  chancePercent: number
}
type PredictRequest = {
  examType: string
  category: string
  branch?: string
  gender?: string
  score?: number
  rank?: number
  crlRank?: number
  homeState?: string
  accessToken?: string
}
type PdfDocument = {
  setFontSize: (size: number) => void
  setFont: (fontName: string, fontStyle?: string) => void
  setTextColor: (...args: number[]) => void
  text: (text: string, x: number, y: number, options?: { angle?: number }) => void
  save: (filename: string) => void
  internal: { pageSize: { height: number } }
}
type PdfConstructor = new () => PdfDocument
type AutoTable = (doc: PdfDocument, options: Record<string, unknown>) => void

const BRANCH_MAP: Record<string, string> = {
  ALL: 'All branches',
  CS: 'Computer Science',
  EC: 'Electronics & Comm.',
  EE: 'Electrical Engineering',
  ME: 'Mechanical Engineering',
  CE: 'Civil Engineering',
  CH: 'Chemical Engineering',
  BT: 'Biotechnology',
  MA: 'Mathematics',
  DA: 'Data Science & AI',
  MATH: 'Mathematics / Computing',
  PHYSICS: 'Physics',
}

/** CollegeLogo — shows official logo if found, else colored initials avatar */
function CollegeLogo({ name }: { name: string }) {
  const logoUrl = getCollegeLogo(name)
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        style={{
          width: 34,
          height: 34,
          objectFit: 'contain',
          borderRadius: 6,
          background: '#fff',
          border: '1px solid var(--border)',
          flexShrink: 0,
          padding: 2,
        }}
        onError={e => {
          // Fallback to initials on broken image
          const target = e.currentTarget
          const { initials, bg } = getInstituteInitials(name)
          target.replaceWith(
            Object.assign(document.createElement('div'), {
              textContent: initials,
              style: `width:34px;height:34px;border-radius:6px;background:${bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:800;flex-shrink:0;font-family:Satoshi,Inter,sans-serif;letter-spacing:-0.02em`,
            })
          )
        }}
      />
    )
  }
  const { initials, bg } = getInstituteInitials(name)
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 6,
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.72rem',
        fontWeight: 800,
        flexShrink: 0,
        fontFamily: 'Satoshi,Inter,sans-serif',
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  )
}

function chanceColor(c: string) {
  return c === 'High' ? '#166534' : c === 'Medium' ? '#9a3412' : '#991b1b'
}
function chanceBg(c: string) {
  return c === 'High' ? '#dcfce7' : c === 'Medium' ? '#fff7ed' : '#fee2e2'
}
function chanceAccent(c: string) {
  return c === 'High' ? '#16a34a' : c === 'Medium' ? 'var(--accent)' : '#ef4444'
}

function ResultsContent() {
  const p = useSearchParams()
  const exam = p.get('exam') || 'GATE'
  const rank = p.get('rank') || ''
  const score = p.get('score') || rank
  const category = p.get('category') || 'GEN'
  const branch = p.get('branch') || ''
  const gender = p.get('gender') || 'Male'
  const homeState = p.get('homeState') || p.get('state') || ''
  const crl = p.get('crl') || ''
  const counselling = p.get('counselling') || ''
  const accessToken = p.get('accessToken') || ''
  const paid = Boolean(accessToken)

  const isGate = exam === 'GATE'
  const isCsab = counselling === 'CSAB'
  const examLabel =
    exam === 'GATE'
      ? 'GATE'
      : exam === 'JEE_ADVANCED'
        ? 'JEE Advanced'
        : isCsab
          ? 'JEE Main (CSAB)'
          : 'JEE Main (JoSAA)'
  const rankLabel = isGate
    ? 'Score'
    : exam === 'JEE_ADVANCED'
      ? 'JEE Adv Rank'
      : isCsab
        ? 'CRL'
        : 'Category Rank'
  const displayVal = isGate ? score : rank
  const displayBranch = BRANCH_MAP[branch] || branch

  const ITEMS_PER_PAGE = 25

  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!paid) return
    const body: PredictRequest = { examType: exam, category, branch, gender }
    if (isGate) body.score = parseInt(score)
    else {
      body.rank = parseInt(rank)
      if (crl) body.crlRank = parseInt(crl)
      body.homeState = homeState
      if (counselling) (body as Record<string, unknown>).counselling = counselling
    }
    body.accessToken = accessToken
    fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(d => {
        setColleges(d.locked ? [] : d.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const types = ['All', ...Array.from(new Set(colleges.map(c => c.instituteType)))]
  const filtered = colleges.filter(
    c =>
      (filter === 'All' || c.chance === filter) &&
      (typeFilter === 'All' || c.instituteType === typeFilter)
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const setChanceFilter = (f: 'All' | 'High' | 'Medium' | 'Low') => {
    setFilter(f)
    setPage(1)
  }
  const setInstTypeFilter = (t: string) => {
    setTypeFilter(t)
    setPage(1)
  }

  const stats = {
    High: colleges.filter(c => c.chance === 'High').length,
    Medium: colleges.filter(c => c.chance === 'Medium').length,
    Low: colleges.filter(c => c.chance === 'Low').length,
  }

  async function downloadPDF() {
    setPdfLoading(true)
    try {
      const jsPDFModule = await import('jspdf')
      const JsPDF = jsPDFModule.default as unknown as PdfConstructor
      const autoTableModule = await import('jspdf-autotable')
      const autoTable = autoTableModule.default as unknown as AutoTable

      const doc = new JsPDF()

      // Brand Logo
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(37, 99, 235) // Blue accent
      doc.text('collegecompass.', 14, 18)

      // Report Title
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40) // Dark text
      doc.text(`${examLabel} College Prediction Report`, 14, 28)

      // Sub-header stats
      doc.setFontSize(8.5)
      doc.setTextColor(100, 100, 100) // Grey text
      doc.text(
        `${rankLabel}: ${displayVal}   |   Category: ${category}   |   Branch: ${displayBranch || 'All'}   |   Matches: ${filtered.length}`,
        14,
        36
      )

      const head = isGate
        ? [['#', 'Institute', 'Program', 'Type', 'Min Score', 'Max Score', 'Probability']]
        : [['#', 'Institute', 'Program', 'Type', 'Open Rank', 'Close Rank', 'Probability']]
      const body = filtered.map((c, i) => [
        i + 1,
        c.institute,
        c.program + (c.isInterdisciplinary ? '\n(Interdisciplinary)' : ''),
        c.instituteType,
        isGate ? Math.min(c.openScore, c.closeScore) : c.openRank?.toLocaleString(),
        isGate ? Math.max(c.openScore, c.closeScore) : c.closeRank?.toLocaleString(),
        `${c.chancePercent}% ${c.chance}`,
      ])

      autoTable(doc, {
        startY: 44,
        head,
        body,
        theme: 'plain',
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 20,
          fontStyle: 'bold',
          fontSize: 8,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [40, 40, 40],
          fillColor: false,
          lineColor: [235, 235, 235],
          lineWidth: { bottom: 0.1 },
        },
        columnStyles: { 6: { fontStyle: 'bold', textColor: [234, 88, 12] } },
        willDrawPage: () => {
          // Draw watermark in the background of every page
          doc.setFontSize(60)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(242, 242, 242) // Very light grey watermark
          // Rotate text 45 degrees in the center of the page
          doc.text('collegecompass.', 30, 200, { angle: 45 })
        },
      })

      doc.setFontSize(7.5)
      doc.setTextColor(150, 150, 150)
      doc.text(
        'Generated by CollegeCompass · Indicative only — verify on official counselling portals.',
        14,
        doc.internal.pageSize.height - 10
      )
      doc.save(`CollegeCompass_${examLabel.replace(' ', '_')}_${category}.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
      alert('Failed to generate PDF. Check console for details.')
    } finally {
      setPdfLoading(false)
    }
  }

  if (!paid)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg)',
        }}
      >
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem' }}>Access denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please complete payment to view your results.</p>
        <Link href="/predict" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          Go to Predictor →
        </Link>
      </div>
    )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        paddingBottom: '4rem',
      }}
    >
      {/* Nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">
            college<span style={{ color: '#2563eb' }}>compass</span>
            <span style={{ color: '#2563eb' }}>.</span>
          </Link>
          <div
            className="hide-sm"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontFamily: 'Satoshi,Inter,sans-serif',
              fontWeight: 600,
            }}
          >
            Your {examLabel} Results
          </div>
          <div className="results-nav-right">
            <NavAuth />
            <button onClick={downloadPDF} disabled={pdfLoading} className="btn btn-primary btn-sm">
              {pdfLoading ? '⏳…' : '↓ PDF'}
            </button>
          </div>
        </nav>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        {/* Page header */}
        <div className="fade-up" style={{ marginBottom: '2.5rem' }}>
          <div className="pill" style={{ marginBottom: '0.9rem' }}>
            Results ready
          </div>
          <h1 style={{ fontSize: 'clamp(1.9rem,4.5vw,3rem)', marginBottom: '0.5rem' }}>
            Your <span className="gradient-text">{examLabel}</span> Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {rankLabel} <strong style={{ color: 'var(--text)' }}>{displayVal}</strong> · {category}{' '}
            · {displayBranch || 'All branches'} ·{' '}
            <strong style={{ color: 'var(--text)' }}>{colleges.length}</strong> colleges matched
          </p>
        </div>

        {/* Chance summary cards */}
        <div className="fade-up results-stats-grid">
          {(['High', 'Medium', 'Low'] as const).map(ch => (
            <div
              key={ch}
              onClick={() => setChanceFilter(filter === ch ? 'All' : ch)}
              className="glass glass-hover"
              style={{
                padding: '1.4rem',
                borderRadius: 'var(--r)',
                cursor: 'pointer',
                border:
                  filter === ch ? `1.5px solid ${chanceAccent(ch)}` : '1px solid var(--border)',
                transition: 'all .2s',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'Satoshi,Inter,sans-serif',
                  color: chanceAccent(ch),
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {stats[ch]}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginTop: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Satoshi,Inter,sans-serif',
                }}
              >
                {ch} Chance
              </div>
            </div>
          ))}
        </div>

        {/* Type filter pills */}
        <div
          className="fade-up filter-pills-row"
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.6rem' }}
        >
          {types.map(t => (
            <button
              key={t}
              onClick={() => setInstTypeFilter(t)}
              style={{
                padding: '0.38rem 0.95rem',
                borderRadius: 99,
                cursor: 'pointer',
                fontFamily: 'Satoshi,Inter,sans-serif',
                fontWeight: 600,
                fontSize: '0.82rem',
                border: '1.5px solid',
                transition: 'all .18s',
                background: typeFilter === t ? 'var(--text)' : 'var(--bg-1)',
                borderColor: typeFilter === t ? 'var(--text)' : 'var(--border-strong)',
                color: typeFilter === t ? 'var(--bg)' : 'var(--text-muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div
            className="glass"
            style={{ padding: '5rem', textAlign: 'center', borderRadius: 'var(--r-lg)' }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.8rem' }}>⚡</div>
            <div style={{ color: 'var(--text-muted)' }}>Matching against official cutoffs…</div>
          </div>
        ) : (
          <div
            className="glass fade-up"
            style={{
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-muted)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <th
                      className="col-hide-mobile"
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Institute
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Program
                    </th>
                    <th
                      className="col-hide-mobile"
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Type
                    </th>
                    <th
                      className="col-hide-mobile"
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      State
                    </th>
                    <th
                      className="col-hide-mobile"
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isGate ? 'Min Score' : 'Open Rank'}
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isGate ? 'Max Score' : 'Close Rank'}
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.75rem',
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Chance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td
                        className="col-hide-mobile"
                        style={{
                          padding: '0.85rem 0.75rem',
                          color: 'var(--text-faint)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {(page - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 0.75rem',
                          fontWeight: 600,
                          fontFamily: 'Satoshi,Inter,sans-serif',
                          minWidth: 180,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {/* Logo / initials avatar */}
                          <CollegeLogo name={c.institute} />
                          <div>
                            <div>{c.institute}</div>
                            {/* Show type tag inline on mobile */}
                            <div style={{ display: 'none' }} className="show-mobile-inline">
                              <span
                                className="tag"
                                style={{ marginTop: '0.25rem', display: 'inline-block' }}
                              >
                                {c.instituteType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 0.75rem',
                          color: 'var(--text-muted)',
                          minWidth: 130,
                        }}
                      >
                        {c.program}
                        {c.isInterdisciplinary && (
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--accent)',
                              fontWeight: 700,
                              marginTop: '0.15rem',
                            }}
                          >
                            Interdisciplinary ↗
                          </div>
                        )}
                      </td>
                      <td className="col-hide-mobile" style={{ padding: '0.85rem 0.75rem' }}>
                        <span className="tag">{c.instituteType}</span>
                      </td>
                      <td
                        className="col-hide-mobile"
                        style={{
                          padding: '0.85rem 0.75rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.state}
                      </td>
                      <td
                        className="col-hide-mobile"
                        style={{ padding: '0.85rem 0.75rem', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {isGate
                          ? Math.min(c.openScore, c.closeScore)
                          : c.openRank?.toLocaleString()}
                      </td>
                      <td
                        style={{ padding: '0.85rem 0.75rem', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {isGate
                          ? Math.max(c.openScore, c.closeScore)
                          : c.closeRank?.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            background: chanceBg(c.chance),
                            color: chanceColor(c.chance),
                            borderRadius: 'var(--r-sm)',
                            padding: '0.28rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'Satoshi,Inter,sans-serif',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c.chancePercent}% {c.chance}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: '3rem 1rem',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                        }}
                      >
                        No colleges match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.9rem',
            }}
          >
            {/* Showing X–Y of Z */}
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontFamily: 'Satoshi,Inter,sans-serif',
              }}
            >
              Showing{' '}
              <strong style={{ color: 'var(--text)' }}>
                {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
              </strong>{' '}
              of <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> colleges
            </p>

            {/* Page controls */}
            {totalPages > 1 && (
              <div
                className="pagination-controls"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {/* Prev */}
                <button
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  style={{
                    padding: '0.42rem 0.85rem',
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid var(--border-strong)',
                    background: 'var(--bg-1)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: page === 1 ? 'var(--text-faint)' : 'var(--text)',
                    opacity: page === 1 ? 0.45 : 1,
                    transition: 'all .15s',
                  }}
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                  // Show first, last, current ±1, and ellipsis
                  const show = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
                  const ellipsisAfter = p === 1 && page > 3
                  const ellipsisBefore = p === totalPages && page < totalPages - 2
                  if (!show) return null
                  return (
                    <span
                      key={p}
                      style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                    >
                      {ellipsisAfter && (
                        <span
                          style={{
                            color: 'var(--text-faint)',
                            fontSize: '0.82rem',
                            padding: '0 0.1rem',
                          }}
                        >
                          …
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setPage(p)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        style={{
                          minWidth: 36,
                          padding: '0.42rem 0.5rem',
                          borderRadius: 'var(--r-sm)',
                          border: '1.5px solid',
                          cursor: 'pointer',
                          fontFamily: 'Satoshi,Inter,sans-serif',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          transition: 'all .15s',
                          background: p === page ? 'var(--text)' : 'var(--bg-1)',
                          borderColor: p === page ? 'var(--text)' : 'var(--border-strong)',
                          color: p === page ? 'var(--bg)' : 'var(--text)',
                        }}
                      >
                        {p}
                      </button>
                      {ellipsisBefore && (
                        <span
                          style={{
                            color: 'var(--text-faint)',
                            fontSize: '0.82rem',
                            padding: '0 0.1rem',
                          }}
                        >
                          …
                        </span>
                      )}
                    </span>
                  )
                })}

                {/* Next */}
                <button
                  onClick={() => {
                    setPage(p => Math.min(totalPages, p + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.42rem 0.85rem',
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid var(--border-strong)',
                    background: 'var(--bg-1)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: page === totalPages ? 'var(--text-faint)' : 'var(--text)',
                    opacity: page === totalPages ? 0.45 : 1,
                    transition: 'all .15s',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.78rem',
            color: 'var(--text-faint)',
            lineHeight: 1.7,
          }}
        >
          Predictions are indicative and based on previous-year cutoffs. Always verify on the
          official counselling portal before making decisions.
          <Link
            href="/predict"
            style={{ marginLeft: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}
          >
            ← Start a new prediction
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Loading…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
