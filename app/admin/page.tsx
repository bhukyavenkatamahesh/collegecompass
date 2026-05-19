'use client'
import { useState, useEffect } from 'react'

type Tab = 'cutoffs' | 'stats'
type NewCutoff = {
  examType: string
  year: string
  institute: string
  program: string
  category: string
  round: string
  openRank: string
  closeRank: string
  state: string
  instituteType: string
}
type NewCutoffKey = keyof NewCutoff
type FieldConfig = {
  key: NewCutoffKey
  label: string
  options?: string[]
}

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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [newCutoff, setNewCutoff] = useState<NewCutoff>({
    examType: 'GATE', year: '2024', institute: '', program: '', category: 'GEN',
    round: '1', openRank: '', closeRank: '', state: '', instituteType: 'NIT',
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
      loadCutoffs()
    } else {
      setError('Invalid credentials')
    }
    setLoading(false)
  }

  async function loadCutoffs(pg = page, q = search) {
    setCutoffsLoading(true)
    const params = new URLSearchParams({ page: String(pg), limit: '50' })
    if (q) params.set('q', q)
    const res = await fetch(`/api/admin/cutoffs?${params}`)
    const data = await res.json()
    setCutoffs(data.cutoffs ?? [])
    setTotalPages(data.pages ?? 1)
    setTotalCount(data.total ?? 0)
    setCutoffsLoading(false)
  }

  useEffect(() => {
    let active = true
    fetch('/api/admin/login')
      .then(res => res.json())
      .then(data => {
        if (!active || !data.authenticated) return
        setLoggedIn(true)
        loadCutoffs(1, '')
      })
      .catch(() => undefined)
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loggedIn) loadCutoffs(page, search)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  async function addCutoff() {
    const res = await fetch('/api/admin/cutoffs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newCutoff,
        openRank: parseInt(newCutoff.openRank),
        closeRank: parseInt(newCutoff.closeRank),
      }),
    })
    if (res.ok) {
      setShowAdd(false)
      setNewCutoff({ examType: 'GATE', year: '2024', institute: '', program: '', category: 'GEN', round: '1', openRank: '', closeRank: '', state: '', instituteType: 'NIT' })
      loadCutoffs()
    }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setLoggedIn(false)
    setCutoffs([])
    setShowAdd(false)
  }

  async function deleteCutoff(id: string) {
    await fetch('/api/admin/cutoffs', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadCutoffs()
  }

  const cutoffFields: FieldConfig[] = [
    { key: 'examType', label: 'Exam', options: ['GATE', 'JEE'] },
    { key: 'year', label: 'Year' },
    { key: 'institute', label: 'Institute' },
    { key: 'program', label: 'Program' },
    { key: 'category', label: 'Category', options: ['GEN', 'OBC', 'SC', 'ST', 'EWS', 'GEN-PwD', 'EWS-PwD', 'OBC-PwD', 'SC-PwD', 'ST-PwD'] },
    { key: 'instituteType', label: 'Type', options: ['IIT', 'NIT', 'IIIT', 'GFTI'] },
    { key: 'state', label: 'State' },
    { key: 'openRank', label: 'Open Rank' },
    { key: 'closeRank', label: 'Close Rank' },
  ]

  const L = { color:'var(--text)', fontSize:'0.78rem', fontWeight:600, fontFamily:'Satoshi,Inter,sans-serif', letterSpacing:'-0.01em', marginBottom:'0.3rem', display:'block' } as const

  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '2.8rem', borderRadius: 'var(--r-lg)', width: '400px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ marginBottom: '1.8rem' }}>
          <div style={{ fontFamily:'Satoshi,Inter,sans-serif', fontWeight:900, fontSize:'1.2rem', letterSpacing:'-0.04em', marginBottom:'0.3rem' }}>
            college<span style={{color:'var(--accent)'}}>compass</span><span style={{color:'var(--accent)'}}>.</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Control panel — restricted access</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={L}>Email</label><input placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" type="email" /></div>
          <div><label style={L}>Password</label><input placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" type="password" onKeyDown={e => e.key === 'Enter' && login()} /></div>
          {error && <div style={{ background:'rgba(224,72,60,0.08)', border:'1px solid rgba(224,72,60,0.2)', borderRadius:8, padding:'0.65rem 1rem', color:'#c0392b', fontSize:'0.85rem' }}>{error}</div>}
          <button onClick={login} disabled={loading} className="btn btn-primary" style={{ padding: '0.82rem', borderRadius: 12, fontSize: '0.95rem', width:'100%', marginTop:'0.25rem' }}>
            {loading ? 'Logging in…' : 'Login →'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <div className="nav-wrapper">
        <nav className="nav">
          <div style={{ fontFamily:'Satoshi,Inter,sans-serif', fontWeight:900, fontSize:'1.1rem', letterSpacing:'-0.04em' }}>
            college<span style={{color:'var(--accent)'}}>compass</span><span style={{color:'var(--accent)'}}>.</span>
          </div>
          <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600 }}>Admin Panel</span>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ color:'#c0392b', borderColor:'rgba(192,57,43,0.3)' }}>
            Logout
          </button>
        </nav>
      </div>

      <div className="container" style={{ paddingTop:'2.5rem', paddingBottom:'5rem' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[['—', 'Revenue Today'], ['—', 'Total Predictions'], ['—', 'Payments'], [totalCount > 0 ? totalCount.toLocaleString() : '—', 'Cutoff Entries']].map(([v, l]) => (
            <div key={l} className="glass" style={{ padding: '1.4rem', borderRadius: 'var(--r)' }}>
              <div style={{ fontFamily:'Satoshi,Inter,sans-serif', fontWeight:900, fontSize:'1.7rem', letterSpacing:'-0.04em', color:'var(--text)' }}>{v}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginTop:'0.25rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
          {(['cutoffs', 'stats'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'0.5rem 1.25rem', borderRadius:99, cursor:'pointer', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', border:'1.5px solid', transition:'all .18s',
              background:tab===t?'var(--text)':'var(--bg-1)',
              borderColor:tab===t?'var(--text)':'var(--border-strong)',
              color:tab===t?'#fff':'var(--text-muted)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'cutoffs' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <h2 style={{ fontSize:'1.3rem' }}>Cutoff Database <span style={{color:'var(--text-muted)',fontSize:'1rem',fontWeight:500}}>({totalCount.toLocaleString()} total)</span></h2>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                <input
                  className="input-field"
                  style={{ width:220, padding:'0.45rem 0.85rem', fontSize:'0.85rem' }}
                  placeholder="Search institute / program…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
                />
                <button onClick={() => { setSearch(searchInput); setPage(1) }} className="btn btn-ghost btn-sm">Search</button>
                {search && <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }} className="btn btn-ghost btn-sm">✕ Clear</button>}
                <button onClick={() => loadCutoffs(page, search)} className="btn btn-ghost btn-sm">↻</button>
                <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary btn-sm">+ Add Cutoff</button>
              </div>
            </div>

            {showAdd && (
              <div className="glass" style={{ padding:'1.8rem', borderRadius:'var(--r)', marginBottom:'1.5rem' }}>
                <h3 style={{ fontSize:'1.05rem', marginBottom:'1.2rem' }}>Add New Cutoff Entry</h3>
                <div className="admin-cutoff-grid">
                  {cutoffFields.map(({ key, label, options }) => (
                    <div key={key}>
                      <label style={L}>{label}</label>
                      {options ? (
                        <select value={String(newCutoff[key])} onChange={e => setNewCutoff(p => ({ ...p, [key]: e.target.value }))} className="input-field" style={{fontSize:'0.85rem',padding:'0.55rem 0.9rem'}}>
                          {options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={String(newCutoff[key])} onChange={e => setNewCutoff(p => ({ ...p, [key]: e.target.value }))} className="input-field" style={{fontSize:'0.85rem',padding:'0.55rem 0.9rem'}} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button onClick={addCutoff} className="btn btn-primary btn-sm">Save Entry</button>
                  <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">Cancel</button>
                </div>
              </div>
            )}

            <div className="glass" style={{ borderRadius:'var(--r)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                  <thead>
                    <tr style={{ background:'var(--bg-muted)', borderBottom:'1px solid var(--border)' }}>
                      {['Exam','Year','Institute','Program','Category','Type','Open','Close','Actions'].map(h => (
                        <th key={h} style={{ padding:'0.85rem 1rem', textAlign:'left', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cutoffsLoading ? (
                      <tr><td colSpan={9} style={{ padding:'2.5rem', textAlign:'center', color:'var(--text-muted)' }}>Loading…</td></tr>
                    ) : cutoffs.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding:'3.5rem', textAlign:'center', color:'var(--text-muted)' }}>
                        No cutoffs yet. Add entries above or run the import script.
                      </td></tr>
                    ) : cutoffs.map(c => (
                      <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-muted)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td style={{ padding:'0.75rem 1rem' }}><span style={{color:'var(--accent)',fontWeight:700,fontFamily:'Satoshi,Inter,sans-serif'}}>{c.examType}</span></td>
                        <td style={{ padding:'0.75rem 1rem', color:'var(--text-muted)' }}>{c.year}</td>
                        <td style={{ padding:'0.75rem 1rem', fontWeight:600, fontFamily:'Satoshi,Inter,sans-serif' }}>{c.institute}</td>
                        <td style={{ padding:'0.75rem 1rem', color:'var(--text-muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.program}</td>
                        <td style={{ padding:'0.75rem 1rem' }}><span className="tag">{c.category}</span></td>
                        <td style={{ padding:'0.75rem 1rem' }}><span className="tag">{c.instituteType}</span></td>
                        <td style={{ padding:'0.75rem 1rem', fontVariantNumeric:'tabular-nums' }}>{c.openRank.toLocaleString()}</td>
                        <td style={{ padding:'0.75rem 1rem', fontVariantNumeric:'tabular-nums' }}>{c.closeRank.toLocaleString()}</td>
                        <td style={{ padding:'0.75rem 1rem' }}>
                          <button onClick={() => deleteCutoff(c.id)} style={{ background:'rgba(192,57,43,0.08)', border:'1px solid rgba(192,57,43,0.2)', color:'#c0392b', padding:'0.28rem 0.65rem', borderRadius:6, cursor:'pointer', fontSize:'0.75rem', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:600 }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
                <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontFamily:'Inter,sans-serif' }}>
                  Page {page} of {totalPages} · {totalCount.toLocaleString()} entries
                </span>
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <button onClick={() => setPage(1)} disabled={page===1} className="btn btn-ghost btn-sm" style={{padding:'0.4rem 0.7rem'}}>«</button>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn btn-ghost btn-sm" style={{padding:'0.4rem 0.8rem'}}>‹ Prev</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = page <= 3 ? i+1 : page + i - 2
                    if (pg < 1 || pg > totalPages) return null
                    return (
                      <button key={pg} onClick={() => setPage(pg)} className="btn btn-sm" style={{ padding:'0.4rem 0.75rem', fontFamily:'Satoshi,Inter,sans-serif', fontWeight:700, fontSize:'0.82rem', border:'1.5px solid', cursor:'pointer', borderRadius:99,
                        background: pg===page ? 'var(--text)' : 'var(--bg-1)',
                        borderColor: pg===page ? 'var(--text)' : 'var(--border-strong)',
                        color: pg===page ? '#fff' : 'var(--text-muted)' }}>
                        {pg}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn btn-ghost btn-sm" style={{padding:'0.4rem 0.8rem'}}>Next ›</button>
                  <button onClick={() => setPage(totalPages)} disabled={page===totalPages} className="btn btn-ghost btn-sm" style={{padding:'0.4rem 0.7rem'}}>»</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'stats' && (
          <div className="glass" style={{ padding:'3rem', borderRadius:'var(--r-lg)', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📊</div>
            <h3 style={{ fontSize:'1.3rem', marginBottom:'0.5rem' }}>Analytics Coming Soon</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Payment history, prediction counts, and revenue charts will appear here once payment processing is activated.</p>
          </div>
        )}
      </div>
    </div>
  )
}
