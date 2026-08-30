import React, { useState } from 'react';
import { Search, Bell, Menu, Shield, User, ArrowUpRight, Check } from 'lucide-react';

export const AdminHeader = ({ 
  onToggleSidebar, 
  activeTab, 
  globalSearch, 
  onSearchChange,
  orders = [],
  reviews = [],
  products = []
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute live notifications from database state
  const liveNotifications = [];

  // 1. Pending orders
  orders
    .filter(o => o.status === 'Pending Verification' || o.hasSlipAttached)
    .slice(0, 3)
    .forEach(o => {
      liveNotifications.push({
        id: `ord-${o.orderId}`,
        title: `Order #${o.orderId} Verification`,
        desc: `${o.customerName} placed order in ${o.customerLocation}. Verification required.`,
        time: o.orderDate || 'Recent',
        unread: true
      });
    });

  // 2. Pending reviews
  reviews
    .filter(r => r.status === 'Pending')
    .slice(0, 2)
    .forEach(r => {
      liveNotifications.push({
        id: `rev-${r.id}`,
        title: 'Evaluation Pending Moderation',
        desc: `${r.customerName} submitted a ${r.rating}★ rating for ${r.productTitle}.`,
        time: r.date || 'Recent',
        unread: true
      });
    });

  // 3. Low stock alerts (< 25 units)
  products
    .filter(p => {
      if (!p.inventory) return false;
      const total = Object.values(p.inventory).reduce((a, b) => a + (Number(b) || 0), 0);
      return total < 25;
    })
    .slice(0, 2)
    .forEach(p => {
      liveNotifications.push({
        id: `stock-${p.id}`,
        title: 'Low Inventory Notice',
        desc: `${p.title} has low remaining units across sizes.`,
        time: 'Catalog Watch',
        unread: false
      });
    });

  const notificationsCount = liveNotifications.filter(n => n.unread).length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Overview';
      case 'offers': return 'Privileges & Promotional Offers';
      case 'products': return 'Garments & Stock Inventory';
      case 'orders': return 'Client Orders & VIP Dispatch Hub';
      case 'reviews': return 'Client Evaluations & Moderation';
      case 'customers': return 'Private Client Registry & CRM';
      case 'settings': return 'Maison Brand & Concierge Settings';
      default: return 'Atelier Backoffice';
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button 
          type="button" 
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={19} />
        </button>

        <div>
          <div className="admin-breadcrumb-top">MAISON ELVANY</div>
          <h1 className="admin-header-title">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="admin-header-right">
        {/* Global Search Bar */}
        <div className="admin-search-wrapper">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search orders, SKU, clients, fabric GSM..."
            value={globalSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="admin-header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Alerts"
          >
            <Bell size={17} />
            {notificationsCount > 0 && (
              <span className="admin-notification-badge">{notificationsCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notifications-dropdown">
              <div className="admin-notifications-header">
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Atelier Notifications ({liveNotifications.length})</span>
                <span style={{ color: 'var(--gold-bright)', fontSize: '0.72rem', cursor: 'pointer' }}>Live Synced</span>
              </div>

              <div className="admin-notifications-list">
                {liveNotifications.length === 0 ? (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-light-muted)', fontSize: '0.78rem' }}>
                    ✓ All atelier operations healthy. No pending alerts.
                  </div>
                ) : (
                  liveNotifications.map((n) => (
                    <div key={n.id} className={`admin-notification-item ${n.unread ? 'unread' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '0.78rem', color: '#fff' }}>{n.title}</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {n.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Pill */}
        <div className="admin-profile-pill">
          <div className="admin-profile-avatar">
            A
          </div>
          <div className="admin-profile-info hide-mobile">
            <div className="admin-profile-name">Atelier Master</div>
            <div className="admin-profile-role">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
