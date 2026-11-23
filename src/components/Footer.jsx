import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowUpRight, ShieldCheck } from 'lucide-react';

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
              Premium everyday T-shirts and contemporary essentials. Precision cuts, durable comfort knit fabrics, and refined craftsmanship.
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
                <a href="tel:0765293943" style={{ color: 'var(--text-light-secondary)' }}>
                  076 529 3943
                </a>
              </div>
            </div>
          </div>

          {/* Client Care & Legal Policies */}
          <div>
            <h4 className="footer-col-title">CLIENT CARE & POLICIES</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <Link to="/return-policy" onClick={() => window.scrollTo(0, 0)}>
                  Return & Refund Policy
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
                  Privacy Policy
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/terms-and-conditions" onClick={() => window.scrollTo(0, 0)}>
                  Terms & Conditions
                </Link>
              </li>
              {onNavigateToConcierge && (
                <li className="footer-link-item">
                  <a 
                    href="/concierge" 
                    onClick={(e) => { e.preventDefault(); onNavigateToConcierge(); }}
                  >
                    Client Concierge & Sizing
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="footer-col-title">CONNECT</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a 
                  href="https://www.instagram.com/elvanywear?igsi=YTNrZmRnYjQ5MHpy" 
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
                  href="https://www.facebook.com/share/1DJMXG87jp/" 
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
            <Link to="/return-policy" onClick={() => window.scrollTo(0, 0)}>Return & Refund Policy</Link>
            <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
            <Link to="/terms-and-conditions" onClick={() => window.scrollTo(0, 0)}>Terms & Conditions</Link>
            <span>SRI LANKA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
