import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Building2, 
  Truck, 
  Gift, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingBag, 
  Home, 
  Clock,
  Edit2,
  UploadCloud,
  FileText,
  X,
  UserCheck,
  Download,
  Printer
} from 'lucide-react';

import { CITIES_LIST } from './AccountPage';

export const CheckoutPage = ({
  cart = [],
  onClearCart,
  onConfirmOrder,
  loggedInUser,
  userProfile,
  onOpenAuthModal,
  onBackToStore
}) => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(loggedInUser || userProfile?.email);

  // Helper to fetch saved default profile address from storage or profile (ONLY when logged in)
  const getSavedDefaultAddress = () => {
    if (!isLoggedIn) return null;

    try {
      const addresses = JSON.parse(localStorage.getItem('elvany_shipping_addresses') || '[]');
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr && defaultAddr.streetAddress) {
        const names = (defaultAddr.recipientName || userProfile?.name || '').trim().split(' ');
        return {
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          email: userProfile?.email || '',
          phone: userProfile?.phone || '',
          address: defaultAddr.streetAddress || '',
          apartment: defaultAddr.apartment || '',
          city: defaultAddr.city || 'Colombo',
          postalCode: defaultAddr.postalCode || '',
          country: defaultAddr.country || 'Sri Lanka',
          hasAddress: true
        };
      }
    } catch {}

    if (userProfile?.address) {
      const names = (userProfile.name || '').trim().split(' ');
      return {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        apartment: userProfile.apartment || '',
        city: userProfile.city || 'Colombo',
        postalCode: userProfile.postalCode || '',
        country: userProfile.country || 'Sri Lanka',
        hasAddress: true
      };
    }

    return null;
  };

  const savedDefault = getSavedDefaultAddress();

  // Multi-step state: 1 = Delivery, 2 = Payment & Gifting
  const [currentStep, setCurrentStep] = useState(1);

  // Default address toggle for logged in client
  const [useDefaultAddress, setUseDefaultAddress] = useState(Boolean(isLoggedIn && savedDefault?.hasAddress));
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Form State - Step 1: Delivery
  // If NOT logged in: EVERYTHING IS KEPT BLANK!
  // If logged in: auto-fill saved default address if available, otherwise fill user name/email and keep address blank.
  const initialNameParts = isLoggedIn ? (userProfile?.name || loggedInUser || '').replace(/\s*\([^)]*\)/g, '').trim().split(' ') : [];
  const [email, setEmail] = useState(isLoggedIn ? (savedDefault?.email || userProfile?.email || '') : '');
  const [phone, setPhone] = useState(isLoggedIn ? (savedDefault?.phone || userProfile?.phone || '') : '');
  const [firstName, setFirstName] = useState(isLoggedIn ? (savedDefault?.firstName || initialNameParts[0] || '') : '');
  const [lastName, setLastName] = useState(isLoggedIn ? (savedDefault?.lastName || initialNameParts.slice(1).join(' ') || '') : '');
  const [address, setAddress] = useState(isLoggedIn ? (savedDefault?.address || '') : '');
  const [apartment, setApartment] = useState(isLoggedIn ? (savedDefault?.apartment || '') : '');
  const [city, setCity] = useState(isLoggedIn && savedDefault?.city ? savedDefault.city : 'Colombo');
  const [postalCode, setPostalCode] = useState(isLoggedIn ? (savedDefault?.postalCode || '') : '');
  const [country, setCountry] = useState('Sri Lanka');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Handle toggling default address
  const handleToggleDefaultAddress = (checked) => {
    setUseDefaultAddress(checked);
    if (checked) {
      const def = getSavedDefaultAddress();
      if (def) {
        if (def.firstName) setFirstName(def.firstName);
        if (def.lastName) setLastName(def.lastName);
        if (def.email) setEmail(def.email);
        if (def.phone) setPhone(def.phone);
        setAddress(def.address);
        setApartment(def.apartment);
        setCity(def.city);
        setPostalCode(def.postalCode);
        setCountry(def.country);
      }
    } else {
      setAddress('');
      setApartment('');
      setPostalCode('');
    }
  };



  // Form State - Step 2: Payment Method (Bank Transfer or COD)
  const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' | 'cod'
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState(null);

  // Gifting option
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Submission / Passport state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const formatLKR = (val) => {
    return `LKR ${val.toLocaleString()}`;
  };

  const getPrice = (item) => item.priceLKR || item.price || 18500;
  const getOriginalPrice = (item) => item.originalPriceLKR || getPrice(item);

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + getPrice(item) * (item.qty || 1), 0);
  const totalOriginal = cart.reduce((sum, item) => sum + getOriginalPrice(item) * (item.qty || 1), 0);
  const totalSavings = totalOriginal - subtotal;
  const totalItemsCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Handle Slip Upload
  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPaymentSlipFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentSlipPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlip = () => {
    setPaymentSlipFile(null);
    setPaymentSlipPreview(null);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !address || !city) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderId = `ELV-${Math.floor(10000 + Math.random() * 90000)}`;
      const fullLocation = `${address}${apartment ? `, ${apartment}` : ''}, ${city}, ${postalCode}, ${country}`;

      const newOrder = {
        orderId,
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: email,
        customerPhone: phone,
        customerLocation: fullLocation,
        deliveryAddress: {
          firstName,
          lastName,
          recipientName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          streetAddress: address,
          apartment,
          city,
          postalCode,
          country,
          deliveryNotes,
          location: fullLocation
        },
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: paymentMethod === 'bank' ? 'Pending Slip Verification' : 'Payment Verified — Processing Dispatch',
        paymentMethod: paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Cash on Delivery (COD)',
        hasSlipAttached: !!paymentSlipFile,
        totalLKR: subtotal,
        savingsLKR: totalSavings,
        isGift,
        giftMessage: isGift ? giftMessage : '',
        deliveryNotes,
        items: cart.map((c) => ({
          productId: c.id,
          id: c.id,
          name: c.name || c.title || 'Haute Atelier T-Shirt',
          title: c.name || c.title || 'Haute Atelier T-Shirt',
          color: c.color || 'Onyx Black',
          selectedSize: c.selectedSize || c.size || 'M (40)',
          size: c.selectedSize || c.size || 'M (40)',
          priceLKR: getPrice(c),
          originalPriceLKR: getOriginalPrice(c),
          isOfferApplied: c.isOfferApplied || false,
          quantity: c.qty || 1,
          image: c.image || '/images/hero_tshirt.jpg'
        }))
      };

      // Save address as default if checked
      if (saveAsDefault && address && city) {
        try {
          const addresses = JSON.parse(localStorage.getItem('elvany_shipping_addresses') || '[]');
          const newEntry = {
            id: `addr-${Date.now()}`,
            isDefault: true,
            recipientName: `${firstName} ${lastName}`.trim() || 'Client',
            streetAddress: address,
            apartment: apartment || '',
            city: city || 'Colombo',
            postalCode: postalCode || '',
            country: country || 'Sri Lanka'
          };
          const updated = addresses.map(a => ({ ...a, isDefault: false }));
          updated.unshift(newEntry);
          localStorage.setItem('elvany_shipping_addresses', JSON.stringify(updated));
        } catch (err) {
          console.warn('Could not persist default address:', err);
        }
      }

      if (onConfirmOrder) {
        await onConfirmOrder(newOrder, paymentSlipFile);
      }
      if (onClearCart) {
        onClearCart();
      }

      setConfirmedOrder(newOrder);
    } catch (err) {
      console.error('Order placement error:', err);
      alert('We encountered an issue registering your order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };




  // If order was confirmed, show the Maison Acquisition Passport
  if (confirmedOrder) {
    return (
      <div className="checkout-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#ffffff', padding: '4rem 0 6rem 0' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          
          <div style={{
            backgroundColor: '#0d0e12',
            border: '1px solid var(--gold-border)',
            borderRadius: '2px',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--gold-bright)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Check size={32} strokeWidth={3} />
            </div>

            <div style={{
              color: 'var(--gold-bright)',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              MAISON ELVANY • ACQUISITION CONFIRMED
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', color: '#ffffff', fontWeight: 400, margin: '0 0 1rem 0' }}>
              Order Passport #{confirmedOrder.orderId}
            </h1>

            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Thank you, <strong style={{ color: '#ffffff' }}>{confirmedOrder.customerName}</strong>. Your acquisition has been registered and verified by the Florentine atelier.
            </p>

            {/* Passport Detail Summary */}
            <div style={{
              backgroundColor: '#07080a',
              border: '1px solid var(--border-dark)',
              borderRadius: '2px',
              padding: '1.8rem',
              textAlign: 'left',
              marginBottom: '2.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block' }}>DELIVERY DESTINATION</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{confirmedOrder.customerLocation}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block' }}>PAYMENT METHOD</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{confirmedOrder.paymentMethod}</strong>
                  {confirmedOrder.hasSlipAttached ? (
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold-bright)', marginTop: '2px' }}>✓ Bank Transfer Receipt Attached</span>
                  ) : confirmedOrder.paymentMethod?.toLowerCase().includes('cod') || confirmedOrder.paymentMethod?.includes('Cash') ? (
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold-bright)', marginTop: '2px' }}>✓ Cash Collection Upon Handover</span>
                  ) : null}

                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block' }}>ESTIMATED DISPATCH</span>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--gold-bright)' }}>Next Business Day (Island-Wide)</strong>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)' }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>{item.selectedSize} • {item.color} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 700 }}>
                      {formatLKR(item.priceLKR * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {confirmedOrder.savingsLKR > 0 && (
                <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-bright)' }}>Privilege Atelier Savings Applied:</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gold-bright)', fontWeight: 700 }}>-LKR {confirmedOrder.savingsLKR.toLocaleString()}</span>
                </div>
              )}

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>Total Settled:</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
                  {formatLKR(confirmedOrder.totalLKR)}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn-outline-gold"
                onClick={() => {
                  const printWin = window.open('', '_blank');
                  if (!printWin) {
                    window.print();
                    return;
                  }
                  const itemsHtml = confirmedOrder.items.map(item => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #222;">
                      <div>
                        <div style="font-weight:600; color:#111; font-size:14px;">${item.name || item.title}</div>
                        <div style="color:#666; font-size:12px; margin-top:2px;">Size: ${item.selectedSize || item.size} &bull; Color: ${item.color} &bull; Qty: ${item.quantity || 1}</div>
                      </div>
                      <div style="font-weight:bold; color:#000; font-size:14px;">
                        LKR ${((item.priceLKR || 18500) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  `).join('');

                  printWin.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Maison ELVANY — Order Passport #${confirmedOrder.orderId}</title>
                      <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
                        body { background-color: #f7f7f8; color: #111; font-family: 'Inter', sans-serif; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
                        .passport-box { width: 100%; max-width: 640px; background: #fff; border: 2px solid #c5a059; padding: 36px; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .title { font-family: 'Cinzel', serif; font-size: 24px; letter-spacing: 0.15em; color: #111; text-align: center; margin: 0 0 6px 0; text-transform: uppercase; }
                        .sub { text-align: center; font-size: 11px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; margin-bottom: 25px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #fafafa; border: 1px solid #eee; padding: 14px; margin-bottom: 20px; }
                        .field-label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
                        .field-value { font-size: 13px; color: #111; font-weight: 600; }
                        .total-row { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; margin-top: 14px; border-top: 2px solid #c5a059; }
                        .footer-note { text-align: center; font-size: 11px; color: #666; margin-top: 25px; line-height: 1.5; }
                      </style>
                    </head>
                    <body>
                      <div class="passport-box">
                        <h1 class="title">MAISON ELVANY</h1>
                        <div class="sub">Official Garment Acquisition Passport & Authenticity Certificate</div>
                        <div class="grid">
                          <div>
                            <div class="field-label">Order Reference</div>
                            <div class="field-value" style="color:#c5a059;">#${confirmedOrder.orderId}</div>
                          </div>
                          <div>
                            <div class="field-label">Registration Date</div>
                            <div class="field-value">${confirmedOrder.orderDate || new Date().toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div class="field-label">Acquired By</div>
                            <div class="field-value">${confirmedOrder.customerName}</div>
                          </div>
                          <div>
                            <div class="field-label">Payment Method</div>
                            <div class="field-value">${confirmedOrder.paymentMethod}</div>
                          </div>
                          <div style="grid-column: span 2;">
                            <div class="field-label">Courier Destination</div>
                            <div class="field-value">${confirmedOrder.customerLocation}</div>
                          </div>
                        </div>
                        <div>
                          <div class="field-label" style="margin-bottom: 6px;">Certified Capsule Garments</div>
                          ${itemsHtml}
                        </div>
                        <div class="total-row">
                          <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Total Settlement</span>
                          <span style="font-size: 18px; font-weight: 700; color: #c5a059;">LKR ${(confirmedOrder.totalLKR || 0).toLocaleString()}</span>
                        </div>
                        <div class="footer-note">
                          This document certifies authentic origin from Maison ELVANY atelier.<br/>
                          Express Courier Island-Wide Delivery Guaranteed.
                        </div>
                      </div>
                      <script>
                        window.onload = function() { window.print(); }
                      </script>
                    </body>
                    </html>
                  `);
                  printWin.document.close();
                }}
                style={{ padding: '1rem 1.8rem', gap: '0.6rem' }}
              >
                <Download size={16} />
                <span>DOWNLOAD ORDER PASSPORT</span>
              </button>

              <button 
                type="button"
                className="btn-primary-gold"
                onClick={() => navigate('/account?tab=orders')}
                style={{ padding: '1rem 2rem' }}
              >
                <span>VIEW IN MY ORDERS</span>
                <ArrowRight size={16} />
              </button>

              <button 
                type="button"
                className="btn-outline-gold"
                onClick={() => navigate('/')}
                style={{ padding: '1rem 2rem' }}
              >
                <span>RETURN TO STORE</span>
              </button>
            </div>


          </div>

        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (cart.length === 0) {
    return (
      <div className="checkout-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#ffffff', padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#0d0e12', border: '1px solid var(--border-dark)', padding: '3.5rem 2rem', borderRadius: '2px' }}>
            <ShoppingBag size={48} color="var(--gold-bright)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>Your Shopping Bag is Empty</h2>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.88rem', marginBottom: '2rem' }}>
              Please select your desired garments from the collection before proceeding to checkout.
            </p>
            <button 
              className="btn-primary-gold" 
              onClick={() => navigate('/collection')}
              style={{ width: '100%', justifyContent: 'center', padding: '1.1rem' }}
            >
              <span>EXPLORE SIGNATURE EDITIONS</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#ffffff', padding: '3rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        
        {/* Top Breadcrumb & Return Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
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
            <span style={{ color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SECURE CLIENT CHECKOUT
            </span>
          </div>

          <button 
            type="button"
            className="section-action-link"
            onClick={() => navigate('/collection')}
            style={{ fontSize: '0.78rem' }}
          >
            <ArrowLeft size={13} />
            <span>CONTINUE SHOPPING</span>
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '3rem',
          backgroundColor: '#0d0e12',
          border: '1px solid var(--border-dark)',
          borderRadius: '2px',
          padding: '1.2rem 2rem'
        }}>
          {/* Step 1 Pill */}
          <div 
            onClick={() => setCurrentStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: currentStep === 2 ? 'pointer' : 'default',
              opacity: currentStep === 1 ? 1 : 0.7
            }}
          >
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 1 ? 'var(--gold-bright)' : '#1a1c22',
              color: currentStep === 1 ? '#000000' : 'var(--gold-bright)',
              border: currentStep === 1 ? 'none' : '1px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: currentStep === 1 ? 700 : 500,
              color: currentStep === 1 ? '#ffffff' : 'var(--text-light-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              1. Delivery & Destination
            </span>
          </div>

          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--border-dark)' }} />

          {/* Step 2 Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            opacity: currentStep === 2 ? 1 : 0.5
          }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 2 ? 'var(--gold-bright)' : '#1a1c22',
              color: currentStep === 2 ? '#000000' : 'var(--text-light-muted)',
              border: currentStep === 2 ? 'none' : '1px solid var(--border-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              2
            </span>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: currentStep === 2 ? 700 : 500,
              color: currentStep === 2 ? '#ffffff' : 'var(--text-light-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              2. Payment & Confirmation
            </span>
          </div>
        </div>

        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '3.5rem', alignItems: 'start' }}>
          
          {/* =========================================================================
              LEFT COLUMN: STEP 1 (DELIVERY) OR STEP 2 (PAYMENT)
              ========================================================================= */}
          <div>
            
            {/* STEP 1: DELIVERY & CONTACT FORM */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedToPayment}>
                <div style={{ backgroundColor: '#0d0e12', border: '1px solid var(--border-dark)', borderRadius: '2px', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
                    <div>
                      <div style={{ color: 'var(--gold-bright)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        STEP 1 OF 2
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: 0, fontWeight: 400 }}>
                        Courier Delivery Destination
                      </h3>
                    </div>

                    {/* Profile Address Toggle for Logged in Client / Sign In Button for Guests */}
                    {isLoggedIn ? (
                      <div style={{
                        backgroundColor: useDefaultAddress ? 'rgba(197, 160, 89, 0.12)' : '#07080a',
                        border: useDefaultAddress ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                        padding: '0.6rem 1rem',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => handleToggleDefaultAddress(!useDefaultAddress)}
                      >
                        <input 
                          type="checkbox"
                          checked={useDefaultAddress}
                          onChange={(e) => handleToggleDefaultAddress(e.target.checked)}
                          style={{ accentColor: 'var(--gold-bright)', width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.76rem', color: useDefaultAddress ? 'var(--gold-bright)' : 'var(--text-light-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                          Use Default Profile Address
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '2px',
                          border: '1px solid rgba(197, 160, 89, 0.4)',
                          backgroundColor: 'rgba(197, 160, 89, 0.08)',
                          color: 'var(--gold-bright)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          letterSpacing: '0.04em'
                        }}
                      >
                        <UserCheck size={13} />
                        <span>Sign In to Auto-Fill Delivery</span>
                      </button>
                    )}
                  </div>


                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                    <div>
                      <label className="form-label">FIRST NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={firstName} 
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="Julian"
                      />
                    </div>
                    <div>
                      <label className="form-label">LAST NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={lastName} 
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="Sterling"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                    <div>
                      <label className="form-label">EMAIL ADDRESS *</label>
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="client@clientele.elvany.com"
                      />
                    </div>
                    <div>
                      <label className="form-label">MOBILE PHONE (COURIER CONTACT) *</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone} 
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">STREET ADDRESS *</label>
                    <input 
                      type="text" 
                      required 
                      value={address} 
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setUseDefaultAddress(false);
                      }} 
                      className="form-input" 
                      placeholder="14 Alfred House Gardens"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                    <div>
                      <label className="form-label">SUITE / APARTMENT</label>
                      <input 
                        type="text" 
                        value={apartment} 
                        onChange={(e) => {
                          setApartment(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="Penthouse A"
                      />
                    </div>
                    <div>
                      <label className="form-label">CITY *</label>
                      <select 
                        value={city} 
                        onChange={(e) => {
                          setCity(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-select"
                      >
                        {CITIES_LIST.map((c) => (
                          <option key={c} value={c} style={{ backgroundColor: '#0d0e12', color: '#fff' }}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">POSTAL CODE *</label>
                      <input 
                        type="text" 
                        required 
                        value={postalCode} 
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          setUseDefaultAddress(false);
                        }} 
                        className="form-input" 
                        placeholder="00300"
                      />
                    </div>
                  </div>

                  {/* Save as Default Profile Address Option */}
                  <div style={{ marginBottom: '1.2rem', padding: '0.4rem 0' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '0.78rem',
                      color: saveAsDefault ? 'var(--gold-bright)' : 'var(--text-light-secondary)'
                    }}>
                      <input 
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        style={{ accentColor: 'var(--gold-bright)', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      <span>Set as Default Profile Address for future checkouts</span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">COURIER DISPATCH INSTRUCTIONS</label>

                    <input 
                      type="text" 
                      value={deliveryNotes} 
                      onChange={(e) => setDeliveryNotes(e.target.value)} 
                      className="form-input" 
                      placeholder="e.g. Leave with private concierge / Call upon gate arrival"
                    />
                  </div>

                  {/* Courier Guarantee */}
                  <div style={{ padding: '1rem 1.2rem', backgroundColor: '#07080a', border: '1px solid var(--border-dark)', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Truck size={20} color="var(--gold-bright)" />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)' }}>
                      <strong style={{ color: '#ffffff' }}>White-Glove Island-Wide Delivery:</strong> Complimentary next business day dispatch with live signature tracking.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary-gold"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '1.2rem',
                    fontSize: '0.88rem',
                    letterSpacing: '0.14em',
                    fontWeight: 800
                  }}
                >
                  <span>CONTINUE TO PAYMENT METHOD</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* STEP 2: PAYMENT & BESPOKE GIFTING */}
            {currentStep === 2 && (
              <form onSubmit={handlePlaceOrder}>
                
                {/* Destination Review Box */}
                <div style={{
                  backgroundColor: '#07080a',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '2px',
                  padding: '1.2rem 1.5rem',
                  marginBottom: '1.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      DELIVERING TO:
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                      {firstName} {lastName} • {address}, {city}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
                      {email} • {phone}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--gold-border)',
                      color: 'var(--gold-bright)',
                      padding: '6px 12px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600
                    }}
                  >
                    <Edit2 size={12} />
                    <span>EDIT DESTINATION</span>
                  </button>
                </div>

                {/* Payment Selection Box */}
                <div style={{ backgroundColor: '#0d0e12', border: '1px solid var(--border-dark)', borderRadius: '2px', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
                  <div style={{ marginBottom: '1.8rem' }}>
                    <div style={{ color: 'var(--gold-bright)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      STEP 2 OF 2
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: 0, fontWeight: 400 }}>
                      Select Payment Method
                    </h3>
                  </div>

                  {/* Payment Tabs: Bank Transfer and COD */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.8rem' }}>
                    
                    {/* Bank Transfer Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      style={{
                        backgroundColor: paymentMethod === 'bank' ? 'var(--gold-bright)' : '#07080a',
                        color: paymentMethod === 'bank' ? '#000000' : '#ffffff',
                        border: paymentMethod === 'bank' ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                        padding: '1.3rem 1rem',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.6rem',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <Building2 size={24} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em' }}>DIRECT BANK TRANSFER</span>
                    </button>

                    {/* Cash on Delivery Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        backgroundColor: paymentMethod === 'cod' ? 'var(--gold-bright)' : '#07080a',
                        color: paymentMethod === 'cod' ? '#000000' : '#ffffff',
                        border: paymentMethod === 'cod' ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                        padding: '1.3rem 1rem',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.6rem',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <Truck size={24} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em' }}>CASH ON DELIVERY (COD)</span>
                    </button>
                  </div>

                  {/* Bank Transfer Details with Image Slip Upload */}
                  {paymentMethod === 'bank' && (
                    <div style={{ backgroundColor: '#07080a', border: '1px solid var(--border-dark)', padding: '1.8rem', borderRadius: '2px', fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} />
                        <span>Maison ELVANY Commercial Bank Account</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-light-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', backgroundColor: '#0b0c0f', padding: '1.2rem', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>Bank Name: <strong style={{ color: '#ffffff' }}>Commercial Bank of Ceylon PLC</strong></div>
                        <div>Beneficiary Name: <strong style={{ color: '#ffffff' }}>ELVANY ATELIER (PVT) LTD</strong></div>
                        <div>Account Number: <strong style={{ color: 'var(--gold-bright)', fontSize: '1rem' }}>1000 8942 5500</strong></div>
                        <div>Branch / Code: <strong style={{ color: '#ffffff' }}>Colombo 07 Elite Commercial Branch</strong></div>
                        <div>Reference: <strong style={{ color: 'var(--gold-bright)' }}>Your Name / Mobile Number</strong></div>
                      </div>

                      {/* Client Login Guard for Bank Transfers */}
                      {!loggedInUser ? (
                        <div style={{
                          backgroundColor: '#0e0f14',
                          border: '1px solid var(--gold-bright)',
                          borderRadius: '2px',
                          padding: '1.8rem 1.4rem',
                          textAlign: 'center',
                          marginTop: '1rem'
                        }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(197, 160, 89, 0.15)',
                            color: 'var(--gold-bright)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                          }}>
                            <Lock size={20} />
                          </div>
                          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Client Login Required for Bank Transfers
                          </h4>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-light-secondary)', maxWidth: '440px', margin: '0 auto 1.4rem auto', lineHeight: 1.5 }}>
                            Because bank transfer slips require concierge verification before confirmation, you must be logged into your private client account to submit your receipt.
                          </p>
                          <button
                            type="button"
                            className="btn-primary-gold"
                            onClick={onOpenAuthModal}
                            style={{ padding: '0.85rem 1.8rem', fontSize: '0.82rem', letterSpacing: '0.12em', fontWeight: 800 }}
                          >
                            <UserCheck size={16} />
                            <span>LOG IN / CREATE CLIENT ACCOUNT</span>
                          </button>
                        </div>
                      ) : (
                        /* Authenticated Slip Uploader */
                        <div>
                          <label className="form-label" style={{ marginBottom: '0.6rem' }}>UPLOAD PAYMENT SLIP / BANK RECEIPT (IMAGE)</label>
                          
                          {!paymentSlipPreview ? (
                            <label style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.6rem',
                              border: '1px dashed var(--gold-border)',
                              borderRadius: '2px',
                              padding: '1.8rem 1.2rem',
                              backgroundColor: '#0d0e12',
                              cursor: 'pointer',
                              transition: 'border-color 0.2s ease'
                            }}>
                              <UploadCloud size={28} color="var(--gold-bright)" />
                              <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>Click to Select or Drag & Drop Payment Slip</span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)' }}>Supported formats: JPG, PNG, WEBP, PDF (Max 10MB)</span>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                onChange={handleSlipUpload}
                                style={{ display: 'none' }}
                              />
                            </label>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid var(--gold-bright)',
                              backgroundColor: '#0d0e12',
                              padding: '0.8rem 1.2rem',
                              borderRadius: '2px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <img 
                                  src={paymentSlipPreview} 
                                  alt="Slip preview" 
                                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)' }} 
                                />
                                <div>
                                  <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>{paymentSlipFile?.name || 'Payment_Slip.png'}</div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>✓ Receipt attached for concierge verification</div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleRemoveSlip}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-light-muted)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Remove slip"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Cash on Delivery Details */}
                  {paymentMethod === 'cod' && (
                    <div style={{ backgroundColor: '#07080a', border: '1px solid var(--border-dark)', padding: '1.8rem', borderRadius: '2px', fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={16} />
                        <span>White-Glove Courier Concierge</span>
                      </div>
                      <p style={{ color: 'var(--text-light-secondary)', margin: 0, lineHeight: 1.6 }}>
                        Pay securely in cash or via handheld contactless POS card terminal when our private courier delivers your bespoke package to your doorstep.
                      </p>
                    </div>
                  )}

                </div>

                {/* Action Buttons Row: Properly aligned BACK and CONFIRM buttons */}
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn-outline-gold"
                    style={{
                      padding: '1.15rem 1.8rem',
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>BACK</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || (paymentMethod === 'bank' && !loggedInUser)}
                    className="btn-primary-gold"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      padding: '1.15rem 1.8rem',
                      fontSize: '0.88rem',
                      letterSpacing: '0.14em',
                      fontWeight: 800,
                      opacity: (paymentMethod === 'bank' && !loggedInUser) ? 0.5 : 1,
                      cursor: (paymentMethod === 'bank' && !loggedInUser) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <span>AUTHENTICATING TRANSACTION...</span>
                    ) : (paymentMethod === 'bank' && !loggedInUser) ? (
                      <>
                        <Lock size={16} />
                        <span>LOG IN REQUIRED FOR BANK TRANSFER</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>CONFIRM & SECURE ACQUISITION — {formatLKR(subtotal)}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* =========================================================================
              RIGHT COLUMN: ORDER LEDGER & SUMMARY
              ========================================================================= */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{
              backgroundColor: '#0d0e12',
              border: '1px solid var(--border-dark)',
              borderRadius: '2px',
              padding: '2.2rem 1.8rem'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: 400 }}>
                  Acquisition Ledger
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--gold-bright)', letterSpacing: '0.1em' }}>
                  {totalItemsCount} {totalItemsCount === 1 ? 'PIECE' : 'PIECES'}
                </span>
              </div>

              {/* Garment Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.8rem', maxHeight: '340px', overflowY: 'auto' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '52px', height: '64px', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#07080a', border: '1px solid var(--border-dark)', flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--gold-bright)', color: '#000000', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '0 0 0 2px' }}>
                        {item.qty || 1}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)' }}>
                        {item.selectedSize || item.size} • {item.color}
                      </div>
                      {item.isOfferApplied && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--gold-bright)', color: '#000000', fontWeight: 800, padding: '1px 5px', borderRadius: '1px', display: 'inline-block', marginTop: '2px' }}>
                          ⚡ PRIVILEGE APPLIED
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
                        {formatLKR(getPrice(item) * (item.qty || 1))}
                      </div>
                      {item.isOfferApplied && item.originalPriceLKR && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)', textDecoration: 'line-through' }}>
                          {formatLKR(item.originalPriceLKR * (item.qty || 1))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ledger Totals */}
              <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>Garment Subtotal:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatLKR(totalOriginal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-bright)' }}>
                    <span>Special Privilege Savings:</span>
                    <span style={{ fontWeight: 700 }}>-LKR {totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>White-Glove Courier:</span>
                  <span style={{ color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.08em' }}>COMPLIMENTARY</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>Import Taxes & Atelier VAT:</span>
                  <span style={{ color: '#ffffff' }}>INCLUDED</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-dark)', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600 }}>Total Settled:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold-bright)', fontWeight: 800 }}>
                    {formatLKR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Trust Assurances */}
              <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} color="var(--gold-bright)" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} color="var(--gold-bright)" />
                  <span>7-Day Fit Guarantee</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
