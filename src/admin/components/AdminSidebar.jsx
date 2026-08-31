import React from 'react';
import { LayoutDashboard, Shirt, ShoppingBag, Star, Users, Settings, ExternalLink, ShieldCheck, ChevronRight, Gift, Megaphone, Bell } from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  onSelectTab, 
  onGoToStore, 
  isCollapsed, 
  onToggleCollapse,
  productsCount = 5,
  ordersCount = 5,
  pendingReviewsCount = 1,
  offersCount = 2,
  isPopupAdActive = true,
  restockRequestsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard, badge: null },
    { id: 'offers', label: 'Privileges & Offers', icon: Gift, badge: `${offersCount} Live` },
    { id: 'popupAd', label: 'Entrance Popup Ad', icon: Megaphone, badge: isPopupAdActive ? 'Active' : 'Off' },
    { id: 'products', label: 'Garments & Stock', icon: Shirt, badge: `${productsCount} Styles` },
    { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, badge: `${ordersCount} Active` },
    { id: 'restockRequests', label: 'Demand & Re-Issues', icon: Bell, badge: restockRequestsCount > 0 ? `${restockRequestsCount} Demands` : null },
    { id: 'reviews', label: 'Client Evaluations', icon: Star, badge: `${pendingReviewsCount} Pending` },
    { id: 'customers', label: 'Client Registry', icon: Users, badge: null },
    { id: 'settings', label: 'Maison Settings', icon: Settings, badge: null }
  ];



  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo-wrap" onClick={() => onSelectTab('dashboard')} style={{ cursor: 'pointer' }}>
          <img 
            src="/logo/Main-4.png" 
            alt="ELVANY" 
            className="admin-sidebar-logo-icon"
          />
          {!isCollapsed && (
            <div className="admin-sidebar-brand-text">
              <div className="admin-sidebar-brand-title">ELVANY</div>
              <div className="admin-sidebar-brand-sub">ATELIER BACKOFFICE</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        <div className="admin-nav-section-label">
          {!isCollapsed && 'MANAGEMENT PORTAL'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectTab(item.id);
              }}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={18} className="admin-nav-icon" />
              {!isCollapsed && (
                <>
                  <span className="admin-nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="admin-nav-badge">{item.badge}</span>
                  )}
                  {isActive && <ChevronRight size={14} className="admin-nav-arrow" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="admin-sidebar-footer">
        <button 
          type="button" 
          className="admin-storefront-btn"
          onClick={onGoToStore}
          title="Open Public Storefront"
        >
          <ExternalLink size={15} />
          {!isCollapsed && <span>VIEW STOREFRONT</span>}
        </button>

        {!isCollapsed && (
          <div className="admin-security-tag">
            <ShieldCheck size={13} color="var(--gold-bright)" />
            <span>AUTHENTICATED ATELIER ADMIN</span>
          </div>
        )}
      </div>
    </aside>
  );
};
