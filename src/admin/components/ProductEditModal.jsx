import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Trash2, Image as ImageIcon, ShieldCheck, Layers, Package, SlidersHorizontal, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadGarmentImageToCloudinary } from '../../lib/cloudinary';

export const ProductEditModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    category: 'heavyweight',
    price: 18500,
    gsm: 280,
    composition: '100% Long-Staple Combed Cotton',
    image: '/images/hero_tshirt.jpg',
    images: ['/images/hero_tshirt.jpg'],
    description: '',
    status: 'Active',
    inventory: {
      'S (38)': 10,
      'M (40)': 15,
      'L (42)': 20,
      'XL (44)': 12,
      'XXL (46)': 6
    },
    collarSpec: 'Double-needle non-sag 1x1 ribbing',
    fit: 'Tailored Architectural Regular Fit',
    origin: 'Florence, Italy'
  });

  const [newSizeName, setNewSizeName] = useState('');
  const [quickTotalQty, setQuickTotalQty] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      const productImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image || '/images/hero_tshirt.jpg'];

      setFormData({
        ...product,
        image: product.image || productImages[0] || '/images/hero_tshirt.jpg',
        images: productImages,
        inventory: (product.inventory && Object.keys(product.inventory).length > 0) 
          ? product.inventory 
          : {
            'S (38)': 10,
            'M (40)': 15,
            'L (42)': 20,
            'XL (44)': 12,
            'XXL (46)': 6
          }
      });
    } else {
      setFormData({
        id: null,
        title: '',
        category: 'heavyweight',
        price: 18500,
        gsm: 280,
        composition: '100% Long-Staple Combed Cotton',
        image: '',
        images: [],
        description: '',
        status: 'Active',
        inventory: {
          'S (38)': 10,
          'M (40)': 15,
          'L (42)': 20,
          'XL (44)': 12,
          'XXL (46)': 6
        },
        collarSpec: 'Double-needle non-sag 1x1 ribbing',
        fit: 'Tailored Architectural Regular Fit',
        origin: 'Florence, Italy'
      });
    }
    setNewSizeName('');
    setQuickTotalQty('');
    setIsUploadingImage(false);
    setUploadError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const totalUnits = Object.values(formData.inventory || {}).reduce((a, b) => a + (Number(b) || 0), 0);

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');
    try {
      const result = await uploadGarmentImageToCloudinary(file);
      if (result?.secure_url) {
        const newUrl = result.secure_url;
        // Filter out default static placeholders so user's uploaded images take exclusive priority
        const currentImages = (Array.isArray(formData.images) ? formData.images : [])
          .filter(img => Boolean(img) && !img.startsWith('/images/'));

        const nextImages = [newUrl, ...currentImages.filter(img => img !== newUrl)];

        setFormData(prev => ({
          ...prev,
          image: newUrl,
          images: nextImages
        }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (imgUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imgUrl
    }));
  };

  const handleRemoveImage = (imgUrl) => {
    const nextImages = (formData.images || []).filter(img => img !== imgUrl);
    const fallbackImg = nextImages[0] || '';
    setFormData(prev => ({
      ...prev,
      image: prev.image === imgUrl ? fallbackImg : prev.image,
      images: nextImages
    }));
  };


  const handleInventoryChange = (size, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [size]: parsed
      }
    }));
  };


  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    const cleanName = newSizeName.trim();
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [cleanName]: 10
      }
    }));
    setNewSizeName('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    const updated = { ...formData.inventory };
    delete updated[sizeToRemove];
    setFormData(prev => ({
      ...prev,
      inventory: updated
    }));
  };

  const handleQuickDistribute = () => {
    const total = parseInt(quickTotalQty, 10);
    if (!total || total <= 0) return;

    const sizeKeys = Object.keys(formData.inventory || {});
    if (sizeKeys.length === 0) return;

    const perSize = Math.floor(total / sizeKeys.length);
    const remainder = total % sizeKeys.length;

    const updated = {};
    sizeKeys.forEach((sz, idx) => {
      updated[sz] = perSize + (idx < remainder ? 1 : 0);
    });

    setFormData(prev => ({
      ...prev,
      inventory: updated
    }));
    setQuickTotalQty('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;
    
    const finalProduct = {
      ...formData,
      totalStock: totalUnits,
      inventory: formData.inventory
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="admin-edit-dialog"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div>
            <div className="admin-dialog-subtitle">GARMENT ATELIER & STOCK MANAGER</div>
            <h2 className="admin-dialog-title">
              {product ? `Edit Garment: ${product.title}` : 'Add New Luxury Garment'}
            </h2>
          </div>
          <button className="admin-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-dialog-form">
          <div className="admin-form-grid">
            
            {/* Left Column: Core Garment Info */}
            <div className="admin-form-col">
              <div className="form-group">
                <label className="form-label">Garment Title / Model Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The 280 GSM Heavyweight Crewneck Tee"
                  className="form-input admin-input"
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Silhouette Pillar Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input admin-input"
                  >
                    <option value="heavyweight">Heavyweight (280 GSM)</option>
                    <option value="luxury-cotton">Sea Island / Luxury Cotton</option>
                    <option value="oversized">Boxy Drop-Shoulder</option>
                    <option value="mercerized">Mercerized Silk-Cotton</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price in Sri Lankan Rupees (LKR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })}
                    className="form-input admin-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Fabric Weight (GSM)</label>
                  <input
                    type="number"
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: parseInt(e.target.value, 10) || 0 })}
                    className="form-input admin-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Publishing Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input admin-input"
                  >
                    <option value="Active">Active (Live on Storefront)</option>
                    <option value="Draft">Draft (Internal Only)</option>
                    <option value="Archived">Archived / Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fiber & Cotton Composition</label>
                <input
                  type="text"
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  placeholder="e.g. 100% Organic Giza 45 Long-Staple Cotton"
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Editorial Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed architectural cut and fabric integrity description..."
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collar Ribbing Specification</label>
                <input
                  type="text"
                  value={formData.collarSpec}
                  onChange={(e) => setFormData({ ...formData, collarSpec: e.target.value })}
                  className="form-input admin-input"
                  placeholder="e.g. Double-needle non-sag 1x1 ribbing"
                />
              </div>
            </div>

            {/* Right Column: Size Inventory Matrix & Image */}
            <div className="admin-form-col">
              
              {/* CLOUDINARY GARMENT IMAGE & GALLERY UPLOAD */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} color="var(--gold-bright)" />
                    <span>Garment Imagery (Cloudinary CDN)</span>
                  </label>
                  {formData.image?.includes('cloudinary') && (
                    <span style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle2 size={11} />
                      <span>Cloudinary Synced</span>
                    </span>
                  )}

                </div>

                {/* Cloudinary File Upload Dropzone / Button */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1px dashed var(--gold-border)',
                    backgroundColor: 'rgba(197, 160, 89, 0.04)',
                    padding: '1.2rem',
                    borderRadius: '2px',
                    textAlign: 'center',
                    cursor: isUploadingImage ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.8rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-bright)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gold-border)'}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />

                  {isUploadingImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={24} className="spin-animation" color="var(--gold-bright)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                        Uploading high-res garment to Cloudinary CDN...
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <UploadCloud size={24} color="var(--gold-bright)" />
                      <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                        Click to Upload Garment Photo to Cloudinary
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)' }}>
                        Supports JPG, PNG, WEBP high-resolution atelier shots
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div style={{ color: '#f87171', fontSize: '0.74rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Main Preview with Cloudinary Tag */}
                <div className="admin-image-preview-box" style={{ position: 'relative', marginBottom: '0.8rem', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                  {formData.image ? (
                    <>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/images/hero_tshirt.jpg'; }}
                      />
                      <div className="admin-image-badge" style={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid var(--gold-bright)', color: 'var(--gold-bright)' }}>
                        {formData.image?.includes('cloudinary') ? 'CLOUDINARY CDN' : 'PRIMARY SHOWCASE'}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-light-muted)', padding: '1rem' }}>
                      <ImageIcon size={32} color="var(--gold-border)" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <span style={{ fontSize: '0.78rem', display: 'block' }}>No image attached yet</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>Click "Upload Garment Photo" above</span>
                    </div>
                  )}
                </div>


                {/* Multi-Image Gallery Thumbnails */}
                {formData.images?.length > 1 && (
                  <div style={{ marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                      Garment Angle Gallery ({formData.images.length} Photos)
                    </span>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {formData.images.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            position: 'relative', 
                            width: '46px', 
                            height: '46px', 
                            flexShrink: 0, 
                            border: formData.image === imgUrl ? '2px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleSetPrimaryImage(imgUrl)}
                          title="Click to set as primary showcase image"
                        >
                          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveImage(imgUrl); }}
                              style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', padding: '1px 3px', cursor: 'pointer', fontSize: '9px' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Image URL & Presets Row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Or paste Cloudinary URL..."
                    value={formData.image}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        image: val,
                        images: [val, ...(prev.images || []).filter(i => i !== val)]
                      }));
                    }}
                    className="form-input admin-input"
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem', flex: 1 }}
                  />

                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          image: val,
                          images: [val, ...(prev.images || []).filter(i => i !== val)]
                        }));
                      }
                    }}
                    className="form-input admin-input"
                    style={{ fontSize: '0.74rem', padding: '0.4rem', width: '110px' }}
                  >
                    <option value="">Presets...</option>
                    <option value="/images/hero_tshirt.jpg">Onyx Black</option>
                    <option value="/images/tshirt_white.jpg">Optic White</option>
                    <option value="/images/pillar_knitwear.jpg">Florentine Gold</option>
                    <option value="/images/tshirt_oversized.jpg">Boxy Silhouette</option>
                  </select>
                </div>

              </div>


              {/* AVAILABLE QUANTITY & INVENTORY MATRIX */}
              <div className="admin-stock-matrix-box" style={{ padding: '1.2rem', backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', borderRadius: '3px' }}>
                
                {/* Header with Total Available Units */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} color="var(--gold-bright)" />
                    <span className="form-label" style={{ margin: 0, fontWeight: 700 }}>AVAILABLE STOCK QUANTITY</span>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid var(--gold-bright)',
                    color: 'var(--gold-bright)',
                    padding: '3px 10px',
                    borderRadius: '2px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.86rem'
                  }}>
                    {totalUnits} Pieces Available
                  </div>
                </div>

                {/* Quick Batch Quantity Distributor */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quick total qty (e.g. 50)"
                    value={quickTotalQty}
                    onChange={(e) => setQuickTotalQty(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickDistribute}
                    className="btn-secondary-outline"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Evenly distribute this total batch quantity across all available sizes"
                  >
                    <SlidersHorizontal size={12} />
                    <span>Auto-Distribute</span>
                  </button>
                </div>

                {/* Size-by-Size Quantity Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.entries(formData.inventory || {}).map(([size, count]) => (
                    <div 
                      key={size} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: '#101114',
                        border: '1px solid var(--border-dark)',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{size}</span>
                        <span style={{ fontSize: '0.68rem', color: count < 5 ? '#f87171' : 'var(--text-light-muted)' }}>
                          {count < 5 ? '(Low Stock)' : 'in stock'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleInventoryChange(size, Math.max(0, count - 1))}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-dark)',
                            color: '#fff',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => handleInventoryChange(size, e.target.value)}
                          className="admin-stock-input"
                          style={{
                            width: '54px',
                            textAlign: 'center',
                            padding: '4px',
                            fontWeight: 700,
                            color: 'var(--gold-bright)',
                            backgroundColor: '#090a0c',
                            border: '1px solid var(--border-dark)'
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleInventoryChange(size, count + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-dark)',
                            color: '#fff',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            marginLeft: '4px',
                            opacity: 0.7
                          }}
                          title="Remove size"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Size Input */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <input
                    type="text"
                    placeholder="Add size (e.g. XXL (46) or Oversized)"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.76rem', padding: '0.4rem 0.65rem', flex: 1 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="btn-primary-gold"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={13} />
                    <span>Add Size</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          <div className="admin-dialog-actions" style={{ marginTop: '1.6rem' }}>
            <button type="button" className="btn-secondary-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-gold">
              <Save size={15} />
              <span>SAVE GARMENT & INVENTORY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

