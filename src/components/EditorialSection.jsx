import React from 'react';
import { ArrowRight } from 'lucide-react';

export const EditorialSection = ({ onReadEditorial }) => {
  return (
    <section id="editorial" className="editorial-split-section">
      {/* Story Text Panel */}
      <div className="editorial-story-panel">
        <div className="editorial-volume-tag">
          CAMPAIGN VOL. IV
        </div>

        <h2 className="editorial-title">
          The Architecture of the Perfect Tee
        </h2>

        <p className="editorial-copy">
          Designed for those who understand that simplicity demands the highest precision. 
          Heavyweight drape, flawless collar retention, and zero synthetic blends.
        </p>

        <div className="editorial-metrics-list">
          <div className="editorial-metric-item">
            <span className="metric-number">01</span>
            <span>280 GSM long-staple combed cotton</span>
          </div>

          <div className="editorial-metric-item">
            <span className="metric-number">02</span>
            <span>Double-needle bound non-sag collar ribbing</span>
          </div>

          <div className="editorial-metric-item">
            <span className="metric-number">03</span>
            <span>Blind-hem artisan construction in Florence</span>
          </div>
        </div>

        <div>
          <button 
            className="btn-primary-gold"
            onClick={onReadEditorial}
          >
            <span>READ T-SHIRT STUDY</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Editorial Visual Panel */}
      <div className="editorial-image-panel">
        <img 
          src="/images/tshirt_oversized.jpg" 
          alt="ELVANY Luxury T-Shirt Editorial" 
          className="editorial-hero-img"
          loading="lazy"
          decoding="async"
        />
        <div className="editorial-watermark-stamp">
          FLORENCE ATELIER • 2025
        </div>
      </div>
    </section>
  );
};
