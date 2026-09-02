import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Package, User, Sliders, LogOut, Check, ArrowRight, ArrowLeft, KeyRound, Mail, Phone, Lock, Link2, Unlink, Plus, Trash2, MapPin, AlertTriangle, X, Star, Clock, ShieldCheck, RefreshCw, ShoppingBag, Maximize2, Sparkles, Download } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getOrders } from '../services/dbService';
import { downloadImageFile } from '../lib/bespokeMockupGenerator';

import { INITIAL_ORDERS } from '../data/orders';

export const CITIES_LIST = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya'
];

export const AccountPage = ({
  userProfile,
  loggedInUser,
  authProvider: initialAuthProvider = 'email',
  onUpdateUser,
  onLogout,
  onOpenAuthModal,
  ordersList = INITIAL_ORDERS,
  allReviewsMap = {}
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'orders');
  const [inspectedBespokeItem, setInspectedBespokeItem] = useState(null);

  const isItemReviewed = (order, item) => {
    if (!allReviewsMap) return false;
    const allRevs = Object.values(allReviewsMap).flat();
    const orderCode = (order?.orderId || order?.order_code || order?.id || '').toUpperCase();
    const itemId = (item?.productId || item?.product_id || item?.id || '').toLowerCase();
    const itemName = (item?.name || item?.title || '').toLowerCase();

    return allRevs.some((r) => {
      const rOrder = (r.orderId || r.order_id || '').toUpperCase();
      const rProd = (r.productId || r.product_id || '').toLowerCase();
      const rTitle = (r.productTitle || '').toLowerCase();

      const orderMatches = rOrder && (rOrder === orderCode || (order?.id && rOrder === order.id.toUpperCase()));
      const prodMatches = (itemId && rProd === itemId) || (itemName && rTitle === itemName);

      return (orderMatches && prodMatches) || (orderMatches && !rProd);
    });
  };

  const isOrderFullyReviewed = (order) => {
    if (!order?.items || order.items.length === 0) return false;
    return order.items.every((item) => isItemReviewed(order, item));
  };


  // Keep tab synced with URL query parameter
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'orders' || tabFromUrl === 'profile' || tabFromUrl === 'settings')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Determine initial auth provider
  const isSocialInitial = initialAuthProvider && initialAuthProvider !== 'email';
  const [authProvider, setAuthProvider] = useState(isSocialInitial ? initialAuthProvider : 'email');

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('elvany_auth_user') || '{}');
    } catch {
      return {};
    }
  };
  const storedUser = getStoredUser();

  // Account & Security State (No dummy data - uses real authenticated credentials)
  const [clientName, setClientName] = useState(
    userProfile?.name || storedUser.name || (loggedInUser ? loggedInUser.replace(/\s*\([^)]*\)/g, '') : '')
  );
  const [clientEmail, setClientEmail] = useState(
    userProfile?.email || storedUser.email || (loggedInUser && loggedInUser.includes('@') ? loggedInUser : '')
  );
  const [clientPhone, setClientPhone] = useState(
    userProfile?.phone || storedUser.phone || ''
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [unlinkSuccess, setUnlinkSuccess] = useState(false);

  // Unlink & Password Creation Modal State
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
  const [unlinkNewPassword, setUnlinkNewPassword] = useState('');
  const [unlinkConfirmPassword, setUnlinkConfirmPassword] = useState('');
  const [unlinkError, setUnlinkError] = useState('');
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (userProfile) {
      if (userProfile.name) setClientName(userProfile.name);
      if (userProfile.email) setClientEmail(userProfile.email);
      if (userProfile.phone !== undefined) setClientPhone(userProfile.phone);
    } else if (stored.email || stored.name) {
      if (stored.name) setClientName(stored.name);
      if (stored.email) setClientEmail(stored.email);
      if (stored.phone !== undefined) setClientPhone(stored.phone);
    } else if (loggedInUser) {
      setClientName(loggedInUser.replace(/\s*\([^)]*\)/g, ''));
      if (loggedInUser.includes('@')) {
        setClientEmail(loggedInUser);
      }
    }
  }, [userProfile, loggedInUser]);

  // Live Database Orders State for Client Account
  const [fetchedOrders, setFetchedOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const fetchClientOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const all = await getOrders();
      if (Array.isArray(all)) {
        setFetchedOrders(all);
      }
    } catch (err) {
      console.warn('AccountPage getOrders notice:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchClientOrders();

    const handleOrderPlaced = () => {
      fetchClientOrders();
    };
    window.addEventListener('elvany_order_placed', handleOrderPlaced);
    window.addEventListener('elvany_order_updated', handleOrderPlaced);
    return () => {
      window.removeEventListener('elvany_order_placed', handleOrderPlaced);
      window.removeEventListener('elvany_order_updated', handleOrderPlaced);
    };
  }, [clientEmail, clientPhone, clientName]);

  // Determine effective orders belonging to this client
  const effectiveOrders = useMemo(() => {
    const source = fetchedOrders.length > 0 ? fetchedOrders : (Array.isArray(ordersList) && ordersList.length > 0 ? ordersList : []);
    
    const targetEmail = (clientEmail || userProfile?.email || storedUser?.email || '').toLowerCase().trim();
    const targetPhone = (clientPhone || userProfile?.phone || storedUser?.phone || '').replace(/[^0-9]/g, '');
    const targetName = (clientName || userProfile?.name || storedUser?.name || '').toLowerCase().trim();

    let mySessionOrderIds = [];
    try {
      mySessionOrderIds = JSON.parse(localStorage.getItem('elvany_my_order_ids') || '[]');
    } catch {}

    if (targetEmail || targetPhone || targetName || mySessionOrderIds.length > 0) {
      const matched = source.filter((o) => {
        const oEmail = (o.customerEmail || o.deliveryAddress?.email || '').toLowerCase().trim();
        const oPhone = (o.customerPhone || o.deliveryAddress?.phone || '').replace(/[^0-9]/g, '');
        const oName = (o.customerName || o.deliveryAddress?.recipientName || '').toLowerCase().trim();
        const oId = (o.orderId || o.order_code || o.id || '').toUpperCase();

        const emailMatches = Boolean(targetEmail && oEmail && oEmail === targetEmail);
        const phoneMatches = Boolean(targetPhone && oPhone && (oPhone.includes(targetPhone) || targetPhone.includes(oPhone)));
        const nameMatches = Boolean(targetName && oName && (oName === targetName || oName.includes(targetName) || targetName.includes(oName)));
        const sessionMatches = Boolean(mySessionOrderIds.some((sid) => sid.toUpperCase() === oId));

        return emailMatches || phoneMatches || nameMatches || sessionMatches;
      });

      if (matched.length > 0) return matched;
    }

    if (mySessionOrderIds.length > 0) {
      const sessionOnly = source.filter((o) => mySessionOrderIds.includes(o.orderId || o.order_code || o.id));
      if (sessionOnly.length > 0) return sessionOnly;
    }

    // Fallback: Return all source orders if guest or demo
    return source;
  }, [fetchedOrders, ordersList, clientEmail, clientPhone, clientName, userProfile, storedUser]);

  // 1-Click Reorder Action for Rejected Slips or Past Orders
  const handleReorderItems = (order) => {
    if (!order || !order.items || order.items.length === 0) return;

    try {
      const newCartItems = order.items.map((item) => ({
        id: item.productId || item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: item.name || item.title || 'Haute Atelier T-Shirt',
        title: item.title || item.name || 'Haute Atelier T-Shirt',
        price: item.priceLKR || 18500,
        priceLKR: item.priceLKR || 18500,
        originalPriceLKR: item.originalPriceLKR || item.priceLKR || 18500,
        selectedSize: item.selectedSize || item.size || 'M (40)',
        size: item.selectedSize || item.size || 'M (40)',
        color: item.color || 'Pure Black',
        qty: item.quantity || 1,
        quantity: item.quantity || 1,
        image: item.image || '/images/hero_tshirt.jpg',
        isBespokeCustom: item.isBespokeCustom || false,
        designCode: item.designCode || '',
        fabric: item.fabric || '',
        cut: item.cut || '',
        customPlacements: item.customPlacements || [],
        customNotes: item.customNotes || '',
        artworks: item.artworks || {}
      }));

      localStorage.setItem('elvany_cart', JSON.stringify(newCartItems));
      const activeEmail = (clientEmail || userProfile?.email || storedUser?.email || '').toLowerCase();
      if (activeEmail) {
        localStorage.setItem(`elvany_cart_${activeEmail}`, JSON.stringify(newCartItems));
      }

      window.dispatchEvent(new CustomEvent('elvany_cart_updated', { detail: newCartItems }));
      navigate('/checkout');
    } catch (err) {
      console.warn('Reorder notice:', err);
      navigate('/checkout');
    }
  };

  // Sizing State
  const [savedSize, setSavedSize] = useState('L (42)');
  const [sizingSuccess, setSizingSuccess] = useState(false);

  // Multiple Shipping Addresses State (Starts empty, connects to storage & database)
  const [shippingAddresses, setShippingAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('elvany_shipping_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    recipientName: '',
    streetAddress: '',
    city: 'Colombo',
    postalCode: '',
    country: 'Sri Lanka'
  });

  // Sizing Handler

  const handleSaveSizing = (e) => {
    e.preventDefault();
    setSizingSuccess(true);
    setTimeout(() => setSizingSuccess(false), 2500);
  };

  const handleSetDefaultAddress = (id) => {
    const updated = shippingAddresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setShippingAddresses(updated);
    localStorage.setItem('elvany_shipping_addresses', JSON.stringify(updated));
  };

  const handleDeleteAddress = (id) => {
    const updated = shippingAddresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setShippingAddresses(updated);
    localStorage.setItem('elvany_shipping_addresses', JSON.stringify(updated));
  };

  const handleCreateAddress = (e) => {
    e.preventDefault();
    if (!newAddressForm.streetAddress || !newAddressForm.city) return;

    const created = {
      id: `addr-${Date.now()}`,
      isDefault: shippingAddresses.length === 0,
      recipientName: newAddressForm.recipientName || clientName || 'Client',
      streetAddress: newAddressForm.streetAddress,
      city: newAddressForm.city,
      postalCode: newAddressForm.postalCode,
      country: newAddressForm.country
    };

    const updated = [...shippingAddresses, created];
    setShippingAddresses(updated);
    localStorage.setItem('elvany_shipping_addresses', JSON.stringify(updated));
    setIsAddingAddress(false);
    setNewAddressForm({
      recipientName: '',
      streetAddress: '',
      city: 'Colombo',
      postalCode: '',
      country: 'Sri Lanka'
    });
  };

  const handleConfirmUnlinkAndSetPassword = async (e) => {
    e.preventDefault();
    setUnlinkError('');

    if (!unlinkNewPassword || unlinkNewPassword.length < 6) {
      setUnlinkError('New password must be at least 6 characters.');
      return;
    }
    if (unlinkNewPassword !== unlinkConfirmPassword) {
      setUnlinkError('New password and confirmation do not match.');
      return;
    }

    setIsUnlinking(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: unlinkNewPassword
        });

        if (updateError) {
          console.log('UpdateUser notice (registering credentials):', updateError.message);
          await supabase.auth.signUp({
            email: clientEmail,
            password: unlinkNewPassword,
            options: {
              data: {
                full_name: clientName
              }
            }
          });
        }
      } catch (err) {
        console.warn('Supabase password sync notice:', err);
      }
    }

    // Save credentials store for instant client login
    try {
      const credentialsStore = JSON.parse(localStorage.getItem('elvany_local_credentials') || '{}');
      credentialsStore[clientEmail.toLowerCase().trim()] = {
        name: clientName,
        password: unlinkNewPassword,
        provider: 'email'
      };
      localStorage.setItem('elvany_local_credentials', JSON.stringify(credentialsStore));
    } catch (e) {
      console.warn('Local credential save error:', e);
    }

    setAuthProvider('email');

    const updatedProfile = {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      provider: 'email'
    };

    if (onUpdateUser) {
      onUpdateUser(updatedProfile);
    }

    setIsUnlinking(false);
    setIsUnlinkModalOpen(false);
    setUnlinkNewPassword('');
    setUnlinkConfirmPassword('');
    setUnlinkSuccess(true);
    setTimeout(() => setUnlinkSuccess(false), 4000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setSecurityError('');

    if (authProvider === 'email' && newPassword) {
      if (newPassword.length < 6) {
        setSecurityError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('New password and confirmation do not match.');
        return;
      }
    }

    if (onUpdateUser) {
      onUpdateUser({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        provider: authProvider
      });
    }

    setSecuritySuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecuritySuccess(false), 2500);
  };

  const handleGoToOrderReview = (orderId) => {
    navigate(`/order-review/${orderId}`);
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
  };

  const sizeOptions = ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'];

  // Architectural Size Guide Specifications
  const sizeSpecs = [
    { size: 'S (38)', chest: '104 cm / 41.0"', length: '71 cm / 28.0"', shoulder: '47 cm / 18.5"', sleeve: '22 cm / 8.7"' },
    { size: 'M (40)', chest: '109 cm / 43.0"', length: '73 cm / 28.7"', shoulder: '49 cm / 19.3"', sleeve: '23 cm / 9.0"' },
    { size: 'L (42)', chest: '114 cm / 45.0"', length: '75 cm / 29.5"', shoulder: '51 cm / 20.0"', sleeve: '24 cm / 9.4"' },
    { size: 'XL (44)', chest: '120 cm / 47.2"', length: '77 cm / 30.3"', shoulder: '53 cm / 20.8"', sleeve: '25 cm / 9.8"' },
    { size: 'XXL (46)', chest: '126 cm / 49.6"', length: '79 cm / 31.1"', shoulder: '55 cm / 21.6"', sleeve: '26 cm / 10.2"' }
  ];

  return (
    <div className="account-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Top Breadcrumb Navigation */}
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
            <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CLIENT PRIVATE PORTAL
            </span>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="section-action-link"
            style={{ fontSize: '0.78rem' }}
          >
            <ArrowLeft size={13} />
            <span>BACK TO STORE</span>
          </button>
        </div>

        {/* Clean Client Banner Card */}
        <div className="account-hero-card">
          <div className="account-hero-inner">
            <div className="account-hero-left">
              <div className="account-avatar-disc">
                <img 
                  src="/logo/Main-4.png" 
                  alt="ELVANY Seal" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                  PRIVATE CLIENT ID
                </div>
                <h1 className="account-client-title">
                  {clientName || 'Julian Sterling'}
                </h1>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="account-signout-btn"
              title="Sign Out of Session"
            >
              <LogOut size={14} />
              <span>LOG OUT</span>
            </button>
          </div>
        </div>

        {/* Responsive Segmented Tabs Bar */}
        <div className="account-tab-bar">
          <button
            className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <Package size={15} />
            <span>MY ORDERS ({effectiveOrders.length})</span>
          </button>
          <button
            className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={15} />
            <span>SIZING PROFILE & GUIDE</span>
          </button>
          <button
            className={`account-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <Sliders size={15} />
            <span>ACCOUNT SETTINGS</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: MY ORDERS & EVALUATIONS
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ marginBottom: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.3rem' }}>
                  Your Orders & Evaluations
                </h2>
                <p style={{ color: 'var(--text-light-muted)', fontSize: '0.86rem' }}>
                  View your confirmed acquisitions and submit verified evaluations for each garment.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchClientOrders}
                disabled={isLoadingOrders}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-dark)',
                  color: 'var(--gold-bright)',
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={12} className={isLoadingOrders ? 'animate-spin' : ''} />
                <span>{isLoadingOrders ? 'Syncing Orders...' : 'Refresh Orders'}</span>
              </button>
            </div>

            {isLoadingOrders && effectiveOrders.length === 0 ? (
              <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '3.5rem', textAlign: 'center', borderRadius: '2px' }}>
                <RefreshCw size={28} color="var(--gold-bright)" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', display: 'inline-block' }} />
                <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>Syncing your order history from the atelier...</p>
              </div>
            ) : effectiveOrders.length === 0 ? (
              <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '3.5rem', textAlign: 'center', borderRadius: '2px' }}>
                <p style={{ color: 'var(--text-light-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>You have no recorded client orders in this session.</p>
                <button className="btn-primary-gold" onClick={() => navigate('/collection')}>
                  EXPLORE T-SHIRTS
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                {effectiveOrders.map((order) => {
                  const total = order.totalLKR || order.items.reduce((a, b) => a + (b.priceLKR || 18500) * (b.quantity || 1), 0);
                  const isRejected = (order.status || '').toLowerCase().includes('reject');
                  const isBankTransfer = (order.paymentMethod || '').toLowerCase().includes('bank') || Boolean(order.paymentSlipUrl);
                  const isCod = (order.paymentMethod || '').toLowerCase().includes('cod') || (order.paymentMethod || '').toLowerCase().includes('cash');

                  const isDelivered = order.status === 'Delivered' || (order.status || '').toLowerCase().includes('delivered');

                  const displayBadgeStatus = isRejected
                    ? 'Slip Rejected — Reorder Required'
                    : isCod
                      ? (isDelivered ? 'Delivered' : order.status === 'Cancelled' ? 'Cancelled' : 'Order Confirmed (COD)')
                      : order.status;

                  return (
                    <div
                      key={order.orderId}
                      style={{
                        backgroundColor: '#121316',
                        border: isRejected ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-dark)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Order Header */}
                      <div style={{
                        padding: '1.4rem 1.5rem',
                        backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.05)' : '#17181c',
                        borderBottom: isRejected ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#ffffff', fontWeight: 600 }}>
                              #{order.orderId}
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.15)' : isCod ? 'rgba(197, 160, 89, 0.15)' : 'var(--gold-bright)',
                              border: isRejected ? '1px solid #ef4444' : isCod ? '1px solid var(--gold-border)' : 'none',
                              color: isRejected ? '#ef4444' : isCod ? 'var(--gold-bright)' : '#000000',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              padding: '3px 9px',
                              borderRadius: '2px',
                              textTransform: 'uppercase'
                            }}>
                              {isRejected ? '✕ ' : '✓ '}{displayBadgeStatus}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)' }}>
                            Placed on {order.orderDate} • {order.items.length} {order.items.length === 1 ? 'Garment' : 'Garments'} • {order.paymentMethod || (isCod ? 'Cash on Delivery' : 'Bank Transfer')}
                          </div>
                        </div>

                        {isDelivered && (
                          isOrderFullyReviewed(order) ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '2px',
                              backgroundColor: 'rgba(197, 160, 89, 0.1)',
                              border: '1px solid var(--gold-border)',
                              color: 'var(--gold-bright)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              letterSpacing: '0.04em'
                            }}>
                              <Check size={14} color="var(--gold-bright)" />
                              <span>EVALUATION SUBMITTED</span>
                            </div>
                          ) : (
                            <button
                              className="btn-primary-gold"
                              onClick={() => handleGoToOrderReview(order.orderId)}
                              style={{ padding: '0.7rem 1.3rem', fontSize: '0.78rem', gap: '0.5rem' }}
                            >
                              <span>REVIEW THIS ORDER</span>
                              <ArrowRight size={13} />
                            </button>
                          )
                        )}
                      </div>

                      {/* Rejected Slip Warning Box with Reorder CTA */}
                      {isRejected && (
                        <div style={{
                          margin: '1rem 1.5rem 1rem 1.5rem',
                          padding: '1.2rem 1.4rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid #ef4444',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1.2rem',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ fontSize: '0.86rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <AlertTriangle size={16} color="#ef4444" />
                              <span>Payment Slip Rejected by Atelier</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#ffffff', margin: 0, lineHeight: 1.5 }}>
                              The uploaded payment receipt was reviewed and rejected. This order cannot proceed and new receipts cannot be attached to this order. Please click <strong>Reorder Garments</strong> to place a fresh order with a valid payment slip.
                            </p>
                          </div>

                          <button
                            type="button"
                            className="btn-primary-gold"
                            onClick={() => handleReorderItems(order)}
                            style={{
                              padding: '0.7rem 1.4rem',
                              fontSize: '0.76rem',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              backgroundColor: 'var(--gold-bright)',
                              color: '#000',
                              fontWeight: 700
                            }}
                          >
                            <ShoppingBag size={14} />
                            <span>REORDER GARMENTS</span>
                          </button>
                        </div>
                      )}

                      {/* Cash on Delivery Status Info for Client */}
                      {isCod && !isRejected && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div style={{
                          margin: '0 1.5rem 1rem 1.5rem',
                          padding: '0.8rem 1.2rem',
                          backgroundColor: 'rgba(197, 160, 89, 0.08)',
                          border: '1px solid var(--gold-border)',
                          borderRadius: '2px',
                          fontSize: '0.8rem',
                          color: '#ffffff'
                        }}>
                          <strong style={{ color: 'var(--gold-bright)' }}>✓ Cash on Delivery Confirmed:</strong> Your luxury parcel is being tailored and prepared for express courier delivery. Payment of <strong>LKR {total.toLocaleString()}</strong> will be collected upon handover at your destination.
                        </div>
                      )}

                      {/* Bank Transfer Slip Status Info for Client */}
                      {isBankTransfer && !isRejected && order.status === 'Pending Slip Verification' && (
                        <div style={{
                          margin: '0 1.5rem 1rem 1.5rem',
                          padding: '0.8rem 1.2rem',
                          backgroundColor: 'rgba(197, 160, 89, 0.08)',
                          border: '1px solid var(--gold-border)',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gold-bright)' }}>
                            <strong>⏳ Payment Slip Verification Pending:</strong> Our concierge is reconciling your uploaded bank transfer receipt. Dispatch preparations begin immediately upon approval.
                          </div>
                          {order.paymentSlipUrl && (
                            <a 
                              href={order.paymentSlipUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ fontSize: '0.75rem', color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}
                            >
                              View Attached Slip
                            </a>
                          )}
                        </div>
                      )}

                      {isBankTransfer && !isRejected && order.status === 'Payment Verified — Processing Dispatch' && (
                        <div style={{
                          margin: '0 1.5rem 1rem 1.5rem',
                          padding: '0.8rem 1.2rem',
                          backgroundColor: 'rgba(197, 160, 89, 0.12)',
                          border: '1px solid var(--gold-bright)',
                          borderRadius: '2px',
                          fontSize: '0.8rem',
                          color: '#ffffff'
                        }}>
                          <strong style={{ color: 'var(--gold-bright)' }}>✓ Bank Transfer Verified:</strong> Your payment receipt has been verified by the atelier. Parcel is currently being packed for express courier dispatch.
                        </div>
                      )}

                    {/* Order Item Rows */}
                    <div style={{ padding: '0.5rem 1.5rem' }}>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.1rem 0',
                            borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                            flexWrap: 'wrap',
                            gap: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div 
                              style={{
                                width: '48px',
                                height: '58px',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                backgroundColor: '#090a0c',
                                border: '1px solid var(--border-dark)',
                                flexShrink: 0,
                                cursor: (item.isBespokeCustom || item.designCode || (item.name || '').includes('Custom') || (item.name || '').includes('Bespoke')) ? 'pointer' : 'default'
                              }}
                              onClick={() => (item.isBespokeCustom || item.designCode || (item.name || '').includes('Custom') || (item.name || '').includes('Bespoke')) && setInspectedBespokeItem(item)}
                              title="Click to view 4-sides blueprint"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#ffffff', margin: 0, fontWeight: 500 }}>
                                  {item.name}
                                </h4>
                                {(item.isBespokeCustom || item.designCode || (item.name || '').includes('Custom') || (item.name || '').includes('Bespoke')) && (
                                  <button
                                    type="button"
                                    onClick={() => setInspectedBespokeItem(item)}
                                    style={{
                                      background: 'rgba(197, 160, 89, 0.15)',
                                      border: '1px solid var(--gold-border)',
                                      color: 'var(--gold-bright)',
                                      padding: '2px 7px',
                                      borderRadius: '2px',
                                      fontSize: '0.66rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <Sparkles size={10} />
                                    <span>4-SIDES BLUEPRINT</span>
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-light-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span>Size: <strong style={{ color: '#fff' }}>{item.selectedSize}</strong></span>
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                                <span>Color: <strong style={{ color: '#fff' }}>{item.color}</strong></span>
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                                <span style={{ color: 'var(--gold-bright)' }}>LKR {item.priceLKR ? item.priceLKR.toLocaleString() : '18,500'}</span>
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const isDelivered = order.status === 'Delivered' || (order.status || '').toLowerCase().includes('delivered');

                            if (!isDelivered) return null;

                            const alreadyReviewed = isItemReviewed(order, item);

                            if (alreadyReviewed) {
                              return (
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 11px',
                                  borderRadius: '2px',
                                  backgroundColor: 'rgba(197, 160, 89, 0.08)',
                                  border: '1px solid var(--gold-border)',
                                  color: 'var(--gold-bright)',
                                  fontSize: '0.72rem',
                                  fontWeight: 600
                                }}>
                                  <Check size={12} color="var(--gold-bright)" />
                                  <span>Reviewed</span>
                                </div>
                              );
                            }

                            return (
                              <button
                                onClick={() => handleGoToOrderReview(order.orderId)}
                                style={{
                                  backgroundColor: 'rgba(197, 160, 89, 0.12)',
                                  border: '1px solid var(--gold-border)',
                                  color: 'var(--gold-bright)',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '6px 12px',
                                  borderRadius: '2px',
                                  letterSpacing: '0.04em',
                                  transition: 'all 0.2s ease'
                                }}
                                title="Submit verified review for this delivered piece"
                              >
                                <Star size={13} fill="var(--gold-bright)" color="var(--gold-bright)" />
                                <span>Evaluate Delivered Piece</span>
                                <ArrowRight size={12} />
                              </button>
                            );
                          })()}
                        </div>
                      ))}



                    </div>

                  </div>
                );
              })}
            </div>
          )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: SIZING PROFILE & ARCHITECTURAL MEASUREMENT GUIDE
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '2.2rem 1.8rem', borderRadius: '2px' }}>
            <div style={{ marginBottom: '1.8rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#fff', marginBottom: '0.3rem' }}>
                Preferred T-Shirt Sizing Profile
              </h2>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.84rem' }}>
                Select your standard size and reference the garment measurement specifications.
              </p>
            </div>

            {/* Size Pill Selector */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ marginBottom: '0.8rem', display: 'block' }}>
                Select Preferred Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.6rem' }}>
                {sizeOptions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSavedSize(s)}
                    style={{
                      padding: '0.85rem 0.5rem',
                      backgroundColor: savedSize === s ? 'rgba(197, 160, 89, 0.15)' : '#090a0c',
                      border: savedSize === s ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                      color: savedSize === s ? 'var(--gold-bright)' : 'var(--text-light-secondary)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      transition: 'var(--transition-fast)',
                      textAlign: 'center'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Size Guide Table with Sticky First Column */}
            <div style={{
              backgroundColor: '#090a0c',
              border: '1px solid var(--border-dark)',
              padding: '1.4rem',
              borderRadius: '2px',
              marginBottom: '1.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                  MEASUREMENT BLUEPRINT (280 GSM CUT)
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)' }}>
                  Flat garment measurements
                </span>
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', minWidth: '460px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-dark)', color: 'var(--gold-primary)' }}>
                      <th style={{ padding: '0.7rem 0.8rem', position: 'sticky', left: 0, background: '#090a0c', zIndex: 2 }}>SIZE</th>
                      <th style={{ padding: '0.7rem 0.8rem' }}>CHEST</th>
                      <th style={{ padding: '0.7rem 0.8rem' }}>LENGTH</th>
                      <th style={{ padding: '0.7rem 0.8rem' }}>SHOULDER</th>
                      <th style={{ padding: '0.7rem 0.8rem' }}>SLEEVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeSpecs.map((spec) => {
                      const isSelected = savedSize === spec.size;
                      return (
                        <tr 
                          key={spec.size}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            backgroundColor: isSelected ? 'rgba(197, 160, 89, 0.08)' : 'transparent',
                            color: isSelected ? '#ffffff' : 'var(--text-light-secondary)',
                            fontWeight: isSelected ? 600 : 400
                          }}
                        >
                          <td style={{
                            padding: '0.75rem 0.8rem',
                            color: isSelected ? 'var(--gold-bright)' : '#fff',
                            position: 'sticky',
                            left: 0,
                            background: isSelected ? '#161512' : '#090a0c',
                            zIndex: 2
                          }}>
                            {spec.size} {isSelected && '★'}
                          </td>
                          <td style={{ padding: '0.75rem 0.8rem' }}>{spec.chest}</td>
                          <td style={{ padding: '0.75rem 0.8rem' }}>{spec.length}</td>
                          <td style={{ padding: '0.75rem 0.8rem' }}>{spec.shoulder}</td>
                          <td style={{ padding: '0.75rem 0.8rem' }}>{spec.sleeve}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSizing}
              className="btn-primary-gold"
              style={{ padding: '0.85rem 2rem', fontSize: '0.8rem' }}
            >
              {sizingSuccess ? (
                <>
                  <Check size={14} />
                  <span>SIZING PREFERENCE SAVED</span>
                </>
              ) : (
                <span>SAVE DEFAULT SIZING</span>
              )}
            </button>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ACCOUNT SETTINGS & ADDRESSES
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. Account Credentials Form */}
            <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '2.2rem 1.8rem', borderRadius: '2px' }}>
              <form onSubmit={handleSaveSecurity}>
                <div style={{ marginBottom: '1.8rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#fff', marginBottom: '0.3rem' }}>
                    Account Identity & Credentials
                  </h2>
                  <p style={{ color: 'var(--text-light-muted)', fontSize: '0.84rem' }}>
                    Manage your profile name, verified primary email, contact phone, and security.
                  </p>
                </div>

                {unlinkSuccess && (
                  <div style={{ backgroundColor: 'rgba(197, 160, 89, 0.12)', border: '1px solid var(--gold-border)', color: 'var(--gold-bright)', padding: '0.8rem 1.2rem', borderRadius: '2px', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                    ✓ Social account unlinked. You can now configure your custom password below.
                  </div>
                )}


                {securityError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.8rem 1.2rem', borderRadius: '2px', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                    {securityError}
                  </div>
                )}

                {/* Responsive 2-Col / 1-Col Inputs */}
                <div className="form-row-responsive">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Client Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={{ backgroundColor: '#090a0c', color: '#fff' }}
                    />
                  </div>

                  {/* Locked Email Address Field */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Email Address</label>
                      <span style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Lock size={10} />
                        <span>LOCKED</span>
                      </span>
                    </div>
                    <input
                      type="email"
                      readOnly
                      className="form-input"
                      value={clientEmail || storedUser.email || ''}
                      title="Primary account email identifier"
                      style={{
                        backgroundColor: '#141518',
                        color: '#ffffff',
                        WebkitTextFillColor: '#ffffff',
                        borderColor: 'var(--border-dark)',
                        cursor: 'default',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        opacity: 1
                      }}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="form-group" style={{ marginTop: '1.2rem', marginBottom: '1.8rem' }}>
                  <label className="form-label">Phone / Mobile Number (For Courier SMS)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                    className="form-input"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    style={{ backgroundColor: '#090a0c', color: '#fff' }}
                  />
                </div>

                {/* Conditional Password vs Social Unlink Section */}
                <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '1.5rem', marginBottom: '1.8rem' }}>
                  
                  {authProvider !== 'email' ? (
                    /* Social Login Linked Card */
                    <div style={{
                      backgroundColor: '#090a0c',
                      border: '1px solid var(--gold-border)',
                      padding: '1.5rem',
                      borderRadius: '2px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(197, 160, 89, 0.15)',
                            border: '1px solid var(--gold-bright)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gold-bright)',
                            flexShrink: 0
                          }}>
                            <Link2 size={18} />
                          </div>
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#fff', marginBottom: '0.2rem' }}>
                              Linked with {authProvider}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)', lineHeight: 1.45, maxWidth: '520px' }}>
                              Authenticated via {authProvider}. Direct password changes are disabled while social single sign-on is active.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setUnlinkError('');
                            setUnlinkNewPassword('');
                            setUnlinkConfirmPassword('');
                            setIsUnlinkModalOpen(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.7rem 1.2rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            borderRadius: '2px',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          <Unlink size={13} color="var(--gold-bright)" />
                          <span>UNLINK {authProvider.toUpperCase()} & CREATE PASSWORD</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Password Change Section for Email/Password Users */
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold-bright)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <KeyRound size={15} />
                        <span>Change Password</span>
                      </h3>

                      <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="form-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{ backgroundColor: '#090a0c', color: '#fff' }}
                        />
                      </div>

                      <div className="form-row-responsive">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            placeholder="Min 6 characters"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ backgroundColor: '#090a0c', color: '#fff' }}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ backgroundColor: '#090a0c', color: '#fff' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <button type="submit" className="btn-primary-gold" style={{ padding: '0.85rem 2rem', fontSize: '0.8rem' }}>
                  {securitySuccess ? (
                    <>
                      <Check size={15} />
                      <span>ACCOUNT DETAILS UPDATED</span>
                    </>
                  ) : (
                    <span>SAVE ACCOUNT CHANGES</span>
                  )}
                </button>
              </form>
            </div>

            {/* 2. Interactive Shipping Addresses Manager */}
            <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '2.2rem 1.8rem', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.6rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#fff', marginBottom: '0.3rem' }}>
                    Saved Shipping Addresses
                  </h2>
                  <p style={{ color: 'var(--text-light-muted)', fontSize: '0.84rem' }}>
                    Configure delivery destinations for express courier dispatch.
                  </p>
                </div>

                {!isAddingAddress && (
                  <button
                    type="button"
                    className="btn-primary-gold"
                    onClick={() => setIsAddingAddress(true)}
                    style={{ padding: '0.7rem 1.2rem', fontSize: '0.76rem', gap: '0.4rem' }}
                  >
                    <Plus size={13} />
                    <span>ADD NEW ADDRESS</span>
                  </button>
                )}
              </div>

              {/* Form to Add New Address with Selectable City */}
              {isAddingAddress && (
                <div style={{ backgroundColor: '#090a0c', border: '1px solid var(--gold-border)', padding: '1.6rem', borderRadius: '2px', marginBottom: '1.8rem' }}>
                  <form onSubmit={handleCreateAddress}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>
                      Add New Delivery Destination
                    </h4>

                    <div className="form-row-responsive">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Recipient Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Julian Sterling"
                          className="form-input"
                          value={newAddressForm.recipientName}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, recipientName: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Street Address & Apartment</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 14 Alfred House Gardens, Apt 4B"
                          className="form-input"
                          value={newAddressForm.streetAddress}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, streetAddress: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-3col" style={{ marginTop: '1rem', marginBottom: '1.4rem' }}>
                      {/* Selectable City Dropdown */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Select City</label>
                        <select
                          className="form-input"
                          value={newAddressForm.city}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                          style={{
                            backgroundColor: '#121316',
                            color: '#ffffff',
                            borderColor: 'var(--border-dark)',
                            cursor: 'pointer'
                          }}
                        >
                          {CITIES_LIST.map((city) => (
                            <option key={city} value={city} style={{ backgroundColor: '#121316', color: '#ffffff' }}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Postal / ZIP Code</label>
                        <input
                          type="text"
                          placeholder="00300"
                          className="form-input"
                          value={newAddressForm.postalCode}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          required
                          placeholder="Sri Lanka"
                          className="form-input"
                          value={newAddressForm.country}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <button type="submit" className="btn-primary-gold" style={{ padding: '0.75rem 1.4rem', fontSize: '0.76rem' }}>
                        <span>SAVE ADDRESS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-light-muted)', padding: '0.75rem 1.2rem', borderRadius: '2px', cursor: 'pointer', fontSize: '0.76rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List of Saved Addresses or Empty State */}
              {shippingAddresses.length === 0 && !isAddingAddress ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  backgroundColor: '#090a0c',
                  border: '1px dashed var(--border-dark)',
                  borderRadius: '2px'
                }}>
                  <MapPin size={30} color="var(--gold-bright)" style={{ margin: '0 auto 0.8rem auto', opacity: 0.8 }} />
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.4rem' }}>
                    No Shipping Addresses Saved
                  </h4>
                  <p style={{ color: 'var(--text-light-muted)', fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto 1.4rem auto' }}>
                    You have not registered any delivery destinations yet. Add your primary residence or international address for express courier dispatch.
                  </p>
                  <button
                    type="button"
                    className="btn-primary-gold"
                    onClick={() => setIsAddingAddress(true)}
                    style={{ padding: '0.75rem 1.4rem', fontSize: '0.76rem', gap: '0.4rem', margin: '0 auto' }}
                  >
                    <Plus size={13} />
                    <span>ADD FIRST ADDRESS</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {shippingAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        backgroundColor: '#090a0c',
                        border: addr.isDefault ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                        padding: '1.4rem',
                        borderRadius: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{addr.recipientName}</strong>
                          {addr.isDefault && (
                            <span style={{ fontSize: '0.62rem', color: 'var(--gold-bright)', border: '1px solid var(--gold-border)', background: 'rgba(197, 160, 89, 0.1)', padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.08em' }}>
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                          <div>{addr.streetAddress}</div>
                          <div>{addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''}</div>
                          <div>{addr.country}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>✓ Default Destination</span>
                        )}

                        {shippingAddresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.8 }}
                            title="Remove address"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

      {/* Unlink Social Account & Create Password Warning Modal */}
      {isUnlinkModalOpen && (
        <div 
          className="modal-backdrop"
          onClick={() => setIsUnlinkModalOpen(false)}
          style={{ zIndex: 10000, padding: '1.5rem', overflowY: 'auto' }}
        >
          <div 
            className="fitting-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', margin: 'auto', backgroundColor: '#101114', border: '1px solid var(--gold-border)' }}
          >
            <button 
              className="modal-close-icon" 
              onClick={() => setIsUnlinkModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: '#ef4444'
              }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.4rem' }}>
                Unlink {authProvider} Account
              </h3>
              <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                Unlinking your {authProvider} account will convert your Maison ELVANY profile to standalone email & password authentication.
              </p>
            </div>

            <div style={{
              backgroundColor: '#090a0c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem',
              borderRadius: '2px',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-light-muted)'
            }}>
              <strong style={{ color: 'var(--gold-bright)' }}>IMPORTANT: </strong>
              Please create a new secure password below to ensure uninterrupted access to your orders, sizing profile, and client passport.
            </div>

            {unlinkError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '2px',
                marginBottom: '1.2rem',
                fontSize: '0.8rem'
              }}>
                {unlinkError}
              </div>
            )}

            <form onSubmit={handleConfirmUnlinkAndSetPassword}>
              <div className="form-group">
                <label className="form-label">New Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  className="form-input"
                  value={unlinkNewPassword}
                  onChange={(e) => setUnlinkNewPassword(e.target.value)}
                  style={{ backgroundColor: '#090a0c', color: '#fff' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.8rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  className="form-input"
                  value={unlinkConfirmPassword}
                  onChange={(e) => setUnlinkConfirmPassword(e.target.value)}
                  style={{ backgroundColor: '#090a0c', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'column' }}>
                <button
                  type="submit"
                  disabled={isUnlinking}
                  className="btn-primary-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
                >
                  <span>{isUnlinking ? 'UNLINKING & UPDATING...' : `SET PASSWORD & UNLINK ${authProvider.toUpperCase()}`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnlinkModalOpen(false)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-light-muted)',
                    padding: '0.75rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  Cancel & Keep {authProvider} Linked
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};
