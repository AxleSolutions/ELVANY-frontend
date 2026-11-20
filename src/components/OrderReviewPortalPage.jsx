import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Star, Check, ShieldCheck, ArrowRight, PackageCheck, Eye, MessageSquare, Camera, Upload, X, Sparkles, Maximize2, Lock } from 'lucide-react';
import { INITIAL_ORDERS } from '../data/orders';
import { getOrderById, getReviews, recordReviewInLocalRegistry } from '../services/dbService';
import { uploadReviewImageToCloudinary } from '../lib/cloudinary';

export const OrderReviewPortalPage = ({ ordersList = INITIAL_ORDERS, onAddNewReview, allReviewsMap = {} }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Find order in initial props or wait for direct fetch
  const findInOrders = (list, idToMatch) => {
    if (!list || list.length === 0 || !idToMatch) return null;
    const clean = idToMatch.toUpperCase();
    return list.find((o) => {
      const code = (o.orderId || o.order_code || o.id || '').toUpperCase();
      return code === clean;
    }) || null;
  };

  const [activeOrder, setActiveOrder] = useState(() => findInOrders(ordersList, orderId));
  const [isLoading, setIsLoading] = useState(!findInOrders(ordersList, orderId));
  const [hasSearchedDirectly, setHasSearchedDirectly] = useState(false);

  // Direct reviews query to sync immediately on cold reload
  const [directReviews, setDirectReviews] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getReviews()
      .then((revs) => {
        if (!isMounted || !Array.isArray(revs)) return;
        setDirectReviews(revs);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Active zoomed photo lightbox
  const [activeZoomPhoto, setActiveZoomPhoto] = useState(null);

  // Track uploaded photos per item { [itemKey]: [ { file, previewUrl, id } ] }
  const [uploadedPhotosMap, setUploadedPhotosMap] = useState({});

  // Asynchronous order resolution to prevent premature "Order Not Found"
  useEffect(() => {
    let isMounted = true;

    // 1. If order is already found in ordersList
    const inProps = findInOrders(ordersList, orderId);
    if (inProps) {
      setActiveOrder(inProps);
      setIsLoading(false);
      return;
    }

    // 2. Fetch directly from backend API / database by order ID
    if (orderId && !hasSearchedDirectly) {
      setIsLoading(true);
      getOrderById(orderId)
        .then((found) => {
          if (!isMounted) return;
          if (found) {
            setActiveOrder(found);
          }
          setHasSearchedDirectly(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Error retrieving order by ID:', err);
          if (!isMounted) return;
          setHasSearchedDirectly(true);
          setIsLoading(false);
        });
    } else if (!orderId) {
      setActiveOrder(ordersList[0] || null);
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [orderId, ordersList, hasSearchedDirectly]);

  // Helper to reliably get product identifier from an item object
  const getItemId = (item) => item?.productId || item?.product_id || item?.id || 'item';

  // Initialize submitted reviews from persistent local storage registry
  const [submittedMap, setSubmittedMap] = useState(() => {
    try {
      const raw = localStorage.getItem('elvany_reviews_registry');
      const reg = raw ? JSON.parse(raw) : {};
      const clean = (orderId || '').toUpperCase().trim();
      const map = {};
      if (clean) {
        Object.keys(reg).forEach((k) => {
          if (k.startsWith(`${clean}_`)) {
            const subKey = k.replace(`${clean}_`, '');
            map[subKey] = reg[k];
          }
        });
        if (Array.isArray(reg[clean])) {
          reg[clean].forEach((r) => {
            const pKey = (r.productId || r.product_id || '').toLowerCase();
            if (pKey) map[pKey] = r;
          });
        }
      }
      return map;
    } catch {
      return {};
    }
  });

  // Helper to find existing review in database or local registry for this specific item and order
  const getExistingItemReview = (item) => {
    const orderCode = (activeOrder?.orderId || activeOrder?.order_code || activeOrder?.id || orderId || '').toUpperCase().trim();
    const itemId = (item?.productId || item?.product_id || item?.id || '').toLowerCase().trim();
    const itemName = (item?.name || item?.title || '').toLowerCase().trim();

    // 1. Direct state submitted map
    if (submittedMap[itemId]) return submittedMap[itemId];
    if (itemName && submittedMap[itemName]) return submittedMap[itemName];

    // 2. Check local browser registry
    try {
      const raw = localStorage.getItem('elvany_reviews_registry');
      const reg = raw ? JSON.parse(raw) : {};
      if (reg[`${orderCode}_${itemId}`]) return reg[`${orderCode}_${itemId}`];
      if (itemName && reg[`${orderCode}_${itemName}`]) return reg[`${orderCode}_${itemName}`];
      if (Array.isArray(reg[orderCode])) {
        const found = reg[orderCode].find((r) => {
          const rProd = (r.productId || r.product_id || '').toLowerCase().trim();
          const rTitle = (r.productTitle || r.title || '').toLowerCase().trim();
          return (itemId && rProd === itemId) || (itemName && rTitle === itemName);
        });
        if (found) return found;
      }
    } catch {}

    // 3. Check directly fetched reviews from database
    if (directReviews && directReviews.length > 0) {
      const found = directReviews.find((r) => {
        const rOrder = (r.orderId || r.order_id || r.orderCode || '').toUpperCase().trim();
        const rProd = (r.productId || r.product_id || '').toLowerCase().trim();
        const rTitle = (r.productTitle || r.title || '').toLowerCase().trim();
        const matchesOrder = rOrder && (rOrder === orderCode || (activeOrder?.id && rOrder === activeOrder.id.toUpperCase().trim()));
        const matchesProd = (itemId && rProd === itemId) || (itemName && rTitle === itemName);
        return matchesOrder && (matchesProd || !rProd);
      });
      if (found) return found;
    }

    // 4. Check allReviewsMap passed via props from App
    if (allReviewsMap) {
      const allRevs = Object.values(allReviewsMap).flat();
      const found = allRevs.find((r) => {
        const rOrder = (r.orderId || r.order_id || r.orderCode || '').toUpperCase().trim();
        const rProd = (r.productId || r.product_id || '').toLowerCase().trim();
        const rTitle = (r.productTitle || r.title || '').toLowerCase().trim();
        const matchesOrder = rOrder && (rOrder === orderCode || (activeOrder?.id && rOrder === activeOrder.id.toUpperCase().trim()));
        const matchesProd = (itemId && rProd === itemId) || (itemName && rTitle === itemName);
        return matchesOrder && (matchesProd || !rProd);
      });
      if (found) return found;
    }

    return null;
  };

  const [formDataMap, setFormDataMap] = useState({});
  const [isSubmittingMap, setIsSubmittingMap] = useState({});

  // Loading state while authenticating passport
  if (isLoading) {
    return (
      <div className="submit-review-page" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090a0c', color: '#fff', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(197, 160, 89, 0.1)',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Sparkles size={28} color="var(--gold-bright)" className="animate-spin" />
          </div>
          <div style={{ color: 'var(--gold-bright)', fontSize: '0.74rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
            MAISON ELVANY • VERIFIED PASSPORT
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#ffffff', marginBottom: '0.6rem', fontWeight: 400 }}>
            Authenticating Order #{orderId || ''}...
          </h2>
          <p style={{ color: 'var(--text-light-muted)', fontSize: '0.86rem', lineHeight: 1.5 }}>
            Synchronizing courier logistics and garment specifications from our atelier database.
          </p>
        </div>
      </div>
    );
  }

  // Not found (only rendered after network retrieval finishes)
  if (!activeOrder) {
    return (
      <div className="submit-review-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-light-secondary)', marginBottom: '2rem' }}>
            We could not find an order matching #{orderId}. Please verify the order review link from your parcel receipt.
          </p>
          <button className="btn-primary-gold" onClick={() => navigate('/')}>RETURN HOME</button>
        </div>
      </div>
    );
  }

  const isDelivered = activeOrder?.status === 'Delivered' || (activeOrder?.status || '').toLowerCase().includes('delivered');

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

  // Photo upload and compression handlers
  const handlePhotoSelect = (itemKey, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingPhotos = uploadedPhotosMap[itemKey] || [];
    if (existingPhotos.length >= 3) {
      alert('You can upload up to 3 photos per garment review.');
      return;
    }

    const availableSlots = 3 - existingPhotos.length;
    const toProcess = files.slice(0, availableSlots);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          file,
          previewUrl: event.target.result,
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        };
        setUploadedPhotosMap((prev) => ({
          ...prev,
          [itemKey]: [...(prev[itemKey] || []), newPhoto]
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (itemKey, photoId) => {
    setUploadedPhotosMap((prev) => ({
      ...prev,
      [itemKey]: (prev[itemKey] || []).filter((p) => p.id !== photoId)
    }));
  };

  const handleItemReviewSubmit = async (item) => {
    const key = getItemId(item);
    const existing = getExistingItemReview(item);
    if (existing) {
      alert(`An authenticated evaluation has already been submitted for ${item.name || 'this garment'} from Order #${activeOrder?.orderId || orderId}. Only one review per garment is permitted.`);
      return;
    }

    const data = formDataMap[key] || { rating: 5, title: '', content: '' };
    if (!data.content && !data.comment) return;

    setIsSubmittingMap((prev) => ({ ...prev, [key]: true }));

    // 1. Upload photos to Cloudinary or compressed data URLs
    const photosToUpload = uploadedPhotosMap[key] || [];
    const uploadedUrls = [];

    for (const p of photosToUpload) {
      try {
        const uploadRes = await uploadReviewImageToCloudinary(p.file || p.previewUrl, activeOrder.orderId || orderId);
        if (uploadRes?.secure_url) {
          uploadedUrls.push(uploadRes.secure_url);
        }
      } catch (uploadErr) {
        console.warn('Photo upload warning:', uploadErr);
        if (p.previewUrl) uploadedUrls.push(p.previewUrl);
      }
    }

    const clientName = activeOrder.customer_name || activeOrder.customerName || activeOrder.delivery_address?.recipientName || 'Verified Client';
    const clientLoc = activeOrder.delivery_address?.city || activeOrder.customerLocation || 'Sri Lanka';
    const resolvedProdId = item.productId || item.product_id || item.id;
    const resolvedOrderCode = activeOrder.order_code || activeOrder.orderId || activeOrder.id || orderId;

    const reviewObj = {
      id: `rev-order-${Date.now()}-${key}`,
      productId: resolvedProdId,
      orderId: resolvedOrderCode,
      order_code: resolvedOrderCode,
      orderCode: resolvedOrderCode,
      author: clientName,
      customerName: clientName,
      location: clientLoc,
      rating: Number(data.rating || 5),
      date: 'Just now',
      sizePurchased: typeof (item.selectedSize || item.size) === 'string' ? (item.selectedSize || item.size).replace(/\s*\([^)]*\)\s*\d*/g, '').trim() : 'M',
      colorPurchased: item.color || 'Onyx Black',
      productTitle: item.name || item.title || 'Heavyweight Atelier Tee',
      title: data.title || 'Exceptional Quality & Drape',
      content: data.content || data.comment,
      comment: data.content || data.comment,
      fitRating: data.fitRating || 'True to Atelier Boxy Spec',
      imageUrl: uploadedUrls[0] || null,
      images: uploadedUrls,
      helpfulCount: 0
    };

    // Record immediately in local registry so duplicate submissions are blocked across reloads
    recordReviewInLocalRegistry(reviewObj);

    if (onAddNewReview) {
      await onAddNewReview(resolvedProdId, reviewObj);
    }

    setIsSubmittingMap((prev) => ({ ...prev, [key]: false }));
    setSubmittedMap((prev) => ({
      ...prev,
      [key]: reviewObj,
      [key.toLowerCase()]: reviewObj,
      ...(item.name ? { [item.name.toLowerCase().trim()]: reviewObj } : {})
    }));
    setDirectReviews((prev) => [reviewObj, ...(Array.isArray(prev) ? prev : [])]);
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.74rem' }}>CLIENT RECIPIENT</span>
              <strong style={{ color: '#fff' }}>{activeOrder.customerName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.74rem' }}>FULFILLMENT DESTINATION</span>
              <strong style={{ color: '#fff' }}>{activeOrder.customerLocation}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-light-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.74rem' }}>ITEMS IN PARCEL</span>
              <strong style={{ color: 'var(--gold-bright)' }}>{activeOrder.items?.length || 0} Garment Edition(s)</strong>
            </div>
          </div>
        </div>

        {/* Garment Review Section */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.4rem' }}>
              Garment Authenticated Evaluations
            </h2>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.86rem', margin: 0 }}>
              Submit your experience with the cut, fabric, weight, and longevity. Upload photos of your garment to be featured in our official Maison client archive.
            </p>
          </div>

          {/* Banner if all pieces from this order have already been evaluated */}
          {Array.isArray(activeOrder.items) && activeOrder.items.length > 0 && activeOrder.items.every((it) => Boolean(getExistingItemReview(it))) && (
            <div style={{
              backgroundColor: 'rgba(197, 160, 89, 0.09)',
              border: '1px solid var(--gold-border)',
              padding: '1.2rem 1.6rem',
              borderRadius: '2px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <ShieldCheck size={26} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  ALL ORDER EVALUATIONS COMPLETE & LOCKED
                </div>
                <div style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem' }}>
                  All purchased garments from Order #{activeOrder.orderId || orderId} have been authenticated and sealed in the Maison archive. Thank you for your verified patron feedback.
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {(activeOrder.items || []).map((item, idx) => {
              const itemKey = getItemId(item) || `item-${idx}`;
              const existingReview = getExistingItemReview(item);
              const submittedReview = submittedMap[itemKey];
              const isSubmitted = Boolean(submittedReview || existingReview);
              const activeReviewData = submittedReview || existingReview;
              const isSubmitting = isSubmittingMap[itemKey];
              const formData = formDataMap[itemKey] || { rating: 5, title: '', content: '', fitRating: 'True to Atelier Boxy Spec' };
              const prodId = item.productId || item.product_id || item.id;

              // Photos attached to this existing/submitted review
              const attachedPhotos = Array.isArray(activeReviewData?.images) && activeReviewData.images.length > 0
                ? activeReviewData.images
                : (activeReviewData?.imageUrl ? [activeReviewData.imageUrl] : []);

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
                          EVALUATION AUTHENTICATED & SEALED
                        </span>
                      </div>
                      <div style={{ color: 'var(--gold-bright)', fontSize: '0.76rem', marginBottom: '0.8rem', opacity: 0.9 }}>
                        ✓ Evaluation locked for Order #{activeOrder.orderId || orderId}. One verified evaluation permitted per purchased piece.
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#fff', marginBottom: '0.4rem' }}>
                        {activeReviewData?.title || `Review Published for ${item.name}`}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--gold-bright)', gap: '3px', marginBottom: '0.6rem' }}>
                        {[...Array(activeReviewData?.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="var(--gold-bright)" color="var(--gold-bright)" />
                        ))}
                      </div>
                      {activeReviewData?.content && (
                        <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.86rem', fontStyle: 'italic', maxWidth: '520px', margin: '0 auto 1rem auto', lineHeight: 1.5 }}>
                          "{activeReviewData.content}"
                        </p>
                      )}

                      {/* Display attached review photos */}
                      {attachedPhotos.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '1rem 0' }}>
                          {attachedPhotos.map((pUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setActiveZoomPhoto(pUrl)}
                              style={{
                                width: '74px',
                                height: '74px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid var(--gold-border)',
                                padding: 0,
                                background: '#000',
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                              title="Click to view full photo"
                            >
                              <img src={pUrl} alt="Review photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: '2px', padding: '1px 3px' }}>
                                <Maximize2 size={9} color="var(--gold-bright)" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <button 
                        className="btn-primary-gold" 
                        onClick={() => navigate(`/product/${prodId}`)}
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.78rem', marginTop: '0.5rem' }}
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

                      <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                        <label className="form-label">Detailed Feedback on Fabric, Collar & Fit</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Describe how the fabric feels, how the neckline holds up after washing, and the fit silhouette..."
                          className="form-input"
                          style={{ resize: 'vertical' }}
                          value={formData.content || ''}
                          onChange={(e) => handleFieldChange(itemKey, 'content', e.target.value)}
                        />
                      </div>

                      {/* Photo Upload Section */}
                      <div className="form-group" style={{ marginBottom: '1.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Camera size={15} color="var(--gold-bright)" />
                            <span>Add Photos of Your Garment (Optional - Up to 3)</span>
                          </label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                            {(uploadedPhotosMap[itemKey] || []).length} / 3 Photos
                          </span>
                        </div>

                        {/* Photo Previews & Add Button */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {(uploadedPhotosMap[itemKey] || []).map((photo) => (
                            <div 
                              key={photo.id}
                              style={{
                                width: '78px',
                                height: '78px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid var(--gold-border)',
                                backgroundColor: '#000'
                              }}
                            >
                              <img 
                                src={photo.previewUrl} 
                                alt="Review upload preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(itemKey, photo.id)}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#fff',
                                  padding: 0
                                }}
                                title="Remove photo"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          {(uploadedPhotosMap[itemKey] || []).length < 3 && (
                            <label
                              style={{
                                width: '78px',
                                height: '78px',
                                borderRadius: '4px',
                                border: '1px dashed rgba(197, 160, 89, 0.45)',
                                backgroundColor: 'rgba(197, 160, 89, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--gold-bright)',
                                fontSize: '0.7rem',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                multiple
                                onChange={(e) => handlePhotoSelect(itemKey, e)}
                                style={{ display: 'none' }}
                              />
                              <Upload size={18} />
                              <span>Add Photo</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn-primary-gold"
                        style={{ padding: '0.85rem 1.8rem', fontSize: '0.82rem', cursor: isSubmitting ? 'wait' : 'pointer' }}
                      >
                        {isSubmitting ? (
                          <>
                            <Sparkles size={14} className="animate-spin" />
                            <span>UPLOADING PHOTOS & PUBLISHING...</span>
                          </>
                        ) : (
                          <>
                            <span>SUBMIT REVIEW FOR THIS GARMENT</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* Lightbox for Zoomed Review Photo */}
      {activeZoomPhoto && (
        <div 
          onClick={() => setActiveZoomPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--gold-border)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveZoomPhoto(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Close image"
            >
              <X size={16} />
            </button>
            <img 
              src={activeZoomPhoto} 
              alt="Client review photo preview" 
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
