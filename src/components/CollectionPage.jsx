import React, { useState, useMemo } from 'react';
import { Home, Eye, ShoppingBag, Check, Ruler, Bell } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';

export const CollectionPage = ({
  products = [],
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
  const userProfileSize = userProfile?.savedSize || localStorage.getItem('elvany_saved_size') || 'M (40)';


  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');

  const filterTabs = [
    { label: 'All T-Shirt Editions', value: 'all' },
    { label: 'Heavyweight (280 GSM)', value: 'heavyweight' },
    { label: 'Silk & Mercerized Cotton', value: 'silk-cotton' },
    { label: 'Minimalist Boxy Cut', value: 'oversized' }
  ];

  const categoryDetails = {
    all: {
      title: "The Complete T-Shirt Capsule",
      tagline: 'ALL T-SHIRTS',
      desc: 'Explore heavyweight 280 GSM organic cotton crewnecks, silk-mercerized luxury tees, and boxy drop-shoulder silhouettes.'
    },
    heavyweight: {
      title: 'Heavyweight Structured Tees',
      tagline: '280 GSM COMBED COTTON',
      desc: 'Dense organic cotton with high-density double-bound collar ribbing that never stretches.'
    },
    'silk-cotton': {
      title: 'Silk & Mercerized Cotton Tees',
      tagline: 'LUSTER YARNS',
      desc: 'Mulberry silk and double-mercerized cotton delivering a cool touch and subtle sheen.'
    },
    oversized: {
      title: 'Minimalist Boxy & Oversized Tees',
      tagline: 'RELAXED ARCHITECTURE',
      desc: 'Drop-shoulder cuts with wide sleeves and straight hems in vintage mineral wash.'
    }
  };

  const currentMeta = categoryDetails[selectedCategory] || categoryDetails.all;

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.priceLKR || a.price) - (b.priceLKR || b.price);
      if (sortBy === 'price-high') return (b.priceLKR || b.price) - (a.priceLKR || a.price);
      return 0;
    });
  }, [products, selectedCategory, sortBy]);

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
      <div style={{ backgroundColor: 'var(--bg-cream)', padding: '3.5rem 0 1rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.categoryKey)}
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedCategory === cat.categoryKey ? '2px solid var(--gold-primary)' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg, rgba(11,11,12,0.85) 0%, rgba(11,11,12,0.3) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.2rem',
                  color: '#fff'
                }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '2px' }}>
                    {cat.title}
                  </h4>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-bright)', letterSpacing: '0.1em' }}>
                    {selectedCategory === cat.categoryKey ? '• ACTIVE SELECTION' : 'VIEW CATEGORY →'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Filter & Sort Controls Bar */}
      <div className="search-controls-bar">
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
                  border: '1px solid rgba(255, 255, 255, 0.05)',
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
              const isOutOfStock = product.totalStock === 0 || (product.inventory && Object.values(product.inventory).every(v => Number(v) <= 0));

              return (
                <article 
                  key={product.id} 
                  className="product-card"
                  onClick={() => onSelectProduct ? onSelectProduct(product) : onOpenQuickView(product)}
                  style={{ cursor: 'pointer', opacity: isOutOfStock ? 0.75 : 1 }}
                >
                  <div className="product-image-wrap">
                    {isOutOfStock ? (
                      <span className="product-badge" style={{ backgroundColor: 'rgba(239,68,68,0.9)', color: '#ffffff', border: '1px solid #ef4444' }}>
                        SOLD OUT
                      </span>
                    ) : product.badge ? (
                      <span className="product-badge">{product.badge}</span>
                    ) : null}
                    <img 
                      src={product.image || '/images/hero_tshirt.jpg'} 
                      alt={product.name || product.title} 
                      className="product-card-img"
                      onError={(e) => { e.target.src = '/images/hero_tshirt.jpg'; }}
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
                            onAddToCart(product, userProfileSize);
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
                        <div className="product-price">{formatLKR(product.priceLKR || product.price || 18500)}</div>
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
