import React, { useState, useMemo } from 'react';
import { Home, ArrowLeft, Search, SlidersHorizontal, Eye, ShoppingBag, Check, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export const SearchPage = ({
  products = PRODUCTS,
  initialQuery = '',
  onBackToHome,
  onSelectProduct,
  onOpenQuickView,
  onAddToCart,
  addedItemId
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { label: 'All Creations', value: 'all' },
    { label: 'Atelier Tailoring', value: 'tailoring' },
    { label: 'Pure Knitwear', value: 'knitwear' },
    { label: 'Maison Accessories', value: 'accessories' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.fabricProvenance.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.priceLKR - b.priceLKR;
      if (sortBy === 'price-high') return b.priceLKR - a.priceLKR;
      return 0;
    });
  }, [query, selectedCategory, sortBy]);

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };

  return (
    <div className="search-page-view">
      {/* Search Header Banner */}
      <div className="search-page-header">
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
              SEARCH ARCHIVES
            </span>
          </div>

          <div className="search-header-content">
            <span className="search-tagline">COLLECTION SEARCH & ARCHIVES</span>
            <h1 className="search-page-title">
              {query ? `Search Results for "${query}"` : 'Sartorial Catalog & Search'}
            </h1>
            
            {/* Search Input Bar in clean white box */}
            <div className="search-white-box-wrapper">
              <Search size={20} className="search-icon-dark" />
              <input
                type="text"
                placeholder="Search cashmere coats, trousers, knitwear, fabrics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-white-box-input"
                autoFocus
              />
              {query && (
                <button 
                  className="search-white-box-clear"
                  onClick={() => setQuery('')}
                  title="Clear search query"
                >
                  <X size={16} />
                  <span>CLEAR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="search-controls-bar">
        <div className="container search-controls-inner">
          <div className="search-filter-pills">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`filter-pill ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="search-sort-group">
            <span className="results-count-text">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'} Found
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

      {/* Product Results Grid */}
      <div className="container search-results-container">
        {filteredProducts.length === 0 ? (
          <div className="search-empty-state">
            <div className="empty-state-crest">⚜</div>
            <h3 className="empty-state-title">No sartorial creations found</h3>
            <p className="empty-state-desc">
              We could not find any garments matching your criteria. Try searching for "Cashmere", "Tailoring", "Overcoat", or clear your filters.
            </p>
            <button 
              className="btn-primary-gold"
              onClick={() => { setQuery(''); setSelectedCategory('all'); }}
            >
              RESET ALL SEARCH FILTERS
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const isJustAdded = addedItemId === product.id;

              return (
                <article 
                  key={product.id} 
                  className="product-card"
                  onClick={() => onSelectProduct ? onSelectProduct(product) : onOpenQuickView(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-wrap">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-card-img"
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
                      <button 
                        className="btn-quick-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product, product.sizes[0]);
                        }}
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
                        <div className="product-price">{formatLKR(product.priceLKR)}</div>
                      </div>
                      <p className="product-tagline">{product.tagline}</p>
                    </div>

                    <div className="product-meta-row">
                      <span>{product.color}</span>
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};
