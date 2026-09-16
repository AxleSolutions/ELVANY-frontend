import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert, Wifi, CheckCircle2 } from 'lucide-react';

export function OfflineGate() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isChecking, setIsChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [restoredToast, setRestoredToast] = useState(false);

  // Proactive real server reachability ping test
  const verifyConnectivity = useCallback(async () => {
    setIsChecking(true);
    setCheckFailed(false);

    try {
      // Test connectivity by making a rapid HEAD/GET request with cache busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Ping a static asset or origin with cache-busting timestamp
      const response = await fetch(`/logo/favicon-48.png?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 304 || response.type === 'opaque') {
        setIsOnline(true);
        setCheckFailed(false);
        setRestoredToast(true);
        setTimeout(() => setRestoredToast(false), 4500);
      } else {
        setIsOnline(false);
        setCheckFailed(true);
      }
    } catch {
      // In case fetch fails or aborts
      if (!navigator.onLine) {
        setIsOnline(false);
      }
      setCheckFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      // Confirm with a quick ping when browser fires online event
      verifyConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setRestoredToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount if navigator indicates offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [verifyConnectivity]);

  // Lock body scroll when offline restriction screen is active
  useEffect(() => {
    if (!isOnline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOnline]);

  return (
    <>
      {/* Toast Notification when Reconnected */}
      {restoredToast && isOnline && (
        <div 
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] animate-fade-in pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#141518]/95 border border-[#c5a059]/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-[#f5f5f5]">
            <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059]">
              <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div className="text-xs tracking-wider">
              <span className="font-semibold uppercase text-[#c5a059]">Connected</span>
              <span className="text-[#a3a6ad] mx-1.5">—</span>
              <span>Maison live catalog synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Offline Restriction Overlay */}
      {!isOnline && (
        <div 
          id="elvany-offline-restriction-gate"
          className="fixed inset-0 z-[999998] flex items-center justify-center bg-[#070709]/96 backdrop-blur-xl px-4 py-8 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offline-title"
          aria-describedby="offline-desc"
        >
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(197,160,89,0.08)_0%,_transparent_70%)] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[radial-gradient(circle,_rgba(226,190,121,0.04)_0%,_transparent_70%)] rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Luxury Card Container */}
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111216]/90 border border-[#c5a059]/30 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-center text-[#f5f5f5] transition-all">
            
            {/* Maison ELVANY Monogram Header */}
            <div className="mb-6">
              <div className="inline-block tracking-[0.35em] text-[11px] uppercase font-semibold text-[#c5a059] mb-1">
                MAISON ELVANY
              </div>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#c5a059]/60 to-transparent mx-auto" />
            </div>

            {/* Glowing Disconnected Icon */}
            <div className="relative mx-auto mb-6 w-20 h-20 rounded-full bg-[#181920] border border-[#c5a059]/25 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#c5a059]" />
              <WifiOff className="w-9 h-9 text-[#e2be79] relative z-10" />
            </div>

            {/* Title */}
            <h2 
              id="offline-title" 
              className="text-2xl sm:text-3xl font-serif tracking-wide text-[#f5f5f5] mb-3"
              style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif" }}
            >
              Network Connection Required
            </h2>

            {/* Disconnected Status Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Offline Mode Detected
            </div>

            {/* Description */}
            <p id="offline-desc" className="text-sm sm:text-base text-[#a3a6ad] leading-relaxed mb-6">
              To guarantee real-time inventory precision, live pricing, exclusive offers, and secure concierge checkout, Maison ELVANY requires an active internet connection.
            </p>

            {/* Reconnection Failure Alert */}
            {checkFailed && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-500/25 flex items-center justify-center gap-2 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Unable to reach server. Please check your Wi-Fi or mobile data.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                id="btn-retry-network"
                onClick={verifyConnectivity}
                disabled={isChecking}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e47] hover:from-[#d4af66] hover:to-[#c5a059] text-[#0b0b0c] font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_25px_rgba(197,160,89,0.45)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Verifying Network…' : 'Verify & Reconnect'}</span>
              </button>

              <div className="text-[11px] text-[#727680] pt-1">
                Access will resume automatically once your connection is restored.
              </div>
            </div>

            {/* Footer Assurance */}
            <div className="mt-8 pt-5 border-t border-[#ffffff]/08 flex items-center justify-center gap-2 text-xs text-[#727680]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c5a059]/70" />
              <span>Protected Atelier System & Live Inventory Security</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default OfflineGate;
