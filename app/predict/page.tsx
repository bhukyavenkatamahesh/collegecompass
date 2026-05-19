'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['GEN','EWS','OBC','SC','ST','GEN-PwD','OBC-PwD','SC-PwD','ST-PwD']
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','J&K','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal']
const GATE_BRANCHES = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'Electronics & Comm.', code: 'EC' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CE' },
  { name: 'Chemical Engineering', code: 'CH' },
  { name: 'Biotechnology', code: 'BT' },
  { name: 'Mathematics', code: 'MA' },
  { name: 'Data Science & AI', code: 'DA' }
]

declare global { interface Window { Razorpay: any } }

const L = { color:'var(--text)', fontSize:'0.83rem', fontWeight:600, fontFamily:'Satoshi,Inter,sans-serif', letterSpacing:'-0.01em', marginBottom:'0.4rem', display:'block' } as const

function PredictForm() {
  const sp = useSearchParams()
  const router = useRouter()
  const rawExam = sp.get('exam') || 'GATE'
  const defaultExam = rawExam === 'JEE' ? 'JEE_MAIN' : rawExam

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ exam:defaultExam, rank:'', crl:'', category:'GEN', branch:'CS', gender:'Male', homeState:'', name:'', email:'', phone:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any[]>([])

  const u = (k:string, v:string) => { setForm(f=>({...f,[k]:v})); setError('') }

  async function handlePreview() {
    if (!form.rank) { setError('Please enter your score / rank'); return }
    setLoading(true); setError('')
    try {
      const isGate = form.exam === 'GATE'
      const body: any = { examType: form.exam, category: form.category, branch: form.branch, gender: form.gender }
      if (isGate) body.score = parseInt(form.rank)
      else { body.rank = parseInt(form.rank); if (form.crl) body.crl = parseInt(form.crl); body.homeState = form.homeState }
      const res = await fetch('/api/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview((data.results || []).slice(0,3))
      setStep(2)
    } catch(e:any) { setError(e.message || 'Something went wrong') }
    setLoading(false)
  }

  async function handlePayment() {
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    setLoading(true); setError('')

    // Razorpay not integrated yet — skip payment and go straight to results
    const params = new URLSearchParams({ exam:form.exam, rank:form.rank, category:form.category, branch:form.branch, gender:form.gender, homeState:form.homeState, paid:'true' })
    const resultUrl = `/results?${params.toString()}`
    setTimeout(() => router.push(resultUrl), 600)
  }

  const examLabels: Record<string,string> = { GATE:'GATE', JEE_MAIN:'JEE Main', JEE_ADVANCED:'JEE Advanced' }
  const isGate = form.exam === 'GATE'
  const chanceColor = (c:string) => c==='High'?'var(--ok,#1f9d6b)':c==='Medium'?'var(--accent)':'#e0483c'
  const chanceBg   = (c:string) => c==='High'?'rgba(31,157,107,0.12)':c==='Medium'?'var(--accent-bg)':'rgba(224,72,60,0.12)'

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Sticky nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">college<span>compass</span><span style={{color:'var(--accent)'}}>.</span></Link>
          <div style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{isGate ? '🎓 GATE Predictor' : '📐 JEE Predictor'}</div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Powered by official {isGate?'CCMT/COAP':'JoSAA/CSAB'} cutoffs</div>
        </nav>
      </div>

      {/* Content */}
      <div style={{ display:'flex', gap:'3rem', maxWidth:1100, margin:'0 auto', padding:'4rem 1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* Left: info panel */}
        <div style={{ flex:'1 1 300px' }} className="fade-up hide-sm">
          <div className="pill" style={{ marginBottom:'1.5rem' }}>Step {step} of 2</div>
          <h1 style={{ fontSize:'clamp(2rem,4vw,2.8rem)', lineHeight:1.1, marginBottom:'1rem' }}>
            {step===1 ? <>Enter your<br/><span className="gradient-text">details.</span></> : <>Preview &<br/><span className="gradient-text">unlock.</span></>}
          </h1>
          <p style={{ color:'var(--text-muted)', lineHeight:1.7, marginBottom:'2rem', fontSize:'0.95rem' }}>
            {step===1
              ? 'We match your score/rank against every published cutoff — category, gender pool, home-state quota all applied.'
              : 'Your top 3 matches are shown free. Unlock the complete list with PDF download for just ₹49 — one-time.'}
          </p>
          {/* Progress */}
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {[1,2].map(s=>(
              <div key={s} style={{ flex:1, height:4, borderRadius:99, background:step>=s?'var(--accent)':'var(--border)', transition:'background .3s' }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem' }}>
            {['Enter details','Preview & pay'].map((l,i)=>(
              <span key={l} style={{ fontSize:'0.72rem', color:step>i?'var(--accent)':'var(--text-faint)', fontWeight:step>i?700:400, fontFamily:'Satoshi,Inter,sans-serif' }}>{l}</span>
            ))}
          </div>

          {/* Trust signals */}
          <div className="glass" style={{ marginTop:'2.5rem', padding:'1.4rem', borderRadius:'var(--r)' }}>
            <div style={{ fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', marginBottom:'0.9rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Why trust us</div>
            {[
              '✓  Official 2025 JoSAA · CCMT · COAP data',
              '✓  Last-round cutoffs — most accurate threshold',
              '✓  Secure Razorpay payment · no account needed',
            ].map(t=>(
              <div key={t} style={{ fontSize:'0.84rem', color:'var(--text-muted)', lineHeight:1.8 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div style={{ flex:'1 1 420px', maxWidth:520 }} className="fade-up fade-up-2">
          <div className="glass" style={{ borderRadius:'var(--r-lg)', padding:'2.2rem', boxShadow:'var(--shadow-md)' }}>

            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

                {/* Exam selector */}
                <div>
                  <label style={L}>Exam</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                    {[{v:'GATE',l:'GATE'},{v:'JEE_MAIN',l:'JEE Main'},{v:'JEE_ADVANCED',l:'JEE Advanced'}].map(e=>(
                      <button key={e.v} onClick={()=>u('exam',e.v)} style={{ padding:'0.6rem 0.4rem', borderRadius:9, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', border:'1.5px solid', transition:'all .18s',
                        background:form.exam===e.v?'var(--text)':'var(--bg-1)',
                        borderColor:form.exam===e.v?'var(--text)':'var(--border-strong)',
                        color:form.exam===e.v?'#fff':'var(--text-muted)' }}>
                        {e.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score / Rank */}
                <div>
                  <label style={L}>{isGate ? 'GATE Score' : 'JEE Rank'}</label>
                  <input type="number" className="input-field" placeholder={isGate?'e.g. 750':'e.g. 12000'} value={form.rank} onChange={e=>u('rank',e.target.value)} />
                </div>

                {/* CRL rank (JEE non-GEN) */}
                {!isGate && form.category !== 'GEN' && (
                  <div>
                    <label style={L}>CRL Rank <span style={{fontWeight:400,color:'var(--text-muted)'}}>— Common Rank List</span></label>
                    <input type="number" className="input-field" placeholder="e.g. 120000" value={form.crl} onChange={e=>u('crl',e.target.value)} />
                    <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>Needed for open seats & CSAB. Leave blank for reserved-seat only.</div>
                  </div>
                )}

                {/* Category + Branch (branch only for GATE) */}
                <div style={{ display:'grid', gridTemplateColumns:isGate?'1fr 1fr':'1fr', gap:'0.85rem' }}>
                  <div>
                    <label style={L}>Category</label>
                    <select className="input-field" value={form.category} onChange={e=>u('category',e.target.value)}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {isGate && (
                    <div>
                      <label style={L}>GATE Paper</label>
                      <select className="input-field" value={form.branch} onChange={e=>u('branch',e.target.value)}>
                        {GATE_BRANCHES.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* JEE: Gender + Home State */}
                {!isGate && (
                  <>
                    <div>
                      <label style={L}>Gender</label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                        {['Male','Female'].map(g=>(
                          <button key={g} onClick={()=>u('gender',g)} style={{ padding:'0.65rem', borderRadius:9, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600, fontSize:'0.88rem', border:'1.5px solid', transition:'all .18s',
                            background:form.gender===g?'var(--text)':'var(--bg-1)',
                            borderColor:form.gender===g?'var(--text)':'var(--border-strong)',
                            color:form.gender===g?'#fff':'var(--text-muted)' }}>
                            {g==='Female'?'♀ Female':'♂ Male'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.exam==='JEE_MAIN' && (
                      <div>
                        <label style={L}>Home State <span style={{fontWeight:400,color:'var(--text-muted)'}}>— where you passed Class 12</span></label>
                        <select className="input-field" value={form.homeState} onChange={e=>u('homeState',e.target.value)}>
                          <option value="">— Select home state —</option>
                          {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>NITs/GFTIs reserve ~50% seats for home-state students.</div>
                      </div>
                    )}
                  </>
                )}

                {error && <div style={{background:'rgba(224,72,60,0.1)',border:'1px solid rgba(224,72,60,0.25)',borderRadius:8,padding:'0.7rem 1rem',color:'#e0483c',fontSize:'0.85rem'}}>{error}</div>}

                <button onClick={handlePreview} disabled={!form.rank||loading} className="btn btn-primary" style={{ padding:'0.9rem', borderRadius:12, fontSize:'1rem', width:'100%' }}>
                  {loading ? 'Analyzing cutoffs…' : 'See College Predictions →'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>

                {/* Preview strip */}
                <div style={{ background:'var(--bg-muted)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ padding:'0.75rem 1.1rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, fontFamily:'Satoshi,Inter,sans-serif', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Preview — Top 3</span>
                    <span className="pill" style={{ padding:'0.15rem 0.6rem', fontSize:'0.72rem' }}>50+ more hidden 🔒</span>
                  </div>
                  {preview.map((c,i)=>(
                    <div key={i} style={{ padding:'0.85rem 1.1rem', borderBottom:i<2?'1px solid var(--border)':'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.88rem', fontFamily:'Satoshi,Inter,sans-serif' }}>{c.institute}</div>
                        <div style={{ fontSize:'0.77rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>{c.program}</div>
                      </div>
                      <span style={{ background:chanceBg(c.chance), color:chanceColor(c.chance), borderRadius:7, padding:'0.22rem 0.6rem', fontSize:'0.75rem', fontWeight:700, fontFamily:'Satoshi,Inter,sans-serif', flexShrink:0 }}>
                        {c.chancePercent}% {c.chance}
                      </span>
                    </div>
                  ))}
                </div>

                {/* User details */}
                <div style={{ fontSize:'0.72rem', fontWeight:700, fontFamily:'Satoshi,Inter,sans-serif', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your details</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <label style={L}>Full Name</label>
                    <input className="input-field" value={form.name} onChange={e=>u('name',e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label style={L}>Phone</label>
                    <input className="input-field" value={form.phone} onChange={e=>u('phone',e.target.value)} placeholder="10-digit mobile" />
                  </div>
                </div>
                <div>
                  <label style={L}>Email</label>
                  <input className="input-field" type="email" value={form.email} onChange={e=>u('email',e.target.value)} placeholder="your@email.com" />
                </div>

                {error && <div style={{background:'rgba(224,72,60,0.1)',border:'1px solid rgba(224,72,60,0.25)',borderRadius:8,padding:'0.7rem 1rem',color:'#e0483c',fontSize:'0.85rem'}}>{error}</div>}

                {/* Pay CTA */}
                <button onClick={handlePayment} disabled={!form.name||!form.email||loading} className="btn btn-accent" style={{ padding:'0.9rem', borderRadius:12, fontSize:'1rem', width:'100%' }}>
                  {loading ? 'Processing…' : 'Pay ₹49 & Unlock Full List →'}
                </button>
                <div style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--text-faint)' }}>🔒 Secure payment via Razorpay</div>

                <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:500, padding:'0.3rem' }}>
                  ← Change details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}>Loading…</div>}>
      <PredictForm />
    </Suspense>
  )
}
