'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface College {
  institute: string; program: string; instituteType: string; state: string
  openRank: number; closeRank: number; openScore: number; closeScore: number
  isInterdisciplinary?: boolean; seatPool?: string; quota?: string
  seatType?: string; source?: string; rankBasis?: string
  chance: 'High'|'Medium'|'Low'; chancePercent: number
}

const BRANCH_MAP: Record<string,string> = { CS:'Computer Science', EC:'Electronics & Comm.', EE:'Electrical Engineering', ME:'Mechanical Engineering', CE:'Civil Engineering', CH:'Chemical Engineering', BT:'Biotechnology', MA:'Mathematics', DA:'Data Science & AI' }

function chanceColor(c:string) { return c==='High'?'#166534':c==='Medium'?'#9a3412':'#991b1b' }
function chanceBg(c:string)    { return c==='High'?'#dcfce7':c==='Medium'?'#fff7ed':'#fee2e2' }
function chanceAccent(c:string){ return c==='High'?'#16a34a':c==='Medium'?'var(--accent)':'#ef4444' }

function ResultsContent() {
  const p = useSearchParams()
  const exam      = p.get('exam')      || 'GATE'
  const rank      = p.get('rank')      || ''
  const score     = p.get('score')     || rank
  const category  = p.get('category') || 'GEN'
  const branch    = p.get('branch')    || ''
  const gender    = p.get('gender')    || 'Male'
  const homeState = p.get('state')     || ''
  const crl       = p.get('crl')       || ''
  const paid      = p.get('paid')      === 'true'

  const isGate   = exam === 'GATE'
  const examLabel= exam==='GATE'?'GATE':exam==='JEE_ADVANCED'?'JEE Advanced':'JEE Main'
  const rankLabel= isGate?'Score':exam==='JEE_ADVANCED'?'JEE Adv Rank':'JEE Main Rank'
  const displayVal = isGate ? score : rank
  const displayBranch = BRANCH_MAP[branch] || branch

  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'All'|'High'|'Medium'|'Low'>('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!paid) return
    const body: any = { examType:exam, category, branch, gender }
    if (isGate) body.score = parseInt(score)
    else { body.rank = parseInt(rank); if (crl) body.crl = parseInt(crl); body.homeState = homeState }
    fetch('/api/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      .then(r=>r.json())
      .then(d=>{ setColleges(d.results||[]); setLoading(false) })
      .catch(()=>setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const types    = ['All', ...Array.from(new Set(colleges.map(c=>c.instituteType)))]
  const filtered = colleges.filter(c=>(filter==='All'||c.chance===filter)&&(typeFilter==='All'||c.instituteType===typeFilter))

  const stats = { High:colleges.filter(c=>c.chance==='High').length, Medium:colleges.filter(c=>c.chance==='Medium').length, Low:colleges.filter(c=>c.chance==='Low').length }

  async function downloadPDF() {
    setPdfLoading(true)
    try {
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default ? jsPDFModule.default : (jsPDFModule as any).jsPDF
      const autoTableModule = await import('jspdf-autotable')
      const autoTable = autoTableModule.default || autoTableModule

      const doc = new (jsPDF as any)()

      // Brand Logo
      doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(249, 115, 22); // Orange accent
      doc.text('collegecompass.', 14, 18)

      // Report Title
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40); // Dark text
      doc.text(`${examLabel} College Prediction Report`, 14, 28)

      // Sub-header stats
      doc.setFontSize(8.5); doc.setTextColor(100, 100, 100); // Grey text
      doc.text(`${rankLabel}: ${displayVal}   |   Category: ${category}   |   Branch: ${displayBranch || 'All'}   |   Matches: ${filtered.length}`, 14, 36)

      const head = isGate ? [['#', 'Institute', 'Program', 'Type', 'Min Score', 'Max Score', 'Probability']] : [['#', 'Institute', 'Program', 'Type', 'Open Rank', 'Close Rank', 'Probability']]
      const body = filtered.map((c, i) => [
        i + 1, c.institute,
        c.program + (c.isInterdisciplinary ? '\n(Interdisciplinary)' : ''),
        c.instituteType,
        isGate ? Math.min(c.openScore, c.closeScore) : c.openRank?.toLocaleString(),
        isGate ? Math.max(c.openScore, c.closeScore) : c.closeRank?.toLocaleString(),
        `${c.chancePercent}% ${c.chance}`
      ])

      autoTable(doc, { 
        startY: 44, 
        head, 
        body,
        theme: 'plain',
        headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold', fontSize: 8, lineColor: [220, 220, 220], lineWidth: 0.1 },
        bodyStyles: { fontSize: 8, textColor: [40, 40, 40], fillColor: false, lineColor: [235, 235, 235], lineWidth: { bottom: 0.1 } },
        columnStyles: { 6: { fontStyle: 'bold', textColor: [234, 88, 12] } },
        willDrawPage: (data: any) => {
          // Draw watermark in the background of every page
          doc.setFontSize(60)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(242, 242, 242) // Very light grey watermark
          // Rotate text 45 degrees in the center of the page
          doc.text('collegecompass.', 30, 200, { angle: 45 })
        }
      })

      doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
      doc.text('Generated by CollegeCompass · Indicative only — verify on official counselling portals.', 14, doc.internal.pageSize.height - 10)
      doc.save(`CollegeCompass_${examLabel.replace(' ', '_')}_${category}.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
      alert('Failed to generate PDF. Check console for details.')
    } finally {
      setPdfLoading(false)
    }
  }

  if (!paid) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'var(--bg)' }}>
      <div style={{ fontSize:'3rem' }}>🔒</div>
      <h2 style={{ fontSize:'1.5rem' }}>Access denied</h2>
      <p style={{ color:'var(--text-muted)' }}>Please complete payment to view your results.</p>
      <Link href="/predict" className="btn btn-primary" style={{ marginTop:'0.5rem' }}>Go to Predictor →</Link>
    </div>
  )

  return (
    <div style={{ 
      minHeight:'100vh', paddingBottom:'4rem',
      '--bg': '#0a0a09', '--bg-1': '#141413', '--bg-card': '#1a1a18', '--bg-muted': '#141413',
      '--border': 'rgba(255,255,255,0.08)', '--border-strong': 'rgba(255,255,255,0.15)',
      '--text': '#f5f3ef', '--text-muted': '#a8a5a0', '--text-faint': '#6b6966',
      background: 'var(--bg)', color: 'var(--text)'
    } as React.CSSProperties}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,9,.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <nav className="nav">
          <Link href="/" className="nav-logo" style={{ color: '#f5f3ef' }}>college<span>compass</span><span style={{color:'var(--accent)'}}>.</span></Link>
          <div style={{ fontSize:'0.85rem', color:'#a8a5a0' }}>Your {examLabel} Results</div>
          <button onClick={downloadPDF} disabled={pdfLoading} className="btn btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.4rem', background: '#fff', color: '#0a0a09', borderRadius: 99, fontFamily: 'Satoshi,Inter,sans-serif', fontWeight: 700, border: 'none' }}>
            {pdfLoading ? '⏳ Generating…' : '↓ Download PDF'}
          </button>
        </nav>
      </div>

      <div className="container" style={{ paddingTop:'3rem', paddingBottom:'5rem' }}>

        {/* Page header */}
        <div className="fade-up" style={{ marginBottom:'2.5rem' }}>
          <div className="pill" style={{ marginBottom:'0.9rem' }}>Results ready</div>
          <h1 style={{ fontSize:'clamp(1.9rem,4.5vw,3rem)', marginBottom:'0.5rem' }}>
            Your <span className="gradient-text">{examLabel}</span> Matrix
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.95rem' }}>
            {rankLabel} <strong style={{ color:'var(--text)' }}>{displayVal}</strong> · {category} · {displayBranch || 'All branches'} · <strong style={{ color:'var(--text)' }}>{colleges.length}</strong> colleges matched
          </p>
        </div>

        {/* Chance summary cards */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {(['High','Medium','Low'] as const).map(ch=>(
            <div key={ch} onClick={()=>setFilter(filter===ch?'All':ch)}
              className="glass glass-hover"
              style={{ padding:'1.4rem', borderRadius:'var(--r)', cursor:'pointer', border:filter===ch?`1.5px solid ${chanceAccent(ch)}`:'1px solid var(--border)', transition:'all .2s' }}>
              <div style={{ fontSize:'2rem', fontWeight:900, fontFamily:'Satoshi,Inter,sans-serif', color:chanceAccent(ch), letterSpacing:'-0.04em', lineHeight:1 }}>{stats[ch]}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600, marginTop:'0.35rem', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Satoshi,Inter,sans-serif' }}>{ch} Chance</div>
            </div>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="fade-up" style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.6rem' }}>
          {types.map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'0.38rem 0.95rem', borderRadius:99, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600, fontSize:'0.82rem', border:'1.5px solid', transition:'all .18s',
              background:typeFilter===t?'var(--text)':'var(--bg-1)',
              borderColor:typeFilter===t?'var(--text)':'var(--border-strong)',
              color:typeFilter===t?'var(--bg)':'var(--text-muted)' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass" style={{ padding:'5rem', textAlign:'center', borderRadius:'var(--r-lg)' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'0.8rem' }}>⚡</div>
            <div style={{ color:'var(--text-muted)' }}>Matching against official cutoffs…</div>
          </div>
        ) : (
          <div className="glass fade-up" style={{ borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem', textAlign:'left' }}>
                <thead>
                  <tr style={{ background:'var(--bg-muted)', borderBottom:'1px solid var(--border)' }}>
                    {['#','Institute','Program','Type','State', isGate?'Min Score':'Open Rank', isGate?'Max Score':'Close Rank','Probability'].map(h=>(
                      <th key={h} style={{ padding:'0.9rem 1rem', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-muted)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                      <td style={{ padding:'0.9rem 1rem', color:'var(--text-faint)', fontVariantNumeric:'tabular-nums' }}>{i+1}</td>
                      <td style={{ padding:'0.9rem 1rem', fontWeight:600, fontFamily:'Satoshi,Inter,sans-serif', minWidth:180 }}>{c.institute}</td>
                      <td style={{ padding:'0.9rem 1rem', color:'var(--text-muted)', minWidth:160 }}>
                        {c.program}
                        {c.isInterdisciplinary && <div style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:700, marginTop:'0.15rem' }}>Interdisciplinary ↗</div>}
                      </td>
                      <td style={{ padding:'0.9rem 1rem' }}>
                        <span className="tag">{c.instituteType}</span>
                      </td>
                      <td style={{ padding:'0.9rem 1rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{c.state}</td>
                      <td style={{ padding:'0.9rem 1rem', fontVariantNumeric:'tabular-nums' }}>{isGate ? Math.min(c.openScore,c.closeScore) : c.openRank?.toLocaleString()}</td>
                      <td style={{ padding:'0.9rem 1rem', fontVariantNumeric:'tabular-nums' }}>{isGate ? Math.max(c.openScore,c.closeScore) : c.closeRank?.toLocaleString()}</td>
                      <td style={{ padding:'0.9rem 1rem' }}>
                        <span style={{ background:chanceBg(c.chance), color:chanceColor(c.chance), borderRadius:8, padding:'0.28rem 0.7rem', fontSize:'0.78rem', fontWeight:700, fontFamily:'Satoshi,Inter,sans-serif', whiteSpace:'nowrap' }}>
                          {c.chancePercent}% {c.chance}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ padding:'4rem', textAlign:'center', color:'var(--text-muted)' }}>No colleges match the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p style={{ marginTop:'1.5rem', fontSize:'0.78rem', color:'var(--text-faint)', lineHeight:1.7 }}>
          Predictions are indicative and based on previous-year cutoffs. Always verify on the official counselling portal before making decisions.
          <Link href="/predict" style={{ marginLeft:'0.5rem', color:'var(--accent)', fontWeight:600 }}>← Start a new prediction</Link>
        </p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>Loading…</div>}>
      <ResultsContent />
    </Suspense>
  )
}
