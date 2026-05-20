'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { NavAuth } from '@/components/nav-auth'

type ExamType = 'GATE' | 'JEE_MAIN' | 'JEE_ADVANCED'
type Counselling = 'JOSAA' | 'CSAB'
type FormState = {
  exam: ExamType
  counselling: Counselling
  rank: string
  mainRank: string
  advancedRank: string
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

const CATEGORIES = [
  'GEN',
  'EWS',
  'OBC',
  'SC',
  'ST',
  'GEN-PwD',
  'EWS-PwD',
  'OBC-PwD',
  'SC-PwD',
  'ST-PwD',
]
const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'J&K',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]
const GATE_BRANCHES = [
  { name: 'Computer Science', code: 'CS' },
  { name: 'Electronics & Comm.', code: 'EC' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CE' },
  { name: 'Chemical Engineering', code: 'CH' },
  { name: 'Biotechnology', code: 'BT' },
  { name: 'Mathematics', code: 'MA' },
  { name: 'Data Science & AI', code: 'DA' },
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

declare global {
  interface Window {
    Razorpay: unknown
  }
}

const L = {
  color: 'var(--text)',
  fontSize: '0.83rem',
  fontWeight: 600,
  fontFamily: 'Satoshi,Inter,sans-serif',
  letterSpacing: '-0.01em',
  marginBottom: '0.4rem',
  display: 'block',
} as const

function PredictFooter() {
  const year = 2025
  return (
    <footer style={{ background: '#0a0a09', color: '#f5f3ef', padding: '2.5rem 0 1.2rem' }}>
      <div className="container">
        <div
          className="footer-columns"
          style={{
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ maxWidth: 380 }}>
            <div className="nav-logo" style={{ marginBottom: '0.55rem', color: '#f5f3ef' }}>
              college<span style={{ color: 'var(--accent)' }}>compass</span>.
            </div>
            <p style={{ color: '#a8a5a0', fontSize: '0.83rem', lineHeight: 1.65 }}>
              Independent predictions using official cutoff data. Not affiliated with JoSAA, CSAB,
              IIT, NIT, CCMT, COAP, GATE or JEE authorities.
            </p>
          </div>
          <div style={{ fontSize: '0.82rem', lineHeight: 2, color: '#a8a5a0' }}>
            <div
              style={{
                color: '#f5f3ef',
                fontWeight: 700,
                marginBottom: '0.2rem',
                fontFamily: 'Satoshi,Inter,sans-serif',
              }}
            >
              Data sources
            </div>
            <div>GATE {year}: COAP and CCMT</div>
            <div>JEE {year}: JoSAA and CSAB</div>
            <div>Updated May 2026</div>
          </div>
          <div style={{ fontSize: '0.82rem', lineHeight: 2, color: '#a8a5a0' }}>
            <div
              style={{
                color: '#f5f3ef',
                fontWeight: 700,
                marginBottom: '0.2rem',
                fontFamily: 'Satoshi,Inter,sans-serif',
              }}
            >
              Predictors
            </div>
            <div>
              <Link href="/predict?exam=GATE" style={{ color: '#a8a5a0' }}>
                GATE Predictor
              </Link>
            </div>
            <div>
              <Link href="/predict?exam=JEE_MAIN&counselling=JOSAA" style={{ color: '#a8a5a0' }}>
                JoSAA Predictor
              </Link>
            </div>
            <div>
              <Link href="/predict?exam=JEE_MAIN&counselling=CSAB" style={{ color: '#a8a5a0' }}>
                CSAB Predictor
              </Link>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.77rem', color: '#6b6966', lineHeight: 1.6, paddingTop: '1rem' }}>
          © {new Date().getFullYear()} CollegeCompass. Predictions are indicative. Always verify on
          the official counselling portal before making decisions.
        </div>
      </div>
    </footer>
  )
}

function PredictForm() {
  const sp = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const rawExam = sp.get('exam') || 'GATE'
  const rawCounselling = sp.get('counselling') || 'JOSAA'
  const defaultExam: ExamType =
    rawExam === 'JEE_ADVANCED'
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
    mainRank: '',
    advancedRank: '',
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

  const u = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    setError('')
  }
  const setExam = (exam: ExamType) => {
    setForm(f => ({
      ...f,
      exam,
      branch: exam === 'GATE' ? 'CS' : 'ALL',
      counselling: exam === 'JEE_ADVANCED' ? 'JOSAA' : f.counselling,
    }))
    setError('')
  }
  const validPositiveNumber = (value: string) => Number.isFinite(Number(value)) && Number(value) > 0
  const validPositiveInteger = (value: string) =>
    Number.isInteger(Number(value)) && Number(value) > 0
  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\s+/g, ''))
  const validName = (v: string) => v.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(v.trim())
  const isGate = form.exam === 'GATE'
  const isAdvanced = form.exam === 'JEE_ADVANCED'
  const isMain = form.exam === 'JEE_MAIN'
  const isCsab = isMain && form.counselling === 'CSAB'
  const activeRank = isGate ? form.rank : isAdvanced ? form.advancedRank : form.mainRank
  const needsCsabCrl = isCsab && form.category !== 'GEN'

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
        const csabCrl = parseInt(form.category === 'GEN' ? activeRank : form.crl)
        body.rank = csabCrl
        body.crlRank = csabCrl
      } else {
        // JoSAA uses category rank + optional CRL
        body.rank = parseInt(activeRank)
        if (form.crl) body.crlRank = parseInt(form.crl)
      }
    } else {
      // JEE Advanced
      body.rank = parseInt(activeRank)
      if (form.crl) body.crlRank = parseInt(form.crl)
    }
    return body
  }

  async function handlePreview() {
    if (isGate && !validPositiveNumber(form.rank)) {
      setError('Enter a valid GATE score (1–1000)')
      return
    }
    if (isGate && Number(form.rank) > 1000) {
      setError('GATE score cannot exceed 1000')
      return
    }
    if (isGate && Number(form.rank) < 1) {
      setError('GATE score must be at least 1')
      return
    }
    if (isMain && !form.mainRank) {
      setError('Enter your JEE Main 2026 category rank')
      return
    }
    if (isAdvanced && !form.advancedRank) {
      setError('Enter your JEE Advanced 2026 category rank')
      return
    }
    if (!isGate && !validPositiveInteger(activeRank)) {
      setError(`Enter a valid ${isAdvanced ? 'JEE Advanced' : 'JEE Main'} rank (whole number)`)
      return
    }
    if (isAdvanced && Number(activeRank) > 50000) {
      setError('JEE Advanced rank cannot exceed 50,000 — please check')
      return
    }
    if (isMain && Number(activeRank) > 10000000) {
      setError('JEE Main rank seems too high — please check')
      return
    }
    if (!isGate && !form.gender) {
      setError('Select your seat pool')
      return
    }
    if (!isGate && !form.homeState) {
      setError('Select your 12th Class Domicile State')
      return
    }
    if (needsCsabCrl && !form.crl) {
      setError('Enter your JEE Main CRL for CSAB — CSAB uses CRL for every seat')
      return
    }
    if (!isGate && form.crl && !validPositiveInteger(form.crl)) {
      setError('CRL rank must be a whole number (e.g. 120000)')
      return
    }
    if (!isGate && form.crl && Number(form.crl) > 10000000) {
      setError('CRL rank seems too high — please check')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = buildPredictionBody()
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview((data.results || []).slice(0, 3))
      setStep(2)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  async function handlePayment() {
    if (!form.name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!validName(form.name)) {
      setError('Name should only contain letters (min 2 characters)')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!validEmail(form.email)) {
      setError('Enter a valid email (e.g. you@gmail.com)')
      return
    }
    if (form.phone && !validPhone(form.phone)) {
      setError('Enter a valid 10-digit mobile number (e.g. 9876543210)')
      return
    }
    setLoading(true)
    setError('')

    const reportPayload = buildPredictionBody()
    const goToResults = (accessToken: string) => {
      const resultRank = isCsab && form.category !== 'GEN' ? form.crl : activeRank
      const params = new URLSearchParams({
        exam: form.exam,
        rank: resultRank,
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: form.exam,
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
      })
      const order = (await orderRes.json()) as OrderResponse
      if (!orderRes.ok || order.error || !order.orderId || !order.amount || !order.currency) {
        throw new Error(order.error || 'Payment could not be started')
      }

      if (order.mock) {
        const mockPaymentId = `pay_mock_${order.orderId.replace(/[^a-zA-Z0-9_]/g, '_')}`
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mockPayment: true,
            razorpayOrderId: order.orderId,
            razorpayPaymentId: mockPaymentId,
            reportPayload,
          }),
        })
        const verified = (await verifyRes.json()) as VerifyResponse
        if (!verifyRes.ok || !verified.accessToken)
          throw new Error(verified.error || 'Payment verification failed')
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              reportPayload,
            }),
          })
          const verified = (await verifyRes.json()) as VerifyResponse
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

  const chanceColor = (c: string) =>
    c === 'High' ? 'var(--ok,#1f9d6b)' : c === 'Medium' ? 'var(--accent)' : '#e0483c'
  const chanceBg = (c: string) =>
    c === 'High'
      ? 'rgba(31,157,107,0.12)'
      : c === 'Medium'
        ? 'var(--accent-bg)'
        : 'rgba(224,72,60,0.12)'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        overflowX: 'hidden',
      }}
    >
      {/* Sticky nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">
            college<span>compass</span>
            <span style={{ color: 'var(--accent)' }}>.</span>
          </Link>
          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontFamily: 'Satoshi,Inter,sans-serif',
              fontWeight: 600,
            }}
          >
            {isGate
              ? 'GATE Predictor'
              : isAdvanced
                ? 'JEE Advanced Predictor'
                : isCsab
                  ? 'CSAB Predictor'
                  : 'JoSAA Predictor'}
          </div>
          <NavAuth />
        </nav>
      </div>

      {/* Content */}
      <div className="predict-layout">
        {/* Left: info panel */}
        <div className="predict-info fade-up hide-sm">
          <div className="pill" style={{ marginBottom: '1.5rem' }}>
            Step {step} of 2
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', lineHeight: 1.1, marginBottom: '1rem' }}>
            {step === 1 ? (
              <>
                Enter your
                <br />
                <span className="gradient-text">details.</span>
              </>
            ) : (
              <>
                Preview &<br />
                <span className="gradient-text">unlock.</span>
              </>
            )}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              fontSize: '0.95rem',
            }}
          >
            {step === 1
              ? isGate
                ? 'We match your GATE score against every CCMT & COAP cutoff — category and paper eligibility applied.'
                : isAdvanced
                  ? 'We match your JEE Advanced rank against every IIT cutoff — category, gender pool, all applied.'
                  : isCsab
                    ? 'CSAB fills vacant NIT/IIIT/GFTI seats after JoSAA. We match your CRL against every CSAB special-round cutoff.'
                    : 'We match your JEE Main rank against every JoSAA NIT/IIIT/GFTI cutoff — category, gender pool, home-state quota all applied.'
              : 'Your top 3 matches are shown free. Unlock the complete list with PDF download for just ₹49 — one-time.'}
          </p>
          {/* Progress */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2].map(s => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 99,
                  background: step >= s ? 'var(--accent)' : 'var(--border)',
                  transition: 'background .3s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {['Enter details', 'Preview & pay'].map((l, i) => (
              <span
                key={l}
                style={{
                  fontSize: '0.72rem',
                  color: step > i ? 'var(--accent)' : 'var(--text-faint)',
                  fontWeight: step > i ? 700 : 400,
                  fontFamily: 'Satoshi,Inter,sans-serif',
                }}
              >
                {l}
              </span>
            ))}
          </div>

          {/* Trust signals */}
          <div
            className="glass"
            style={{ marginTop: '2.5rem', padding: '1.4rem', borderRadius: 'var(--r)' }}
          >
            <div
              style={{
                fontFamily: 'Satoshi,Inter,sans-serif',
                fontWeight: 700,
                fontSize: '0.82rem',
                marginBottom: '0.9rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Why trust us
            </div>
            {[
              isGate
                ? '✓  Official 2025 CCMT · COAP cutoff data'
                : isAdvanced
                  ? '✓  Official 2025 JoSAA IIT cutoff data'
                  : isCsab
                    ? '✓  Official 2025 CSAB special round data'
                    : '✓  Official 2025 JoSAA cutoff data',
              '✓  Last-round cutoffs — most accurate threshold',
              '✓  Secure Razorpay payment · no account needed',
            ].map(t => (
              <div
                key={t}
                style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.8 }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right: form card */}
        <div className="predict-form fade-up fade-up-2">
          {/* Mobile-only step indicator (replaces hidden info panel) */}
          <div className="mobile-step-bar">
            <span className="pill" style={{ fontSize: '0.75rem' }}>
              Step {step}/2
            </span>
            <div style={{ flex: 1, display: 'flex', gap: '0.4rem' }}>
              {[1, 2].map(s => (
                <div
                  key={s}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 99,
                    background: step >= s ? 'var(--accent)' : 'var(--border)',
                    transition: 'background .3s',
                  }}
                />
              ))}
            </div>
          </div>
          <div
            className="glass predict-card"
            style={{
              borderRadius: 'var(--r-lg)',
              padding: '2.2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {step === 1 && (
              <div
                className="predict-fields"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Exam selector */}
                <div>
                  <label style={L}>Exam</label>
                  <div
                    className="exam-selector-grid"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}
                  >
                    {(
                      [
                        { v: 'GATE', l: 'GATE' },
                        { v: 'JEE_MAIN', l: 'JEE Main' },
                        { v: 'JEE_ADVANCED', l: 'JEE Adv.' },
                      ] as const
                    ).map(e => (
                      <button
                        key={e.v}
                        onClick={() => setExam(e.v)}
                        style={{
                          padding: '0.6rem 0.35rem',
                          borderRadius: 'var(--r-sm)',
                          cursor: 'pointer',
                          fontFamily: 'Satoshi,Inter,sans-serif',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: '1.5px solid',
                          transition: 'all .18s',
                          textAlign: 'center',
                          background: form.exam === e.v ? 'var(--text)' : 'var(--bg-1)',
                          borderColor: form.exam === e.v ? 'var(--text)' : 'var(--border-strong)',
                          color: form.exam === e.v ? 'var(--bg)' : 'var(--text-muted)',
                        }}
                      >
                        {e.l}
                      </button>
                    ))}
                  </div>
                </div>

                {isGate ? (
                  <>
                    {/* Score */}
                    <div>
                      <label style={L}>GATE Score</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="e.g. 750"
                        value={form.rank}
                        onChange={e => u('rank', e.target.value)}
                      />
                    </div>

                    {/* Category + Paper */}
                    <div
                      className="field-2col"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}
                    >
                      <div>
                        <label style={L}>Category</label>
                        <select
                          className="input-field"
                          value={form.category}
                          onChange={e => u('category', e.target.value)}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={L}>GATE Paper</label>
                        <select
                          className="input-field"
                          value={form.branch}
                          onChange={e => u('branch', e.target.value)}
                        >
                          {GATE_BRANCHES.map(b => (
                            <option key={b.code} value={b.code}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* JoSAA / CSAB selector — shown first so user picks round before entering rank */}
                    {isMain && (
                      <div>
                        <label style={L}>Counselling Round</label>
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}
                        >
                          {(
                            [
                              { v: 'JOSAA' as Counselling, l: 'JoSAA', desc: 'Main Rounds' },
                              { v: 'CSAB' as Counselling, l: 'CSAB', desc: 'Special Rounds' },
                            ] as const
                          ).map(c => (
                            <button
                              key={c.v}
                              onClick={() => {
                                setForm(f => ({ ...f, counselling: c.v, crl: '' }))
                                setError('')
                              }}
                              style={{
                                padding: '0.6rem 0.4rem',
                                borderRadius: 'var(--r-sm)',
                                cursor: 'pointer',
                                fontFamily: 'Satoshi,Inter,sans-serif',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                border: '1.5px solid',
                                transition: 'all .18s',
                                background:
                                  form.counselling === c.v ? 'var(--text)' : 'var(--bg-1)',
                                borderColor:
                                  form.counselling === c.v ? 'var(--text)' : 'var(--border-strong)',
                                color: form.counselling === c.v ? 'var(--bg)' : 'var(--text-muted)',
                              }}
                            >
                              {c.l}{' '}
                              <span
                                style={{
                                  fontWeight: 400,
                                  fontSize: '0.72rem',
                                  opacity: 0.8,
                                  marginLeft: '0.3rem',
                                }}
                              >
                                {c.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rank — only the field relevant to the selected exam */}
                    {isMain && (
                      <div>
                        <label style={L}>JEE Main 2026 Category Rank</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 85000"
                          value={form.mainRank}
                          onChange={e => u('mainRank', e.target.value)}
                        />
                      </div>
                    )}
                    {isAdvanced && (
                      <div>
                        <label style={L}>JEE Advanced 2026 Category Rank</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 5000"
                          value={form.advancedRank}
                          onChange={e => u('advancedRank', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Category */}
                    <div>
                      <label style={L}>
                        Category <span style={{ fontWeight: 400, color: 'var(--accent)' }}>*</span>
                      </label>
                      <select
                        className="input-field"
                        value={form.category}
                        onChange={e => {
                          const category = e.target.value
                          setForm(f => ({ ...f, category, crl: category === 'GEN' ? '' : f.crl }))
                          setError('')
                        }}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CRL rank for reserved candidates */}
                    {form.category !== 'GEN' && (
                      <div>
                        <label style={L}>
                          {isAdvanced ? 'JEE Advanced CRL' : 'JEE Main CRL'}
                          <span
                            style={{
                              fontWeight: 400,
                              color: needsCsabCrl ? 'var(--accent)' : 'var(--text-muted)',
                            }}
                          >
                            {' '}
                            {needsCsabCrl ? '*' : '(optional)'}
                          </span>
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder={isAdvanced ? 'e.g. 8000' : 'e.g. 120000'}
                          value={form.crl}
                          onChange={e => u('crl', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Seat pool */}
                    <div>
                      <label style={L}>
                        Seat Pool <span style={{ fontWeight: 400, color: 'var(--accent)' }}>*</span>
                      </label>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}
                      >
                        {[
                          { value: 'Male' as const, label: 'Gender Neutral' },
                          { value: 'Female' as const, label: 'Female' },
                        ].map(pool => (
                          <button
                            key={pool.value}
                            onClick={() => u('gender', pool.value)}
                            style={{
                              padding: '0.7rem 0.6rem',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              fontFamily: 'Satoshi,Inter,sans-serif',
                              fontWeight: 650,
                              fontSize: '0.875rem',
                              border: '1.5px solid',
                              transition: 'all .18s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.55rem',
                              justifyContent: 'flex-start',
                              background:
                                form.gender === pool.value ? 'var(--text)' : 'var(--bg-1)',
                              borderColor:
                                form.gender === pool.value ? 'var(--text)' : 'var(--border-strong)',
                              color: form.gender === pool.value ? 'var(--bg)' : 'var(--text)',
                            }}
                          >
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: '2px solid currentColor',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {form.gender === pool.value && (
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: 'currentColor',
                                  }}
                                />
                              )}
                            </span>
                            {pool.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Domicile */}
                    <div>
                      <label style={L}>
                        12th Class Domicile State{' '}
                        <span style={{ fontWeight: 400, color: 'var(--accent)' }}>*</span>
                      </label>
                      <select
                        className="input-field"
                        value={form.homeState}
                        onChange={e => u('homeState', e.target.value)}
                      >
                        <option value="">Select 12th Class Domicile State</option>
                        {STATES.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch */}
                    <div>
                      <label style={L}>Desired Branch</label>
                      <select
                        className="input-field"
                        value={form.branch}
                        onChange={e => u('branch', e.target.value)}
                      >
                        {JEE_BRANCHES.map(b => (
                          <option key={b.code} value={b.code}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {error && (
                  <div
                    style={{
                      background: 'rgba(220,38,38,0.08)',
                      border: '1px solid rgba(220,38,38,0.22)',
                      borderRadius: 'var(--r-sm)',
                      padding: '0.7rem 1rem',
                      color: '#dc2626',
                      fontSize: '0.85rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePreview}
                  disabled={
                    !activeRank || (!isGate && (!form.gender || !form.homeState)) || loading
                  }
                  className="btn btn-primary"
                  style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--r-sm)',
                    fontSize: '1rem',
                    width: '100%',
                  }}
                >
                  {loading
                    ? 'Analyzing cutoffs…'
                    : isGate
                      ? 'See College Predictions →'
                      : 'Predict'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Preview strip */}
                <div
                  style={{
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1.1rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'Satoshi,Inter,sans-serif',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                      }}
                    >
                      Preview — Top 3
                    </span>
                    <span
                      className="pill"
                      style={{ padding: '0.15rem 0.6rem', fontSize: '0.72rem' }}
                    >
                      50+ more hidden 🔒
                    </span>
                  </div>
                  {preview.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            fontFamily: 'Satoshi,Inter,sans-serif',
                          }}
                        >
                          {c.institute}
                        </div>
                        <div
                          style={{
                            fontSize: '0.77rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.1rem',
                          }}
                        >
                          {c.program}
                        </div>
                      </div>
                      <span
                        style={{
                          background: chanceBg(c.chance),
                          color: chanceColor(c.chance),
                          borderRadius: 'var(--r-sm)',
                          padding: '0.22rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'Satoshi,Inter,sans-serif',
                          flexShrink: 0,
                        }}
                      >
                        {c.chancePercent}% {c.chance}
                      </span>
                    </div>
                  ))}
                </div>

                {/* User details */}
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  Your details
                </div>
                <div
                  className="field-2col"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}
                >
                  <div>
                    <label style={L}>Full Name</label>
                    <input
                      className="input-field"
                      value={form.name}
                      onChange={e => u('name', e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label style={L}>Phone (optional)</label>
                    <input
                      className="input-field"
                      value={form.phone}
                      onChange={e => u('phone', e.target.value)}
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>
                <div>
                  <label style={L}>Email</label>
                  <input
                    className="input-field"
                    type="email"
                    value={form.email}
                    onChange={e => u('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div
                    style={{
                      background: 'rgba(220,38,38,0.08)',
                      border: '1px solid rgba(220,38,38,0.22)',
                      borderRadius: 'var(--r-sm)',
                      padding: '0.7rem 1rem',
                      color: '#dc2626',
                      fontSize: '0.85rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Pay CTA */}
                <button
                  onClick={handlePayment}
                  disabled={!form.name || !form.email || loading}
                  className="btn btn-accent"
                  style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--r-sm)',
                    fontSize: '1rem',
                    width: '100%',
                  }}
                >
                  {loading ? 'Processing…' : 'Pay ₹49 & Unlock Full List →'}
                </button>
                <div
                  style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-faint)' }}
                >
                  🔒 Secure payment via Razorpay
                </div>

                {/* Login nudge for logged-out users */}
                {!session && (
                  <div
                    style={{
                      background: 'var(--accent-bg)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: 'var(--r-sm)',
                      padding: '0.7rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>💾</span>
                    <span style={{ flex: 1 }}>
                      <strong
                        style={{ color: 'var(--text)', fontFamily: 'Satoshi,Inter,sans-serif' }}
                      >
                        Save to Dashboard
                      </strong>{' '}
                      —
                      <Link
                        href="/auth/login"
                        style={{
                          color: 'var(--accent)',
                          fontWeight: 600,
                          textDecoration: 'none',
                          marginLeft: '0.25rem',
                        }}
                      >
                        Sign in
                      </Link>
                      {' or '}
                      <Link
                        href="/auth/register"
                        style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        register free
                      </Link>
                      {' to re-open this report any time.'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'Satoshi,Inter,sans-serif',
                    fontWeight: 500,
                    padding: '0.3rem',
                  }}
                >
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
      <PredictForm />
    </Suspense>
  )
}
