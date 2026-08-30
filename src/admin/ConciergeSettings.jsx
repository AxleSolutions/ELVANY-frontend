import React, { useState } from 'react';
import { Save, Check, Phone, Mail, Clock, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export const ConciergeSettings = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="admin-view-container" style={{ maxWidth: '880px' }}>
      
      <form onSubmit={handleSubmit} className="admin-settings-form">
        
        {/* Contact & Hotlines Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={17} color="var(--gold-bright)" />
              <h3 className="admin-card-title">Maison Advisory Hotlines & Email</h3>
            </div>
            <span className="admin-badge-gold">PUBLIC CONCIERGE</span>
          </div>

          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Primary Advisor Hotline (Call & WhatsApp)</label>
              <input
                type="text"
                required
                value={formData.phonePrimary}
                onChange={(e) => setFormData({ ...formData, phonePrimary: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Secondary Advisor Hotline</label>
              <input
                type="text"
                required
                value={formData.phoneSecondary}
                onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Concierge Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Concierge Operating Hours</label>
              <input
                type="text"
                required
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="form-input admin-input"
              />
            </div>
          </div>
        </div>

        {/* Courier & Dispatch Settings */}
        <div className="admin-card" style={{ marginTop: '1.5rem' }}>
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck size={17} color="var(--gold-bright)" />
              <h3 className="admin-card-title">Island-Wide Courier & Dispatch Timeline</h3>
            </div>
          </div>

          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Delivery Timeline Display Note</label>
              <input
                type="text"
                required
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className="form-input admin-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hero Carousel Rotation Speed (Seconds)</label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="15"
                value={formData.heroAutoRotateSeconds}
                onChange={(e) => setFormData({ ...formData, heroAutoRotateSeconds: parseFloat(e.target.value) || 6.5 })}
                className="form-input admin-input"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          {savedSuccess && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-bright)', fontSize: '0.84rem' }}>
              <Check size={16} />
              <span>Settings updated successfully!</span>
            </span>
          )}


          <button type="submit" className="btn-primary-gold" style={{ padding: '0.95rem 2rem' }}>
            <Save size={15} />
            <span>SAVE MAISON CONFIGURATION</span>
          </button>
        </div>

      </form>

    </div>
  );
};
