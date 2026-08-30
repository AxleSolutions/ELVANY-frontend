import React from 'react';
import { ArrowRight, Eye, ShoppingBag, Check } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export const CoreOfferings = ({
  selectedCategory,
  onOpenQuickView,
  onAddToCart,
  addedItemId,
  onViewAllClick
}) => {
  const filteredProducts = selectedCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const formatPriceLKR = (prod) => {
    return `LKR ${prod.priceLKR.toLocaleString()}`;
  };

  return (
    <section id="offerings" className="core-offerings-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="section-tag">AUTUMN/WINTER '25 CAPSULE</div>
            <h2 className="section-main-title">The Core Offerings</h2>
          </div>
          <button 
            className="section-action-link"
            onClick={onViewAllClick}
          >
            <span>VIEW ALL 24 PIECES</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isJustAdded = addedItemId === product.id;

            return (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <span className="product-badge">{product.badge}</span>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-card-img"
                  />

                  {/* Hover Quick Actions */}
                  <div className="product-quick-actions">
                    <button 
                      className="btn-quick-view"
                      onClick={() => onOpenQuickView(product)}
                      title="Inspect piece details"
                    >
                      <Eye size={13} />
                      <span>VIEW</span>
                    </button>
                    <button 
                      className="btn-quick-add"
                      onClick={() => onAddToCart(product, product.sizes[0])}
                      title="Add default size to bag"
                    >
                      {isJustAdded ? (
                        <>
                          <Check size={13} />
                          <span>ADDED</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} />
                          <span>BAG</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <div>
                    <div className="product-title-row">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">{formatPriceLKR(product)}</div>
                    </div>
                    <p className="product-tagline">{product.tagline}</p>
                  </div>

                  <div className="product-meta-row">
                    <span>{product.color}</span>
                    <div className="color-dots">
                      {product.colorsAvailable.map((hex, idx) => (
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
          })}
        </div>
      </div>
    </section>
  );
};
