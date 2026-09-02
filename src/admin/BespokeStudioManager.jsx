import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  Download, 
  Trash2, 
  Check, 
  Copy, 
  Printer, 
  Eye, 
  Shirt, 
  Layers, 
  Maximize2, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Tag,
  Palette,
  Ruler,
  Phone,
  Mail,
  User,
  Info
} from 'lucide-react';
import { getBespokeDesigns, updateBespokeDesign } from '../services/dbService';
import { downloadImageFile } from '../lib/bespokeMockupGenerator';

export const BespokeStudioManager = ({ onToast }) => {
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [modalAngle, setModalAngle] = useState('collage');
  const [copiedCode, setCopiedCode] = useState(null);

  // Load bespoke designs from API / local storage
  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const data = await getBespokeDesigns();
      setDesigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error fetching bespoke designs:', err);
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onToast) onToast(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChange = async (id, newStatus) => {
    setDesigns(prev => prev.map(d => d.id === id || d.designCode === id ? { ...d, status: newStatus } : d));
    if (selectedDesign && (selectedDesign.id === id || selectedDesign.designCode === id)) {
      setSelectedDesign(prev => ({ ...prev, status: newStatus }));
    }
    if (onToast) onToast(`Bespoke design updated to "${newStatus}"`);

    try {
      await updateBespokeDesign(id, { status: newStatus });
    } catch (err) {
      console.warn('Status update error:', err);
    }
  };

  const handleDeleteDesign = async (id, designCode) => {
    if (window.confirm(`Are you sure you want to remove Bespoke Design #${designCode || id}?`)) {
      setDesigns(prev => prev.filter(d => d.id !== id && d.designCode !== designCode));
      if (selectedDesign?.id === id || selectedDesign?.designCode === designCode) {
        setSelectedDesign(null);
      }
      if (onToast) onToast(`Design #${designCode || id} removed from atelier registry.`);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl.replace(/\/+$/, '')}/bespoke/${id || designCode}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Delete error:', err);
      }
    }
  };

  // KPI Calculations
  const totalDesigns = designs.length;
  const inProductionCount = designs.filter(d => (d.status || '').includes('Production') || (d.status || '').includes('Printing') || (d.status || '').includes('Ordered')).length;
  const completedCount = designs.filter(d => (d.status || '').includes('Completed') || (d.status || '').includes('Dispatched')).length;
  const totalRevenueLKR = designs.reduce((sum, d) => sum + (Number(d.totalPrice) || 0), 0);

  // Filtered List
  const filteredDesigns = designs.filter(d => {
    const code = (d.designCode || d.id || '').toLowerCase();
    const customer = (d.customerName || '').toLowerCase();
    const email = (d.customerEmail || '').toLowerCase();
    const phone = (d.customerPhone || '').toLowerCase();
    const fabric = (d.fabricName || '').toLowerCase();
    const color = (d.colorName || '').toLowerCase();
    const notes = (d.notes || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || code.includes(q) || customer.includes(q) || email.includes(q) || phone.includes(q) || fabric.includes(q) || color.includes(q) || notes.includes(q);
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'production') return (d.status || '').includes('Production') || (d.status || '').includes('Printing') || (d.status || '').includes('Ordered');
    if (statusFilter === 'saved') return (d.status || '').includes('Saved') || (d.status || '').includes('Design');
    if (statusFilter === 'completed') return (d.status || '').includes('Completed') || (d.status || '').includes('Dispatched');

    return true;
  });

  const STATUS_OPTIONS = [
    'Saved / In Shopping Bag',
    'Ordered / In Production',
    'In Production / Printing',
    'Quality Inspection Passed',
    'Dispatched to Client',
    'Completed / Delivered'
  ];

  return (
    <div className="admin-view-container">
      
      {/* Top Banner & KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        
        {/* KPI 1 */}
        <div style={{ background: '#101114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              TOTAL BESPOKE CREATIONS
            </span>
            <Sparkles size={16} color="var(--gold-bright)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {totalDesigns}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Registered Atelier pieces</span>
        </div>

        {/* KPI 2 */}
        <div style={{ background: '#101114', border: '1px solid rgba(197, 160, 89, 0.3)', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              ACTIVE IN PRODUCTION
            </span>
            <Clock size={16} color="var(--gold-bright)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-bright)', fontFamily: 'var(--font-display)' }}>
            {inProductionCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Orders awaiting printing / dispatch</span>
        </div>

        {/* KPI 3 */}
        <div style={{ background: '#101114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              ESTIMATED BESPOKE VALUE
            </span>
            <Tag size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            LKR {totalRevenueLKR.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Cumulative custom lab volume</span>
        </div>

        {/* KPI 4 */}
        <div style={{ background: '#101114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              COMPLETED DISPATCHES
            </span>
            <CheckCircle size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Delivered to private clients</span>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="admin-action-bar" style={{ marginBottom: '1.5rem', background: '#101114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="admin-search-wrapper" style={{ maxWidth: '380px' }}>
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by Code #BL-XXXX, Client, Color, Fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Creations (${totalDesigns})` },
              { id: 'production', label: `In Production (${inProductionCount})` },
              { id: 'saved', label: 'Saved in Bag' },
              { id: 'completed', label: `Completed (${completedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-filter-pill ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  background: statusFilter === tab.id ? 'var(--gold-bright)' : 'rgba(255,255,255,0.04)',
                  color: statusFilter === tab.id ? '#000000' : 'var(--text-light-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '6px 12px',
                  borderRadius: '2px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDesigns}
          className="admin-btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Grid of Bespoke Creations */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-light-muted)' }}>
          <Shirt size={32} style={{ animation: 'pulse 1.5s infinite', color: 'var(--gold-bright)', marginBottom: '0.75rem' }} />
          <div>Loading Bespoke Atelier registry...</div>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#101114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <Sparkles size={36} color="var(--gold-bright)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 0.4rem 0', fontWeight: 500 }}>No Bespoke Creations Found</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light-muted)', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
            {searchQuery ? `No custom T-shirts matched "${searchQuery}".` : 'No custom T-shirt creations have been registered in the lab yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredDesigns.map((design) => {
            const artworksList = Object.entries(design.artworks || {});
            const totalPrints = artworksList.length;
            const previewImg = design.previewThumbnail || design.image || '/images/hero_tshirt.jpg';

            return (
              <div 
                key={design.id || design.designCode}
                style={{
                  background: '#101114',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
                className="admin-bespoke-card"
              >
                {/* Visual T-Shirt Mockup Image Header */}
                <div 
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundColor: '#07080a',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    setSelectedDesign(design);
                    setModalAngle('collage');
                  }}
                >
                  <img
                    src={previewImg}
                    alt={`Bespoke #${design.designCode}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  
                  {/* Code Overlay Badge */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span 
                      style={{
                        background: 'rgba(0,0,0,0.85)',
                        border: '1px solid var(--gold-bright)',
                        color: 'var(--gold-bright)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{design.designCode}</span>
                      <button 
                        type="button" 
                        onClick={(e) => handleCopyCode(design.designCode, e)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                        title="Copy Code"
                      >
                        {copiedCode === design.designCode ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                      </button>
                    </span>

                    <span style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '3px 7px', borderRadius: '2px' }}>
                      Size {design.size} ({design.quantity} pcs)
                    </span>
                  </div>

                  {/* View Details Prompt */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '2px', color: '#fff', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} />
                    <span>Inspect</span>
                  </div>
                </div>

                {/* Garment Details & Specs */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', color: '#ffffff', fontWeight: 600 }}>
                        {design.cutName}
                      </h4>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
                        {design.fabricName}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--gold-bright)' }}>
                        LKR {Number(design.totalPrice || 0).toLocaleString()}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', display: 'block' }}>
                        LKR {Number(design.unitPrice || 0).toLocaleString()} / tee
                      </span>
                    </div>
                  </div>

                  {/* Color & Print Swatches */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span 
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: design.colorHex || '#0a0a0b',
                          border: '1px solid rgba(255,255,255,0.3)',
                          display: 'inline-block'
                        }} 
                      />
                      <span style={{ fontSize: '0.74rem', color: '#fff', fontWeight: 500 }}>
                        {design.colorName}
                      </span>
                    </div>

                    {design.sleeveColorHex && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: design.sleeveColorHex, border: '1px solid rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>Sleeve</span>
                        </div>
                      </>
                    )}

                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: totalPrints > 0 ? 'var(--gold-bright)' : 'var(--text-light-muted)' }}>
                      {totalPrints === 0 ? 'Blank Tee' : `${totalPrints} Print Spot${totalPrints > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                      <User size={12} color="var(--gold-bright)" />
                      <strong style={{ color: '#fff' }}>{design.customerName || 'VIP Guest'}</strong>
                    </div>
                    {(design.customerEmail || design.customerPhone) && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', marginLeft: '17px' }}>
                        {design.customerEmail || design.customerPhone}
                      </div>
                    )}
                  </div>

                  {/* Customer Notes */}
                  {design.notes && (
                    <div style={{ fontSize: '0.72rem', color: '#e2e8f0', background: 'rgba(197, 160, 89, 0.06)', borderLeft: '2px solid var(--gold-bright)', padding: '6px 8px', borderRadius: '2px', marginBottom: '0.85rem', fontStyle: 'italic' }}>
                      "{design.notes}"
                    </div>
                  )}

                  {/* Status & Actions Footer */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    
                    <select
                      value={design.status || 'Saved / In Shopping Bag'}
                      onChange={(e) => handleStatusChange(design.id || design.designCode, e.target.value)}
                      style={{
                        background: '#090a0c',
                        border: '1px solid rgba(197, 160, 89, 0.4)',
                        color: 'var(--gold-bright)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '5px 8px',
                        borderRadius: '2px',
                        outline: 'none',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelectedDesign(design)}
                      className="admin-btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                      title="Inspect full print specifications"
                    >
                      Inspect
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDesign(design.id, design.designCode)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', padding: '5px', cursor: 'pointer', opacity: 0.7 }}
                      title="Delete design"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= DETAILED INSPECTION MODAL ================= */}
      {selectedDesign && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedDesign(null)}
        >
          <div 
            style={{
              backgroundColor: '#101114',
              border: '1px solid var(--gold-border)',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="var(--gold-bright)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                    Bespoke Atelier Work Order #{selectedDesign.designCode}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                    Created: {new Date(selectedDesign.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const img = selectedDesign.previewThumbnail || selectedDesign.image;
                    downloadImageFile(img, `bespoke_custom_tshirt_${selectedDesign.designCode}.png`);
                  }}
                  className="btn-primary-gold"
                  style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Download High-Res Customized T-Shirt Preview Collage"
                >
                  <Download size={13} />
                  <span>Download T-Shirt Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="admin-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Printer size={13} />
                  <span>Print Work Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDesign(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-light-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {(() => {
                const modalViews = selectedDesign?.views || {};
                const modalCollage = selectedDesign?.blueprintImage || modalViews.collage || selectedDesign?.previewThumbnail || selectedDesign?.image || null;
                const modalFront = modalViews.front || selectedDesign?.image || modalCollage;
                const modalBack = modalViews.back || null;
                const modalLeft = modalViews.left || null;
                const modalRight = modalViews.right || null;

                const modalAvailableAngles = [
                  { id: 'collage', label: '★ 4-Angle Blueprint (Collage)', url: modalCollage },
                  { id: 'front', label: 'Front Angle', url: modalFront },
                  ...(modalBack ? [{ id: 'back', label: 'Back Angle', url: modalBack }] : []),
                  ...(modalLeft ? [{ id: 'left', label: 'Left Sleeve', url: modalLeft }] : []),
                  ...(modalRight ? [{ id: 'right', label: 'Right Sleeve', url: modalRight }] : [])
                ].filter(a => !!a.url && typeof a.url === 'string');

                const currentAngleObj = modalAvailableAngles.find(a => a.id === modalAngle) || modalAvailableAngles[0];
                const activeMockupUrl = currentAngleObj?.url || modalFront || '/images/hero_tshirt.jpg';

                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    {/* Angle Selector Tabs Bar */}
                    {modalAvailableAngles.length > 1 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Select Garment Angle:
                        </span>
                        {modalAvailableAngles.map((ang) => (
                          <button
                            key={ang.id}
                            type="button"
                            onClick={() => setModalAngle(ang.id)}
                            style={{
                              background: modalAngle === ang.id ? 'var(--gold-bright)' : 'rgba(255,255,255,0.06)',
                              color: modalAngle === ang.id ? '#000000' : 'var(--text-light-primary)',
                              border: modalAngle === ang.id ? '1px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '3px',
                              padding: '5px 12px',
                              fontSize: '0.72rem',
                              fontWeight: modalAngle === ang.id ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {ang.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Mockup Angle Presentation Box */}
                    <div style={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#07080a', textAlign: 'center', position: 'relative', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={activeMockupUrl}
                        alt={`Bespoke #${selectedDesign.designCode} - ${currentAngleObj?.label}`}
                        style={{ width: '100%', maxHeight: '440px', objectFit: 'contain', display: 'block' }}
                      />
                      
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            downloadImageFile(activeMockupUrl, `bespoke_${selectedDesign.designCode}_${currentAngleObj?.id || 'angle'}.png`);
                          }}
                          style={{
                            background: 'rgba(0,0,0,0.85)',
                            border: '1px solid var(--gold-bright)',
                            color: 'var(--gold-bright)',
                            padding: '6px 12px',
                            borderRadius: '3px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                          }}
                        >
                          <Download size={12} />
                          <span>Download {currentAngleObj?.label?.replace('★ ', '') || 'Photo'}</span>
                        </button>

                        {modalCollage && modalCollage !== activeMockupUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              downloadImageFile(modalCollage, `bespoke_${selectedDesign.designCode}_blueprint.png`);
                            }}
                            style={{
                              background: 'rgba(197, 160, 89, 0.25)',
                              border: '1px solid var(--gold-bright)',
                              color: 'var(--gold-bright)',
                              padding: '6px 12px',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Download size={12} />
                            <span>Download 4-Angle Blueprint</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Grid: Garment Specs vs Raw Graphics Assets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Left Specs Panel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--gold-bright)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    GARMENT SPECIFICATIONS
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Fit & Style:</span>
                      <strong style={{ color: '#fff' }}>{selectedDesign.cutName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Fabric Grade:</span>
                      <strong style={{ color: '#fff' }}>{selectedDesign.fabricName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Colorway:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: selectedDesign.colorHex || '#0a0a0b', border: '1px solid rgba(255,255,255,0.3)' }} />
                        <strong style={{ color: '#fff' }}>{selectedDesign.colorName}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Size & Units:</span>
                      <strong style={{ color: 'var(--gold-bright)' }}>Size {selectedDesign.size} ({selectedDesign.quantity} shirts)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Total Amount:</span>
                      <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>LKR {Number(selectedDesign.totalPrice || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-light-muted)' }}>Client:</span>
                      <span style={{ color: '#fff' }}>{selectedDesign.customerName} {selectedDesign.customerPhone && `(${selectedDesign.customerPhone})`}</span>
                    </div>
                  </div>

                  {selectedDesign.notes && (
                    <div style={{ marginTop: '1rem', background: 'rgba(197, 160, 89, 0.08)', padding: '10px', borderRadius: '3px', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-bright)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        CLIENT INSTRUCTIONS & NOTES:
                      </span>
                      <p style={{ fontSize: '0.78rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>
                        {selectedDesign.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Raw Print Artwork Assets Panel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold-bright)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      PRINT ASSETS & COORDINATES
                    </h4>

                    {Object.keys(selectedDesign.artworks || {}).length > 1 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const entries = Object.entries(selectedDesign.artworks || {});
                          for (const [k, v] of entries) {
                            if (v.dataUrl) {
                              await downloadImageFile(v.dataUrl, `artwork_${selectedDesign.designCode}_${k}.png`);
                            }
                          }
                          if (onToast) onToast('Downloading all customer artwork files...');
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={11} />
                        <span>Download All ({Object.keys(selectedDesign.artworks).length})</span>
                      </button>
                    )}
                  </div>

                  {Object.keys(selectedDesign.artworks || {}).length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)', textAlign: 'center', padding: '2rem 0' }}>
                      No graphic artworks placed (Blank Luxury Garment).
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(selectedDesign.artworks).map(([spotKey, art]) => {
                        const spotLabels = {
                          front: 'Front Center',
                          back: 'Back Center',
                          left_chest: 'Left Chest (Logo)',
                          right_chest: 'Right Chest (Logo)',
                          left_sleeve: 'Left Sleeve',
                          right_sleeve: 'Right Sleeve',
                          nape: 'Back Neck (Small)'
                        };
                        const spotTitle = spotLabels[spotKey] || spotKey;

                        return (
                          <div 
                            key={spotKey}
                            style={{
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <img 
                              src={art.dataUrl} 
                              alt={spotTitle} 
                              style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#000', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }}
                            />
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>
                                {spotTitle}
                              </strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                                X: <strong>{art.x}%</strong> • Y: <strong>{art.y}%</strong> • Scale: <strong>{art.scale}%</strong> • Rot: <strong>{art.rotation || 0}°</strong>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                downloadImageFile(art.dataUrl, `artwork_${selectedDesign.designCode}_${spotKey}.png`);
                                if (onToast) onToast(`Downloading ${spotTitle} graphic...`);
                              }}
                              style={{
                                background: 'rgba(197, 160, 89, 0.15)',
                                border: '1px solid var(--gold-bright)',
                                color: 'var(--gold-bright)',
                                padding: '6px 10px',
                                borderRadius: '2px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 600
                              }}
                              title="Download High-Res Graphic Asset"
                            >
                              <Download size={12} />
                              <span>Download Graphic</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Status Update Bar in Modal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#090a0c', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', display: 'block' }}>UPDATE PRODUCTION STATUS</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--gold-bright)' }}>{selectedDesign.status}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {STATUS_OPTIONS.map(statusOpt => (
                    <button
                      key={statusOpt}
                      type="button"
                      onClick={() => handleStatusChange(selectedDesign.id || selectedDesign.designCode, statusOpt)}
                      style={{
                        background: selectedDesign.status === statusOpt ? 'var(--gold-bright)' : 'rgba(255,255,255,0.05)',
                        color: selectedDesign.status === statusOpt ? '#000000' : '#ffffff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '6px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      {statusOpt.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
