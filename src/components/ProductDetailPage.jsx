import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Home, ArrowLeft, ShoppingBag, Check, Shield, RefreshCw, Truck, Star, ThumbsUp, Zap, Sparkles, Percent, Edit3, X, MessageSquare, ShieldCheck, Bell } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { RestockRequestModal } from './RestockRequestModal';

export const ProductDetailPage = ({
  products = PRODUCTS,
  product: propProduct,
  offers = [],
  allReviewsMap = {},
  userProfile,
  loggedInUser,
  onAddNewReview,
  onBackToCollection,
  onBackToHome,
  onSelectProduct,
  onAddToCart,
  addedItemId
}) => {
  const { id } = useParams();
  const product = propProduct || products.find((p) => p.id === id || p.slug === id) || products[0] || PRODUCTS[0] || {};

  // Check if this product has an active promotional offer
  const activeOffer = offers.find(o => o.isActive && o.productId === product?.id);
  const isOfferActive = !!activeOffer;
  const effectivePrice = isOfferActive ? activeOffer.offerPriceLKR : (product?.priceLKR || 18500);
  const originalPrice = isOfferActive ? (activeOffer.originalPriceLKR || product?.priceLKR || 18500) : null;
  const savings = isOfferActive ? (originalPrice - effectivePrice) : 0;

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[1] || product?.sizes?.[0] || 'M (40)');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  
  // Dynamic color palette mapping
  const colorNames = [
    product?.color || 'Onyx Black',
    product?.color === 'Onyx Black' ? 'Florentine White' : 'Onyx Black',
    'Raw Ecru Melange',
    'Vintage Navy',
    'Espresso'
  ];
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.color || 'Onyx Black');


  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('fabric');

  // Customer Reviews List (combining static reviews with dynamically submitted reviews)
  const getProductReviews = () => {
    if (!product) return [];
    const list = allReviewsMap[product.id] || 
                 (product.slug && allReviewsMap[product.slug]) || 
                 (product.title && allReviewsMap[product.title]) || 
                 (product.name && allReviewsMap[product.name]) ||
                 product.reviews || 
                 [];
    return list;
  };

  const [helpfulMap, setHelpfulMap] = useState({});
  const [localReviews, setLocalReviews] = useState(() => getProductReviews());

  // Keep localReviews synchronized whenever allReviewsMap or product changes
  useEffect(() => {
    const list = getProductReviews();
    setLocalReviews(list);
  }, [allReviewsMap, product?.id, product?.slug, product?.title, product?.name]);

  const isJustAdded = addedItemId === product.id;

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/images/hero_tshirt.jpg'];

  const handleHelpfulClick = (revId) => {
    if (helpfulMap[revId]) return;
    setHelpfulMap((prev) => ({ ...prev, [revId]: true }));
    setLocalReviews((prev) =>
      prev.map((r) =>
        r.id === revId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
  };

  const relatedProducts = (products.length > 0 ? products : PRODUCTS)
    .filter((p) => p.id !== product.id && p.status !== 'Draft' && p.status !== 'Archived')
    .slice(0, 3);

  const averageRating = localReviews.length > 0
    ? (localReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / localReviews.length).toFixed(1)
    : null;
  const totalReviewsCount = localReviews.length;




  return (
    <div className="product-detail-page">
      {/* Top Breadcrumb Navigation */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
            <button 
              className="search-back-btn"
              onClick={onBackToHome}
              style={{ marginBottom: 0 }}
            >
              <Home size={14} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <button 
              onClick={onBackToCollection}
              style={{ background: 'none', border: 'none', color: 'var(--text-light-secondary)', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.08em' }}
            >
              COLLECTION
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-bright)', letterSpacing: '0.06em' }}>{product.name}</span>
          </div>

          <button 
            className="search-back-btn"
            onClick={onBackToCollection}
            style={{ marginBottom: 0 }}
          >
            <ArrowLeft size={14} />
            <span>BACK TO COLLECTION</span>
          </button>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <div className="pdp-grid">
          
          {/* Left Column: Gallery */}
          <div className="pdp-gallery-column">
            <div className="pdp-main-image-wrap">
              <img 
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="pdp-main-img" 
              />
              <span className="pdp-badge-overlay">{product.provenanceTag}</span>

              {isOfferActive && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  backgroundColor: 'var(--gold-bright)',
                  color: '#000000',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}>
                  <Zap size={13} fill="#000000" color="#000000" />
                  <span>SPECIAL ATELIER PRIVILEGE APPLIED</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="pdp-thumbnails-strip">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`pdp-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Purchase Box */}
          <div className="pdp-buybox-column">
            
            {/* Inverted Gold Active Promotional Offer Banner */}
            {isOfferActive && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--gold-bright)',
                border: '1px solid var(--gold-bright)',
                padding: '6px 14px',
                borderRadius: '2px',
                color: '#000000',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem'
              }}>
                <Zap size={14} fill="#000000" color="#000000" />
                <span>SPECIAL ATELIER PRIVILEGE: SAVE LKR {savings.toLocaleString()}</span>
              </div>
            )}

            <div className="pdp-tagline">FLORENTINE SARTORIAL KNITWEAR</div>
            <h1 className="pdp-title">{product.name}</h1>
            
            {/* Star Rating Summary Header */}
            {totalReviewsCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', color: 'var(--gold-bright)', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < Math.round(Number(averageRating || 5)) ? "var(--gold-bright)" : "none"}
                      color="var(--gold-bright)"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>{averageRating}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
                  ({totalReviewsCount} Verified Client {totalReviewsCount === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)', letterSpacing: '0.04em' }}>
                  No client reviews yet
                </span>
              </div>
            )}


            {/* Price Row (Offers Support) */}
            <div className="pdp-price-row" style={{ alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="pdp-price" style={{ color: 'var(--gold-bright)' }}>
                {formatLKR(effectivePrice)}
              </span>
              
              {isOfferActive && originalPrice && (
                <span style={{ fontSize: '1.15rem', color: 'var(--text-light-muted)', textDecoration: 'line-through', opacity: 0.6 }}>
                  {formatLKR(originalPrice)}
                </span>
              )}

              {isOfferActive && (
                <span style={{
                  fontSize: '0.74rem',
                  backgroundColor: 'var(--gold-bright)',
                  color: '#000000',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  letterSpacing: '0.08em'
                }}>
                  SAVE LKR {savings.toLocaleString()}
                </span>
              )}

              <span className="pdp-vat-tag">INCL. TAXES & COMPLIMENTARY COURIER</span>
            </div>

            <p className="pdp-description">
              {product.tagline}. Knitted with tightly spun long-staple combed cotton yarns to produce an opaque, structured fabric that drapes cleanly and never loses its collar shape.
            </p>

            <div className="pdp-divider" />

            {/* Color Selector (Working Selection on All Dots) */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div className="pdp-label-row">
                <span className="pdp-label">COLORWAY</span>
                <span className="pdp-selected-val">{selectedColor}</span>
              </div>
              <div className="color-dots" style={{ gap: '0.8rem', display: 'flex', alignItems: 'center' }}>
                {(product.colorsAvailable || (product.colors ? product.colors.map(c => c.hex) : ['#141518'])).map((hex, idx) => {
                  const isSelected = selectedColorIndex === idx;

                  return (
                    <button 
                      key={idx} 
                      type="button"
                      className="color-dot" 
                      style={{ 
                        backgroundColor: hex,
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: 'none',
                        outline: isSelected ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.25)',
                        outlineOffset: '3px',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        padding: 0
                      }} 
                      onClick={() => {
                        setSelectedColorIndex(idx);
                        setSelectedColor(colorNames[idx] || (idx === 0 ? product.color : `Tone ${idx + 1}`));
                      }}
                      title={colorNames[idx] || `Color ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector with Live Stock Badges */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="pdp-label-row">
                <span className="pdp-label">SELECT SIZE</span>
                {(() => {
                  const selectedSizeStock = (product.inventory && product.inventory[selectedSize] !== undefined)
                    ? Number(product.inventory[selectedSize])
                    : (product.totalStock || 10);

                  if (selectedSizeStock <= 0) {
                    return <span style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600 }}>Currently Sold Out</span>;
                  }
                  if (selectedSizeStock <= 3) {
                    return <span style={{ color: 'var(--gold-bright)', fontSize: '0.74rem', fontWeight: 700 }}>Only {selectedSizeStock} piece{selectedSizeStock > 1 ? 's' : ''} left in stock!</span>;
                  }
                  return <span style={{ color: 'var(--text-light-muted)', fontSize: '0.74rem' }}>{selectedSizeStock} available</span>;
                })()}
              </div>

              <div className="pdp-sizes-grid">
                {product.sizes.map((s) => {
                  const sStock = (product.inventory && product.inventory[s] !== undefined)
                    ? Number(product.inventory[s])
                    : (product.totalStock || 10);
                  const isSoldOut = sStock <= 0;

                  return (
                    <button
                      key={s}
                      disabled={isSoldOut}
                      className={`pdp-size-btn ${selectedSize === s ? 'active' : ''} ${isSoldOut ? 'sold-out' : ''}`}
                      onClick={() => {
                        setSelectedSize(s);
                        setQty(1);
                      }}
                      style={{
                        position: 'relative',
                        opacity: isSoldOut ? 0.35 : 1,
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        textDecoration: isSoldOut ? 'line-through' : 'none'
                      }}
                      title={isSoldOut ? `${s} is Sold Out` : `${s} (${sStock} in stock)`}
                    >
                      <span>{s}</span>
                      {sStock > 0 && sStock <= 2 && (
                        <span style={{ position: 'absolute', top: '-6px', right: '-4px', backgroundColor: 'var(--gold-bright)', color: '#000', fontSize: '8px', fontWeight: 800, padding: '1px 4px', borderRadius: '2px', lineHeight: '1' }}>
                          {sStock}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Add to Bag with Stock Enforcement */}
            {(() => {
              const selectedSizeStock = (product.inventory && product.inventory[selectedSize] !== undefined)
                ? Number(product.inventory[selectedSize])
                : (product.totalStock || 10);
              const isAvailable = selectedSizeStock > 0;

              return (
                <div className="pdp-actions-row">
                  <div className="pdp-qty-selector" style={{ opacity: isAvailable ? 1 : 0.4 }}>
                    <button 
                      type="button" 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="pdp-qty-btn"
                      disabled={!isAvailable || qty <= 1}
                    >
                      -
                    </button>
                    <span className="pdp-qty-value">{isAvailable ? Math.min(qty, selectedSizeStock) : 0}</span>
                    <button 
                      type="button" 
                      onClick={() => setQty(Math.min(selectedSizeStock, qty + 1))}
                      className="pdp-qty-btn"
                      disabled={!isAvailable || qty >= selectedSizeStock}
                      title={qty >= selectedSizeStock ? `Maximum stock reached (${selectedSizeStock} available)` : 'Add one more'}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`btn-primary-gold pdp-add-btn ${isJustAdded ? 'added' : ''}`}
                    onClick={(e) => {
                      if (!isAvailable) {
                        e.preventDefault();
                        setIsRestockModalOpen(true);
                        return;
                      }
                      const productToAdd = isOfferActive ? {
                        ...product,
                        priceLKR: effectivePrice,
                        originalPriceLKR: originalPrice,
                        color: selectedColor,
                        isOfferApplied: true
                      } : {
                        ...product,
                        color: selectedColor
                      };
                      const addQty = Math.min(qty, selectedSizeStock);
                      onAddToCart(productToAdd, selectedSize, addQty);
                    }}
                    style={{
                      opacity: 1,
                      cursor: 'pointer',
                      backgroundColor: !isAvailable ? 'rgba(197, 160, 89, 0.15)' : undefined,
                      border: !isAvailable ? '1px solid var(--gold-bright)' : undefined,
                      color: !isAvailable ? 'var(--gold-bright)' : undefined
                    }}
                  >
                    {!isAvailable ? (
                      <>
                        <Bell size={18} />
                        <span>REQUEST RE-ISSUE</span>
                      </>
                    ) : isJustAdded ? (
                      <>
                        <Check size={18} />
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>{isOfferActive ? `ADD WITH LKR ${savings.toLocaleString()} PRIVILEGE` : 'ADD TO SHOPPING BAG'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}





            {/* Trust Badges */}
            <div className="pdp-trust-grid">
              <div className="pdp-trust-item">
                <Truck size={18} color="var(--gold-bright)" />
                <div>
                  <div className="pdp-trust-title">Island-Wide Express</div>
                  <div className="pdp-trust-desc">Complimentary next-day dispatch</div>
                </div>
              </div>
              <div className="pdp-trust-item">
                <RefreshCw size={18} color="var(--gold-bright)" />
                <div>
                  <div className="pdp-trust-title">7-Day Fit Guarantee</div>
                  <div className="pdp-trust-desc">Complimentary size exchanges</div>
                </div>
              </div>
              <div className="pdp-trust-item">
                <Shield size={18} color="var(--gold-bright)" />
                <div>
                  <div className="pdp-trust-title">Maison Certified</div>
                  <div className="pdp-trust-desc">Includes QR provenance passport</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Technical Specifications Tabs */}
        <div className="pdp-tabs-section">
          <div className="pdp-tabs-header">
            <button 
              className={`pdp-tab-btn ${activeTab === 'fabric' ? 'active' : ''}`}
              onClick={() => setActiveTab('fabric')}
            >
              FABRIC PROVENANCE & WEIGHT
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'silhouette' ? 'active' : ''}`}
              onClick={() => setActiveTab('silhouette')}
            >
              SILHOUETTE ARCHITECTURE
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
              onClick={() => setActiveTab('care')}
            >
              CARE & LONGEVITY
            </button>
            <button 
              className={`pdp-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              CLIENT REVIEWS ({totalReviewsCount})
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'fabric' && (
              <div className="pdp-tab-pane">
                <div className="spec-row">
                  <span className="spec-label">Fabric Composition:</span>
                  <span className="spec-value">{product.fabricProvenance}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Fabric Weight / Density:</span>
                  <span className="spec-value">{product.density}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Provenance / Origin:</span>
                  <span className="spec-value">Florentine Sartorial Mills, Italy</span>
                </div>
              </div>
            )}

            {activeTab === 'silhouette' && (
              <div className="pdp-tab-pane">
                <div className="spec-row">
                  <span className="spec-label">Silhouette Structure:</span>
                  <span className="spec-value">{product.silhouette}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Collar Construction:</span>
                  <span className="spec-value">Reinforced 1x1 Ribbed Collar (Zero deformation after wash cycles)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Hem & Finish:</span>
                  <span className="spec-value">Blind-stitched edge with signature gold bullion atelier thread</span>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="pdp-tab-pane">
                <div className="spec-row">
                  <span className="spec-label">Washing Guidance:</span>
                  <span className="spec-value">Machine wash cold (30°C) with like dark colors. Do not bleach.</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Drying:</span>
                  <span className="spec-value">Flat dry in shade to preserve cotton staple elasticity.</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp-tab-pane">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', margin: '0 0 0.2rem 0' }}>
                      Client Evaluations & Fit Telemetry
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)', margin: 0 }}>
                      Verified feedback recorded by patrons upon parcel delivery.
                    </p>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(197, 160, 89, 0.08)',
                    border: '1px solid var(--gold-border)',
                    fontSize: '0.72rem',
                    color: 'var(--gold-bright)',
                    fontWeight: 600
                  }}>
                    <ShieldCheck size={13} />
                    <span>VERIFIED PURCHASERS ONLY</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  {localReviews.length === 0 ? (
                    <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#0d0e12', border: '1px solid var(--border-dark)', borderRadius: '2px' }}>
                      <ShieldCheck size={28} color="var(--gold-bright)" style={{ margin: '0 auto 0.8rem auto' }} />
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem', fontWeight: 400 }}>
                        No client evaluations yet
                      </h4>
                      <p style={{ color: 'var(--text-light-muted)', fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                        Client evaluations are unlocked exclusively for patrons upon successful courier parcel delivery.
                      </p>
                    </div>
                  ) : (

                    localReviews.map((rev) => (
                      <div 
                        key={rev.id} 
                        style={{
                          border: '1px solid var(--border-dark)',
                          padding: '1.6rem',
                          borderRadius: '2px',
                          backgroundColor: '#0d0e12'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', color: 'var(--gold-bright)', gap: '2px' }}>
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} size={14} fill="var(--gold-bright)" color="var(--gold-bright)" />
                              ))}
                            </div>
                            <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>{rev.author || rev.clientName || rev.customerName || 'Verified Client'}</strong>
                            <span style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', backgroundColor: 'rgba(197, 160, 89, 0.12)', border: '1px solid var(--gold-border)', padding: '1px 6px', borderRadius: '1px' }}>
                              ✓ Verified Buyer
                            </span>
                          </div>

                          <span style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)' }}>{rev.date || 'Recently'}</span>
                        </div>

                        {rev.title && (
                          <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: 500, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
                            {rev.title}
                          </h4>
                        )}

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light-secondary)', lineHeight: 1.65, margin: '0 0 1rem 0' }}>
                          "{rev.content || rev.comment}"
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                            Fit: <span style={{ color: 'var(--gold-bright)' }}>{rev.fitRating || 'True to Atelier Boxy Spec'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleHelpfulClick(rev.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: helpfulMap[rev.id] ? 'var(--gold-bright)' : 'var(--text-light-muted)',
                              cursor: helpfulMap[rev.id] ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem'
                            }}
                          >
                            <ThumbsUp size={13} />
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Complementary Silhouettes (Suggested Pieces) */}
        <div style={{ marginTop: '5.5rem', paddingTop: '3.5rem', borderTop: '1px solid var(--border-dark)' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              fontSize: '0.74rem',
              color: 'var(--gold-bright)',
              letterSpacing: '0.22em',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.6rem'
            }}>
              COMPLEMENTARY SILHOUETTES
            </div>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
              color: '#ffffff',
              fontWeight: 400,
              margin: 0
            }}>
              You May Also Appreciate
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {relatedProducts.map((rp) => (
              <article 
                key={rp.id}
                onClick={() => onSelectProduct(rp)}
                style={{
                  backgroundColor: '#0d0e12',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.25s ease, transform 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-bright)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-dark)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', backgroundColor: '#07080a', overflow: 'hidden' }}>
                  <img 
                    src={rp.image} 
                    alt={rp.name} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top'
                    }}
                  />
                  {rp.provenanceTag && (
                    <span style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(7, 8, 10, 0.9)',
                      border: '1px solid var(--border-dark)',
                      color: 'var(--gold-bright)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      padding: '4px 8px',
                      borderRadius: '1px',
                      textTransform: 'uppercase'
                    }}>
                      {rp.provenanceTag}
                    </span>
                  )}
                </div>

                <div style={{ padding: '1.4rem 1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <h4 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      margin: 0
                    }}>
                      {rp.name}
                    </h4>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--gold-bright)'
                    }}>
                      {formatLKR(rp.priceLKR)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-light-muted)',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {rp.tagline}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>

      {/* Atelier Garment Re-Issue Request Modal */}
      <RestockRequestModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        loggedInUser={loggedInUser}
        userProfile={userProfile}
      />
    </div>
  );
};




