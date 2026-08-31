import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { LogOut } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CuratedPillars } from './components/CuratedPillars';
import { FeaturedTees } from './components/FeaturedTees';
import { Philosophy } from './components/Philosophy';
import { CollectionPage } from './components/CollectionPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OrderReviewPortalPage } from './components/OrderReviewPortalPage';
import { AccountPage } from './components/AccountPage';
import { EditorialSection } from './components/EditorialSection';
import { ArchitecturalDetails } from './components/ArchitecturalDetails';
import { Testimonial } from './components/Testimonial';
import { ConciergePage } from './components/ConciergePage';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

import { SearchPage } from './components/SearchPage';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { EditorialModal } from './components/EditorialModal';
import { AuthModal } from './components/AuthModal';
import { LuxuryLoader } from './components/LuxuryLoader';
import { PopupAdModal } from './components/PopupAdModal';
import { AdminApp } from './admin/AdminApp';
import { PromotionsSection } from './components/PromotionsSection';
import { CheckoutPage } from './components/CheckoutPage';

import { PRODUCTS } from './data/products';
import { INITIAL_ORDERS } from './data/orders';
import { INITIAL_OFFERS } from './data/offers';
import { DEFAULT_POPUP_AD } from './data/popupAd';
import { 
  getProducts, 
  getOrders, 
  getOffers, 
  getReviews, 
  createOrder, 
  addReview, 
  getDatabaseCart, 
  saveDatabaseCart,
  getPopupAdSettings,
  savePopupAdSettings 
} from './services/dbService';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import confetti from 'canvas-confetti';


