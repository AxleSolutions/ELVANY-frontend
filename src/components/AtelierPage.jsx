import React from 'react';
import { Home, Compass, Feather, Clock, MapPin, ArrowRight } from 'lucide-react';

export const AtelierPage = ({ onBackToHome, onNavigateToCollection }) => {
  const steps = [
    {
      step: '01',
      title: 'Fiber Selection',
      desc: 'Sourcing certified long-staple organic cotton and rare Sea Island cotton with zero synthetic blends.'
    },
    {
      step: '02',
      title: 'High-Density Interlock Knitting',
      desc: 'Knitted on specialized 28-gauge circular knitting machines in Florence for dense 280 GSM opacity.'
    },
    {
      step: '03',
      title: 'Double-Bound Ribbing',
      desc: 'Constructing high-tension 1x1 ribbed collar bands with internal shoulder taping to prevent sagging.'
    },
    {
      step: '04',
      title: 'Blind-Hem Finishing',
      desc: 'Artisan hand-guiding blind stitch hem and sleeves for a seamless, clean architectural drape.'
    }
  ];

  const ateliers = [
    {
      city: 'Florence',
      address: 'Via de’ Tornabuoni, 14',
      hours: 'Mon – Sat: 10:00 – 19:30',
      phone: '+39 055 238 8900'
    },
    {
      city: 'Milan',
      address: 'Via Montenapoleone, 8',
      hours: 'Mon – Sat: 10:00 – 19:30',
      phone: '+39 02 7600 4421'
    },
    {
      city: 'London',
      address: '42 Old Bond Street, Mayfair',
      hours: 'Mon – Sat: 10:00 – 18:30',
      phone: '+44 20 7493 1120'
    },
    {
      city: 'New York',
      address: '680 Madison Avenue',
      hours: 'Mon – Sat: 10:00 – 19:00',
      phone: '+1 212 838 5500'
    }
  ];

  return (
    <div className="atelier-page-view">
      {/* Header Banner */}
      <div className="atelier-page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="search-back-btn"
              onClick={onBackToHome}
              style={{ marginBottom: 0 }}
            >
              <Home size={15} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-primary)', fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              THE ATELIER
            </span>
          </div>

          <div className="atelier-header-content">
            <span className="atelier-tagline">KNITWEAR ATELIER FLORENCE</span>
            <h1 className="atelier-page-title">The Art of the Luxury T-Shirt</h1>
            <p className="atelier-page-desc">
              We treat the classic crewneck T-shirt with the same rigor as bespoke suiting—engineering high-density 280 GSM weights, non-sag collar geometry, and blind-hem stitching.
            </p>
          </div>
        </div>
      </div>

      {/* Craft Pillars Grid */}
      <section className="atelier-craft-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-tag">ENGINEERING STANDARDS</div>
            <h2 className="section-main-title">Crafted with Purpose</h2>
          </div>

          <div className="pillars-grid" style={{ marginBottom: '4rem' }}>
            <div className="pillar-item">
              <h3 className="pillar-title">
                <Compass size={18} color="var(--gold-primary)" />
                280 GSM Heavyweight
              </h3>
              <p className="pillar-text">
                Heavyweight organic cotton jersey that hangs cleanly without clinging or losing its architectural drape.
              </p>
            </div>

            <div className="pillar-item">
              <h3 className="pillar-title">
                <Feather size={18} color="var(--gold-primary)" />
                Non-Sag Collar Rib
              </h3>
              <p className="pillar-text">
                Reinforced high-density 1x1 collar binding designed to maintain its crisp, clean neckline over time.
              </p>
            </div>

            <div className="pillar-item">
              <h3 className="pillar-title">
                <Clock size={18} color="var(--gold-primary)" />
                Pre-Shrunk Longevity
              </h3>
              <p className="pillar-text">
                Pre-washed Italian combed cotton ensuring exact size consistency and color retention.
              </p>
            </div>
          </div>

          {/* Large Atelier Showcase */}
          <div className="craft-grid" style={{ marginBottom: '5rem' }}>
            <div className="craft-card-large" style={{ minHeight: '440px' }}>
              <img src="/images/pillar_heavyweight.webp" alt="T-Shirt Atelier" />
              <div className="craft-card-large-overlay">
                <div className="craft-card-tag" style={{ color: 'var(--gold-bright)' }}>
                  KNITTED IN FLORENCE
                </div>
                <h3 className="craft-card-title" style={{ color: '#fff', fontSize: '1.8rem' }}>
                  The Precision Knit
                </h3>
                <p className="craft-card-desc" style={{ color: '#d0d2d8' }}>
                  Each batch is knitted in limited quantities with combed long-staple cotton to ensure zero pilling and permanent color depth.
                </p>
              </div>
            </div>

            <div className="craft-stack-right">
              <div className="craft-card-small">
                <div className="craft-card-tag">FIBER</div>
                <h3 className="craft-card-title">Combed Organic Cotton</h3>
                <p className="craft-card-desc">
                  Long fibers combed to remove impurities, creating a dense, ultra-smooth surface with natural breathability.
                </p>
              </div>

              <div className="craft-card-small">
                <div className="craft-card-tag">STITCHING</div>
                <h3 className="craft-card-title">Blind Hem Finish</h3>
                <p className="craft-card-desc">
                  Minimalist blind hem construction across cuffs and lower edge for a clean, distraction-free silhouette.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craft Journey */}
      <section style={{ backgroundColor: '#0b0b0c', color: '#fff', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-tag" style={{ color: 'var(--gold-bright)' }}>FOUR-STAGE PROCESS</div>
            <h2 className="section-main-title" style={{ color: '#fff' }}>The T-Shirt Construction Process</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {steps.map((s) => (
              <div 
                key={s.step} 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-dark)',
                  padding: '2rem',
                  borderRadius: '2px'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--gold-primary)',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  marginBottom: '0.8rem'
                }}>
                  {s.step}
                </div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.6rem' }}>
                  {s.title}
                </h4>
                <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn-primary-gold"
              onClick={() => onNavigateToCollection('all')}
              style={{ padding: '1.1rem 2.5rem' }}
            >
              <span>EXPLORE T-SHIRT EDITIONS</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Global Ateliers Section */}
      <section style={{ backgroundColor: 'var(--bg-cream)', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-tag">GLOBAL SHOWROOMS</div>
            <h2 className="section-main-title">Maison Boutiques & Showrooms</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem'
          }}>
            {ateliers.map((a) => (
              <div 
                key={a.city}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border-light)',
                  padding: '2rem',
                  borderRadius: '2px',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <MapPin size={16} color="var(--gold-primary)" />
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#121316' }}>
                    {a.city} Showroom
                  </h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dark-secondary)', marginBottom: '0.4rem' }}>
                  {a.address}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dark-muted)', marginBottom: '0.8rem' }}>
                  {a.hours}
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-dark)' }}>
                  {a.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
