import React, { useEffect } from 'react';
import { X, Ruler, Sparkles, MessageSquare, Info } from 'lucide-react';

export const SizeChartModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop size-chart-backdrop" 
      onClick={onClose}
      data-lenis-prevent="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 6, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        className="size-chart-dialog"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '94vh',
          margin: '0 auto',
          backgroundColor: '#0c0d12',
          border: '1px solid var(--gold-border)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(197, 160, 89, 0.15)',
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Close Button */}
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close size guide"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--gold-bright)';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(197, 160, 89, 0.08) 0%, transparent 100%)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--gold-bright)',
            fontSize: '0.64rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase'
          }}>
            <Ruler size={12} />
            <span>ELVANY • SIZE CHART</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            color: '#ffffff',
            fontWeight: 400,
            margin: '2px 0 0 0'
          }}>
            Garment Dimension Chart
          </h2>
        </div>

        {/* Modal Body: Compact Fit Size Chart Image & Notes */}
        <div 
          data-lenis-prevent="true"
          style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            overflowY: 'auto'
          }}
        >
          <div style={{
            width: '100%',
            backgroundColor: '#07080a',
            border: '1px solid rgba(197, 160, 89, 0.2)',
            borderRadius: '3px',
            padding: '0.25rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)'
          }}>
            <img 
              src="/Size chart/sizechart.webp" 
              alt="ELVANY Official Garment Size Chart"
              style={{
                width: 'auto',
                maxWidth: '100%',
                maxHeight: 'min(52vh, 420px)',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '2px'
              }}
              onError={(e) => {
                e.target.src = encodeURI('/Size chart/sizechart.webp');
              }}
            />
          </div>

          {/* Sizing & Baggy Fit Clean Text Notes */}
          <div style={{
            width: '100%',
            padding: '0 0.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }}>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.78rem', lineHeight: 1.4, margin: 0 }}>
              * <strong style={{ color: '#ffffff' }}>Note:</strong> Measurements are for <strong>real t-shirts (in inches)</strong>, not body measurements.
            </p>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.78rem', lineHeight: 1.4, margin: 0 }}>
              * When purchasing <strong>baggy t-shirts</strong>, use your <strong>normal t-shirt size</strong>. We adjust the baggy fit for you.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.65rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#090a0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <a
            href="https://wa.me/94719092726?text=Hi%20ELVANY%2C%20I%20need%20help%20choosing%20my%20exact%20t-shirt%20size"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.45rem 0.8rem',
              backgroundColor: 'rgba(197, 160, 89, 0.08)',
              border: '1px solid var(--gold-border)',
              color: 'var(--gold-bright)',
              borderRadius: '2px',
              fontSize: '0.7rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare size={12} />
            <span>WHATSAPP CONCIERGE</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary-gold"
            style={{
              padding: '0.45rem 1.1rem',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            <span>CLOSE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
