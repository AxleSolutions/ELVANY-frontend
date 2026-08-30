import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, LogIn, User, Home, X, Menu, Package, Sliders, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';

export const Navbar = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onNavigateToAccount,
  onLogout,
  onOpenSearch,
  onNavigateToCollection,
  onNavigateToConcierge,
  onNavigateHome,
  onSmoothScrollTo,
  currentView,
  loggedInUser
}) => {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
    }
  };

  const handleArchiveClick = (e) => {
    e.preventDefault();
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      navigate('/collection');
    }
  };

  const handleProfileClick = () => {
    if (loggedInUser) {
      setProfileDropdownOpen(!profileDropdownOpen);
    } else {
      onOpenAuth();
    }
  };

  const handleContactClick = (e) => {
    if (e) e.preventDefault();
    if (onNavigateToConcierge) {
      onNavigateToConcierge();
    } else {
      navigate('/concierge');
    }
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Left Navigation Links */}
          <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', justifySelf: 'start' }}>
            <nav className="nav-links-left">

              <button 
                className={`nav-link ${currentView === 'home' ? 'active-nav' : ''}`}
                onClick={handleHomeClick}
              >
                <span>HOME</span>
              </button>

              <button 
                className={`nav-link ${currentView === 'collection' ? 'active-nav' : ''}`}
                onClick={() => onNavigateToCollection('all')}
              >
                COLLECTION
              </button>

              <button 
                className="nav-link"
                onClick={handleArchiveClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ARCHIVE
              </button>

              <button 
                className={`nav-link ${currentView === 'concierge' ? 'active-nav' : ''}`}
                onClick={handleContactClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                CONCIERGE
              </button>
            </nav>
          </div>

          {/* Center Brand Identity */}
          <a 
            href="#" 
            className="brand-logo-container"
            onClick={handleHomeClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img 
              src="/logo/Main-6.png" 
              alt="ELVANY" 
              className="brand-logo-img"
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="brand-logo-text" style={{ display: 'none' }}>ELVANY</span>
          </a>

          {/* Right Action Icons */}
          <div className="nav-actions-right">
            <button 
              className="nav-action-btn"
              onClick={onOpenSearch}
              title="Search Collection"
            >
              <Search size={16} />
              <span className="hide-mobile">SEARCH</span>
            </button>

            <button 
              className="nav-action-btn"
              onClick={onOpenCart}
              title="Shopping Bag"
            >
              <ShoppingBag size={16} />
              <span className="hide-mobile">BAG</span>
              <span className="bag-count-badge">({cartCount})</span>
            </button>

            {/* Profile / Login Button with Dropdown Container */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                className="nav-login-btn"
                onClick={handleProfileClick}
                title={loggedInUser ? `Maison Account: ${loggedInUser}` : 'Log In'}
                style={{ gap: '0.4rem' }}
              >
                {loggedInUser ? (
                  <>
                    <User size={14} />
                    <span className="hide-mobile">{loggedInUser.split('@')[0].split(' ')[0]}</span>
                    <ChevronDown size={11} className="hide-mobile" style={{ opacity: 0.6 }} />
                  </>
                ) : (
                  <>
                    <LogIn size={14} />
                    <span className="hide-mobile">LOG IN</span>
                  </>
                )}
              </button>

              {/* Logged-In Luxury Profile Dropdown Menu */}
              {loggedInUser && profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar-circle">
                      {loggedInUser.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="profile-name-text">{loggedInUser}</div>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <button 
                    className="profile-dropdown-item"
                    onClick={() => { setProfileDropdownOpen(false); onNavigateToAccount('orders'); }}
                  >
                    <Package size={14} color="var(--gold-primary)" />
                    <span>My Orders & Reviews</span>
                  </button>

                  <button 
                    className="profile-dropdown-item"
                    onClick={() => { setProfileDropdownOpen(false); onNavigateToAccount('profile'); }}
                  >
                    <User size={14} color="var(--gold-primary)" />
                    <span>Sizing Profile & Guide</span>
                  </button>

                  <button 
                    className="profile-dropdown-item"
                    onClick={() => { setProfileDropdownOpen(false); onNavigateToAccount('settings'); }}
                  >
                    <Sliders size={14} color="var(--gold-primary)" />
                    <span>Account Settings & Addresses</span>
                  </button>

                  <div className="profile-dropdown-divider" />

                  <button 
                    className="profile-dropdown-item logout"
                    onClick={() => { 
                      setProfileDropdownOpen(false); 
                      if (onLogout) onLogout(); 
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown (Smooth Entrance & Exit) */}
      <div className={`mobile-dropdown-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button 
          className="mobile-nav-link"
          onClick={(e) => { 
            handleHomeClick(e);
            setMobileMenuOpen(false); 
          }}
        >
          <Home size={15} color="var(--gold-bright)" />
          <span>HOME</span>
        </button>

        <button 
          className="mobile-nav-link"
          onClick={() => { 
            onNavigateToCollection('all'); 
            setMobileMenuOpen(false); 
          }}
        >
          <span>COLLECTION</span>
        </button>

        <button 
          className="mobile-nav-link"
          onClick={(e) => {
            handleArchiveClick(e);
            setMobileMenuOpen(false);
          }}
        >
          <span>ARCHIVE & EDITIONS</span>
        </button>

        <button 
          className="mobile-nav-link"
          onClick={(e) => {
            handleContactClick(e);
            setMobileMenuOpen(false);
          }}
        >
          <span>CONCIERGE & APPOINTMENTS</span>
        </button>

        {loggedInUser ? (
          <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '1rem', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button 
              className="btn-primary-gold" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { 
                if (onNavigateToAccount) onNavigateToAccount('orders'); 
                setMobileMenuOpen(false); 
              }}
            >
              <span>MY ACCOUNT & ORDERS</span>
            </button>
            <button 
              onClick={() => { 
                if (onLogout) onLogout(); 
                setMobileMenuOpen(false); 
              }}
              style={{
                width: '100%',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-light-muted)',
                padding: '0.8rem',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                letterSpacing: '0.08em'
              }}
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '1rem', marginTop: '0.6rem' }}>
            <button 
              className="btn-primary-gold" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { 
                onOpenAuth(); 
                setMobileMenuOpen(false); 
              }}
            >
              <span>CLIENT LOG IN</span>
            </button>
          </div>
        )}
      </div>
    </header>


  );
};
