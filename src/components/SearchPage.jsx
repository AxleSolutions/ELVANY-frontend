import React, { useState, useMemo } from 'react';
import { Home, ArrowLeft, Search, SlidersHorizontal, Eye, ShoppingBag, Check, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { getAllCategories, slugifyCategory, formatCategoryKey } from '../services/categoryService';

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

  const categories = useMemo(() => {
    const dynamic = getAllCategories(products);
    return [
      { label: 'All Creations', value: 'all' },
      ...dynamic.map(c => ({
        label: c.label,
        value: c.id || c.key
      }))
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const itemCat = item.category || '';
      const itemCatSlug = slugifyCategory(itemCat);
      const targetSlug = slugifyCategory(selectedCategory);
      const matchesCategory = selectedCategory === 'all' || 
        itemCat === selectedCategory || 
        itemCatSlug === selectedCategory || 
        itemCatSlug === targetSlug || 
        formatCategoryKey(itemCat) === formatCategoryKey(selectedCategory);
      
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.tagline && item.tagline.toLowerCase().includes(q)) ||
        (item.fabricProvenance && item.fabricProvenance.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q)) ||
        itemCat.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.priceLKR - b.priceLKR;
      if (sortBy === 'price-high') return b.priceLKR - a.priceLKR;
      return 0;
    });
  }, [products, query, selectedCategory, sortBy]);

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
              const isOutOfStock = product.status === 'Sold Out' ||
                product.status === 'Archived' ||
                product.status === 'Out of Stock' ||
                product.isOutOfStock === true ||
                product.inStock === false ||
                product.totalStock === 0 ||
                (product.inventory && Object.keys(product.inventory).length > 0 && Object.values(product.inventory).every(v => Number(v) <= 0));

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
                          if (!isOutOfStock) {
                            onAddToCart(product, product.sizes?.[0] || 'M');
                          } else if (onSelectProduct) {
                            onSelectProduct(product);
                          }
                        }}
                        style={{
                          backgroundColor: isOutOfStock ? 'rgba(197, 160, 89, 0.15)' : undefined,
                          border: isOutOfStock ? '1px solid var(--gold-bright)' : undefined,
                          color: isOutOfStock ? 'var(--gold-bright)' : undefined
                        }}
                        title={isOutOfStock ? 'Garment sold out — Click to request re-issue' : 'Add default size to bag'}
                      >
                        {isOutOfStock ? (
                          <span>SOLD OUT</span>
                        ) : isJustAdded ? (
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
