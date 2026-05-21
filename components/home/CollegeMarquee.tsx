'use client'
import Image from 'next/image'

type College = {
  name: string
  logo: string
}

const COLLEGES: College[] = [
  { name: 'IIT Bombay', logo: '/logos/iitb.png' },
  { name: 'IIT Delhi', logo: '/logos/iitd.png' },
  { name: 'IIT Madras', logo: '/logos/iitm.png' },
  { name: 'IIT Kanpur', logo: '/logos/iitk.png' },
  { name: 'IIT Kharagpur', logo: '/logos/iitkgp.png' },
  { name: 'NIT Trichy', logo: '/logos/nitt.png' },
  { name: 'NIT Warangal', logo: '/logos/nitw.png' },
  { name: 'NIT Surathkal', logo: '/logos/nitk.png' },
  { name: 'IIIT Hyderabad', logo: '/logos/iiith.png' },
  { name: 'IIT Roorkee', logo: '/logos/iitr.png' },
  { name: 'IIT Guwahati', logo: '/logos/iitg.png' },
  { name: 'NIT Calicut', logo: '/logos/nitc.png' },
  { name: 'IIT Indore', logo: '/logos/iiti.png' },
  { name: 'IIIT Allahabad', logo: '/logos/iiita.png' },
  { name: 'IIT BHU', logo: '/logos/iitbhu.png' },
  { name: 'NIT Rourkela', logo: '/logos/nitr.png' },
  { name: 'IIT Hyderabad', logo: '/logos/iith.png' },
  { name: 'NIT Nagpur', logo: '/logos/vnit.png' },
  { name: 'IIT Jodhpur', logo: '/logos/iitj.png' },
  { name: 'NIT Durgapur', logo: '/logos/nitd.png' },
]

function CollegeChip({ college }: { college: College }) {
  return (
    <span
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '1.2rem 1.6rem 0.9rem',
        borderRadius: 20,
        background: '#fff',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        whiteSpace: 'nowrap',
        cursor: 'default',
        minWidth: 130,
      }}
    >
      <Image
        src={college.logo}
        alt={`${college.name} logo`}
        width={88}
        height={88}
        style={{
          borderRadius: 14,
          objectFit: 'contain',
          flexShrink: 0,
          width: 88,
          height: 'auto',
        }}
        unoptimized
      />
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          fontFamily: 'Satoshi,Inter,sans-serif',
          color: '#334155',
          letterSpacing: '-0.01em',
          textAlign: 'center',
        }}
      >
        {college.name}
      </span>
    </span>
  )
}

export default function CollegeMarquee() {
  const items = [...COLLEGES, ...COLLEGES]

  return (
    <section
      style={{
        padding: '2.8rem 0',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 120,
          height: '100%',
          background: 'linear-gradient(90deg, #fff 10%, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: '100%',
          background: 'linear-gradient(270deg, #fff 10%, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#94a3b8',
            fontFamily: 'Satoshi,Inter,sans-serif',
          }}
        >
          Students predicted seats at
        </span>
      </div>

      <div className="marquee-track">
        {items.map((college, i) => (
          <CollegeChip key={`${college.name}-${i}`} college={college} />
        ))}
      </div>
    </section>
  )
}
