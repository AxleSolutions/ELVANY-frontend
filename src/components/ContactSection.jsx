import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, Check, Clock, ShieldCheck, Copy, Sparkles } from 'lucide-react';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    contactInfo: '',
    subject: 'Sizing & Silhouette Consultation',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('elvanywear@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.contactInfo || !formData.message) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        fullName: '',
        contactInfo: '',
        subject: 'Sizing & Silhouette Consultation',
        message: ''
      });
    }, 4000);
  };

  return (
    <section id="contact" className="contact-section" style={{ backgroundColor: '#0b0b0c', borderTop: '1px solid var(--border-dark)', padding: '6rem 0' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem auto' }}>
          <div className="section-tag" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
            <Sparkles size={13} color="var(--gold-bright)" />
            <span>PRIVATE CLIENT CONCIERGE</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.6vw, 2.8rem)', color: '#fff', fontWeight: 400, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Dedicated Advisory & Inquiries
          </h2>
          <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
            Our atelier concierge is at your service for sizing recommendations, order tracking, and bespoke client consultations.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'stretch'
        }}>
          
          {/* Left Column: Direct Luxury Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            
            {/* Email Channel Card */}
            <div style={{
              backgroundColor: '#121316',
              border: '1px solid var(--border-dark)',
              padding: '1.8rem 2rem',
              borderRadius: '2px',
              transition: 'var(--transition-smooth)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(197, 160, 89, 0.12)',
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                    DIRECT EMAIL CONCIERGE
                  </div>
                  <a 
                    href="mailto:elvanywear@gmail.com" 
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', fontWeight: 600, letterSpacing: '0.02em', textDecoration: 'none' }}
                  >
                    elvanywear@gmail.com
                  </a>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Guaranteed priority response within 2 hours for all styling and order inquiries.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <a
                  href="mailto:elvanywear@gmail.com"
                  className="btn-primary-gold"
                  style={{ padding: '0.65rem 1.2rem', fontSize: '0.74rem' }}
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
                    padding: '0.65rem 1.2rem',
                    borderRadius: '2px',
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  {copiedEmail ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedEmail ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Hotlines Card */}
            <div style={{
              backgroundColor: '#121316',
              border: '1px solid var(--border-dark)',
              padding: '1.8rem 2rem',
              borderRadius: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(197, 160, 89, 0.12)',
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                    CLIENT DIRECT HOTLINES
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fff' }}>
                    Voice & WhatsApp Concierge
                  </div>
                </div>
              </div>

              {/* Line 1 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: '#090a0c',
                border: '1px solid var(--border-dark)',
                borderRadius: '2px',
                marginBottom: '0.8rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>PRIMARY ADVISOR</div>
                  <a href="tel:0719092726" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
                    071 909 2726
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href="tel:0719092726"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#fff', border: '1px solid var(--border-dark)', borderRadius: '2px', textDecoration: 'none' }}
                  >
                    Call
                  </a>
                  <a
                    href="https://wa.me/94719092726"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--gold-bright)', background: 'rgba(197, 160, 89, 0.1)', border: '1px solid var(--gold-border)', borderRadius: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
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
                padding: '0.85rem 1rem',
                backgroundColor: '#090a0c',
                border: '1px solid var(--border-dark)',
                borderRadius: '2px'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)' }}>SECONDARY ADVISOR</div>
                  <a href="tel:0727226991" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
                    072 722 6991
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href="tel:0727226991"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: '#fff', border: '1px solid var(--border-dark)', borderRadius: '2px', textDecoration: 'none' }}
                  >
                    Call
                  </a>
                  <a
                    href="https://wa.me/94727226991"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--gold-bright)', background: 'rgba(197, 160, 89, 0.1)', border: '1px solid var(--gold-border)', borderRadius: '2px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>


            </div>

            {/* Operating Hours Note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-dark)', borderRadius: '2px', fontSize: '0.78rem', color: 'var(--text-light-secondary)' }}>
              <Clock size={15} color="var(--gold-primary)" />
              <div>
                <strong>Concierge Hours:</strong> Monday – Sunday • 9:00 AM – 9:00 PM (Colombo Time)
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Inquiry Form */}
          <div style={{
            backgroundColor: '#121316',
            border: '1px solid var(--border-dark)',
            padding: '2.5rem 2.2rem',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>
                ONLINE INQUIRY
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '1.4rem' }}>
                Send a Message to the Atelier
              </h3>

              {isSubmitted ? (
                <div style={{
                  padding: '2rem 1.5rem',
                  backgroundColor: '#090a0c',
                  border: '1px solid var(--gold-bright)',
                  borderRadius: '2px',
                  textAlign: 'center',
                  animation: 'fadeIn 0.4s ease'
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid var(--gold-bright)',
                    color: 'var(--gold-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <Check size={22} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#fff', marginBottom: '0.4rem' }}>
                    Inquiry Received
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light-secondary)', lineHeight: 1.5 }}>
                    Thank you. A dedicated client advisor will review your message and reach out via your provided contact details shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-row-responsive">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Julian Sterling"
                        className="form-input"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{ backgroundColor: '#090a0c', color: '#fff' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email or Phone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 071 909 2726"
                        className="form-input"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        style={{ backgroundColor: '#090a0c', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Subject of Inquiry</label>
                    <select
                      className="form-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{ backgroundColor: '#090a0c', color: '#fff', cursor: 'pointer' }}
                    >
                      <option value="Sizing & Silhouette Consultation">Sizing & Silhouette Consultation</option>
                      <option value="Order & Delivery Tracking">Order & Delivery Tracking</option>
                      <option value="Fabric & GSM Fabric Specifications">Fabric & GSM Specifications</option>
                      <option value="Bespoke Private Order Inquiries">Bespoke Private Order Inquiries</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please describe how we can assist you with your luxury acquisition..."
                      className="form-input"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ backgroundColor: '#090a0c', color: '#fff', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary-gold"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.82rem' }}
                  >
                    <span>TRANSMIT INQUIRY</span>
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem', fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
              <ShieldCheck size={14} color="var(--gold-primary)" />
              <span>All client communications are strictly confidential.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
