import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Ruler, 
  Upload, 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Check, 
  ShoppingBag, 
  ArrowLeft, 
  Move, 
  Grid, 
  ArrowRight,
  ShieldCheck, 
  Info,
  Layers,
  Palette,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { SizeChartModal } from './SizeChartModal';
import { saveBespokeDesign } from '../services/dbService';
import { generateBespokeMockupCollage, generateBespokeAllAngles, downloadImageFile } from '../lib/bespokeMockupGenerator';

// Clear, customer-friendly fabric descriptions
const FABRICS = [
  {
    id: 'supima_240',
    name: 'Heavyweight Cotton (240 GSM)',
    badge: 'POPULAR CHOICE',
    shortDesc: 'Thick, premium structured cotton. Stays in shape and does not shrink.',
    basePrice: 18500
  },
  {
    id: 'french_terry_280',
    name: 'Luxury French Terry (280 GSM)',
    badge: 'EXTRA HEAVYWEIGHT',
    shortDesc: 'Ultra-soft, heavy luxury knit with maximum comfort and structured drape.',
    basePrice: 22500
  },
  {
    id: 'giza_200',
    name: 'Soft Lightweight Cotton (200 GSM)',
    badge: 'COOL & BREATHABLE',
    shortDesc: 'Silky smooth and breathable. Ideal for everyday warm weather wear.',
    basePrice: 16500
  }
];

// Simple, clear fits
const CUTS = [
  {
    id: 'tailored',
    name: 'Classic Regular Fit',
    desc: 'Standard clean silhouette that fits true to size.'
  },
  {
    id: 'raglan',
    name: 'Two-Tone Contrast Sleeve',
    desc: 'Sporty cut with customizable sleeve color.'
  }
];

// Pure rich solid colorways
const COLORWAYS = [
  { name: 'Pure Black', hex: '#0a0a0b', contrastHex: '#ffffff' },
  { name: 'Pure White', hex: '#ffffff', contrastHex: '#0a0a0b' },
  { name: 'Cream / Beige', hex: '#e8dfd1', contrastHex: '#2b2926' },
  { name: 'Navy Blue', hex: '#0d1b3e', contrastHex: '#ffffff' },
  { name: 'Coffee Brown', hex: '#3d2319', contrastHex: '#ffffff' },
  { name: 'Olive Green', hex: '#2c3d2b', contrastHex: '#ffffff' },
  { name: 'Wine Red', hex: '#5a0d1e', contrastHex: '#ffffff' },
  { name: 'Charcoal Grey', hex: '#28292d', contrastHex: '#ffffff' }
];

