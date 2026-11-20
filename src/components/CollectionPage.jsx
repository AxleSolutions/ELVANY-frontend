import React, { useState, useMemo, useRef } from 'react';
import { Home, Eye, ShoppingBag, Check, Ruler, Bell } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { getAllCategories, slugifyCategory, formatCategoryKey, formatCategoryLabel } from '../services/categoryService';
import { isOfferActive } from '../services/dbService';

export const CollectionPage = ({
  products = [],
  offers = [],
  isLoading = false,
  loggedInUser,
  userProfile,
  initialCategory = 'all',
  onBackToHome,
  onSelectProduct,
  onOpenQuickView,
  onAddToCart,
  addedItemId
}) => {
  const isLoggedIn = Boolean(loggedInUser || userProfile?.email);
  const rawProfileSize = userProfile?.savedSize || localStorage.getItem('elvany_saved_size') || 'M';
  const userProfileSize = (typeof rawProfileSize === 'string' ? rawProfileSize.replace(/\s*\([^)]*\)\s*\d*/g, '').trim() : rawProfileSize) || 'M';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const productsGridRef = useRef(null);

  const dynamicCategories = useMemo(() => {
    return getAllCategories(products);
  }, [products]);

  // Only categories that currently have live products in this catalog
  const visibleCategoryCards = useMemo(() => {
    return dynamicCategories
      .map((cat) => {
        const catKey = cat.id || cat.key;
        const catProducts = products.filter(
          p => p.category === catKey || 
               slugifyCategory(p.category || '') === catKey ||
               formatCategoryKey(p.category || '') === formatCategoryKey(catKey)
        );
        const count = catProducts.length;
        const itemWithImg = catProducts.find(
          p => (typeof p.image === 'string' && p.image.trim() && !p.image.includes('placeholder')) ||
               (Array.isArray(p.images) && p.images.length > 0 && typeof p.images[0] === 'string' && p.images[0].trim())
        );
        const heroImg = itemWithImg?.image || itemWithImg?.images?.[0] || null;

        return {
          ...cat,
          catKey,
          count,
          heroImg
        };
      })
      // Hide category if 0 items or no image of an actual item
      .filter(cat => cat.count > 0 && Boolean(cat.heroImg));
  }, [dynamicCategories, products]);

  const filterTabs = useMemo(() => {
    // Only include categories that actually have active items in the store
    const activeCategories = dynamicCategories.filter(cat => {
      const catKey = cat.id || cat.key;
      return products.some(
        p => p.category === catKey || 
             slugifyCategory(p.category || '') === catKey ||
             formatCategoryKey(p.category || '') === formatCategoryKey(catKey)
      );
    });

    return [
      { label: 'All T-Shirt Editions', value: 'all' },
      ...activeCategories.map(cat => ({
        label: cat.label,
        value: cat.id || cat.key
      }))
    ];
  }, [dynamicCategories, products]);

  const handleCategoryCardClick = (catKey) => {
    const nextCategory = selectedCategory === catKey ? 'all' : catKey;
    setSelectedCategory(nextCategory);

    // Smoothly scroll down to where the items are
    setTimeout(() => {
      if (productsGridRef.current) {
        const navOffset = 90;
        const rect = productsGridRef.current.getBoundingClientRect();
        const targetScrollTop = rect.top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 60);
  };

  const categoryDetails = {
    all: {
      title: "The Complete T-Shirt Collection",
      tagline: 'ALL T-SHIRTS',
      desc: 'Explore essential everyday crewnecks, durable comfort blends, and relaxed streetwear cuts.'
    }
  };

  const currentMeta = useMemo(() => {
    if (selectedCategory === 'all') {
      return categoryDetails.all;
    }
    const matched = dynamicCategories.find(
      c => c.id === selectedCategory || c.key === selectedCategory || slugifyCategory(c.label) === selectedCategory || formatCategoryKey(c.label) === selectedCategory
    );
    if (matched) {
      return {
        title: `${matched.label} Collection`,
        tagline: matched.label.toUpperCase(),
        desc: `Discover signature ${matched.label.toLowerCase()} tailored for lasting comfort and clean style.`
      };
    }
    const cleanLabel = formatCategoryLabel(selectedCategory);
    return {
      title: `${cleanLabel} Collection`,
      tagline: cleanLabel.toUpperCase(),
      desc: `Discover signature ${cleanLabel.toLowerCase()} tailored for lasting comfort and clean style.`
    };
  }, [selectedCategory, dynamicCategories]);

  // Helper to resolve offer details for a given product
  const getProductOfferInfo = (product) => {
    const activeOffer = (offers || []).find(
      (o) => isOfferActive(o) && (
        (o.productId && (String(o.productId) === String(product.id) || String(o.productId) === String(product.slug))) ||
        (o.productName && (product.name || product.title) && o.productName.trim().toLowerCase() === (product.name || product.title).trim().toLowerCase())
      )
    );

    const originalPrice = parseFloat(
      product.originalPriceLKR || 
      product.original_price_lkr || 
      product.base_price_lkr || 
      product.priceLKR || 
      product.price || 
      18500
    );

    let offerPrice = null;
    if (activeOffer && activeOffer.offerPriceLKR !== undefined && activeOffer.offerPriceLKR !== null) {
      offerPrice = parseFloat(activeOffer.offerPriceLKR);
    }

    const isDiscounted = Boolean(activeOffer && offerPrice && Number(offerPrice) > 0 && Number(offerPrice) < originalPrice);
    const savings = isDiscounted ? (originalPrice - Number(offerPrice)) : 0;
    const discountPercent = isDiscounted && originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

    return {
      activeOffer,
      hasOffer: isDiscounted,
      isDiscounted,
      offerPrice: isDiscounted ? Number(offerPrice) : null,
      originalPrice,
      savings,
      discountPercent
    };
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory === 'all') return true;
      const itemCat = item.category || '';
      const itemCatSlug = slugifyCategory(itemCat);
      const targetSlug = slugifyCategory(selectedCategory);
      return (
        itemCat === selectedCategory ||
        itemCatSlug === selectedCategory ||
        itemCatSlug === targetSlug ||
        formatCategoryKey(itemCat) === formatCategoryKey(selectedCategory)
      );
    }).sort((a, b) => {
      const priceA = getProductOfferInfo(a).offerPrice || a.priceLKR || a.price || 0;
      const priceB = getProductOfferInfo(b).offerPrice || b.priceLKR || b.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      return 0;
    });
  }, [products, selectedCategory, sortBy, offers]);

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };

  return (
    <div className="collection-page-view">
      {/* Collection Hero Header */}
      <div className="collection-page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="search-back-btn"
              onClick={onBackToHome}
              style={{ marginBottom: 0 }}
            >
              <Home size={15} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-primary)', fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              T-SHIRT COLLECTIONS
            </span>
          </div>

          <div className="collection-header-text">
            <span className="collection-tagline">{currentMeta.tagline}</span>
            <h1 className="collection-page-title">{currentMeta.title}</h1>
            <p className="collection-page-desc">{currentMeta.desc}</p>
          </div>
        </div>
      </div>

      {/* Collection Category Selector Cards */}
      {visibleCategoryCards.length > 0 && (
        <section className="collection-categories-section">
          <div className="container">
            <div className={`collection-categories-grid ${visibleCategoryCards.length === 3 ? 'col-count-3' : ''}`}>
              {visibleCategoryCards.map((cat) => {
                const catKey = cat.catKey || cat.id || cat.key;
                const isSelected = selectedCategory === catKey || slugifyCategory(selectedCategory) === catKey;

                return (
                  <div
                    key={catKey}
                    className={`collection-category-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleCategoryCardClick(catKey)}
                    title={`Filter by ${cat.label}`}
                  >
                    <img
                      src={cat.heroImg}
                      alt={cat.label}
                      className="collection-category-card-img"
                      loading="eager"
                      decoding="async"
                    />
                    <div className="collection-category-card-overlay">
                      <h4 className="collection-category-card-title">
                        {cat.label}
                      </h4>
                      <div className="collection-category-card-count">
                        {cat.count} {cat.count === 1 ? 'Garment Edition' : 'Garments'}
                      </div>
                      <div className="collection-category-card-cta">
                        {isSelected ? '• ACTIVE' : 'VIEW →'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Filter & Sort Controls Bar */}
      <div className="search-controls-bar" ref={productsGridRef}>
        <div className="container search-controls-inner">
          <div className="search-filter-pills">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                className={`filter-pill ${selectedCategory === tab.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="search-sort-group">
            <span className="results-count-text">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'T-Shirt' : 'T-Shirts'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="search-sort-select"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container collection-grid-container" style={{ paddingBottom: '5rem' }}>
        <div className="products-grid">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="product-card"
                style={{
                  backgroundColor: '#121316',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  minHeight: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '260px'
                }}>
                  <div className="spin-animation" style={{ width: '20px', height: '20px', border: '2px solid var(--gold-border)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                </div>
                <div style={{ padding: '1.2rem 1rem' }}>
                  <div style={{ height: '16px', width: '70%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', width: '40%', backgroundColor: 'rgba(197,160,89,0.15)', borderRadius: '2px', marginBottom: '12px' }} />
                  <div style={{ height: '10px', width: '90%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '2px' }} />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-light-muted)' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', marginBottom: '6px' }}>NO GARMENTS MATCHING THIS FILTER</div>
              <p style={{ fontSize: '0.82rem' }}>Please select another category or check back as new creations are released.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isJustAdded = addedItemId === product.id;
              const isOutOfStock = product.status === 'Sold Out' ||
                product.status === 'Archived' ||
                product.status === 'Out of Stock' ||
                product.isOutOfStock === true ||
                product.inStock === false ||
                product.totalStock === 0 ||
                (product.inventory && Object.keys(product.inventory).length > 0 && Object.values(product.inventory).every(v => Number(v) <= 0));
              const { activeOffer, isDiscounted, offerPrice, originalPrice, savings, discountPercent } = getProductOfferInfo(product);

              const productToAdd = isDiscounted
                ? { ...product, priceLKR: offerPrice, price: offerPrice, originalPriceLKR: originalPrice, isOfferApplied: true, offerCode: activeOffer?.code }
                : { ...product, priceLKR: originalPrice, price: originalPrice, isOfferApplied: false };

              return (
                <article 
                  key={product.id} 
                  className="product-card"
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(productToAdd);
                    else if (onOpenQuickView) onOpenQuickView(productToAdd);
                  }}
                  style={{ cursor: 'pointer', opacity: isOutOfStock ? 0.75 : 1 }}
                >
                  <div className="product-image-wrap">
                    {isOutOfStock ? (
                      <span className="product-badge" style={{ backgroundColor: 'rgba(239,68,68,0.9)', color: '#ffffff', border: '1px solid #ef4444' }}>
                        SOLD OUT
                      </span>
                    ) : product.badge && product.badge !== 'ATELIER LAUNCH PRIVILEGE' ? (
                      <span className="product-badge">{product.badge}</span>
                    ) : null}

                    {/* Offer Discount Saving Pill */}
                    {isDiscounted && savings > 0 && !isOutOfStock && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: '#b91c1c',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '2px',
                          letterSpacing: '0.04em',
                          zIndex: 3,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                          textTransform: 'uppercase'
                        }}
                      >
                        SAVE LKR {savings.toLocaleString()}
                      </span>
                    )}

                    <img 
                      src={product.image || '/images/hero_tshirt.webp'} 
                      alt={product.name || product.title} 
                      className="product-card-img"
                      loading="eager"
                      decoding="async"
                      onError={(e) => { e.target.src = '/images/hero_tshirt.webp'; }}
                    />

                    {/* Hover Quick Actions */}
                    <div className="product-quick-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn-quick-view"
                        onClick={() => onSelectProduct ? onSelectProduct(product) : onOpenQuickView(product)}
                        title="Inspect piece details"
                      >
                        <Eye size={13} />
                        <span>VIEW PIECE</span>
                      </button>
                      {isLoggedIn ? (
                        <button 
                          className="btn-quick-add"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) {
                              if (onSelectProduct) onSelectProduct(product);
                              else if (onOpenQuickView) onOpenQuickView(product);
                              return;
                            }
                            onAddToCart(productToAdd, userProfileSize);
                          }}
                          style={{
                            backgroundColor: isOutOfStock ? 'rgba(197, 160, 89, 0.15)' : undefined,
                            border: isOutOfStock ? '1px solid var(--gold-bright)' : undefined,
                            color: isOutOfStock ? 'var(--gold-bright)' : undefined,
                            cursor: 'pointer'
                          }}
                          title={isOutOfStock ? 'Garment sold out — Click to request atelier re-issue' : `Add to bag in your profile size (${userProfileSize})`}
                        >
                          {isOutOfStock ? (
                            <>
                              <Bell size={13} />
                              <span>RE-ISSUE</span>
                            </>
                          ) : isJustAdded ? (
                            <>
                              <Check size={13} />
                              <span>ADDED</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={13} />
                              <span>BAG ({userProfileSize.split(' ')[0]})</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button 
                          className="btn-quick-add"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectProduct) {
                              onSelectProduct(product);
                            } else if (onOpenQuickView) {
                              onOpenQuickView(product);
                            }
                          }}
                          style={{
                            backgroundColor: isOutOfStock ? 'rgba(197, 160, 89, 0.15)' : undefined,
                            border: isOutOfStock ? '1px solid var(--gold-bright)' : undefined,
                            color: isOutOfStock ? 'var(--gold-bright)' : undefined,
                            cursor: 'pointer'
                          }}
                          title={isOutOfStock ? 'Garment sold out — Click to request atelier re-issue' : 'Inspect piece & select your size'}
                        >
                          {isOutOfStock ? (
                            <>
                              <Bell size={13} />
                              <span>RE-ISSUE</span>
                            </>
                          ) : (
                            <>
                              <Ruler size={13} />
                              <span>SELECT SIZE</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>


                  <div className="product-info">
                    <div>
                      <div className="product-title-row">
                        <h3 className="product-name">{product.name || product.title}</h3>
                        {isDiscounted ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                            <div className="product-price" style={{ color: 'var(--gold-bright)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                              {formatLKR(offerPrice)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)', textDecoration: 'line-through', opacity: 0.75 }}>
                                {formatLKR(originalPrice)}
                              </span>
                              {discountPercent > 0 && (
                                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>
                                  ({discountPercent}% OFF)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="product-price">{formatLKR(originalPrice)}</div>
                        )}
                      </div>
                      <p className="product-tagline">{product.tagline || product.subtitle}</p>
                    </div>

                    <div className="product-meta-row">
                      <span>{product.color || 'Onyx Black'}</span>
                      <div className="color-dots">
                        {(product.colorsAvailable || (product.colors ? product.colors.map(c => c.hex) : ['#141518'])).map((hex, idx) => (
                          <div 
                            key={idx} 
                            className="color-dot" 
                            style={{ backgroundColor: hex }} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
