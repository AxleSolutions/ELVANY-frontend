import React from 'react';

/**
 * Official Visa & Mastercard Combined Logo from /payment logos/visa master.png
 */
export function VisaMastercardLogo({ className = '', style = {}, imgStyle = {}, withBackground = true }) {
  if (withBackground) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          width: '76px',
          height: '34px',
          padding: '2px 6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxSizing: 'border-box',
          ...style
        }}
        className={className}
      >
        <img 
          src="/payment logos/visa master.png" 
          alt="Visa & Mastercard" 
          style={{ maxHeight: '24px', maxWidth: '64px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...imgStyle }}
        />
      </div>
    );
  }

  return (
    <img 
      src="/payment logos/visa master.png" 
      alt="Visa & Mastercard" 
      className={className}
      style={{ height: '22px', width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}

/**
 * Official Koko BNPL Logo from /payment logos/koko.webp
 */
export function KokoLogo({ className = '', style = {}, imgStyle = {}, withBackground = true }) {
  if (withBackground) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          width: '76px',
          height: '34px',
          padding: '2px 6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxSizing: 'border-box',
          ...style
        }}
        className={className}
      >
        <img 
          src="/payment logos/koko.webp" 
          alt="Koko Buy Now Pay Later" 
          style={{ maxHeight: '24px', maxWidth: '64px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...imgStyle }}
        />
      </div>
    );
  }

  return (
    <img 
      src="/payment logos/koko.webp" 
      alt="Koko Buy Now Pay Later" 
      className={className}
      style={{ height: '24px', width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}

/**
 * Official LankaQR Logo from /payment logos/lankaQR.jpg
 */
export function LankaQrLogo({ className = '', style = {}, imgStyle = {}, withBackground = true }) {
  if (withBackground) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          width: '76px',
          height: '34px',
          padding: '2px 6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxSizing: 'border-box',
          ...style
        }}
        className={className}
      >
        <img 
          src="/payment logos/lankaQR.jpg" 
          alt="LankaQR" 
          style={{ maxHeight: '28px', maxWidth: '64px', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...imgStyle }}
        />
      </div>
    );
  }

  return (
    <img 
      src="/payment logos/lankaQR.jpg" 
      alt="LankaQR" 
      className={className}
      style={{ height: '24px', width: 'auto', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}

/**
 * Vector Fallback Logos
 */
export function VisaLogo({ style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '2px 5px', borderRadius: '3px', ...style }}>
      <img src="/payment logos/visa master.png" alt="Visa" style={{ height: '14px', width: 'auto', objectFit: 'contain' }} />
    </div>
  );
}

export function MastercardLogo({ style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '2px 5px', borderRadius: '3px', ...style }}>
      <img src="/payment logos/visa master.png" alt="Mastercard" style={{ height: '14px', width: 'auto', objectFit: 'contain' }} />
    </div>
  );
}

export function AmexLogo({ style = {} }) {
  return (
    <svg 
      viewBox="0 0 38 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ display: 'inline-block', verticalAlign: 'middle', height: '18px', ...style }}
      aria-label="American Express"
    >
      <rect width="38" height="24" rx="3" fill="#006FCF"/>
      <path d="M6 18L10 6H13.5L17.5 18H14.5L13.7 15.2H9.8L9 18H6ZM10.5 12.8H13L11.75 8.5L10.5 12.8ZM19 18V6H22.5L25 12L27.5 6H31V18H28.5V10.5L26 16.5H24L21.5 10.5V18H19Z" fill="#FFFFFF"/>
    </svg>
  );
}
