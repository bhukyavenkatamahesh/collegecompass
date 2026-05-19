'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type ExamType = 'GATE' | 'JEE_MAIN' | 'JEE_ADVANCED'
type Counselling = 'JOSAA' | 'CSAB'
type FormState = {
  exam: ExamType
  counselling: Counselling
  rank: string
  crl: string
  category: string
  branch: string
  gender: '' | 'Male' | 'Female'
  homeState: string
  name: string
  email: string
  phone: string
}
type PreviewCollege = {
  institute: string
  program: string
  chance: string
  chancePercent: number
}
type PredictRequest = {
  examType: ExamType
  category: string
  branch?: string
  gender?: string
  score?: number
  rank?: number
  crlRank?: number
  homeState?: string
  counselling?: Counselling
  accessToken?: string
}
type RazorpayResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  handler: (response: RazorpayResponse) => void
  modal: { ondismiss: () => void }
}
type RazorpayInstance = {
  open: () => void
}
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance
type OrderResponse = {
  orderId?: string
  amount?: number
  currency?: string
  keyId?: string
  mock?: boolean
  error?: string
}
type VerifyResponse = {
  success?: boolean
  accessToken?: string
  error?: string
}

const CATEGORIES = ['GEN','EWS','OBC','SC','ST','GEN-PwD','EWS-PwD','OBC-PwD','SC-PwD','ST-PwD']
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
const JEE_BRANCHES = [
  { name: 'All branches', code: 'ALL' },
  { name: 'Computer Science / IT / AI', code: 'CS' },
  { name: 'Electronics / Communication', code: 'EC' },
  { name: 'Electrical', code: 'EE' },
  { name: 'Mechanical', code: 'ME' },
  { name: 'Civil', code: 'CE' },
  { name: 'Chemical', code: 'CH' },
  { name: 'Biotechnology', code: 'BT' },
  { name: 'Mathematics / Computing', code: 'MATH' },
  { name: 'Physics', code: 'PHYSICS' },
]

declare global { interface Window { Razorpay: unknown } }

const L = { color:'var(--text)', fontSize:'0.83rem', fontWeight:600, fontFamily:'Satoshi,Inter,sans-serif', letterSpacing:'-0.01em', marginBottom:'0.4rem', display:'block' } as const

function PredictFooter() {
  const year = 2025
  return (
    <footer style={{ background:'#0a0a09', color:'#f5f3ef', padding:'2.5rem 0 1.2rem' }}>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem', alignItems:'flex-start', paddingBottom:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth:380 }}>
            <div className="nav-logo" style={{ marginBottom:'0.55rem', color:'#f5f3ef' }}>
              college<span style={{ color:'var(--accent)' }}>compass</span>.
            </div>
            <p style={{ color:'#a8a5a0', fontSize:'0.83rem', lineHeight:1.65 }}>
              Independent predictions using official cutoff data. Not affiliated with JoSAA, CSAB, IIT, NIT, CCMT, COAP, GATE or JEE authorities.
            </p>
          </div>
          <div style={{ fontSize:'0.82rem', lineHeight:2, color:'#a8a5a0' }}>
            <div style={{ color:'#f5f3ef', fontWeight:700, marginBottom:'0.2rem', fontFamily:'Satoshi,Inter,sans-serif' }}>Data sources</div>
            <div>GATE {year}: COAP and CCMT</div>
            <div>JEE {year}: JoSAA and CSAB</div>
            <div>Updated May 2026</div>
          </div>
          <div style={{ fontSize:'0.82rem', lineHeight:2, color:'#a8a5a0' }}>
            <div style={{ color:'#f5f3ef', fontWeight:700, marginBottom:'0.2rem', fontFamily:'Satoshi,Inter,sans-serif' }}>Predictors</div>
            <div><Link href="/predict?exam=GATE" style={{ color:'#a8a5a0' }}>GATE Predictor</Link></div>
            <div><Link href="/predict?exam=JEE_MAIN&counselling=JOSAA" style={{ color:'#a8a5a0' }}>JoSAA Predictor</Link></div>
            <div><Link href="/predict?exam=JEE_MAIN&counselling=CSAB" style={{ color:'#a8a5a0' }}>CSAB Predictor</Link></div>
          </div>
        </div>
        <div style={{ fontSize:'0.77rem', color:'#6b6966', lineHeight:1.6, paddingTop:'1rem' }}>
          © {new Date().getFullYear()} CollegeCompass. Predictions are indicative. Always verify on the official counselling portal before making decisions.
        </div>
      </div>
    </footer>
  )
}

