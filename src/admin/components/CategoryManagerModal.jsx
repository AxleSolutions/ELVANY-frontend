import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Tag, AlertCircle } from 'lucide-react';
import { 
  getStoredCategories, 
  getAllCategories, 
  addCustomCategory, 
  updateCustomCategory, 
  deleteCustomCategory,
  reassignProductsCategory,
  slugifyCategory 
} from '../../services/categoryService';

export const CategoryManagerModal = ({ 
  isOpen, 
  onClose, 
  products = [], 
  onCategoriesChanged,
  onUpdateProducts 
}) => {
  const [categories, setCategories] = useState(() => getAllCategories(products));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const refreshCategories = () => {
    const updated = getAllCategories(products);
    setCategories(updated);
    if (onCategoriesChanged) {
      onCategoriesChanged(updated);
    }
  };

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;

    const res = addCustomCategory(newCategoryName.trim());
    if (res) {
      setNewCategoryName('');
      const updated = getAllCategories(products);
      setCategories(updated);
      if (onCategoriesChanged) {
        onCategoriesChanged(updated);
      }
      showToast(`Category "${res.label}" created successfully.`);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id || cat.key);
    setEditingLabel(cat.label);
  };

  const handleSaveEdit = (catId) => {
    if (!editingLabel.trim()) return;
    updateCustomCategory(catId, editingLabel.trim());
    setEditingId(null);
    setEditingLabel('');
    const updated = getAllCategories(products);
    setCategories(updated);
    if (onCategoriesChanged) {
      onCategoriesChanged(updated);
    }
    showToast('Category renamed successfully.');
  };

  const handleDelete = (cat) => {
    const catId = cat.id || cat.key;
    const count = products.filter(p => p.category === catId || slugifyCategory(p.category || '') === catId).length;
    
    if (count > 0) {
      const confirmMsg = `There are currently ${count} garment(s) linked to "${cat.label}". If removed, these garments will be safely moved to a default category. Continue?`;
      if (!window.confirm(confirmMsg)) return;
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${cat.label}"?`)) return;
    }

    deleteCustomCategory(catId);
    
    // Reassign any existing products to a remaining category
    const remaining = getAllCategories(products).filter(c => c.id !== catId && c.key !== catId);
    const fallbackCat = remaining[0]?.id || remaining[0]?.key || 'classic-crewneck';
    
    if (count > 0 && onUpdateProducts) {
      const updatedProducts = reassignProductsCategory(products, catId, fallbackCat);
      onUpdateProducts(updatedProducts);
    }

    setCategories(remaining);
    if (onCategoriesChanged) {
      onCategoriesChanged(remaining);
    }
    showToast(`Category "${cat.label}" permanently deleted.`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="admin-edit-dialog"
        style={{ maxWidth: '640px', width: '92%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div>
            <div className="admin-dialog-subtitle">STORE ARCHITECTURE</div>
            <h2 className="admin-dialog-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} color="var(--gold-bright, #c5a059)" />
              Manage Garment Categories
            </h2>
          </div>
          <button type="button" className="admin-dialog-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-dialog-body" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Create, rename, or remove categories. All categories configured here appear in the 
            <strong> CREATE NEW GARMENT</strong> editor and dynamically on the customer-side storefront collections.
          </p>

          {toastMsg && (
            <div style={{
              backgroundColor: 'rgba(197, 160, 89, 0.15)',
              border: '1px solid var(--gold-bright, #c5a059)',
              color: 'var(--gold-bright, #c5a059)',
              padding: '8px 12px',
              borderRadius: '3px',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Check size={14} />
              {toastMsg}
            </div>
          )}

          {/* Create New Category Form */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Enter new category name (e.g. Polo Tees, Oversized, Casual)..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="form-input admin-input"
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="btn-primary-gold"
              style={{ whiteSpace: 'nowrap', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories List */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              padding: '10px 14px', 
              fontSize: '0.72rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              color: 'rgba(255,255,255,0.5)',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              Active Categories ({categories.length})
            </div>

            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {categories.map((cat) => {
                const catId = cat.id || cat.key;
                const count = products.filter(
                  p => p.category === catId || slugifyCategory(p.category || '') === catId
                ).length;
                const isEditing = editingId === catId;

                return (
                  <div 
                    key={catId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      backgroundColor: isEditing ? 'rgba(197, 160, 89, 0.08)' : 'transparent'
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '12px' }}>
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(catId);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="form-input admin-input"
                          style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(catId)}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag size={14} color="var(--gold-bright, #c5a059)" opacity={0.7} />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#fff' }}>
                            {cat.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                            Key: <code>{cat.key}</code> • {count} {count === 1 ? 'garment' : 'garments'}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          title="Rename Category"
                          style={{
                            background: 'none',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            color: 'rgba(255,255,255,0.7)',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          title="Delete Category"
                          style={{
                            background: 'none',
                            border: '1px solid rgba(255, 75, 75, 0.2)',
                            borderRadius: '3px',
                            color: '#ff6b6b',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-dialog-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-primary-gold"
            onClick={onClose}
            style={{ padding: '8px 20px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
