import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, ShieldCheck, Mail, Phone, Clock, MapPin, Check, Copy, ExternalLink } from 'lucide-react';

export const PolicyLayout = ({
  badge = 'OFFICIAL STORE POLICY',
  title,
  subtitle,
  lastUpdated = 'November 23, 2026',
  navLinks = [],
  seoTitle,
  seoDescription,
  children
}) => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (seoTitle) {
      document.title = `${seoTitle} | ELVANY Sri Lanka`;
    }
    if (seoDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = seoDescription;
    }
  }, [seoTitle, seoDescription]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('elvanywear@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="policy-page">
      <div className="policy-container">
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
            <button 
              type="button"
              className="search-back-btn"
              onClick={() => navigate('/')}
              style={{ marginBottom: 0, padding: 0 }}
            >
              <Home size={14} color="#8f6f32" />
              <span>HOME</span>
            </button>
            <span style={{ color: '#d4cdc3' }}>/</span>
            <span style={{ color: '#8f6f32', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              {title}
            </span>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="section-action-link"
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            <ArrowLeft size={13} />
            <span>BACK TO STORE</span>
          </button>
        </div>

        {/* Hero Header Card */}
        <div className="policy-hero-card">
          <div className="policy-badge">
            <ShieldCheck size={13} />
            <span>{badge}</span>
          </div>

          <h1 className="policy-title">{title}</h1>
          <p className="policy-subtitle">{subtitle}</p>

          <div className="policy-meta-row">
            <div className="policy-meta-item">
              <Clock size={14} color="#8f6f32" />
              <span>Last Updated: <strong>{lastUpdated}</strong></span>
            </div>
            <div className="policy-meta-item">
              <MapPin size={14} color="#8f6f32" />
              <span>Jurisdiction: <strong>Sri Lanka</strong></span>
            </div>
            <div className="policy-meta-item">
              <span>Domain: <strong>https://elvany.lk</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Jump Navigation Pills */}
        {navLinks && navLinks.length > 0 && (
          <nav aria-label="Policy Table of Contents" className="policy-nav-pills">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className="policy-nav-pill"
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* Main Body Content Card */}
        <main className="policy-content-card">
          {children}
        </main>

        {/* Customer Support & Contact Section */}
        <section aria-label="Customer Support Contact" className="policy-contact-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8f6f32', fontSize: '0.72rem', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} />
            <span>PAYHERE VERIFIED COMPLIANCE & CLIENT CARE</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#121316', margin: '0 0 0.5rem 0', fontWeight: 500 }}>
            Questions Regarding Our Policies?
          </h2>
          <p style={{ color: '#4a4c54', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, maxWidth: '680px' }}>
            Our client support team is available Monday through Saturday (9:00 AM – 6:00 PM IST) to assist with orders, sizing consultations, returns, and payment queries.
          </p>

          <div className="policy-contact-grid">
            {/* Email */}
            <div className="policy-contact-item">
              <Mail size={18} color="#8f6f32" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Direct Email</div>
                <div style={{ marginTop: '3px' }}>
                  <a href="mailto:elvanywear@gmail.com">elvanywear@gmail.com</a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedEmail ? '#10b981' : '#767982',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedEmail ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedEmail ? 'Copied to clipboard' : 'Copy email address'}</span>
                </button>
              </div>
            </div>

            {/* Telephone & Hotline */}
            <div className="policy-contact-item">
              <Phone size={18} color="#8f6f32" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Hotline / Phone</div>
                <div style={{ marginTop: '3px' }}>
                  <a href="tel:0765293943">076 529 3943</a>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#767982', marginTop: '4px' }}>
                  Voice & Direct Assistance
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="policy-contact-item">
              <div style={{ width: 18, height: 18, flexShrink: 0, marginTop: '2px', color: '#25D366' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.97.57 3.824 1.574 5.39L2.247 21.84l4.57-1.328A9.99 9.99 0 0012.03 22c5.535 0 10.031-4.496 10.031-10.031C22.062 6.496 17.566 2 12.031 2zm0 18.232c-1.637 0-3.197-.488-4.52-1.328l-.324-.203-2.709.787.787-2.639-.215-.342A8.196 8.196 0 013.824 12.03c0-4.524 3.683-8.207 8.207-8.207 4.524 0 8.207 3.683 8.207 8.207 0 4.524-3.683 8.202-8.207 8.202z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>WhatsApp Concierge</div>
                <div style={{ marginTop: '3px' }}>
                  <a 
                    href="https://wa.me/94765293943?text=Hi%20ELVANY%2C%20I%20have%20an%20inquiry%20regarding%20your%20store%20policies."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    076 529 3943
                  </a>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#767982', marginTop: '4px' }}>
                  Instant chat & order telemetry
                </div>
              </div>
            </div>

            {/* Registered Entity */}
            <div className="policy-contact-item">
              <MapPin size={18} color="#8f6f32" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Registered Entity</div>
                <div style={{ marginTop: '3px', fontWeight: 600, color: '#121316', fontSize: '0.88rem' }}>
                  ELVANY
                </div>
                <div style={{ fontSize: '0.72rem', color: '#767982', marginTop: '2px' }}>
                  Online Clothing & Fashion Retail • Sri Lanka
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8f6f32', marginTop: '2px' }}>
                  https://elvany.lk
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};