import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Mail, Phone, Check, Clock, ShieldCheck, Copy, Sparkles, ArrowLeft, ChevronDown, PackageCheck, Scissors } from 'lucide-react';

export const ConciergePage = () => {
  const navigate = useNavigate();

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('elvanywear@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const faqs = [
    {
      q: 'How does bespoke sizing guidance work?',
      a: 'Our senior advisors analyze your shoulder width, chest circumference, and preferred drape to recommend the exact architectural silhouette between our tailored regular and relaxed drop-shoulder cuts.'
    },
    {
      q: 'What are the delivery timelines across Sri Lanka?',
      a: 'Orders placed before 2:00 PM are processed same-day. Complimentary white-glove express courier delivers within 24 to 48 hours to Colombo, Kandy, Galle, and island-wide destinations.'
    },
    {
      q: 'Can I schedule a private fabric consultation or bespoke order?',
      a: 'Yes. Contact our primary or secondary advisors directly via WhatsApp or phone to coordinate bespoke sizing or private capsule appointments.'
    },
    {
      q: 'What is the return and exchange policy for luxury garments?',
      a: 'We offer a 7-day complimentary exchange window for unworn garments in original architectural packaging with security tags intact.'
    }
  ];

  return (
    <div className="concierge-page">
      <div className="concierge-container">
        
        {/* Top Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
            <button 
              type="button"
              className="search-back-btn"
              onClick={() => navigate('/')}
              style={{ marginBottom: 0 }}
            >
              <Home size={14} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              PRIVATE CLIENT CONCIERGE
            </span>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="section-action-link"
            style={{ fontSize: '0.78rem' }}
          >
            <ArrowLeft size={13} />
            <span>BACK TO STORE</span>
          </button>
        </div>

        {/* Hero Header Card */}
        <div className="concierge-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="concierge-avatar">
                <img 
                  src="/logo/Main-4.png" 
                  alt="ELVANY Monogram" 
                  style={{ width: '34px', height: '34px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                  MAISON ELVANY ATELIER CONCIERGE
                </div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', fontWeight: 400, color: '#ffffff', margin: 0 }}>
                  Private Client Advisory
                </h1>
              </div>
            </div>

            <div className="concierge-status-pill">
              <span className="concierge-status-dot" />
              <span>Advisors Active • Mon – Fri • 9:00 AM – 9:00 PM</span>
            </div>
          </div>
        </div>

        {/* Direct Advisory Communication Cards Grid */}
        <div className="concierge-channels-grid">
          
          {/* Email Concierge Card */}
          <div className="concierge-channel-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(197, 160, 89, 0.1)',
                  border: '1px solid var(--gold-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-bright)',
                  flexShrink: 0
                }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                    DIRECT EMAIL CONCIERGE
                  </div>
                  <a 
                    href="mailto:elvanywear@gmail.com"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}
                  >
                    elvanywear@gmail.com
                  </a>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-light-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Guaranteed priority response within 2 hours for styling recommendations, custom garment measurements, and order tracking.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="mailto:elvanywear@gmail.com"
                className="btn-primary-gold"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.76rem' }}
              >
                <span>WRITE EMAIL</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: copiedEmail ? 'var(--gold-bright)' : 'var(--text-light-secondary)',
                  padding: '0.75rem 1.2rem',
                  borderRadius: '3px',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedEmail ? 'COPIED' : 'COPY ADDRESS'}</span>
              </button>
            </div>
          </div>

          {/* Voice & WhatsApp Concierge Hotlines Card */}
          <div className="concierge-channel-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(197, 160, 89, 0.1)',
                  border: '1px solid var(--gold-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-bright)',
                  flexShrink: 0
                }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                    DIRECT ADVISORY HOTLINES
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#ffffff' }}>
                    Voice & WhatsApp Concierge
                  </div>
                </div>
              </div>

              {/* Primary Advisor */}
              <div className="concierge-advisor-row">
                <div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-light-muted)', letterSpacing: '0.08em' }}>PRIMARY ADVISOR</div>
                  <a href="tel:0719092726" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
                    071 909 2726
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <a
                    href="tel:0719092726"
                    style={{ padding: '6px 12px', fontSize: '0.72rem', color: '#ffffff', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '3px', textDecoration: 'none' }}
                  >
                    Call
                  </a>
                  <a
                    href="https://wa.me/94719092726"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '6px 12px', fontSize: '0.72rem', color: 'var(--gold-bright)', background: 'rgba(197, 160, 89, 0.08)', border: '1px solid var(--gold-border)', borderRadius: '3px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Secondary Advisor */}
              <div className="concierge-advisor-row" style={{ marginBottom: 0 }}>
                <div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-light-muted)', letterSpacing: '0.08em' }}>SECONDARY ADVISOR</div>
                  <a href="tel:0727226991" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
                    072 722 6991
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <a
                    href="tel:0727226991"
                    style={{ padding: '6px 12px', fontSize: '0.72rem', color: '#ffffff', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '3px', textDecoration: 'none' }}
                  >
                    Call
                  </a>
                  <a
                    href="https://wa.me/94727226991"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '6px 12px', fontSize: '0.72rem', color: 'var(--gold-bright)', background: 'rgba(197, 160, 89, 0.08)', border: '1px solid var(--gold-border)', borderRadius: '3px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Atelier Operating Hours & Commitments Banner */}
        <div className="concierge-privileges-grid">
          <div className="concierge-privilege-item">
            <Clock size={20} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>OPERATING HOURS</div>
              <div style={{ fontSize: '0.82rem', color: '#ffffff', marginTop: '2px' }}>Mon – Fri • 9:00 AM – 9:00 PM</div>
            </div>
          </div>

          <div className="concierge-privilege-item">
            <PackageCheck size={20} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>ISLAND-WIDE COURIER</div>
              <div style={{ fontSize: '0.82rem', color: '#ffffff', marginTop: '2px' }}>24 – 48 Hour White-Glove Dispatch</div>
            </div>
          </div>

          <div className="concierge-privilege-item">
            <ShieldCheck size={20} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', color: 'var(--gold-bright)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>CONFIDENTIALITY</div>
              <div style={{ fontSize: '0.82rem', color: '#ffffff', marginTop: '2px' }}>Private Client Discretion</div>
            </div>
          </div>
        </div>

        {/* Frequently Answered Inquiries Accordion */}
        <div className="concierge-faq-card">
          <div style={{ color: 'var(--gold-bright)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
            FREQUENTLY ANSWERED INQUIRIES
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#ffffff', marginBottom: '1.25rem', fontWeight: 400 }}>
            Atelier Protocols & Services
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
                <button
                  type="button"
                  className={`concierge-faq-btn ${openFaq === idx ? 'active' : ''}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={15} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
                </button>
                {openFaq === idx && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light-secondary)', lineHeight: 1.65, marginTop: '0.4rem', margin: 0, paddingBottom: '0.4rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
