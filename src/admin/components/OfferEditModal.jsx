import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Tag, Gift, Percent, Image, DollarSign, Clock, Calendar } from 'lucide-react';

export const OfferEditModal = ({ isOpen, onClose, offer, onSave, products = [] }) => {
  const [formData, setFormData] = useState({
    id: null,
    productId: null,
    productName: '',
    productImage: '/images/hero_tshirt.jpg',
    badge: 'ATELIER LAUNCH PRIVILEGE',
    title: '',
    subtitle: '',
    code: '',
    originalPriceLKR: 18500,
    offerPriceLKR: 15500,
    discountTag: 'SAVE LKR 3,000',
    remainingUnits: 6,
    totalAllocation: 25,
    availableSizes: ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'],
    sizesText: 'S (38), M (40), L (42), XL (44), XXL (46)',
    isActive: true,
    endsAt: null
  });

  const [durationDays, setDurationDays] = useState('2');
  const [customDateTime, setCustomDateTime] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (offer) {
      const sizesArray = Array.isArray(offer.availableSizes) 
        ? offer.availableSizes 
        : (offer.availableSizes ? [offer.availableSizes] : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)']);
      
      const existingEndsAt = offer.endsAt || offer.expires_at || offer.expiresAt || null;
      setFormData({
        ...offer,
        productId: offer.productId || null,
        sizesText: sizesArray.join(', '),
        endsAt: existingEndsAt
      });

      if (existingEndsAt) {
        const diffHours = Math.max(1, Math.round((new Date(existingEndsAt).getTime() - Date.now()) / (1000 * 60 * 60)));
        const diffDays = Math.round(diffHours / 24);
        if ([1, 2, 3, 5, 7].includes(diffDays)) {
          setDurationDays(String(diffDays));
        } else {
          setDurationDays('custom');
          try {
            setCustomDateTime(new Date(existingEndsAt).toISOString().slice(0, 16));
          } catch {
            setCustomDateTime('');
          }
        }
      } else {
        setDurationDays('2');
      }
    } else {
      const defaultProd = products[0] || null;
      const defOrigPrice = defaultProd ? (defaultProd.originalPriceLKR || defaultProd.priceLKR || 18500) : 18500;
      const defOfferPrice = defaultProd ? Math.max(0, defOrigPrice - 3000) : 15500;
      const defSizes = defaultProd?.sizes?.length > 0 ? defaultProd.sizes : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'];
      const defaultExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

      setFormData({
        id: null,
        productId: defaultProd?.id || null,
        productName: defaultProd?.title || defaultProd?.name || 'The 280 GSM Heavyweight Crewneck Tee',
        productImage: defaultProd?.image || defaultProd?.images?.[0] || '/images/hero_tshirt.jpg',
        badge: 'ATELIER LAUNCH PRIVILEGE',
        title: 'Signature Atelier Privilege Drop',
        subtitle: defaultProd?.subtitle || defaultProd?.description || 'Florence combed noble cotton finished with double-needle bound collar. Limited batch allocation.',
        code: 'ATELIERVIP',
        originalPriceLKR: defOrigPrice,
        offerPriceLKR: defOfferPrice,
        discountTag: `SAVE LKR ${(defOrigPrice - defOfferPrice).toLocaleString()}`,
        remainingUnits: 6,
        totalAllocation: 25,
        availableSizes: defSizes,
        sizesText: defSizes.join(', '),
        isActive: true,
        endsAt: defaultExpiry
      });
      setDurationDays('2');
    }
  }, [offer, isOpen, products]);


  const handleSelectProduct = (selectedProductId) => {
    const selected = products.find(p => p.id === selectedProductId);
    if (!selected) return;

    const origPrice = selected.originalPriceLKR || selected.priceLKR || 18500;
    const offerPrice = Math.max(0, origPrice - 3000);
    const sizes = selected.sizes?.length > 0 ? selected.sizes : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'];

    setFormData(prev => ({
      ...prev,
      productId: selected.id,
      productName: selected.title || selected.name,
      productImage: selected.image || selected.images?.[0] || prev.productImage,
      originalPriceLKR: origPrice,
      offerPriceLKR: offerPrice,
      discountTag: `SAVE LKR ${(origPrice - offerPrice).toLocaleString()}`,
      sizesText: sizes.join(', '),
      availableSizes: sizes,
      subtitle: prev.subtitle || selected.subtitle || selected.description || ''
    }));
  };


  if (!isOpen) return null;

  const handlePriceChange = (newOfferPrice, newOriginalPrice) => {
    const offerPrice = parseInt(newOfferPrice !== undefined ? newOfferPrice : formData.offerPriceLKR) || 0;
    const origPrice = parseInt(newOriginalPrice !== undefined ? newOriginalPrice : formData.originalPriceLKR) || 0;
    const diff = origPrice - offerPrice;

    setFormData(prev => ({
      ...prev,
      originalPriceLKR: origPrice,
      offerPriceLKR: offerPrice,
      discountTag: diff > 0 ? `SAVE LKR ${diff.toLocaleString()}` : 'SPECIAL ALLOCATION'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title && !formData.productName) return;

    // Parse comma separated sizes
    const parsedSizes = formData.sizesText
      ? formData.sizesText.split(',').map(s => s.trim()).filter(Boolean)
      : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'];

    let computedEndsAt = formData.endsAt;
    if (durationDays === 'custom' && customDateTime) {
      computedEndsAt = new Date(customDateTime).toISOString();
    } else if (durationDays && durationDays !== 'custom') {
      const days = parseInt(durationDays, 10) || 2;
      computedEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    const finalOffer = {
      ...formData,
      productName: formData.productName || formData.title,
      availableSizes: parsedSizes,
      endsAt: computedEndsAt,
      expires_at: computedEndsAt,
      expiresAt: computedEndsAt
    };

    onSave(finalOffer);
    onClose();
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="admin-edit-dialog"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div>
            <div className="admin-dialog-subtitle">CUSTOM PROMOTIONAL PRIVILEGE</div>
            <h2 className="admin-dialog-title">
              {offer ? `Edit Privilege: ${offer.title || offer.productName}` : 'Create Custom Privilege Offer'}
            </h2>
          </div>
          <button className="admin-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-dialog-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Link to Catalog Product */}
            {products.length > 0 && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Link with Catalog Garment</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--gold-bright)' }}>Auto-syncs live stock & price</span>
                </label>
                <select
                  value={formData.productId || ''}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="form-input admin-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">-- Custom Atelier Offer --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title || p.name} (LKR {(p.originalPriceLKR || p.priceLKR || 18500).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Item / Privilege Name */}
            <div className="form-group">
              <label className="form-label">Garment / Privilege Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. The 280 GSM Heavyweight Crewneck Tee"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            {/* Custom Image URL */}
            <div className="form-group">
              <label className="form-label">Garment / Showcase Image URL</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  placeholder="/images/hero_tshirt.jpg or Cloudinary Image URL"
                  value={formData.productImage}
                  onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                  className="form-input admin-input"
                  style={{ flex: 1 }}
                />
                {formData.productImage && (
                  <img 
                    src={formData.productImage} 
                    alt="Preview" 
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)', backgroundColor: '#000' }}
                    onError={(e) => { e.target.src = '/images/hero_tshirt.jpg'; }}
                  />
                )}
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Privilege Badge Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ATELIER LAUNCH PRIVILEGE"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Promo Voucher Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HEAVY280"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-input admin-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Offer Headline Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Signature 280 GSM Heavyweight Edition"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Offer Description & Silhouette Notes</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Florence combed organic cotton with double-needle bound non-sag collar. Claim your private allocation."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            {/* Price Markdown Row - 100% Free Custom Prices */}
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Original Retail Price (LKR)</label>
                <input
                  type="number"
                  required
                  value={formData.originalPriceLKR}
                  onChange={(e) => handlePriceChange(undefined, e.target.value)}
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Promotional Offer Price (LKR)</label>
                <input
                  type="number"
                  required
                  value={formData.offerPriceLKR}
                  onChange={(e) => handlePriceChange(e.target.value, undefined)}
                  className="form-input admin-input"
                  style={{ color: 'var(--gold-bright)', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Scarcity / Units Allocation */}
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Remaining Units Left in Batch</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.remainingUnits}
                  onChange={(e) => setFormData({ ...formData, remainingUnits: parseInt(e.target.value) || 1 })}
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Batch Allocation</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.totalAllocation}
                  onChange={(e) => setFormData({ ...formData, totalAllocation: parseInt(e.target.value) || 25 })}
                  className="form-input admin-input"
                />
              </div>
            </div>

            {/* Sizes Specification */}
            <div className="form-group">
              <label className="form-label">Available Sizes (Comma Separated)</label>
              <input
                type="text"
                placeholder="S (38), M (40), L (42), XL (44), XXL (46)"
                value={formData.sizesText}
                onChange={(e) => setFormData({ ...formData, sizesText: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            {/* Offer Timer Duration / Auto-Expiry Configurator */}
            <div className="form-group" style={{ backgroundColor: 'rgba(197, 160, 89, 0.04)', border: '1px solid var(--gold-border)', padding: '1.2rem', borderRadius: '2px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-bright)', marginBottom: '0.6rem' }}>
                <Clock size={14} />
                <span>OFFER DURATION & AUTO-EXPIRY TIMER</span>
              </label>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', margin: '0 0 0.8rem 0' }}>
                Set how long this promotional offer remains live on the client storefront. When time expires, this offer item automatically disappears from client view.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem', marginBottom: '0.8rem' }}>
                {[
                  { label: '1 Day (24h)', val: '1' },
                  { label: '2 Days (48h)', val: '2' },
                  { label: '3 Days (72h)', val: '3' },
                  { label: '5 Days', val: '5' },
                  { label: '7 Days', val: '7' },
                  { label: 'Custom Date', val: 'custom' }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDurationDays(opt.val)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      border: durationDays === opt.val ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                      backgroundColor: durationDays === opt.val ? 'rgba(197, 160, 89, 0.15)' : '#090a0c',
                      color: durationDays === opt.val ? 'var(--gold-bright)' : 'var(--text-light-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {durationDays === 'custom' && (
                <div style={{ marginTop: '0.8rem' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Exact Target Expiration (Local Date & Time)</label>
                  <input
                    type="datetime-local"
                    required
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="form-input admin-input"
                    style={{ backgroundColor: '#090a0c', color: '#fff' }}
                  />
                </div>
              )}

              <div style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} />
                <span>
                  {durationDays === 'custom' && customDateTime
                    ? `Expires on: ${new Date(customDateTime).toLocaleString()}`
                    : `Active for ${durationDays} Day${durationDays === '1' ? '' : 's'} (Target expiry: ${new Date(Date.now() + (parseInt(durationDays, 10) || 2) * 24 * 60 * 60 * 1000).toLocaleString()})`}
                </span>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="form-group">
              <label className="form-label">Visibility in Homepage Slideshow</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="form-input admin-input"
              >
                <option value="active">Active (Visible in Slide Show)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

          </div>

          <div className="admin-dialog-actions" style={{ marginTop: '1.8rem' }}>
            <button type="button" className="btn-secondary-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-gold">
              <Save size={15} />
              <span>SAVE PRIVILEGE OFFER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

