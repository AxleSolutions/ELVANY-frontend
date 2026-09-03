import React, { useEffect } from 'react';
import { X, Ruler, Sparkles, MessageSquare } from 'lucide-react';

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
        padding: '1.5rem 1rem',
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
          maxWidth: '620px',
          maxHeight: '90vh',
          margin: 'auto',
          backgroundColor: '#0c0d12',
          border: '1px solid var(--gold-border)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(197, 160, 89, 0.15)',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Close Button */}
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close size guide"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '34px',
            height: '34px',
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
          <X size={17} />
        </button>

        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(197, 160, 89, 0.08) 0%, transparent 100%)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--gold-bright)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '0.2rem'
          }}>
            <Ruler size={13} />
            <span>MAISON ELVANY • SIZING CHART</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
            color: '#ffffff',
            fontWeight: 400,
            margin: 0
          }}>
            Garment Dimension Chart
          </h2>
        </div>

        {/* Modal Body: 1:1 Aspect Ratio Size Chart Container */}
        <div 
          data-lenis-prevent="true"
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '560px',
            aspectRatio: '1 / 1',
            backgroundColor: '#07080a',
            border: '1px solid rgba(197, 160, 89, 0.25)',
            borderRadius: '4px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)'
          }}>
            <img 
              src="/Size chart/sizechart.webp" 
              alt="Maison ELVANY Official Garment Size Chart"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '2px'
              }}
              onError={(e) => {
                e.target.src = encodeURI('/Size chart/sizechart.webp');
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#090a0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <a
            href="https://wa.me/94719092726?text=Hi%20ELVANY%2C%20I%20need%20help%20choosing%20my%20exact%20t-shirt%20size"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.9rem',
              backgroundColor: 'rgba(197, 160, 89, 0.08)',
              border: '1px solid var(--gold-border)',
              color: 'var(--gold-bright)',
              borderRadius: '2px',
              fontSize: '0.72rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageSquare size={13} />
            <span>ASK CONCIERGE ON WHATSAPP</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary-gold"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.74rem',
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
