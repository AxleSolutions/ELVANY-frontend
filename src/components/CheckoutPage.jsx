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
  CreditCard,
  Tag,
  Ticket,
  ShieldAlert
} from 'lucide-react';
import { downloadImageFile } from '../lib/bespokeMockupGenerator';
import { downloadOrderInvoice } from '../lib/orderInvoiceGenerator';
import { validateClientEmail } from '../lib/emailValidator';
import { validateVoucher, redeemVoucher, getVoucherRateLimitStatus, recordOfferPurchases } from '../services/dbService';
import { 
  getPayHereParameters, 
  launchPayHerePayment, 
  confirmCardPayment, 
  getPaymentGatewayConfig 
} from '../services/payhereService';
import { 
  launchKokoPayment, 
  calculateKokoAmounts, 
  verifyKokoOrderStatus,
  KOKO_SURCHARGE_PERCENT 
} from '../services/kokoService';
import { 
  VisaMastercardLogo,
  VisaLogo, 
  MastercardLogo, 
  AmexLogo, 
  KokoLogo, 
  LankaQrLogo 
} from './PaymentLogos';

import { CITIES_LIST } from './AccountPage';
import { sendOrderConfirmationReceipt } from '../services/emailNotificationService';

// Configurable delivery fee logic (Supports flat standard rates, city-based rates, or free thresholds)
export const STANDARD_DELIVERY_FEE_LKR = 450;
export const FREE_DELIVERY_THRESHOLD_LKR = 8500;

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
          phone: defaultAddr.phone || userProfile?.phone || '',
          secondaryPhone: defaultAddr.secondaryPhone || userProfile?.secondaryPhone || '',
          address: defaultAddr.streetAddress || '',
          apartment: defaultAddr.apartment || '',
          city: defaultAddr.city || 'Kandy',
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
        secondaryPhone: userProfile.secondaryPhone || '',
        address: userProfile.address || '',
        apartment: userProfile.apartment || '',
        city: userProfile.city || 'Kandy',
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

  // Atelier Single-Use Voucher & Gift Card State
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [rateLimitLock, setRateLimitLock] = useState(() => getVoucherRateLimitStatus());

  // Monitor Rate Limit Status
  useEffect(() => {
    const status = getVoucherRateLimitStatus();
    setRateLimitLock(status);
  }, []);

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
  const [secondaryPhone, setSecondaryPhone] = useState(isLoggedIn ? (savedDefault?.secondaryPhone || userProfile?.secondaryPhone || '') : '');
  const [firstName, setFirstName] = useState(isLoggedIn ? (savedDefault?.firstName || initialNameParts[0] || '') : '');
  const [lastName, setLastName] = useState(isLoggedIn ? (savedDefault?.lastName || initialNameParts.slice(1).join(' ') || '') : '');
  const [address, setAddress] = useState(isLoggedIn ? (savedDefault?.address || '') : '');
  const [apartment, setApartment] = useState(isLoggedIn ? (savedDefault?.apartment || '') : '');
  const [city, setCity] = useState(isLoggedIn && savedDefault?.city ? savedDefault.city : 'Kandy');
  const [postalCode, setPostalCode] = useState(isLoggedIn ? (savedDefault?.postalCode || '') : '');
  const [country, setCountry] = useState('Sri Lanka');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const clearFieldError = (field) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Strict Client Email Guard: Detach voucher if email changed away from assigned recipient
  useEffect(() => {
    if (appliedVoucher?.recipientEmail && email) {
      if (email.trim().toLowerCase() !== appliedVoucher.recipientEmail.trim().toLowerCase()) {
        setAppliedVoucher(null);
        setVoucherError(`Voucher "${appliedVoucher.code}" was unlinked because checkout email was modified.`);
      }
    }
  }, [email, appliedVoucher]);

  // Handle toggling default address
  const handleToggleDefaultAddress = (checked) => {
    setUseDefaultAddress(checked);
    setFormErrors({});
    if (checked) {
      const def = getSavedDefaultAddress();
      if (def) {
        if (def.firstName) setFirstName(def.firstName);
        if (def.lastName) setLastName(def.lastName);
        if (def.email) setEmail(def.email);
        if (def.phone) setPhone(def.phone);
        if (def.secondaryPhone) setSecondaryPhone(def.secondaryPhone);
        setAddress(def.address);
        setApartment(def.apartment);
        setCity(def.city);
        setPostalCode(def.postalCode);
        setCountry(def.country);
      }
    } else {
      setSecondaryPhone('');
      setAddress('');
      setApartment('');
      setPostalCode('');
    }
  };

  // Form State - Step 2: Payment Method (Card, Koko BNPL, QR, or Bank Transfer)
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'koko' | 'qr' | 'bank'
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

  // Load gateway configuration and handle Koko return & verification on mount
  useEffect(() => {
    getPaymentGatewayConfig().then((cfg) => {
      if (cfg && cfg.success) {
        setPaymentConfig(cfg);
      }
    });

    // Check if returning from Koko Gateway redirect
    const queryParams = new URLSearchParams(window.location.search);
    const kokoVerify = queryParams.get('koko_verify') || queryParams.get('koko_return');
    const kokoCancel = queryParams.get('koko_cancel') || queryParams.get('koko_status') === 'cancel';
    const orderIdParam = queryParams.get('orderId');
    const statusParam = (queryParams.get('status') || '').toUpperCase();
    const trnIdParam = queryParams.get('trnId');

    if (kokoCancel || statusParam === 'CANCELLED' || statusParam === 'CANCELED' || statusParam === 'FAILURE') {
      // Payment was not completed or was cancelled: Keep items in cart so user loses nothing
      setPaymentMethod('koko');
      setCurrentStep(2);
      setCardPaymentError('Koko BNPL transaction was not completed or was cancelled. Your items remain safely in your bag. You can retry or choose another payment method.');
      setIsSubmitting(false);
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
      return;
    }

    if ((kokoVerify || statusParam === 'SUCCESS') && orderIdParam) {
      setIsSubmitting(true);
      setPaymentMethod('koko');

      verifyKokoOrderStatus(orderIdParam).then(async (verifyRes) => {
        // Confirm whether Koko officially verified the order
        const isVerifiedSuccess = statusParam === 'SUCCESS' || verifyRes?.data?.status === 'SUCCESS' || verifyRes?.success;

        if (isVerifiedSuccess) {
          let pendingOrder = null;
          try {
            const saved = localStorage.getItem('elvany_pending_koko_order');
            if (saved) pendingOrder = JSON.parse(saved);
          } catch {}

          const finalizedOrder = {
            ...(pendingOrder || {}),
            orderId: orderIdParam,
            status: 'Payment Verified — Processing Dispatch',
            paymentMethod: 'Koko Buy Now Pay Later',
            koko_status: 'SUCCESS',
            koko_trn_id: trnIdParam || verifyRes?.data?.trnId || 'KOKO-CONFIRMED'
          };

          // Register verified order in store & database
          if (onConfirmOrder) {
            await onConfirmOrder(finalizedOrder, null);
          }
          // Now safely clear cart only AFTER payment is verified
          if (onClearCart) {
            onClearCart();
          }

          if (finalizedOrder.voucherCode) {
            try {
              await redeemVoucher(finalizedOrder.voucherCode, finalizedOrder.orderId, finalizedOrder.customerEmail || email);
            } catch (vErr) {
              console.warn('Voucher redeem notice (Koko):', vErr);
            }
          }

          // Deduct stock and increment claimed units for any privilege offer items purchased
          try {
            await recordOfferPurchases(finalizedOrder.items || cart);
          } catch (oErr) {
            console.warn('Offer stock deduction notice (Koko):', oErr);
          }

          try {
            window.dispatchEvent(new CustomEvent('elvany_order_placed', { detail: finalizedOrder }));
            sendOrderConfirmationReceipt(finalizedOrder).catch(err => console.warn('Koko receipt notice:', err));
          } catch {}

          localStorage.removeItem('elvany_pending_koko_order');
          setConfirmedOrder(finalizedOrder);
        } else {
          setCardPaymentError('Koko payment could not be confirmed by the payment gateway. Please verify your transaction in your Koko app or choose another payment method.');
        }
      }).catch((err) => {
        console.error('Koko verification error:', err);
        setCardPaymentError('We could not confirm your Koko payment with the gateway. Please retry or contact concierge support.');
      }).finally(() => {
        setIsSubmitting(false);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {}
      });
    }
  }, []);


  // Financial calculations
  const getPrice = (item) => item.priceLKR || item.price || 18500;
  const getOriginalPrice = (item) => item.originalPriceLKR || getPrice(item);

  const subtotal = cart.reduce((sum, item) => sum + getPrice(item) * (item.qty || 1), 0);
  const totalOriginal = cart.reduce((sum, item) => sum + getOriginalPrice(item) * (item.qty || 1), 0);
  const totalSavings = totalOriginal - subtotal;
  const totalItemsCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Atelier Single-Use Voucher Discount Calculation
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      voucherDiscount = Math.round((subtotal * (Number(appliedVoucher.discountValue) || 0)) / 100);
    } else {
      voucherDiscount = Math.min(subtotal, Math.round(Number(appliedVoucher.discountValue) || 0));
    }
  }
  const discountedSubtotal = Math.max(0, subtotal - voucherDiscount);

  // Dynamic Delivery Fee Calculation
  const deliveryFee = calculateDeliveryFee(subtotal, city);
  const baseOrderTotal = discountedSubtotal + deliveryFee;

  // Handle Voucher Application & Verification with Rate-Limiting Protection
  const handleApplyVoucher = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = voucherInput.trim().toUpperCase();
    if (!cleanCode) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    const currentThrottle = getVoucherRateLimitStatus();
    if (currentThrottle.isLocked) {
      setRateLimitLock(currentThrottle);
      setVoucherError(`Security Lockout Active: Too many failed attempts. Voucher entry is locked for ${currentThrottle.remainingMinutes} more minute(s).`);
      return;
    }

    setVoucherError('');
    setIsCheckingVoucher(true);
    try {
      const res = await validateVoucher(cleanCode, subtotal, email);
      const updatedThrottle = getVoucherRateLimitStatus();
      setRateLimitLock(updatedThrottle);

      if (res.valid) {
        setAppliedVoucher(res.voucher);
        setVoucherError('');
      } else {
        setVoucherError(res.error || res.message || 'Invalid or expired voucher code.');
      }
    } catch (err) {
      setVoucherError('Unable to validate voucher. Please try again.');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  // Koko BNPL 12% Surcharge Calculations
  const isKoko = paymentMethod === 'koko';
  const isCard = paymentMethod === 'card';
  const isOnlinePayment = isCard || isKoko;

  const kokoCalc = calculateKokoAmounts(baseOrderTotal, KOKO_SURCHARGE_PERCENT);
  const kokoSurchargeLKR = isKoko ? kokoCalc.surchargeAmount : 0;
  const grandTotal = baseOrderTotal + kokoSurchargeLKR;
  const kokoInstalmentLKR = kokoCalc.instalmentAmount;

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

  const validateDeliveryForm = () => {
    const errors = {};
    if (!firstName || !firstName.trim()) {
      errors.firstName = 'First name is required.';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters.';
    }

    if (!lastName || !lastName.trim()) {
      errors.lastName = 'Last name is required.';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters.';
    }

    const emailResult = validateClientEmail(email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }

    const cleanPhone = (phone || '').trim().replace(/[\s\-]/g, '');
    const sriLankanMobileRegex = /^(\+947\d{8}|947\d{8}|07\d{8}|7\d{8})$/;
    if (!phone || !phone.trim()) {
      errors.phone = 'Primary mobile phone number is required.';
    } else if (!sriLankanMobileRegex.test(cleanPhone)) {
      errors.phone = 'Enter a valid mobile number: 07XXXXXXXX, 7XXXXXXXX, or +947XXXXXXXX.';
    }

    const cleanSecondary = (secondaryPhone || '').trim().replace(/[\s\-]/g, '');
    if (!secondaryPhone || !secondaryPhone.trim()) {
      errors.secondaryPhone = 'Secondary mobile phone number is required.';
    } else if (!sriLankanMobileRegex.test(cleanSecondary)) {
      errors.secondaryPhone = 'Enter a valid mobile number: 07XXXXXXXX, 7XXXXXXXX, or +947XXXXXXXX.';
    } else if (cleanSecondary === cleanPhone) {
      errors.secondaryPhone = 'Secondary number cannot be the same as your primary number.';
    }

    if (!address || !address.trim()) {
      errors.address = 'Street address is required.';
    } else if (address.trim().length < 5) {
      errors.address = 'Please enter a complete street address.';
    }

    if (!city || !city.trim()) {
      errors.city = 'Please select your delivery city.';
    }

    if (!postalCode || !postalCode.trim()) {
      errors.postalCode = 'Postal code is required.';
    } else if (postalCode.trim().length < 3) {
      errors.postalCode = 'Please enter a valid postal code.';
    }

    return errors;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const errors = validateDeliveryForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstField = Object.keys(errors)[0];
      const targetElement = document.getElementById(`checkout-${firstField}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.focus();
      }
      return;
    }
    setFormErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setCardPaymentError(null);

    // Strict Enforcement: Payment slip is mandatory ONLY for QR and Bank Transfer
    if (!isOnlinePayment && !paymentSlipFile) {
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

      const newOrder = {
        orderId,
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: email,
        customerPhone: phone,
        customerSecondaryPhone: secondaryPhone.trim() || null,
        customerLocation: fullLocation,
        deliveryAddress: {
          firstName,
          lastName,
          recipientName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          secondaryPhone: secondaryPhone.trim() || null,
          streetAddress: address,
          apartment,
          city,
          postalCode,
          country,
          deliveryNotes,
          location: fullLocation,
          deliveryFeeLKR: deliveryFee,
          orderedAt: new Date().toISOString(),
          orderTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        },
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        orderTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        orderDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: isCard
          ? 'Payment Verified — Processing Dispatch'
          : isKoko
          ? 'Pending Koko Payment'
          : 'Pending Slip Verification',
        paymentMethod: isCard
          ? 'PayHere Secure Online Card Payment'
          : isKoko
          ? 'Koko Buy Now Pay Later'
          : paymentMethod === 'qr'
          ? 'LankaQR Instant Transfer'
          : 'Direct Bank Transfer',
        hasSlipAttached: isOnlinePayment ? false : !!paymentSlipFile,
        subtotalLKR: subtotal,
        deliveryFeeLKR: deliveryFee,
        shippingFeeLKR: deliveryFee,
        surchargeLKR: kokoSurchargeLKR,
        paymentSurchargePercent: isKoko ? KOKO_SURCHARGE_PERCENT : 0,
        totalLKR: grandTotal,
        grandTotalLKR: grandTotal,
        savingsLKR: totalSavings,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        voucherDiscountLKR: appliedVoucher ? voucherDiscount : 0,
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
          selectedSize: typeof (c.selectedSize || c.size) === 'string' ? (c.selectedSize || c.size).replace(/\s*\([^)]*\)\s*\d*/g, '').trim() : 'M',
          size: typeof (c.selectedSize || c.size) === 'string' ? (c.selectedSize || c.size).replace(/\s*\([^)]*\)\s*\d*/g, '').trim() : 'M',
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
            phone: phone || '',
            secondaryPhone: secondaryPhone || '',
            streetAddress: address,
            apartment: apartment || '',
            city: city || 'Kandy',
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

                if (appliedVoucher?.code) {
                  try {
                    await redeemVoucher(appliedVoucher.code, verifiedOrder.orderId, email);
                  } catch (vErr) {
                    console.warn('Voucher redeem notice (Card):', vErr);
                  }
                }

                // Deduct stock and increment claimed units for any privilege offer items purchased
                try {
                  await recordOfferPurchases(cart);
                } catch (oErr) {
                  console.warn('Offer stock deduction notice (Card):', oErr);
                }

                try {
                  window.dispatchEvent(new CustomEvent('elvany_order_placed', { detail: verifiedOrder }));
                  sendOrderConfirmationReceipt(verifiedOrder).catch(err => console.warn('Card receipt notice:', err));
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
      // PATH B: KOKO BUY NOW PAY LATER (3 INSTALMENTS)
      // ========================================================
      if (isKoko) {
        try {
          // Persist pending order to local storage (DO NOT clear cart until verified)
          try {
            localStorage.setItem('elvany_pending_koko_order', JSON.stringify(newOrder));
          } catch {}

          const returnUrl = `${window.location.origin}/checkout?koko_verify=true&orderId=${newOrder.orderId}`;
          const cancelUrl = `${window.location.origin}/checkout?koko_cancel=true&orderId=${newOrder.orderId}`;

          // Launch Koko Checkout Portal & Auto-Submit Form
          await launchKokoPayment({
            orderId: newOrder.orderId,
            amount: grandTotal,
            firstName,
            lastName,
            email,
            description: `ELVANY Order ${newOrder.orderId}`,
            returnUrl,
            cancelUrl,
            items: cart
          });
        } catch (kokoErr) {
          setIsSubmitting(false);
          setCardPaymentError(kokoErr.message || 'Could not connect to Koko Payment Gateway. Please try again.');
        }
        return;
      }

      // ========================================================
      // PATH C: BANK TRANSFER OR LANKAQR WITH SLIP
      // ========================================================
      if (onConfirmOrder) {
        await onConfirmOrder(newOrder, paymentSlipFile);
      }
      if (onClearCart) {
        onClearCart();
      }

      if (appliedVoucher?.code) {
        try {
          await redeemVoucher(appliedVoucher.code, newOrder.orderId, email);
        } catch (vErr) {
          console.warn('Voucher redeem notice (Direct):', vErr);
        }
      }

      // Deduct stock and increment claimed units for any privilege offer items purchased
      try {
        await recordOfferPurchases(cart);
      } catch (oErr) {
        console.warn('Offer stock deduction notice (Direct):', oErr);
      }

      // Notify entire app of newly placed order
      try {
        window.dispatchEvent(new CustomEvent('elvany_order_placed', { detail: newOrder }));
        sendOrderConfirmationReceipt(newOrder).catch(err => console.warn('Order receipt notice:', err));
      } catch {}

      setConfirmedOrder(newOrder);
    } catch (err) {
      console.error('Order placement error:', err);
      alert('We encountered an issue registering your order. Please retry.');
    } finally {
      if (!isOnlinePayment) {
        setIsSubmitting(false);
      }
    }
  };




  // If order was confirmed, show the Acquisition Passport
  if (confirmedOrder) {
    return (
      <div className="checkout-page" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f6f0', 
        color: '#121316', 
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="container" style={{ maxWidth: '740px', width: '100%', margin: 'auto' }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2ddd5',
            borderRadius: '4px',
            padding: '2.2rem 2rem 2.4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* ELVANY Official Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <img 
                src="/logo/Main-6.png" 
                alt="ELVANY" 
                style={{ 
                  maxHeight: '44px', 
                  maxWidth: '180px', 
                  objectFit: 'contain'
                }} 
              />
            </div>

            <div style={{
              color: '#8f6f32',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              ELVANY • ACQUISITION CONFIRMED
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', color: '#121316', fontWeight: 400, margin: '0 0 0.5rem 0' }}>
              Order Passport #{confirmedOrder.orderId}
            </h1>

            <p style={{ color: '#4a4c54', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 1.2rem auto', lineHeight: 1.5 }}>
              Thank you, <strong style={{ color: '#121316' }}>{confirmedOrder.customerName}</strong>. Your acquisition has been registered and verified by the Florentine atelier.
            </p>

            {/* Passport Detail Summary */}
            <div style={{
              backgroundColor: '#fbf8f2',
              border: '1px solid #e5dfd5',
              borderRadius: '4px',
              padding: '1.2rem 1.4rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #e5dfd5', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>DELIVERY DESTINATION</span>
                  <strong style={{ fontSize: '0.84rem', color: '#121316' }}>{confirmedOrder.customerLocation}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>PAYMENT METHOD</span>
                  <strong style={{ fontSize: '0.84rem', color: '#121316' }}>{confirmedOrder.paymentMethod}</strong>
                  {confirmedOrder.hasSlipAttached ? (
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#8f6f32', marginTop: '2px' }}>✓ Bank Transfer Receipt Attached</span>
                  ) : confirmedOrder.paymentMethod?.toLowerCase().includes('cod') || confirmedOrder.paymentMethod?.includes('Cash') ? (
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#8f6f32', marginTop: '2px' }}>✓ Cash Collection Upon Handover</span>
                  ) : null}

                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>ESTIMATED DISPATCH</span>
                  <strong style={{ fontSize: '0.84rem', color: '#8f6f32' }}>Next Business Day (Island-Wide)</strong>
                </div>
              </div>

              {/* Items List (Capped with smooth scroll if many items so card fits within viewport) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '36px', height: '42px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #e2ddd5' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#121316', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#767982' }}>{item.selectedSize} • {item.color} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', color: '#8f6f32', fontWeight: 700, fontSize: '0.92rem' }}>
                      {formatLKR(item.priceLKR * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {confirmedOrder.savingsLKR > 0 && (
                <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #e5dfd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8f6f32' }}>Privilege Atelier Savings Applied:</span>
                  <span style={{ fontSize: '0.82rem', color: '#8f6f32', fontWeight: 700 }}>-LKR {confirmedOrder.savingsLKR.toLocaleString()}</span>
                </div>
              )}

              {(confirmedOrder.voucherCode || confirmedOrder.voucherDiscountLKR > 0) && (
                <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #e5dfd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Atelier Voucher Applied ({confirmedOrder.voucherCode || 'GIFT'}):</span>
                  <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>-LKR {Number(confirmedOrder.voucherDiscountLKR || 0).toLocaleString()}</span>
                </div>
              )}

              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #e5dfd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#121316', fontWeight: 600 }}>Total Settled:</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#8f6f32', fontWeight: 700 }}>
                  {formatLKR(confirmedOrder.totalLKR)}
                </span>
              </div>
            </div>

            {/* Action CTAs (Directly visible in viewport without page scroll) */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                style={{ padding: '0.85rem 1.6rem', fontSize: '0.82rem' }}
                title="Download official offline passport PDF"
              >
                {isDownloadingPassport ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>GENERATING PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>DOWNLOAD ORDER PASSPORT</span>
                  </>
                )}
              </button>

              <button 
                type="button"
                className="btn-outline-gold"
                onClick={() => navigate('/account?tab=orders')}
                style={{ padding: '0.85rem 1.6rem', fontSize: '0.82rem' }}
              >
                <span>VIEW IN MY ORDERS</span>
                <ArrowRight size={15} />
              </button>

              <button 
                type="button"
                className="btn-outline-gold"
                onClick={() => navigate('/')}
                style={{ padding: '0.85rem 1.6rem', fontSize: '0.82rem' }}
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
      <div className="checkout-page" style={{ minHeight: '100vh', backgroundColor: '#f8f6f0', color: '#121316', padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2ddd5', padding: '3.5rem 2rem', borderRadius: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <ShoppingBag size={48} color="#8f6f32" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#121316', marginBottom: '0.8rem' }}>Your Shopping Bag is Empty</h2>
            <p style={{ color: '#555861', fontSize: '0.88rem', marginBottom: '2rem' }}>
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
              <Home size={14} color="#8f6f32" />
              <span>HOME</span>
            </button>
            <span style={{ color: '#d4cdc3' }}>/</span>
            <span style={{ color: '#8f6f32', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
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
            <ShoppingBag size={18} color="#8f6f32" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              {mobileSummaryOpen ? 'Hide order summary' : `Show order summary (${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'})`}
            </span>
            {mobileSummaryOpen ? <ChevronUp size={15} color="#8f6f32" /> : <ChevronDown size={15} color="#8f6f32" />}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#8f6f32', fontWeight: 700 }}>
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
                    style={{ position: 'relative', width: '52px', height: '62px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#f7f5ef', border: '1px solid #e2ddd5', flexShrink: 0, cursor: isBespoke ? 'pointer' : 'default' }}
                    onClick={() => isBespoke && setInspectedBespokeItem(item)}
                    title={isBespoke ? 'Click to inspect 4-sides blueprint' : ''}
                  >
                    <img src={displayImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#c5a059', color: '#000000', fontSize: '0.62rem', fontWeight: 800, padding: '1px 4px', borderRadius: '0 0 0 2px' }}>
                      {item.qty || 1}
                    </span>
                    {isBespoke && (
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'var(--gold-bright)', fontSize: '0.55rem', textAlign: 'center', fontWeight: 700 }}>
                        {currentAngle.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', color: '#121316', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '0.72rem', color: '#767982' }}>
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
                              background: currentAngle === ang ? '#c5a059' : '#f4eee2',
                              color: currentAngle === ang ? '#000' : '#121316',
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
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: '#8f6f32', fontWeight: 700 }}>
                      {formatLKR(getPrice(item) * (item.qty || 1))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #e5dfd5', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4c54' }}>
              <span>Subtotal:</span>
              <span style={{ color: '#121316', fontWeight: 600 }}>{formatLKR(subtotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f6f32' }}>
                <span>Privilege Savings:</span>
                <span>-LKR {totalSavings.toLocaleString()}</span>
              </div>
            )}
            {appliedVoucher && voucherDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Voucher Applied ({appliedVoucher.code}):</span>
                <span style={{ fontWeight: 700 }}>-{formatLKR(voucherDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4c54' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: deliveryFee === 0 ? '#8f6f32' : '#121316', fontWeight: 600 }}>
                {deliveryFee === 0 ? 'COMPLIMENTARY' : formatLKR(deliveryFee)}
              </span>
            </div>
            {isKoko && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f6f32' }}>
                <span>Koko BNPL Surcharge (12%):</span>
                <span>+{formatLKR(kokoSurchargeLKR)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#121316', fontWeight: 700, fontSize: '0.92rem', paddingTop: '0.5rem', borderTop: '1px solid #e5dfd5' }}>
              <span>Total:</span>
              <span style={{ color: '#8f6f32' }}>{formatLKR(grandTotal)}</span>
            </div>
            {isKoko && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#767982', fontSize: '0.74rem' }}>
                <span>3x Instalments:</span>
                <span style={{ color: '#8f6f32', fontWeight: 600 }}>3 x {formatLKR(kokoInstalmentLKR)} / mo</span>
              </div>
            )}
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
              <form onSubmit={handleProceedToPayment} noValidate>
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
                          padding: '0.55rem 0.95rem',
                          borderRadius: '3px',
                          border: '1px solid #b58d42',
                          backgroundColor: '#c5a059',
                          color: '#000000',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          letterSpacing: '0.04em',
                          opacity: 1
                        }}
                      >
                        <UserCheck size={13} color="#000000" />
                        <span style={{ color: '#000000' }}>Sign In to Auto-Fill</span>
                      </button>
                    )}
                  </div>

                  {/* Validation Error Banner */}
                  {Object.keys(formErrors).length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.85rem 1rem',
                      marginBottom: '1.25rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      color: '#991b1b',
                      fontSize: '0.82rem',
                      fontWeight: 500
                    }}>
                      <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span>Please complete the required courier delivery details highlighted below.</span>
                    </div>
                  )}

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
                          style={{ accentColor: '#c5a059', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#121316', fontWeight: 600 }}>
                            Use Default Profile Address
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#767982', marginTop: '2px' }}>
                            {savedDefault.address}, {savedDefault.city}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#8f6f32', fontWeight: 600, letterSpacing: '0.04em' }}>
                        {useDefaultAddress ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>
                  )}

                  {/* Form Input Groups */}
                  <div className="checkout-form-grid-2">
                    <div className="checkout-form-group">
                      <label className="form-label" htmlFor="checkout-firstName">FIRST NAME *</label>
                      <input 
                        id="checkout-firstName"
                        type="text" 
                        value={firstName} 
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setUseDefaultAddress(false);
                          clearFieldError('firstName');
                        }} 
                        className="form-input" 
                        style={{
                          borderColor: formErrors.firstName ? '#dc2626' : undefined,
                          boxShadow: formErrors.firstName ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.firstName)}
                        placeholder="Julian"
                      />
                      {formErrors.firstName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.firstName}</span>
                        </div>
                      )}
                    </div>
                    <div className="checkout-form-group">
                      <label className="form-label" htmlFor="checkout-lastName">LAST NAME *</label>
                      <input 
                        id="checkout-lastName"
                        type="text" 
                        value={lastName} 
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setUseDefaultAddress(false);
                          clearFieldError('lastName');
                        }} 
                        className="form-input" 
                        style={{
                          borderColor: formErrors.lastName ? '#dc2626' : undefined,
                          boxShadow: formErrors.lastName ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.lastName)}
                        placeholder="Sterling"
                      />
                      {formErrors.lastName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="checkout-form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label" htmlFor="checkout-email">EMAIL ADDRESS *</label>
                    <input 
                      id="checkout-email"
                      type="email" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setUseDefaultAddress(false);
                        clearFieldError('email');
                      }} 
                      onBlur={() => {
                        if (email && email.trim()) {
                          const res = validateClientEmail(email);
                          if (!res.isValid) {
                            setFormErrors((prev) => ({ ...prev, email: res.error }));
                          }
                        }
                      }}
                      className="form-input" 
                      style={{
                        borderColor: formErrors.email ? '#dc2626' : undefined,
                        boxShadow: formErrors.email ? '0 0 0 1px #dc2626' : undefined
                      }}
                      aria-invalid={Boolean(formErrors.email)}
                      placeholder="client@elvany.com"
                    />
                    {formErrors.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} color="#dc2626" />
                        <span>{formErrors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary & Secondary Mobile Phones (Side-by-Side in 2-Column Grid) */}
                  <div className="checkout-form-grid-2">
                    <div className="checkout-form-group">
                      <label className="form-label" htmlFor="checkout-phone">PRIMARY MOBILE PHONE *</label>
                      <input 
                        id="checkout-phone"
                        type="tel" 
                        inputMode="tel"
                        maxLength={12}
                        value={phone} 
                        onKeyDown={(e) => {
                          if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                            return;
                          }
                          if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
                            return;
                          }
                          if (e.key === '+' && (e.currentTarget.selectionStart === 0 && !phone.includes('+'))) {
                            return;
                          }
                          if (!/^\d$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const hasPlus = raw.startsWith('+');
                          const digits = raw.replace(/\D/g, '');
                          const sanitized = (hasPlus ? '+' : '') + digits;
                          const maxLen = hasPlus ? 12 : 11;
                          setPhone(sanitized.slice(0, maxLen));
                          setUseDefaultAddress(false);
                          clearFieldError('phone');
                        }} 
                        className="form-input" 
                        style={{
                          borderColor: formErrors.phone ? '#dc2626' : undefined,
                          boxShadow: formErrors.phone ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.phone)}
                        placeholder="e.g. 07XXXXXXXX or +947XXXXXXXX"
                      />
                      {formErrors.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="checkout-form-group">
                      <label className="form-label" htmlFor="checkout-secondaryPhone">SECONDARY MOBILE PHONE *</label>
                      <input 
                        id="checkout-secondaryPhone"
                        type="tel" 
                        inputMode="tel"
                        maxLength={12}
                        value={secondaryPhone} 
                        onKeyDown={(e) => {
                          if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                            return;
                          }
                          if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) {
                            return;
                          }
                          if (e.key === '+' && (e.currentTarget.selectionStart === 0 && !secondaryPhone.includes('+'))) {
                            return;
                          }
                          if (!/^\d$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const hasPlus = raw.startsWith('+');
                          const digits = raw.replace(/\D/g, '');
                          const sanitized = (hasPlus ? '+' : '') + digits;
                          const maxLen = hasPlus ? 12 : 11;
                          setSecondaryPhone(sanitized.slice(0, maxLen));
                          setUseDefaultAddress(false);
                          clearFieldError('secondaryPhone');
                        }} 
                        className="form-input" 
                        style={{
                          borderColor: formErrors.secondaryPhone ? '#dc2626' : undefined,
                          boxShadow: formErrors.secondaryPhone ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.secondaryPhone)}
                        placeholder="e.g. 07XXXXXXXX or +947XXXXXXXX"
                      />
                      {formErrors.secondaryPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.secondaryPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checkout-form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label" htmlFor="checkout-address">STREET ADDRESS *</label>
                    <input 
                      id="checkout-address"
                      type="text" 
                      value={address} 
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setUseDefaultAddress(false);
                        clearFieldError('address');
                      }} 
                      className="form-input" 
                      style={{
                        borderColor: formErrors.address ? '#dc2626' : undefined,
                        boxShadow: formErrors.address ? '0 0 0 1px #dc2626' : undefined
                      }}
                      aria-invalid={Boolean(formErrors.address)}
                      placeholder="14 Alfred House Gardens"
                    />
                    {formErrors.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} color="#dc2626" />
                        <span>{formErrors.address}</span>
                      </div>
                    )}
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
                      <label className="form-label" htmlFor="checkout-city">CITY *</label>
                      <select 
                        id="checkout-city"
                        value={city} 
                        onChange={(e) => {
                          setCity(e.target.value);
                          setUseDefaultAddress(false);
                          clearFieldError('city');
                        }} 
                        className="form-select"
                        style={{
                          borderColor: formErrors.city ? '#dc2626' : undefined,
                          boxShadow: formErrors.city ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.city)}
                      >
                        {CITIES_LIST.map((c) => (
                          <option key={c} value={c} style={{ backgroundColor: '#ffffff', color: '#121316' }}>{c}</option>
                        ))}
                      </select>
                      {formErrors.city && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.city}</span>
                        </div>
                      )}
                    </div>
                    <div className="checkout-form-group">
                      <label className="form-label" htmlFor="checkout-postalCode">POSTAL CODE *</label>
                      <input 
                        id="checkout-postalCode"
                        type="text" 
                        value={postalCode} 
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          setUseDefaultAddress(false);
                          clearFieldError('postalCode');
                        }} 
                        className="form-input" 
                        style={{
                          borderColor: formErrors.postalCode ? '#dc2626' : undefined,
                          boxShadow: formErrors.postalCode ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={Boolean(formErrors.postalCode)}
                        placeholder="00300"
                      />
                      {formErrors.postalCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          <AlertCircle size={12} color="#dc2626" />
                          <span>{formErrors.postalCode}</span>
                        </div>
                      )}
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
                      color: saveAsDefault ? '#8f6f32' : '#4a4c54'
                    }}>
                      <input 
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        style={{ accentColor: '#c5a059', width: '15px', height: '15px', cursor: 'pointer' }}
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
                  <div style={{ padding: '0.9rem 1.15rem', backgroundColor: '#fbf8f2', border: '1px solid #e5dfd5', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Truck size={18} color="#8f6f32" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.78rem', color: '#4a4c54', lineHeight: 1.5 }}>
                      <strong style={{ color: '#121316' }}>White-Glove Island-Wide Delivery:</strong> {deliveryFee === 0 ? 'Complimentary next business day dispatch with live signature tracking applied.' : `Complimentary island-wide courier on orders over ${formatLKR(FREE_DELIVERY_THRESHOLD_LKR)} (Flat LKR ${STANDARD_DELIVERY_FEE_LKR} otherwise).`}
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
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2ddd5',
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
                    <div style={{ fontSize: '0.68rem', color: '#8f6f32', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 700 }}>
                      DELIVERING TO
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#121316', fontWeight: 600 }}>
                      {firstName} {lastName} • {address}, {city}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#767982' }}>
                      {email} • {phone}{secondaryPhone ? ` • Alt: ${secondaryPhone}` : ''}
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
                      border: '1px solid #b58d42',
                      color: '#8f6f32',
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

                  {/* Payment Tabs: Card, Koko BNPL, LankaQR, and Bank Transfer with Authentic Vector Logos */}
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
                      <div className="checkout-payment-tab-logo">
                        <VisaMastercardLogo />
                      </div>
                      <span className="checkout-payment-tab-label">
                        CARD PAYMENT
                      </span>
                    </button>

                    {/* Koko: Buy Now Pay Later (3 Instalments) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('koko');
                        setSlipUploadError(false);
                        setCardPaymentError(null);
                      }}
                      className={`checkout-payment-tab-btn ${paymentMethod === 'koko' ? 'active' : ''}`}
                    >
                      <div className="checkout-payment-tab-logo">
                        <KokoLogo />
                      </div>
                      <span className="checkout-payment-tab-label">
                        3X INSTALMENTS
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
                      <div className="checkout-payment-tab-logo">
                        <LankaQrLogo />
                      </div>
                      <span className="checkout-payment-tab-label">
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
                      <div className="checkout-payment-tab-logo checkout-bank-icon-box">
                        <Building2 size={20} color="var(--gold-bright)" />
                      </div>
                      <span className="checkout-payment-tab-label">
                        BANK TRANSFER
                      </span>
                    </button>
                  </div>

                  {/* 0. Credit / Debit Card Payment View (Professional & Clean) */}
                  {paymentMethod === 'card' && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2ddd5',
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
                          <CreditCard size={18} color="#8f6f32" />
                          <span style={{ fontSize: '0.88rem', color: '#121316', fontWeight: 700 }}>
                            Credit / Debit Card (PayHere)
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <VisaMastercardLogo />
                        </div>
                      </div>

                      <p style={{
                        fontSize: '0.8rem',
                        color: '#4a4c54',
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        After clicking <strong>Pay with Card</strong>, you will be redirected to the secure PayHere payment gateway to enter your card details and complete the transaction.
                      </p>

                      {paymentConfig.isSandbox && (
                        <div style={{
                          marginTop: '0.85rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #e5dfd5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          fontSize: '0.74rem',
                          color: '#767982'
                        }}>
                          <span>Test Card: <strong style={{ color: '#121316' }}>4916 2175 0161 1292</strong> (Exp: 12/28, CVV: 123)</span>
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
                              color: copiedTestCard ? '#16a34a' : '#8f6f32',
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
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '3px',
                          color: '#dc2626',
                          fontSize: '0.76rem'
                        }}>
                          {cardPaymentError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 1. Koko Buy Now Pay Later (3x Instalments) Panel */}
                  {paymentMethod === 'koko' && (
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(197, 160, 89, 0.45)',
                      borderRadius: '4px',
                      padding: '1.4rem',
                      marginBottom: '1.5rem',
                      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <KokoLogo style={{ height: '26px' }} />
                          <span style={{ fontSize: '0.9rem', color: '#121316', fontWeight: 700, letterSpacing: '0.04em' }}>
                            Buy Now, Pay Later (3 Instalments)
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          backgroundColor: 'rgba(255, 0, 122, 0.1)',
                          color: '#db2777',
                          border: '1px solid rgba(255, 0, 122, 0.3)',
                          padding: '2px 9px',
                          borderRadius: '999px',
                          fontWeight: 700
                        }}>
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#4a4c54', lineHeight: 1.5, marginBottom: '1.1rem' }}>
                        Split your purchase into 3 equal monthly payments using your Koko account or debit/credit card.
                      </p>

                      {/* 3 Instalments Visual Plan Cards */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '0.75rem',
                        marginBottom: '1.25rem'
                      }}>
                        <div style={{
                          backgroundColor: '#fbf8f2',
                          border: '1px solid rgba(197, 160, 89, 0.45)',
                          borderRadius: '4px',
                          padding: '0.85rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#8f6f32', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>
                            1st Instalment
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#767982', marginBottom: '5px' }}>
                            Due Today
                          </div>
                          <div style={{ fontSize: '1rem', color: '#121316', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                            {formatLKR(kokoInstalmentLKR)}
                          </div>
                        </div>

                        <div style={{
                          backgroundColor: '#f7f5ef',
                          border: '1px solid #e5dfd5',
                          borderRadius: '4px',
                          padding: '0.85rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#4a4c54', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>
                            2nd Instalment
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#767982', marginBottom: '5px' }}>
                            in 30 Days
                          </div>
                          <div style={{ fontSize: '1rem', color: '#121316', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                            {formatLKR(kokoInstalmentLKR)}
                          </div>
                        </div>

                        <div style={{
                          backgroundColor: '#f7f5ef',
                          border: '1px solid #e5dfd5',
                          borderRadius: '4px',
                          padding: '0.85rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#4a4c54', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>
                            3rd Instalment
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#767982', marginBottom: '5px' }}>
                            in 60 Days
                          </div>
                          <div style={{ fontSize: '1rem', color: '#121316', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                            {formatLKR(kokoInstalmentLKR)}
                          </div>
                        </div>
                      </div>

                      {/* Important Surcharge Disclosure Banner */}
                      <div style={{
                        backgroundColor: '#fbf6ec',
                        border: '1px solid rgba(197, 160, 89, 0.45)',
                        borderRadius: '4px',
                        padding: '0.9rem 1.1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}>
                        <AlertCircle size={17} color="#8f6f32" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#3a3528' }}>
                          <strong style={{ color: '#8f6f32', display: 'block', marginBottom: '2px' }}>
                            Koko BNPL Processing Surcharge (+12%) Notice:
                          </strong>
                          An additional <strong>12% merchant processing fee (+{formatLKR(kokoSurchargeLKR)})</strong> is applied at checkout for Koko Buy Now Pay Later handling. 
                          Your total payable amount is <strong>{formatLKR(grandTotal)}</strong>, divided into 3 equal monthly payments of <strong>{formatLKR(kokoInstalmentLKR)}</strong>.
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#767982' }}>
                        <ShieldCheck size={14} color="#8f6f32" />
                        <span>Instant digital verification via Koko portal. No manual slip or deposit receipt needed.</span>
                      </div>

                      {cardPaymentError && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '3px',
                          color: '#dc2626',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5dfd5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <LankaQrLogo style={{ height: '24px' }} />
                          <span style={{ fontSize: '0.86rem', color: '#121316', fontWeight: 700 }}>National LankaQR Instant Transfer</span>
                        </div>
                        <span style={{ fontSize: '0.66rem', color: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.3)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                          ZERO FEES • INSTANT
                        </span>
                      </div>
                      
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
                          <div style={{ fontSize: '0.72rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                                backgroundColor: copiedAmount ? 'rgba(22, 163, 74, 0.1)' : '#ffffff',
                                border: copiedAmount ? '1px solid #16a34a' : '1px solid #d4cdc3',
                                color: copiedAmount ? '#16a34a' : '#121316',
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

                          <div style={{ fontSize: '0.74rem', color: '#4a4c54', lineHeight: 1.45, marginTop: '0.2rem' }}>
                            Merchant: <strong style={{ color: '#121316' }}>ELVANY WEAR</strong><br />
                            Accepted via any Sri Lankan Banking or FinTech app (e.g. Commercial Flash, FriMi, Genie, Sampath Vishwa, etc).
                          </div>
                        </div>
                      </div>

                      {/* Streamlined Step-by-Step Guide */}
                      <div className="checkout-qr-steps">
                        <div style={{ fontSize: '0.72rem', color: '#8f6f32', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                            <UploadCloud size={26} color={slipUploadError ? '#ef4444' : '#8f6f32'} />
                            <span style={{ fontSize: '0.82rem', color: '#121316', fontWeight: 600 }}>Click to Select or Upload Payment Screenshot</span>
                            <span style={{ fontSize: '0.72rem', color: '#767982' }}>webp, PNG, WEBP, PDF (Max 10MB)</span>
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
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #d4cdc3' }} 
                              />
                              <div>
                                <div style={{ fontSize: '0.82rem', color: '#121316', fontWeight: 600 }}>{paymentSlipFile?.name || 'QR_Payment_Receipt.png'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#8f6f32' }}>✓ Receipt attached for immediate concierge dispatch</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveSlip}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#767982',
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
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid #ef4444',
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            color: '#dc2626',
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
                      <div style={{ color: '#8f6f32', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.9rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} />
                        <span>ELVANY Official Bank Account</span>
                      </div>

                      {/* Luxury Bank Card Slip */}
                      <div className="checkout-bank-card-inner">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>BENEFICIARY</span>
                            <strong style={{ color: '#121316', fontSize: '0.92rem' }}>P C Jayaweera</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>BANK & BRANCH</span>
                            <strong style={{ color: '#121316' }}>Hatton National Bank (HNB)</strong>
                            <div style={{ fontSize: '0.74rem', color: '#767982' }}>Kurunegala Branch (019)</div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e5dfd5', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: '#8f6f32', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>ACCOUNT NUMBER</span>
                            <strong style={{ color: '#121316', fontSize: '1.15rem', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>019020601780</strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyAccount('019020601780')}
                            style={{
                              backgroundColor: copiedAccount ? 'rgba(22, 163, 74, 0.1)' : '#ffffff',
                              border: copiedAccount ? '1px solid #16a34a' : '1px solid #d4cdc3',
                              color: copiedAccount ? '#16a34a' : '#121316',
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

                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#767982' }}>
                          Payment Reference: <strong style={{ color: '#8f6f32' }}>Your Name / Mobile Number</strong>
                        </div>
                      </div>

                      {/* Slip Uploader */}
                      <div id="payment-slip-upload-section">
                        <label className="form-label" style={{ marginBottom: '0.5rem' }}>UPLOAD BANK DEPOSIT / TRANSFER SLIP *</label>
                        
                        {!paymentSlipPreview ? (
                          <label className={`checkout-dropzone ${slipUploadError ? 'has-error' : ''}`}>
                            <UploadCloud size={26} color={slipUploadError ? '#ef4444' : '#8f6f32'} />
                            <span style={{ fontSize: '0.82rem', color: '#121316', fontWeight: 600 }}>Click to Select or Upload Payment Slip</span>
                            <span style={{ fontSize: '0.72rem', color: '#767982' }}>webp, PNG, WEBP, PDF (Max 10MB)</span>
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
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #d4cdc3' }} 
                              />
                              <div>
                                <div style={{ fontSize: '0.82rem', color: '#121316', fontWeight: 600 }}>{paymentSlipFile?.name || 'Payment_Slip.png'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#8f6f32' }}>✓ Receipt attached for concierge verification</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveSlip}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#767982',
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
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid #ef4444',
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            color: '#dc2626',
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
                      (!isOnlinePayment && !paymentSlipFile)
                    }
                    className="btn-primary-gold checkout-confirm-action-btn"
                    style={{
                      opacity: (isSubmitting || (paymentMethod === 'bank' && !loggedInUser) || (!isOnlinePayment && !paymentSlipFile)) ? 0.6 : 1,
                      cursor: isSubmitting ? 'wait' : (!isOnlinePayment && !paymentSlipFile) || (paymentMethod === 'bank' && !loggedInUser) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>{paymentMethod === 'card' ? 'OPENING SECURE PAYMENT WINDOW...' : paymentMethod === 'koko' ? 'REDIRECTING TO KOKO BNPL GATEWAY...' : 'AUTHENTICATING & PROCESSING ACQUISITION...'}</span>
                      </span>
                    ) : paymentMethod === 'card' ? (
                      <>
                        <Lock size={16} />
                        <span>PAY WITH CARD • {formatLKR(grandTotal)}</span>
                      </>
                    ) : paymentMethod === 'koko' ? (
                      <>
                        <Sparkles size={16} color="#000000" />
                        <span>PAY IN 3 WITH KOKO • {formatLKR(grandTotal)}</span>
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem', borderBottom: '1px solid #e5dfd5', paddingBottom: '0.85rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#121316', margin: 0, fontWeight: 400 }}>
                  Acquisition Ledger
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#8f6f32', letterSpacing: '0.1em', fontWeight: 600 }}>
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
                        style={{ width: '56px', height: '68px', cursor: isBespoke ? 'pointer' : 'default', backgroundColor: '#f7f5ef', border: '1px solid #e2ddd5' }}
                        onClick={() => isBespoke && setInspectedBespokeItem(item)}
                        title={isBespoke ? 'Click to inspect 4-sides blueprint' : ''}
                      >
                        <img src={displayImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#c5a059', color: '#000000', fontSize: '0.62rem', fontWeight: 800, padding: '1px 4px', borderRadius: '0 0 0 2px' }}>
                          {item.qty || 1}
                        </span>
                        {isBespoke && (
                          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'var(--gold-bright)', fontSize: '0.55rem', textAlign: 'center', fontWeight: 700 }}>
                            {currentAngle.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: '#121316', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: '#767982' }}>
                          {item.selectedSize || item.size} • {item.color}
                        </div>
                        {item.isOfferApplied && (
                          <span style={{ fontSize: '0.64rem', color: '#8f6f32', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px', background: 'transparent', border: 'none', padding: 0 }}>
                            <Tag size={10} color="#8f6f32" />
                            <span>PRIVILEGE APPLIED ({item.offerCode || 'PROMO'})</span>
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
                                  background: currentAngle === ang ? '#c5a059' : '#f4eee2',
                                  color: currentAngle === ang ? '#000' : '#121316',
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
                                background: '#fbf8f2',
                                color: '#8f6f32',
                                border: '1px solid #b58d42',
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
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', color: '#8f6f32', fontWeight: 700 }}>
                          {formatLKR(getPrice(item) * (item.qty || 1))}
                        </div>
                        {item.isOfferApplied && item.originalPriceLKR && (
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            {formatLKR(item.originalPriceLKR * (item.qty || 1))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Single-Use Voucher / Gift Card Redeem Box */}
              <div style={{
                margin: '1.2rem 0',
                padding: '0.9rem',
                backgroundColor: '#fbf8f2',
                border: '1px solid rgba(197, 160, 89, 0.45)',
                borderRadius: '3px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ticket size={13} color="#8f6f32" />
                    <span style={{ fontSize: '0.72rem', color: '#121316', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Voucher / Gift Card
                    </span>
                  </div>
                  {appliedVoucher && (
                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, letterSpacing: '0.04em' }}>
                      ✓ APPLIED
                    </span>
                  )}
                </div>

                {appliedVoucher ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#f6f0e2',
                    border: '1px solid #c5a059',
                    borderRadius: '2px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={13} color="#8f6f32" />
                      <div>
                        <div style={{ fontSize: '0.82rem', color: '#8f6f32', fontWeight: 700, letterSpacing: '0.06em' }}>
                          {appliedVoucher.code}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#767982' }}>
                          {appliedVoucher.discountType === 'percentage' 
                            ? `${appliedVoucher.discountValue}% Privileged Deduction` 
                            : `LKR ${Number(appliedVoucher.discountValue || 0).toLocaleString()} Off Acquisition`}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#767982',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove Voucher"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div>
                    {rateLimitLock?.isLocked && (
                      <div style={{
                        marginBottom: '0.75rem',
                        padding: '0.2rem 0',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '7px'
                      }}>
                        <ShieldAlert size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#ef4444', marginBottom: '2px' }}>
                            SECURITY LOCKOUT ACTIVE
                          </strong>
                          <span>Voucher verification locked for {rateLimitLock.remainingMinutes} min due to 5 failed attempts. Please contact concierge support if needed.</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="ENTER VOUCHER CODE"
                        value={voucherInput}
                        disabled={rateLimitLock?.isLocked}
                        onChange={(e) => {
                          setVoucherInput(e.target.value.toUpperCase());
                          if (voucherError) setVoucherError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!rateLimitLock?.isLocked) handleApplyVoucher();
                          }
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: rateLimitLock?.isLocked ? '#f5f5f5' : '#ffffff',
                          border: voucherError ? '1px solid #ef4444' : '1px solid #d4cdc3',
                          borderRadius: '2px',
                          padding: '0.55rem 0.75rem',
                          color: rateLimitLock?.isLocked ? '#9ca3af' : '#121316',
                          fontSize: '0.76rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontFamily: 'inherit',
                          outline: 'none',
                          cursor: rateLimitLock?.isLocked ? 'not-allowed' : 'text'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={isCheckingVoucher || !voucherInput.trim() || rateLimitLock?.isLocked}
                        style={{
                          backgroundColor: (voucherInput.trim() && !rateLimitLock?.isLocked) ? '#c5a059' : '#eae6dd',
                          color: (voucherInput.trim() && !rateLimitLock?.isLocked) ? '#000000' : '#9ca3af',
                          border: 'none',
                          borderRadius: '2px',
                          padding: '0.55rem 1rem',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          cursor: (voucherInput.trim() && !isCheckingVoucher && !rateLimitLock?.isLocked) ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isCheckingVoucher ? (
                          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          'APPLY'
                        )}
                      </button>
                    </div>

                    {voucherError && !rateLimitLock?.isLocked && (
                      <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} />
                        <span>{voucherError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ledger Totals */}
              <div style={{ borderTop: '1px solid #e5dfd5', paddingTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4c54' }}>
                  <span>Garment Subtotal:</span>
                  <span style={{ color: '#121316', fontWeight: 600 }}>{formatLKR(subtotal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f6f32' }}>
                    <span>Special Privilege Savings:</span>
                    <span style={{ fontWeight: 700 }}>-LKR {totalSavings.toLocaleString()}</span>
                  </div>
                )}

                {appliedVoucher && voucherDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Atelier Voucher ({appliedVoucher.code}):</span>
                    <span style={{ fontWeight: 700 }}>-LKR {voucherDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4c54' }}>
                  <span>Island-Wide Courier Delivery:</span>
                  <span style={{ color: deliveryFee === 0 ? '#8f6f32' : '#121316', fontWeight: 700 }}>
                    {deliveryFee === 0 ? 'COMPLIMENTARY' : formatLKR(deliveryFee)}
                  </span>
                </div>

                {isKoko && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8f6f32' }}>
                    <span>Koko BNPL Surcharge (12%):</span>
                    <span style={{ fontWeight: 700 }}>+{formatLKR(kokoSurchargeLKR)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a4c54' }}>
                  <span>Import Taxes & Atelier VAT:</span>
                  <span style={{ color: '#121316' }}>INCLUDED</span>
                </div>

                <div style={{ borderTop: '1px solid #e5dfd5', marginTop: '0.4rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.95rem', color: '#121316', fontWeight: 600 }}>Total Settled:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#8f6f32', fontWeight: 800 }}>
                    {formatLKR(grandTotal)}
                  </span>
                </div>

                {isKoko && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#fbf6ec',
                    border: '1px solid rgba(197, 160, 89, 0.45)',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.74rem'
                  }}>
                    <span style={{ color: '#4a4c54' }}>3x Monthly Payments:</span>
                    <span style={{ color: '#8f6f32', fontWeight: 700 }}>3 x {formatLKR(kokoInstalmentLKR)} / mo</span>
                  </div>
                )}
              </div>

              {/* Trust Assurances */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5dfd5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.72rem', color: '#767982' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} color="#8f6f32" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} color="#8f6f32" />
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
            style={{ maxWidth: '860px', width: '100%', margin: 'auto', backgroundColor: '#ffffff', border: '1px solid #e2ddd5', borderRadius: '4px', padding: '1.8rem', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8f6f32', fontSize: '0.72rem', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Sparkles size={13} />
                  <span>ELVANY • BESPOKE 4-AXIS BLUEPRINT</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#121316', margin: '0.2rem 0 0.4rem 0' }}>
                  {inspectedBespokeItem.name || 'Custom Bespoke Garment'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#4a4c54' }}>
                  Code: <strong style={{ color: '#8f6f32' }}>#{inspectedBespokeItem.designCode || 'BL-CUSTOM'}</strong> • {inspectedBespokeItem.color} • Size {inspectedBespokeItem.selectedSize || inspectedBespokeItem.size || 'L'}
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
                    backgroundColor: '#fbf8f2',
                    border: '1px solid #e5dfd5',
                    borderRadius: '3px',
                    padding: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.1', overflow: 'hidden', borderRadius: '2px', backgroundColor: '#ffffff', border: '1px solid #e2ddd5', marginBottom: '6px' }}>
                    <img 
                      src={panel.img || '/images/hero_tshirt.webp'} 
                      alt={panel.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#8f6f32', fontWeight: 700, letterSpacing: '0.08em' }}>
                    {panel.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Placements & Notes */}
            <div style={{ backgroundColor: '#f8f5ee', border: '1px solid #e5dfd5', borderRadius: '3px', padding: '10px 14px', marginBottom: '1.4rem', fontSize: '0.76rem', color: '#4a4c54' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                <span>Custom Prints: <strong style={{ color: '#121316' }}>{inspectedBespokeItem.customPlacements?.join(' • ') || 'Configured Graphic Prints'}</strong></span>
                <span>Fabric Grade: <strong style={{ color: '#8f6f32' }}>{inspectedBespokeItem.fabric || 'Signature Comfort Knit'}</strong></span>
              </div>
              {inspectedBespokeItem.customNotes && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e5dfd5', fontStyle: 'italic', color: '#121316' }}>
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
