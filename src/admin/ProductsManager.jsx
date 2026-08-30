import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Layers, AlertCircle, Check, ExternalLink, Filter, Power, Eye, EyeOff } from 'lucide-react';

export const ProductsManager = ({ 
  products = [], 
  onOpenModal, 
  onDeleteProduct,
  onToggleStatus 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter((p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const composition = (p.composition || p.fabricProvenance || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = title.includes(search) || composition.includes(search) || sku.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-view-container">
      
      {/* Header Controls */}
      <div className="admin-header-controls">
        <div className="admin-search-filter-group">
          <div className="admin-search-wrap">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by silhouette, cotton GSM, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-pills">
            <button
              type="button"
              className={`admin-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Garments ({products.length})
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${selectedCategory === 'heavyweight' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('heavyweight')}
            >
              Heavyweight (280 GSM)
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${selectedCategory === 'silk-cotton' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('silk-cotton')}
            >
              Silk & Mercerized
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${selectedCategory === 'oversized' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('oversized')}
            >
              Boxy Drop-Shoulder
            </button>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-primary-gold"
          onClick={() => onOpenModal(null)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={15} />
          <span>CREATE NEW GARMENT</span>
        </button>
      </div>

      {/* Product Catalog Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>GARMENT & FABRIC SPEC</th>
                <th>PILLAR CATEGORY</th>
                <th>PRICE (LKR)</th>
                <th>SIZE & STOCK MATRIX</th>
                <th>TOTAL UNITS</th>
                <th>STATUS & VISIBILITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light-muted)' }}>
                    No luxury garments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => {
                  const title = product.title || product.name || 'Luxury Atelier Garment';
                  const gsm = product.gsm || (product.category === 'heavyweight' ? 280 : 220);
                  const composition = product.composition || product.fabricProvenance || '100% Organic Long-Staple Cotton';
                  const price = product.price || product.priceLKR || 18500;
                  const sku = product.sku || `ELV-TEE-00${idx + 1}`;
                  const inv = product.inventory || { 'S (38)': 8, 'M (40)': 14, 'L (42)': 18, 'XL (44)': 10, 'XXL (46)': 4 };
                  const totalUnits = Object.values(inv).reduce((a, b) => a + (Number(b) || 0), 0);
                  const isActive = product.is_active !== undefined 
                    ? Boolean(product.is_active) 
                    : (product.status !== 'Draft' && product.status !== 'Archived');

                  return (
                    <tr key={product.id || idx} style={{ opacity: isActive ? 1 : 0.65 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={product.image || '/images/tshirt_white.jpg'} 
                            alt={title}
                            className="admin-product-thumb"
                            onError={(e) => { e.target.src = '/images/hero_tshirt.jpg'; }}
                          />
                          <div>
                            <div className="admin-product-title">{title}</div>
                            <div className="admin-product-spec">
                              <span>{gsm} GSM</span> • 
                              <span>{composition}</span>
                            </div>
                            <span className="admin-sku-tag">{sku}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-tag">{product.category || 'heavyweight'}</span>
                      </td>

                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                          LKR {price.toLocaleString()}
                        </div>
                      </td>

                      <td>
                        <div className="admin-table-sizes-row">
                          {Object.entries(inv).map(([sz, qty]) => {
                            const q = Number(qty) || 0;
                            return (
                              <span key={sz} className={`admin-size-stock-badge ${q === 0 ? 'critical' : q < 3 ? 'critical' : ''}`} title={`${sz}: ${q} left`}>
                                <strong>{sz.split(' ')[0]}:</strong> {q}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td>
                        <strong style={{ color: totalUnits === 0 ? '#ef4444' : totalUnits < 5 ? '#f59e0b' : '#fff' }}>
                          {totalUnits} Units
                          {totalUnits === 0 && <span style={{ display: 'block', fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>OUT OF STOCK</span>}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (onToggleStatus && product.id) {
                              onToggleStatus(product.id, !isActive);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: isActive ? '1px solid var(--gold-border)' : '1px solid rgba(239, 68, 68, 0.4)',
                            backgroundColor: isActive ? 'rgba(197, 160, 89, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isActive ? 'var(--gold-bright)' : '#f87171',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            userSelect: 'none'
                          }}
                          title={`Click to ${isActive ? 'Deactivate (Temporarily hide from public)' : 'Activate (Publish live)'}`}
                        >
                          <Power size={11} />
                          <span>{isActive ? (totalUnits === 0 ? 'Active (Out of Stock)' : 'Active (Live)') : 'Deactivated (Hidden)'}</span>
                        </button>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="admin-icon-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              if (onToggleStatus && product.id) {
                                onToggleStatus(product.id, !isActive);
                              }
                            }}
                            title={isActive ? 'Deactivate Garment' : 'Activate Garment'}
                            style={{ color: isActive ? 'var(--gold-bright)' : '#f87171' }}
                          >
                            {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          <button
                            type="button"
                            className="admin-icon-action-btn"
                            onClick={() => onOpenModal(product)}
                            title="Edit Garment Specifications & Stock"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-action-btn delete"
                            onClick={() => onDeleteProduct(product.id)}
                            title="Delete Garment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
