import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, PackageCheck, Truck, Clock, ShieldCheck, Mail, Phone, MapPin, Building2, UploadCloud, Sparkles, Download, Printer, Shirt, Layers, Eye } from 'lucide-react';
import { getBespokeDesigns, getBespokeDesignById } from '../../services/dbService';
import { downloadImageFile } from '../../lib/bespokeMockupGenerator';

const BespokeItemAngleViewer = ({ customItem, linkedBespoke, itemCode, orderId }) => {
  const views = customItem?.views || linkedBespoke?.views || {};
  const collageImg = customItem?.blueprintImage || views?.collage || customItem?.customArtworkThumb || customItem?.previewThumbnail || linkedBespoke?.blueprintImage || linkedBespoke?.previewThumbnail || null;
  const frontImg = views?.front || customItem?.image || customItem?.product_image_url || linkedBespoke?.previewThumbnail || collageImg;
  const backImg = views?.back || null;
  const leftImg = views?.left || null;
  const rightImg = views?.right || null;

  const availableAngles = [
    { id: 'collage', label: '★ 4-Angle Blueprint', url: collageImg },
    { id: 'front', label: 'Front View', url: frontImg },
    ...(backImg ? [{ id: 'back', label: 'Back View', url: backImg }] : []),
    ...(leftImg ? [{ id: 'left', label: 'Left Sleeve', url: leftImg }] : []),
    ...(rightImg ? [{ id: 'right', label: 'Right Sleeve', url: rightImg }] : [])
  ].filter(a => !!a.url && typeof a.url === 'string');

  const [activeAngleId, setActiveAngleId] = useState(availableAngles[0]?.id || 'collage');
  const currentAngle = availableAngles.find(a => a.id === activeAngleId) || availableAngles[0];
  const activeUrl = currentAngle?.url || frontImg || '/images/hero_tshirt.jpg';

  return (
    <div style={{ textAlign: 'center', background: '#07080a', borderRadius: '4px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Angle Selector Tabs */}
      {availableAngles.length > 1 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px', justifyContent: 'center' }}>
          {availableAngles.map((ang) => (
            <button
              key={ang.id}
              type="button"
              onClick={() => setActiveAngleId(ang.id)}
              style={{
                background: activeAngleId === ang.id ? 'var(--gold-bright)' : 'rgba(255,255,255,0.06)',
                color: activeAngleId === ang.id ? '#000000' : 'var(--text-light-secondary)',
                border: activeAngleId === ang.id ? '1px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '2px',
                padding: '3px 7px',
                fontSize: '0.62rem',
                fontWeight: activeAngleId === ang.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {ang.label}
            </button>
          ))}
        </div>
      )}

      {/* Angle Image View */}
      <div style={{ position: 'relative', width: '100%', minHeight: '160px', maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c0d10', borderRadius: '3px', overflow: 'hidden' }}>
        <img
          src={activeUrl}
          alt={`Bespoke #${itemCode} - ${currentAngle?.label}`}
          style={{ width: '100%', height: '100%', maxHeight: '210px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '4px' }}>
        <span style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', fontWeight: 700 }}>
          CODE: #{itemCode} <span style={{ opacity: 0.65, fontWeight: 400 }}>({currentAngle?.label})</span>
        </span>
        <button
          type="button"
          onClick={() => downloadImageFile(activeUrl, `bespoke_order_${orderId || 'work'}_${itemCode}_${activeAngleId}.png`)}
          style={{
            background: 'rgba(197, 160, 89, 0.2)',
            border: '1px solid var(--gold-bright)',
            color: 'var(--gold-bright)',
            padding: '3px 7px',
            borderRadius: '2px',
            fontSize: '0.66rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title="Download Customized T-Shirt Angle Image"
        >
          <Download size={11} />
          <span>Download {currentAngle?.label?.replace('★ ', '') || 'Angle'}</span>
        </button>
      </div>
    </div>
  );
};

export const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending Slip Verification');
  const [bespokeDetailsMap, setBespokeDetailsMap] = useState({});

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }

    // Load any linked bespoke custom details
    if (order?.items && order.items.length > 0) {
      const fetchBespokeDetails = async () => {
        const details = {};
        for (const item of order.items) {
          const code = item.designCode || (item.title || item.name || '').match(/BL-[A-Z0-9]{4,6}/)?.[0];
          if (code) {
            try {
              const res = await getBespokeDesignById(code);
              if (res) details[code] = res;
            } catch (e) {}
          }
        }
        setBespokeDetailsMap(details);
      };
      fetchBespokeDetails();
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const reviewUrl = `${window.location.origin}/order-review/${order.orderId}`;

  const handleCopyReviewLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(order.orderId, newStatus);
    }
  };

  const statuses = [
    'Pending Slip Verification',
    'Payment Verified — Processing Dispatch',
    'Pending Confirmation',
    'In Production',
    'Packed & Inspected',
    'Shipped (In Transit)',
    'Delivered',
    'Slip Rejected — Awaiting New Receipt',
    'Cancelled'
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="admin-order-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="admin-order-seal-disc">
              <img src="/logo/Main-4.png" alt="ELVANY Seal" />
            </div>
            <div>
              <div className="admin-dialog-subtitle">CLIENT ORDER PASSPORT</div>
              <h2 className="admin-dialog-title">Order #{order.orderId}</h2>
            </div>
          </div>

          <button className="admin-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-order-dialog-body">
          
          {/* Top Status Pipeline Card */}
          <div className="admin-order-status-banner" style={{
            borderColor: selectedStatus.toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.4)' : undefined,
            backgroundColor: selectedStatus.toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.05)' : undefined
          }}>
            <div>
              <span className="admin-field-label">CURRENT DISPATCH PIPELINE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '4px' }}>
                <span 
                  className={`admin-status-badge ${selectedStatus.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  style={{
                    backgroundColor: selectedStatus.toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.15)' : undefined,
                    borderColor: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : undefined,
                    color: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : undefined,
                    fontWeight: selectedStatus.toLowerCase().includes('reject') ? 700 : undefined
                  }}
                >
                  {selectedStatus}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)' }}>
                  Placed: {order.orderDate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.74rem', color: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : 'var(--gold-bright)', fontWeight: 600 }}>CHANGE STATUS:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="admin-status-select"
                style={{
                  borderColor: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : undefined,
                  color: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : undefined
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Slip Inspection Banner for Bank Transfers */}
          {(order.paymentSlipUrl || order.paymentMethod?.includes('Bank') || order.status === 'Pending Slip Verification' || selectedStatus.toLowerCase().includes('reject')) && (
            <div style={{
              backgroundColor: selectedStatus.toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.05)' : '#0c0d12',
              border: selectedStatus.toLowerCase().includes('reject') ? '1px solid #ef4444' : order.status === 'Pending Slip Verification' ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
              borderRadius: '2px',
              padding: '1.4rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : 'var(--gold-bright)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  <Building2 size={16} />
                  <span>DIRECT BANK TRANSFER PAYMENT SLIP</span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  backgroundColor: selectedStatus.toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.15)' : order.status === 'Pending Slip Verification' ? 'var(--gold-bright)' : '#1a1c22',
                  color: selectedStatus.toLowerCase().includes('reject') ? '#ef4444' : order.status === 'Pending Slip Verification' ? '#000000' : 'var(--gold-bright)',
                  border: selectedStatus.toLowerCase().includes('reject') ? '1px solid #ef4444' : 'none',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '1px'
                }}>
                  {selectedStatus.toLowerCase().includes('reject') ? 'SLIP REJECTED — REORDER REQUIRED' : order.status === 'Pending Slip Verification' ? 'AWAITING ATELIER APPROVAL' : 'VERIFIED SLIP'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {order.paymentSlipUrl ? (
                  <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '85px', height: '100px', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--gold-border)', flexShrink: 0 }} title="Click to view full receipt">
                    <img src={order.paymentSlipUrl} alt="Bank Slip Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ) : (
                  <div style={{ width: '85px', height: '100px', borderRadius: '2px', backgroundColor: '#07080a', border: '1px dashed var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light-muted)', fontSize: '0.7rem', textAlign: 'center', padding: '6px' }}>
                    Receipt Attached
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>
                    {order.paymentSlipName || 'Commercial_Bank_Transfer_Slip.png'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-light-secondary)', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                    Reconciled Amount: <strong style={{ color: 'var(--gold-bright)' }}>LKR {(order.totalLKR || 18500).toLocaleString()}</strong> ({order.paymentMethod || 'HNB Account #019020601780 / LankaQR'}).
                  </div>


                  {order.status === 'Pending Slip Verification' && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-primary-gold"
                        onClick={() => handleStatusChange('Payment Verified — Processing Dispatch')}
                        style={{ padding: '0.55rem 1.1rem', fontSize: '0.74rem', gap: '5px' }}
                      >
                        <Check size={13} />
                        <span>APPROVE SLIP & BEGIN DISPATCH</span>
                      </button>

                      <button
                        type="button"
                        className="btn-secondary-outline"
                        onClick={() => handleStatusChange('Slip Rejected — Awaiting New Receipt')}
                        style={{ padding: '0.55rem 0.9rem', fontSize: '0.74rem', color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        <X size={13} />
                        <span>REJECT SLIP</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Client & Destination Overview Grid */}
          <div className="admin-client-info-grid">
            <div className="admin-info-card">
              <div className="admin-info-card-header">
                <ShieldCheck size={14} color="var(--gold-bright)" />
                <span>CLIENT PROFILE</span>
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block', marginBottom: '4px' }}>
                {order.customerName}
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px' }}>
                <Mail size={12} />
                <span>{order.customerEmail || 'client@private.lk'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={12} />
                <span>{order.customerPhone || '071 909 2726'}</span>
              </div>
            </div>

            <div className="admin-info-card">
              <div className="admin-info-card-header">
                <MapPin size={14} color="var(--gold-bright)" />
                <span>DELIVERY DESTINATION</span>
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block', marginBottom: '4px' }}>
                {order.customerLocation}
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
                Complimentary White-Glove Island-Wide Express Delivery
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold-bright)', marginTop: '4px' }}>
                Payment: {order.paymentMethod || 'Mastercard •••• 8842'}
              </div>
            </div>
          </div>

          {/* Garments in Parcel Table */}
          <div className="admin-parcel-items-box">
            <div className="admin-section-header-compact">
              <span>GARMENTS IN PARCEL ({order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'})</span>
              <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>
                Total: LKR {(order.totalLKR || order.items.reduce((acc, i) => acc + (i.priceLKR || 18500) * (i.quantity || 1), 0)).toLocaleString()}
              </span>
            </div>

            <div className="admin-parcel-items-list">
              {order.items.map((item, idx) => {
                const isBespoke = item.isBespokeCustom || item.designCode || (item.title || '').includes('Bespoke') || (item.title || '').includes('Custom');
                return (
                  <div key={idx} className="admin-parcel-item-row" style={{ borderLeft: isBespoke ? '2px solid var(--gold-bright)' : 'none', paddingLeft: isBespoke ? '10px' : '0' }}>
                    <img 
                      src={item.image || item.product_image_url || '/images/tshirt_white.jpg'} 
                      alt={item.title} 
                      className="admin-parcel-item-thumb" 
                      style={{ width: '56px', height: '56px', objectFit: 'contain', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{item.title || item.name}</div>
                        {isBespoke && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(197, 160, 89, 0.2)', border: '1px solid var(--gold-bright)', color: 'var(--gold-bright)', padding: '1px 6px', borderRadius: '2px', fontWeight: 700 }}>
                            BESPOKE LAB {item.designCode ? `#${item.designCode}` : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                        Size: <span style={{ color: '#fff' }}>{item.size || item.selectedSize}</span> • Color: <span style={{ color: '#fff' }}>{item.color || 'Onyx Black'}</span> • Qty: <span style={{ color: '#fff' }}>{item.quantity || 1}</span>
                      </div>
                      {item.customPlacements && item.customPlacements.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gold-bright)', marginTop: '2px' }}>
                          Prints: {item.customPlacements.join(', ')}
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                      LKR {((item.priceLKR || 18500) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bespoke Custom T-Shirts Production & Artwork Inspection */}
          {order.items.some(i => i.isBespokeCustom || i.designCode || (i.title || '').includes('Bespoke') || (i.title || '').includes('Custom')) && (
            <div style={{
              backgroundColor: '#0c0d12',
              border: '1px solid var(--gold-border)',
              borderRadius: '3px',
              padding: '1.4rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold-bright)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  <Sparkles size={16} />
                  <span>BESPOKE ATELIER CUSTOM WORK ORDER</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)' }}>
                  Production Blueprint & High-Res Print Assets
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {order.items.filter(i => i.isBespokeCustom || i.designCode || (i.title || '').includes('Bespoke') || (i.title || '').includes('Custom')).map((customItem, cIdx) => {
                  const itemCode = customItem.designCode || (customItem.title || customItem.name || '').match(/BL-[A-Z0-9]{4,6}/)?.[0] || `BL-${cIdx + 1}`;
                  const linkedBespoke = bespokeDetailsMap[itemCode] || {};
                  const fabric = customItem.fabric || linkedBespoke.fabricName || '240 GSM Luxury Cotton';
                  const cut = customItem.cut || linkedBespoke.cutName || 'Classic Regular Fit';
                  const notes = customItem.customNotes || linkedBespoke.notes || '';
                  const previewImg = customItem.image || customItem.product_image_url || linkedBespoke.previewThumbnail || '/images/hero_tshirt.jpg';
                  const artworks = customItem.artworks || linkedBespoke.artworks || {};
                  const artworkList = Object.entries(artworks);

                  return (
                    <div key={cIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '1.1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', alignItems: 'center' }}>
                        
                        {/* Rendered Multi-Angle Mockup Presentation Gallery */}
                        <BespokeItemAngleViewer
                          customItem={customItem}
                          linkedBespoke={linkedBespoke}
                          itemCode={itemCode}
                          orderId={order.orderId}
                        />

                        {/* Garment Specifications */}
                        <div>
                          <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>
                            {cut}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginBottom: '10px' }}>
                            <div>• Fabric Grade: <strong style={{ color: '#fff' }}>{fabric}</strong></div>
                            <div>• Color: <strong style={{ color: '#fff' }}>{customItem.color || 'Pure Black'}</strong> ({customItem.size || 'L'} / {customItem.quantity || 1} pcs)</div>
                            {customItem.customPlacements && customItem.customPlacements.length > 0 && (
                              <div>• Placement Zones: <strong style={{ color: 'var(--gold-bright)' }}>{customItem.customPlacements.join(' • ')}</strong></div>
                            )}
                          </div>

                          {notes && (
                            <div style={{ fontSize: '0.72rem', background: 'rgba(197, 160, 89, 0.08)', borderLeft: '2px solid var(--gold-bright)', padding: '5px 8px', borderRadius: '2px', color: '#fff', fontStyle: 'italic', marginBottom: '8px' }}>
                              "{notes}"
                            </div>
                          )}

                          {/* Print Assets & Coordinates Section */}
                          {artworkList.length > 0 && (
                            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                              <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                PRINT ASSETS & COORDINATES ({artworkList.length})
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {artworkList.map(([spotKey, art]) => {
                                  const spotLabels = {
                                    front: 'Front Center',
                                    back: 'Back Center',
                                    left_chest: 'Left Chest (Logo)',
                                    right_chest: 'Right Chest (Logo)',
                                    left_sleeve: 'Left Sleeve',
                                    right_sleeve: 'Right Sleeve',
                                    nape: 'Back Neck (Small)'
                                  };
                                  const spotTitle = spotLabels[spotKey] || spotKey.replace('_', ' ');
                                  const artImg = art?.dataUrl || art?.imageUrl || art;

                                  return (
                                    <div
                                      key={spotKey}
                                      style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '3px',
                                        padding: '6px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                      }}
                                    >
                                      {typeof artImg === 'string' && (
                                        <img
                                          src={artImg}
                                          alt={spotTitle}
                                          style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#000', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.15)' }}
                                        />
                                      )}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <strong style={{ fontSize: '0.76rem', color: '#ffffff', display: 'block' }}>
                                          {spotTitle}
                                        </strong>
                                        {typeof art === 'object' && art.x !== undefined && (
                                          <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', marginTop: '1px' }}>
                                            X: <strong>{art.x}%</strong> • Y: <strong>{art.y}%</strong> • Scale: <strong>{art.scale}%</strong> • Rot: <strong>{art.rotation || 0}°</strong>
                                          </div>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => downloadImageFile(artImg, `artwork_${itemCode}_${spotKey}.png`)}
                                        style={{
                                          background: 'rgba(197, 160, 89, 0.15)',
                                          border: '1px solid var(--gold-bright)',
                                          color: 'var(--gold-bright)',
                                          padding: '4px 8px',
                                          borderRadius: '2px',
                                          fontSize: '0.68rem',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          fontWeight: 600
                                        }}
                                        title="Download Customer Uploaded Graphic File"
                                      >
                                        <Download size={11} />
                                        <span>Download</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verified Customer Evaluation Link Generator */}
          <div className="admin-review-link-generator">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="admin-field-label">PRIVATE CLIENT EVALUATION URL</span>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)' }}>
                  Send this verified link to the client via WhatsApp/Email to collect reviews without login requirements:
                </div>
              </div>
            </div>

            <div className="admin-link-input-row">
              <input
                type="text"
                readOnly
                value={reviewUrl}
                className="admin-link-input"
              />
              <button
                type="button"
                className="btn-primary-gold"
                onClick={handleCopyReviewLink}
                style={{ padding: '0.7rem 1.2rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'COPIED' : 'COPY REVIEW LINK'}</span>
              </button>
              <a
                href={`/order-review/${order.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-outline"
                style={{ padding: '0.7rem 1rem', fontSize: '0.76rem' }}
                title="Preview Review Portal"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>

        <div className="admin-dialog-actions">
          <button type="button" className="btn-secondary-outline" onClick={onClose}>
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
