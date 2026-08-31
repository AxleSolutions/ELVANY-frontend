import React from 'react';
import { ShoppingBag, Check, Bell, Plus, Minus } from 'lucide-react';

export const MobileStickyBuyBar = ({
  product,
  selectedSize,
  selectedColor,
  qty,
  setQty,
  effectivePrice,
  originalPrice,
  isOfferActive,
  savings,
  isJustAdded,
  onAddToCart,
  onOpenRestockModal,
  selectedSizeStock = 10
}) => {
  const isAvailable = selectedSizeStock > 0;

  const formatLKR = (val) => {
    return `LKR ${Number(val || 0).toLocaleString()}`;
  };

  const handleAddClick = (e) => {
    if (!isAvailable) {
      e.preventDefault();
      onOpenRestockModal();
      return;
    }

    const productToAdd = isOfferActive ? {
      ...product,
      priceLKR: effectivePrice,
      originalPriceLKR: originalPrice,
      color: selectedColor,
      isOfferApplied: true
    } : {
      ...product,
      color: selectedColor
    };
    const addQty = Math.min(qty, selectedSizeStock);
    onAddToCart(productToAdd, selectedSize, addQty);
  };

  return (
    <aside className="pdp-mobile-sticky-bar" id="mobile-sticky-buy-bar" aria-label="Purchase Bar">
      <div className="pdp-sticky-bar-inner">
        
        {/* Clean, Comfortable Stepper */}
        <div className="pdp-sticky-stepper-wrap" style={{ opacity: isAvailable ? 1 : 0.4 }}>
          <button 
            type="button" 
            className="pdp-stepper-btn"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={!isAvailable || qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="pdp-stepper-val">{isAvailable ? Math.min(qty, selectedSizeStock) : 0}</span>
          <button 
            type="button" 
            className="pdp-stepper-btn"
            onClick={() => setQty(Math.min(selectedSizeStock, qty + 1))}
            disabled={!isAvailable || qty >= selectedSizeStock}
            aria-label="Increase quantity"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Primary Spacious Luxury Add to Bag Action Button */}
        <button
          type="button"
          id="mobile-add-to-bag-btn"
          className={`pdp-sticky-main-btn ${isJustAdded ? 'is-added' : ''} ${!isAvailable ? 'is-soldout' : ''}`}
          onClick={handleAddClick}
        >
          {!isAvailable ? (
            <div className="pdp-btn-content">
              <Bell size={16} />
              <span>REQUEST RE-ISSUE</span>
            </div>
          ) : isJustAdded ? (
            <div className="pdp-btn-content">
              <Check size={17} className="animate-check" />
              <span>ADDED TO BAG</span>
            </div>
          ) : (
            <div className="pdp-btn-content">
              <ShoppingBag size={16} />
              <span className="pdp-btn-title">ADD TO BAG</span>
              <span className="pdp-btn-dot">•</span>
              <span className="pdp-btn-price">{formatLKR(effectivePrice * Math.max(1, qty))}</span>
            </div>
          )}
        </button>

      </div>
    </aside>
  );
};
