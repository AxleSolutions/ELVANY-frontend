import React, { useState } from 'react';
import { Search, Copy, Check, ExternalLink, Filter, Truck, PackageCheck, Clock, Eye, Edit2, X, AlertTriangle } from 'lucide-react';

export const OrdersManager = ({ orders, onUpdateOrderStatus, onViewOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [pendingChange, setPendingChange] = useState(null); // { order, targetStatus, trackingNumber, isEditingTrackingOnly }

  const handleCopyReviewLink = (orderId, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/order-review/${orderId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const slipsCount = orders.filter((o) => o.status === 'Pending Slip Verification' || (o.hasSlipAttached && o.status !== 'Payment Verified — Processing Dispatch' && o.status !== 'Delivered')).length;
  const pendingCount = orders.filter((o) => 
    o.status === 'Pending Slip Verification' || 
    o.status === 'Payment Verified — Processing Dispatch' || 
    o.status === 'Pending Confirmation' || 
    o.status === 'In Production' || 
    o.status === 'Order Confirmed (COD)' || 
    o.status?.includes('Pending') || 
    o.status?.includes('Processing') || 
    o.status?.includes('Confirmed')
  ).length;
  const shippedCount = orders.filter((o) => 
    o.status === 'Shipped (In Transit)' || 
    o.status === 'Packed & Inspected' || 
    o.status?.includes('Transit') || 
    o.status?.includes('Shipped')
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  const filteredOrders = orders.filter((order) => {
    const id = (order.orderId || '').toLowerCase();
    const name = (order.customerName || '').toLowerCase();
    const loc = (order.customerLocation || '').toLowerCase();
    const phone = (order.customerPhone || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = id.includes(search) || name.includes(search) || loc.includes(search) || phone.includes(search);
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    if (statusFilter === 'slips') {
      return order.status === 'Pending Slip Verification' || (order.hasSlipAttached && order.status !== 'Payment Verified — Processing Dispatch' && order.status !== 'Delivered');
    }
    if (statusFilter === 'pending') {
      return order.status === 'Pending Slip Verification' || 
             order.status === 'Payment Verified — Processing Dispatch' || 
             order.status === 'Pending Confirmation' || 
             order.status === 'In Production' || 
             order.status === 'Order Confirmed (COD)' || 
             order.status?.includes('Pending') || 
             order.status?.includes('Processing') || 
             order.status?.includes('Confirmed');
    }
    if (statusFilter === 'shipped') {
      return order.status === 'Shipped (In Transit)' || 
             order.status === 'Packed & Inspected' || 
             order.status?.includes('Transit') || 
             order.status?.includes('Shipped');
    }
    if (statusFilter === 'delivered') {
      return order.status === 'Delivered';
    }
    return true;
  });

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
    <div className="admin-view-container">
      
      {/* Top Action & Filter Bar */}
      <div className="admin-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="admin-search-wrapper" style={{ maxWidth: '340px' }}>
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by #ELV ID, client name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-pills">
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Orders ({orders.length})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'slips' ? 'active' : ''}`}
              onClick={() => setStatusFilter('slips')}
              style={{
                borderColor: slipsCount > 0 ? 'var(--gold-bright)' : undefined,
                color: slipsCount > 0 ? 'var(--gold-bright)' : undefined
              }}
            >
              ⚡ Slip Approvals ({slipsCount})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending / Production ({pendingCount})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'shipped' ? 'active' : ''}`}
              onClick={() => setStatusFilter('shipped')}
            >
              In Transit ({shippedCount})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => setStatusFilter('delivered')}
            >
              Delivered ({deliveredCount})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ORDER PASSPORT</th>
                <th>CLIENT & LOCATION</th>
                <th>PARCEL CONTENTS</th>
                <th>AMOUNT (LKR)</th>
                <th>DISPATCH STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light-muted)' }}>
                    No client orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const total = order.totalLKR || order.items.reduce((a, b) => a + (b.priceLKR || 18500) * (b.quantity || 1), 0);

                  return (
                    <tr key={order.orderId}>
                      <td>
                        <strong className="admin-order-code">#{order.orderId}</strong>
                        <div className="admin-table-sub">{order.orderDate}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', marginTop: '2px' }}>
                          {order.paymentMethod || 'Mastercard'}
                        </div>
                      </td>

                      <td>
                        <div className="admin-client-name">{order.customerName}</div>
                        <div className="admin-table-sub">{order.customerLocation}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                          {order.customerPhone || '071 909 2726'}
                        </div>
                      </td>

                      <td>
                        <div>
                          <span className="admin-item-count">
                            {order.items.length} {order.items.length === 1 ? 'Garment' : 'Garments'}
                          </span>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginTop: '2px' }}>
                            {order.items[0]?.title ? order.items[0].title.substring(0, 26) + '...' : 'Heavyweight Tee'}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                          LKR {total.toLocaleString()}
                        </div>
                      </td>

                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value;
                            if (nextStatus !== order.status) {
                              setPendingChange({
                                order,
                                targetStatus: nextStatus,
                                trackingNumber: order.trackingNumber || order.tracking_number || '',
                                isEditingTrackingOnly: false
                              });
                            }
                          }}
                          className="admin-table-status-select"
                          style={{
                            borderColor: (order.status || '').toLowerCase().includes('reject') ? '#ef4444' : undefined,
                            color: (order.status || '').toLowerCase().includes('reject') ? '#ef4444' : undefined,
                            backgroundColor: (order.status || '').toLowerCase().includes('reject') ? 'rgba(239, 68, 68, 0.12)' : undefined,
                            fontWeight: (order.status || '').toLowerCase().includes('reject') ? 700 : undefined
                          }}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>

                        {/* Citypak Tracking Waybill Pill with Edit Capability */}
                        {(order.trackingNumber || order.tracking_number) ? (
                          <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <a
                              href={`https://track.citypak.lk/track?tracking_number=${encodeURIComponent(order.trackingNumber || order.tracking_number)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.68rem',
                                color: 'var(--gold-bright)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                                padding: '2px 7px',
                                borderRadius: '2px',
                                border: '1px solid var(--gold-border)',
                                fontFamily: 'monospace',
                                fontWeight: 700
                              }}
                              title="Click to track live on Citypak"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Truck size={11} />
                              <span>{order.trackingNumber || order.tracking_number}</span>
                              <ExternalLink size={9} />
                            </a>

                            <button
                              type="button"
                              onClick={() => setPendingChange({
                                order,
                                targetStatus: order.status,
                                trackingNumber: order.trackingNumber || order.tracking_number || '',
                                isEditingTrackingOnly: true
                              })}
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                                borderRadius: '2px',
                                padding: '2px 5px',
                                fontSize: '0.65rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                              title="Edit / Change Citypak Tracking Number"
                            >
                              <Edit2 size={10} />
                              <span>Edit</span>
                            </button>
                          </div>
                        ) : (order.status === 'Payment Verified — Processing Dispatch' || order.status === 'Shipped (In Transit)') ? (
                          <div style={{ marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setPendingChange({
                                order,
                                targetStatus: order.status === 'Payment Verified — Processing Dispatch' ? 'Shipped (In Transit)' : order.status,
                                trackingNumber: '',
                                isEditingTrackingOnly: false
                              })}
                              style={{
                                fontSize: '0.66rem',
                                color: 'var(--gold-bright)',
                                background: 'none',
                                border: '1px dashed var(--gold-border)',
                                padding: '2px 7px',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Attach Citypak Waybill tracking number"
                            >
                              <Truck size={10} />
                              <span>+ Citypak Waybill</span>
                            </button>
                          </div>
                        ) : null}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => onViewOrder(order)}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Luxury Status Change & Tracking Confirmation Modal */}
      {pendingChange && (
        <div 
          className="modal-backdrop" 
          onClick={() => setPendingChange(null)}
          style={{ zIndex: 10001, padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            className="admin-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#0e1014',
              border: '1px solid var(--gold-border)',
              borderRadius: '3px',
              padding: '2rem 1.8rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.95)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--gold-bright)" />
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                  {pendingChange.isEditingTrackingOnly ? 'Edit Citypak Tracking Number' : 'Confirm Order Status Change'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPendingChange(null)} 
                className="admin-close-btn"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Brief */}
            <div style={{ backgroundColor: '#14161b', padding: '0.8rem 1rem', borderRadius: '2px', marginBottom: '1.2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                TARGET ORDER
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                  #{pendingChange.order.orderId}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>
                  {pendingChange.order.customerName}
                </span>
              </div>
            </div>

            {/* Status Transition (if changing status) */}
            {!pendingChange.isEditingTrackingOnly && (
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light-secondary)', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>
                  STATUS TRANSITION
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-light-muted)', textDecoration: 'line-through' }}>
                    {pendingChange.order.status}
                  </span>
                  <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>➔</span>
                  <span style={{ color: '#ffffff', fontWeight: 700, backgroundColor: 'rgba(197, 160, 89, 0.15)', padding: '2px 8px', borderRadius: '2px', border: '1px solid var(--gold-border)' }}>
                    {pendingChange.targetStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Conditional Citypak Waybill Input: shown only when changing status to 'Shipped (In Transit)' or when editing tracking explicitly */}
            {(pendingChange.isEditingTrackingOnly || pendingChange.targetStatus === 'Shipped (In Transit)') && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold-bright)', marginBottom: '0.4rem', letterSpacing: '0.06em', fontWeight: 600 }}>
                  CITYPAK WAYBILL / TRACKING NUMBER
                </label>
                <input 
                  type="text"
                  value={pendingChange.trackingNumber}
                  onChange={(e) => setPendingChange(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="e.g. CPK1088294 or 12345"
                  className="admin-input"
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    backgroundColor: '#090a0d'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)' }}>
                    Auto-searched on <strong style={{ color: '#ffffff' }}>track.citypak.lk</strong> by the customer.
                  </span>
                  {pendingChange.trackingNumber && (
                    <button 
                      type="button" 
                      onClick={() => setPendingChange(prev => ({ ...prev, trackingNumber: '' }))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.68rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear tracking
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={() => setPendingChange(null)}
                style={{ padding: '0.65rem 1.2rem', fontSize: '0.76rem' }}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="btn-primary-gold"
                onClick={() => {
                  const finalTracking = pendingChange.trackingNumber !== undefined ? pendingChange.trackingNumber.trim() : null;
                  onUpdateOrderStatus(pendingChange.order.orderId, pendingChange.targetStatus, finalTracking);
                  setPendingChange(null);
                }}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.76rem', fontWeight: 700 }}
              >
                <Check size={14} />
                <span>CONFIRM & SAVE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
