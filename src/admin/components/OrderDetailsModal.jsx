import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, PackageCheck, Truck, Clock, ShieldCheck, Mail, Phone, MapPin, Building2, UploadCloud } from 'lucide-react';

export const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending Slip Verification');

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order?.status]);

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
          <div className="admin-order-status-banner">
            <div>
              <span className="admin-field-label">CURRENT DISPATCH PIPELINE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '4px' }}>
                <span className={`admin-status-badge ${selectedStatus.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                  {selectedStatus}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)' }}>
                  Placed: {order.orderDate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', fontWeight: 600 }}>CHANGE STATUS:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="admin-status-select"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Slip Inspection Banner for Bank Transfers */}
          {(order.paymentSlipUrl || order.paymentMethod?.includes('Bank') || order.status === 'Pending Slip Verification') && (
            <div style={{
              backgroundColor: '#0c0d12',
              border: order.status === 'Pending Slip Verification' ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
              borderRadius: '2px',
              padding: '1.4rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-bright)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  <Building2 size={16} />
                  <span>DIRECT BANK TRANSFER PAYMENT SLIP</span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  backgroundColor: order.status === 'Pending Slip Verification' ? 'var(--gold-bright)' : '#1a1c22',
                  color: order.status === 'Pending Slip Verification' ? '#000000' : 'var(--gold-bright)',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '1px'
                }}>
                  {order.status === 'Pending Slip Verification' ? 'AWAITING ATELIER APPROVAL' : 'VERIFIED SLIP'}
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
              {order.items.map((item, idx) => (
                <div key={idx} className="admin-parcel-item-row">
                  <img src={item.image || '/images/tshirt_white.jpg'} alt={item.title} className="admin-parcel-item-thumb" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                      Size: <span style={{ color: '#fff' }}>{item.size}</span> • Color: <span style={{ color: '#fff' }}>{item.color || 'Onyx Black'}</span> • Qty: <span style={{ color: '#fff' }}>{item.quantity || 1}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                    LKR {((item.priceLKR || 18500) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
