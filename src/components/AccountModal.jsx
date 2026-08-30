import React, { useState } from 'react';
import { X, Package, User, Sliders, LogOut, Check, ArrowRight, ShieldCheck, MapPin, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccountModal = ({
  isOpen,
  onClose,
  loggedInUser,
  onLogout,
  ordersList = []
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [savedSize, setSavedSize] = useState('L (42)');
  const [savedFit, setSavedFit] = useState('Structured Tailored');
  const [address, setAddress] = useState('Via Montenapoleone 14, 20121 Milano, Italy');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGoToOrderReview = (orderId) => {
    onClose();
    navigate(`/order-review/${orderId}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="fitting-dialog" 
        style={{ maxWidth: '640px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Client Passport Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', marginBottom: '1.5rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--gold-primary)',
            color: '#0b0b0c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 700
          }}>
            {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : 'M'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff' }}>
                {loggedInUser || 'Julian Sterling'}
              </h2>
              <span className="verified-badge" style={{ fontSize: '0.65rem' }}>
                PRIVILEGE CLIENT
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-light-muted)' }}>
              Maison ELVANY Private Account • Verified Session
            </p>
          </div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-light-secondary)',
              padding: '0.5rem 0.9rem',
              borderRadius: '2px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            title="Sign Out of Session"
          >
            <LogOut size={13} />
            <span>LOG OUT</span>
          </button>
        </div>

        {/* Account Navigation Tabs */}
        <div className="pdp-tab-headers" style={{ marginBottom: '1.8rem' }}>
          <button
            className={`pdp-tab-header ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            MY ORDERS ({ordersList.length})
          </button>
          <button
            className={`pdp-tab-header ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            SIZING & FIT PREFERENCES
          </button>
          <button
            className={`pdp-tab-header ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ACCOUNT SETTINGS
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>
              Your Client Orders & Unboxing Certificates
            </h4>

            {ordersList.length === 0 ? (
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.85rem' }}>No previous orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '340px', overflowY: 'auto' }}>
                {ordersList.map((order) => (
                  <div
                    key={order.orderId}
                    style={{
                      backgroundColor: '#121316',
                      border: '1px solid var(--border-dark)',
                      padding: '1.2rem 1.4rem',
                      borderRadius: '2px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.9rem' }}>
                          #{order.orderId}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                          • {order.orderDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light-secondary)' }}>
                        {order.items.length} {order.items.length === 1 ? 'Garment' : 'Garments'} ({order.items.map((i) => i.name).join(', ')})
                      </div>
                    </div>

                    <button
                      className="btn-primary-gold"
                      onClick={() => handleGoToOrderReview(order.orderId)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', gap: '0.4rem' }}
                    >
                      <QrCode size={13} />
                      <span>QR REVIEW PORTAL</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sizing & Fit */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveSettings}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>
              Personalized Sizing & Silhouette Profile
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Preferred T-Shirt Size</label>
                <select
                  className="form-input"
                  value={savedSize}
                  onChange={(e) => setSavedSize(e.target.value)}
                >
                  <option value="S (38)">S (38 IT / UK)</option>
                  <option value="M (40)">M (40 IT / UK)</option>
                  <option value="L (42)">L (42 IT / UK)</option>
                  <option value="XL (44)">XL (44 IT / UK)</option>
                  <option value="XXL (46)">XXL (46 IT / UK)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Silhouette Drape Preference</label>
                <select
                  className="form-input"
                  value={savedFit}
                  onChange={(e) => setSavedFit(e.target.value)}
                >
                  <option value="Structured Tailored">Structured Tailored Fit</option>
                  <option value="Classic Regular">Classic Regular Fit</option>
                  <option value="Architectural Oversized">Architectural Boxy Cut</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Default Shipping Destination</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary-gold" style={{ padding: '0.8rem 1.6rem', fontSize: '0.8rem' }}>
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>PREFERENCES SAVED</span>
                </>
              ) : (
                <span>SAVE SIZING PROFILE</span>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>
              Client Communications & Security
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.8rem', fontSize: '0.85rem', color: 'var(--text-light-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold-primary)' }} />
                <span>Receive early access alerts for limited capsule releases</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold-primary)' }} />
                <span>Send SMS tracking notifications for express courier deliveries</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold-primary)' }} />
                <span>Enable encrypted two-factor private concierge authentication</span>
              </label>
            </div>

            <button type="submit" className="btn-primary-gold" style={{ padding: '0.8rem 1.6rem', fontSize: '0.8rem' }}>
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>SETTINGS UPDATED</span>
                </>
              ) : (
                <span>UPDATE SETTINGS</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
