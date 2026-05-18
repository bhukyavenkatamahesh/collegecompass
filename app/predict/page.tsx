'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['GEN','EWS','OBC','SC','ST','GEN-PwD','OBC-PwD','SC-PwD','ST-PwD']
const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','J&K','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal']
const GATE_BRANCHES = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'Electronics', code: 'EC' },
  { name: 'Electrical', code: 'EE' },
  { name: 'Mechanical', code: 'ME' },
  { name: 'Civil', code: 'CE' },
  { name: 'Chemical', code: 'CH' },
  { name: 'Biotechnology', code: 'BT' },
  { name: 'Mathematics', code: 'MA' },
  { name: 'Data Science', code: 'DA' }
]

declare global {
  interface Window { Razorpay: any }
}

function PredictForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawExam = searchParams.get('exam') || 'GATE'
  const defaultExam = rawExam === 'JEE' ? 'JEE_MAIN' : rawExam

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    exam: defaultExam,
    rank: '',
    crl: '',
    category: 'GEN',
    branch: 'CS',
    gender: 'Male',
    homeState: '',
    name: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any[]>([])

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handlePreview() {
    setLoading(true)
    setError('')
    try {
      const isGate = form.exam === 'GATE'
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: form.exam,
          category: form.category,
          branch: form.branch,
          ...(isGate
            ? { score: parseInt(form.rank) }
            : {
                rank: parseInt(form.rank),
                crlRank: form.category === 'GEN' ? parseInt(form.rank) : (form.crl ? parseInt(form.crl) : undefined),
                gender: form.gender,
                homeState: form.homeState,
              }),
        })
      })
      const data = await res.json()
      setPreview(data.results?.slice(0, 3) || [])
      setStep(2)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  async function handlePayment() {
    setLoading(true)
    setError('')
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: form.exam, name: form.name, email: form.email, phone: form.phone })
      })
      const order = await orderRes.json()

      // If no real Razorpay key is configured, skip to results directly (dev/demo mode)
      const isDemo = !order.keyId || order.keyId.includes('YOUR_KEY')
      if (isDemo || !window.Razorpay) {
        router.push(`/results?exam=${form.exam}&${form.exam==='GATE'?'score':'rank'}=${form.rank}&category=${form.category}&branch=${form.branch}&gender=${form.gender}&state=${encodeURIComponent(form.homeState)}&crl=${form.crl}&paid=true`)
        return
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CollegeCompass',
        description: `${form.exam} College Prediction`,
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          const verified = await verifyRes.json()
          if (verified.success) {
            router.push(`/results?exam=${form.exam}&${form.exam==='GATE'?'score':'rank'}=${form.rank}&category=${form.category}&branch=${form.branch}&gender=${form.gender}&state=${encodeURIComponent(form.homeState)}&crl=${form.crl}&paid=true`)
          } else {
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#4f6ef7' },
      })
      rzp.open()
    } catch {
      setError('Payment failed. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', padding:'0.75rem 1rem', borderRadius:'10px', fontSize:'0.95rem',
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,140,255,0.2)', color:'var(--text)',
    fontFamily:'DM Sans, sans-serif', transition:'border-color 0.2s'
  }
  const labelStyle = { display:'block', marginBottom:'0.4rem', color:'var(--text-muted)', fontSize:'0.85rem', fontFamily:'DM Sans, sans-serif' }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      {/* Back */}
      <div style={{position:'absolute',top:'1.5rem',left:'2rem'}}>
        <Link href="/" style={{color:'var(--text-muted)',textDecoration:'none',fontSize:'0.9rem',fontFamily:'DM Sans,sans-serif'}}>← Back</Link>
      </div>

      <div style={{width:'100%',maxWidth:'520px'}}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{fontFamily:'Syne',fontWeight:800,fontSize:'1.8rem',marginBottom:'0.5rem'}}>
            {step === 1 ? 'Enter Your Details' : step === 2 ? 'Preview & Pay' : 'Your Colleges'}
          </h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>
            {step === 1 ? 'Tell us about your exam to get started' : 'Here\'s a sneak peek — pay ₹49 for the full list'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'2rem'}}>
          {['Details','Preview','Full Results'].map((s,i) => (
            <div key={s} style={{flex:1,height:'4px',borderRadius:'4px',background:step>i?'var(--accent)':'rgba(255,255,255,0.1)',transition:'background 0.3s'}} />
          ))}
        </div>

        <div className="glass" style={{padding:'2rem',borderRadius:'16px'}}>
          {step === 1 && (
            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              {/* Exam Toggle */}
              <div>
                <label style={labelStyle}>Select Exam</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.6rem'}}>
                  {[{k:'GATE',l:'🎓 GATE'},{k:'JEE_MAIN',l:'📐 JEE Main'},{k:'JEE_ADV',l:'🏛 JEE Adv'}].map(e => (
                    <button key={e.k} onClick={() => update('exam', e.k)}
                      style={{padding:'0.7rem 0.4rem',borderRadius:'10px',cursor:'pointer',fontFamily:'Syne',fontWeight:600,fontSize:'0.85rem',transition:'all 0.2s',
                        background:form.exam===e.k?'var(--accent)':'rgba(255,255,255,0.04)',
                        border:form.exam===e.k?'1px solid var(--accent)':'1px solid rgba(255,255,255,0.1)',
                        color:form.exam===e.k?'white':'var(--text-muted)'}}>
                      {e.l}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.4rem'}}>
                  {form.exam==='GATE' ? 'M.Tech via COAP/CCMT — IITs, NITs, IIITs, GFTIs'
                   : form.exam==='JEE_ADV' ? 'B.Tech at IITs only (JEE Advanced rank)'
                   : 'B.Tech at NITs, IIITs & GFTIs (JEE Main rank)'}
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  {form.exam === 'GATE' ? 'GATE Score (out of 1000)'
                   : form.category !== 'GEN'
                     ? (form.exam === 'JEE_ADV' ? 'JEE Advanced Category Rank' : 'JEE Main Category Rank')
                     : (form.exam === 'JEE_ADV' ? 'JEE Advanced Rank (CRL)' : 'JEE Main Rank (CRL)')}
                </label>
                <input type="number" placeholder={form.exam==='GATE'?'e.g. 750':form.exam==='JEE_ADV'?'e.g. 4500':'e.g. 35000'}
                  value={form.rank} onChange={e => update('rank', e.target.value)} style={inputStyle} />
                {form.exam !== 'GATE' && form.category !== 'GEN' && (
                  <div style={{fontSize:'0.72rem',color:'var(--accent3)',marginTop:'0.35rem'}}>
                    Enter your <strong>{form.category} category rank</strong> here (used for reserved JoSAA seats).
                  </div>
                )}
              </div>

              {form.exam !== 'GATE' && form.category !== 'GEN' && (
                <div>
                  <label style={labelStyle}>All-India CRL Rank <span style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>(Common Rank List)</span></label>
                  <input type="number" placeholder="e.g. 120000"
                    value={form.crl} onChange={e => update('crl', e.target.value)} style={inputStyle} />
                  <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.35rem'}}>
                    Needed for <strong>Open seats</strong> (reserved candidates can take them via CRL) and all <strong>CSAB</strong> seats. Leave blank to see reserved-seat predictions only.
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>{form.exam === 'GATE' ? 'GATE Paper' : 'Branch'}</label>
                <select value={form.branch} onChange={e => update('branch', e.target.value)} style={inputStyle}>
                  {GATE_BRANCHES.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>

              {form.exam !== 'GATE' && (
                <>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                      {['Male','Female'].map(g => (
                        <button key={g} onClick={() => update('gender', g)}
                          style={{padding:'0.7rem',borderRadius:'10px',cursor:'pointer',fontFamily:'Syne',fontWeight:600,fontSize:'0.9rem',
                            background:form.gender===g?'var(--accent)':'rgba(255,255,255,0.04)',
                            border:form.gender===g?'1px solid var(--accent)':'1px solid rgba(255,255,255,0.1)',
                            color:form.gender===g?'white':'var(--text-muted)'}}>
                          {g === 'Female' ? '♀ Female' : '♂ Male'}
                        </button>
                      ))}
                    </div>
                    {form.gender === 'Female' && (
                      <div style={{fontSize:'0.72rem',color:'var(--accent2)',marginTop:'0.4rem'}}>
                        Includes female-only (supernumerary) seats — usually more lenient cutoffs.
                      </div>
                    )}
                  </div>
                  {form.exam === 'JEE_MAIN' && (
                    <div>
                      <label style={labelStyle}>Home State <span style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>(state where you passed Class 12)</span></label>
                      <select value={form.homeState} onChange={e => update('homeState', e.target.value)} style={inputStyle}>
                        <option value="">— Select home state —</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'0.35rem'}}>
                        NITs/GFTIs reserve ~50% seats for home-state students. IITs &amp; IIITs are All-India (no state quota).
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && <div style={{color:'#f7854f',fontSize:'0.85rem'}}>{error}</div>}

              <button onClick={handlePreview} disabled={!form.rank || loading}
                className="btn-primary" style={{padding:'0.875rem',borderRadius:'12px',fontSize:'1rem',opacity:!form.rank||loading?0.5:1}}>
                {loading ? 'Predicting...' : 'See College Predictions →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              <div style={{background:'rgba(79,110,247,0.05)',border:'1px solid rgba(79,110,247,0.15)',borderRadius:'10px',padding:'1rem'}}>
                <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginBottom:'0.75rem',fontFamily:'Syne',fontWeight:600,letterSpacing:'0.05em'}}>PREVIEW (Top 3 of {preview.length > 0 ? '50+' : '0'} colleges)</div>
                {preview.map((c, i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.625rem 0',borderBottom:i<2?'1px solid rgba(255,255,255,0.05)':'none'}}>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:500}}>{c.institute}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{c.program}</div>
                    </div>
                    <span style={{padding:'0.25rem 0.6rem',borderRadius:'6px',fontSize:'0.75rem',fontWeight:600,
                      background:c.chance==='High'?'rgba(56,201,160,0.15)':c.chance==='Medium'?'rgba(247,133,79,0.15)':'rgba(247,79,79,0.15)',
                      color:c.chance==='High'?'var(--accent2)':c.chance==='Medium'?'var(--accent3)':'#f74f4f'}}>
                      {c.chancePercent}% {c.chance}
                    </span>
                  </div>
                ))}
                <div style={{textAlign:'center',padding:'0.75rem',background:'rgba(0,0,0,0.2)',borderRadius:'8px',marginTop:'0.75rem',color:'var(--text-muted)',fontSize:'0.8rem'}}>
                  🔒 50+ more colleges hidden — pay to unlock full list
                </div>
              </div>

              <div style={{fontFamily:'Syne',fontWeight:700,fontSize:'0.8rem',color:'var(--text-muted)',letterSpacing:'0.05em'}}>YOUR DETAILS</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="10-digit mobile" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input value={form.email} onChange={e=>update('email',e.target.value)} placeholder="your@email.com" type="email" style={inputStyle} />
              </div>

              {error && <div style={{color:'#f7854f',fontSize:'0.85rem'}}>{error}</div>}

              <button onClick={handlePayment} disabled={!form.name||!form.email||loading}
                className="btn-primary" style={{padding:'0.875rem',borderRadius:'12px',fontSize:'1rem',opacity:!form.name||!form.email||loading?0.5:1}}>
                {loading ? 'Processing...' : 'Pay ₹49 & Get Full List →'}
              </button>
              <button onClick={()=>setStep(1)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'0.85rem'}}>
                ← Change Score / Rank
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}>Loading...</div>}>
      <PredictForm />
    </Suspense>
  )
}
