import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Flame, Clock, ShieldCheck, Gift, Percent, Zap, Eye } from 'lucide-react';

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

  // Filter only active & non-expired offers
  const activeOffers = offers.filter((o) => {
    if (!o.isActive) return false;
    const expiryTimestamp = o.endsAt || o.expires_at || o.expiresAt;
    if (expiryTimestamp) {
      const exp = new Date(expiryTimestamp).getTime();
      if (!isNaN(exp) && currentTime >= exp) {
        return false; // Offer has expired -> auto disappears
      }
    }
    return true;
  });

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
              const percentOff = Math.round((savingsAmount / origPrice) * 100);
              const totalAllocation = offer.totalAllocation || 25;
              const remaining = offer.remainingUnits || 6;
              const claimedPercent = Math.round(((totalAllocation - remaining) / totalAllocation) * 100);

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
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                      />

                      {/* Privilege Badge Overlay (Hidden on Mobile) */}
                      <div className="offer-badge-overlay">
                        <Sparkles size={13} />
                        <span>{offer.badge || 'ATELIER PRIVILEGE'}</span>
                      </div>

                      {/* Bottom Scarcity Banner */}
                      <div className="offer-scarcity-pill">
                        <span style={{ color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Flame size={13} color="var(--gold-bright)" />
                          <span>{remaining} left</span>
                        </span>
                        <span style={{ color: 'var(--text-light-muted)', fontSize: '0.68rem' }}>
                          {claimedPercent}% claimed
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1rem'
          }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-dark)',
                color: '#ffffff',
                padding: '0.6rem 1.2rem',
                fontSize: '0.74rem',
                letterSpacing: '0.12em',
                borderRadius: '1px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-bright)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-dark)'}
            >
              <ChevronLeft size={14} />
              <span>PREVIOUS PIECE OFFER</span>
            </button>

            {/* Segmented Dashes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {activeOffers.map((offer, idx) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: idx === currentIdx ? '42px' : '16px',
                    height: '4px',
                    backgroundColor: idx === currentIdx ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.2)',
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
              style={{
                background: 'transparent',
                border: '1px solid var(--border-dark)',
                color: '#ffffff',
                padding: '0.6rem 1.2rem',
                fontSize: '0.74rem',
                letterSpacing: '0.12em',
                borderRadius: '1px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-bright)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-dark)'}
            >
              <span>NEXT PIECE OFFER</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
