import React from 'react';
import { StatCard } from './components/StatCard';
import { DollarSign, ShoppingBag, Shirt, Star, ArrowUpRight, AlertTriangle, PackageCheck, Clock, ExternalLink, Plus, Mail, Download } from 'lucide-react';

export const AdminDashboard = ({ 
  products = [], 
  orders = [], 
  reviews = [], 
  customers = [], 
  subscribers = [],
  onNavigateTab, 
  onOpenProductModal, 
  onViewOrder 
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalLKR) || 0), 0);
  const totalInventory = products.reduce((sum, p) => {
    if (p.totalStock !== undefined && Number(p.totalStock) >= 0) return sum + Number(p.totalStock);
    if (p.inventory) return sum + Object.values(p.inventory).reduce((a, b) => a + (Number(b) || 0), 0);
    return sum;
  }, 0);
  const pendingReviewsCount = reviews.filter(r => r.status === 'Pending' || r.status === 'pending_moderation').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  // Calculate low stock items (< 25 total units)
  const lowStockItems = products.filter(p => {
    const total = p.totalStock !== undefined 
      ? Number(p.totalStock) 
      : (p.inventory ? Object.values(p.inventory).reduce((a, b) => a + (Number(b) || 0), 0) : 0);
    return total < 25;
  });

  const handleExportSubscribers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
      const response = await fetch(`${apiUrl}/newsletter/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ELVANY_VIP_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn('Backend export notice:', e);
    }

    // Client-side fallback Excel/CSV generator using live database subscribers
    const liveSubscribers = subscribers.length > 0 
      ? subscribers 
      : JSON.parse(localStorage.getItem('elvany_newsletter_subscribers') || '[]');

    const BOM = '\uFEFF';
    let csv = BOM + 'Subscriber Email,Subscribed Date,Source Channel,Status\r\n';
    if (liveSubscribers.length === 0) {
      csv += 'no-subscribers-yet@elvany.com,2026-08-30 00:00:00,Capsule Newsletter,Pending\r\n';
    } else {
      liveSubscribers.forEach(s => {
        csv += `"${s.email}","${new Date(s.subscribedAt || Date.now()).toLocaleString()}","${s.source || 'Capsule Newsletter'}","${s.status || 'Active VIP'}"\r\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ELVANY_VIP_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="admin-view-container">
      
      {/* Top Welcome & Quick Actions Banner */}
      <div className="admin-welcome-card">
        <div>
          <span className="admin-badge-gold">ATELIER EXECUTIVE DESK</span>
          <h2 className="admin-welcome-title">Maison Overview & Performance</h2>
          <p className="admin-welcome-desc">
            Live telemetry for Florence craftsmanship, Sri Lanka VIP dispatch, and client evaluations.
          </p>
        </div>

        <div className="admin-welcome-actions">
          <button 
            type="button" 
            className="btn-primary-gold"
            onClick={() => onOpenProductModal(null)}
          >
            <Plus size={15} />
            <span>ADD NEW GARMENT</span>
          </button>
          <button 
            type="button" 
            className="btn-secondary-outline"
            onClick={() => onNavigateTab('orders')}
          >
            <span>VIEW DISPATCH QUEUE</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="admin-stats-grid">
        <StatCard
          title="TOTAL GROSS REVENUE"
          value={`LKR ${(totalRevenue).toLocaleString()}`}
          trend={orders.length > 0 ? `${orders.length} Orders Recorded` : "0 Orders"}
          isPositive={totalRevenue > 0}
          subtext="Live Database Telemetry"
          icon={DollarSign}
        />
        <StatCard
          title="ACTIVE ORDERS IN PIPELINE"
          value={`${activeOrdersCount} Parcels`}
          trend={activeOrdersCount > 0 ? `${activeOrdersCount} Active Dispatch` : "0 Pending Dispatch"}
          isPositive={activeOrdersCount > 0}
          subtext="Colombo & Island-wide"
          icon={ShoppingBag}
        />
        <StatCard
          title="TOTAL INVENTORY UNITS"
          value={`${totalInventory} Pieces`}
          subtext={products.length > 0 ? `Across ${products.length} Garments` : "0 Garments in Catalog"}
          icon={Shirt}
          badge={lowStockItems.length > 0 ? `${lowStockItems.length} Low Stock` : null}
        />
        <StatCard
          title="CLIENT SATISFACTION"
          value={`${avgRating} ★`}
          trend={reviews.length > 0 ? `${reviews.length} Client Ratings` : "Awaiting First Review"}
          isPositive={reviews.length > 0}
          subtext={`${reviews.length} Verified Reviews`}
          icon={Star}
        />
      </div>

      {/* Main Two-Column Grid: Recent Orders & Alerts */}
      <div className="admin-dashboard-split-grid">
        
        {/* Left: Recent Orders Feed */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Client Orders</h3>
              <p className="admin-card-subtitle">Live orders with verified review links</p>
            </div>
            <button 
              type="button" 
              className="admin-link-action"
              onClick={() => onNavigateTab('orders')}
            >
              <span>View All Orders</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="admin-table-wrapper">
            {orders.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-light-muted)', fontSize: '0.84rem' }}>
                <PackageCheck size={28} color="var(--border-dark)" style={{ margin: '0 auto 0.8rem auto', display: 'block' }} />
                <span>No client orders in database yet. Live dispatch queue will populate automatically when clients place orders.</span>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CLIENT & CITY</th>
                    <th>GARMENTS</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 4).map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <strong className="admin-order-code">#{order.orderId}</strong>
                        <div className="admin-table-sub">{order.orderDate}</div>
                      </td>
                      <td>
                        <div className="admin-client-name">{order.customerName}</div>
                        <div className="admin-table-sub">{order.customerLocation}</div>
                      </td>
                      <td>
                        <span className="admin-item-count">{order.items.length} {order.items.length === 1 ? 'Garment' : 'Garments'}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--gold-bright)' }}>
                          LKR {(order.totalLKR || 0).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span className={`admin-status-badge ${order.status.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="admin-action-btn"
                          onClick={() => onViewOrder(order)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Urgent Alerts & Evaluation Moderation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Pending Reviews Queue */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Pending Evaluations ({pendingReviewsCount})</h3>
              <button 
                type="button" 
                className="admin-link-action"
                onClick={() => onNavigateTab('reviews')}
              >
                <span>Moderate</span>
              </button>
            </div>

            <div className="admin-pending-reviews-list">
              {reviews.filter(r => r.status === 'Pending').length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-light-muted)', fontSize: '0.82rem' }}>
                  ✓ All client evaluations have been moderated.
                </div>
              ) : (
                reviews.filter(r => r.status === 'Pending').map((rev) => (
                  <div key={rev.id} className="admin-pending-review-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{rev.customerName}</strong>
                      <span style={{ color: 'var(--gold-bright)', fontSize: '0.78rem' }}>{'★'.repeat(rev.rating)}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginBottom: '4px' }}>
                      {rev.productTitle} • {rev.fitRating}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light-secondary)', margin: 0, lineHeight: 1.4 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Newsletter VIP Subscribers & Excel Export */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--gold-bright)" />
                <h3 className="admin-card-title">VIP Newsletter Subscribers</h3>
              </div>
              <button 
                type="button" 
                className="btn-primary-gold"
                onClick={handleExportSubscribers}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Export subscriber emails directly to an Excel/CSV spreadsheet"
              >
                <Download size={13} />
                <span>EXPORT EXCEL / CSV</span>
              </button>
            </div>

            <div style={{ padding: '1rem', background: '#090a0c', border: '1px solid var(--border-dark)', borderRadius: '2px', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>Total Subscribed Clients</span>
                <strong style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {subscribers.length} VIPs
                </strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', textAlign: 'right' }}>
                <div>✓ Live Database</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>Capsule Invitations</div>
              </div>
            </div>

            <div className="admin-stock-alerts-list">
              {subscribers.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-light-muted)', fontSize: '0.78rem' }}>
                  No newsletter subscribers yet.
                </div>
              ) : (
                subscribers.slice(0, 4).map((s, idx) => (
                  <div key={s.id || idx} className="admin-stock-alert-item" style={{ padding: '0.6rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--gold-bright)' }} />
                      <span style={{ color: '#fff', fontSize: '0.8rem' }}>{s.email}</span>
                    </div>
                    <span style={{ color: 'var(--text-light-muted)', fontSize: '0.7rem' }}>
                      {new Date(s.subscribedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#eab308" />
                <h3 className="admin-card-title">Atelier Stock Watch</h3>
              </div>
              <button 
                type="button" 
                className="admin-link-action"
                onClick={() => onNavigateTab('products')}
              >
                <span>Restock</span>
              </button>
            </div>

            <div className="admin-stock-alerts-list">
              {lowStockItems.map((prod) => {
                const total = Object.values(prod.inventory || {}).reduce((a, b) => a + b, 0);
                return (
                  <div key={prod.id} className="admin-stock-alert-item">
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.82rem', display: 'block' }}>{prod.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>{prod.category} • {prod.gsm} GSM</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.82rem' }}>{total} in stock</span>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>Urgent restock</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
