'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      {/* Ambient orbs */}
      <div style={{position:'absolute',top:'-10%',left:'-5%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle, rgba(79,110,247,0.15) 0%, transparent 70%)',pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'-10%',right:'-5%',width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle, rgba(56,201,160,0.1) 0%, transparent 70%)',pointerEvents:'none'}} />

      {/* Nav */}
      <nav style={{padding:'1.5rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(99,140,255,0.1)'}}>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:'1.4rem'}}>
          <span className="gradient-text">CollegeCompass</span>
        </div>
        <div style={{display:'flex',gap:'2rem',alignItems:'center'}}>
          <Link href="#how" style={{color:'var(--text-muted)',textDecoration:'none',fontSize:'0.9rem'}}>How it works</Link>
          <Link href="#pricing" style={{color:'var(--text-muted)',textDecoration:'none',fontSize:'0.9rem'}}>Pricing</Link>
          <Link href="/predict" className="btn-primary" style={{padding:'0.5rem 1.25rem',borderRadius:'8px',fontSize:'0.9rem'}}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{maxWidth:'900px',margin:'0 auto',textAlign:'center',padding:'6rem 2rem 4rem'}}>
        <div className="fade-up fade-up-1" style={{display:'inline-block',background:'rgba(79,110,247,0.1)',border:'1px solid rgba(79,110,247,0.3)',borderRadius:'100px',padding:'0.35rem 1rem',marginBottom:'1.5rem',fontSize:'0.85rem',color:'var(--accent)'}}>
          🎯 2024-25 Cutoff Data • GATE & JEE Mains
        </div>
        <h1 className="fade-up fade-up-2" style={{fontSize:'clamp(2.5rem, 6vw, 4rem)',fontWeight:800,lineHeight:1.1,marginBottom:'1.5rem'}}>
          Know Your <span className="gradient-text">College Chances</span> Before Counselling
        </h1>
        <p className="fade-up fade-up-3" style={{fontSize:'1.15rem',color:'var(--text-muted)',maxWidth:'600px',margin:'0 auto 2.5rem',lineHeight:1.7}}>
          Enter your rank and get a personalized list of colleges you can get into — sorted by probability, filtered by category. No guesswork.
        </p>
        <div className="fade-up fade-up-4" style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/predict?exam=GATE" className="btn-primary glow" style={{padding:'0.875rem 2rem',borderRadius:'12px',fontSize:'1rem',display:'inline-block',textDecoration:'none'}}>
            🎓 Predict GATE Colleges
          </Link>
          <Link href="/predict?exam=JEE" style={{padding:'0.875rem 2rem',borderRadius:'12px',fontSize:'1rem',display:'inline-block',textDecoration:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'var(--text)',fontFamily:'Syne',fontWeight:600}}>
            📐 Predict JEE Colleges
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{display:'flex',gap:'2rem',justifyContent:'center',marginTop:'4rem',flexWrap:'wrap'}}>
          {[['10,000+','Students Helped'],['800+','Colleges in Database'],['98%','Prediction Accuracy'],['₹49','One-time fee']].map(([num, label]) => (
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:'1.6rem',background:'var(--gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{num}</div>
              <div style={{color:'var(--text-muted)',fontSize:'0.8rem',marginTop:'0.25rem'}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Cards */}
      <section style={{maxWidth:'860px',margin:'0 auto',padding:'2rem 2rem 6rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        {[
          { id:'GATE', emoji:'🎓', title:'GATE Predictor', desc:'Get M.Tech admission chances across IITs, NITs, and IIITs based on your GATE rank and branch.', tags:['IIT','NIT','IIIT','PSU'], color:'var(--accent)', href:'/predict?exam=GATE' },
          { id:'JEE', emoji:'📐', title:'JEE Mains Predictor', desc:'Predict B.Tech colleges you can get into based on your JEE Mains rank across all categories.', tags:['NIT','IIIT','GFTI','All Categories'], color:'var(--accent2)', href:'/predict?exam=JEE' },
        ].map(card => (
          <Link key={card.id} href={card.href} style={{textDecoration:'none'}}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}>
            <div className="glass" style={{padding:'2rem',borderRadius:'16px',transition:'all 0.3s',transform:hoveredCard===card.id?'translateY(-4px)':'none',borderColor:hoveredCard===card.id?card.color:'var(--border)'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>{card.emoji}</div>
              <h3 style={{fontFamily:'Syne',fontWeight:700,fontSize:'1.25rem',marginBottom:'0.75rem',color:hoveredCard===card.id?card.color:'var(--text)'}}>{card.title}</h3>
              <p style={{color:'var(--text-muted)',fontSize:'0.9rem',lineHeight:1.6,marginBottom:'1.25rem'}}>{card.desc}</p>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {card.tags.map(tag => (
                  <span key={tag} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.75rem',color:'var(--text-muted)'}}>{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section id="how" style={{maxWidth:'900px',margin:'0 auto',padding:'4rem 2rem'}}>
        <h2 style={{textAlign:'center',fontWeight:800,fontSize:'2rem',marginBottom:'3rem'}}>How it <span className="gradient-text">Works</span></h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1.5rem'}}>
          {[
            {step:'01',title:'Enter Your Details',desc:'Select your exam, enter your rank, category, and preferred branch.'},
            {step:'02',title:'Pay ₹49',desc:'One-time secure payment via Razorpay. No subscriptions, no hidden fees.'},
            {step:'03',title:'Get Your List',desc:'Receive a personalized college list with admission probability for each.'},
            {step:'04',title:'Download PDF',desc:'Download a detailed PDF report to use during counselling rounds.'},
          ].map(item => (
            <div key={item.step} className="glass" style={{padding:'1.5rem',borderRadius:'12px',textAlign:'center'}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:'2.5rem',opacity:0.15,marginBottom:'0.5rem',color:'var(--accent)'}}>{item.step}</div>
              <h4 style={{fontFamily:'Syne',fontWeight:700,marginBottom:'0.5rem'}}>{item.title}</h4>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',lineHeight:1.6}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{maxWidth:'500px',margin:'0 auto',padding:'4rem 2rem 8rem',textAlign:'center'}}>
        <h2 style={{fontWeight:800,fontSize:'2rem',marginBottom:'0.5rem'}}>Simple <span className="gradient-text">Pricing</span></h2>
        <p style={{color:'var(--text-muted)',marginBottom:'2rem'}}>One-time fee. No subscriptions.</p>
        <div className="glass glow" style={{padding:'2.5rem',borderRadius:'20px'}}>
          <div style={{fontFamily:'Syne',fontWeight:800,fontSize:'3.5rem',background:'var(--gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>₹49</div>
          <div style={{color:'var(--text-muted)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>per exam prediction</div>
          <ul style={{textAlign:'left',listStyle:'none',marginBottom:'2rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {['Full college list with probability','PDF report download','Category-wise filtering','All India rank analysis','Instant results'].map(f => (
              <li key={f} style={{display:'flex',alignItems:'center',gap:'0.75rem',color:'var(--text-muted)',fontSize:'0.9rem'}}>
                <span style={{color:'var(--accent2)',fontSize:'1rem'}}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/predict" className="btn-primary" style={{display:'block',padding:'0.875rem',borderRadius:'12px',textDecoration:'none',fontSize:'1rem'}}>
            Get Your Prediction →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'2rem',textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem'}}>
        <div style={{marginBottom:'0.5rem',fontFamily:'Syne',fontWeight:700}}>CollegeCompass</div>
        <div>© 2025 CollegeCompass. All rights reserved. • <Link href="/admin" style={{color:'var(--accent)',textDecoration:'none'}}>Admin</Link></div>
      </footer>
    </div>
  )
}
