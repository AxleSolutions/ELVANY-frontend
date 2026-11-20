import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Flame, Clock, ShieldCheck, Gift, Percent, Zap, Eye } from 'lucide-react';
import { isOfferActive } from '../services/dbService';

export const PromotionsSection = ({ 
  offers = [], 
  onSelectProduct 
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef(null);

  // Update clock every second to drive real-time countdown & auto-expiry
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(tickInterval);
  }, []);

  // Filter only active, non-expired offers with stock remaining
  const activeOffers = offers.filter((o) => isOfferActive(o));

  const SLIDE_DURATION = 8000; // 8s per offer slide

  // Slideshow auto-advance
  useEffect(() => {
    if (activeOffers.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeOffers.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, activeOffers.length]);

  if (!activeOffers || activeOffers.length === 0) {
    return null; // Gracefully hidden when all offers expire
  }

  // Bound current index safely
  const safeIdx = currentIdx % activeOffers.length;
  const currentOffer = activeOffers[safeIdx] || activeOffers[0];

  // Calculate real-time countdown for the current offer
  const computeTimeRemaining = (offer) => {
    const expiry = offer?.endsAt || offer?.expires_at || offer?.expiresAt;
    if (!expiry) {
      return { days: 0, hours: 24, minutes: 0, seconds: 0, hasDays: false };
    }
    const diff = Math.max(0, new Date(expiry).getTime() - currentTime);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, hasDays: days > 0 };
  };

  const timeLeft = computeTimeRemaining(currentOffer);


  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % activeOffers.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
  };

  const handleInspectOffer = (offer) => {
    if (onSelectProduct) {
      onSelectProduct({
        id: offer.productId,
        name: offer.productName,
        title: offer.productName,
        priceLKR: offer.offerPriceLKR,
        originalPriceLKR: offer.originalPriceLKR,
        image: offer.productImage,
        category: offer.category || 'heavyweight'
      });
    }
  };

  return (
    <section className="promotions-section" style={{
      backgroundColor: '#090a0c',
      padding: '4rem 0 3.5rem 0',
      borderTop: '1px solid var(--gold-border)',
      borderBottom: '1px solid var(--border-dark)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        {/* Promotional Top Callout Bar (Clean Transparent Outline) */}
          <div className="promotions-callout-bar">
          <div className="promotions-callout-left">
            <div className="promotions-callout-badge">
              <Zap size={13} fill="#ffffff" color="#ffffff" />
              <span>SPECIAL ATELIER PRIVILEGE OFFER</span>
            </div>
            
            <span className="promotions-callout-text">
              Exclusive limited allocation prices on signature Florence pieces
            </span>
          </div>

          {/* Live Urgency Countdown Ticker */}
          <div className="promotions-countdown-ticker">
            <Clock size={15} color="#ef4444" />
            <span className="promotions-countdown-label">
              OFFER EXPIRES IN:
            </span>
            <div className="promotions-countdown-digits">
              {timeLeft.days > 0 && (
                <>
                  <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                  <span>:</span>
                </>
              )}
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>


        {/* Smooth Horizontal Carousel Sliding Viewport */}
        <div style={{ overflow: 'hidden', width: '100%', borderRadius: '2px' }}>
          <div 
            style={{
              display: 'flex',
              width: `${activeOffers.length * 100}%`,
              transform: `translateX(-${(currentIdx * 100) / activeOffers.length}%)`,
              transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {activeOffers.map((offer) => {
              const origPrice = offer.originalPriceLKR || 18500;
              const offerPrice = offer.offerPriceLKR || 15500;
              const savingsAmount = origPrice - offerPrice;
              const percentOff = origPrice > 0 ? Math.round((savingsAmount / origPrice) * 100) : 0;

              const totalAlloc = typeof offer.totalAllocation === 'number' && offer.totalAllocation > 0
                ? offer.totalAllocation
                : 25;
              const remaining = typeof offer.remainingUnits === 'number' && offer.remainingUnits >= 0
                ? offer.remainingUnits
                : 12;
              const sold = typeof offer.soldUnits === 'number'
                ? offer.soldUnits
                : Math.max(0, totalAlloc - remaining);
              const soldPercent = Math.min(100, Math.max(4, Math.round((sold / totalAlloc) * 100)));

              return (
                <div 
                  key={offer.id} 
                  style={{
                    width: `${100 / activeOffers.length}%`,
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div 
                    className="featured-offer-card"
                    onClick={() => handleInspectOffer(offer)}
                  >
                    {/* Top-Right Red Discount Tag */}
                    <div className="offer-discount-tag">
                      <Percent size={13} fill="#ffffff" color="#ffffff" />
                      <span>SAVE LKR {savingsAmount.toLocaleString()} ({percentOff}% OFF)</span>
                    </div>

                    {/* Left Column: High-Res Garment Showcase */}
                    <div className="offer-card-media-col">
                      <img 
                        src={offer.productImage} 
                        alt={offer.productName}
                        loading="eager"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                      />

                      {/* Privilege Badge Overlay (only if custom badge and not ATELIER LAUNCH PRIVILEGE) */}
                      {offer.badge && !offer.badge.toUpperCase().includes('LAUNCH PRIVILEGE') && (
                        <div className="offer-badge-overlay">
                          <Sparkles size={13} />
                          <span>{offer.badge}</span>
                        </div>
                      )}

                      {/* Bottom Scarcity Banner */}
                      <div className="offer-scarcity-pill">
                        <span style={{ color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Flame size={13} color="#ef4444" />
                          <span>{remaining} remaining</span>
                        </span>
                        <span style={{ color: 'var(--text-light-muted)', fontSize: '0.68rem' }}>
                          {sold} sold
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Offer Headline, Price Comparison & Direct Product Redirect CTA */}
                    <div className="offer-card-content-col">

                      <div>
                        {/* Product Category & Provenance */}
                        <div className="offer-eyebrow-row">
                          <span className="offer-product-name-tag">
                            {offer.productName}
                          </span>
                          <span className="offer-eyebrow-dot">•</span>
                          <span className="offer-applied-tag">
                            EXCLUSIVE OFFER
                          </span>
                        </div>

                        <h3 className="offer-card-title">
                          {offer.title}
                        </h3>

                        <p className="offer-card-desc">
                          {offer.subtitle}
                        </p>

                        {/* Clean Outline Price Comparison Box */}
                        <div className="offer-price-comparison-box">
                          <div className="offer-price-main-group">
                            <div className="offer-price-sublabel">
                              SPECIAL PRIVILEGE PRICE
                            </div>
                            <div className="offer-price-numbers">
                              <span className="offer-price-current">
                                LKR {offerPrice.toLocaleString()}
                              </span>
                              <span className="offer-price-orig">
                                LKR {origPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Instant Savings Callout */}
                          <div className="offer-savings-badge">
                            <div className="offer-savings-sublabel">
                              YOU SAVE
                            </div>
                            <div className="offer-savings-amount">
                              LKR {savingsAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Red Line Allocation & Scarcity Tracker */}
                        <div className="offer-scarcity-tracker" style={{
                          margin: '0 0 1.5rem 0',
                          padding: '0.9rem 1.2rem',
                          background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.28)',
                          borderRadius: '2px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.6rem',
                            fontSize: '0.82rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                              <Flame size={15} color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))' }} />
                              <span style={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.02em', fontSize: '0.85rem' }}>
                                <strong style={{ color: '#f87171' }}>{sold} sold</strong>
                                <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 8px' }}>•</span>
                                <strong style={{ color: '#ffffff' }}>{remaining} remaining</strong>
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#f87171',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              background: 'rgba(239, 68, 68, 0.15)',
                              padding: '3px 8px',
                              borderRadius: '2px',
                              border: '1px solid rgba(239, 68, 68, 0.35)'
                            }}>
                              {soldPercent}% Claimed
                            </span>
                          </div>

                          {/* Visual Red Progress Line */}
                          <div style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                          }}>
                            <div 
                              style={{
                                width: `${soldPercent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 70%, #f87171 100%)',
                                borderRadius: '999px',
                                boxShadow: '0 0 14px rgba(239, 68, 68, 0.75)',
                                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            />
                          </div>
                        </div>

                        {/* Value Highlights (Desktop only) */}
                        <div className="offer-value-highlights">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={14} color="var(--gold-bright)" />
                            <span>Complimentary express island-wide courier & gift box included</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={14} color="var(--gold-bright)" />
                            <span>Full size chart, fabric density & fit advice on product page</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action: Direct Product Page Redirect Button */}
                      <div className="offer-bottom-action">
                        <button
                          type="button"
                          className="btn-primary-gold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectOffer(offer);
                          }}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '1rem 1.8rem',
                            fontSize: '0.82rem',
                            letterSpacing: '0.16em',
                            fontWeight: 800
                          }}
                        >
                          <Eye size={16} />
                          <span>VIEW GARMENT & CLAIM LKR {savingsAmount.toLocaleString()} OFFER</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide Selector Controls & Segmented Indicators */}
        {activeOffers.length > 1 && (
          <div className="promotions-carousel-controls">
            <button
              type="button"
              onClick={handlePrev}
              className="promotions-nav-btn"
              title="Previous Atelier Offer"
            >
              <ChevronLeft size={14} />
              <span className="promotions-nav-text-desktop">PREVIOUS PIECE OFFER</span>
              <span className="promotions-nav-text-mobile">PREVIOUS</span>
            </button>

            {/* Segmented Dashes */}
            <div className="promotions-dashes-container">
              {activeOffers.map((offer, idx) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: idx === currentIdx ? '42px' : '16px',
                    height: '4px',
                    backgroundColor: idx === currentIdx ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.25)',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                  title={offer.productName}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="promotions-nav-btn"
              title="Next Atelier Offer"
            >
              <span className="promotions-nav-text-desktop">NEXT PIECE OFFER</span>
              <span className="promotions-nav-text-mobile">NEXT</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
