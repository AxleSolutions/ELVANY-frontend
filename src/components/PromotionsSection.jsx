import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Flame, Clock, ShieldCheck, Gift, Percent, Zap, Eye, Lock } from 'lucide-react';
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

  // Filter offers that are enabled (isActive !== false) and non-expired (time-wise).
  // Offers where all units are claimed (remainingUnits <= 0) REMAIN visible on storefront
  // for customers to view as proof of demand, but display 100% CLAIMED and cannot be purchased.
  const activeOffers = offers.filter((o) => {
    if (!o) return false;
    if (o.isActive === false || o.is_active === false) return false;
    const expiry = o.endsAt || o.expires_at || o.expiresAt;
    if (expiry) {
      const expTime = new Date(expiry).getTime();
      if (!isNaN(expTime) && currentTime >= expTime) return false;
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
    if (onSelectProduct && offer) {
      const targetId = offer.productId || offer.product_id || offer.productName || offer.title;
      onSelectProduct({
        id: targetId,
        productId: targetId,
        name: offer.productName || offer.title,
        title: offer.productName || offer.title,
        priceLKR: offer.originalPriceLKR || offer.offerPriceLKR,
        originalPriceLKR: offer.originalPriceLKR,
        image: offer.productImage,
        category: offer.category || 'heavyweight'
      });
    }
  };

  return (
    <section className="promotions-section" style={{
      backgroundColor: '#090a0c',
      padding: '2.5rem 0 2rem 0',
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
              Exclusive limited allocation prices on signature atelier pieces
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

              const remaining = typeof offer.remainingUnits === 'number' && offer.remainingUnits >= 0
                ? Math.max(0, parseInt(offer.remainingUnits, 10))
                : 12;

              let sold = 0;
              if (typeof offer.soldUnits === 'number' && offer.soldUnits >= 0) {
                sold = parseInt(offer.soldUnits, 10);
              } else if (typeof offer.totalAllocation === 'number' && offer.totalAllocation > remaining) {
                sold = offer.totalAllocation - remaining;
              } else {
                sold = 13;
              }

              // True total batch allocation is always at least (sold + remaining)
              const effectiveTotal = Math.max(1, (typeof offer.totalAllocation === 'number' && offer.totalAllocation >= (sold + remaining))
                ? offer.totalAllocation
                : (sold + remaining));

              const isClaimedOut = remaining <= 0;

              // Percentage claimed: 100% when remaining is 0 or less
              let soldPercent = 0;
              if (isClaimedOut) {
                soldPercent = 100;
              } else if (effectiveTotal > 0) {
                const rawRatio = Math.round((sold / effectiveTotal) * 100);
                soldPercent = Math.min(98, Math.max(4, rawRatio));
              }

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
                    style={isClaimedOut ? { borderColor: 'rgba(239, 68, 68, 0.35)' } : {}}
                  >
                    {/* Top-Right Red Discount Tag (only when offer is live and active) */}
                    {!isClaimedOut && (
                      <div className="offer-discount-tag">
                        <Percent size={13} fill="#ffffff" color="#ffffff" />
                        <span>SAVE LKR {savingsAmount.toLocaleString()} ({percentOff}% OFF)</span>
                      </div>
                    )}

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
                    </div>

                    {/* Right Column: Offer Headline, Price Comparison & Direct Product Redirect CTA */}
                    <div className="offer-card-content-col">

                      <div>
                        {/* Product Category & Provenance */}
                        <div className="offer-eyebrow-row">
                          <span className="offer-product-name-tag">
                            {offer.productName}
                          </span>
                          {!isClaimedOut && (
                            <>
                              <span className="offer-eyebrow-dot">•</span>
                              <span className="offer-applied-tag">
                                EXCLUSIVE OFFER
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="offer-card-title">
                          {offer.title}
                        </h3>

                        <p className="offer-card-desc">
                          {offer.subtitle}
                        </p>

                        {/* Clean Borderless Price Comparison */}
                        <div className="offer-price-comparison-box" style={{ border: 'none', background: 'transparent', padding: 0, marginBottom: '1.4rem' }}>
                          <div className="offer-price-main-group">
                            <div className="offer-price-sublabel" style={isClaimedOut ? { color: '#f87171' } : {}}>
                              {isClaimedOut ? 'PRIVILEGE ALLOCATION PRICE' : 'SPECIAL PRIVILEGE PRICE'}
                            </div>
                            <div className="offer-price-numbers">
                              <span className="offer-price-current" style={isClaimedOut ? { textDecoration: 'line-through', opacity: 0.6 } : {}}>
                                LKR {offerPrice.toLocaleString()}
                              </span>
                              <span className="offer-price-orig">
                                LKR {origPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Red Line Allocation & Scarcity Tracker */}
                        <div className="offer-scarcity-tracker" style={{
                          margin: '0 0 1.5rem 0',
                          padding: 0,
                          background: 'transparent',
                          border: 'none'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.55rem',
                            fontSize: '0.82rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                              <Flame size={15} color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))' }} />
                              <span style={{ color: '#ffffff', fontWeight: 700, letterSpacing: '0.02em', fontSize: '0.85rem' }}>
                                <strong style={{ color: '#f87171' }}>{sold} sold</strong>
                                <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 8px' }}>•</span>
                                <strong style={{ color: isClaimedOut ? '#f87171' : '#ffffff' }}>{remaining} remaining</strong>
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#f87171',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              background: 'transparent',
                              padding: 0,
                              border: 'none'
                            }}>
                              {isClaimedOut ? '100% Claimed' : `${soldPercent}% Claimed`}
                            </span>
                          </div>

                          {/* Visual Red Progress Line */}
                          <div style={{
                            width: '100%',
                            height: '5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div 
                              style={{
                                width: `${soldPercent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 70%, #f87171 100%)',
                                borderRadius: '999px',
                                boxShadow: '0 0 10px rgba(239, 68, 68, 0.65)',
                                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action: Direct Product Page Redirect Button */}
                      <div className="offer-bottom-action">
                        {isClaimedOut ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectOffer(offer);
                            }}
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                              padding: '1rem 1.6rem',
                              fontSize: '0.82rem',
                              letterSpacing: '0.14em',
                              fontWeight: 800,
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: '1px solid #b91c1c',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderRadius: '2px',
                              opacity: 1,
                              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)'
                            }}
                          >
                            <Lock size={15} color="#ffffff" />
                            <span>100% CLAIMED • ALLOCATIONS EXHAUSTED (PURCHASE CLOSED)</span>
                          </button>
                        ) : (
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
                        )}
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