export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic Catalog State (syncs with Supabase database - no dummy fallbacks)
  const [productsList, setProductsList] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Offers State (managed via Admin Dashboard & Supabase - empty by default)
  const [offers, setOffers] = useState([]);

  // Orders Store (syncs with Supabase)
  const [ordersList, setOrdersList] = useState([]);

  // Entrance Popup Ad Settings State (synced with Database & localStorage)
  const [popupAdSettings, setPopupAdSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('elvany_popup_ad_settings');
      return saved ? JSON.parse(saved) : DEFAULT_POPUP_AD;
    } catch {
      return DEFAULT_POPUP_AD;
    }
  });

  const handleUpdatePopupAd = async (updated) => {
    setPopupAdSettings(updated);
    await savePopupAdSettings(updated);
  };

  // Authentication State persisted via localStorage & Supabase
  const [userProfile, setUserProfile] = useState(() => {

    try {
      const saved = localStorage.getItem('elvany_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loggedInUser = userProfile?.name || null;
  const authProvider = userProfile?.provider || 'email';

  // Dynamic reviews store keyed by product ID and slug
  const [allReviewsMap, setAllReviewsMap] = useState(() => {
    const initial = {};
    PRODUCTS.forEach((p) => {
      initial[p.id] = p.reviews || [];
    });
    return initial;
  });

  // Sync backend data smoothly in background on mount (Non-blocking instant render)
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [dbProductsRes, dbOffersRes, dbReviewsRes, dbPopupAdRes] = await Promise.allSettled([
          getProducts(),
          getOffers(),
          getReviews(),
          getPopupAdSettings()
        ]);

        if (dbProductsRes.status === 'fulfilled' && Array.isArray(dbProductsRes.value) && dbProductsRes.value.length > 0) {
          setProductsList(dbProductsRes.value);
        }
        if (dbOffersRes.status === 'fulfilled' && Array.isArray(dbOffersRes.value)) {
          setOffers(dbOffersRes.value);
        }
        if (dbPopupAdRes.status === 'fulfilled' && dbPopupAdRes.value) {
          setPopupAdSettings(dbPopupAdRes.value);
        }

        const dbReviews = dbReviewsRes.status === 'fulfilled' ? dbReviewsRes.value : [];
        if (Array.isArray(dbReviews) && dbReviews.length > 0) {
          const currentProducts = (dbProductsRes.status === 'fulfilled' && dbProductsRes.value) || PRODUCTS;
          setAllReviewsMap((prev) => {
            const revMap = { ...prev };
            dbReviews.forEach((r) => {
              const pid = r.productId || r.product_id;
              const prodTitle = r.productTitle || r.title;
              const matched = currentProducts.find(
                (p) => (pid && (p.id === pid || p.slug === pid)) || (prodTitle && p.title === prodTitle)
              );

              const keysToLink = new Set();
              if (pid) keysToLink.add(pid);
              if (matched?.id) keysToLink.add(matched.id);
              if (matched?.slug) keysToLink.add(matched.slug);
              if (matched?.title) keysToLink.add(matched.title);

              keysToLink.forEach((key) => {
                if (!revMap[key]) revMap[key] = [];
                if (!revMap[key].some((ex) => ex.id === r.id)) {
                  revMap[key].unshift(r);
                }
              });
            });
            return revMap;
          });
        }
      } catch (err) {
        console.warn('Backend sync notice:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    syncBackendData();

    // Listen for live popup ad updates from Admin panel
    const handlePopupAdSync = (e) => {
      if (e.detail) {
        setPopupAdSettings(e.detail);
      }
    };
    window.addEventListener('elvany_popup_ad_updated', handlePopupAdSync);
    return () => {
      window.removeEventListener('elvany_popup_ad_updated', handlePopupAdSync);
    };
  }, []);




  // Cart State (Local browser storage for guests, Database for authenticated clients)
  const [cart, setCart] = useState(() => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem('elvany_auth_user') || 'null');
      if (storedAuth?.email) {
        const userSaved = localStorage.getItem(`elvany_cart_${storedAuth.email.toLowerCase()}`);
        if (userSaved) return JSON.parse(userSaved);
      }
      const saved = localStorage.getItem('elvany_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync Cart helper to persist to Database for logged in users or LocalStorage for guests
  const syncCartState = (nextCartOrUpdater) => {
    setCart((prevCart) => {
      const nextCart = typeof nextCartOrUpdater === 'function' ? nextCartOrUpdater(prevCart) : nextCartOrUpdater;
      
      try {
        const activeUser = userProfile || JSON.parse(localStorage.getItem('elvany_auth_user') || 'null');
        if (activeUser?.email) {
          saveDatabaseCart(activeUser.email, nextCart);
        } else {
          localStorage.setItem('elvany_cart', JSON.stringify(nextCart));
        }
      } catch {
        localStorage.setItem('elvany_cart', JSON.stringify(nextCart));
      }
      return nextCart;
    });
  };

  // Merge guest cart with database cart upon login
  const mergeUserDatabaseCart = async (clientEmail) => {
    if (!clientEmail) return;
    try {
      const dbCart = await getDatabaseCart(clientEmail);
      let guestCart = [];
      try {
        const saved = localStorage.getItem('elvany_cart');
        guestCart = saved ? JSON.parse(saved) : [];
      } catch {}

      if (guestCart.length > 0) {
        const merged = [...dbCart];
        for (const item of guestCart) {
          const itemSize = item.selectedSize || item.size || 'M (40)';
          const idx = merged.findIndex(m => m.id === item.id && (m.selectedSize === itemSize || m.size === itemSize));
          if (idx > -1) {
            merged[idx].qty = Math.max(merged[idx].qty || 1, item.qty || 1);
          } else {
            merged.push(item);
          }
        }
        setCart(merged);
        await saveDatabaseCart(clientEmail, merged);
        localStorage.removeItem('elvany_cart');
      } else if (dbCart.length > 0) {
        setCart(dbCart);
      }
    } catch (err) {
      console.warn('Cart sync notice:', err);
    }
  };

  // Supabase Auth State Listener
  useEffect(() => {
    // Initial fetch of user database cart if already logged in
    const initialUser = userProfile || JSON.parse(localStorage.getItem('elvany_auth_user') || 'null');
    if (initialUser?.email) {
      mergeUserDatabaseCart(initialUser.email);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client';
          const email = session.user.email || '';
          const phone = session.user.phone || '';
          const provider = session.user.app_metadata?.provider || 'email';
          const savedSize = session.user.user_metadata?.savedSize || localStorage.getItem('elvany_saved_size') || 'L (42)';
          const profile = { name, email, phone, provider, savedSize };
          setUserProfile(profile);
          localStorage.setItem('elvany_auth_user', JSON.stringify(profile));
          mergeUserDatabaseCart(email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client';
          const email = session.user.email || '';
          const phone = session.user.phone || '';
          const provider = session.user.app_metadata?.provider || 'email';
          const savedSize = session.user.user_metadata?.savedSize || localStorage.getItem('elvany_saved_size') || 'L (42)';
          const profile = { name, email, phone, provider, savedSize };
          setUserProfile(profile);
          localStorage.setItem('elvany_auth_user', JSON.stringify(profile));
          mergeUserDatabaseCart(email);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          localStorage.removeItem('elvany_auth_user');
          localStorage.removeItem('elvany_cart');
          setCart([]);
        }
      });

      return () => subscription?.unsubscribe();
    }
  }, []);



  // Filter public products (only active items shown on storefront)
  const activeStorefrontProducts = useMemo(() => {
    return productsList.filter(p => p.is_active !== false && p.status !== 'Draft' && p.status !== 'Archived');
  }, [productsList]);




  const [activeCollectionCategory, setActiveCollectionCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(false);



  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditorialOpen, setIsEditorialOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [addedItemId, setAddedItemId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lenisRef = useRef(null);

  // Initialize Lenis Silky Smooth Momentum Scrolling (deactivated on admin routes for native scroll)
  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/elvanyadmin');
    if (isAdmin) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.4
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const animId = requestAnimationFrame(raf);

    // Scroll progress tracker
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
      lenisRef.current = null;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);


  // Stop background smooth scroll whenever any modal/drawer is open
  const isAnyModalOpen = isAuthOpen || isCartOpen || isSearchOpen || isEditorialOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      lenisRef.current?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenisRef.current?.start();
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Smooth scroll helper using Lenis
  const handleSmoothScrollTo = (target) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => {
      const filtered = prev.filter(t => t.message !== message);
      return [...filtered, { id, message }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Add new client review to store & Supabase
  const handleAddNewReview = async (productId, reviewObj) => {
    const matched = productsList.find((p) => p.id === productId || p.slug === productId) ||
                    PRODUCTS.find((p) => p.id === productId || p.slug === productId);

    setAllReviewsMap((prev) => {
      const updated = { ...prev };
      const keysToUpdate = new Set([productId]);
      if (matched?.id) keysToUpdate.add(matched.id);
      if (matched?.slug) keysToUpdate.add(matched.slug);

      keysToUpdate.forEach((k) => {
        const currentList = updated[k] || [];
        if (!currentList.some((r) => r.id === reviewObj.id)) {
          updated[k] = [reviewObj, ...currentList];
        }
      });
      return updated;
    });

    addToast(`Client review by ${reviewObj.author} published to Maison archive.`);
    try {
      await addReview({ productId: matched?.id || productId, ...reviewObj });
    } catch (err) {
      console.error('Review sync error:', err);
    }
  };


  // Add to cart handler with strict live inventory enforcement and custom quantity
  const handleAddToCart = (product, size, qtyToAdd = 1) => {
    const chosenSize = size || product.selectedSize || product.size || (product.sizes && product.sizes[0]) || 'M (40)';
    const productName = product.name || product.title || 'Luxury Atelier T-Shirt';
    const numToAdd = Math.max(1, parseInt(qtyToAdd, 10) || 1);

    const maxAvailable = (product.inventory && product.inventory[chosenSize] !== undefined)
      ? Number(product.inventory[chosenSize])
      : (product.totalStock !== undefined ? Number(product.totalStock) : 999);

    if (maxAvailable <= 0) {
      addToast(`"${productName}" (${chosenSize}) is currently Sold Out.`);
      return;
    }

    let reachedMax = false;
    let actualAdded = numToAdd;

    syncCartState((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && (item.selectedSize === chosenSize || item.size === chosenSize)
      );

      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].qty || 1;
        if (currentQty >= maxAvailable) {
          reachedMax = true;
          return prevCart;
        }
        const newQty = Math.min(maxAvailable, currentQty + numToAdd);
        actualAdded = newQty - currentQty;
        const updated = [...prevCart];
        updated[existingIndex].qty = newQty;
        return updated;
      } else {
        const initialQty = Math.min(maxAvailable, numToAdd);
        actualAdded = initialQty;
        return [
          ...prevCart, 
          { 
            ...product, 
            name: productName, 
            title: productName, 
            selectedSize: chosenSize, 
            size: chosenSize, 
            maxStock: maxAvailable,
            qty: initialQty 
          }
        ];
      }
    });

    if (reachedMax) {
      addToast(`Maximum atelier stock limit reached (${maxAvailable} piece${maxAvailable > 1 ? 's' : ''} available in size ${chosenSize}).`);
      return;
    }

    setAddedItemId(product.id);
    setTimeout(() => setAddedItemId(null), 1800);

    const qtySuffix = actualAdded > 1 ? ` (Qty: ${actualAdded})` : '';
    addToast(`Added "${productName}" (${chosenSize})${qtySuffix} to Shopping Bag`);
  };



  const handleUpdateQty = (id, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size);
      return;
    }

    // Look up live catalog product to find exact max stock for this size
    const catalogItem = productsList.find(p => p.id === id);
    const maxAvailable = (catalogItem?.inventory && catalogItem.inventory[size] !== undefined)
      ? Number(catalogItem.inventory[size])
      : (catalogItem?.totalStock || 999);

    if (newQty > maxAvailable) {
      addToast(`Only ${maxAvailable} piece${maxAvailable > 1 ? 's' : ''} available in size ${size}.`);
      syncCartState((prev) =>
        prev.map((item) =>
          item.id === id && (item.selectedSize === size || item.size === size)
            ? { ...item, qty: maxAvailable }
            : item
        )
      );
      return;
    }

    syncCartState((prev) =>
      prev.map((item) =>
        item.id === id && (item.selectedSize === size || item.size === size)
          ? { ...item, qty: newQty }
          : item
      )
    );
  };


  const handleRemoveItem = (id, size) => {
    syncCartState((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === size))
    );
    addToast('Item removed from bag');
  };

  const handleCheckout = async (newOrder, paymentSlipFile = null) => {
    let created = null;
    if (newOrder) {
      try {
        created = await createOrder(newOrder, paymentSlipFile);
        setOrdersList((prev) => [created || newOrder, ...prev]);
      } catch (err) {
        console.error('Order creation error:', err);
        setOrdersList((prev) => [newOrder, ...prev]);
      }
    }
    syncCartState([]);

    // Trigger celebration animation ONLY AFTER order is confirmed and saved
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#c5a059', '#e2be79', '#ffffff', '#141518']
    });
    addToast(`Order #${newOrder.orderId} confirmed with package certificate.`);
  };


  const handleSubscribeSuccess = (email) => {
    addToast(`Subscribed ${email} to the ELVANY Private Circle.`);
  };

  const handleLoginSuccess = (userData, provider = 'email') => {
    let name = '';
    let email = '';
    let phone = '';
    let prov = provider || 'email';

    if (typeof userData === 'object' && userData !== null) {
      name = userData.name || userData.email?.split('@')[0] || 'Client';
      email = userData.email || '';
      phone = userData.phone || '';
      prov = userData.provider || provider || 'email';
    } else {
      name = userData;
      email = userData.includes?.('@') ? userData : '';
      prov = provider;
    }

    const updatedProfile = { name, email, phone, provider: prov };
    setUserProfile(updatedProfile);
    localStorage.setItem('elvany_auth_user', JSON.stringify(updatedProfile));

    if (email) {
      mergeUserDatabaseCart(email);
    }

    // Automatic Executive Redirect if logged in with elvanywear@gmail.com
    if (email && email.toLowerCase().trim() === 'elvanywear@gmail.com') {
      addToast('Atelier Executive Recognized. Opening Maison Admin Desk.');
      triggerPageTransition('/elvanyadmin');
      return;
    }

    addToast(`Authenticated as ${name}. Welcome to Maison ELVANY.`);
  };

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    const prevEmail = userProfile?.email;
    setUserProfile(null);
    localStorage.removeItem('elvany_auth_user');
    localStorage.removeItem('elvany_cart');
    if (prevEmail) {
      localStorage.removeItem(`elvany_cart_${prevEmail.toLowerCase()}`);
    }
    setCart([]);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice:', err);
      }
    }
    addToast('Signed out of Maison ELVANY session.');
    triggerPageTransition('/');
  };


  const handleUpdateUserProfile = (updatedData) => {
    setUserProfile((prev) => {
      const updated = {
        ...(prev || {}),
        ...(typeof updatedData === 'object' ? updatedData : { name: updatedData })
      };
      localStorage.setItem('elvany_auth_user', JSON.stringify(updated));
      return updated;
    });
    addToast('Client credentials & contact details updated.');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Transition helper with 4s luxury loader
  const triggerPageTransition = (targetPath, onAfter) => {
    if (location.pathname === targetPath) {
      handleSmoothScrollTo(0);
      return;
    }

    setIsPageLoading(true);
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    setTimeout(() => {
      navigate(targetPath);
      if (onAfter) onAfter();
      setTimeout(() => {
        setIsPageLoading(false);
      }, 500);
    }, 3500);
  };

  const navigateToProduct = (product) => {
    triggerPageTransition(`/product/${product.id}`);
  };

  const navigateToCollection = (categoryKey = 'all') => {
    setActiveCollectionCategory(categoryKey);
    triggerPageTransition('/collection');
  };

  const navigateToSearchPage = (query = '') => {
    setSearchQuery(query);
    triggerPageTransition('/search');
  };

  const navigateToAccount = (tab = 'orders') => {
    triggerPageTransition(`/account?tab=${tab}`);
  };

  const navigateToConcierge = () => {
    triggerPageTransition('/concierge');
  };

  const navigateToHome = (callback) => {
    triggerPageTransition('/', callback);
  };

  // Determine current active view from URL path
  const isAdminView = location.pathname.startsWith('/elvanyadmin') || location.pathname.startsWith('/admin');
  const currentView = location.pathname.startsWith('/product') 
    ? 'product' 
    : location.pathname === '/collection'
    ? 'collection'
    : location.pathname === '/search'
    ? 'search'
    : location.pathname === '/account'
    ? 'account'
    : location.pathname === '/concierge' || location.pathname === '/contact'
    ? 'concierge'
    : location.pathname.startsWith('/order-review')
    ? 'order-review'
    : isAdminView
    ? 'admin'
    : 'home';

  return (
    <div className="elvany-app">
      {/* 4-Second Luxury Page Transition Loader with End Fade-Out */}
      <LuxuryLoader isVisible={isPageLoading} />

      {/* Top Navbar with Profile Dropdown Menu */}
      {!isAdminView && (
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigateToAccount={navigateToAccount}
          onLogout={handleLogoutClick}
          onOpenSearch={() => navigateToSearchPage('')}
          onNavigateToCollection={navigateToCollection}
          onNavigateToConcierge={navigateToConcierge}
          onNavigateHome={navigateToHome}
          onSmoothScrollTo={handleSmoothScrollTo}
          currentView={currentView}
          loggedInUser={loggedInUser}
        />
      )}

      {/* React Router URL Endpoints */}
      <Routes>
        {/* Dedicated Atelier Executive Admin Route (/elvanyadmin) */}
        <Route 
          path="/elvanyadmin/*" 
          element={
            <AdminApp
              offers={offers}
              onUpdateOffers={setOffers}
              products={productsList}
              onUpdateProducts={setProductsList}
              orders={ordersList}
              onUpdateOrders={setOrdersList}
              popupAdSettings={popupAdSettings}
              onUpdatePopupAdSettings={handleUpdatePopupAd}
              userProfile={userProfile}
              loggedInUser={loggedInUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogoutClick}
              onNavigateHome={navigateToHome}
            />
          } 
        />
        <Route 
          path="/elvanyadmin" 
          element={
            <AdminApp
              offers={offers}
              onUpdateOffers={setOffers}
              products={productsList}
              onUpdateProducts={setProductsList}
              orders={ordersList}
              onUpdateOrders={setOrdersList}
              popupAdSettings={popupAdSettings}
              onUpdatePopupAdSettings={handleUpdatePopupAd}
              userProfile={userProfile}
              loggedInUser={loggedInUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogoutClick}
              onNavigateHome={navigateToHome}
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminApp
              offers={offers}
              onUpdateOffers={setOffers}
              products={productsList}
              onUpdateProducts={setProductsList}
              orders={ordersList}
              onUpdateOrders={setOrdersList}
              popupAdSettings={popupAdSettings}
              onUpdatePopupAdSettings={handleUpdatePopupAd}
              userProfile={userProfile}
              loggedInUser={loggedInUser}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogoutClick}
              onNavigateHome={navigateToHome}
            />
          } 
        />



        {/* Home Route */}
        <Route 
          path="/" 
          element={
            <>
              {/* 1. Hero Section */}
              <Hero
                onExploreClick={() => navigateToCollection('all')}
              />

              {/* 1.5. Atelier Private Client Promotions & Offers (Per-Item Interactive Slideshow below Hero) */}
              <PromotionsSection 
                offers={offers}
                onAddToCart={handleAddToCart}
                onSelectProduct={navigateToProduct}
              />

              {/* 2. Signature Categories / Curated Pillars */}
              <CuratedPillars
                onSelectCategory={navigateToCollection}
              />

              {/* 3. Direct Signature T-Shirt Showcase */}
              <FeaturedTees
                products={activeStorefrontProducts}
                isLoading={isLoadingCatalog}
                loggedInUser={loggedInUser}
                userProfile={userProfile}
                onSelectProduct={navigateToProduct}
                onAddToCart={handleAddToCart}
                addedItemId={addedItemId}
                onExploreCollection={() => navigateToCollection('all')}
              />

              {/* 4. Craft Philosophy */}
              <Philosophy />

              {/* 5. Campaign Editorial Split Section */}
              <EditorialSection
                onReadEditorial={() => setIsEditorialOpen(true)}
              />

              {/* 6. Architectural Details (Engineering Study) */}
              <ArchitecturalDetails />

              {/* 7. Architectural Press Testimonial */}
              <Testimonial />

              {/* 8. Private Circle Newsletter */}
              <Newsletter
                onSubscribeSuccess={handleSubscribeSuccess}
              />
            </>
          } 
        />

        {/* Dedicated Standalone Concierge Route */}
        <Route 
          path="/concierge" 
          element={<ConciergePage />} 
        />
        <Route 
          path="/contact" 
          element={<ConciergePage />} 
        />

        {/* Collection Route */}
        <Route 
          path="/collection" 
          element={
            <CollectionPage
              products={activeStorefrontProducts}
              isLoading={isLoadingCatalog}
              loggedInUser={loggedInUser}
              userProfile={userProfile}
              initialCategory={activeCollectionCategory}
              onBackToHome={() => navigateToHome()}
              onSelectProduct={navigateToProduct}
              onAddToCart={handleAddToCart}
              addedItemId={addedItemId}
            />
          } 
        />




        {/* Dedicated Product Detail Page Route */}
        <Route 
          path="/product/:id" 
          element={
            <ProductDetailPage
              products={productsList}
              offers={offers}
              allReviewsMap={allReviewsMap}
              userProfile={userProfile}
              loggedInUser={loggedInUser}
              onAddNewReview={handleAddNewReview}
              onBackToCollection={() => navigateToCollection(activeCollectionCategory)}
              onBackToHome={() => navigateToHome()}
              onSelectProduct={navigateToProduct}
              onAddToCart={handleAddToCart}
              addedItemId={addedItemId}
            />
          } 
        />


        {/* Dedicated Search Route */}
        <Route 
          path="/search" 
          element={
            <SearchPage
              products={productsList}
              initialQuery={searchQuery}
              onBackToHome={() => navigateToHome()}
              onSelectProduct={navigateToProduct}
              onAddToCart={handleAddToCart}
              addedItemId={addedItemId}
            />
          } 
        />

        {/* Dedicated Full Standalone Account & Settings Page Route */}
        <Route 
          path="/account" 
          element={
            <AccountPage
              userProfile={userProfile}
              loggedInUser={loggedInUser}
              authProvider={authProvider}
              onUpdateUser={handleUpdateUserProfile}
              onLogout={handleLogoutClick}
              onOpenAuthModal={() => setIsAuthOpen(true)}
              ordersList={ordersList}
              allReviewsMap={allReviewsMap}
            />
          } 
        />

        {/* Dedicated QR Code Scanned Order Review Portal Route */}
        <Route 
          path="/order-review" 
          element={
            <OrderReviewPortalPage 
              ordersList={ordersList}
              onAddNewReview={handleAddNewReview}
              allReviewsMap={allReviewsMap}
            />
          } 
        />
        <Route 
          path="/order-review/:orderId" 
          element={
            <OrderReviewPortalPage 
              ordersList={ordersList}
              onAddNewReview={handleAddNewReview}
              allReviewsMap={allReviewsMap}
            />
          } 
        />


        {/* Dedicated Standalone Checkout Route */}
        <Route 
          path="/checkout" 
          element={
            <CheckoutPage 
              cart={cart}
              onClearCart={() => setCart([])}
              onConfirmOrder={handleCheckout}
              loggedInUser={loggedInUser}
              userProfile={userProfile}
              onOpenAuthModal={() => setIsAuthOpen(true)}
              onBackToStore={() => navigateToHome()}
            />

          } 
        />

        {/* Fallback to Home */}
        <Route 
          path="*" 
          element={
            <CollectionPage
              initialCategory="all"
              onBackToHome={() => navigateToHome()}
              onSelectProduct={navigateToProduct}
              onAddToCart={handleAddToCart}
              addedItemId={addedItemId}
            />
          } 
        />
      </Routes>

      {/* Maison Footer */}
      {!isAdminView && (
        <Footer
          onNavigateToCollection={navigateToCollection}
        />
      )}

      {/* Interactive Drawers and Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(prod) => navigateToProduct(prod)}
        onNavigateToSearchPage={navigateToSearchPage}
      />

      <EditorialModal
        isOpen={isEditorialOpen}
        onClose={() => setIsEditorialOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Entrance Popup Visual Advertisement on Home */}
      {!isAdminView && (
        <PopupAdModal
          popupAdSettings={popupAdSettings}
          isLoading={isLoadingCatalog}
          onNavigateToCollection={navigateToCollection}
          onNavigateToConcierge={() => navigate('/concierge')}
        />
      )}



      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div 
          className="modal-backdrop"
          onClick={() => setIsLogoutConfirmOpen(false)}
          style={{ zIndex: 10000, padding: '1.5rem', overflowY: 'auto' }}
        >
          <div 
            className="fitting-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', margin: 'auto', backgroundColor: '#101114', border: '1px solid var(--border-dark)', textAlign: 'center', padding: '2.4rem 2rem' }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto',
              color: '#ef4444'
            }}>
              <LogOut size={22} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '0.5rem' }}>
              Confirm Sign Out
            </h3>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Are you sure you wish to conclude your private Maison ELVANY session? You can sign in again at any time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary-gold"
                onClick={confirmLogout}
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', backgroundColor: '#dc2626', borderColor: '#ef4444' }}
              >
                <span>YES, SIGN OUT</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-light-muted)',
                  padding: '0.75rem',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Cancel & Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            <span>⚜</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
