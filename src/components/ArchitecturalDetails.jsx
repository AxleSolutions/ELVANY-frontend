import React from 'react';

export const ArchitecturalDetails = () => {
  return (
    <section className="architectural-section">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">FABRIC & CONSTRUCTION</div>
          <h2 className="section-main-title">The Engineering Details</h2>
        </div>

        {/* 3-Card Grid */}
        <div className="craft-grid">
          {/* Left Large Hero Card */}
          <div className="craft-card-large">
            <img 
              src="/images/pillar_heavyweight.jpg" 
              alt="Heavyweight Cotton Structure" 
              loading="lazy"
              decoding="async"
            />
            <div className="craft-card-large-overlay">
              <div className="craft-card-tag" style={{ color: 'var(--gold-bright)' }}>
                HEAVYWEIGHT INTERLOCK KNIT
              </div>
              <h3 className="craft-card-title" style={{ color: '#fff', fontSize: '1.8rem' }}>
                280 GSM Organic Cotton
              </h3>
              <p className="craft-card-desc" style={{ color: '#d0d2d8', maxWidth: '520px' }}>
                Knitted with tightly spun long-staple combed cotton yarns to produce a dense, opaque fabric that drapes cleanly without clinging.
              </p>
            </div>
          </div>

          {/* Right Stacked Feature Cards */}
          <div className="craft-stack-right">
            <div className="craft-card-small">
              <div className="craft-card-tag">COLLAR ARCHITECTURE</div>
              <h3 className="craft-card-title">Reinforced Bound Collar</h3>
              <p className="craft-card-desc">
                High-density 1x1 cotton ribbing secured with double-needle topstitching to guarantee your neckline never stretches or wavers.
              </p>
            </div>

            <div className="craft-card-small">
              <div className="craft-card-tag">INTERNAL STABILITY</div>
              <h3 className="craft-card-title">Shoulder Herringbone Taping</h3>
              <p className="craft-card-desc">
                Concealed internal tape running from shoulder to shoulder preventing seam sagging and maintaining structural shape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
