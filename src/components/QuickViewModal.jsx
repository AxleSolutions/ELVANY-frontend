import React, { useState } from 'react';
import { X, Check, Shield, Sparkles, ShoppingBag, Bell, Ruler } from 'lucide-react';
import { RestockRequestModal } from './RestockRequestModal';
import { SizeChartModal } from './SizeChartModal';

export const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  loggedInUser,
  userProfile
}) => {
  if (!isOpen || !product) return null;

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M (40)');
  const [selectedImg, setSelectedImg] = useState(product.images?.[0] || product.image || '/images/hero_tshirt.webp');
  const [added, setAdded] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const selectedSizeStock = product.inventory ? (product.inventory[selectedSize] ?? 10) : 10;
  const isOutOfStock = selectedSizeStock <= 0 || product.status === 'Sold Out';

  const getPrice = () => {
    return `LKR ${(product.priceLKR || 18500).toLocaleString()}`;
  };

  const handleAdd = () => {
    if (isOutOfStock) {
      setIsRestockModalOpen(true);
      return;
    }
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="quick-view-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Product Gallery */}
        <div className="quick-view-gallery">
          <img 
            src={selectedImg} 
            alt={product.name} 
          />
          {product.images && product.images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 3
            }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  style={{
                    width: '48px',
                    height: '56px',
                    border: selectedImg === img ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                    borderRadius: '1px'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Specs & Purchasing */}
        <div className="quick-view-content">
          <div style={{
            color: 'var(--gold-bright)',
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            {product.badge}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: '0.6rem'
          }}>
            {product.name}
          </h2>

          <div style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--gold-bright)',
            marginBottom: '1.4rem'
          }}>
            {getPrice()}
          </div>

          {/* Provenance Box */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '2px solid var(--gold-primary)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.78rem',
            color: '#cfd2db'
          }}>
            <div style={{ color: 'var(--gold-bright)', fontWeight: 600, marginBottom: '2px' }}>
              FABRIC PROVENANCE
            </div>
            <div>{product.fabricProvenance}</div>
          </div>

          {/* Size Selection */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-light-secondary)',
              letterSpacing: '0.1em',
              marginBottom: '0.6rem'
            }}>
              <span>SELECT BESPOKE SIZE</span>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-bright)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <Ruler size={12} />
                <span>SIZE GUIDE & CHART</span>
              </button>
            </div>

            <div className="size-pill-group">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  className={`size-pill ${selectedSize === sz ? 'active' : ''}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 'auto' }}>
            <button
              className="btn-primary-gold"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1.1rem 2rem',
                backgroundColor: isOutOfStock ? 'rgba(197, 160, 89, 0.15)' : undefined,
                border: isOutOfStock ? '1px solid var(--gold-bright)' : undefined,
                color: isOutOfStock ? 'var(--gold-bright)' : undefined
              }}
              onClick={handleAdd}
            >
              {isOutOfStock ? (
                <>
                  <Bell size={16} />
                  <span>REQUEST RE-ISSUE</span>
                </>
              ) : added ? (

                <>
                  <Check size={16} />
                  <span>ADDED TO PRIVATE BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>ADD TO SHOPPING BAG • {getPrice()}</span>
                </>
              )}
            </button>

            <div style={{
              marginTop: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: 'var(--text-light-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={12} color="var(--gold-primary)" />
                <span>Complimentary tailoring adjustments at any ELVANY Atelier.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={12} color="var(--gold-primary)" />
                <span>Certificate of authenticity & lifetime cashmere guarantee.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />

      {/* Restock Request Modal */}
      <RestockRequestModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        product={product}
        selectedColor={product.color || 'Onyx Black'}
        selectedSize={selectedSize}
        loggedInUser={loggedInUser}
        userProfile={userProfile}
      />
    </div>
  );
};

