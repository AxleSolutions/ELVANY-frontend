import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getApiUrl } from '../services/dbService';

export const Newsletter = ({ onSubscribeSuccess }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    const subscriberRecord = {
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source: 'Seasonal Capsule Newsletter'
    };

    // 1. Save to Local Storage Collection
    try {
      const saved = JSON.parse(localStorage.getItem('elvany_newsletter_subscribers') || '[]');
      if (!saved.some(s => s.email === cleanEmail)) {
        saved.unshift(subscriberRecord);
        localStorage.setItem('elvany_newsletter_subscribers', JSON.stringify(saved));
      }
    } catch {}

    // 2. Send to Backend API (which writes to Excel/CSV spreadsheet)
    try {
      const apiUrl = getApiUrl();

      await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'Seasonal Capsule Newsletter' })
      });
    } catch (err) {
      console.log('Backend newsletter endpoint note:', err);
    }

    // 3. Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('newsletter_subscribers')
          .upsert({ email: cleanEmail, source: 'Seasonal Capsule Newsletter' }, { onConflict: 'email' });
      } catch (err) {
        console.log('Supabase newsletter note:', err);
      }
    }

    setIsLoading(false);
    setSubmitted(true);
    if (onSubscribeSuccess) {
      onSubscribeSuccess(cleanEmail);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-inner">
          <div className="newsletter-tag">
            NEWSLETTER
          </div>

          <h2 className="newsletter-title">
            Receive New Capsule Releases
          </h2>

          <p className="newsletter-desc">
            Sign up for updates on seasonal pieces and private fitting invitations.
          </p>

          {submitted ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--gold-bright)',
              background: 'rgba(197, 160, 89, 0.1)',
              padding: '0.85rem 1.8rem',
              border: '1px solid var(--gold-border)',
              borderRadius: '2px',
              fontSize: '0.84rem'
            }}>
              <Check size={16} />
              <span>Thank you for subscribing to ELVANY.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="newsletter-input"
              />
              <button 
                type="submit" 
                className="newsletter-submit-btn"
                disabled={isLoading}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className="spin-animation" />
                    <span>JOINING...</span>
                  </>
                ) : (
                  <span>JOIN</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
