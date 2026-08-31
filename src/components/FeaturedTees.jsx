import React from 'react';
import { ArrowRight, Eye, ShoppingBag, Check, Ruler, Loader2, Bell } from 'lucide-react';

export const FeaturedTees = ({ 
  products = [], 
  isLoading = false,
  loggedInUser,
  userProfile,
  onSelectProduct, 
  onAddToCart, 
  addedItemId, 
  onExploreCollection 
}) => {
  const isLoggedIn = Boolean(loggedInUser || userProfile?.email);
  const userProfileSize = userProfile?.savedSize || localStorage.getItem('elvany_saved_size') || 'M (40)';

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };


  return (
    <section className="featured-tees-section" style={{ padding: '5.5rem 0 4rem 0', backgroundColor: '#0b0b0c', color: '#fff' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header-row" style={{ marginBottom: '3rem' }}>
          <div>
            <div className="section-tag" style={{ color: 'var(--gold-bright)' }}>CURATED CAPSULE</div>
            <h2 className="section-main-title" style={{ color: '#fff' }}>Signature T-Shirt Editions</h2>
          </div>
          <button 
            className="section-action-link"
            onClick={onExploreCollection}
            style={{ color: 'var(--gold-bright)', borderColor: 'var(--gold-border)' }}
          >
            <span>VIEW ALL EDITIONS</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4-Column Product Grid */}
        <div className="products-grid">

          {isLoading ? (
            /* Luxury Skeleton Cards */
            [1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="product-card"
                style={{
                  backgroundColor: '#121316',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  minHeight: '400px',
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
                  minHeight: '280px'
                }}>
                  <Loader2 size={24} className="spin-animation" color="var(--gold-border)" />
                </div>
                <div style={{ padding: '1.2rem 1rem' }}>
                  <div style={{ height: '16px', width: '70%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', width: '40%', backgroundColor: 'rgba(197,160,89,0.15)', borderRadius: '2px', marginBottom: '12px' }} />
                  <div style={{ height: '10px', width: '90%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '2px' }} />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-light-muted)' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', marginBottom: '6px' }}>NO CAPSULE EDITIONS PUBLISHED</div>
              <p style={{ fontSize: '0.82rem' }}>New architectural silhouettes are being crafted in the atelier.</p>
            </div>
          ) : (
            products.map((product) => {
              const isJustAdded = addedItemId === product.id;
              const isOutOfStock = product.totalStock === 0 || (product.inventory && Object.values(product.inventory).every(v => Number(v) <= 0));

              return (
                <article 
                  key={product.id} 
                  className="product-card"
                  onClick={() => onSelectProduct(product)}
                  style={{ cursor: 'pointer', backgroundColor: '#121316', border: '1px solid var(--border-dark)', opacity: isOutOfStock ? 0.75 : 1 }}
                >
                  <div className="product-image-wrap" style={{ aspectRatio: '3/4' }}>
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
                        onClick={() => onSelectProduct(product)}
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
                              onSelectProduct(product);
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
                            onSelectProduct(product);
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



                  <div className="product-info" style={{ padding: '1.2rem 1rem' }}>
                    <div>
                      <div className="product-title-row">
                        <h3 className="product-name" style={{ color: '#fff', fontSize: '1.1rem' }}>{product.name || product.title}</h3>
                        <div className="product-price" style={{ color: 'var(--gold-bright)' }}>{formatLKR(product.priceLKR || product.price || 18500)}</div>
                      </div>
                      <p className="product-tagline" style={{ color: 'var(--text-light-muted)' }}>{product.tagline || product.subtitle}</p>
                    </div>

                    <div className="product-meta-row" style={{ marginTop: '0.8rem', color: 'var(--text-light-secondary)' }}>
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
    </section>
  );
};

