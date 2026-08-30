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
    <div className="concierge-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Top Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
            <button 
              className="search-back-btn"
              onClick={() => navigate('/')}
              style={{ marginBottom: 0 }}
            >
              <Home size={14} color="var(--gold-bright)" />
              <span>HOME</span>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              PRIVATE CLIENT CONCIERGE
            </span>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="section-action-link"
            style={{ fontSize: '0.78rem' }}
          >
            <ArrowLeft size={13} />
            <span>BACK TO STORE</span>
          </button>
        </div>

        {/* Hero Header Banner */}
        <div style={{
          backgroundColor: '#121316',
          border: '1px solid var(--border-dark)',
          padding: '2.8rem 2.5rem',
          borderRadius: '2px',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.8rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/logo/Main-4.png" 
                  alt="ELVANY Monogram" 
                  style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <div style={{ color: 'var(--gold-bright)', fontSize: '0.72rem', letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
                  MAISON ELVANY ATELIER CONCIERGE
                </div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.2vw, 2.6rem)', fontWeight: 400, color: '#fff', margin: 0 }}>
                  Private Client Advisory & Inquiries
                </h1>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--border-dark)', padding: '0.55rem 1.1rem', borderRadius: '2px', fontSize: '0.74rem', color: 'var(--text-light-secondary)', letterSpacing: '0.06em' }}>
              <span>Advisors Active • Mon – Fri • 9:00 AM – 9:00 PM</span>
            </div>
          </div>
        </div>

        {/* Direct Advisory Communication Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.8rem',
          marginBottom: '2.5rem'
        }}>
          
          {/* Email Concierge Card */}
          <div style={{
            backgroundColor: '#121316',
            border: '1px solid var(--border-dark)',
            padding: '2.2rem',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(197, 160, 89, 0.12)',
                  border: '1px solid var(--gold-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-bright)',
                  flexShrink: 0
                }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
                    DIRECT EMAIL CONCIERGE
                  </div>
                  <a 
                    href="mailto:elvanywear@gmail.com"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem', color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                  >
                    elvanywear@gmail.com
                  </a>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-light-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Guaranteed priority response within 2 hours for styling recommendations, garment specifications, and order updates.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <a
                href="mailto:elvanywear@gmail.com"
                className="btn-primary-gold"
                style={{ padding: '0.85rem 1.6rem', fontSize: '0.78rem' }}
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
                  border: '1px solid var(--border-dark)',
                  color: copiedEmail ? 'var(--gold-bright)' : 'var(--text-light-secondary)',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '2px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedEmail ? 'COPIED' : 'COPY ADDRESS'}</span>
              </button>
            </div>
          </div>

          {/* Voice & WhatsApp Concierge Hotlines Card */}
          <div style={{
            backgroundColor: '#121316',
            border: '1px solid var(--border-dark)',
            padding: '2.2rem',
            borderRadius: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-bright)',
                flexShrink: 0
              }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
                  DIRECT ADVISORY HOTLINES
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#fff' }}>
                  Voice & WhatsApp Concierge
                </div>
              </div>
            </div>

            {/* Line 1 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.2rem',
              backgroundColor: '#090a0c',
              border: '1px solid var(--border-dark)',
              borderRadius: '2px',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.8rem'
            }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', letterSpacing: '0.1em' }}>PRIMARY ADVISOR</div>
                <a href="tel:0719092726" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.12rem', textDecoration: 'none' }}>
                  071 909 2726
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href="tel:0719092726"
                  style={{ padding: '7px 14px', fontSize: '0.76rem', color: '#fff', background: 'transparent', border: '1px solid var(--border-dark)', borderRadius: '2px', textDecoration: 'none' }}
                >
                  Call
                </a>
                <a
                  href="https://wa.me/94719092726"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '7px 14px', fontSize: '0.76rem', color: 'var(--gold-bright)', background: 'transparent', border: '1px solid var(--gold-border)', borderRadius: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Line 2 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.2rem',
              backgroundColor: '#090a0c',
              border: '1px solid var(--border-dark)',
              borderRadius: '2px',
              flexWrap: 'wrap',
              gap: '0.8rem'
            }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-light-muted)', letterSpacing: '0.1em' }}>SECONDARY ADVISOR</div>
                <a href="tel:0727226991" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.12rem', textDecoration: 'none' }}>
                  072 722 6991
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href="tel:0727226991"
                  style={{ padding: '7px 14px', fontSize: '0.76rem', color: '#fff', background: 'transparent', border: '1px solid var(--border-dark)', borderRadius: '2px', textDecoration: 'none' }}
                >
                  Call
                </a>
                <a
                  href="https://wa.me/94727226991"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '7px 14px', fontSize: '0.76rem', color: 'var(--gold-bright)', background: 'transparent', border: '1px solid var(--gold-border)', borderRadius: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Atelier Operating Hours & Commitments Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.4rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.4rem 1.6rem', backgroundColor: '#121316', border: '1px solid var(--border-dark)', borderRadius: '2px' }}>
            <Clock size={20} color="var(--gold-primary)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>OPERATING HOURS</div>
              <div style={{ fontSize: '0.84rem', color: '#ffffff', marginTop: '2px' }}>Mon – Fri • 9:00 AM – 9:00 PM</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.4rem 1.6rem', backgroundColor: '#121316', border: '1px solid var(--border-dark)', borderRadius: '2px' }}>
            <PackageCheck size={20} color="var(--gold-primary)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>ISLAND-WIDE COURIER</div>
              <div style={{ fontSize: '0.84rem', color: '#ffffff', marginTop: '2px' }}>3 – 5 Day Delivery</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.4rem 1.6rem', backgroundColor: '#121316', border: '1px solid var(--border-dark)', borderRadius: '2px' }}>
            <ShieldCheck size={20} color="var(--gold-primary)" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>CONFIDENTIALITY</div>
              <div style={{ fontSize: '0.84rem', color: '#ffffff', marginTop: '2px' }}>Private Client Discretion</div>
            </div>
          </div>
        </div>

        {/* Frequently Answered Inquiries Accordion */}
        <div style={{ backgroundColor: '#121316', border: '1px solid var(--border-dark)', padding: '2.5rem', borderRadius: '2px' }}>
          <div style={{ color: 'var(--gold-bright)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>
            FREQUENTLY ANSWERED INQUIRIES
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '1.6rem' }}>
            Atelier Protocols & Services
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx === faqs.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: openFaq === idx ? 'var(--gold-bright)' : '#fff',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                    padding: '0.4rem 0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={15} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
                </button>
                {openFaq === idx && (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-light-secondary)', lineHeight: 1.65, marginTop: '0.6rem' }}>
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
