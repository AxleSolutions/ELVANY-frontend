import React, { useEffect } from 'react';
import { X, Check, ShieldCheck, Award, Layers, Sparkles } from 'lucide-react';

export const EditorialModal = ({ isOpen, onClose }) => {
  // Lock background body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop editorial-modal-backdrop" 
      onClick={onClose} 
      data-lenis-prevent="true"
      style={{ 
        position: 'fixed',
        inset: 0,
        zIndex: 99999, 
        padding: '1rem',
        backgroundColor: 'rgba(5, 6, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto'
      }}
    >
      <div 
        className="editorial-study-dialog" 
        data-lenis-prevent="true"
        style={{
          backgroundColor: '#121316',
          color: '#ffffff',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          borderRadius: '4px',
          border: '1px solid var(--border-dark)',
          boxShadow: 'var(--shadow-luxury)',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          overflow: 'hidden',
          overscrollBehavior: 'contain'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-icon" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'var(--transition-fast)'
          }}
        >
          <X size={18} />
        </button>

        {/* Left Column: Image Banner */}
        <div className="editorial-dialog-image" style={{ position: 'relative', minHeight: '300px', backgroundColor: '#090a0c' }}>
          <img 
            src="/images/editorial_brutalist.webp" 
            alt="ELVANY Architectural Study" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            right: '1.5rem',
            background: 'rgba(9, 10, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--gold-border)',
            padding: '1rem',
            borderRadius: '2px'
          }}>
            <div style={{ color: 'var(--gold-bright)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              MAISON ARCHIVE VOL. IV
            </div>
            <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 500, marginTop: '2px' }}>
              The 280 GSM Heavyweight T-Shirt Study
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Deep Dive Content */}
        <div 
          className="editorial-dialog-body" 
          data-lenis-prevent="true"
          style={{
            padding: '2.8rem 2.4rem',
            overflowY: 'auto',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div style={{
            color: 'var(--gold-bright)',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            marginBottom: '0.4rem'
          }}>
            ENGINEERING SPECIFICATION & STUDY
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '0.8rem'
          }}>
            Architectural Balance in Pure Cotton
          </h2>

          <div style={{
            display: 'flex',
            gap: '1.2rem',
            fontSize: '0.72rem',
            color: 'var(--text-light-muted)',
            marginBottom: '1.8rem',
            borderBottom: '1px solid var(--border-dark)',
            paddingBottom: '0.8rem'
          }}>
            <span>ATELIER: FLORENCE, ITALY</span>
            <span>FABRIC: 280 GSM SEA ISLAND</span>
          </div>

          {/* Core Specification Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '2rem' }}>
            
            {/* Spec 01 */}
            <div style={{ backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', padding: '1.2rem', borderRadius: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--gold-bright)', fontWeight: 700, fontSize: '0.82rem' }}>01</span>
                <h4 style={{ color: '#fff', fontSize: '0.92rem', margin: 0, fontWeight: 600 }}>
                  280 GSM Long-Staple Combed Cotton
                </h4>
              </div>
              <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                Spun from ultra-long combed cotton fibers with zero synthetic blending. Double-mercerized to achieve natural matte sheen and permanent structural memory that resists sagging after wash cycles.
              </p>
            </div>

            {/* Spec 02 */}
            <div style={{ backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', padding: '1.2rem', borderRadius: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--gold-bright)', fontWeight: 700, fontSize: '0.82rem' }}>02</span>
                <h4 style={{ color: '#fff', fontSize: '0.92rem', margin: 0, fontWeight: 600 }}>
                  Double-Needle Bound Non-Sag Collar Ribbing
                </h4>
              </div>
              <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                Engineered with high-density 1x1 elastane-infused ribbing and internal herringbone neck tape, creating a clean neckline that sits crisp against the collarbones without stretching.
              </p>
            </div>

            {/* Spec 03 */}
            <div style={{ backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', padding: '1.2rem', borderRadius: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--gold-bright)', fontWeight: 700, fontSize: '0.82rem' }}>03</span>
                <h4 style={{ color: '#fff', fontSize: '0.92rem', margin: 0, fontWeight: 600 }}>
                  Blind-Hem Artisan Construction in Florence
                </h4>
              </div>
              <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                Stitched by master craftsmen using invisible blind-hem seamwork, ensuring the sleeves and lower hem drape naturally without rigid puckering.
              </p>
            </div>

          </div>

          {/* Quality Guarantee Card */}
          <div style={{
            background: 'rgba(197, 160, 89, 0.08)',
            border: '1px solid var(--gold-border)',
            padding: '1.2rem',
            borderRadius: '2px',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '0.78rem', marginBottom: '4px' }}>
              <ShieldCheck size={16} />
              <span>ATELIER QUALITY CERTIFICATE</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)', lineHeight: 1.55 }}>
              Each production run is limited to numbered batches of 50 individually inspected garments.
            </div>
          </div>

          <button 
            className="btn-primary-gold" 
            onClick={onClose} 
            style={{ width: '100%', justifyContent: 'center', padding: '0.95rem' }}
          >
            <span>CLOSE STUDY & EXPLORE COLLECTION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
