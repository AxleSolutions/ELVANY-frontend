import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Home, ArrowLeft, ShoppingBag, Check, Shield, RefreshCw, Truck, Star, ThumbsUp, Zap, Sparkles, Percent, Edit3, X, MessageSquare, ShieldCheck, Bell, Ruler, Camera, Maximize2 } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { RestockRequestModal } from './RestockRequestModal';
import { MobileStickyBuyBar } from './MobileStickyBuyBar';
import { SizeChartModal } from './SizeChartModal';
import { KokoLogo } from './PaymentLogos';
import { cleanSizeCode, isOfferActive as isOfferLive } from '../services/dbService';

export const STANDARD_SIZES_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const sortProductSizes = (sizesList = []) => {
  const cleanList = Array.from(new Set((sizesList || []).map(cleanSizeCode)));
  return cleanList.sort((a, b) => {
    const idxA = STANDARD_SIZES_ORDER.indexOf(a);
    const idxB = STANDARD_SIZES_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
};

/**
 * Intelligent Atelier Recommendation Engine
 * Computes multidimensional compatibility based on category, silhouette,
 * fabric composition, styling pairing, colorway harmony, and customer acclaim.
 */
function getCuratedRecommendations(currentProduct, allProducts = []) {
  if (!currentProduct || !Array.isArray(allProducts) || allProducts.length <= 1) {
    return [];
  }

  // Filter out the current active item and draft/archived records
  const candidates = allProducts.filter((p) => {
    if (!p) return false;
    const isSame = (p.id && currentProduct.id && p.id === currentProduct.id) || 
                   (p.slug && currentProduct.slug && p.slug === currentProduct.slug);
    if (isSame) return false;
    if (p.status === 'Draft' || p.status === 'Archived') return false;
    return true;
  });

  if (candidates.length === 0) return [];

  const getDetailsText = (item) => {
    if (!item) return '';
    if (Array.isArray(item.details)) return item.details.join(' ');
    if (typeof item.details === 'string') return item.details;
    return '';
  };

  const curCategory = (currentProduct.category || '').toLowerCase();
  const curName = (currentProduct.name || currentProduct.title || '').toLowerCase();
  const curColor = (currentProduct.color || '').toLowerCase();
  const curFabric = (currentProduct.fabricProvenance || currentProduct.tagline || getDetailsText(currentProduct) || '').toLowerCase();
  const curPrice = Number(currentProduct.priceLKR || currentProduct.price || currentProduct.base_price_lkr) || 18500;
  const curColorsAvailable = Array.isArray(currentProduct.colorsAvailable) 
    ? currentProduct.colorsAvailable.map(c => String(c).toLowerCase()) 
    : [];

  const scored = candidates.map((p) => {
    let score = 0;
    let reasons = [];

    const pCategory = (p.category || '').toLowerCase();
    const pName = (p.name || p.title || '').toLowerCase();
    const pColor = (p.color || '').toLowerCase();
    const pFabric = (p.fabricProvenance || p.tagline || getDetailsText(p) || '').toLowerCase();
    const pPrice = Number(p.priceLKR || p.price || p.base_price_lkr) || 18500;
    const pColorsAvailable = Array.isArray(p.colorsAvailable) 
      ? p.colorsAvailable.map(c => String(c).toLowerCase()) 
      : [];

    // 1. Same Architectural Category / Pillar (e.g. Heavyweight, Silk-Cotton, Oversized)
    if (curCategory && pCategory && curCategory === pCategory) {
      score += 45;
      const catLabel = curCategory.charAt(0).toUpperCase() + curCategory.slice(1);
      reasons.push(`Same ${catLabel} Pillar`);
    }

    // 2. Complementary Wardrobe Pairing (Tee + Trousers / Overcoat / Leather Accessories)
    const isCurTee = curName.includes('tee') || curName.includes('t-shirt') || curCategory.includes('heavyweight') || curCategory.includes('silk') || curCategory.includes('oversized');
    const isPOuter = pName.includes('coat') || pName.includes('jacket') || pCategory.includes('tailoring');
    const isPTrouser = pName.includes('trouser') || pName.includes('pant') || pName.includes('denim');
    const isPAccessory = pName.includes('duffle') || pName.includes('bag') || pName.includes('belt') || pCategory.includes('accessories');

    if (isCurTee && (isPOuter || isPTrouser || isPAccessory)) {
      score += 35;
      if (isPTrouser) reasons.push('Pairs With Atelier Trousers');
      else if (isPOuter) reasons.push('Layer With Tailoring');
      else if (isPAccessory) reasons.push('Complete The Look');
    }

    // 3. Similar Cut & Silhouette (Drop-shoulder/Oversized vs Tailored Classic)
    const isCurOversized = curName.includes('oversized') || curName.includes('boxy') || curName.includes('drop-shoulder') || curCategory.includes('oversized');
    const isPOversized = pName.includes('oversized') || pName.includes('boxy') || pName.includes('drop-shoulder') || pCategory.includes('oversized');
    if (isCurOversized && isPOversized) {
      score += 25;
      reasons.push('Similar Boxy Silhouette');
    } else if (curName.includes('tailored') && pName.includes('tailored')) {
      score += 25;
      reasons.push('Tailored Sartorial Cut');
    }

    // 4. Fabric Synergy & Textile Pairing (e.g. Combed Cotton, Mulberry Silk, French Terry)
    const fabricTokens = [
      { key: 'french terry', label: 'French Terry' },
      { key: 'jersey', label: 'Classic Jersey' },
      { key: 'knit', label: 'Structured Knit' }
    ];

    for (const token of fabricTokens) {
      if (curFabric.includes(token.key) && pFabric.includes(token.key)) {
        score += 15;
        if (!reasons.some(r => r.includes('Fabric') || r.includes('Woven') || r.includes('Knit'))) {
          reasons.push(`Matching ${token.label}`);
        }
        break;
      }
    }

    // 5. Coordinating Colorway & Shared Palette
    const sharedColors = curColorsAvailable.filter(c => pColorsAvailable.includes(c));
    if (sharedColors.length > 0) {
      score += 15;
      if (reasons.length === 0) reasons.push('Coordinating Colorway');
    }
    if (curColor && pColor && curColor === pColor) {
      score += 10;
      if (reasons.length === 0) reasons.push(`In Matching ${p.color}`);
    }

    // 6. Price Proximity Tier
    const priceDiff = Math.abs(curPrice - pPrice);
    if (priceDiff <= 3000) score += 10;
    else if (priceDiff <= 6000) score += 5;

    // 7. Verified Customer Acclaim
    if (Number(p.rating) >= 4.9) score += 8;

    const primaryReason = reasons[0] || (p.provenanceTag || (p.category ? `${p.category.toUpperCase()} EDITION` : 'ATELIER CURATION'));

    return {
      ...p,
      priceLKR: Number(p.priceLKR || p.price || p.base_price_lkr) || 18500,
      recommendationScore: score,
      recommendationReason: primaryReason
    };
  });

  // Sort by highest compatibility score descending
  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scored.slice(0, 4);
}

class ProductDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('ProductDetailPage error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem',
          backgroundColor: '#f8f6f0',
          color: '#121316'
        }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#121316', marginBottom: '0.8rem' }}>
            Atelier Garment Archive
          </h2>
          <p style={{ color: '#62646c', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.6 }}>
            The requested piece telemetry is refreshing. You may continue exploring our full haute collection or return to the storefront.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/collection" className="btn-primary-gold" style={{ textDecoration: 'none', padding: '0.8rem 1.6rem', fontSize: '0.82rem' }}>
              BROWSE COLLECTION
            </a>
            <a href="/" style={{ textDecoration: 'none', padding: '0.8rem 1.6rem', fontSize: '0.82rem', color: '#8f6f32', border: '1px solid rgba(143, 111, 50, 0.35)', borderRadius: '2px', backgroundColor: '#ffffff' }}>
              RETURN TO HOME
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProductDetailPageInner = ({
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
  const decodedId = id ? decodeURIComponent(id).trim().toLowerCase() : '';
  const product = propProduct || products.find((p) => {
    if (!p) return false;
    return (
      (p.id && String(p.id).toLowerCase() === decodedId) ||
      (p.slug && String(p.slug).toLowerCase() === decodedId) ||
      (p.title && String(p.title).trim().toLowerCase() === decodedId) ||
      (p.name && String(p.name).trim().toLowerCase() === decodedId)
    );
  }) || products[0] || PRODUCTS[0] || {};

  // Check if this product has an active, unexpired promotional offer with units remaining
  const activeOffer = (offers || []).find(o => 
    isOfferLive(o) && (
      (o.productId && (String(o.productId) === String(product?.id) || String(o.productId) === String(product?.slug))) ||
      (o.productName && (product?.title || product?.name) && o.productName.trim().toLowerCase() === (product?.title || product?.name).trim().toLowerCase())
    )
  );

  // Check if this product has a privilege offer whose allocations are 100% claimed
  const claimedOutOffer = !activeOffer ? (offers || []).find(o => 
    o && o.isActive !== false && (
      (o.productId && (String(o.productId) === String(product?.id) || String(o.productId) === String(product?.slug))) ||
      (o.productName && (product?.title || product?.name) && o.productName.trim().toLowerCase() === (product?.title || product?.name).trim().toLowerCase())
    ) && (Number(o.remainingUnits !== undefined ? o.remainingUnits : o.remaining_units) <= 0)
  ) : null;

  const isOfferActive = Boolean(activeOffer);
  const effectivePrice = isOfferActive ? (Number(activeOffer.offerPriceLKR) || 15500) : (Number(product?.priceLKR || product?.price || product?.base_price_lkr) || 18500);
  const originalPrice = isOfferActive ? (Number(activeOffer.originalPriceLKR || product?.originalPriceLKR || product?.priceLKR || product?.base_price_lkr) || 18500) : null;
  const savings = isOfferActive ? Math.max(0, (originalPrice || 0) - (effectivePrice || 0)) : 0;

  const isGarmentOutOfStock = product.status === 'Sold Out' ||
    product.status === 'Archived' ||
    product.status === 'Out of Stock' ||
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.totalStock === 0 ||
    (product.inventory && Object.keys(product.inventory).length > 0 && Object.values(product.inventory).every(v => Number(v) <= 0));

  const sortedSizes = useMemo(() => {
    const rawList = Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : (product?.inventory ? Object.keys(product.inventory) : STANDARD_SIZES_ORDER.slice(0, 6));
    return sortProductSizes(rawList);
  }, [product?.sizes, product?.inventory]);

  const [selectedSize, setSelectedSize] = useState(() => {
    const rawPref = userProfile?.savedSize || localStorage.getItem('elvany_saved_size');
    const preferred = cleanSizeCode(rawPref);
    if (preferred && sortedSizes.includes(preferred)) return preferred;
    return sortedSizes.includes('M') ? 'M' : (sortedSizes[0] || 'M');
  });

  useEffect(() => {
    if (sortedSizes.length > 0 && !sortedSizes.includes(selectedSize)) {
      setSelectedSize(sortedSizes.includes('M') ? 'M' : sortedSizes[0]);
    }
  }, [sortedSizes]);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  
  // Dynamic color palette mapping from product configuration
  const derivedColors = Array.isArray(product?.colors) && product.colors.length > 0
    ? product.colors.map(c => ({
        name: typeof c === 'string' ? c : (c.name || 'Custom Shade'),
        hex: typeof c === 'string' ? '#121316' : (c.hex || '#121316')
      }))
    : Array.isArray(product?.colorsAvailable) && product.colorsAvailable.length > 0
      ? product.colorsAvailable.map((hex, idx) => ({
          name: idx === 0 ? (product.color || 'Primary Shade') : `Tone ${idx + 1}`,
          hex
        }))
      : [{ name: product?.color || 'Onyx Black', hex: product?.colorHex || '#121316' }];

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(derivedColors[0]?.name || product?.color || 'Onyx Black');

  // Keep selectedColor in sync if product changes
  useEffect(() => {
    if (derivedColors.length > 0) {
      const defaultIdx = product?.colors?.findIndex(c => c.isDefault) ?? -1;
      const initialIdx = defaultIdx >= 0 ? defaultIdx : 0;
      setSelectedColorIndex(initialIdx);
      setSelectedColor(derivedColors[initialIdx]?.name || product?.color || 'Onyx Black');
    }
  }, [product?.id, product?.color]);


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
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [localReviews, setLocalReviews] = useState(() => getProductReviews());

  // Keep localReviews synchronized whenever allReviewsMap or product changes
  useEffect(() => {
    const list = getProductReviews();
    setLocalReviews(list);
  }, [allReviewsMap, product?.id, product?.slug, product?.title, product?.name]);

  const isJustAdded = addedItemId === product.id;

  const formatLKR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return 'LKR 0';
    return `LKR ${num.toLocaleString()}`;
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/images/hero_tshirt.webp'];

  const handleHelpfulClick = (revId) => {
    if (helpfulMap[revId]) return;
    setHelpfulMap((prev) => ({ ...prev, [revId]: true }));
    setLocalReviews((prev) =>
      prev.map((r) =>
        r.id === revId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
  };

  // Multidimensional Intelligent Atelier Recommendation Algorithm
  const relatedProducts = useMemo(() => {
    const pool = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;
    return getCuratedRecommendations(product, pool);
  }, [product?.id, product?.category, product?.fabricProvenance, product?.name, product?.color, products]);

  const averageRating = localReviews.length > 0
    ? (localReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / localReviews.length).toFixed(1)
    : null;
  const totalReviewsCount = localReviews.length;

  const selectedSizeStock = (product?.inventory && product?.inventory[selectedSize] !== undefined)
    ? Number(product.inventory[selectedSize])
    : (product?.totalStock || 10);

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
              <Home size={14} color="#8f6f32" />
              <span>HOME</span>
            </button>
            <span style={{ color: '#b8b4ab' }}>/</span>
            <button 
              onClick={onBackToCollection}
              style={{ background: 'none', border: 'none', color: '#4a4c54', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 500 }}
            >
              COLLECTION
            </button>
            <span style={{ color: '#b8b4ab' }}>/</span>
            <span style={{ color: '#8f6f32', letterSpacing: '0.06em', fontWeight: 600 }}>{product.name}</span>
          </div>

          <button 
            className="search-back-btn"
            onClick={onBackToCollection}
            style={{ marginBottom: 0 }}
          >
            <ArrowLeft size={14} color="#8f6f32" />
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
                key={images[activeImageIndex] || activeImageIndex}
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="pdp-main-img" 
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              {isGarmentOutOfStock ? (
                <span className="pdp-badge-overlay" style={{ backgroundColor: 'rgba(239,68,68,0.9)', color: '#ffffff', border: '1px solid #ef4444' }}>
                  SOLD OUT
                </span>
              ) : (
                product.provenanceTag && <span className="pdp-badge-overlay">{product.provenanceTag}</span>
              )}

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
                    <img src={img} alt={`View ${idx + 1}`} loading="eager" decoding="async" />
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

            {/* 100% Claimed Out Privilege Drop Banner */}
            {claimedOutOffer && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '6px 14px',
                borderRadius: '2px',
                color: '#f87171',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.2rem'
              }}>
                <Flame size={14} color="#ef4444" />
                <span>PRIVILEGE ALLOCATION 100% CLAIMED • REGULAR ATELIER STOCK AVAILABLE</span>
              </div>
            )}

            <div className="pdp-tagline">FLORENTINE SARTORIAL KNITWEAR</div>
            <h1 className="pdp-title">{product.name}</h1>
            
            {/* Star Rating Summary Header */}
            {totalReviewsCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', color: '#8f6f32', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < Math.round(Number(averageRating || 5)) ? "#8f6f32" : "none"}
                      color="#8f6f32"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.84rem', color: '#121316', fontWeight: 700 }}>{averageRating}</span>
                <span style={{ fontSize: '0.78rem', color: '#767982' }}>
                  ({totalReviewsCount} Verified Client {totalReviewsCount === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#767982', letterSpacing: '0.04em' }}>
                  No client reviews yet
                </span>
              </div>
            )}


            {/* Price Row (Offers Support) */}
            <div className="pdp-price-row" style={{ alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="pdp-price" style={{ color: '#8f6f32' }}>
                {formatLKR(effectivePrice)}
              </span>
              
              {isOfferActive && originalPrice && (
                <span style={{ fontSize: '1.15rem', color: '#767982', textDecoration: 'line-through', opacity: 0.7 }}>
                  {formatLKR(originalPrice)}
                </span>
              )}

              {isOfferActive && (
                <span style={{
                  fontSize: '0.74rem',
                  backgroundColor: '#8f6f32',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  letterSpacing: '0.08em'
                }}>
                  SAVE LKR {savings.toLocaleString()}
                </span>
              )}

              <span className="pdp-vat-tag">INCL. TAXES</span>
            </div>

            {/* Koko BNPL 3-Instalment Teaser */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '2px 0',
              fontSize: '0.76rem',
              color: '#4a4c54',
              marginBottom: '1.2rem'
            }}>
              <Sparkles size={12} color="#8f6f32" />
              <span>or 3 instalments of <strong style={{ color: '#8f6f32' }}>LKR {Math.round((effectivePrice * 1.12) / 3).toLocaleString()}</strong> with</span>
              <KokoLogo style={{ padding: '1px 5px', height: '18px' }} imgStyle={{ height: '14px' }} />
            </div>

            <p className="pdp-description">
              {product.tagline || 'Essential everyday tee'}. Knitted with tightly spun resilient yarns to produce an opaque, structured fabric that drapes cleanly and holds its collar shape.
            </p>

            <div className="pdp-divider" />

            {/* Color Selector (Working Selection on All Dots) */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div className="pdp-label-row">
                <span className="pdp-label">COLORWAY</span>
                <span className="pdp-selected-val">{selectedColor}</span>
              </div>
              <div className="color-dots" style={{ gap: '0.8rem', display: 'flex', alignItems: 'center' }}>
                {derivedColors.map((col, idx) => {
                  const isSelected = selectedColorIndex === idx;

                  return (
                    <button 
                      key={`${col.hex}-${idx}`} 
                      type="button"
                      className="color-dot" 
                      style={{ 
                        backgroundColor: col.hex,
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: 'none',
                        outline: isSelected ? '2px solid #8f6f32' : '1px solid #dcd7ce',
                        outlineOffset: '3px',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        padding: 0
                      }} 
                      onClick={() => {
                        setSelectedColorIndex(idx);
                        setSelectedColor(col.name);
                      }}
                      title={`${col.name} (${col.hex})`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector with Live Stock Badges */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="pdp-label-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="pdp-label">SELECT SIZE</span>
                  <button 
                    type="button" 
                    onClick={() => setIsSizeChartOpen(true)}
                    className="pdp-size-guide-btn"
                    title="Open Official Sizing Chart"
                  >
                    <Ruler size={12} />
                    <span>SIZE CHART</span>
                  </button>
                </div>
                {(() => {
                  if (isGarmentOutOfStock) {
                    return <span style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 700 }}>Currently Sold Out / Out of Stock</span>;
                  }
                  const selectedSizeStock = (product.inventory && product.inventory[selectedSize] !== undefined)
                    ? Number(product.inventory[selectedSize])
                    : 0;

                  if (selectedSizeStock <= 0) {
                    return <span style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600 }}>Size {selectedSize} Sold Out</span>;
                  }
                  if (selectedSizeStock <= 3) {
                    return <span style={{ color: '#8f6f32', fontSize: '0.74rem', fontWeight: 700 }}>Only {selectedSizeStock} piece{selectedSizeStock > 1 ? 's' : ''} left in stock!</span>;
                  }
                  return <span style={{ color: '#767982', fontSize: '0.74rem' }}>{selectedSizeStock} available</span>;
                })()}
              </div>

              <div className="pdp-sizes-grid">
                {sortedSizes.map((s) => {
                  const sStock = isGarmentOutOfStock ? 0 : ((product.inventory && product.inventory[s] !== undefined)
                    ? Number(product.inventory[s])
                    : 0);
                  const isSoldOut = isGarmentOutOfStock || sStock <= 0;

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
                      title={isSoldOut ? `Size ${s} is Sold Out` : `Size ${s} (${sStock} available)`}
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
              const selectedSizeStock = isGarmentOutOfStock ? 0 : ((product.inventory && product.inventory[selectedSize] !== undefined)
                ? Number(product.inventory[selectedSize])
                : 0);
              const isAvailable = !isGarmentOutOfStock && selectedSizeStock > 0;

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
                        isOfferApplied: true,
                        offerCode: activeOffer?.code
                      } : {
                        ...product,
                        priceLKR: effectivePrice,
                        color: selectedColor,
                        isOfferApplied: false
                      };
                      const addQty = Math.min(qty, selectedSizeStock);
                      onAddToCart(productToAdd, selectedSize, addQty);
                    }}
                    style={{
                      opacity: 1,
                      cursor: 'pointer',
                      backgroundColor: !isAvailable ? 'rgba(143, 111, 50, 0.12)' : undefined,
                      border: !isAvailable ? '1px solid #8f6f32' : undefined,
                      color: !isAvailable ? '#8f6f32' : undefined
                    }}
                  >
                    {!isAvailable ? (
                      <>
                        <Bell size={18} />
                        <span>REQUEST RE-ISSUE (SOLD OUT)</span>
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
                <Truck size={18} color="#8f6f32" />
                <div>
                  <div className="pdp-trust-title">Island-Wide Express</div>
                  <div className="pdp-trust-desc">Complimentary next-day dispatch</div>
                </div>
              </div>
              <div className="pdp-trust-item">
                <RefreshCw size={18} color="#8f6f32" />
                <div>
                  <div className="pdp-trust-title">7-Day Fit Guarantee</div>
                  <div className="pdp-trust-desc">Complimentary size exchanges</div>
                </div>
              </div>
              <div className="pdp-trust-item">
                <Shield size={18} color="#8f6f32" />
                <div>
                  <div className="pdp-trust-title">Atelier Certified</div>
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
                  <span className="spec-value">{product.fabricProvenance || product.composition || product.fabric || product.fabric_composition || 'Durable Comfort Knit Blend'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Fabric Weight / Density:</span>
                  <span className="spec-value">{product.density || (product.gsm ? `${product.gsm} GSM` : (product.weight || product.fabric_weight)) || '240 GSM'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Provenance / Origin:</span>
                  <span className="spec-value">{product.origin || (Array.isArray(product.craftsmanship_details) ? product.craftsmanship_details[2] : null) || 'Sri Lanka Atelier'}</span>
                </div>
              </div>
            )}

            {activeTab === 'silhouette' && (
              <div className="pdp-tab-pane">
                <div className="spec-row">
                  <span className="spec-label">Silhouette Structure:</span>
                  <span className="spec-value">{product.silhouette || product.fit || (Array.isArray(product.craftsmanship_details) ? product.craftsmanship_details[1] : null) || 'Tailored Regular Fit'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Collar Construction:</span>
                  <span className="spec-value">{product.collarSpec || (Array.isArray(product.craftsmanship_details) ? product.craftsmanship_details[0] : null) || 'Double-needle non-sag 1x1 ribbing'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Hem & Finish:</span>
                  <span className="spec-value">{product.hemSpec || 'Reinforced precision hem stitch'}</span>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="pdp-tab-pane">
                {Array.isArray(product.care) && product.care.length > 0 ? (
                  product.care.map((item, idx) => (
                    <div key={idx} className="spec-row">
                      <span className="spec-label">Care Guidance {idx + 1}:</span>
                      <span className="spec-value">{item}</span>
                    </div>
                  ))
                ) : Array.isArray(product.care_instructions) && product.care_instructions.length > 0 ? (
                  product.care_instructions.map((item, idx) => (
                    <div key={idx} className="spec-row">
                      <span className="spec-label">Care Guidance {idx + 1}:</span>
                      <span className="spec-value">{item}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="spec-row">
                      <span className="spec-label">Washing Guidance:</span>
                      <span className="spec-value">Machine wash cold (30°C) with like dark colors. Do not bleach.</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Drying & Longevity:</span>
                      <span className="spec-value">Flat dry in shade to preserve fabric elasticity and color depth. Cool iron if needed.</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp-tab-pane">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#121316', margin: '0 0 0.2rem 0' }}>
                      Client Evaluations & Fit Telemetry
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#62646c', margin: 0 }}>
                      Verified feedback recorded by patrons upon parcel delivery.
                    </p>
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(143, 111, 50, 0.08)',
                    border: '1px solid rgba(143, 111, 50, 0.25)',
                    fontSize: '0.72rem',
                    color: '#8f6f32',
                    fontWeight: 600
                  }}>
                    <ShieldCheck size={13} color="#8f6f32" />
                    <span>VERIFIED PURCHASERS ONLY</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  {localReviews.length === 0 ? (
                    <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #e2ddd5', borderRadius: '4px' }}>
                      <ShieldCheck size={28} color="#8f6f32" style={{ margin: '0 auto 0.8rem auto' }} />
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#121316', marginBottom: '0.4rem', fontWeight: 500 }}>
                        No client evaluations yet
                      </h4>
                      <p style={{ color: '#62646c', fontSize: '0.84rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                        Client evaluations are unlocked exclusively for patrons upon successful courier parcel delivery.
                      </p>
                    </div>
                  ) : (

                    localReviews.map((rev) => (
                      <div 
                        key={rev.id} 
                        style={{
                          border: '1px solid #e2ddd5',
                          padding: '1.6rem',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', color: '#8f6f32', gap: '2px' }}>
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} size={14} fill="#8f6f32" color="#8f6f32" />
                              ))}
                            </div>
                            <strong style={{ color: '#121316', fontSize: '0.95rem' }}>{rev.author || rev.clientName || rev.customerName || 'Verified Client'}</strong>
                            <span style={{ fontSize: '0.68rem', color: '#8f6f32', backgroundColor: 'rgba(143, 111, 50, 0.08)', border: '1px solid rgba(143, 111, 50, 0.25)', padding: '1px 6px', borderRadius: '2px', fontWeight: 600 }}>
                              ✓ Verified Buyer
                            </span>
                          </div>

                          <span style={{ fontSize: '0.76rem', color: '#767982' }}>{rev.date || 'Recently'}</span>
                        </div>

                        {rev.title && (
                          <h4 style={{ color: '#121316', fontSize: '1.05rem', fontWeight: 500, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)' }}>
                            {rev.title}
                          </h4>
                        )}

                        <p style={{ fontSize: '0.9rem', color: '#4a4c54', lineHeight: 1.65, margin: '0 0 0.8rem 0' }}>
                          "{rev.content || rev.comment}"
                        </p>

                        {/* Verified Client Garment Photos */}
                        {(() => {
                          const reviewPhotos = Array.isArray(rev.images) && rev.images.length > 0
                            ? rev.images
                            : (rev.imageUrl ? [rev.imageUrl] : []);
                          if (reviewPhotos.length === 0) return null;

                          return (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0.6rem 0 1rem 0' }}>
                              {reviewPhotos.map((photoUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setActivePhotoModal(photoUrl)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid #e2ddd5',
                                    padding: 0,
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    width: '80px',
                                    height: '80px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                  }}
                                  title="Click to view full garment photo"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={`Client photo ${pIdx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '3px',
                                    right: '3px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: '2px',
                                    padding: '2px 4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    <Maximize2 size={9} color="#ffffff" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          );
                        })()}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.6rem', borderTop: '1px solid #f0ede6' }}>
                          <span style={{ fontSize: '0.72rem', color: '#62646c' }}>
                            Fit: <span style={{ color: '#8f6f32', fontWeight: 600 }}>{rev.fitRating || 'True to Atelier Boxy Spec'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleHelpfulClick(rev.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: helpfulMap[rev.id] ? '#8f6f32' : '#62646c',
                              cursor: helpfulMap[rev.id] ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.76rem',
                              fontWeight: 500
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
        <div style={{ marginTop: '5.5rem', paddingTop: '3.5rem', borderTop: '1px solid #e2ddd5' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              fontSize: '0.74rem',
              color: '#8f6f32',
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
              color: '#121316',
              fontWeight: 400,
              margin: 0
            }}>
              You May Also Appreciate
            </h3>
          </div>

          <div className="pdp-related-grid">
            {relatedProducts.map((rp) => (
              <article 
                key={rp.id}
                onClick={() => onSelectProduct(rp)}
                className="pdp-related-card"
              >
                <div className="pdp-related-img-wrap">
                  <img 
                    src={rp.image} 
                    alt={rp.name} 
                    loading="eager"
                    decoding="async"
                    className="pdp-related-img"
                  />
                  {(rp.recommendationReason || rp.provenanceTag) && (
                    <span className="pdp-related-badge">
                      {rp.recommendationReason || rp.provenanceTag}
                    </span>
                  )}
                </div>

                <div className="pdp-related-body">
                  <div className="pdp-related-header">
                    <h4 className="pdp-related-title">
                      {rp.name}
                    </h4>
                    <span className="pdp-related-price">
                      {formatLKR(rp.priceLKR)}
                    </span>
                  </div>
                  <p className="pdp-related-tagline">
                    {rp.tagline}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />

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

      {/* Sticky Mobile Add To Shopping Bag Bar (Pinned to bottom on mobile only) */}
      <MobileStickyBuyBar
        product={product}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        selectedColor={selectedColor}
        qty={qty}
        setQty={setQty}
        effectivePrice={effectivePrice}
        originalPrice={originalPrice}
        isOfferActive={isOfferActive}
        savings={savings}
        isJustAdded={isJustAdded}
        onAddToCart={onAddToCart}
        onOpenRestockModal={() => setIsRestockModalOpen(true)}
        selectedSizeStock={selectedSizeStock}
      />

      {/* Full-Screen Client Photo Lightbox Modal */}
      {activePhotoModal && (
        <div 
          onClick={() => setActivePhotoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--gold-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
            }}
          >
            <button
              type="button"
              onClick={() => setActivePhotoModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Close image"
            >
              <X size={18} />
            </button>

            <img 
              src={activePhotoModal} 
              alt="Client Garment Review High-Resolution" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '85vh', 
                objectFit: 'contain',
                display: 'block' 
              }} 
            />

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(9, 10, 12, 0.88)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.6rem 1rem',
              fontSize: '0.76rem',
              color: 'var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Camera size={13} />
              <span>Verified Client Garment Photo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductDetailPage = (props) => (
  <ProductDetailErrorBoundary>
    <ProductDetailPageInner {...props} />
  </ProductDetailErrorBoundary>
);




