import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Layers, AlertCircle, Check, ExternalLink, Filter, Power, Eye, EyeOff, Tag } from 'lucide-react';
import { getAllCategories, slugifyCategory, addCustomCategory, deleteCustomCategory, reassignProductsCategory } from '../services/categoryService';
import { CategoryManagerModal } from './components/CategoryManagerModal';

export const ProductsManager = ({ 
  products = [], 
  onOpenModal, 
  onDeleteProduct,
  onToggleStatus,
  onToggleStock,
  onUpdateProducts 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catRevision, setCatRevision] = useState(0);
  const [newCatInput, setNewCatInput] = useState('');

  const availableCategories = useMemo(() => {
    return getAllCategories(products);
  }, [products, catRevision]);

  const handleQuickAddCategory = (e) => {
    e?.preventDefault();
    if (!newCatInput.trim()) return;
    const res = addCustomCategory(newCatInput.trim());
    if (res) {
      setNewCatInput('');
      setCatRevision(r => r + 1);
    }
  };

  const handleQuickDeleteCategory = (cat) => {
    const catId = cat.id || cat.key;
    const count = products.filter(p => p.category === catId || slugifyCategory(p.category || '') === catId).length;
    
    if (count > 0) {
      const confirmMsg = `There are ${count} garment(s) currently linked to "${cat.label}". If deleted, these garments will safely move to a default category. Continue?`;
      if (!window.confirm(confirmMsg)) return;
    } else {
      if (!window.confirm(`Delete category "${cat.label}"?`)) return;
    }

    deleteCustomCategory(catId);

    const remaining = getAllCategories(products).filter(c => c.id !== catId && c.key !== catId);
    const fallbackCat = remaining[0]?.id || remaining[0]?.key || 'classic-crewneck';

    if (count > 0 && onUpdateProducts) {
      const updated = reassignProductsCategory(products, catId, fallbackCat);
      onUpdateProducts(updated);
    }

    if (selectedCategory === catId) {
      setSelectedCategory('all');
    }
    setCatRevision(r => r + 1);
  };

  const filteredProducts = products.filter((p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const composition = (p.composition || p.fabricProvenance || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = title.includes(search) || composition.includes(search) || sku.includes(search);
    const catSlug = slugifyCategory(p.category || '');
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory || catSlug === selectedCategory;
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
              placeholder="Search by silhouette, fabric, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className={`admin-filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Garments ({products.length})
            </button>
            {availableCategories.map((cat) => {
              const count = products.filter(p => p.category === cat.id || slugifyCategory(p.category || '') === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="admin-btn admin-btn-secondary"
            onClick={() => setIsCategoryModalOpen(true)}
            style={{ 
              whiteSpace: 'nowrap', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '9px 14px',
              fontSize: '0.78rem',
              letterSpacing: '0.05em'
            }}
          >
            <Tag size={14} color="var(--gold-bright, #c5a059)" />
            <span>MANAGE CATEGORIES</span>
          </button>

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
      </div>

      {/* Category Customizer Banner / Panel */}
      <div style={{
        backgroundColor: '#0e0f12',
        border: '1px solid var(--border-dark)',
        borderRadius: '4px',
        padding: '1rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={15} color="var(--gold-bright, #c5a059)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', color: '#fff', textTransform: 'uppercase' }}>
              CUSTOMIZE CATEGORIES & SILHOUETTE PILLARS
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
              ({availableCategories.length} categories active)
            </span>
          </div>

          {/* Quick Add Input */}
          <form onSubmit={handleQuickAddCategory} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="New category name..."
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              style={{
                backgroundColor: '#141518',
                border: '1px solid var(--border-dark)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '2px',
                fontSize: '0.78rem',
                outline: 'none',
                minWidth: '200px'
              }}
            />
            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="btn-primary-gold"
              style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} />
              <span>ADD CATEGORY</span>
            </button>
          </form>
        </div>

        {/* Category Chips with Instant Delete Action */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
            Categories:
          </span>
          {availableCategories.map((cat) => {
            const count = products.filter(p => p.category === cat.id || slugifyCategory(p.category || '') === cat.id).length;
            return (
              <div 
                key={cat.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(197, 160, 89, 0.18)' : '#141518',
                  border: selectedCategory === cat.id ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  color: selectedCategory === cat.id ? 'var(--gold-bright)' : '#ffffff'
                }}
              >
                <span 
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ cursor: 'pointer', fontWeight: 500 }}
                  title={`Filter by ${cat.label}`}
                >
                  {cat.label} {count > 0 && `(${count})`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickDeleteCategory(cat);
                  }}
                  title={`Delete category "${cat.label}"`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 107, 107, 0.7)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 107, 107, 0.7)'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
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
                    No garments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => {
                  const title = product.title || product.name || 'Signature Atelier Garment';
                  const gsm = product.gsm || (product.category === 'heavyweight' ? 280 : 220);
                  const composition = product.composition || product.fabricProvenance || 'Durable Comfort Knit Blend';
                  const price = product.price || product.priceLKR || 18500;
                  const sku = product.sku || `ELV-TEE-00${idx + 1}`;
                  const inv = product.inventory || { 'XS': 4, 'S': 8, 'M': 14, 'L': 18, 'XL': 10, '2XL': 4 };
                  const totalUnits = Object.values(inv).reduce((a, b) => a + (Number(b) || 0), 0);
                  const isActive = product.is_active !== undefined 
                    ? Boolean(product.is_active) 
                    : (product.status !== 'Draft' && product.status !== 'Archived');

                  return (
                    <tr key={product.id || idx} style={{ opacity: isActive ? 1 : 0.65 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={product.image || '/images/tshirt_white.webp'} 
                            alt={title}
                            className="admin-product-thumb"
                            onError={(e) => { e.target.src = '/images/hero_tshirt.webp'; }}
                          />
                          <div>
                            <div className="admin-product-title">{title}</div>
                            <div className="admin-product-spec">
                              <span>{gsm} GSM</span> • 
                              <span>{composition}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span className="admin-sku-tag">{sku}</span>
                              {Array.isArray(product.images) && product.images.length > 1 && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--gold-bright)', backgroundColor: 'rgba(197, 160, 89, 0.1)', border: '1px solid rgba(197, 160, 89, 0.25)', padding: '1px 5px', borderRadius: '2px' }}>
                                  {product.images.length} angles
                                </span>
                              )}
                            </div>
                            {/* Colorway swatches preview */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                              {((product.colors && product.colors.length > 0) ? product.colors.map(c => c.hex) : (product.colorsAvailable || ['#121316'])).map((hex, cIdx) => (
                                <span 
                                  key={cIdx} 
                                  style={{ 
                                    width: '11px', 
                                    height: '11px', 
                                    borderRadius: '50%', 
                                    backgroundColor: hex, 
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    display: 'inline-block' 
                                  }} 
                                  title={product.colors?.[cIdx]?.name || hex}
                                />
                              ))}
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', marginLeft: '4px' }}>
                                {product.color || (product.colors?.[0]?.name) || 'Onyx Black'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-tag">
                          {availableCategories.find(c => c.id === product.category || c.id === slugifyCategory(product.category || ''))?.label || product.category || 'Standard'}
                        </span>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <strong style={{ color: totalUnits === 0 ? '#ef4444' : totalUnits < 5 ? '#f59e0b' : '#fff' }}>
                            {totalUnits} Units
                            {totalUnits === 0 && <span style={{ display: 'block', fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>OUT OF STOCK</span>}
                          </strong>
                          {onToggleStock && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const isCurrentlyOut = totalUnits === 0 || product.status === 'Sold Out' || product.isOutOfStock === true;
                                onToggleStock(product.id, isCurrentlyOut);
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                borderRadius: '2px',
                                cursor: 'pointer',
                                border: (totalUnits === 0 || product.status === 'Sold Out' || product.isOutOfStock === true) ? '1px solid var(--gold-bright)' : '1px solid rgba(239, 68, 68, 0.4)',
                                backgroundColor: (totalUnits === 0 || product.status === 'Sold Out' || product.isOutOfStock === true) ? 'rgba(197, 160, 89, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                                color: (totalUnits === 0 || product.status === 'Sold Out' || product.isOutOfStock === true) ? 'var(--gold-bright)' : '#f87171',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                              }}
                              title={totalUnits === 0 ? 'Click to restock piece (+25 units)' : 'Click to immediately mark as Out of Stock (Sold Out)'}
                            >
                              {(totalUnits === 0 || product.status === 'Sold Out' || product.isOutOfStock === true) ? '↺ RESTOCK (+25)' : '✕ SET OUT OF STOCK'}
                            </button>
                          )}
                        </div>
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

      {/* Category Management Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        products={products}
        onUpdateProducts={onUpdateProducts}
        onCategoriesChanged={() => setCatRevision(r => r + 1)}
      />
    </div>
  );
};
