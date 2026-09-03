import React, { useState, useEffect } from 'react';
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
  Printer,
  QrCode,
  Smartphone,
  Monitor,
  Copy,
  Sparkles,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Maximize2,
  CreditCard
} from 'lucide-react';
import { downloadImageFile } from '../lib/bespokeMockupGenerator';
import { downloadOrderInvoice } from '../lib/orderInvoiceGenerator';
import { 
  getPayHereParameters, 
  launchPayHerePayment, 
  confirmCardPayment, 
  getPaymentGatewayConfig 
} from '../services/payhereService';

import { CITIES_LIST } from './AccountPage';

// Configurable delivery fee logic (Supports flat standard rates, city-based rates, or free thresholds)
export const STANDARD_DELIVERY_FEE_LKR = 450;
export const FREE_DELIVERY_THRESHOLD_LKR = 35000;

export const calculateDeliveryFee = (subtotalAmount, selectedCity = '') => {
  if (!subtotalAmount || subtotalAmount <= 0) return 0;
  if (subtotalAmount >= FREE_DELIVERY_THRESHOLD_LKR) return 0;
  return STANDARD_DELIVERY_FEE_LKR;
};

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
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [activeAngles, setActiveAngles] = useState({});
  const [inspectedBespokeItem, setInspectedBespokeItem] = useState(null);

  // Auto-scroll to top when switching checkout steps or confirming order
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentStep, confirmedOrder]);

  // Default address toggle for logged in client
  const [useDefaultAddress, setUseDefaultAddress] = useState(Boolean(isLoggedIn && savedDefault?.hasAddress));
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Form State - Step 1: Delivery
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

  // Form State - Step 2: Payment Method (Card, QR, or Bank Transfer)
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'qr' | 'bank'
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState(null);
  const [slipUploadError, setSlipUploadError] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // PayHere Payment Gateway State
  const [paymentConfig, setPaymentConfig] = useState({ isSandbox: true, testCards: [] });
  const [copiedTestCard, setCopiedTestCard] = useState(null);
  const [cardPaymentError, setCardPaymentError] = useState(null);
  const [isTestingCardsOpen, setIsTestingCardsOpen] = useState(true);
  const [isDownloadingPassport, setIsDownloadingPassport] = useState(false);

  // Load gateway configuration on mount
  useEffect(() => {
    getPaymentGatewayConfig().then((cfg) => {
      if (cfg && cfg.success) {
        setPaymentConfig(cfg);
      }
    });
  }, []);


  // Financial calculations
  const getPrice = (item) => item.priceLKR || item.price || 18500;
  const getOriginalPrice = (item) => item.originalPriceLKR || getPrice(item);

  const subtotal = cart.reduce((sum, item) => sum + getPrice(item) * (item.qty || 1), 0);
  const totalOriginal = cart.reduce((sum, item) => sum + getOriginalPrice(item) * (item.qty || 1), 0);
  const totalSavings = totalOriginal - subtotal;
  const totalItemsCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Dynamic Delivery Fee Calculation
  const deliveryFee = calculateDeliveryFee(subtotal, city);
  const grandTotal = subtotal + deliveryFee;

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(grandTotal.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  const handleCopyAccount = (accNo) => {
    navigator.clipboard.writeText(accNo.replace(/\s+/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Gifting option
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const formatLKR = (val) => {
    return `LKR ${(val || 0).toLocaleString()}`;
  };



  // Handle Slip Upload
  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPaymentSlipFile(file);
    setSlipUploadError(false);
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentSlipPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlip = () => {
    setPaymentSlipFile(null);
    setPaymentSlipPreview(null);
    setSlipUploadError(true);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !address || !city) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setCardPaymentError(null);

    // Strict Enforcement: Payment slip is mandatory ONLY for QR and Bank Transfer
    if (paymentMethod !== 'card' && !paymentSlipFile) {
      setSlipUploadError(true);
      const slipElem = document.getElementById('payment-slip-upload-section');
      if (slipElem) {
        slipElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setSlipUploadError(false);

    try {
      const orderId = `ELV-${Math.floor(10000 + Math.random() * 90000)}`;
      const fullLocation = `${address}${apartment ? `, ${apartment}` : ''}, ${city}, ${postalCode}, ${country}`;
      const isCard = paymentMethod === 'card';

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
          location: fullLocation,
          deliveryFeeLKR: deliveryFee
        },
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: isCard ? 'Payment Verified — Processing Dispatch' : 'Pending Slip Verification',
        paymentMethod: isCard ? 'PayHere Secure Online Card Payment' : paymentMethod === 'qr' ? 'LankaQR Instant Transfer' : 'Direct Bank Transfer',
        hasSlipAttached: isCard ? false : !!paymentSlipFile,
        subtotalLKR: subtotal,
        deliveryFeeLKR: deliveryFee,
        shippingFeeLKR: deliveryFee,
        totalLKR: grandTotal,
        grandTotalLKR: grandTotal,
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
          colorHex: c.colorHex || '#0a0a0b',
          selectedSize: c.selectedSize || c.size || 'M (40)',
          size: c.selectedSize || c.size || 'M (40)',
          priceLKR: getPrice(c),
          originalPriceLKR: getOriginalPrice(c),
          isOfferApplied: c.isOfferApplied || false,
          isBespokeCustom: c.isBespokeCustom || false,
          designCode: c.designCode || '',
          customPlacements: c.customPlacements || [],
          customNotes: c.customNotes || '',
          fabric: c.fabric || '',
          cut: c.cut || '',
          quantity: c.qty || c.quantity || 1,
          image: c.image || '/images/hero_tshirt.webp',
          previewThumbnail: c.previewThumbnail || c.image || '/images/hero_tshirt.webp',
          artworks: c.artworks || {}
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

      // Persist order ID to client's local session history
      try {
        const storedIds = JSON.parse(localStorage.getItem('elvany_my_order_ids') || '[]');
        if (newOrder.orderId && !storedIds.includes(newOrder.orderId)) {
          storedIds.unshift(newOrder.orderId);
          localStorage.setItem('elvany_my_order_ids', JSON.stringify(storedIds));
        }
        localStorage.setItem('elvany_last_order_code', newOrder.orderId);
      } catch {}

      // ========================================================
      // PATH A: PAYHERE CARD PAYMENT GATEWAY POPUP
      // ========================================================
      if (isCard) {
        try {
          const payHereParams = await getPayHereParameters(newOrder);

          await launchPayHerePayment(payHereParams, {
            onCompleted: async (completedOrderId) => {
              try {
                await confirmCardPayment(completedOrderId || newOrder.orderId);
                const verifiedOrder = {
                  ...newOrder,
                  orderId: completedOrderId || newOrder.orderId,
                  status: 'Payment Verified — Processing Dispatch',
                  paymentMethod: 'PayHere Secure Online Card Payment'
                };

                if (onConfirmOrder) {
                  await onConfirmOrder(verifiedOrder, null);
                }
                if (onClearCart) {
                  onClearCart();
                }

                try {
                  window.dispatchEvent(new CustomEvent('elvany_order_placed', { detail: verifiedOrder }));
                } catch {}

                setConfirmedOrder(verifiedOrder);
              } catch (finishErr) {
                console.error('Post card completion error:', finishErr);
                setConfirmedOrder(newOrder);
              } finally {
                setIsSubmitting(false);
              }
            },
            onDismissed: () => {
              setIsSubmitting(false);
              setCardPaymentError('PayHere payment modal closed. Your order details are retained so you can try again anytime.');
            },
            onError: (err) => {
              setIsSubmitting(false);
              setCardPaymentError(typeof err === 'string' ? err : 'Card gateway error. Please verify card details or retry.');
            }
          });
        } catch (gatewayErr) {
          setIsSubmitting(false);
          setCardPaymentError(gatewayErr.message || 'Could not initiate PayHere payment. Please retry or choose another payment method.');
        }
        return;
      }

      // ========================================================
      // PATH B: BANK TRANSFER OR LANKAQR WITH SLIP
      // ========================================================
      if (onConfirmOrder) {
        await onConfirmOrder(newOrder, paymentSlipFile);
      }
      if (onClearCart) {
        onClearCart();
      }

      // Notify entire app of newly placed order
      try {
        window.dispatchEvent(new CustomEvent('elvany_order_placed', { detail: newOrder }));
      } catch {}

      setConfirmedOrder(newOrder);
    } catch (err) {
      console.error('Order placement error:', err);
      alert('We encountered an issue registering your order. Please retry.');
    } finally {
      if (paymentMethod !== 'card') {
        setIsSubmitting(false);
      }
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
            {/* Maison ELVANY Official Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <img 
                src="/logo/Main.png" 
                alt="ELVANY" 
                style={{ 
                  maxHeight: '56px', 
                  maxWidth: '220px', 
                  objectFit: 'contain'
                }} 
              />
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

            {/* Return & Exchange Policy Guidelines */}
            <div style={{
              backgroundColor: '#0a0b0e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '3px solid var(--gold-bright)',
              borderRadius: '2px',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}>
              <div style={{
                color: 'var(--gold-bright)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem'
              }}>
                Return & Exchange Guidelines
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '1.1rem',
                fontSize: '0.8rem',
                color: 'var(--text-light-secondary)',
                lineHeight: 1.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <li>Garments can be returned or exchanged within <strong>7 days</strong> from delivery handover in original, unworn condition.</li>
                <li><strong>Return Delivery Fees:</strong> If you are returning the item, delivery fees should be handled by you.</li>
                <li><strong>Damaged Goods:</strong> If return is due to damage or defect only, ELVANY will handle and cover the delivery fees.</li>
                <li><strong>Exchange Delivery Fees:</strong> If you are exchanging the item, both delivery fees (return courier & replacement dispatch) should be handled by you.</li>
                <li><strong>Refund Processing:</strong> Any funds or refunds will be received after the package is safely received and verified by our atelier.</li>
              </ul>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn-primary-gold"
                disabled={isDownloadingPassport}
                onClick={async () => {
                  try {
                    setIsDownloadingPassport(true);
                    await downloadOrderInvoice(confirmedOrder);
                  } finally {
                    setIsDownloadingPassport(false);
                  }
                }}
                style={{ padding: '1rem 1.8rem' }}
                title="Download official offline passport PDF"
              >
                {isDownloadingPassport ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>GENERATING PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>DOWNLOAD ORDER PASSPORT</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                className="btn-outline-gold"
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
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* Top Breadcrumb & Return Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
            <button 
              type="button"
              className="search-back-btn"
              onClick={() => navigate('/')}
              style={{ marginBottom: 0 }}
            >
              <Home size={14} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
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

        {/* Modern Stepper Progress Bar */}
        <div className="checkout-stepper-modern">
          <div 
            className={`checkout-step-pill ${currentStep === 1 ? 'active' : 'completed'} ${currentStep === 2 ? 'clickable' : ''}`}
            onClick={() => currentStep === 2 && setCurrentStep(1)}
          >
            <span className="checkout-step-number">
              {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
            </span>
            <span className="checkout-step-text">
              <span className="hide-mobile">Delivery Destination</span>
              <span className="show-mobile-only">Delivery</span>
            </span>
          </div>

          <div className="checkout-step-divider" />

          <div className={`checkout-step-pill ${currentStep === 2 ? 'active' : ''}`}>
            <span className="checkout-step-number">
              2
            </span>
            <span className="checkout-step-text">
              <span className="hide-mobile">Payment & Confirmation</span>
              <span className="show-mobile-only">Payment</span>
            </span>
          </div>
        </div>

        {/* Mobile-Only Collapsible Order Summary Accordion Bar */}
        <button 
          type="button"
          className="checkout-mobile-summary-toggle"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          aria-expanded={mobileSummaryOpen}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={18} color="var(--gold-bright)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              {mobileSummaryOpen ? 'Hide order summary' : `Show order summary (${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'})`}
            </span>
            {mobileSummaryOpen ? <ChevronUp size={15} color="var(--gold-bright)" /> : <ChevronDown size={15} color="var(--gold-bright)" />}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
            {formatLKR(grandTotal)}
          </span>
        </button>

        {/* Mobile Summary Drawer */}
        <div className={`checkout-mobile-summary-content ${mobileSummaryOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
            {cart.map((item, idx) => {
              const itemKey = `mobile-${item.id}-${item.selectedSize || item.size || 'M'}-${idx}`;
              const isBespoke = Boolean(item.isBespokeCustom || item.designCode || (item.title || item.name || '').includes('Bespoke') || (item.title || item.name || '').includes('Custom'));
              const currentAngle = activeAngles[itemKey] || 'front';
              let displayImg = item.image || '/images/hero_tshirt.webp';
              if (isBespoke && item.views) {
                displayImg = item.views[currentAngle] || item.views.front || item.image || item.previewThumbnail;
              }

              return (
                <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div 
                    style={{ position: 'relative', width: '52px', height: '62px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#07080a', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, cursor: isBespoke ? 'pointer' : 'default' }}
                    onClick={() => isBespoke && setInspectedBespokeItem(item)}
                    title={isBespoke ? 'Click to inspect 4-sides blueprint' : ''}
                  >
                    <img src={displayImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--gold-bright)', color: '#000000', fontSize: '0.62rem', fontWeight: 800, padding: '1px 4px', borderRadius: '0 0 0 2px' }}>
                      {item.qty || 1}
                    </span>
                    {isBespoke && (
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'var(--gold-bright)', fontSize: '0.55rem', textAlign: 'center', fontWeight: 700 }}>
                        {currentAngle.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                      {item.selectedSize || item.size} • {item.color}
                    </div>
                    {isBespoke && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {['front', 'back', 'left', 'right'].map((ang) => (
                          <button
                            key={ang}
                            type="button"
                            onClick={() => setActiveAngles(prev => ({ ...prev, [itemKey]: ang }))}
                            style={{
                              background: currentAngle === ang ? 'var(--gold-bright)' : 'rgba(255,255,255,0.08)',
                              color: currentAngle === ang ? '#000' : '#fff',
                              border: 'none',
                              borderRadius: '2px',
                              padding: '2px 5px',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {ang.slice(0, 1).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
                      {formatLKR(getPrice(item) * (item.qty || 1))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
              <span>Subtotal:</span>
              <span style={{ color: '#ffffff' }}>{formatLKR(subtotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-bright)' }}>
                <span>Privilege Savings:</span>
                <span>-LKR {totalSavings.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: deliveryFee === 0 ? 'var(--gold-bright)' : '#ffffff' }}>
                {deliveryFee === 0 ? 'COMPLIMENTARY' : formatLKR(deliveryFee)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--gold-bright)' }}>{formatLKR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Form (Left) & Ledger (Right) */}
        <div className="checkout-grid">
          
          {/* =========================================================================
              LEFT COLUMN: STEP 1 (DELIVERY) OR STEP 2 (PAYMENT)
              ========================================================================= */}
          <div>
            
            {/* STEP 1: DELIVERY & CONTACT FORM */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedToPayment}>
                <div className="checkout-card">
                  
                  <div className="checkout-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div className="checkout-step-tag">
                        STEP 1 OF 2
                      </div>
                      <h3 className="checkout-card-title">
                        Courier Delivery Destination
                      </h3>
                    </div>

                    {/* Guest Sign In Link */}
                    {!isLoggedIn && (
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '3px',
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
                        <span>Sign In to Auto-Fill</span>
                      </button>
                    )}
                  </div>

                  {/* Saved Profile Address Selector for Logged In User */}
                  {isLoggedIn && savedDefault?.hasAddress && (
                    <div 
                      className={`checkout-address-card-toggle ${useDefaultAddress ? 'selected' : ''}`}
                      onClick={() => handleToggleDefaultAddress(!useDefaultAddress)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input 
                          type="checkbox"
                          checked={useDefaultAddress}
                          onChange={(e) => handleToggleDefaultAddress(e.target.checked)}
                          style={{ accentColor: 'var(--gold-bright)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
                            Use Default Profile Address
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                            {savedDefault.address}, {savedDefault.city}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 600, letterSpacing: '0.04em' }}>
                        {useDefaultAddress ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>
                  )}

                  {/* Form Input Groups */}
                  <div className="checkout-form-grid-2">
                    <div className="checkout-form-group">
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
                    <div className="checkout-form-group">
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

                  <div className="checkout-form-grid-2">
                    <div className="checkout-form-group">
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
                        placeholder="client@elvany.com"
                      />
                    </div>
                    <div className="checkout-form-group">
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

                  <div className="checkout-form-group" style={{ marginBottom: '1.2rem' }}>
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

                  <div className="checkout-form-grid-3">
                    <div className="checkout-form-group">
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
                    <div className="checkout-form-group">
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
                    <div className="checkout-form-group">
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
                  <div style={{ marginBottom: '1.2rem', padding: '0.2rem 0' }}>
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

                  <div className="checkout-form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">COURIER DISPATCH INSTRUCTIONS (OPTIONAL)</label>
                    <input 
                      type="text" 
                      value={deliveryNotes} 
                      onChange={(e) => setDeliveryNotes(e.target.value)} 
                      className="form-input" 
                      placeholder="e.g. Leave with concierge / Call upon arrival"
                    />
                  </div>

                  {/* Courier Dispatch Guarantee */}
                  <div style={{ padding: '0.9rem 1.15rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Truck size={18} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light-secondary)', lineHeight: 1.5 }}>
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
                    padding: '1.15rem',
                    fontSize: '0.88rem',
                    letterSpacing: '0.12em',
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
                  backgroundColor: '#0c0d12',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  padding: '1.1rem 1.35rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 700 }}>
                      DELIVERING TO
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>
                      {firstName} {lastName} • {address}, {city}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)' }}>
                      {email} • {phone}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--gold-border)',
                      color: 'var(--gold-bright)',
                      padding: '5px 11px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit2 size={12} />
                    <span>EDIT DESTINATION</span>
                  </button>
                </div>

                {/* Payment Selection Card */}
                <div className="checkout-card">
                  <div className="checkout-card-header">
                    <div className="checkout-step-tag">
                      STEP 2 OF 2
                    </div>
                    <h3 className="checkout-card-title">
                      Select Payment Method
                    </h3>
                  </div>

                  {/* Payment Tabs: Card, LankaQR, and Bank Transfer */}
                  <div className="checkout-payment-tabs">
                    {/* Credit / Debit Card (PayHere) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setSlipUploadError(false);
                        setCardPaymentError(null);
                      }}
                      className={`checkout-payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                    >
                      <CreditCard size={20} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        CREDIT / DEBIT CARD
                      </span>
                    </button>

                    {/* LankaQR / Direct QR Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('qr');
                        setCardPaymentError(null);
                      }}
                      className={`checkout-payment-tab-btn ${paymentMethod === 'qr' ? 'active' : ''}`}
                    >
                      <QrCode size={20} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        LANKAQR TRANSFER
                      </span>
                    </button>

                    {/* Bank Transfer Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('bank');
                        setCardPaymentError(null);
                      }}
                      className={`checkout-payment-tab-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                    >
                      <Building2 size={20} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        BANK TRANSFER
                      </span>
                    </button>
                  </div>

                  {/* 0. Credit / Debit Card Payment View (Professional & Clean) */}
                  {paymentMethod === 'card' && (
                    <div style={{
                      backgroundColor: '#0c0d12',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      padding: '1.25rem 1.4rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={17} color="var(--gold-bright)" />
                          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                            Credit / Debit Card
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>VISA</span>
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>MASTERCARD</span>
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>AMEX</span>
                        </div>
                      </div>

                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-light-secondary)',
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        After clicking <strong>Pay with Card</strong>, you will be redirected to the secure PayHere payment gateway to enter your card details and complete the transaction.
                      </p>

                      {paymentConfig.isSandbox && (
                        <div style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          fontSize: '0.74rem',
                          color: 'var(--text-light-muted)'
                        }}>
                          <span>Test Card: <strong style={{ color: '#ffffff' }}>4916 2175 0161 1292</strong> (Exp: 12/28, CVV: 123)</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('4916217501611292');
                              setCopiedTestCard('4916217501611292');
                              setTimeout(() => setCopiedTestCard(null), 2000);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedTestCard ? '#4ade80' : 'var(--gold-bright)',
                              cursor: 'pointer',
                              fontSize: '0.74rem',
                              fontWeight: 600
                            }}
                          >
                            {copiedTestCard ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}

                      {cardPaymentError && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '3px',
                          color: '#f87171',
                          fontSize: '0.76rem'
                        }}>
                          {cardPaymentError}
                        </div>
                      )}
                    </div>
                  )}



                  {/* 1. LankaQR Payment Method Details */}
                  {paymentMethod === 'qr' && (
                    <div className="checkout-qr-card">
                      
                      {/* QR Hero: Presentation & Total Due */}
                      <div className="checkout-qr-hero">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                          <div className="checkout-qr-img-box">
                            <img 
                              src="/QR/elvany_qr.jpeg" 
                              alt="ELVANY Business LankaQR Code"
                              className="checkout-qr-img"
                              onError={(e) => {
                                e.target.src = '/QR/WhatsApp Image 2026-08-31 at 13.16.57.jpeg';
                              }}
                            />
                          </div>

                          <a
                            href="/QR/elvany_qr.jpeg"
                            download="ELVANY_Payment_QR.jpeg"
                            className="btn-outline-gold"
                            style={{
                              padding: '0.45rem 0.85rem',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              textDecoration: 'none',
                              fontWeight: 700
                            }}
                          >
                            <Download size={12} />
                            <span>SAVE QR CODE</span>
                          </a>
                        </div>

                        {/* Amount Due & Copy Helper */}
                        <div className="checkout-qr-info">
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            TOTAL PAYABLE AMOUNT
                          </div>
                          
                          <div className="checkout-amount-badge">
                            {formatLKR(grandTotal)}
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={handleCopyAmount}
                              style={{
                                backgroundColor: copiedAmount ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                                border: copiedAmount ? '1px solid #4ade80' : '1px solid rgba(255, 255, 255, 0.12)',
                                color: copiedAmount ? '#4ade80' : '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '3px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {copiedAmount ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedAmount ? 'AMOUNT COPIED!' : 'COPY EXACT AMOUNT'}</span>
                            </button>
                          </div>

                          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', lineHeight: 1.45, marginTop: '0.2rem' }}>
                            Merchant: <strong style={{ color: '#ffffff' }}>ELVANY WEAR</strong><br />
                            Accepted via any Sri Lankan Banking or FinTech app (e.g. Commercial Flash, FriMi, Genie, Sampath Vishwa, etc).
                          </div>
                        </div>
                      </div>

                      {/* Streamlined Step-by-Step Guide */}
                      <div className="checkout-qr-steps">
                        <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Sparkles size={13} />
                          <span>QUICK PAYMENT STEPS</span>
                        </div>
                        <ol className="checkout-qr-steps-list">
                          <li>Open your <strong>Banking / QR Wallet App</strong> and scan the QR code above (or upload saved QR image).</li>
                          <li>Enter the exact amount <strong>{formatLKR(grandTotal)}</strong> and confirm the transfer.</li>
                          <li>Take a screenshot of the completed transfer and upload it below.</li>
                        </ol>
                      </div>

                      {/* Modern Dropzone for Payment Screenshot */}
                      <div id="payment-slip-upload-section">
                        <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                          UPLOAD QR PAYMENT SCREENSHOT / RECEIPT *
                        </label>
                        
                        {!paymentSlipPreview ? (
                          <label className={`checkout-dropzone ${slipUploadError ? 'has-error' : ''}`}>
                            <UploadCloud size={26} color={slipUploadError ? '#ef4444' : 'var(--gold-bright)'} />
                            <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>Click to Select or Upload Payment Screenshot</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>webp, PNG, WEBP, PDF (Max 10MB)</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={handleSlipUpload} 
                              style={{ display: 'none' }}
                            />
                          </label>
                        ) : (
                          <div className="checkout-uploaded-file-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <img 
                                src={paymentSlipPreview} 
                                alt="Payment receipt screenshot" 
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)' }} 
                              />
                              <div>
                                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>{paymentSlipFile?.name || 'QR_Payment_Receipt.png'}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>✓ Receipt attached for immediate concierge dispatch</div>
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
                              title="Remove receipt"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}

                        {slipUploadError && !paymentSlipFile && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            color: '#f87171',
                            fontSize: '0.76rem',
                            marginTop: '0.75rem',
                            fontWeight: 600
                          }}>
                            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span>MANDATORY: Please upload your payment screenshot or transfer receipt to place order.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* 2. Direct Bank Transfer Option Details */}
                  {paymentMethod === 'bank' && (
                    <div className="checkout-bank-details">
                      <div style={{ color: 'var(--gold-bright)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.9rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} />
                        <span>Maison ELVANY Official Bank Account</span>
                      </div>

                      {/* Luxury Bank Card Slip */}
                      <div className="checkout-bank-card-inner">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>BENEFICIARY</span>
                            <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>P C Jayaweera</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>BANK & BRANCH</span>
                            <strong style={{ color: '#ffffff' }}>Hatton National Bank (HNB)</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)' }}>Kurunegala Branch (019)</div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>ACCOUNT NUMBER</span>
                            <strong style={{ color: '#ffffff', fontSize: '1.15rem', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>019020601780</strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyAccount('019020601780')}
                            style={{
                              backgroundColor: copiedAccount ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.08)',
                              border: copiedAccount ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
                              color: copiedAccount ? '#4ade80' : '#ffffff',
                              padding: '5px 11px',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedAccount ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedAccount ? 'COPIED!' : 'COPY ACCOUNT'}</span>
                          </button>
                        </div>

                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-light-muted)' }}>
                          Payment Reference: <strong style={{ color: 'var(--gold-bright)' }}>Your Name / Mobile Number</strong>
                        </div>
                      </div>

                      {/* Slip Uploader */}
                      <div id="payment-slip-upload-section">
                        <label className="form-label" style={{ marginBottom: '0.5rem' }}>UPLOAD BANK DEPOSIT / TRANSFER SLIP *</label>
                        
                        {!paymentSlipPreview ? (
                          <label className={`checkout-dropzone ${slipUploadError ? 'has-error' : ''}`}>
                            <UploadCloud size={26} color={slipUploadError ? '#ef4444' : 'var(--gold-bright)'} />
                            <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>Click to Select or Upload Payment Slip</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>webp, PNG, WEBP, PDF (Max 10MB)</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={handleSlipUpload} 
                              style={{ display: 'none' }}
                            />
                          </label>
                        ) : (
                          <div className="checkout-uploaded-file-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <img 
                                src={paymentSlipPreview} 
                                alt="Slip preview" 
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)' }} 
                              />
                              <div>
                                <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>{paymentSlipFile?.name || 'Payment_Slip.png'}</div>
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

                        {slipUploadError && !paymentSlipFile && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            color: '#f87171',
                            fontSize: '0.76rem',
                            marginTop: '0.75rem',
                            fontWeight: 600
                          }}>
                            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span>MANDATORY: Please upload your payment deposit slip or screenshot to place order.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

                {/* Action Buttons Row */}
                <div className="checkout-actions-row">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    className="btn-outline-gold checkout-back-action-btn"
                  >
                    <ArrowLeft size={16} />
                    <span>BACK</span>
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      (paymentMethod === 'bank' && !loggedInUser) || 
                      (paymentMethod !== 'card' && !paymentSlipFile)
                    }
                    className="btn-primary-gold checkout-confirm-action-btn"
                    style={{
                      opacity: (isSubmitting || (paymentMethod === 'bank' && !loggedInUser) || (paymentMethod !== 'card' && !paymentSlipFile)) ? 0.6 : 1,
                      cursor: isSubmitting ? 'wait' : (paymentMethod !== 'card' && !paymentSlipFile) || (paymentMethod === 'bank' && !loggedInUser) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>{paymentMethod === 'card' ? 'OPENING SECURE PAYMENT WINDOW...' : 'AUTHENTICATING & PROCESSING ACQUISITION...'}</span>
                      </span>
                    ) : paymentMethod === 'card' ? (
                      <>
                        <Lock size={16} />
                        <span>PAY WITH CARD • {formatLKR(grandTotal)}</span>
                      </>
                    ) : (paymentMethod === 'bank' && !loggedInUser) ? (
                      <>
                        <Lock size={16} />
                        <span>LOG IN REQUIRED FOR BANK TRANSFER</span>
                      </>
                    ) : !paymentSlipFile ? (
                      <>
                        <UploadCloud size={16} />
                        <span>ATTACH PAYMENT SLIP TO CONFIRM</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>CONFIRM & PLACE ORDER • {formatLKR(grandTotal)}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* =========================================================================
              RIGHT COLUMN: ORDER LEDGER & SUMMARY (DESKTOP STICKY)
              ========================================================================= */}
          <div>
            <div className="checkout-summary-card">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 400 }}>
                  Acquisition Ledger
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', letterSpacing: '0.1em' }}>
                  {totalItemsCount} {totalItemsCount === 1 ? 'PIECE' : 'PIECES'}
                </span>
              </div>

              {/* Garment Items List */}
              <div className="checkout-summary-item-list">
                {cart.map((item, idx) => {
                  const itemKey = `desktop-${item.id}-${item.selectedSize || item.size || 'M'}-${idx}`;
                  const isBespoke = Boolean(item.isBespokeCustom || item.designCode || (item.title || item.name || '').includes('Bespoke') || (item.title || item.name || '').includes('Custom'));
                  const currentAngle = activeAngles[itemKey] || 'front';
                  let displayImg = item.image || '/images/hero_tshirt.webp';
                  if (isBespoke && item.views) {
                    displayImg = item.views[currentAngle] || item.views.front || item.image || item.previewThumbnail;
                  }

                  return (
                    <div key={idx} className="checkout-summary-item" style={{ alignItems: 'flex-start' }}>
                      <div 
                        className="checkout-summary-item-img"
                        style={{ width: '56px', height: '68px', cursor: isBespoke ? 'pointer' : 'default' }}
                        onClick={() => isBespoke && setInspectedBespokeItem(item)}
                        title={isBespoke ? 'Click to inspect 4-sides blueprint' : ''}
                      >
                        <img src={displayImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--gold-bright)', color: '#000000', fontSize: '0.62rem', fontWeight: 800, padding: '1px 4px', borderRadius: '0 0 0 2px' }}>
                          {item.qty || 1}
                        </span>
                        {isBespoke && (
                          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'var(--gold-bright)', fontSize: '0.55rem', textAlign: 'center', fontWeight: 700 }}>
                            {currentAngle.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: '#ffffff', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                          {item.selectedSize || item.size} • {item.color}
                        </div>
                        {item.isOfferApplied && (
                          <span style={{ fontSize: '0.62rem', backgroundColor: 'var(--gold-bright)', color: '#000000', fontWeight: 800, padding: '1px 4px', borderRadius: '1px', display: 'inline-block', marginTop: '2px' }}>
                            ⚡ PRIVILEGE APPLIED
                          </span>
                        )}

                        {/* 4-Angle Switcher for Bespoke Item */}
                        {isBespoke && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                            {['front', 'back', 'left', 'right'].map((ang) => (
                              <button
                                key={ang}
                                type="button"
                                onClick={() => setActiveAngles(prev => ({ ...prev, [itemKey]: ang }))}
                                style={{
                                  background: currentAngle === ang ? 'var(--gold-bright)' : 'rgba(255,255,255,0.08)',
                                  color: currentAngle === ang ? '#000' : '#ffffff',
                                  border: 'none',
                                  borderRadius: '2px',
                                  padding: '2px 6px',
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title={`View ${ang} side`}
                              >
                                {ang.toUpperCase()}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setInspectedBespokeItem(item)}
                              style={{
                                background: 'rgba(197, 160, 89, 0.15)',
                                color: 'var(--gold-bright)',
                                border: '1px solid rgba(197, 160, 89, 0.3)',
                                borderRadius: '2px',
                                padding: '2px 5px',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                              title="Open 4-sides blueprint inspection"
                            >
                              <Maximize2 size={9} />
                              <span>4-SIDES</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
                          {formatLKR(getPrice(item) * (item.qty || 1))}
                        </div>
                        {item.isOfferApplied && item.originalPriceLKR && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', textDecoration: 'line-through' }}>
                            {formatLKR(item.originalPriceLKR * (item.qty || 1))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ledger Totals */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>Garment Subtotal:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatLKR(subtotal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-bright)' }}>
                    <span>Special Privilege Savings:</span>
                    <span style={{ fontWeight: 700 }}>-LKR {totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>Island-Wide Courier Delivery:</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--gold-bright)' : '#ffffff', fontWeight: 700 }}>
                    {deliveryFee === 0 ? 'COMPLIMENTARY' : formatLKR(deliveryFee)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light-secondary)' }}>
                  <span>Import Taxes & Atelier VAT:</span>
                  <span style={{ color: '#ffffff' }}>INCLUDED</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.4rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>Total Settled:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-bright)', fontWeight: 800 }}>
                    {formatLKR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Trust Assurances */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
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
                      src={panel.img || '/images/hero_tshirt.webp'} 
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
