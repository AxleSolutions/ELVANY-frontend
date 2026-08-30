import React, { useState } from 'react';
import { X, Calendar, MapPin, Check, Clock, UserCheck } from 'lucide-react';

export const PrivateFittingModal = ({ isOpen, onClose, onBookingSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    atelier: 'Florence Flagship (Via de’ Tornabuoni)',
    date: '',
    service: 'Full Bespoke Sartorial Wardrobe'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onBookingSuccess) {
      onBookingSuccess(formData);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="fitting-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(197, 160, 89, 0.15)',
              border: '1px solid var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--gold-bright)'
            }}>
              <Check size={28} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
              Fitting Reserved
            </h3>

            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Thank you, <strong>{formData.name}</strong>. A dedicated Senior Master Tailor from our <strong>{formData.atelier}</strong> atelier will contact you within 4 hours to personalize your private salon appointment.
            </p>

            <button className="btn-primary-gold" onClick={onClose}>
              RETURN TO ATELIER
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                color: 'var(--gold-bright)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                BY PRIVATE INVITATION & APPOINTMENT
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', fontWeight: 500 }}>
                Book Private Atelier Fitting
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Julian Sterling"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telephone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 20 7946 0912"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Atelier Location</label>
                <select
                  className="form-select"
                  value={formData.atelier}
                  onChange={(e) => setFormData({ ...formData, atelier: e.target.value })}
                >
                  <option>Florence Flagship (Via de’ Tornabuoni)</option>
                  <option>Milan Showroom (Via Montenapoleone)</option>
                  <option>London Mayfair Salon</option>
                  <option>New York Madison Avenue Residence</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fitting Objective</label>
                  <select
                    className="form-select"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option>Full Bespoke Sartorial Wardrobe</option>
                    <option>Cashmere Overcoat Commission</option>
                    <option>Wedding & Black Tie Atelier</option>
                    <option>Seasonal Capsule Consultation</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-gold"
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}
              >
                <span>CONFIRM PRIVATE APPOINTMENT</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
