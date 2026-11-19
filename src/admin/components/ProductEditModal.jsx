import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Package, 
  SlidersHorizontal, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Palette,
  ArrowLeft,
  ArrowRight,
  Star,
  Check
} from 'lucide-react';
import { uploadGarmentImageToCloudinary } from '../../lib/cloudinary';
import { getAllCategories, addCustomCategory, formatCategoryLabel } from '../../services/categoryService';
import { cleanSizeCode } from '../../services/dbService';

const PRESET_ATELIER_COLORS = [
  { name: 'Onyx Black', hex: '#121316' },
  { name: 'Optic White', hex: '#F7F7F7' },
  { name: 'Florentine Gold', hex: '#C5A059' },
  { name: 'Vintage Navy', hex: '#1E2530' },
  { name: 'Raw Ecru Melange', hex: '#E3DAC9' },
  { name: 'Espresso Brown', hex: '#2B1D14' },
  { name: 'Heather Slate', hex: '#474A51' },
  { name: 'Forest Olive', hex: '#2D382E' },
  { name: 'Charcoal Melange', hex: '#2A2C31' },
  { name: 'Crimson Merlot', hex: '#5A1827' },
  { name: 'Dusty Sage', hex: '#6B7E6F' },
  { name: 'Midnight Indigo', hex: '#151C28' }
];

