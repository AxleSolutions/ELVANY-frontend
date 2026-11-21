import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, ShieldAlert, Wifi, CheckCircle2, CloudOff } from 'lucide-react';
import { testLiveConnectivity } from '../services/dbService';

export function OfflineGate({
  syncFailed = false,
  onRetry = null,
  isRetrying = false
}) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isChecking, setIsChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [restoredToast, setRestoredToast] = useState(false);
  const [dismissedSyncGate, setDismissedSyncGate] = useState(false);

  // Proactive real server reachability ping test
  const verifyConnectivity = useCallback(async () => {
    setIsChecking(true);
    setCheckFailed(false);

    try {
      const isReachable = await testLiveConnectivity();

      if (isReachable) {
        setIsOnline(true);
        setCheckFailed(false);
        setDismissedSyncGate(false);
        if (onRetry) {
          try {
            await onRetry();
          } catch {}
        }
        setRestoredToast(true);
        setTimeout(() => setRestoredToast(false), 4500);
      } else {
        setIsOnline(false);
        setCheckFailed(true);
      }
    } catch {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
      }
      setCheckFailed(true);
    } finally {
      setIsChecking(false);
    }
  }, [onRetry]);

  useEffect(() => {
    const handleOnline = () => {
      // Confirm with a real server ping when browser fires online event
      verifyConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setRestoredToast(false);
      setDismissedSyncGate(false);
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

  // When syncFailed changes to false from parent, clear check failed
  useEffect(() => {
    if (!syncFailed) {
      setDismissedSyncGate(false);
      setCheckFailed(false);
    }
  }, [syncFailed]);

  const shouldShowModal = (!isOnline || (syncFailed && !dismissedSyncGate));
  const isHardOffline = !isOnline;

  // Lock body scroll only when modal gate is active
  useEffect(() => {
    if (shouldShowModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldShowModal]);

  return (
    <>
      {/* Toast Notification when Reconnected */}
      {restoredToast && isOnline && !syncFailed && (
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
              <span>Live catalog synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Subtle Top Banner when user chooses to view cached data while sync is failed */}
      {syncFailed && dismissedSyncGate && (
        <div 
          className="fixed top-0 inset-x-0 z-[99990] bg-[#1a1710] border-b border-[#c5a059]/40 py-2.5 px-4 text-center text-xs text-[#f5f5f5] flex items-center justify-center gap-3 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-[#e2be79]">
            <CloudOff className="w-4 h-4 shrink-0" />
            <span className="font-medium tracking-wide">Live sync paused. Displaying cached view.</span>
          </div>
          <button
            type="button"
            onClick={verifyConnectivity}
            disabled={isChecking || isRetrying}
            className="px-3 py-1 rounded bg-[#c5a059] hover:bg-[#d4af66] text-[#0b0b0c] font-semibold text-[11px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${(isChecking || isRetrying) ? 'animate-spin' : ''}`} />
            <span>{(isChecking || isRetrying) ? 'Syncing…' : 'Reconnect'}</span>
          </button>
        </div>
      )}

      {/* Fullscreen Luxury Internet Connection Gate Overlay */}
      {shouldShowModal && (
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
            
            {/* ELVANY Monogram Header */}
            <div className="mb-6">
              <div className="inline-block tracking-[0.35em] text-[11px] uppercase font-semibold text-[#c5a059] mb-1">
                ELVANY
              </div>
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#c5a059]/60 to-transparent mx-auto" />
            </div>

            {/* Glowing Disconnected Icon */}
            <div className="relative mx-auto mb-6 w-20 h-20 rounded-full bg-[#181920] border border-[#c5a059]/25 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#c5a059]" />
              {isHardOffline ? (
                <WifiOff className="w-9 h-9 text-[#e2be79] relative z-10" />
              ) : (
                <CloudOff className="w-9 h-9 text-[#e2be79] relative z-10" />
              )}
            </div>

            {/* Title */}
            <h2 
              id="offline-title" 
              className="text-2xl sm:text-3xl font-serif tracking-wide text-[#f5f5f5] mb-3"
              style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif" }}
            >
              {isHardOffline ? 'Network Connection Required' : 'Internet Connection Required'}
            </h2>

            {/* Disconnected Status Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {isHardOffline ? 'Offline Mode Detected' : 'Unable to Fetch Fresh Data'}
            </div>

            {/* Description */}
            <p id="offline-desc" className="text-sm sm:text-base text-[#a3a6ad] leading-relaxed mb-6">
              {isHardOffline 
                ? 'To guarantee real-time inventory precision, live pricing, exclusive offers, and secure concierge checkout, ELVANY requires an active internet connection.' 
                : 'ELVANY was unable to retrieve the latest atelier drops, live privilege offers, and real-time inventory. Please check your internet connection to continue.'}
            </p>

            {/* Reconnection Failure Alert */}
            {checkFailed && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-500/25 flex items-center justify-center gap-2 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Unable to reach server. Please check your Wi-Fi or mobile data connection.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                id="btn-retry-network"
                onClick={verifyConnectivity}
                disabled={isChecking || isRetrying}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e47] hover:from-[#d4af66] hover:to-[#c5a059] text-[#0b0b0c] font-medium text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_25px_rgba(197,160,89,0.45)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
              >
                <RefreshCw className={`w-4 h-4 ${(isChecking || isRetrying) ? 'animate-spin' : ''}`} />
                <span>{(isChecking || isRetrying) ? 'Verifying Network…' : 'Reconnect & Retry'}</span>
              </button>

              {/* Optional dismiss button for cached view if only sync failed but not hard offline */}
              {!isHardOffline && syncFailed && (
                <button
                  type="button"
                  onClick={() => setDismissedSyncGate(true)}
                  className="w-full py-2.5 text-xs text-[#a3a6ad] hover:text-[#f5f5f5] transition-colors uppercase tracking-wider cursor-pointer underline decoration-dotted underline-offset-4"
                >
                  Continue Browsing Cached View
                </button>
              )}

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
