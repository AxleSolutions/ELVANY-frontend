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
        backgroundColor: 'rgba(18, 19, 22, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
          backgroundColor: '#ffffff',
          border: '1px solid #e2ddd5',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.18)',
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
            backgroundColor: '#f8f6f0',
            border: '1px solid #e2ddd5',
            color: '#121316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#8f6f32';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f6f0';
            e.currentTarget.style.color = '#121316';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{
          padding: '0.85rem 1.1rem',
          borderBottom: '1px solid #e5dfd5',
          backgroundColor: '#fcfaf6',
          flexShrink: 0
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#8f6f32',
            fontSize: '0.66rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase'
          }}>
            <Ruler size={12} />
            <span>ELVANY • SIZE CHART</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            color: '#121316',
            fontWeight: 600,
            margin: '2px 0 0 0'
          }}>
            Garment Dimension Chart
          </h2>
        </div>

        {/* Modal Body: Compact Fit Size Chart Image & Notes */}
        <div 
          data-lenis-prevent="true"
          style={{
            padding: '0.85rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            overflowY: 'auto'
          }}
        >
          <div style={{
            width: '100%',
            backgroundColor: '#f8f6f0',
            border: '1px solid #e2ddd5',
            borderRadius: '4px',
            padding: '0.35rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
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
            gap: '0.25rem'
          }}>
            <p style={{ color: '#62646c', fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
              * <strong style={{ color: '#121316' }}>Note:</strong> Measurements are for <strong>real t-shirts (in inches)</strong>, not body measurements.
            </p>
            <p style={{ color: '#62646c', fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
              * When purchasing <strong>baggy t-shirts</strong>, use your <strong>normal t-shirt size</strong>. We adjust the baggy fit for you.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.75rem 1.1rem',
          borderTop: '1px solid #e5dfd5',
          backgroundColor: '#fcfaf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <a
            href="https://wa.me/94765293943?text=Hi%20ELVANY%2C%20I%20need%20help%20choosing%20my%20exact%20t-shirt%20size"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.5rem 0.9rem',
              backgroundColor: '#ffffff',
              border: '1px solid #dcc48e',
              color: '#8f6f32',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
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
              padding: '0.5rem 1.2rem',
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
