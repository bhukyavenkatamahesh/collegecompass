'use client'
import { useState, useEffect } from 'react'

type Tab = 'cutoffs' | 'stats'

interface Cutoff {
  id: string
  examType: string
  year: number
  institute: string
  program: string
  category: string
  round: number
  openRank: number
  closeRank: number
  state: string | null
  instituteType: string | null
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('cutoffs')
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([])
  const [cutoffsLoading, setCutoffsLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newCutoff, setNewCutoff] = useState({
    examType: 'GATE', year: 2024, institute: '', program: '', category: 'GEN',
    round: 1, openRank: '', closeRank: '', state: '', instituteType: 'NIT',
  })

  async function login() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.success) {
      setLoggedIn(true)
    } else {
      setError('Invalid credentials')
    }
    setLoading(false)
  }

  async function loadCutoffs() {
    setCutoffsLoading(true)
    const res = await fetch('/api/admin/cutoffs')
    const data = await res.json()
    setCutoffs(data.cutoffs ?? [])
    setCutoffsLoading(false)
  }

  useEffect(() => {
    if (loggedIn) loadCutoffs()
  }, [loggedIn])

  async function addCutoff() {
    const res = await fetch('/api/admin/cutoffs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newCutoff,
        openRank: parseInt(newCutoff.openRank as string),
        closeRank: parseInt(newCutoff.closeRank as string),
      }),
    })
    if (res.ok) {
      setShowAdd(false)
      setNewCutoff({ examType: 'GATE', year: 2024, institute: '', program: '', category: 'GEN', round: 1, openRank: '', closeRank: '', state: '', instituteType: 'NIT' })
      loadCutoffs()
    }
  }

  async function deleteCutoff(id: string) {
    await fetch('/api/admin/cutoffs', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadCutoffs()
  }

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,140,255,0.2)',
    color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
  }

  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', width: '380px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>CollegeCompass Control Panel</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" />
          <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} type="password"
            onKeyDown={e => e.key === 'Enter' && login()} />
          {error && <div style={{ color: '#f74f4f', fontSize: '0.85rem' }}>{error}</div>}
          <button onClick={login} disabled={loading} className="btn-primary" style={{ padding: '0.75rem', borderRadius: '10px', fontSize: '0.95rem', border: 'none' }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem' }}>Admin <span className="gradient-text">Panel</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Manage cutoffs, view stats</p>
          </div>
          <button onClick={() => setLoggedIn(false)} style={{ background: 'rgba(247,79,79,0.1)', border: '1px solid rgba(247,79,79,0.2)', color: '#f74f4f', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[['—', 'Revenue Today'], ['—', 'Total Predictions'], ['—', 'Payments'], [String(cutoffs.length), 'Cutoff Entries']].map(([v, l]) => (
            <div key={l} className="glass" style={{ padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['cutoffs', 'stats'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: '0.85rem', border: 'none', transition: 'all 0.2s', background: tab === t ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: tab === t ? 'white' : 'var(--text-muted)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'cutoffs' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700 }}>Cutoff Database ({cutoffs.length} entries)</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={loadCutoffs} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ↻ Refresh
                </button>
                <button onClick={() => setShowAdd(!showAdd)} className="btn-primary"
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', border: 'none' }}>
                  + Add Cutoff
                </button>
              </div>
            </div>

            {showAdd && (
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '1rem' }}>Add New Cutoff Entry</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    ['examType', 'Exam', ['GATE', 'JEE']],
                    ['year', 'Year', null],
                    ['institute', 'Institute', null],
                    ['program', 'Program', null],
                    ['category', 'Category', ['GEN', 'OBC', 'SC', 'ST', 'EWS', 'GEN-PwD', 'OBC-PwD', 'SC-PwD', 'ST-PwD']],
                    ['instituteType', 'Type', ['IIT', 'NIT', 'IIIT', 'GFTI']],
                    ['state', 'State', null],
                    ['openRank', 'Open Rank', null],
                    ['closeRank', 'Close Rank', null],
                  ].map(([key, label, options]) => (
                    <div key={key as string}>
                      <label style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label as string}</label>
                      {options ? (
                        <select value={(newCutoff as any)[key as string]} onChange={e => setNewCutoff(p => ({ ...p, [key as string]: e.target.value }))} style={inputStyle}>
                          {(options as string[]).map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={(newCutoff as any)[key as string]} onChange={e => setNewCutoff(p => ({ ...p, [key as string]: e.target.value }))} style={inputStyle} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={addCutoff} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.85rem', border: 'none' }}>
                    Save Entry
                  </button>
                  <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(79,110,247,0.1)', borderBottom: '1px solid var(--border)' }}>
                    {['Exam', 'Year', 'Institute', 'Program', 'Category', 'Type', 'Open', 'Close', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'Syne', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cutoffsLoading ? (
                    <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  ) : cutoffs.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No cutoffs yet. Add entries above or use the Python import script to bulk load data.
                    </td></tr>
                  ) : cutoffs.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(99,140,255,0.06)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--accent)', fontSize: '0.85rem' }}>{c.examType}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.year}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.institute}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.program}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.category}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.instituteType}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.openRank.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{c.closeRank.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button onClick={() => deleteCutoff(c.id)}
                          style={{ background: 'rgba(247,79,79,0.1)', border: 'none', color: '#f74f4f', padding: '0.25rem 0.6rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'stats' && (
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>Analytics Coming Soon</h3>
            <p style={{ fontSize: '0.9rem' }}>Payment history, prediction counts, and revenue charts will appear here once payment processing is activated.</p>
          </div>
        )}
      </div>
    </div>
  )
}
