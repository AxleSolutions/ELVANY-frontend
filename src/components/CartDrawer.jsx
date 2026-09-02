import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Sparkles, Check, ShoppingBag, Plus, Minus, Tag, Gift, Eye, Download, Maximize2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadImageFile } from '../lib/bespokeMockupGenerator';

export const CartDrawer = ({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onNavigateToCollection
}) => {
  const navigate = useNavigate();
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);
  const [activeAngles, setActiveAngles] = useState({}); // { [itemUniqueKey]: 'front' | 'back' | 'left' | 'right' }
  const [inspectedBespokeItem, setInspectedBespokeItem] = useState(null);

  if (!isOpen) return null;

  const handleExploreCapsule = () => {
    onClose();
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      navigate('/collection');
    }
  };

  const getPrice = (item) => {
    return item.priceLKR || item.price || 18500;
  };

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (getPrice(item) * (item.qty || 1)), 0);
  
  // Calculate total savings from promotional offers
  const totalSavings = cartItems.reduce((sum, item) => {
    const itemPrice = getPrice(item);
    const origPrice = item.originalPriceLKR || itemPrice;
    if (origPrice > itemPrice) {
      return sum + ((origPrice - itemPrice) * (item.qty || 1));
    }
    return sum;
  }, 0);

  const originalSubtotal = subtotal + totalSavings;
  const freeShippingThreshold = 50000;

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  const handleOpenOrderReview = (orderId) => {
    onClose();
    setOrderConfirmedData(null);
    navigate(`/order-review/${orderId}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-lenis-prevent="true" style={{ zIndex: 10000 }}>
      <aside 
        className="cart-drawer-container" 
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Drawer Header */}
        <div className="cart-header">
          <div className="cart-title-group">
            <ShoppingBag size={18} color="var(--gold-bright)" />
            <h3 className="cart-title">
              {orderConfirmedData ? 'ORDER PASSPORT' : `SHOPPING BAG (${totalItemsCount})`}
            </h3>
          </div>
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={() => { setOrderConfirmedData(null); onClose(); }}
            title="Close Bag"
          >
            <X size={20} />
          </button>
        </div>

        {orderConfirmedData ? (
          /* Order Confirmed View */
          <div className="cart-confirmed-view">
            <div className="cart-confirmed-icon-wrap">
              <Check size={30} />
            </div>

            <div className="admin-badge-gold" style={{ alignSelf: 'center', marginBottom: '0.8rem' }}>
              ATELIER VIP DISPATCH CONFIRMED
            </div>

            <h3 className="cart-confirmed-title">
              Order Registered Successfully
            </h3>
            
            <p className="cart-confirmed-order-code">
              Order Passport: <strong>#{orderConfirmedData.orderId}</strong>
            </p>

            <div className="cart-confirmed-box">
              <div className="cart-confirmed-box-tag">
                EXPRESS COURIER LOGISTICS
              </div>
              <p className="cart-confirmed-box-desc">
                Your luxury Florence garment parcel has been registered for tailoring reconciliation and express courier delivery. You can monitor live fulfillment telemetry from your account.
              </p>

              <button
                type="button"
                className="btn-primary-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '0.95rem' }}
                onClick={() => {
                  setOrderConfirmedData(null);
                  onClose();
                  navigate('/account?tab=orders');
                }}
              >
                <span>VIEW IN MY ORDERS</span>
                <ArrowRight size={14} />
              </button>
            </div>


            <button
              type="button"
              className="cart-continue-btn"
              onClick={() => { setOrderConfirmedData(null); onClose(); }}
            >
              Continue Exploring Collection
            </button>
          </div>
        ) : (
          /* Standard Active Shopping Bag Body */
          <>
            {/* Free Courier Telemetry Progress Banner */}
            <div className="cart-shipping-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={14} color="var(--gold-bright)" />
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <strong style={{ color: 'var(--gold-bright)' }}>Complimentary Island-Wide Courier Applied</strong>
                  ) : (
                    <span>Add <strong style={{ color: 'var(--gold-bright)' }}>{formatLKR(freeShippingThreshold - subtotal)}</strong> for Free Courier</span>
                  )}
                </span>
              </div>
              <div className="cart-shipping-bar-track">
                <div 
                  className="cart-shipping-bar-fill" 
                  style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon-wrap">
                    <ShoppingBag size={34} color="var(--gold-bright)" />
                  </div>
                  <h4 className="cart-empty-title">Your shopping bag is empty</h4>
                  <p className="cart-empty-desc">
                    Discover 280 GSM heavyweight cotton and rare Sea Island t-shirt silhouettes.
                  </p>
                  <button 
                    type="button"
                    className="btn-primary-gold"
                    onClick={handleExploreCapsule}
                    style={{ padding: '0.85rem 1.8rem' }}
                  >
                    EXPLORE T-SHIRT CAPSULE
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item, idx) => {
                    const itemKey = `${item.id}-${item.selectedSize || item.size || 'M'}-${idx}`;
                    const itemName = item.name || item.title || 'Luxury Atelier T-Shirt';
                    const itemSize = item.selectedSize || item.size || 'M (40)';
                    const itemPrice = getPrice(item);
                    const itemQty = item.qty || 1;
                    const origPrice = item.originalPriceLKR || (item.isOfferApplied ? Math.round(itemPrice * 1.2) : itemPrice);
                    const hasDiscount = origPrice > itemPrice;
                    const itemSavings = (origPrice - itemPrice) * itemQty;

                    const isBespoke = Boolean(item.isBespokeCustom || item.designCode || (item.title || itemName || '').includes('Bespoke') || (item.title || itemName || '').includes('Custom'));
                    const currentAngle = activeAngles[itemKey] || 'front';
                    
                    // Determine image to display based on selected angle
                    let displayImg = item.image || '/images/hero_tshirt.jpg';
                    if (isBespoke && item.views) {
                      displayImg = item.views[currentAngle] || item.views.front || item.image || item.previewThumbnail;
                    }

                    // Check prints presence per angle
                    const arts = item.artworks || {};
                    const angleHasPrint = {
                      front: Boolean(arts.front || arts.left_chest || arts.right_chest),
                      back: Boolean(arts.back || arts.nape),
                      left: Boolean(arts.left_sleeve),
                      right: Boolean(arts.right_sleeve)
                    };

                    return (
                      <div key={itemKey} className={`cart-item-card ${isBespoke ? 'is-bespoke-card' : ''}`}>
                        
                        {/* Thumbnail Wrap with Quick View & Angle Badge */}
                        <div className="cart-item-thumb-wrapper">
                          <img 
                            src={displayImg} 
                            alt={`${itemName} - ${currentAngle} view`} 
                            className="cart-item-thumbnail" 
                          />
                          {isBespoke && (
                            <button
                              type="button"
                              onClick={() => setInspectedBespokeItem(item)}
                              className="cart-item-thumb-zoom-btn"
                              title="Inspect All 4 Sides Blueprint"
                            >
                              <Maximize2 size={11} />
                              <span>4 SIDES</span>
                            </button>
                          )}
                        </div>

                        <div className="cart-item-details">
                          <div className="cart-item-header">
                            <div>
                              <h4 className="cart-item-name">{itemName}</h4>
                              {isBespoke && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                  <span className="cart-item-offer-pill" style={{ backgroundColor: 'rgba(197, 160, 89, 0.15)', color: 'var(--gold-bright)', borderColor: 'rgba(197, 160, 89, 0.4)' }}>
                                    <Sparkles size={10} />
                                    <span>BESPOKE ATELIER LAB</span>
                                  </span>
                                  {item.designCode && (
                                    <span style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                                      #{item.designCode}
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.isOfferApplied && (
                                <span className="cart-item-offer-pill">
                                  <Tag size={10} />
                                  <span>PRIVILEGE APPLIED ({item.offerCode || 'PROMO'})</span>
                                </span>
                              )}
                            </div>
                            <button 
                              type="button"
                              className="cart-item-remove"
                              onClick={() => onRemoveItem(item.id, itemSize)}
                              title="Remove garment"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* 4-Angle Switcher Tabs for Bespoke Custom Garments */}
                          {isBespoke && (
                            <div className="cl-cart-angles-row">
                              <span className="cl-cart-angles-label">VIEW ANGLE:</span>
                              <div className="cl-cart-angle-buttons">
                                {['front', 'back', 'left', 'right'].map((ang) => {
                                  const isActive = currentAngle === ang;
                                  const hasArt = angleHasPrint[ang];
                                  const labels = { front: 'FRONT', back: 'BACK', left: 'LEFT', right: 'RIGHT' };
                                  return (
                                    <button
                                      key={ang}
                                      type="button"
                                      onClick={() => setActiveAngles(prev => ({ ...prev, [itemKey]: ang }))}
                                      className={`cl-cart-angle-btn ${isActive ? 'active' : ''}`}
                                      title={`View ${labels[ang]} side of customized t-shirt`}
                                    >
                                      <span>{labels[ang]}</span>
                                      {hasArt && <span className="cl-angle-art-dot" title="Custom graphic present" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="cart-item-meta-tags">
                            <span className="cart-meta-pill">Size: <strong>{itemSize}</strong></span>
                            <span className="cart-meta-pill">Color: {item.color || 'Onyx Black'}</span>
                            {item.fabric && <span className="cart-meta-pill">{item.fabric}</span>}
                          </div>

                          {item.customPlacements && item.customPlacements.length > 0 && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', marginTop: '2px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>Prints ({item.customPlacements.length}):</span>
                              <strong style={{ color: '#fff' }}>{item.customPlacements.join(' • ')}</strong>
                            </div>
                          )}

                          {/* Price & Quantity Row with Stock Limits */}
                          {(() => {

                            const itemMaxStock = (item.inventory && item.inventory[itemSize] !== undefined)
                              ? Number(item.inventory[itemSize])
                              : (item.maxStock || item.totalStock || 999);
                            const isAtMax = itemQty >= itemMaxStock;

                            return (
                              <div className="cart-item-footer">
                                <div className="qty-control">
                                  <button 
                                    type="button" 
                                    onClick={() => onUpdateQty(item.id, itemSize, itemQty - 1)}
                                    title="Decrease quantity"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="qty-number">{itemQty}</span>
                                  <button 
                                    type="button" 
                                    disabled={isAtMax}
                                    onClick={() => onUpdateQty(item.id, itemSize, itemQty + 1)}
                                    style={{
                                      opacity: isAtMax ? 0.35 : 1,
                                      cursor: isAtMax ? 'not-allowed' : 'pointer'
                                    }}
                                    title={isAtMax ? `Maximum stock reached (${itemMaxStock} available)` : 'Increase quantity'}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <div className="cart-item-price-wrap">
                                  {itemMaxStock <= 3 && (
                                    <span style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', fontWeight: 600, display: 'block' }}>
                                      {itemMaxStock === 1 ? 'Last piece in stock' : `Only ${itemMaxStock} left`}
                                    </span>
                                  )}
                                  {hasDiscount && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 600, marginBottom: '2px', display: 'block' }}>
                                      Save {formatLKR(itemSavings)}
                                    </span>
                                  )}
                                  
                                  <div className="cart-item-price">
                                    {formatLKR(itemPrice * itemQty)}
                                  </div>

                                  {hasDiscount && (
                                    <span className="cart-item-original-price">
                                      {formatLKR(origPrice * itemQty)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer Checkout Bar */}
            {cartItems.length > 0 && (
              <div className="cart-footer">
                {/* Regular Price vs Offer Discount Breakdown */}
                {totalSavings > 0 && (
                  <>
                    <div className="cart-subtotal-row sub" style={{ textDecoration: 'line-through' }}>
                      <span>Original Value</span>
                      <span>{formatLKR(originalSubtotal)}</span>
                    </div>

                    <div className="cart-subtotal-row sub" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={13} color="var(--gold-bright)" />
                        <span>Privilege Savings Applied</span>
                      </span>
                      <span>-{formatLKR(totalSavings)}</span>
                    </div>
                  </>
                )}

                <div className="cart-subtotal-row">
                  <span className="cart-subtotal-label">Subtotal</span>
                  <span className="cart-subtotal-value">{formatLKR(subtotal)}</span>
                </div>

                <div className="cart-subtotal-row sub">
                  <span>Island-Wide Delivery</span>
                  <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>Complimentary Courier</span>
                </div>

                <button 
                  type="button"
                  className="btn-primary-gold cart-checkout-btn"
                  onClick={handleCheckoutClick}
                >
                  <span>CHECKOUT</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </aside>

      {/* 4-Sides Blueprint Inspection Modal */}
      {inspectedBespokeItem && (
        <div 
          className="modal-backdrop" 
          onClick={() => setInspectedBespokeItem(null)}
          style={{ zIndex: 11000, padding: '1.5rem', overflowY: 'auto' }}
        >
          <div 
            className="fitting-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '860px', width: '100%', margin: 'auto', backgroundColor: '#0d0e12', border: '1px solid var(--gold-border)', borderRadius: '4px', padding: '1.8rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-bright)', fontSize: '0.72rem', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Sparkles size={13} />
                  <span>MAISON ELVANY • BESPOKE 4-AXIS BLUEPRINT</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0 0.4rem 0' }}>
                  {inspectedBespokeItem.name || 'Custom Bespoke Garment'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light-secondary)' }}>
                  Code: <strong style={{ color: 'var(--gold-bright)' }}>#{inspectedBespokeItem.designCode || 'BL-CUSTOM'}</strong> • {inspectedBespokeItem.color} • Size {inspectedBespokeItem.selectedSize || inspectedBespokeItem.size || 'L'}
                </div>
              </div>

              <button 
                type="button" 
                className="modal-close-icon" 
                onClick={() => setInspectedBespokeItem(null)}
                style={{ position: 'static' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 4-Panels Blueprint Grid: Front, Back, Left, Right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '1.4rem' }}>
              {[
                { key: 'front', label: '1. FRONT VIEW', img: inspectedBespokeItem.views?.front || inspectedBespokeItem.image },
                { key: 'back', label: '2. BACK VIEW', img: inspectedBespokeItem.views?.back || inspectedBespokeItem.image },
                { key: 'left', label: '3. LEFT SLEEVE', img: inspectedBespokeItem.views?.left || inspectedBespokeItem.image },
                { key: 'right', label: '4. RIGHT SLEEVE', img: inspectedBespokeItem.views?.right || inspectedBespokeItem.image }
              ].map((panel) => (
                <div 
                  key={panel.key}
                  style={{
                    backgroundColor: '#07080a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    padding: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.1', overflow: 'hidden', borderRadius: '2px', backgroundColor: '#040507', marginBottom: '6px' }}>
                    <img 
                      src={panel.img || '/images/hero_tshirt.jpg'} 
                      alt={panel.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.08em' }}>
                    {panel.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Placements & Notes */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '3px', padding: '10px 14px', marginBottom: '1.4rem', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                <span>Custom Prints: <strong style={{ color: '#fff' }}>{inspectedBespokeItem.customPlacements?.join(' • ') || 'Configured Graphic Prints'}</strong></span>
                <span>Fabric Grade: <strong style={{ color: 'var(--gold-bright)' }}>{inspectedBespokeItem.fabric || 'Luxury Heavyweight Cotton'}</strong></span>
              </div>
              {inspectedBespokeItem.customNotes && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', fontStyle: 'italic', color: '#fff' }}>
                  "{inspectedBespokeItem.customNotes}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline-gold"
                onClick={() => downloadImageFile(inspectedBespokeItem.blueprintImage || inspectedBespokeItem.image, `bespoke_blueprint_${inspectedBespokeItem.designCode || 'garment'}.png`)}
                style={{ padding: '0.7rem 1.2rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>SAVE 4-SIDES PHOTO</span>
              </button>

              <button
                type="button"
                className="btn-primary-gold"
                onClick={() => setInspectedBespokeItem(null)}
                style={{ padding: '0.7rem 1.4rem', fontSize: '0.76rem' }}
              >
                <span>CLOSE INSPECTION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
