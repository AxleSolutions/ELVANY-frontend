import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PopupAdModal = ({ 
  popupAdSettings,
  isLoading = false,
  onNavigateToCollection,
  onNavigateToConcierge 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until database sync is complete before deciding to show
    if (isLoading || !popupAdSettings || !popupAdSettings.enabled || !popupAdSettings.imageUrl) {
      setIsOpen(false);
      return;
    }

    // Check if once-per-session is enabled and already viewed
    if (popupAdSettings.showOncePerSession) {
      const alreadySeen = sessionStorage.getItem('elvany_popup_ad_dismissed');
      if (alreadySeen === 'true') {
        return;
      }
    }

    // Smooth entrance timer once verified data is available
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [popupAdSettings, isLoading]);


  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    if (popupAdSettings?.showOncePerSession) {
      sessionStorage.setItem('elvany_popup_ad_dismissed', 'true');
    }
  };

  const handleImageClick = () => {
    handleClose();
    if (!popupAdSettings?.targetUrl) return;

    const url = popupAdSettings.targetUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url === '/collection' || url === 'collection') {
      if (onNavigateToCollection) onNavigateToCollection('all');
      else navigate('/collection');
    } else if (url === '/concierge' || url === 'concierge') {
      if (onNavigateToConcierge) onNavigateToConcierge();
      else navigate('/concierge');
    } else {
      navigate(url);
    }
  };

  if (!isOpen || !popupAdSettings?.imageUrl) return null;

  return (
    <div 
      className="popup-ad-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="popup-ad-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Floating Luxury Close Button */}
        <button 
          type="button"
          className="popup-ad-close-btn"
          onClick={handleClose}
          aria-label="Close advertisement"
        >
          <X size={18} />
        </button>

        {/* Pure Image Banner Container (Dynamic Border Hugging) */}
        <div 
          className="popup-ad-image-wrap"
          onClick={handleImageClick}
          style={{ 
            cursor: popupAdSettings.targetUrl ? 'pointer' : 'default'
          }}
        >
          <img 
            src={popupAdSettings.imageUrl} 
            alt={popupAdSettings.altText || 'ELVANY Seasonal Advertisement'} 
            className="popup-ad-img"
            loading="eager"
          />
        </div>
      </div>
    </div>



  );
};
