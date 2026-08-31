import React, { useState } from 'react';
import { X, Sparkles, Bell, Check, ShieldCheck, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { createRestockRequest } from '../services/dbService';

const getColorName = (c) => {
  if (!c) return 'Onyx Black';
  if (typeof c === 'string') return c;
  if (typeof c === 'object') return c.name || c.color || c.label || 'Onyx Black';
  return String(c);
};


export const RestockRequestModal = ({
  isOpen,
  onClose,
  product,
  selectedColor = 'Onyx Black',
  selectedSize = 'M (40)',
  loggedInUser,
  userProfile,
  onSuccess
}) => {
  if (!isOpen || !product) return null;

  const initialColor = getColorName(selectedColor || product.color);
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(selectedSize || 'M (40)');
  const [name, setName] = useState(userProfile?.name || loggedInUser || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'];

  const rawColors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : [product.color || 'Onyx Black'];

  const availableColors = Array.from(new Set(rawColors.map(getColorName)));


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !phone) {
      setErrorMsg('Please enter either your email address or mobile number to receive restock notifications.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        productId: product.id,
        productTitle: product.name || product.title,
        productImage: product.image || product.images?.[0] || '/images/hero_tshirt.jpg',
        variantColor: color,
        sizeCode: size,
        customerName: name.trim() || 'VIP Client',
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        notes: notes.trim()
      };

      await createRestockRequest(payload);
      setIsSubmitted(true);
      if (onSuccess) onSuccess(payload);
    } catch (err) {
      console.error('Restock request error:', err);
      setErrorMsg('Could not register your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      data-lenis-prevent="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 10000,
        overflowY: 'auto'
      }}
    >
      <div 
        className="fitting-dialog" 
        data-lenis-prevent="true"
        style={{ 
          maxWidth: '540px', 
          width: '100%',
          backgroundColor: '#0c0d11', 
          border: '1px solid var(--gold-border)',
          borderRadius: '4px',
          padding: '2.5rem 2rem',
          position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
          margin: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close-icon" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-light-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>


        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--gold-bright)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                <Bell size={13} />
                <span>ATELIER DEMAND GAUGE • NO OBLIGATION</span>
              </div>
              
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                color: '#ffffff',
                margin: '0 0 0.5rem 0',
                fontWeight: 400
              }}>
                Request Garment Re-Issue
              </h3>

              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-light-secondary)',
                lineHeight: 1.5,
                margin: 0
              }}>
                Express your acquisition interest for this sold-out piece. We use your request to measure collector demand for future limited production runs.
              </p>
            </div>

            {/* Non-Guarantee Transparency Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: 'rgba(197, 160, 89, 0.08)',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              borderRadius: '2px',
              padding: '0.85rem 1rem',
              marginBottom: '1.3rem',
              fontSize: '0.76rem',
              color: 'var(--text-light-secondary)',
              lineHeight: 1.45
            }}>
              <Bell size={16} color="var(--gold-bright)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--gold-bright)' }}>Please Note (Restock Not Guaranteed):</strong> Registering this request does not guarantee that the garment will be re-made. However, if collective demand reaches our atelier production threshold, a new limited batch will be scheduled and you will receive priority notification.
              </div>
            </div>

            {/* Selected Garment Overview Card */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              backgroundColor: '#07080a',
              padding: '1rem',
              borderRadius: '2px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '1.4rem'
            }}>
              <img 
                src={product.image || product.images?.[0] || '/images/hero_tshirt.jpg'} 
                alt={product.name || product.title} 
                style={{ width: '54px', height: '65px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#ffffff', margin: '0 0 4px 0' }}>
                  {product.name || product.title}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                  Selected: {color} • Size {size}
                </div>
              </div>
            </div>


            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Variant Selector Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>DESIRED SIZE *</label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    className="form-input"
                    style={{ backgroundColor: '#07080a', fontSize: '0.85rem' }}
                  >
                    {availableSizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>COLORWAY</label>
                  <select 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="form-input"
                    style={{ backgroundColor: '#07080a', fontSize: '0.85rem' }}
                  >
                    {availableColors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>FULL NAME</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Christine Jayasuriya"
                  className="form-input"
                  style={{ backgroundColor: '#07080a' }}
                />
              </div>

              {/* Contact Row: Email and Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>EMAIL ADDRESS *</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="form-input"
                    style={{ backgroundColor: '#07080a' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>PHONE / WHATSAPP</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 123 4567"
                    className="form-input"
                    style={{ backgroundColor: '#07080a' }}
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>ADDITIONAL ATELIER REQUEST NOTES (OPTIONAL)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Interested in ordering 2 pieces if produced..."
                  rows={2}
                  className="form-input"
                  style={{ backgroundColor: '#07080a', resize: 'vertical' }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '0.76rem', backgroundColor: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '2px', border: '1px solid #ef4444' }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary-gold"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  marginTop: '0.4rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <span>REGISTERING DEMAND...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>REGISTER ATELIER RE-ISSUE REQUEST</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 160, 89, 0.15)',
              border: '2px solid var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Check size={32} color="var(--gold-bright)" />
            </div>

            <div style={{ color: 'var(--gold-bright)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              INTEREST RECORDED
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 0.8rem 0' }}>
              Atelier Request Confirmed
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-light-secondary)', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 1.8rem auto' }}>
              Your acquisition interest for <strong style={{ color: '#ffffff' }}>{product.name || product.title} ({color}, Size {size})</strong> has been recorded in our demand registry.
              <br /><br />
              <span style={{ fontSize: '0.78rem', color: 'var(--gold-bright)' }}>
                Please note: Re-production is demand-dependent. If sufficient client interest is registered, a limited batch will be scheduled and you will receive priority notification.
              </span>
            </p>


            <button 
              type="button" 
              className="btn-primary-gold" 
              onClick={onClose}
              style={{ padding: '0.85rem 2rem', fontSize: '0.82rem', fontWeight: 700 }}
            >
              RETURN TO ATELIER
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
