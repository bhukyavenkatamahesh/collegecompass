'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['GEN','EWS','OBC','SC','ST','GEN-PwD','OBC-PwD','SC-PwD','ST-PwD']
const GATE_BRANCHES = ['Computer Science','Electronics','Electrical','Mechanical','Civil','Chemical','Biotechnology','Mathematics']

declare global {
  interface Window { Razorpay: any }
}

function PredictForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultExam = searchParams.get('exam') || 'GATE'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    exam: defaultExam,
    rank: '',
    category: 'GEN',
    branch: 'Computer Science',
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
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: form.exam, rank: parseInt(form.rank), category: form.category, branch: form.branch })
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
        router.push(`/results?exam=${form.exam}&rank=${form.rank}&category=${form.category}&branch=${form.branch}&paid=true`)
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
            router.push(`/results?exam=${form.exam}&rank=${form.rank}&category=${form.category}&branch=${form.branch}&paid=true`)
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
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                  {['GATE','JEE'].map(e => (
                    <button key={e} onClick={() => update('exam', e)}
                      style={{padding:'0.75rem',borderRadius:'10px',cursor:'pointer',fontFamily:'Syne',fontWeight:600,fontSize:'0.95rem',transition:'all 0.2s',
                        background:form.exam===e?'var(--accent)':'rgba(255,255,255,0.04)',
                        border:form.exam===e?'1px solid var(--accent)':'1px solid rgba(255,255,255,0.1)',
                        color:form.exam===e?'white':'var(--text-muted)'}}>
                      {e === 'GATE' ? '🎓 GATE' : '📐 JEE Mains'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>{form.exam === 'GATE' ? 'GATE Score' : 'JEE Mains Rank (CRL)'}</label>
                <input type="number" placeholder={form.exam==='GATE'?'e.g. 750':'e.g. 12000'}
                  value={form.rank} onChange={e => update('rank', e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {form.exam === 'GATE' && (
                <div>
                  <label style={labelStyle}>Branch / Paper</label>
                  <select value={form.branch} onChange={e => update('branch', e.target.value)} style={inputStyle}>
                    {GATE_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
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
