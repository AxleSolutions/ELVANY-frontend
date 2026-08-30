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
              <Zap size={13} fill="#000000" color="#000000" />
              <span>SPECIAL ATELIER PRIVILEGE OFFER</span>
            </div>
            
            <span className="promotions-callout-text">
              Exclusive limited allocation prices on signature Florence pieces
            </span>
          </div>

          {/* Live Urgency Countdown Ticker */}
          <div className="promotions-countdown-ticker">
            <Clock size={15} color="var(--gold-bright)" />
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
                    {/* Top-Right Inverted Gold Discount Tag */}
                    <div className="offer-discount-tag">
                      <Percent size={13} fill="#000000" color="#000000" />
                      <span>SAVE LKR {savingsAmount.toLocaleString()} ({percentOff}% OFF)</span>
                    </div>

                    {/* Left Column: High-Res Garment Showcase */}
                    <div className="offer-card-media-col">
                      <img 
                        src={offer.productImage} 
                        alt={offer.productName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                      />

                      {/* Privilege Badge Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        backgroundColor: '#000000',
                        border: '1px solid var(--gold-bright)',
                        color: 'var(--gold-bright)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '1px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 4
                      }}>
                        <Sparkles size={13} />
                        <span>{offer.badge || 'ATELIER PRIVILEGE'}</span>
                      </div>

                      {/* Bottom Scarcity Banner */}
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        right: '16px',
                        backgroundColor: '#000000',
                        border: '1px solid var(--border-dark)',
                        padding: '8px 12px',
                        borderRadius: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem',
                        zIndex: 4
                      }}>
                        <span style={{ color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Flame size={14} color="var(--gold-bright)" />
                          <span>Only {remaining} pieces left in allocation</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
                            {offer.productName}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                            EXCLUSIVE OFFER APPLIED
                          </span>
                        </div>

                        <h3 style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                          color: '#ffffff',
                          fontWeight: 400,
                          lineHeight: 1.2,
                          margin: '0 0 0.8rem 0'
                        }}>
                          {offer.title}
                        </h3>

                        <p style={{
                          color: 'var(--text-light-secondary)',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          fontWeight: 300,
                          margin: '0 0 1.6rem 0'
                        }}>
                          {offer.subtitle}
                        </p>

                        {/* Clean Outline Price Comparison Box */}
                        <div style={{
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border-dark)',
                          borderRadius: '2px',
                          padding: '1.2rem 1.6rem',
                          marginBottom: '1.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1.2rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--text-light-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                              SPECIAL PRIVILEGE OFFER PRICE
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                              <span style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.85rem',
                                fontWeight: 800,
                                color: 'var(--gold-bright)'
                              }}>
                                LKR {offerPrice.toLocaleString()}
                              </span>
                              <span style={{
                                fontSize: '1.05rem',
                                color: 'var(--text-light-muted)',
                                textDecoration: 'line-through',
                                opacity: 0.6
                              }}>
                                LKR {origPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Instant Savings Callout */}
                          <div style={{
                            textAlign: 'right',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--gold-bright)',
                            padding: '6px 12px',
                            borderRadius: '1px'
                          }}>
                            <div style={{ fontSize: '0.64rem', color: 'var(--gold-bright)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                              YOU SAVE TODAY
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-bright)', fontFamily: 'var(--font-display)' }}>
                              LKR {savingsAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Value Highlights */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-light-secondary)' }}>
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
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1.2rem',
                        paddingTop: '1.4rem',
                        borderTop: '1px solid var(--border-dark)'
                      }}>
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
                            padding: '1.05rem 2rem',
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
