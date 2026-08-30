import React, { useState } from 'react';
import { Search, Copy, Check, ExternalLink, Filter, Truck, PackageCheck, Clock, Eye } from 'lucide-react';

export const OrdersManager = ({ orders, onUpdateOrderStatus, onViewOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

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
                <th>VERIFIED REVIEW LINK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light-muted)' }}>
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
                          onChange={(e) => onUpdateOrderStatus(order.orderId, e.target.value)}
                          className="admin-table-status-select"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-copy-link-btn"
                          onClick={(e) => handleCopyReviewLink(order.orderId, e)}
                          title="Copy Private Review Portal Link"
                        >
                          {copiedId === order.orderId ? (
                            <>
                              <Check size={13} color="var(--gold-bright)" />
                              <span style={{ color: 'var(--gold-bright)' }}>COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>COPY REVIEW URL</span>
                            </>
                          )}
                        </button>
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

    </div>
  );
};
