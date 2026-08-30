import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Star, Check, ShieldCheck, ArrowRight, PackageCheck, Eye, MessageSquare } from 'lucide-react';
import { INITIAL_ORDERS } from '../data/orders';

export const OrderReviewPortalPage = ({ ordersList = INITIAL_ORDERS, onAddNewReview, allReviewsMap = {} }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Find order by ID / order_code or default to first order
  const activeOrder = ordersList.find((o) => {
    const code = (o.orderId || o.order_code || o.id || '').toUpperCase();
    return code === (orderId || '').toUpperCase();
  }) || ordersList[0];

  // Helper to reliably get product identifier from an item object
  const getItemId = (item) => item?.productId || item?.product_id || item?.id || 'item';

  // Helper to find existing review in database for this specific item and order
  const getExistingItemReview = (item) => {
    if (!allReviewsMap) return null;
    const allRevs = Object.values(allReviewsMap).flat();
    const orderCode = (activeOrder?.orderId || activeOrder?.order_code || activeOrder?.id || orderId || '').toUpperCase();
    const itemId = (item?.productId || item?.product_id || item?.id || '').toLowerCase();
    const itemName = (item?.name || item?.title || '').toLowerCase();

    return allRevs.find((r) => {
      const rOrder = (r.orderId || r.order_id || '').toUpperCase();
      const rProd = (r.productId || r.product_id || '').toLowerCase();
      const rTitle = (r.productTitle || '').toLowerCase();

      const orderMatches = rOrder && (rOrder === orderCode || (activeOrder?.id && rOrder === activeOrder.id.toUpperCase()));
      const prodMatches = (itemId && rProd === itemId) || (itemName && rTitle === itemName);

      return (orderMatches && prodMatches) || (orderMatches && !rProd);
    });
  };

  // Track submitted reviews per item (keyed by item identifier)
  const [submittedMap, setSubmittedMap] = useState({});
  const [formDataMap, setFormDataMap] = useState({});
  const [isSubmittingMap, setIsSubmittingMap] = useState({});


  const isDelivered = activeOrder?.status === 'Delivered' || (activeOrder?.status || '').toLowerCase().includes('delivered');

  if (!activeOrder) {
    return (
      <div className="submit-review-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-light-secondary)', marginBottom: '2rem' }}>Please verify the order review link from your package.</p>
          <button className="btn-primary-gold" onClick={() => navigate('/')}>RETURN HOME</button>
        </div>
      </div>
    );
  }

  if (!isDelivered) {
    return (
      <div className="submit-review-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(197, 160, 89, 0.12)',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldCheck size={32} color="var(--gold-bright)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.8rem', color: '#ffffff' }}>
            Client Evaluation Locked
          </h2>
          <p style={{ color: 'var(--text-light-secondary)', lineHeight: 1.6, fontSize: '0.88rem', marginBottom: '1.8rem' }}>
            Maison ELVANY guarantees authenticated reviews. Client evaluations are unlocked exclusively once your parcel has been successfully delivered and handed over by our courier network.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem',
            color: 'var(--gold-bright)',
            marginBottom: '2rem'
          }}>
            <span>Order Code: <strong style={{ color: '#fff' }}>{activeOrder.order_code || activeOrder.orderId}</strong></span>
            <span>•</span>
            <span>Status: <strong>{activeOrder.status || 'Processing Dispatch'}</strong></span>
          </div>
          <div>
            <button className="btn-primary-gold" onClick={() => navigate('/account')}>
              RETURN TO MY ORDERS
            </button>
          </div>
        </div>
      </div>
    );
  }


  const handleFieldChange = (key, field, val) => {
    setFormDataMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { rating: 5, title: '', content: '' }),
        [field]: val
      }
    }));
  };

  const handleItemReviewSubmit = async (item) => {
    const key = getItemId(item);
    const data = formDataMap[key] || { rating: 5, title: '', content: '' };
    if (!data.content && !data.comment) return;

    setIsSubmittingMap((prev) => ({ ...prev, [key]: true }));

    const clientName = activeOrder.customer_name || activeOrder.customerName || activeOrder.delivery_address?.recipientName || 'Verified Client';
    const clientLoc = activeOrder.delivery_address?.city || activeOrder.customerLocation || 'Colombo, Sri Lanka';
    const resolvedProdId = item.productId || item.product_id || item.id;
    const resolvedOrderCode = activeOrder.order_code || activeOrder.orderId || activeOrder.id || orderId;

    const reviewObj = {
      id: `rev-order-${Date.now()}-${key}`,
      productId: resolvedProdId,
      orderId: resolvedOrderCode,
      author: clientName,
      location: clientLoc,
      rating: Number(data.rating || 5),
      date: 'Just now',
      sizePurchased: item.selectedSize || item.size || 'M (40)',
      colorPurchased: item.color || 'Onyx Black',
      title: data.title || 'Exceptional Quality & Drape',
      content: data.content || data.comment,
      comment: data.content || data.comment,
      fitRating: data.fitRating || 'True to Atelier Boxy Spec',
      helpfulCount: 0
    };

    if (onAddNewReview) {
      await onAddNewReview(resolvedProdId, reviewObj);
    }

    setIsSubmittingMap((prev) => ({ ...prev, [key]: false }));
    setSubmittedMap((prev) => ({ ...prev, [key]: true }));
  };


  return (
    <div className="submit-review-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '4rem 0 7rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
            <button 
              className="search-back-btn"
              onClick={() => navigate('/')}
              style={{ marginBottom: 0 }}
            >
              <Home size={14} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              VERIFIED ORDER EVALUATION
            </span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(197,160,89,0.1)', border: '1px solid var(--gold-border)', padding: '0.4rem 0.85rem', borderRadius: '2px', fontSize: '0.74rem', color: 'var(--gold-bright)' }}>
            <ShieldCheck size={14} />
            <span>VERIFIED CLIENT ORDER PORTAL</span>
          </div>
        </div>

        {/* Order Passport Header Card */}
        <div style={{
          backgroundColor: '#121316',
          border: '1px solid var(--border-dark)',
          padding: '2.5rem',
          borderRadius: '2px',
          marginBottom: '3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1.8rem', marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/logo/Main-4.png" 
                  alt="ELVANY Seal" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
                  MAISON ELVANY CLIENT ORDER
                </div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: '#fff', margin: 0 }}>
                  Order #{activeOrder.orderId}
                </h1>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--gold-bright)',
                color: '#000000',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: '2px',
                textTransform: 'uppercase'
              }}>
                <PackageCheck size={14} />
                <span>{activeOrder.status}</span>
              </span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)', marginTop: '0.4rem' }}>
                Delivered: {activeOrder.orderDate}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em' }}>CLIENT NAME</span>
              <strong style={{ color: '#fff' }}>{activeOrder.customerName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em' }}>DELIVERY DESTINATION</span>
              <strong style={{ color: '#fff' }}>{activeOrder.customerLocation}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em' }}>GARMENTS IN ORDER</span>
              <strong style={{ color: 'var(--gold-bright)' }}>{activeOrder.items.length} {activeOrder.items.length === 1 ? 'Piece' : 'Pieces'}</strong>
            </div>
          </div>
        </div>

        {/* Individual Item Reviews Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff' }}>
              Evaluate Garments from Your Order
            </h2>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.85rem' }}>
              Submit an authenticated review for each piece in your package. Your evaluation will be published to that garment's public page.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {activeOrder.items.map((item, idx) => {
              const itemKey = getItemId(item) || `item-${idx}`;
              const existingReview = getExistingItemReview(item);
              const isSubmitted = submittedMap[itemKey] || !!existingReview;
              const isSubmitting = isSubmittingMap[itemKey];
              const formData = formDataMap[itemKey] || { rating: 5, title: '', content: '', fitRating: 'True to Atelier Boxy Spec' };
              const prodId = item.productId || item.product_id || item.id;

              return (
                <div 
                  key={itemKey}
                  style={{
                    backgroundColor: '#121316',
                    border: isSubmitted ? '1px solid var(--gold-border)' : '1px solid var(--border-dark)',
                    padding: '2.2rem',
                    borderRadius: '2px'
                  }}
                >
                  {/* Item Mini Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '80px', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff', marginBottom: '0.3rem' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)' }}>
                        Purchased: {item.selectedSize || item.size} • {item.color}
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/product/${prodId}`)}
                      className="section-action-link"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <Eye size={12} />
                      <span>VIEW PIECE</span>
                    </button>
                  </div>

                  {/* If Review for this item is Already Submitted / Authenticated */}
                  {isSubmitted ? (
                    <div style={{ backgroundColor: 'rgba(197, 160, 89, 0.08)', border: '1px solid rgba(197, 160, 89, 0.25)', padding: '1.8rem', borderRadius: '2px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold-bright)', marginBottom: '0.5rem' }}>
                        <Check size={18} color="var(--gold-bright)" />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                          EVALUATION AUTHENTICATED & PUBLISHED
                        </span>
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.4rem' }}>
                        {existingReview?.title || `Review Published for ${item.name}`}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--gold-bright)', gap: '3px', marginBottom: '0.6rem' }}>
                        {[...Array(existingReview?.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="var(--gold-bright)" color="var(--gold-bright)" />
                        ))}
                      </div>
                      {existingReview?.content && (
                        <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.86rem', fontStyle: 'italic', maxWidth: '520px', margin: '0 auto 1.2rem auto', lineHeight: 1.5 }}>
                          "{existingReview.content}"
                        </p>
                      )}
                      <button 
                        className="btn-primary-gold" 
                        onClick={() => navigate(`/product/${prodId}`)}
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.78rem' }}
                      >
                        <span>VIEW ON PRODUCT PAGE</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ) : (
                    /* Review Form for this item */
                    <form onSubmit={(e) => { e.preventDefault(); handleItemReviewSubmit(item); }}>
                      {/* Star Rating */}
                      <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label className="form-label">Garment Rating</label>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map((star) => (

                            <button
                              type="button"
                              key={star}
                              onClick={() => handleFieldChange(itemKey, 'rating', star)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                color: star <= (formData.rating || 5) ? 'var(--gold-bright)' : 'rgba(255,255,255,0.2)'
                              }}
                            >
                              <Star size={22} fill={star <= (formData.rating || 5) ? 'var(--gold-bright)' : 'transparent'} />
                            </button>
                          ))}
                          <span style={{ fontSize: '0.82rem', color: 'var(--gold-bright)', fontWeight: 600, marginLeft: '0.4rem' }}>
                            {formData.rating || 5} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label className="form-label">Review Headline</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Holds collar shape perfectly, dense heavyweight feel"
                          className="form-input"
                          value={formData.title || ''}
                          onChange={(e) => handleFieldChange(itemKey, 'title', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Detailed Feedback on Fabric, Collar & Fit</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Describe how the cotton feels, how the neckline holds up after washing, and the fit silhouette..."
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          value={formData.content || ''}
                          onChange={(e) => handleFieldChange(itemKey, 'content', e.target.value)}
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn-primary-gold"
                        style={{ padding: '0.85rem 1.8rem', fontSize: '0.82rem', cursor: isSubmitting ? 'wait' : 'pointer' }}
                      >
                        <span>{isSubmitting ? 'AUTHENTICATING & PUBLISHING...' : 'SUBMIT REVIEW FOR THIS GARMENT'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};
