import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Share, PlusSquare } from 'lucide-react';

const COOLDOWN_DAYS = 7;
const ENGAGEMENT_TIME_MS = 45000; // 45 seconds browsing threshold

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // 2. Check 7-day dismissal cooldown
    try {
      const dismissedAt = localStorage.getItem('elvany_pwa_dismissed');
      if (dismissedAt) {
        const diffDays = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (diffDays < COOLDOWN_DAYS) {
          return;
        }
      }
    } catch {}

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capture native Chromium beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Track visits & high-intent triggers
    let visitCount = 1;
    try {
      visitCount = (Number(localStorage.getItem('elvany_visit_count')) || 0) + 1;
      localStorage.setItem('elvany_visit_count', String(visitCount));
    } catch {}

    let timer = null;
    let hasTriggered = false;

    const triggerSuitableTime = (reason = 'timer') => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsVisible(true);
    };

    // A. High-Intent Event Listeners (User placed order or added garment to bag)
    const handleHighIntentEvent = () => {
      // Delay slightly (1.5s) so the user sees their order/cart feedback first
      setTimeout(() => {
        triggerSuitableTime('high-intent');
      }, 1500);
    };

    window.addEventListener('elvany_order_placed', handleHighIntentEvent);
    window.addEventListener('elvany_cart_item_added', handleHighIntentEvent);

    // B. Engaged Time Trigger (Returning patrons 20s, new visitors 45s with scroll)
    const delay = visitCount > 1 ? 20000 : ENGAGEMENT_TIME_MS;

    const handleScrollCheck = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollY / docHeight > 0.25) {
        // User has scrolled at least 25% down the page
        triggerSuitableTime('scroll-engagement');
        window.removeEventListener('scroll', handleScrollCheck);
      }
    };

    timer = setTimeout(() => {
      if (window.scrollY > 300) {
        triggerSuitableTime('timer-active');
      } else {
        window.addEventListener('scroll', handleScrollCheck, { passive: true });
      }
    }, delay);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('elvany_order_placed', handleHighIntentEvent);
      window.removeEventListener('elvany_cart_item_added', handleHighIntentEvent);
      window.removeEventListener('scroll', handleScrollCheck);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native Android / Desktop prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        try {
          localStorage.setItem('elvany_pwa_installed', 'true');
        } catch {}
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show Apple Safari step-by-step guidance
      setShowIOSInstructions(true);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('elvany_pwa_dismissed', String(Date.now()));
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <aside 
      className="pwa-install-banner"
      role="region"
      aria-label="Install Maison ELVANY App"
      data-lenis-prevent="true"
    >
      <div className="pwa-install-inner">
        {/* Close Button */}
        <button 
          type="button" 
          onClick={handleDismiss} 
          className="pwa-close-btn"
          aria-label="Dismiss installation prompt"
        >
          <X size={15} />
        </button>

        <div className="pwa-content-row">
          {/* App Icon with Gold Crest Badge */}
          <div className="pwa-icon-wrap">
            <img 
              src="/logo/Main-4.png" 
              alt="Maison ELVANY" 
              className="pwa-app-icon" 
            />
            <span className="pwa-crest-badge">★</span>
          </div>

          {/* Text Information */}
          <div className="pwa-text-content">
            <div className="pwa-tagline">
              <Sparkles size={12} color="var(--gold-bright)" />
              <span>ATELIER PROGRESSIVE APP</span>
            </div>
            <h4 className="pwa-title">
              Install Maison ELVANY
            </h4>
            <p className="pwa-description">
              Add to your home screen for instantaneous access.
            </p>
          </div>
        </div>

        {/* iOS Guided Instructions Dropdown */}
        {showIOSInstructions && isIOS && (
          <div className="pwa-ios-instructions">
            <div className="pwa-ios-step">
              <Share size={15} color="var(--gold-bright)" />
              <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
            </div>
            <div className="pwa-ios-step">
              <PlusSquare size={15} color="var(--gold-bright)" />
              <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pwa-actions-row">
          <button 
            type="button" 
            onClick={handleInstallClick} 
            className="pwa-install-cta"
          >
            <Download size={14} />
            <span>{isIOS ? 'HOW TO INSTALL' : 'INSTALL ATELIER APP'}</span>
          </button>

          <button 
            type="button" 
            onClick={handleDismiss} 
            className="pwa-dismiss-cta"
          >
            MAYBE LATER
          </button>
        </div>
      </div>
    </aside>
  );
};
