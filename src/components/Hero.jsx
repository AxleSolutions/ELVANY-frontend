import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'heavyweight',
    title: 'The perfect luxury T-shirt, engineered to hold its structure',
    description: 'Crafted in Florence with 280 GSM long-staple organic cotton and reinforced non-sag architectural collars.',
    image: '/images/hero_tshirt.webp'
  },
  {
    id: 'sea-island',
    title: 'Silk-like softness meeting architectural density',
    description: 'Woven from ultra-rare long-staple Sea Island cotton fibers with permanent drape memory and natural breathable luster.',
    image: '/images/tshirt_white.webp'
  },
  {
    id: 'oversized',
    title: 'A sculpted drop-shoulder cut that never collapses',
    description: 'Precision-calibrated drape and proportioned sleeves designed for clean modern tailoring and effortless layering.',
    image: '/images/tshirt_oversized.webp'
  }
];

export const Hero = ({ onExploreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);

  const SLIDE_DURATION = 6500; // 6.5 seconds per slide

  // Automatic continuous slide rotation (never stops on mouse hover)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide]);

  const handleSelectSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="hero-section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0b0b0c'
      }}
    >
      {/* Background Images: Enhanced High-Clarity Optical Focus & Zoom */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;

        return (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1.0)' : 'scale(1.08)',
              filter: isActive ? 'blur(0px) brightness(1.08) contrast(1.04)' : 'blur(6px) brightness(0.6)',
              transition: 'opacity 1.6s cubic-bezier(0.22, 1, 0.36, 1), transform 6.5s cubic-bezier(0.25, 1, 0.5, 1), filter 1.6s ease-out',
              zIndex: isActive ? 2 : 1,
              pointerEvents: 'none'
            }}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding={idx === 0 ? 'sync' : 'async'}
              className="hero-slide-bg-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 15%'
              }}
            />
          </div>
        );
      })}

      {/* High-Clarity Cinematic Gradient Overlays */}
      <div 
        className="hero-gradient-overlay" 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(11, 11, 12, 0.88) 0%, rgba(11, 11, 12, 0.62) 42%, rgba(11, 11, 12, 0.18) 72%, rgba(11, 11, 12, 0.02) 100%)',
          zIndex: 3
        }} 
      />
      <div 
        className="hero-gradient-vignette"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          background: 'linear-gradient(to top, #0b0b0c 0%, rgba(11, 11, 12, 0.4) 60%, transparent 100%)',
          zIndex: 4
        }}
      />

      <div className="container hero-container">
        <div className="hero-content">
          
          {/* Atelier Eyebrow Subheader Badge */}
          <div className="hero-eyebrow-tag">
            <span className="hero-eyebrow-line" />
            <span>FLORENCE ATELIER • NOBLE COTTON</span>
          </div>

          {/* Robust CSS Grid Stacking Stage Container */}
          <div className="hero-text-stage">
            {HERO_SLIDES.map((slide, idx) => {
              const isCurrent = idx === currentSlide;

              return (
                <div
                  key={slide.id}
                  className={`hero-slide-item ${isCurrent ? 'active' : ''}`}
                >
                  <h1 className="hero-title hero-responsive-title">
                    {slide.title}
                  </h1>

                  <p className="hero-description hero-responsive-desc">
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Static CTA Action Button */}
          <div className="hero-cta-wrap">
            <button 
              className="btn-primary-gold hero-cta-btn"
              onClick={onExploreClick}
            >
              <span>EXPLORE T-SHIRT CAPSULE</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Segmented Gold Progress Dash Indicators */}
          <div className="hero-progress-group">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className="hero-progress-btn"
                onClick={() => handleSelectSlide(idx)}
              >
                <div className="hero-progress-header">
                  <span className="hero-progress-num">0{idx + 1}</span>
                  <span className="hero-progress-sublabel" style={{ opacity: idx === currentSlide ? 1 : 0.45 }}>
                    {idx === 0 ? 'HEAVYWEIGHT' : idx === 1 ? 'SEA ISLAND' : 'BOXY CUT'}
                  </span>
                </div>

                {/* Progress Track */}
                <div className="hero-progress-track">
                  {idx === currentSlide ? (
                    <div 
                      key={`progress-${currentSlide}`}
                      className="hero-progress-fill"
                      style={{
                        animationDuration: `${SLIDE_DURATION}ms`
                      }} 
                    />
                  ) : idx < currentSlide ? (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(197, 160, 89, 0.45)' }} />
                  ) : null}
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>

  );
};
