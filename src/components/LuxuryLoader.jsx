import React, { useState, useEffect } from 'react';

const WAITING_SLOGANS = [
  'Precision in every fiber. Unveiling the collection...',
  'Weaving Florentine craftsmanship into modern silhouettes...',
  'Curating the 280 GSM luxury capsule for you...',
  'Where architectural weight meets pure cotton integrity...'
];

export const LuxuryLoader = ({ isVisible }) => {
  const [sloganIndex, setSloganIndex] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Pick a random slogan on each page change
      setSloganIndex(Math.floor(Math.random() * WAITING_SLOGANS.length));
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="luxury-page-transition-overlay">
      <div className="luxury-loader-content">
        <div className="luxury-loader-emblem" style={{ marginBottom: '1.2rem' }}>
          <img 
            src="/logo/Main-4.png" 
            alt="ELVANY Monogram" 
            style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto', filter: 'drop-shadow(0 0 20px rgba(197, 160, 89, 0.4))' }} 
          />
        </div>
        <div className="luxury-loader-brand">ELVANY</div>
        
        {/* Creative Slogan */}
        <p className="luxury-loader-slogan">
          “{WAITING_SLOGANS[sloganIndex]}”
        </p>

        {/* Shimmering Progress Bar */}
        <div className="luxury-loader-bar">
          <div className="luxury-loader-bar-fill" />
        </div>

        <div className="luxury-loader-sub">SRI LANKA</div>
      </div>
    </div>
  );
};
