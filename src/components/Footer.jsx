import React from 'react';
import { Mail, Phone, ArrowUpRight } from 'lucide-react';

export const Footer = ({ onNavigateToCollection, onNavigateToConcierge, onNavigateToCustomLab }) => {
  return (
    <footer className="footer-section">
      <div className="container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand & Direct Contact */}
          <div>
            <div style={{ marginBottom: '1.2rem' }}>
              <img 
                src="/logo/Main-6.png" 
                alt="ELVANY" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <p className="footer-brand-desc" style={{ marginBottom: '1.2rem' }}>
              Haute luxury heavyweight T-shirts and noble cotton essentials. Architectural cuts, 280 GSM Sea Island cotton, and bespoke craftsmanship.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-light-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={14} color="var(--gold-primary)" />
                <a href="mailto:elvanywear@gmail.com" style={{ color: 'var(--text-light-secondary)' }}>
                  elvanywear@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={14} color="var(--gold-primary)" />
                <a href="tel:0719092726" style={{ color: 'var(--text-light-secondary)' }}>
                  071 909 2726
                </a>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <a href="tel:0727226991" style={{ color: 'var(--text-light-secondary)' }}>
                  072 722 6991
                </a>
              </div>
            </div>
          </div>

          {/* Quick Collections Navigation */}
          <div>
            <h4 className="footer-col-title">T-SHIRT EDITIONS</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="#custom-lab" onClick={(e) => { e.preventDefault(); if (onNavigateToCustomLab) onNavigateToCustomLab(); }}>
                  <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>★ Bespoke Custom Lab (Design Tee)</span>
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#offerings" onClick={(e) => { e.preventDefault(); if (onNavigateToCollection) onNavigateToCollection('heavyweight'); }}>
                  Heavyweight (280 GSM)
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#offerings" onClick={(e) => { e.preventDefault(); if (onNavigateToCollection) onNavigateToCollection('silk-cotton'); }}>
                  Silk & Mercerized Tees
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#offerings" onClick={(e) => { e.preventDefault(); if (onNavigateToCollection) onNavigateToCollection('oversized'); }}>
                  Minimalist Boxy Cuts
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#offerings" onClick={(e) => { e.preventDefault(); if (onNavigateToCollection) onNavigateToCollection('all'); }}>
                  Complete T-Shirt Capsule
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="footer-col-title">CONNECT</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Instagram</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.5 }} />
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span>Facebook</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.5 }} />
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                  </svg>
                  <span>X (Twitter)</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.5 }} />
                </a>
              </li>
              <li className="footer-link-item">
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  <span>YouTube</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.5 }} />
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="footer-col-title">CUSTOMER CARE</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="#concierge" onClick={(e) => { e.preventDefault(); if (onNavigateToConcierge) onNavigateToConcierge(); }}>
                  Private Client Concierge
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#concierge" onClick={(e) => { e.preventDefault(); if (onNavigateToConcierge) onNavigateToConcierge(); }}>
                  Shipping & Deliveries
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#concierge" onClick={(e) => { e.preventDefault(); if (onNavigateToConcierge) onNavigateToConcierge(); }}>
                  T-Shirt Sizing Guidance
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#concierge" onClick={(e) => { e.preventDefault(); if (onNavigateToConcierge) onNavigateToConcierge(); }}>
                  Bespoke Appointments
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Elegant Brand Watermark */}
        <div className="footer-watermark-wrap">
          <div className="footer-watermark-text">ELVANY</div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>© 2026 ELVANY. ALL RIGHTS RESERVED.</div>
          <div className="footer-legal-links">
            <span>SRI LANKA</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <a 
              href="/admin" 
              style={{ color: 'var(--text-light-muted)', textDecoration: 'none', fontSize: '0.72rem' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold-bright)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light-muted)'}
            >
              ATELIER ADMIN
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
