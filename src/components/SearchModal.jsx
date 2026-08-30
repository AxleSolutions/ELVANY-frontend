import React, { useState } from 'react';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export const SearchModal = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToSearchPage
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filtered = PRODUCTS.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabricProvenance.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
    );
  });

  const handleFullSearch = (e) => {
    e.preventDefault();
    if (onNavigateToSearchPage) {
      onNavigateToSearchPage(query);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="fitting-dialog" 
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        <form onSubmit={handleFullSearch} style={{ marginBottom: '2rem' }}>
          <div style={{
            color: 'var(--gold-bright)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '0.8rem'
          }}>
            COLLECTION SEARCH & ARCHIVE
          </div>
          
          {/* White Box Search Input */}
          <div className="search-white-box-wrapper">
            <SearchIcon size={20} className="search-icon-dark" />
            <input
              type="text"
              autoFocus
              placeholder="Search cashmere coats, trousers, knitwear, fabrics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-white-box-input"
            />
            <button 
              type="submit"
              className="btn-primary-gold"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.72rem' }}
            >
              SEARCH
            </button>
          </div>
        </form>

        {/* Quick Instant Suggestions */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em' }}>
              SUGGESTED PIECES
            </span>
            {query && (
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToSearchPage) onNavigateToSearchPage(query);
                  onClose();
                }}
                style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', cursor: 'pointer', background: 'none' }}
              >
                VIEW FULL RESULTS PAGE →
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light-muted)' }}>
              No pieces match "{query}". Press Enter to view full archive catalog.
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-dark)'}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '1px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#fff' }}>
                    {prod.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
                    {prod.fabricProvenance}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gold-bright)', fontWeight: 600, fontSize: '0.9rem' }}>
                    LKR {prod.priceLKR.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', letterSpacing: '0.1em' }}>
                    VIEW PIECE →
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