function PredictForm() {
  const sp = useSearchParams()
  const router = useRouter()
  const rawExam = sp.get('exam') || 'GATE'
  const rawCounselling = sp.get('counselling') || 'JOSAA'
  const defaultExam: ExamType = rawExam === 'JEE_ADVANCED'
    ? 'JEE_ADVANCED'
    : rawExam === 'JEE' || rawExam === 'JEE_MAIN'
      ? 'JEE_MAIN'
      : 'GATE'
  const defaultCounselling: Counselling = rawCounselling === 'CSAB' ? 'CSAB' : 'JOSAA'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    exam: defaultExam,
    counselling: defaultCounselling,
    rank: '',
    crl: '',
    category: 'GEN',
    branch: defaultExam === 'GATE' ? 'CS' : 'ALL',
    gender: '',
    homeState: '',
    name: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<PreviewCollege[]>([])

  const u = <K extends keyof FormState>(k: K, v: FormState[K]) => { setForm(f=>({...f,[k]:v})); setError('') }
  const setExam = (exam: ExamType) => {
    setForm(f => ({
      ...f,
      exam,
      branch: exam === 'GATE' ? 'CS' : 'ALL',
      homeState: exam === 'JEE_ADVANCED' ? '' : f.homeState,
    }))
    setError('')
  }
  const validPositiveNumber = (value: string) => Number.isFinite(Number(value)) && Number(value) > 0
  const validPositiveInteger = (value: string) => Number.isInteger(Number(value)) && Number(value) > 0
  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s+/g,''))
  const validName = (v: string) => v.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(v.trim())

  function buildPredictionBody(): PredictRequest {
    const body: PredictRequest = { examType: form.exam, category: form.category }
    if (form.exam === 'GATE') {
      body.score = Number(form.rank)
      body.branch = form.branch
      return body
    }
    body.gender = form.gender || 'Male'
    body.branch = form.branch
    if (form.exam === 'JEE_MAIN') {
      body.counselling = form.counselling
      body.homeState = form.homeState
      if (form.counselling === 'CSAB') {
        // CSAB uses CRL for everything
        body.rank = parseInt(form.rank) // This IS the CRL
        body.crlRank = parseInt(form.rank)
      } else {
        // JoSAA uses category rank + optional CRL
        body.rank = parseInt(form.rank)
        if (form.crl) body.crlRank = parseInt(form.crl)
      }
    } else {
      // JEE Advanced
      body.rank = parseInt(form.rank)
      if (form.crl) body.crlRank = parseInt(form.crl)
    }
    return body
  }

  async function handlePreview() {
    if (isGate && !validPositiveNumber(form.rank)) { setError('Enter a valid GATE score (1–1000)'); return }
    if (isGate && Number(form.rank) > 1000) { setError('GATE score cannot exceed 1000'); return }
    if (isGate && Number(form.rank) < 1) { setError('GATE score must be at least 1'); return }
    if (!isGate && !validPositiveInteger(form.rank)) { setError(`Enter a valid ${isAdvanced ? 'JEE Advanced' : 'JEE Main'} rank (whole number)`); return }
    if (isAdvanced && Number(form.rank) > 50000) { setError('JEE Advanced rank cannot exceed 50,000 — please check'); return }
    if (isMain && Number(form.rank) > 10000000) { setError('JEE Main rank seems too high — please check'); return }
    if (!isGate && !form.gender) { setError('Please select your gender — it affects seat pool eligibility'); return }
    if (!isGate && form.exam === 'JEE_MAIN' && !form.homeState) { setError('Select your home state — required for NIT/GFTI quota'); return }
    if (!isGate && form.crl && !validPositiveInteger(form.crl)) { setError('CRL rank must be a whole number (e.g. 120000)'); return }
    if (!isGate && form.crl && Number(form.crl) > 10000000) { setError('CRL rank seems too high — please check'); return }
    setLoading(true); setError('')
    try {
      const body = buildPredictionBody()
      const res = await fetch('/api/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview((data.results || []).slice(0,3))
      setStep(2)
    } catch(e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    setLoading(false)
  }

  async function handlePayment() {
    if (!form.name.trim()) { setError('Please enter your full name'); return }
    if (!validName(form.name)) { setError('Name should only contain letters (min 2 characters)'); return }
    if (!form.email.trim()) { setError('Please enter your email address'); return }
    if (!validEmail(form.email)) { setError('Enter a valid email (e.g. you@gmail.com)'); return }
    if (form.phone && !validPhone(form.phone)) { setError('Enter a valid 10-digit mobile number (e.g. 9876543210)'); return }
    setLoading(true); setError('')

    const reportPayload = buildPredictionBody()
    const goToResults = (accessToken: string) => {
      const params = new URLSearchParams({
        exam: form.exam,
        rank: form.rank,
        category: form.category,
        branch: form.branch,
        gender: form.gender,
        homeState: form.homeState,
        crl: form.crl,
        counselling: form.counselling,
        accessToken,
      })
      router.push(`/results?${params.toString()}`)
    }

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ examType: form.exam, name: form.name, email: form.email, phone: form.phone }),
      })
      const order = await orderRes.json() as OrderResponse
      if (!orderRes.ok || order.error || !order.orderId || !order.amount || !order.currency) {
        throw new Error(order.error || 'Payment could not be started')
      }

      if (order.mock) {
        const verifyRes = await fetch('/api/payment/verify', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ mockPayment: true, reportPayload }),
        })
        const verified = await verifyRes.json() as VerifyResponse
        if (!verifyRes.ok || !verified.accessToken) throw new Error(verified.error || 'Payment verification failed')
        goToResults(verified.accessToken)
        return
      }

      const Razorpay = window.Razorpay as RazorpayConstructor | undefined
      if (!Razorpay || !order.keyId) throw new Error('Razorpay checkout is not available')
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CollegeCompass',
        description: `${form.exam === 'GATE' ? 'GATE' : 'JEE'} prediction report`,
        order_id: order.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async response => {
          const verifyRes = await fetch('/api/payment/verify', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              reportPayload,
            }),
          })
          const verified = await verifyRes.json() as VerifyResponse
          if (!verifyRes.ok || !verified.accessToken) {
            setError(verified.error || 'Payment verification failed')
            setLoading(false)
            return
          }
          goToResults(verified.accessToken)
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      checkout.open()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed')
      setLoading(false)
    }
  }

  const isGate = form.exam === 'GATE'
  const isAdvanced = form.exam === 'JEE_ADVANCED'
  const isMain = form.exam === 'JEE_MAIN'
  const isCsab = isMain && form.counselling === 'CSAB'
  const chanceColor = (c:string) => c==='High'?'var(--ok,#1f9d6b)':c==='Medium'?'var(--accent)':'#e0483c'
  const chanceBg   = (c:string) => c==='High'?'rgba(31,157,107,0.12)':c==='Medium'?'var(--accent-bg)':'rgba(224,72,60,0.12)'

  return (
    <div style={{ minHeight:'100dvh', height:'100dvh', overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch', background:'var(--bg)', color:'var(--text)' }}>
      {/* Sticky nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">college<span>compass</span><span style={{color:'var(--accent)'}}>.</span></Link>
          <div style={{ color:'var(--text-muted)', fontSize:'0.85rem', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600 }}>{isGate ? 'GATE Predictor' : isAdvanced ? 'JEE Advanced Predictor' : isCsab ? 'CSAB Predictor' : 'JoSAA Predictor'}</div>
          <div className="hide-sm" style={{ fontSize:'0.82rem', color:'var(--text-faint)', fontFamily:'Inter,sans-serif' }}>{isGate ? 'CCMT / COAP data' : isAdvanced ? 'JoSAA IIT data' : isCsab ? 'CSAB special round data' : 'JoSAA counselling data'}</div>
        </nav>
      </div>

      {/* Content */}
      <div className="predict-layout">

        {/* Left: info panel */}
        <div className="predict-info fade-up hide-sm">
          <div className="pill" style={{ marginBottom:'1.5rem' }}>Step {step} of 2</div>
          <h1 style={{ fontSize:'clamp(2rem,4vw,2.8rem)', lineHeight:1.1, marginBottom:'1rem' }}>
            {step===1 ? <>Enter your<br/><span className="gradient-text">details.</span></> : <>Preview &<br/><span className="gradient-text">unlock.</span></>}
          </h1>
          <p style={{ color:'var(--text-muted)', lineHeight:1.7, marginBottom:'2rem', fontSize:'0.95rem' }}>
            {step===1
              ? isGate ? 'We match your GATE score against every CCMT & COAP cutoff — category and paper eligibility applied.'
                : isAdvanced ? 'We match your JEE Advanced rank against every IIT cutoff — category, gender pool, all applied.'
                : isCsab ? 'CSAB fills vacant NIT/IIIT/GFTI seats after JoSAA. We match your CRL against every CSAB special-round cutoff.'
                : 'We match your JEE Main rank against every JoSAA NIT/IIIT/GFTI cutoff — category, gender pool, home-state quota all applied.'
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
              isGate ? '✓  Official 2025 CCMT · COAP cutoff data' : isAdvanced ? '✓  Official 2025 JoSAA IIT cutoff data' : isCsab ? '✓  Official 2025 CSAB special round data' : '✓  Official 2025 JoSAA cutoff data',
              '✓  Last-round cutoffs — most accurate threshold',
              '✓  Secure Razorpay payment · no account needed',
            ].map(t=>(
              <div key={t} style={{ fontSize:'0.84rem', color:'var(--text-muted)', lineHeight:1.8 }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div className="predict-form fade-up fade-up-2">
          <div className="glass" style={{ borderRadius:'var(--r-lg)', padding:'2.2rem', boxShadow:'var(--shadow-md)' }}>

            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

                {/* Exam selector */}
                <div>
                  <label style={L}>Exam</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                    {([{v:'GATE',l:'GATE'},{v:'JEE_MAIN',l:'JEE Main'},{v:'JEE_ADVANCED',l:'JEE Advanced'}] as const).map(e=>(
                      <button key={e.v} onClick={()=>setExam(e.v)} style={{ padding:'0.6rem 0.4rem', borderRadius:9, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', border:'1.5px solid', transition:'all .18s',
                        background:form.exam===e.v?'var(--text)':'var(--bg-1)',
                        borderColor:form.exam===e.v?'var(--text)':'var(--border-strong)',
                        color:form.exam===e.v?'var(--bg)':'var(--text-muted)' }}>
                        {e.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* JoSAA / CSAB selector for JEE Main */}
                {isMain && (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                      {([{v:'JOSAA' as Counselling, l:'JoSAA', desc:'Main Rounds'},{v:'CSAB' as Counselling, l:'CSAB', desc:'Special Rounds'}] as const).map(c=>(
                        <button key={c.v} onClick={()=>{setForm(f=>({...f, counselling:c.v, rank:'', crl:''})); setError('')}} style={{ padding:'0.6rem 0.4rem', borderRadius:9, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', border:'1.5px solid', transition:'all .18s',
                          background:form.counselling===c.v?'var(--accent-bg)':'var(--bg-1)',
                          borderColor:form.counselling===c.v?'rgba(249,115,22,0.4)':'var(--border-strong)',
                          color:form.counselling===c.v?'var(--accent)':'var(--text-muted)' }}>
                          {c.l} <span style={{fontWeight:400,fontSize:'0.72rem',opacity:0.8, marginLeft:'0.3rem'}}>{c.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.4rem'}}>{
                      isCsab
                        ? 'CSAB fills vacant NIT/IIIT/GFTI seats after JoSAA. Uses CRL for all seats.'
                        : 'JoSAA is the main counselling. Uses category rank for reserved seats, CRL for open seats.'
                    }</div>
                  </div>
                )}

                {/* Score / Rank */}
                <div>
                  <label style={L}>{isGate ? 'GATE Score' : isAdvanced ? 'JEE Advanced Category Rank' : isCsab ? 'JEE Main CRL (All India Rank)' : 'JEE Main Category Rank'}</label>
                  <input type="number" className="input-field" placeholder={isGate ? 'e.g. 750' : isAdvanced ? 'e.g. 1500' : isCsab ? 'e.g. 45000' : 'e.g. 12000'} value={form.rank} onChange={e=>u('rank',e.target.value)} />
                  {!isGate && <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>{
                    isAdvanced ? 'Your rank in your category on the JEE Advanced merit list. For GEN, this is your CRL.'
                    : isCsab ? 'CSAB uses your All India Rank (CRL) for all seats — OPEN and reserved.'
                    : 'Your rank in your category on the JEE Main merit list. For GEN, this is your CRL.'
                  }</div>}
                </div>

                {/* CRL rank (JEE non-GEN, not CSAB since CSAB rank IS CRL) */}
                {!isGate && !isCsab && form.category !== 'GEN' && (
                  <div>
                    <label style={L}>{isAdvanced ? 'JEE Advanced CRL' : 'JEE Main CRL'} <span style={{fontWeight:400,color:'var(--text-muted)'}}>— All India Rank</span></label>
                    <input type="number" className="input-field" placeholder={isAdvanced ? 'e.g. 8000' : 'e.g. 120000'} value={form.crl} onChange={e=>u('crl',e.target.value)} />
                    <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>{isAdvanced ? 'Your All India Rank (CRL) in JEE Advanced. Needed to compete for OPEN seats at IITs.' : 'Your All India Rank (CRL) in JEE Main. Needed for OPEN seats & CSAB colleges.'}</div>
                  </div>
                )}

                {/* Category + Branch */}
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
                      <label style={L}>Desired Branch</label>
                      <select className="input-field" value={form.branch} onChange={e=>u('branch',e.target.value)}>
                        {JEE_BRANCHES.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={L}>Gender <span style={{fontWeight:400,color:'var(--accent)'}}>*</span></label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                        {(['Male','Female'] as const).map(g=>(
                          <button key={g} onClick={()=>u('gender',g)} style={{ padding:'0.65rem', borderRadius:9, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600, fontSize:'0.88rem', border:'1.5px solid', transition:'all .18s',
                            background:form.gender===g?'var(--text)':'var(--bg-1)',
                            borderColor:form.gender===g?'var(--text)':!form.gender?'var(--accent)':'var(--border-strong)',
                            color:form.gender===g?'var(--bg)':'var(--text-muted)' }}>
                            {g==='Female'?'♀ Female':'♂ Male'}
                          </button>
                        ))}
                      </div>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>
                        {form.gender === 'Female'
                          ? '✓ You\'ll see Gender-Neutral + Female-only supernumerary seats — more options for you!'
                          : form.gender === 'Male'
                          ? 'You\'ll see Gender-Neutral seats only.'
                          : 'Females get extra Female-only seats at NITs/IITs in addition to Gender-Neutral seats.'}
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

                <button onClick={handlePreview} disabled={!form.rank||(!isGate && !form.gender)||loading} className="btn btn-primary" style={{ padding:'0.9rem', borderRadius:12, fontSize:'1rem', width:'100%' }}>
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
                <div className="grid-2" style={{ gap:'0.75rem' }}>
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
      <PredictFooter />
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