// Simple, clear print placement spots
const PLACEMENT_ZONES = [
  { id: 'front', label: 'Front (Center)', view: 'front', defaultScale: 38, maxScale: 55, defaultY: 46, defaultX: 50 },
  { id: 'back', label: 'Back (Center)', view: 'back', defaultScale: 40, maxScale: 58, defaultY: 45, defaultX: 50 },
  { id: 'left_chest', label: 'Left Chest (Logo)', view: 'front', defaultScale: 16, maxScale: 25, defaultY: 34, defaultX: 63 },
  { id: 'right_chest', label: 'Right Chest (Logo)', view: 'front', defaultScale: 16, maxScale: 25, defaultY: 34, defaultX: 37 },
  { id: 'left_sleeve', label: 'Left Sleeve', view: 'left', defaultScale: 15, maxScale: 22, defaultY: 38, defaultX: 50 },
  { id: 'right_sleeve', label: 'Right Sleeve', view: 'right', defaultScale: 15, maxScale: 22, defaultY: 38, defaultX: 50 },
  { id: 'nape', label: 'Back Neck (Small)', view: 'back', defaultScale: 14, maxScale: 20, defaultY: 25, defaultX: 50 }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export const CustomLabPage = ({ onAddToCart, onBackToHome, onNavigateToCollection }) => {
  // Step Navigation: 1 (Style) | 2 (Artwork) | 3 (Review & Order)
  const [activeStep, setActiveStep] = useState(1);
  const topRef = useRef(null);

  // Automatically scroll to the top of the next step whenever activeStep changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeStep]);
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [selectedCut, setSelectedCut] = useState(CUTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORWAYS[0]);
  const [selectedSleeveColor, setSelectedSleeveColor] = useState(COLORWAYS[1]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [qty, setQty] = useState(1);
  const [isTailorTuningOn, setIsTailorTuningOn] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  // 2. Interactive Canvas
  const [currentView, setCurrentView] = useState('front'); // 'front' | 'back' | 'left' | 'right'
  const [activeZoneKey, setActiveZoneKey] = useState('front');
  const [backdropTheme, setBackdropTheme] = useState('studio'); // 'studio' | 'light' | 'dark'
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGridOn, setIsGridOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // 3. Artwork Store
  const [artworks, setArtworks] = useState({});

  const stageRef = useRef(null);

  // Select print zone and automatically rotate preview to that view
  const handleSelectZone = (zoneId) => {
    setActiveZoneKey(zoneId);
    const targetZone = PLACEMENT_ZONES.find(z => z.id === zoneId);
    if (targetZone && targetZone.view !== currentView) {
      setCurrentView(targetZone.view);
    }
  };

  // Upload image
  const handleFileUpload = (e, zoneId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const zone = PLACEMENT_ZONES.find(z => z.id === zoneId) || PLACEMENT_ZONES[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const isHighRes = img.width >= 1000 || img.height >= 1000;
        setArtworks(prev => ({
          ...prev,
          [zoneId]: {
            file,
            dataUrl: event.target.result,
            width: img.width,
            height: img.height,
            aspect: img.width / img.height,
            x: prev[zoneId]?.x ?? zone.defaultX,
            y: prev[zoneId]?.y ?? zone.defaultY,
            scale: prev[zoneId]?.scale ?? zone.defaultScale,
            rotation: prev[zoneId]?.rotation ?? 0,
            isHighRes
          }
        }));
        handleSelectZone(zoneId);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove artwork
  const handleRemoveArtwork = (zoneId) => {
    setArtworks(prev => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  };

  // Drag on Shirt Interactive Handler
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const handlePointerDown = (e, zoneId) => {
    e.stopPropagation();
    setActiveZoneKey(zoneId);
    isDraggingRef.current = true;
    const currentArt = artworks[zoneId];
    if (!currentArt) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentArt.x,
      startY: currentArt.y
    };

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      const newX = Math.max(20, Math.min(80, dragStartRef.current.startX + deltaX));
      const newY = Math.max(15, Math.min(82, dragStartRef.current.startY + deltaY));

      setArtworks(prev => ({
        ...prev,
        [zoneId]: {
          ...prev[zoneId],
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10
        }
      }));
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Center artwork
  const handleCenterArt = (zoneId) => {
    const zone = PLACEMENT_ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    setArtworks(prev => {
      if (!prev[zoneId]) return prev;
      return {
        ...prev,
        [zoneId]: {
          ...prev[zoneId],
          x: zone.defaultX,
          y: zone.defaultY,
          rotation: 0
        }
      };
    });
  };

  // Rotate artwork
  const handleRotateArt = (zoneId) => {
    setArtworks(prev => {
      if (!prev[zoneId]) return prev;
      return {
        ...prev,
        [zoneId]: {
          ...prev[zoneId],
          rotation: (prev[zoneId].rotation + 15) % 360
        }
      };
    });
  };

  // Scale slider
  const handleScaleChange = (zoneId, newScale) => {
    setArtworks(prev => {
      if (!prev[zoneId]) return prev;
      return {
        ...prev,
        [zoneId]: {
          ...prev[zoneId],
          scale: Number(newScale)
        }
      };
    });
  };

  // Transparent pricing calculation
  const totalArtworksCount = Object.keys(artworks).length;
  const extraPrintsCount = Math.max(0, totalArtworksCount - 1); // 1st print is included free
  const basePricePerUnit = selectedFabric.basePrice;
  const extraPrintsPrice = extraPrintsCount * 1500;
  const unitPrice = basePricePerUnit + extraPrintsPrice;
  const totalPrice = unitPrice * qty;

  // Add to Bag & Save to Backend Database with rendered 4-Angle T-Shirt Mockups
  const handleAddCustomToBag = async () => {
    const activePlacementsList = Object.keys(artworks).map(key => {
      const z = PLACEMENT_ZONES.find(p => p.id === key);
      return z ? z.label : key;
    });

    const bespokeCode = `BL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 1. Render actual customized T-shirt photos across all 4 angles (Front, Back, Left Sleeve, Right Sleeve) + Collage
    let renderedAngles = null;
    try {
      renderedAngles = await generateBespokeAllAngles({
        artworks,
        colorHex: selectedColor.hex,
        colorName: selectedColor.name,
        cutId: selectedCut.id,
        cutName: selectedCut.name,
        fabricName: selectedFabric.name.split('(')[0].trim(),
        sleeveColorHex: selectedCut.id === 'raglan' ? selectedSleeveColor.hex : null,
        size: selectedSize
      });
    } catch (mockErr) {
      console.warn('Mockup generation notice:', mockErr);
    }

    const finalCollage = renderedAngles?.collage || artworks[activeZoneKey]?.dataUrl || '/images/hero_tshirt.webp';
    const views = {
      front: renderedAngles?.front || finalCollage,
      back: renderedAngles?.back || finalCollage,
      left: renderedAngles?.left || finalCollage,
      right: renderedAngles?.right || finalCollage
    };

    const bespokePayload = {
      designCode: bespokeCode,
      fabricName: selectedFabric.name,
      fabricGsm: selectedFabric.name.match(/\((.*?)\)/)?.[1] || '240 GSM',
      cutName: selectedCut.name,
      cutId: selectedCut.id,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      sleeveColorName: selectedCut.id === 'raglan' ? selectedSleeveColor.name : null,
      sleeveColorHex: selectedCut.id === 'raglan' ? selectedSleeveColor.hex : null,
      size: selectedSize,
      quantity: qty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      artworks: artworks,
      notes: customNotes,
      tailorTuning: isTailorTuningOn,
      previewThumbnail: finalCollage,
      blueprintImage: finalCollage,
      views,
      status: 'Saved / In Shopping Bag'
    };

    // Asynchronously register in backend & database
    try {
      saveBespokeDesign(bespokePayload);
    } catch (err) {
      console.warn('Bespoke save warning:', err);
    }

    const customBespokeItem = {
      id: `bespoke-${Date.now()}`,
      designCode: bespokeCode,
      name: `Custom ${selectedCut.name} (${selectedFabric.name.split('(')[0].trim()})`,
      tagline: `Bespoke #${bespokeCode} in ${selectedColor.name}`,
      priceLKR: unitPrice,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      fabric: selectedFabric.name,
      cut: selectedCut.name,
      isBespokeCustom: true,
      customPlacements: activePlacementsList,
      customArtworkThumb: finalCollage,
      customNotes,
      isTailorTuningOn,
      image: views.front || finalCollage,
      blueprintImage: finalCollage,
      previewThumbnail: finalCollage,
      views: views,
      artworks: artworks || {}
    };

    if (onAddToCart) {
      onAddToCart(customBespokeItem, selectedSize, qty);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    }
  };

  // 1-Click Download High-Res T-Shirt Photo
  const [isDownloadingMockup, setIsDownloadingMockup] = useState(false);
  const handleDownloadMockup = async () => {
    setIsDownloadingMockup(true);
    try {
      const dataUrl = await generateBespokeMockupCollage({
        artworks,
        colorHex: selectedColor.hex,
        colorName: selectedColor.name,
        cutId: selectedCut.id,
        cutName: selectedCut.name,
        fabricName: selectedFabric.name.split('(')[0].trim(),
        sleeveColorHex: selectedCut.id === 'raglan' ? selectedSleeveColor.hex : null,
        size: selectedSize
      });
      if (dataUrl) {
        await downloadImageFile(dataUrl, `elvany_custom_${selectedCut.id}_${selectedColor.name.toLowerCase().replace(/\s+/g, '_')}.png`);
      }
    } catch (err) {
      console.warn('Download mockup notice:', err);
    } finally {
      setIsDownloadingMockup(false);
    }
  };

  // Fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div ref={topRef} className={`custom-lab-page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Top Breadcrumb Bar */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
          <button 
            className="search-back-btn"
            onClick={onBackToHome}
            style={{ marginBottom: 0 }}
          >
            <ArrowLeft size={14} />
            <span>HOME</span>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ color: 'var(--gold-bright)', letterSpacing: '0.1em', fontWeight: 600 }}>
            BESPOKE LAB
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="container" style={{ paddingBottom: '5rem' }}>
        
        {/* Title Header & Live Summary Row (Aligned Together) */}
        <div className="cl-hero-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
          
          {/* Left: Design Your Own Tee Title & Subtitle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
              <Sparkles size={13} color="var(--gold-bright)" />
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-bright)', fontWeight: 700 }}>
                DESIGN YOUR OWN TEE
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', margin: '0 0 0.35rem 0', fontWeight: 400, color: '#ffffff' }}>
              Bespoke Custom Studio
            </h1>
            <p className="cl-hero-desc" style={{ fontSize: '0.82rem', color: 'var(--text-light-secondary)', margin: 0, maxWidth: '580px', lineHeight: 1.45 }}>
              Choose your shirt fabric, pick your fit & color, and upload your design to any spot on the garment.
            </p>
          </div>

          {/* Right: Live Estimated Size & Price Summary + Size Guide (Aligned on the Same Row) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '4px' }}>
            <div className="cl-top-summary-tag">
              <span className="cl-top-tag-item">
                SIZE: <strong style={{ color: 'var(--gold-bright)' }}>{selectedSize}</strong>
              </span>
              <span className="cl-top-divider">•</span>
              <span className="cl-top-tag-item">
                EST. TOTAL: <strong style={{ color: '#ffffff' }}>LKR {totalPrice.toLocaleString()}</strong>
                {qty > 1 && <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', marginLeft: '3px' }}>({qty} pcs)</span>}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="pdp-size-guide-btn"
              style={{ padding: '6px 12px' }}
            >
              <Ruler size={13} />
              <span>SIZE GUIDE</span>
            </button>
          </div>

        </div>

        <div className="cl-studio-grid">
          
          {/* ================= LEFT COLUMN: CLEAN 3-STEP CUSTOMIZER ================= */}
          <div className="cl-controls-col">
            
            {/* Step Navigation Tabs */}
            <div className="cl-stepper-bar">
              <button 
                type="button"
                className={`cl-stepper-btn ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <span className="cl-step-num">{activeStep > 1 ? '✓' : '1'}</span>
                <span className="cl-step-text-desktop">1. Shirt Style</span>
                <span className="cl-step-text-mobile">1. Style</span>
              </button>

              <button 
                type="button"
                className={`cl-stepper-btn ${activeStep === 2 ? 'active' : ''} ${totalArtworksCount > 0 ? 'completed' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <span className="cl-step-num">{totalArtworksCount > 0 ? '✓' : '2'}</span>
                <span className="cl-step-text-desktop">2. Add Artwork {totalArtworksCount > 0 ? `(${totalArtworksCount})` : ''}</span>
                <span className="cl-step-text-mobile">2. Art {totalArtworksCount > 0 ? `(${totalArtworksCount})` : ''}</span>
              </button>

              <button 
                type="button"
                className={`cl-stepper-btn ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <span className="cl-step-num">3</span>
                <span className="cl-step-text-desktop">3. Review & Order</span>
                <span className="cl-step-text-mobile">3. Review</span>
              </button>
            </div>

            {/* STEP 1: SHIRT STYLE (Fabric, Cut, Color, Size) */}
            {activeStep === 1 && (
              <div className="cl-step-panel">
                
                {/* 1. Fabric Selection */}
                <div className="cl-section-box">
                  <label className="cl-section-label">1. CHOOSE FABRIC</label>
                  <div className="cl-fabric-list">
                    {FABRICS.map(fabric => {
                      const isSelected = selectedFabric.id === fabric.id;
                      return (
                        <div 
                          key={fabric.id}
                          className={`cl-clean-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedFabric(fabric)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--gold-bright)' : '#ffffff' }}>
                              {fabric.name}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-bright)' }}>
                              LKR {fabric.basePrice.toLocaleString()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-light-muted)', margin: 0 }}>
                            {fabric.shortDesc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Fit Selection */}
                <div className="cl-section-box">
                  <label className="cl-section-label">2. CHOOSE FIT</label>
                  <div className="cl-cut-pills">
                    {CUTS.map(cut => {
                      const isSelected = selectedCut.id === cut.id;
                      return (
                        <button
                          key={cut.id}
                          type="button"
                          className={`cl-cut-pill ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedCut(cut)}
                        >
                          <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: '2px' }}>{cut.name}</strong>
                          <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{cut.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Color Selection */}
                <div className="cl-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="cl-section-label">3. CHOOSE COLOR</label>
                    <span style={{ fontSize: '0.76rem', color: 'var(--gold-bright)', fontWeight: 600 }}>{selectedColor.name}</span>
                  </div>

                  <div className="cl-color-dots-row">
                    {COLORWAYS.map(col => {
                      const isSelected = selectedColor.name === col.name;
                      return (
                        <button
                          key={col.name}
                          type="button"
                          className={`cl-color-dot ${isSelected ? 'active' : ''}`}
                          style={{ backgroundColor: col.hex }}
                          onClick={() => setSelectedColor(col)}
                          title={col.name}
                        />
                      );
                    })}
                  </div>

                  {/* Contrast sleeve for Raglan */}
                  {selectedCut.id === 'raglan' && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', fontWeight: 600 }}>SLEEVE CONTRAST COLOR</span>
                        <span style={{ fontSize: '0.74rem', color: '#ffffff' }}>{selectedSleeveColor.name}</span>
                      </div>
                      <div className="cl-color-dots-row">
                        {COLORWAYS.map(col => (
                          <button
                            key={`sleeve-${col.name}`}
                            type="button"
                            className={`cl-color-dot ${selectedSleeveColor.name === col.name ? 'active' : ''}`}
                            style={{ backgroundColor: col.hex }}
                            onClick={() => setSelectedSleeveColor(col)}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Size Selection */}
                <div className="cl-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="cl-section-label">4. CHOOSE SIZE</label>
                    <button 
                      type="button" 
                      onClick={() => setIsSizeChartOpen(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--gold-bright)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Ruler size={11} />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="cl-sizes-clean-row">
                    {SIZES.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        className={`cl-size-btn-clean ${selectedSize === sz ? 'active' : ''}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 1 Live Cost & Next Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', display: 'block' }}>ESTIMATED SHIRT PRICE</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--gold-bright)' }}>LKR {unitPrice.toLocaleString()}</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981' }}>✓ 1st Print Included Free</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn-primary-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.82rem', marginTop: '0.5rem' }}
                >
                  <span>NEXT: ADD YOUR ARTWORK</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* STEP 2: ADD ARTWORK */}
            {activeStep === 2 && (
              <div className="cl-step-panel">
                <div className="cl-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label className="cl-section-label">WHERE DO YOU WANT YOUR DESIGN?</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)' }}>1st print is free</span>
                  </div>

                  {/* Print Spot Pills */}
                  <div className="cl-spots-grid">
                    {PLACEMENT_ZONES.map(zone => {
                      const hasArt = !!artworks[zone.id];
                      const isCurrent = activeZoneKey === zone.id;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          className={`cl-spot-pill ${isCurrent ? 'active' : ''} ${hasArt ? 'has-art' : ''}`}
                          onClick={() => handleSelectZone(zone.id)}
                        >
                          <span>{zone.label}</span>
                          {hasArt && <Check size={12} color="var(--gold-bright)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Spot Upload & Editing Card */}
                {(() => {
                  const currentZone = PLACEMENT_ZONES.find(z => z.id === activeZoneKey) || PLACEMENT_ZONES[0];
                  const activeArt = artworks[activeZoneKey];

                  return (
                    <div className="cl-section-box" style={{ border: '1px solid var(--gold-border)', background: 'transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.84rem', color: 'var(--gold-bright)', display: 'block' }}>
                            Editing: {currentZone.label}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                            Viewing on shirt: <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{currentZone.view} view</strong>
                          </span>
                        </div>

                        {activeArt && (
                          <button
                            type="button"
                            onClick={() => handleRemoveArtwork(activeZoneKey)}
                            className="cl-delete-btn-clean"
                            title="Remove design from this spot"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {!activeArt ? (
                        <label className="cl-clean-upload-dropzone">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => handleFileUpload(e, activeZoneKey)}
                            style={{ display: 'none' }}
                          />
                          <Upload size={22} color="var(--gold-bright)" style={{ marginBottom: '6px' }} />
                          <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>
                            Tap to upload your image for {currentZone.label}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', display: 'block', marginTop: '2px' }}>
                            PNG with transparent background, webp or WEBP
                          </span>
                        </label>
                      ) : (
                        <div className="cl-clean-editor">
                          {/* Image preview & info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '4px', marginBottom: '0.85rem' }}>
                            <img 
                              src={activeArt.dataUrl} 
                              alt="Custom artwork preview" 
                              style={{ width: '42px', height: '42px', objectFit: 'contain', background: 'transparent', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.15)' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {activeArt.file?.name || 'Your Image'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <ShieldCheck size={11} /> Print Ready
                              </span>
                            </div>

                            <label className="cl-replace-btn-clean">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={(e) => handleFileUpload(e, activeZoneKey)}
                                style={{ display: 'none' }}
                              />
                              <span>Change</span>
                            </label>
                          </div>

                          {/* Size & Position sliders */}
                          <div style={{ marginBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light-muted)', marginBottom: '4px' }}>
                              <span>Print Size</span>
                              <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>{activeArt.scale}%</span>
                            </div>
                            <input
                              type="range"
                              min="8"
                              max={currentZone.maxScale}
                              value={activeArt.scale}
                              onChange={(e) => handleScaleChange(activeZoneKey, e.target.value)}
                              className="cl-slider-input"
                            />
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleCenterArt(activeZoneKey)}
                              className="cl-action-btn-clean"
                            >
                              <Move size={12} />
                              <span>Reset Center</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRotateArt(activeZoneKey)}
                              className="cl-action-btn-clean"
                            >
                              <RotateCw size={12} />
                              <span>Rotate 15°</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Step 2 Live Cost & Next Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', display: 'block' }}>ESTIMATED TOTAL</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--gold-bright)' }}>LKR {totalPrice.toLocaleString()}</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                    {totalArtworksCount === 0 ? 'Blank Garment' : `${totalArtworksCount} Print Spot${totalArtworksCount > 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Step 2 Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="cl-btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Back to Style
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="btn-primary-gold"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    <span>NEXT: REVIEW & ORDER</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & ORDER */}
            {activeStep === 3 && (
              <div className="cl-step-panel">
                
                {/* Summary Card */}
                <div className="cl-section-box">
                  <label className="cl-section-label">YOUR CUSTOM T-SHIRT SUMMARY</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Fabric:</span>
                      <strong style={{ color: '#fff' }}>{selectedFabric.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Fit & Style:</span>
                      <span style={{ color: '#fff' }}>{selectedCut.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Color:</span>
                      <span style={{ color: '#fff' }}>{selectedColor.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Size:</span>
                      <strong style={{ color: 'var(--gold-bright)' }}>{selectedSize}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Prints Added:</span>
                      <span style={{ color: 'var(--gold-bright)' }}>
                        {totalArtworksCount === 0 ? 'No custom prints (Blank Tee)' : `${totalArtworksCount} position${totalArtworksCount > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {/* 4-Angle Interactive Perspective Selector */}
                    <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--gold-bright)', letterSpacing: '0.08em', fontWeight: 700 }}>
                          INSPECT 4 GARMENT ANGLES
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>
                          Click to rotate view
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {['front', 'back', 'left', 'right'].map((vk) => {
                          const isCur = currentView === vk;
                          const count = PLACEMENT_ZONES.filter(z => z.view === vk && !!artworks[z.id]).length;
                          const labelMap = { front: 'FRONT', back: 'BACK', left: 'LEFT SIDE', right: 'RIGHT SIDE' };
                          return (
                            <button
                              key={vk}
                              type="button"
                              onClick={() => setCurrentView(vk)}
                              className={`cl-spot-pill ${isCur ? 'active' : ''}`}
                              style={{ padding: '6px 2px', fontSize: '0.68rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', borderRadius: '3px' }}
                            >
                              <span style={{ fontWeight: 700 }}>{labelMap[vk]}</span>
                              <span style={{ fontSize: '0.62rem', color: count > 0 ? '#10b981' : 'var(--text-light-muted)' }}>
                                {count > 0 ? `${count} print` : 'Clean'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="cl-section-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#fff', display: 'block' }}>Quantity</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>How many shirts would you like?</span>
                    </div>

                    <div className="pdp-qty-selector" style={{ margin: 0 }}>
                      <button 
                        type="button" 
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="pdp-qty-btn"
                        disabled={qty <= 1}
                      >
                        -
                      </button>
                      <span className="pdp-qty-value">{qty}</span>
                      <button 
                        type="button" 
                        onClick={() => setQty(Math.min(50, qty + 1))}
                        className="pdp-qty-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Free Print Fine-Tuning */}
                <div className="cl-section-box" style={{ background: 'transparent', border: '1px solid rgba(197, 160, 89, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.78rem', color: '#fff' }}>Free Print Sizing Adjustment</strong>
                        <span className="cl-free-badge">FREE</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', display: 'block', marginTop: '2px' }}>
                        Our team will make small adjustments to your graphic size so it prints perfectly.
                      </span>
                    </div>
                    <label className="cl-toggle-switch">
                      <input
                        type="checkbox"
                        checked={isTailorTuningOn}
                        onChange={(e) => setIsTailorTuningOn(e.target.checked)}
                      />
                      <span className="cl-toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Customer Notes */}
                <div className="cl-section-box">
                  <label className="cl-section-label">SPECIAL REQUESTS / NOTES (OPTIONAL)</label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Any specific placement instructions, exact dimensions, or notes for our printers..."
                    rows={2}
                    className="cl-notes-textarea"
                  />
                </div>

                {/* Total & Add to Bag */}
                <div className="cl-checkout-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Price per shirt</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-bright)' }}>
                        LKR {unitPrice.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Total ({qty} {qty === 1 ? 'shirt' : 'shirts'})</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                        LKR {totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Info size={12} color="var(--gold-bright)" />
                    <span>Includes complimentary island-wide courier delivery.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="cl-btn-secondary"
                      style={{ flex: '1 1 80px' }}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadMockup}
                      disabled={isDownloadingMockup}
                      className="cl-btn-secondary"
                      style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      title="Download High-Res Customized T-Shirt Photo"
                    >
                      <Download size={15} />
                      <span>{isDownloadingMockup ? 'SAVING...' : 'SAVE PHOTO'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCustomToBag}
                      className="btn-primary-gold"
                      style={{ flex: '2 1 180px', justifyContent: 'center', padding: '1rem' }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} />
                          <span>ADDED TO BAG!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>ADD TO SHOPPING BAG</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE 360° SHIRT PREVIEW ================= */}
          <div className="cl-stage-col">
            <div className="cl-stage-card">
              
              {/* Top View & Lighting Controls Header */}
              <div className="cl-stage-header">
                {/* View Switcher Tabs */}
                <div className="cl-view-switcher">
                  {['front', 'back', 'left', 'right'].map(viewKey => {
                    const isViewActive = currentView === viewKey;
                    const countOnView = PLACEMENT_ZONES.filter(z => z.view === viewKey && !!artworks[z.id]).length;

                    return (
                      <button
                        key={viewKey}
                        type="button"
                        className={`cl-view-tab ${isViewActive ? 'active' : ''}`}
                        onClick={() => setCurrentView(viewKey)}
                      >
                        <span>{viewKey.toUpperCase()}</span>
                        {countOnView > 0 && <span className="cl-view-count">{countOnView}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Studio Lighting & Inspection Tools */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  
                  {/* Backdrop Lighting Mode Switcher */}
                  <div className="cl-backdrop-switcher cl-tool-desktop-only" title="Change Studio Lighting">
                    <button
                      type="button"
                      className={`cl-backdrop-btn ${backdropTheme === 'light' ? 'active' : ''}`}
                      onClick={() => setBackdropTheme('light')}
                      title="Light Studio Backdrop (Best for Dark Shirts)"
                    >
                      ☀️ Light
                    </button>
                    <button
                      type="button"
                      className={`cl-backdrop-btn ${backdropTheme === 'studio' ? 'active' : ''}`}
                      onClick={() => setBackdropTheme('studio')}
                      title="Neutral Grey Studio"
                    >
                      💡 Studio
                    </button>
                    <button
                      type="button"
                      className={`cl-backdrop-btn ${backdropTheme === 'dark' ? 'active' : ''}`}
                      onClick={() => setBackdropTheme('dark')}
                      title="Dark Atelier"
                    >
                      🌙 Dark
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGridOn(!isGridOn)}
                    className={`cl-stage-tool-btn cl-tool-desktop-only ${isGridOn ? 'active' : ''}`}
                    title="Center Grid"
                  >
                    <Grid size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(1.5, Math.round((prev + 0.15) * 100) / 100))}
                    className="cl-stage-tool-btn cl-tool-desktop-only"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>

                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="cl-stage-tool-btn cl-tool-desktop-only"
                      style={{ width: 'auto', padding: '0 6px', fontSize: '0.68rem', color: 'var(--gold-bright)', fontWeight: 700 }}
                      title="Reset Zoom to 100%"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.85, Math.round((prev - 0.15) * 100) / 100))}
                    className="cl-stage-tool-btn cl-tool-desktop-only"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadMockup}
                    disabled={isDownloadingMockup}
                    className="cl-stage-tool-btn cl-tool-desktop-only"
                    style={{ width: 'auto', padding: '0 8px', gap: '4px', fontSize: '0.7rem', color: 'var(--gold-bright)' }}
                    title="Download Customized T-Shirt High-Res Preview Photo"
                  >
                    <Download size={13} />
                    <span>{isDownloadingMockup ? 'SAVING...' : 'SAVE PHOTO'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="cl-stage-tool-btn"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {/* T-Shirt Visualizer Stage with Dynamic Backdrop */}
              <div 
                className="cl-interactive-stage"
                data-view={currentView}
                data-backdrop={backdropTheme}
              >
                {/* Scalable Inner Garment Canvas (Isolated Zoom) */}
                <div
                  ref={stageRef}
                  className="cl-stage-viewport-canvas"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* SVG Garment Silhouette with Enhanced Contours & Pure Colors */}
                  <svg
                    className="cl-garment-svg"
                    viewBox="0 0 340 380"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      '--garment-body-color': selectedColor.hex,
                      '--garment-sleeve-color': selectedCut.id === 'raglan' ? selectedSleeveColor.hex : selectedColor.hex,
                      '--garment-contrast-color': selectedColor.contrastHex
                    }}
                  >
                    <defs>
                      {/* Contact Shadow for Realistic Grounding */}
                      <filter id="elvanyGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.6" />
                        <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.2" />
                      </filter>
                    </defs>

                    {/* Dynamic Silhouette Edge Rim Color */}
                    {(() => {
                      const isDarkGarment = ['#0a0a0b', '#0d1b3e', '#3d2319', '#28292d', '#2c3d2b', '#5a0d1e'].includes(selectedColor.hex);
                      const rimStroke = isDarkGarment ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)';
                      const seamStroke = isDarkGarment ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';

                      return (
                        <>
                          {/* FRONT VIEW */}
                          {currentView === 'front' && (
                            <g className="cl-front-group" filter="url(#elvanyGlow)">
                              {/* Main Body */}
                              <path 
                                className="cl-svg-body" 
                                d="M148 70 L112 78 L44 152 L72 188 L102 160 L98 280 Q170 290 242 280 L238 160 L268 188 L296 152 L228 78 L192 70 Q170 94 148 70 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1.2"
                                strokeLinejoin="round"
                              />
                              {/* Sleeves (Raglan support) */}
                              <path 
                                className="cl-svg-sleeve" 
                                d="M112 78 L44 152 L72 188 L102 160 Q96 114 112 78 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path 
                                className="cl-svg-sleeve" 
                                d="M228 78 L296 152 L268 188 L238 160 Q244 114 228 78 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              {/* Collar */}
                              <path 
                                className="cl-svg-collar" 
                                d="M148 70 Q170 94 192 70 L186 70 Q170 86 154 70 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              {/* Sleeve Hem & Tailoring Seams */}
                              <path d="M53 145 L81 181" stroke={seamStroke} strokeWidth="1.4" />
                              <path d="M287 145 L259 181" stroke={seamStroke} strokeWidth="1.4" />
                              <path d="M101 268 Q170 278 239 268" stroke={seamStroke} strokeWidth="1.5" fill="none" />
                            </g>
                          )}

                          {/* BACK VIEW */}
                          {currentView === 'back' && (
                            <g className="cl-back-group" filter="url(#elvanyGlow)">
                              <path 
                                className="cl-svg-body" 
                                d="M148 70 L112 78 L44 152 L72 188 L102 160 L98 280 Q170 290 242 280 L238 160 L268 188 L296 152 L228 78 L192 70 Q170 82 148 70 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1.2"
                                strokeLinejoin="round"
                              />
                              <path 
                                className="cl-svg-sleeve" 
                                d="M112 78 L44 152 L72 188 L102 160 Q96 114 112 78 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path 
                                className="cl-svg-sleeve" 
                                d="M228 78 L296 152 L268 188 L238 160 Q244 114 228 78 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path 
                                className="cl-svg-collar" 
                                d="M148 70 Q170 82 192 70 L186 70 Q170 76 154 70 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path d="M53 145 L81 181" stroke={seamStroke} strokeWidth="1.4" />
                              <path d="M287 145 L259 181" stroke={seamStroke} strokeWidth="1.4" />
                              <path d="M101 268 Q170 278 239 268" stroke={seamStroke} strokeWidth="1.5" fill="none" />
                            </g>
                          )}

                          {/* LEFT VIEW */}
                          {currentView === 'left' && (
                            <g className="cl-left-group" filter="url(#elvanyGlow)">
                              <path 
                                d="M150 72 Q134 84 133 116 L131 280 Q170 289 209 280 L207 116 Q206 84 190 72 Q170 64 150 72 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1.2"
                              />
                              <path 
                                d="M155 86 Q170 79 186 86 Q195 96 194 122 L192 172 Q170 181 149 172 L147 122 Q146 96 155 86 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path d="M148 158 Q170 167 193 158" stroke={seamStroke} strokeWidth="1.4" fill="none" />
                              <path d="M132 268 Q170 277 208 268" stroke={seamStroke} strokeWidth="1.5" fill="none" />
                            </g>
                          )}

                          {/* RIGHT VIEW */}
                          {currentView === 'right' && (
                            <g className="cl-right-group" filter="url(#elvanyGlow)">
                              <path 
                                d="M190 72 Q206 84 207 116 L209 280 Q170 289 131 280 L133 116 Q134 84 150 72 Q170 64 190 72 Z" 
                                fill="var(--garment-body-color)"
                                stroke={rimStroke}
                                strokeWidth="1.2"
                              />
                              <path 
                                d="M185 86 Q170 79 154 86 Q145 96 146 122 L148 172 Q170 181 191 172 L193 122 Q194 96 185 86 Z" 
                                fill="var(--garment-sleeve-color)"
                                stroke={rimStroke}
                                strokeWidth="1"
                              />
                              <path d="M192 158 Q170 167 147 158" stroke={seamStroke} strokeWidth="1.4" fill="none" />
                              <path d="M208 268 Q170 277 132 268" stroke={seamStroke} strokeWidth="1.5" fill="none" />
                            </g>
                          )}
                        </>
                      );
                    })()}

                    {/* Grid Crosshairs */}
                    {isGridOn && (
                      <g opacity="0.3" stroke="var(--gold-bright)" strokeWidth="0.8" strokeDasharray="3,3">
                        <line x1="170" y1="50" x2="170" y2="300" />
                        <line x1="80" y1="175" x2="260" y2="175" />
                      </g>
                    )}
                  </svg>

                  {/* Render Artwork Layers on Current View */}
                  {PLACEMENT_ZONES.filter(z => z.view === currentView).map(zone => {
                    const art = artworks[zone.id];
                    if (!art) return null;

                    const isSelectedArt = activeZoneKey === zone.id;

                    return (
                      <div
                        key={zone.id}
                        className={`cl-artwork-element ${isSelectedArt ? 'active-selection' : ''}`}
                        style={{
                          position: 'absolute',
                          left: `${art.x}%`,
                          top: `${art.y}%`,
                          width: `${art.scale}%`,
                          transform: `translate(-50%, -50%) rotate(${art.rotation}deg)`,
                          cursor: 'move',
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                        onPointerDown={(e) => handlePointerDown(e, zone.id)}
                      >
                        <img 
                          src={art.dataUrl} 
                          alt={zone.label}
                          draggable={false}
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                          }}
                        />

                        {/* Bounding Frame */}
                        {isSelectedArt && (
                          <div className="cl-artwork-bounding-frame">
                            <span className="cl-bounding-corner tl" />
                            <span className="cl-bounding-corner tr" />
                            <span className="cl-bounding-corner bl" />
                            <span className="cl-bounding-corner br" />
                            <div className="cl-bounding-tag">
                              <span>{zone.label}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Empty State Prompt */}
                {PLACEMENT_ZONES.filter(z => z.view === currentView && !artworks[z.id]).length > 0 && 
                 PLACEMENT_ZONES.filter(z => z.view === currentView && !!artworks[z.id]).length === 0 && (
                  <div className="cl-empty-stage-hint">
                    <span>No prints on {currentView} view yet</span>
                  </div>
                )}
              </div>

              {/* Stage Footer Hint */}
              <div className="cl-stage-footer">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light-secondary)' }}>
                  💡 <strong>Tip:</strong> Drag the graphic on the shirt to position it anywhere you like.
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold-bright)' }}>
                  {selectedFabric.name.split('(')[0].trim()} • {selectedColor.name} • Size {selectedSize}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Persistent Floating Bottom Action Bar */}
      <div className="cl-mobile-bottom-bar">
        <div className="cl-mobile-price-group">
          <span className="cl-mobile-price-tag">
            {selectedFabric.name.split('(')[0].trim()} • {selectedSize}
          </span>
          <div className="cl-mobile-price-amount">
            LKR {totalPrice.toLocaleString()}
          </div>
        </div>

        <div className="cl-mobile-btn-group">
          {activeStep === 1 && (
            <button
              type="button"
              onClick={() => {
                setActiveStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary-gold cl-mobile-action-btn"
            >
              <span>ADD ARTWORK</span>
              <ArrowRight size={14} />
            </button>
          )}

          {activeStep === 2 && (
            <button
              type="button"
              onClick={() => {
                setActiveStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary-gold cl-mobile-action-btn"
            >
              <span>REVIEW ORDER</span>
              <ArrowRight size={14} />
            </button>
          )}

          {activeStep === 3 && (
            <button
              type="button"
              onClick={handleAddCustomToBag}
              className="btn-primary-gold cl-mobile-action-btn"
            >
              {isAdded ? (
                <>
                  <Check size={14} />
                  <span>ADDED!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>ADD TO BAG</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sizing Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </div>
  );
};
