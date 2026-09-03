import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  Eye, 
  RotateCcw, 
  Upload, 
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Smartphone,
  Monitor,
  Loader2,
  Cloud
} from 'lucide-react';
import { uploadPopupAdImage, getPopupAdSettings, savePopupAdSettings } from '../services/dbService';

const PRESET_IMAGES = [
  { label: 'Brutalist Campaign', path: '/images/editorial_brutalist.webp' },
  { label: 'Heavyweight Sea Island', path: '/images/pillar_heavyweight.webp' },
  { label: 'Florence Tailoring', path: '/images/pillar_tailoring.webp' },
  { label: 'Onyx Silk Cotton', path: '/images/pillar_silk.webp' },
  { label: 'Editorial Model', path: '/images/hero_model.webp' },
  { label: 'Oversized Silhouette', path: '/images/tshirt_oversized.webp' }
];

export const PopupAdManager = ({ 
  popupAdSettings, 
  onSavePopupAdSettings 
}) => {
  const [formData, setFormData] = useState({
    enabled: popupAdSettings?.enabled ?? true,
    imageUrl: popupAdSettings?.imageUrl || '/images/editorial_brutalist.webp',
    targetUrl: popupAdSettings?.targetUrl || '/collection',
    altText: popupAdSettings?.altText || 'ELVANY Seasonal Advertisement',
    showOncePerSession: popupAdSettings?.showOncePerSession ?? true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Hydrate directly from Database on mount
  useEffect(() => {
    async function loadLatestFromDatabase() {
      try {
        const dbData = await getPopupAdSettings();
        if (dbData) {
          setFormData({
            enabled: dbData.enabled ?? true,
            imageUrl: dbData.imageUrl || '/images/editorial_brutalist.webp',
            targetUrl: dbData.targetUrl || '/collection',
            altText: dbData.altText || 'ELVANY Seasonal Advertisement',
            showOncePerSession: dbData.showOncePerSession ?? true
          });
        }
      } catch (e) {
        console.warn('Load popup ad settings error:', e);
      }
    }
    loadLatestFromDatabase();
  }, []);

  useEffect(() => {
    if (popupAdSettings) {
      setFormData(prev => ({
        ...prev,
        enabled: popupAdSettings.enabled ?? prev.enabled,
        imageUrl: popupAdSettings.imageUrl || prev.imageUrl,
        targetUrl: popupAdSettings.targetUrl || prev.targetUrl,
        altText: popupAdSettings.altText || prev.altText,
        showOncePerSession: popupAdSettings.showOncePerSession ?? prev.showOncePerSession
      }));
    }
  }, [popupAdSettings]);

  const handleToggleStatus = () => {
    setFormData(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handlePresetSelect = (path) => {
    setFormData(prev => ({ ...prev, imageUrl: path }));
    setUploadStatusMsg('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately display the selected file in the preview canvas
    const instantPreview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, imageUrl: instantPreview }));

    setIsUploading(true);
    setUploadStatusMsg('Uploading and processing banner visual...');

    try {
      const result = await uploadPopupAdImage(file);
      const finalUrl = result?.secure_url || instantPreview;
      const updated = {
        ...formData,
        imageUrl: finalUrl
      };
      setFormData(updated);
      
      // Auto-save to Supabase and database immediately
      await savePopupAdSettings(updated);
      if (onSavePopupAdSettings) {
        onSavePopupAdSettings(updated);
      }
      sessionStorage.removeItem('elvany_popup_ad_dismissed');
      try {
        localStorage.setItem('elvany_popup_ad_settings', JSON.stringify(updated));
      } catch {}
      window.dispatchEvent(new CustomEvent('elvany_popup_ad_updated', { detail: updated }));

      setUploadStatusMsg('✓ Visual Uploaded & Published to Atelier!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Ad image upload error:', err);
      // Fallback to local FileReader Data URL
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const updated = {
            ...formData,
            imageUrl: uploadEvent.target.result
          };
          setFormData(updated);
          await savePopupAdSettings(updated);
          if (onSavePopupAdSettings) {
            onSavePopupAdSettings(updated);
          }
          sessionStorage.removeItem('elvany_popup_ad_dismissed');
          try {
            localStorage.setItem('elvany_popup_ad_settings', JSON.stringify(updated));
          } catch {}
          window.dispatchEvent(new CustomEvent('elvany_popup_ad_updated', { detail: updated }));
          setUploadStatusMsg('✓ Visual applied & saved!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatusMsg(''), 5000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await savePopupAdSettings(formData);
      if (onSavePopupAdSettings) {
        onSavePopupAdSettings(saved || formData);
      }
      // Reset session dismiss flag so storefront immediately displays the new ad
      sessionStorage.removeItem('elvany_popup_ad_dismissed');
      window.dispatchEvent(new CustomEvent('elvany_popup_ad_updated', { detail: saved || formData }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Save popup ad database error:', err);
    } finally {
      setIsSaving(false);
    }
  };


  const handleResetSession = () => {
    sessionStorage.removeItem('elvany_popup_ad_dismissed');
    window.open('/', '_blank');
  };



  return (
    <div className="admin-content-inner">
      {/* Page Header */}
      <div className="admin-header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="admin-section-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Megaphone size={13} color="var(--gold-bright)" />
            <span>STOREFRONT CAMPAIGNS</span>
          </div>
          <h1 className="admin-page-title">Entrance Popup Advertisement</h1>
          <p className="admin-page-desc">
            Configure the full-screen visual advertisement shown to visitors upon arriving at the ELVANY Home page.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button 
            type="button" 
            className="admin-btn-secondary"
            onClick={handleResetSession}
            title="Reset test session to preview ad again on storefront"
          >
            <RotateCcw size={14} />
            <span>RESET PREVIEW SESSION</span>
          </button>

          <button 
            type="button" 
            className="admin-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>SAVING TO DATABASE...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check size={16} />
                <span>SAVED & PUBLISHED</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>SAVE & PUBLISH AD</span>
              </>
            )}
          </button>

        </div>
      </div>

      {savedSuccess && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          padding: '0.9rem 1.4rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontSize: '0.86rem'
        }}>
          <Check size={18} />
          <span>Popup advertisement settings successfully updated and synchronized with the storefront!</span>
        </div>
      )}

      {/* Main Grid: Settings on Left, Live Device Simulation on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '2rem' }}>
        
        {/* Left Column: Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          
          {/* 1. Master Enable/Disable Card */}
          <div className="admin-card" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '0 0 0.3rem 0', fontWeight: 600 }}>
                  Popup Advertisement Status
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-light-muted)', margin: 0 }}>
                  When active, visitors landing on the Home page will see your visual advertisement banner.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleStatus}
                style={{
                  backgroundColor: formData.enabled ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.1)',
                  color: formData.enabled ? '#000000' : 'var(--text-light-muted)',
                  border: formData.enabled ? '1px solid var(--gold-bright)' : '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: formData.enabled ? '#000000' : 'rgba(255, 255, 255, 0.4)'
                }} />
                <span>{formData.enabled ? 'ACTIVE ON HOME' : 'DISABLED'}</span>
              </button>
            </div>
          </div>

          {/* 2. Image Selection & Upload Card */}
          <div className="admin-card" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <ImageIcon size={16} color="var(--gold-bright)" />
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                Advertisement Visual (Pure Image)
              </h3>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light-secondary)', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                IMAGE URL OR RELATIVE PATH
              </label>
              <input 
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="e.g. /images/editorial_brutalist.webp or https://..."
                className="admin-input"
                style={{ width: '100%' }}
              />
            {formData.imageUrl && formData.imageUrl.includes('cloudinary') && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#60a5fa', marginTop: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3px 8px', borderRadius: '2px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Cloud size={12} />
                <span>Hosted on Cloudinary Global CDN</span>
              </div>
            )}
          </div>

          {/* Custom Upload to Cloudinary */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light-secondary)', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
              OR UPLOAD NEW BANNER ARTWORK (DIRECT TO CLOUDINARY)
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.4rem',
                  backgroundColor: isUploading ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed var(--gold-border)',
                  borderRadius: '2px',
                  color: 'var(--gold-bright)',
                  cursor: isUploading ? 'wait' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={15} className="spin-animation" />
                    <span>UPLOADING TO CLOUDINARY...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>SELECT IMAGE FILE FROM COMPUTER</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  disabled={isUploading}
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>

              {uploadStatusMsg && (
                <span style={{ fontSize: '0.78rem', color: uploadStatusMsg.includes('✓') ? '#4ade80' : 'var(--gold-bright)', fontWeight: 500 }}>
                  {uploadStatusMsg}
                </span>
              )}
            </div>
          </div>


            {/* Atelier Visual Gallery Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light-secondary)', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
                QUICK SELECTION FROM ATELIER ARCHIVE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                {PRESET_IMAGES.map((preset, idx) => {
                  const isSelected = formData.imageUrl === preset.path;

                  return (
                    <div 
                      key={idx}
                      onClick={() => handlePresetSelect(preset.path)}
                      style={{
                        position: 'relative',
                        aspectRatio: '4/5',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--gold-bright)' : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <img 
                        src={preset.path} 
                        alt={preset.label} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '6px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                        fontSize: '0.68rem',
                        color: isSelected ? 'var(--gold-bright)' : '#ffffff',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        {preset.label}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'var(--gold-bright)',
                          color: '#000000',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Link & Behavior Settings */}
          <div className="admin-card" style={{ padding: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <LinkIcon size={16} color="var(--gold-bright)" />
              <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                Click Destination & Visitor Frequency
              </h3>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light-secondary)', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                ON-CLICK REDIRECT DESTINATION (OPTIONAL)
              </label>
              <input 
                type="text"
                value={formData.targetUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                placeholder="e.g. /collection or /concierge or external URL"
                className="admin-input"
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', display: 'block', marginTop: '4px' }}>
                When the client clicks the image, they will be smoothly redirected to this destination.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-light-secondary)', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
                DISPLAY FREQUENCY
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontSize: '0.84rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="frequency" 
                    checked={formData.showOncePerSession === true}
                    onChange={() => setFormData(prev => ({ ...prev, showOncePerSession: true }))}
                    style={{ accentColor: 'var(--gold-bright)' }}
                  />
                  <span>Show once per browsing session (Recommended luxury experience)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontSize: '0.84rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="frequency" 
                    checked={formData.showOncePerSession === false}
                    onChange={() => setFormData(prev => ({ ...prev, showOncePerSession: false }))}
                    style={{ accentColor: 'var(--gold-bright)' }}
                  />
                  <span>Show on every arrival to the Home page</span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Live Interactive Simulation Preview */}
        <div>
          <div className="admin-card" style={{ padding: '1.6rem', position: 'sticky', top: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} color="var(--gold-bright)" />
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                  Live Storefront Preview
                </h3>
              </div>

              {/* Device Selector */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    background: previewDevice === 'desktop' ? 'var(--gold-bright)' : 'none',
                    color: previewDevice === 'desktop' ? '#000000' : 'var(--text-light-muted)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  <Monitor size={13} />
                  <span>Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    background: previewDevice === 'mobile' ? 'var(--gold-bright)' : 'none',
                    color: previewDevice === 'mobile' ? '#000000' : 'var(--text-light-muted)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                >
                  <Smartphone size={13} />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Simulation Canvas */}
            <div 
              style={{
                backgroundColor: '#050607',
                border: '1px solid var(--border-dark)',
                borderRadius: '4px',
                padding: previewDevice === 'mobile' ? '2.5rem 1rem' : '2.5rem',
                minHeight: '440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Fake Background Homepage Elements */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.15,
                filter: 'blur(4px)',
                backgroundImage: 'url(/images/hero_model.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                pointerEvents: 'none'
              }} />

              {formData.enabled ? (
                <div style={{
                  position: 'relative',
                  width: previewDevice === 'mobile' ? '240px' : '340px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                  border: '1px solid var(--gold-border)',
                  animation: 'sloganFadeIn 0.3s ease forwards'
                }}>
                  {/* Fake Close Button */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    zIndex: 10
                  }}>
                    ✕
                  </div>

                  {/* Image */}
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: previewDevice === 'mobile' ? '320px' : '450px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />

                  {formData.targetUrl && (
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(11, 11, 12, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontSize: '0.64rem',
                      color: 'var(--gold-bright)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      justifyContent: 'center'
                    }}>
                      <ExternalLink size={10} />
                      <span>CLICK REDIRECTS TO: {formData.targetUrl}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-light-muted)', position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔕</div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    Advertisement is Currently Inactive
                  </div>
                  <p style={{ fontSize: '0.76rem', maxWidth: '240px', margin: '0 auto' }}>
                    Toggle status to ACTIVE to enable this popup on the public storefront.
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.74rem', color: 'var(--text-light-muted)', textAlign: 'center' }}>
              ✦ Visual appears immediately upon landing with smooth fade and luxury blur.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
