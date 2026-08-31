import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Sparkles, Check, ShoppingBag, Plus, Minus, Tag, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = ({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onCheckout
}) => {
  const navigate = useNavigate();
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);

  if (!isOpen) return null;

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
                    onClick={onClose}
                    style={{ padding: '0.85rem 1.8rem' }}
                  >
                    EXPLORE T-SHIRT CAPSULE
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item, idx) => {
                    const itemName = item.name || item.title || 'Luxury Atelier T-Shirt';
                    const itemSize = item.selectedSize || item.size || 'M (40)';
                    const itemPrice = getPrice(item);
                    const itemQty = item.qty || 1;
                    const origPrice = item.originalPriceLKR || (item.isOfferApplied ? Math.round(itemPrice * 1.2) : itemPrice);
                    const hasDiscount = origPrice > itemPrice;
                    const itemSavings = (origPrice - itemPrice) * itemQty;

                    return (
                      <div key={`${item.id}-${itemSize}-${idx}`} className="cart-item-card">
                        <img 
                          src={item.image || '/images/hero_tshirt.jpg'} 
                          alt={itemName} 
                          className="cart-item-thumbnail" 
                        />

                        <div className="cart-item-details">
                          <div className="cart-item-header">
                            <div>
                              <h4 className="cart-item-name">{itemName}</h4>
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

                          <div className="cart-item-meta-tags">
                            <span className="cart-meta-pill">Size: <strong>{itemSize}</strong></span>
                            <span className="cart-meta-pill">Color: {item.color || 'Onyx Black'}</span>
                          </div>

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
    </div>
  );
};