export const ProductEditModal = ({ isOpen, onClose, product, onSave, existingProducts = [] }) => {
  const [categoriesList, setCategoriesList] = useState(() => getAllCategories(existingProducts));
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');

  const initialCat = categoriesList[0]?.id || categoriesList[0]?.key || 'classic-crewneck';

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    category: initialCat,
    price: 18500,
    gsm: 240,
    composition: 'Durable Comfort Knit Blend',
    image: '/images/hero_tshirt.webp',
    images: ['/images/hero_tshirt.webp'],
    color: 'Onyx Black',
    colorHex: '#121316',
    colors: [
      { name: 'Onyx Black', hex: '#121316', isDefault: true },
      { name: 'Optic White', hex: '#F7F7F7', isDefault: false }
    ],
    colorsAvailable: ['#121316', '#F7F7F7'],
    description: '',
    status: 'Active',
    inventory: {
      'XS': 5,
      'S': 10,
      'M': 15,
      'L': 20,
      'XL': 12,
      '2XL': 6
    },
    collarSpec: 'Double-needle non-sag 1x1 ribbing',
    fit: 'Tailored Architectural Regular Fit',
    origin: 'Sri Lanka'
  });

  const [newSizeName, setNewSizeName] = useState('');
  const [quickTotalQty, setQuickTotalQty] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Custom Color inputs
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#C5A059');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentCats = getAllCategories(existingProducts);
    setCategoriesList(currentCats);
    setIsAddingNewCat(false);
    setNewCatLabel('');

    const activeDefaultCat = currentCats[0]?.id || currentCats[0]?.key || 'classic-crewneck';

    if (product) {
      const productImages = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image || '/images/hero_tshirt.webp'];

      // Extract colors
      let initialColors = [];
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        initialColors = product.colors.map(c => ({
          name: typeof c === 'string' ? c : (c.name || 'Custom Shade'),
          hex: typeof c === 'string' ? '#121316' : (c.hex || '#121316'),
          isDefault: typeof c === 'object' ? Boolean(c.isDefault) : false
        }));
      } else if (Array.isArray(product.colorsAvailable) && product.colorsAvailable.length > 0) {
        initialColors = product.colorsAvailable.map((hex, idx) => ({
          name: idx === 0 ? (product.color || 'Primary Shade') : `Colorway ${idx + 1}`,
          hex: hex || '#121316',
          isDefault: idx === 0
        }));
      } else {
        initialColors = [
          { name: product.color || 'Onyx Black', hex: product.colorHex || '#121316', isDefault: true }
        ];
      }

      if (!initialColors.some(c => c.isDefault) && initialColors.length > 0) {
        initialColors[0].isDefault = true;
      }

      const defaultColorObj = initialColors.find(c => c.isDefault) || initialColors[0] || { name: 'Onyx Black', hex: '#121316' };

      setFormData({
        ...product,
        category: product.category || activeDefaultCat,
        price: product.price ?? product.priceLKR ?? 18500,
        gsm: product.gsm ?? 240,
        image: product.image || productImages[0] || '/images/hero_tshirt.webp',
        images: productImages,
        color: product.color || defaultColorObj.name,
        colorHex: product.colorHex || defaultColorObj.hex,
        colors: initialColors,
        colorsAvailable: initialColors.map(c => c.hex),
        inventory: (() => {
          const rawInv = product.inventory && Object.keys(product.inventory).length > 0 ? product.inventory : null;
          if (!rawInv) return { 'XS': 5, 'S': 10, 'M': 15, 'L': 20, 'XL': 12, '2XL': 6 };
          const cleaned = {};
          Object.entries(rawInv).forEach(([k, v]) => {
            const cleanK = cleanSizeCode(k);
            cleaned[cleanK] = (cleaned[cleanK] || 0) + (Number(v) || 0);
          });
          return cleaned;
        })()
      });
    } else {
      setFormData({
        id: null,
        title: '',
        category: activeDefaultCat,
        price: 18500,
        gsm: 240,
        composition: 'Durable Comfort Knit Blend',
        image: '/images/hero_tshirt.webp',
        images: ['/images/hero_tshirt.webp'],
        color: 'Onyx Black',
        colorHex: '#121316',
        colors: [
          { name: 'Onyx Black', hex: '#121316', isDefault: true },
          { name: 'Optic White', hex: '#F7F7F7', isDefault: false }
        ],
        colorsAvailable: ['#121316', '#F7F7F7'],
        description: '',
        status: 'Active',
        inventory: {
          'XS': 5,
          'S': 10,
          'M': 15,
          'L': 20,
          'XL': 12,
          '2XL': 6
        },
        collarSpec: 'Double-needle non-sag 1x1 ribbing',
        fit: 'Tailored Architectural Regular Fit',
        origin: 'Sri Lanka'
      });
    }

    setNewSizeName('');
    setQuickTotalQty('');
    setCustomColorName('');
    setCustomColorHex('#C5A059');
    setNewImageUrl('');
    setIsUploadingImage(false);
    setUploadError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const totalUnits = Object.values(formData.inventory || {}).reduce((a, b) => a + (Number(b) || 0), 0);

  // ==========================================
  // IMAGE MANAGEMENT & ORDERING
  // ==========================================
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');
    try {
      const result = await uploadGarmentImageToCloudinary(file);
      if (result?.secure_url) {
        const newUrl = result.secure_url;
        const currentImages = Array.isArray(formData.images) ? [...formData.images] : [];
        
        // Remove duplicate if exists, append new image to gallery
        const filtered = currentImages.filter(img => img !== newUrl && img !== '/images/hero_tshirt.webp');
        const nextImages = [newUrl, ...filtered];

        setFormData(prev => ({
          ...prev,
          image: nextImages[0] || newUrl,
          images: nextImages
        }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddDirectUrl = () => {
    if (!newImageUrl.trim()) return;
    const cleanUrl = newImageUrl.trim();
    const currentImages = Array.isArray(formData.images) ? [...formData.images] : [];
    if (!currentImages.includes(cleanUrl)) {
      const nextImages = [...currentImages, cleanUrl];
      setFormData(prev => ({
        ...prev,
        image: prev.image || cleanUrl,
        images: nextImages
      }));
    }
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index) => {
    const currentImages = [...(formData.images || [])];
    if (index < 0 || index >= currentImages.length) return;
    
    // Move selected image to index 0 (Primary Hero)
    const [selected] = currentImages.splice(index, 1);
    const nextImages = [selected, ...currentImages];

    setFormData(prev => ({
      ...prev,
      image: selected,
      images: nextImages
    }));
  };

  const handleMoveImage = (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    const currentImages = [...(formData.images || [])];
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[currentIndex];
    currentImages[currentIndex] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;

    setFormData(prev => ({
      ...prev,
      image: currentImages[0] || '',
      images: currentImages
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentImages = (formData.images || []).filter((_, idx) => idx !== indexToRemove);
    const nextPrimary = currentImages[0] || '';
    setFormData(prev => ({
      ...prev,
      image: nextPrimary,
      images: currentImages
    }));
  };

  // ==========================================
  // AVAILABLE COLOURS MANAGEMENT
  // ==========================================
  const handleAddPresetColor = (preset) => {
    const currentColors = Array.isArray(formData.colors) ? [...formData.colors] : [];
    const exists = currentColors.some(c => c.hex.toLowerCase() === preset.hex.toLowerCase() || c.name.toLowerCase() === preset.name.toLowerCase());
    
    if (exists) {
      handleSetDefaultColor(preset.name);
      return;
    }

    const isFirst = currentColors.length === 0;
    const newColorItem = {
      name: preset.name,
      hex: preset.hex,
      isDefault: isFirst
    };

    const nextColors = [...currentColors, newColorItem];
    setFormData(prev => ({
      ...prev,
      colors: nextColors,
      colorsAvailable: nextColors.map(c => c.hex),
      color: isFirst ? preset.name : prev.color,
      colorHex: isFirst ? preset.hex : prev.colorHex
    }));
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const cleanName = customColorName.trim();
    const cleanHex = customColorHex || '#C5A059';

    const currentColors = Array.isArray(formData.colors) ? [...formData.colors] : [];
    const exists = currentColors.some(c => c.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) return;

    const isFirst = currentColors.length === 0;
    const newColorItem = {
      name: cleanName,
      hex: cleanHex,
      isDefault: isFirst
    };

    const nextColors = [...currentColors, newColorItem];
    setFormData(prev => ({
      ...prev,
      colors: nextColors,
      colorsAvailable: nextColors.map(c => c.hex),
      color: isFirst ? cleanName : prev.color,
      colorHex: isFirst ? cleanHex : prev.colorHex
    }));

    setCustomColorName('');
  };

  const handleSetDefaultColor = (colorName) => {
    const nextColors = (formData.colors || []).map(c => ({
      ...c,
      isDefault: c.name === colorName
    }));
    const target = nextColors.find(c => c.name === colorName);

    setFormData(prev => ({
      ...prev,
      colors: nextColors,
      colorsAvailable: nextColors.map(c => c.hex),
      color: target ? target.name : prev.color,
      colorHex: target ? target.hex : prev.colorHex
    }));
  };

  const handleRemoveColor = (colorNameToRemove) => {
    const nextColors = (formData.colors || []).filter(c => c.name !== colorNameToRemove);
    if (nextColors.length > 0 && !nextColors.some(c => c.isDefault)) {
      nextColors[0].isDefault = true;
    }

    const defaultColor = nextColors.find(c => c.isDefault) || nextColors[0];

    setFormData(prev => ({
      ...prev,
      colors: nextColors,
      colorsAvailable: nextColors.map(c => c.hex),
      color: defaultColor ? defaultColor.name : 'Onyx Black',
      colorHex: defaultColor ? defaultColor.hex : '#121316'
    }));
  };

  // ==========================================
  // INVENTORY MATRIX MANAGEMENT
  // ==========================================
  const handleInventoryChange = (size, val) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [size]: parsed
      }
    }));
  };

  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    const cleanName = newSizeName.trim();
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [cleanName]: 10
      }
    }));
    setNewSizeName('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    const updated = { ...formData.inventory };
    delete updated[sizeToRemove];
    setFormData(prev => ({
      ...prev,
      inventory: updated
    }));
  };

  const handleQuickDistribute = () => {
    const total = parseInt(quickTotalQty, 10);
    if (!total || total <= 0) return;

    const sizeKeys = Object.keys(formData.inventory || {});
    if (sizeKeys.length === 0) return;

    const perSize = Math.floor(total / sizeKeys.length);
    const remainder = total % sizeKeys.length;

    const updated = {};
    sizeKeys.forEach((sz, idx) => {
      updated[sz] = perSize + (idx < remainder ? 1 : 0);
    });

    setFormData(prev => ({
      ...prev,
      inventory: updated
    }));
    setQuickTotalQty('');
  };

  const handleAddNewCategory = (e) => {
    e?.preventDefault();
    if (!newCatLabel.trim()) return;
    const clean = newCatLabel.trim();
    const created = addCustomCategory(clean);
    if (created) {
      setCategoriesList(getAllCategories([...existingProducts, { category: created.key }]));
      setFormData(prev => ({ ...prev, category: created.key }));
      setNewCatLabel('');
      setIsAddingNewCat(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || formData.price === '' || formData.price === undefined) return;
    
    // Ensure images and primary image are strictly preserved
    const finalImages = Array.isArray(formData.images) ? formData.images : (formData.image ? [formData.image] : []);
    
    const finalColors = Array.isArray(formData.colors) && formData.colors.length > 0
      ? formData.colors
      : [{ name: formData.color || 'Onyx Black', hex: formData.colorHex || '#121316', isDefault: true }];

    const defaultColorObj = finalColors.find(c => c.isDefault) || finalColors[0];

    const isSoldOutExplicit = formData.status === 'Sold Out' || formData.status === 'Archived' || formData.status === 'Out of Stock' || totalUnits === 0;
    const finalStatus = formData.status === 'Draft' 
      ? 'Draft' 
      : (formData.status === 'Archived' ? 'Archived' : (isSoldOutExplicit ? 'Sold Out' : 'Active'));

    const cleanedInventory = {};
    Object.entries(formData.inventory || {}).forEach(([k, v]) => {
      const cleanK = cleanSizeCode(k);
      cleanedInventory[cleanK] = isSoldOutExplicit ? 0 : Math.max(0, parseInt(v, 10) || 0);
    });

    const finalProduct = {
      ...formData,
      status: finalStatus,
      isOutOfStock: isSoldOutExplicit,
      inStock: !isSoldOutExplicit,
      is_active: formData.status !== 'Draft',
      price: parseFloat(formData.price) || 0,
      priceLKR: parseFloat(formData.price) || 0,
      gsm: parseInt(formData.gsm, 10) || 0,
      image: finalImages[0] || '',
      images: finalImages,
      color: defaultColorObj.name,
      colorHex: defaultColorObj.hex,
      colors: finalColors,
      colorsAvailable: finalColors.map(c => c.hex),
      totalStock: isSoldOutExplicit ? 0 : Object.values(cleanedInventory).reduce((a, b) => a + Number(b), 0),
      inventory: cleanedInventory,
      sizes: Object.keys(cleanedInventory),
      collarSpec: formData.collarSpec || 'Double-needle non-sag 1x1 ribbing',
      fit: formData.fit || 'Tailored Regular Fit',
      silhouette: formData.fit || formData.silhouette || 'Tailored Regular Fit',
      origin: formData.origin || 'Sri Lanka'
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="admin-edit-dialog"
        style={{ maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div>
            <div className="admin-dialog-subtitle">GARMENT ATELIER & STOCK MANAGER</div>
            <h2 className="admin-dialog-title">
              {product ? `Edit Garment: ${product.title || product.name}` : 'Add New Atelier Garment'}
            </h2>
          </div>
          <button className="admin-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-dialog-form">
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '1.8rem' }}>
            
            {/* Left Column: Core Garment Info */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="form-group">
                <label className="form-label">Garment Title / Model Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Signature Minimalist Crewneck Tee"
                  className="form-input admin-input"
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Garment Category</label>
                    {!isAddingNewCat && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--gold-bright, #c5a059)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        + Add Custom
                      </button>
                    )}
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingNewCat(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="form-input admin-input"
                  >
                    {formData.category && !categoriesList.some(c => c.id === formData.category || c.key === formData.category) && (
                      <option value={formData.category}>
                        {formatCategoryLabel(formData.category)}
                      </option>
                    )}
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat.key} value={cat.id || cat.key}>
                        {cat.label}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Category...</option>
                  </select>

                  {isAddingNewCat && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <input
                        type="text"
                        placeholder="New category name..."
                        value={newCatLabel}
                        onChange={(e) => setNewCatLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                        className="form-input admin-input"
                        style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: '0.72rem', padding: '6px 10px', whiteSpace: 'nowrap' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCat(false);
                          setNewCatLabel('');
                        }}
                        className="admin-btn admin-btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '6px 8px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Price in Sri Lankan Rupees (LKR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Enter any amount (e.g. 18500)"
                    value={formData.price === '' ? '' : formData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        price: val === '' ? '' : (parseFloat(val) || 0)
                      }));
                    }}
                    className="form-input admin-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Fabric Weight (GSM)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gsm === '' ? '' : formData.gsm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        gsm: val === '' ? '' : (parseInt(val, 10) || 0)
                      }));
                    }}
                    className="form-input admin-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Publishing & Stock Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Sold Out' || val === 'Archived') {
                        const zeroed = {};
                        Object.keys(formData.inventory || {}).forEach(k => { zeroed[k] = 0; });
                        setFormData({ ...formData, status: val, inventory: Object.keys(zeroed).length > 0 ? zeroed : formData.inventory });
                      } else {
                        setFormData({ ...formData, status: val });
                      }
                    }}
                    className="form-input admin-input"
                  >
                    <option value="Active">Active (Live & In Stock)</option>
                    <option value="Sold Out">Out of Stock / Sold Out (Visible with 'SOLD OUT' Badge)</option>
                    <option value="Draft">Draft (Hidden from Storefront)</option>
                    <option value="Archived">Archived / Sold Out (Visible with 'SOLD OUT' Badge)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fabric & Fiber Composition</label>
                <input
                  type="text"
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  placeholder="e.g. Durable Comfort Knit Blend"
                  className="form-input admin-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Editorial Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed architectural cut and fabric integrity description..."
                  className="form-input admin-input"
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Collar Ribbing Specification</label>
                  <input
                    type="text"
                    value={formData.collarSpec}
                    onChange={(e) => setFormData({ ...formData, collarSpec: e.target.value })}
                    className="form-input admin-input"
                    placeholder="e.g. Double-needle non-sag 1x1 ribbing"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fit / Cut Silhouette</label>
                  <input
                    type="text"
                    value={formData.fit}
                    onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                    className="form-input admin-input"
                    placeholder="e.g. Tailored Regular Fit"
                  />
                </div>
              </div>

              {/* AVAILABLE COLOURS SECTION */}
              <div style={{
                padding: '1.2rem',
                backgroundColor: '#090a0c',
                border: '1px solid var(--border-dark)',
                borderRadius: '3px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={16} color="var(--gold-bright)" />
                    <span className="form-label" style={{ margin: 0, fontWeight: 700, color: '#ffffff' }}>
                      AVAILABLE COLOURWAYS (ATELIER PALETTE)
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--gold-bright)',
                    backgroundColor: 'rgba(197, 160, 89, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    fontWeight: 700
                  }}>
                    {formData.colors?.length || 0} Colors Configured
                  </span>
                </div>

                {/* Quick Luxury Presets Palette */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    Click to Add Curated Atelier Shades:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_ATELIER_COLORS.map((preset) => {
                      const isAdded = (formData.colors || []).some(c => c.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleAddPresetColor(preset)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            backgroundColor: isAdded ? 'rgba(197, 160, 89, 0.15)' : '#121316',
                            border: isAdded ? '1px solid var(--gold-bright)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            color: isAdded ? 'var(--gold-bright)' : '#ffffff',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Add ${preset.name} (${preset.hex})`}
                        >
                          <span 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.hex,
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              display: 'inline-block' 
                            }} 
                          />
                          <span>{preset.name}</span>
                          {isAdded && <Check size={10} color="var(--gold-bright)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Creator */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      style={{
                        width: '34px',
                        height: '32px',
                        padding: '1px',
                        backgroundColor: '#121316',
                        border: '1px solid var(--border-dark)',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                      title="Choose Custom Color HEX"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Custom Shade Name (e.g. Imperial Emerald)"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem', flex: 1 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomColor(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="btn-secondary-outline"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={13} />
                    <span>Add Color</span>
                  </button>
                </div>

                {/* Configured Colors List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {(formData.colors || []).map((col) => (
                    <div
                      key={col.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: col.isDefault ? 'rgba(197, 160, 89, 0.08)' : '#121316',
                        border: col.isDefault ? '1px solid var(--gold-border)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '50%', 
                            backgroundColor: col.hex,
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            display: 'inline-block',
                            boxShadow: '0 0 3px rgba(0,0,0,0.5)'
                          }} 
                        />
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{col.name}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', marginLeft: '6px' }}>{col.hex}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {col.isDefault ? (
                          <span style={{ 
                            fontSize: '0.65rem', 
                            color: 'var(--gold-bright)', 
                            backgroundColor: 'rgba(197, 160, 89, 0.18)', 
                            padding: '2px 6px', 
                            borderRadius: '2px', 
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Star size={10} fill="var(--gold-bright)" />
                            <span>PRIMARY</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultColor(col.name)}
                            className="btn-secondary-outline"
                            style={{ padding: '2px 6px', fontSize: '0.65rem', color: 'var(--text-light-muted)' }}
                            title="Set as Default / Primary Colorway"
                          >
                            Set Primary
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveColor(col.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            opacity: 0.8
                          }}
                          title={`Remove ${col.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!formData.colors || formData.colors.length === 0) && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textAlign: 'center', padding: '0.8rem' }}>
                      No colors added yet. Select a shade from the palette above.
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Garment Imagery Order & Size Matrix */}
            <div className="admin-form-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* IMAGE GALLERY & SEQUENCE ORDER SECTION */}
              <div style={{
                padding: '1.2rem',
                backgroundColor: '#090a0c',
                border: '1px solid var(--border-dark)',
                borderRadius: '3px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={16} color="var(--gold-bright)" />
                    <span className="form-label" style={{ margin: 0, fontWeight: 700, color: '#ffffff' }}>
                      GARMENT IMAGERY & SEQUENCE ORDER
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    color: 'var(--gold-bright)',
                    backgroundColor: 'rgba(197, 160, 89, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    fontWeight: 700
                  }}>
                    {formData.images?.length || 0} Angles / Photos
                  </span>
                </div>

                {/* Cloudinary File Upload Dropzone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1px dashed var(--gold-border)',
                    backgroundColor: 'rgba(197, 160, 89, 0.04)',
                    padding: '1rem',
                    borderRadius: '2px',
                    textAlign: 'center',
                    cursor: isUploadingImage ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.8rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-bright)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gold-border)'}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />

                  {isUploadingImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={22} className="spin-animation" color="var(--gold-bright)" />
                      <span style={{ fontSize: '0.76rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                        Uploading high-res garment to Cloudinary CDN...
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <UploadCloud size={22} color="var(--gold-bright)" />
                      <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                        Upload Atelier Angle / Photo to Cloudinary
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>
                        webp, PNG, WEBP — automatically placed in your ordered gallery
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div style={{ color: '#f87171', fontSize: '0.74rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Direct URL / Preset Image Inserter */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Or paste Cloudinary / Web Image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.74rem', padding: '0.4rem 0.6rem', flex: 1 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDirectUrl(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDirectUrl}
                    className="btn-secondary-outline"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                  >
                    + Add URL
                  </button>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const val = e.target.value;
                        const current = formData.images || [];
                        if (!current.includes(val)) {
                          setFormData(prev => ({
                            ...prev,
                            image: prev.image || val,
                            images: [...current, val]
                          }));
                        }
                      }
                    }}
                    className="form-input admin-input"
                    style={{ fontSize: '0.74rem', padding: '0.4rem', width: '100px' }}
                  >
                    <option value="">Presets...</option>
                    <option value="/images/hero_tshirt.webp">Onyx Hero</option>
                    <option value="/images/tshirt_white.webp">Optic White</option>
                    <option value="/images/pillar_knitwear.webp">Florentine Gold</option>
                    <option value="/images/pillar_heavyweight.webp">Fabric Detail</option>
                    <option value="/images/model_tshirt.webp">Model Fit</option>
                  </select>
                </div>

                {/* REORDERABLE ORDERED IMAGES LIST / GALLERY */}
                <div style={{ marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Display Order Sequence (Image #1 is Primary Cover):
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    maxHeight: '230px', 
                    overflowY: 'auto',
                    paddingRight: '4px'
                  }}>
                    {(formData.images || []).map((imgUrl, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <div
                          key={`${imgUrl}-${idx}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: isPrimary ? 'rgba(197, 160, 89, 0.08)' : '#121316',
                            border: isPrimary ? '1px solid var(--gold-bright)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '3px'
                          }}
                        >
                          {/* Left: Thumbnail + Order Number Badge + URL/Label */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isPrimary ? 'var(--gold-bright)' : 'rgba(255, 255, 255, 0.1)',
                              color: isPrimary ? '#000' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </div>

                            <div style={{ width: '48px', height: '48px', borderRadius: '2px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-dark)' }}>
                              <img 
                                src={imgUrl} 
                                alt="" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = '/images/hero_tshirt.webp'; }}
                              />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isPrimary ? (
                                  <span style={{ 
                                    fontSize: '0.66rem', 
                                    color: '#000', 
                                    backgroundColor: 'var(--gold-bright)', 
                                    padding: '1px 6px', 
                                    borderRadius: '2px', 
                                    fontWeight: 800,
                                    letterSpacing: '0.04em'
                                  }}>
                                    ★ HERO COVER / THUMBNAIL
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>
                                    Angle #{idx + 1}
                                  </span>
                                )}
                              </div>
                              <span style={{ 
                                fontSize: '0.64rem', 
                                color: 'var(--text-light-muted)', 
                                display: 'block', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                marginTop: '2px' 
                              }}>
                                {imgUrl.includes('cloudinary') ? 'Cloudinary CDN Asset' : imgUrl}
                              </span>
                            </div>
                          </div>

                          {/* Right: Re-Order Buttons & Delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                            {/* Move Up / Earlier (←) */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                              style={{
                                width: '26px',
                                height: '26px',
                                backgroundColor: idx === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: idx === 0 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                borderRadius: '2px',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Move Earlier in Gallery (Position Up)"
                            >
                              <ArrowLeft size={12} />
                            </button>

                            {/* Move Down / Later (→) */}
                            <button
                              type="button"
                              disabled={idx === (formData.images?.length || 0) - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                              style={{
                                width: '26px',
                                height: '26px',
                                backgroundColor: idx === (formData.images?.length || 0) - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: idx === (formData.images?.length || 0) - 1 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                borderRadius: '2px',
                                cursor: idx === (formData.images?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Move Later in Gallery (Position Down)"
                            >
                              <ArrowRight size={12} />
                            </button>

                            {/* Set as Cover action */}
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="btn-secondary-outline"
                                style={{ padding: '3px 7px', fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                                title="Move to Position #1 as Primary Showcase"
                              >
                                Set Cover
                              </button>
                            )}

                            {/* Remove image */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px 7px',
                                marginLeft: '4px',
                                borderRadius: '3px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              title="Delete Photo from Gallery"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {(!formData.images || formData.images.length === 0) && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textAlign: 'center', padding: '1rem' }}>
                        No images attached. Upload or paste a URL above.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* AVAILABLE QUANTITY & INVENTORY MATRIX */}
              <div className="admin-stock-matrix-box" style={{ padding: '1.2rem', backgroundColor: '#090a0c', border: '1px solid var(--border-dark)', borderRadius: '3px' }}>
                
                {/* Header with Total Available Units */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} color="var(--gold-bright)" />
                    <span className="form-label" style={{ margin: 0, fontWeight: 700 }}>AVAILABLE STOCK QUANTITY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const zeroed = {};
                        Object.keys(formData.inventory || {}).forEach(k => { zeroed[k] = 0; });
                        setFormData({ ...formData, status: 'Sold Out', inventory: zeroed });
                      }}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                      title="Set all size stocks to 0 and mark garment as Out of Stock"
                    >
                      Set Out of Stock (0)
                    </button>
                    <div style={{
                      backgroundColor: totalUnits === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(197, 160, 89, 0.15)',
                      border: totalUnits === 0 ? '1px solid #ef4444' : '1px solid var(--gold-bright)',
                      color: totalUnits === 0 ? '#f87171' : 'var(--gold-bright)',
                      padding: '3px 10px',
                      borderRadius: '2px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.86rem'
                    }}>
                      {totalUnits === 0 ? 'OUT OF STOCK (0 Units)' : `${totalUnits} Pieces Available`}
                    </div>
                  </div>
                </div>

                {/* Quick Batch Quantity Distributor */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quick total qty (e.g. 50)"
                    value={quickTotalQty}
                    onChange={(e) => setQuickTotalQty(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickDistribute}
                    className="btn-secondary-outline"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Evenly distribute this total batch quantity across all available sizes"
                  >
                    <SlidersHorizontal size={12} />
                    <span>Auto-Distribute</span>
                  </button>
                </div>

                {/* Size-by-Size Quantity Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.entries(formData.inventory || {}).map(([size, count]) => (
                    <div 
                      key={size} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: '#101114',
                        border: '1px solid var(--border-dark)',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{size}</span>
                        <span style={{ fontSize: '0.68rem', color: count < 5 ? '#f87171' : 'var(--text-light-muted)' }}>
                          {count < 5 ? '(Low Stock)' : 'in stock'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleInventoryChange(size, Math.max(0, count - 1))}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-dark)',
                            color: '#fff',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={count}
                          onChange={(e) => handleInventoryChange(size, e.target.value)}
                          className="admin-stock-input"
                          style={{
                            width: '54px',
                            textAlign: 'center',
                            padding: '4px',
                            fontWeight: 700,
                            color: 'var(--gold-bright)',
                            backgroundColor: '#090a0c',
                            border: '1px solid var(--border-dark)'
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleInventoryChange(size, count + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-dark)',
                            color: '#fff',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            marginLeft: '4px',
                            opacity: 0.7
                          }}
                          title="Remove size"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Size Input */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <input
                    type="text"
                    placeholder="Add size (e.g. XXL (46) or Oversized)"
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="form-input admin-input"
                    style={{ fontSize: '0.76rem', padding: '0.4rem 0.65rem', flex: 1 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="btn-primary-gold"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={13} />
                    <span>Add Size</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          <div className="admin-dialog-actions" style={{ marginTop: '1.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.2rem' }}>
            <button type="button" className="btn-secondary-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-gold">
              <Save size={15} />
              <span>SAVE GARMENT & INVENTORY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
