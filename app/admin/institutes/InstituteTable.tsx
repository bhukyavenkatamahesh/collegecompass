'use client'
import { useState, useMemo, useTransition } from 'react'

interface Row {
  name: string
  abbrev: string | null
  type: string | null
  state: string | null
  city: string | null
  branchCount: number
  examTypes: string[]
}

const TYPE_COLORS: Record<string, string> = {
  IISc: '#6d28d9',
  IIT: '#1d4ed8',
  NIT: '#059669',
  IIIT: '#d97706',
  NIELIT: '#0891b2',
  SPA: '#7c3aed',
  'Central Univ': '#db2777',
  GFTI: '#4b5563',
}

const EXAM_COLORS: Record<string, string> = {
  JEE_MAIN_JOSAA: '#1d4ed8',
  JEE_MAIN_CSAB: '#0891b2',
  JEE_ADVANCED: '#7c3aed',
  GATE: '#059669',
}

export default function InstituteTable({ institutes }: { institutes: Row[] }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [syncing, startSync] = useTransition()
  const [syncMsg, setSyncMsg] = useState('')

  const types = useMemo(
    () => ['All', ...Array.from(new Set(institutes.map(r => r.type ?? 'GFTI'))).sort()],
    [institutes]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return institutes.filter(r => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.abbrev ?? '').toLowerCase().includes(q) ||
        (r.state ?? '').toLowerCase().includes(q)
      const matchT = typeFilter === 'All' || (r.type ?? 'GFTI') === typeFilter
      return matchQ && matchT
    })
  }, [institutes, query, typeFilter])

  const missing = filtered.filter(r => !r.abbrev).length

  function handleSync() {
    startSync(async () => {
      setSyncMsg('Syncing…')
      const res = await fetch('/api/admin/sync-institutes', { method: 'POST' })
      const data = await res.json()
      setSyncMsg(
        data.ok ? `Synced ${data.upserted} institutes — refresh to see changes` : 'Sync failed'
      )
    })
  }

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'Satoshi, Inter, sans-serif',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
            Institute Directory
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {institutes.length} institutes &nbsp;·&nbsp;
            {institutes.filter(r => r.abbrev).length} with abbreviation &nbsp;·&nbsp;
            <span style={{ color: missing > 0 ? '#dc2626' : '#059669' }}>
              {missing > 0 ? `${missing} missing abbrev` : 'all have abbreviations ✓'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {syncMsg && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{syncMsg}</span>}
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              padding: '0.5rem 1rem',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: syncing ? 'not-allowed' : 'pointer',
              opacity: syncing ? 0.7 : 1,
            }}
          >
            {syncing ? 'Syncing…' : 'Sync from Cutoff DB'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, abbreviation, state…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: '1 1 260px',
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: '0.875rem',
          }}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: '0.875rem',
            background: '#fff',
          }}
        >
          {types.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
        Showing {filtered.length} of {institutes.length}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={th}>#</th>
              <th style={{ ...th, textAlign: 'left' }}>Institute Name</th>
              <th style={th}>Abbreviation</th>
              <th style={th}>Type</th>
              <th style={th}>State</th>
              <th style={th}>Branches</th>
              <th style={th}>Exams</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={row.name}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: i % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <td style={{ ...td, color: '#9ca3af', width: 40 }}>{i + 1}</td>
                <td style={{ ...td, textAlign: 'left', maxWidth: 420 }}>
                  <span style={{ wordBreak: 'break-word' }}>{row.name}</span>
                </td>
                <td style={{ ...td, minWidth: 100 }}>
                  {row.abbrev ? (
                    <span
                      style={{
                        display: 'inline-block',
                        background: TYPE_COLORS[row.type ?? 'GFTI'] ?? '#4b5563',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {row.abbrev}
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>—</span>
                  )}
                </td>
                <td style={{ ...td, color: '#6b7280', minWidth: 80 }}>{row.type ?? '—'}</td>
                <td style={{ ...td, color: '#6b7280', minWidth: 100 }}>{row.state ?? '—'}</td>
                <td style={{ ...td, fontWeight: 600, minWidth: 60 }}>{row.branchCount}</td>
                <td style={{ ...td, minWidth: 120 }}>
                  <div
                    style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}
                  >
                    {row.examTypes.map(e => (
                      <span
                        key={e}
                        style={{
                          background: EXAM_COLORS[e] ?? '#6b7280',
                          color: '#fff',
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {e.replace('JEE_MAIN_', '').replace('JEE_', '')}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  {institutes.length === 0
                    ? 'No data yet — click "Sync from Cutoff DB" to populate'
                    : 'No results match your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '0.6rem 0.75rem',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: '0.78rem',
  color: '#374151',
  whiteSpace: 'nowrap',
}
const td: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  textAlign: 'center',
  verticalAlign: 'middle',
}
