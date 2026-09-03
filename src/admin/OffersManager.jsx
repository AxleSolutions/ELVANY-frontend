import React from 'react';
import { Plus, Edit, Trash2, Tag, Check, Eye, EyeOff, Sparkles, Gift, Flame, ShoppingBag } from 'lucide-react';

export const OffersManager = ({ offers = [], onOpenModal, onToggleOfferStatus, onDeleteOffer }) => {
  const activeCount = offers.filter(o => o.isActive).length;

  return (
    <div className="admin-view-container">
      
      {/* Top Action Bar */}
      <div className="admin-action-bar">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 400 }}>
            Per-Item Privileges & Offers Slideshow
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-light-secondary)', margin: '4px 0 0 0' }}>
            {activeCount > 0 
              ? `Currently ${activeCount} item ${activeCount === 1 ? 'offer is' : 'offers are'} rotating in the interactive slideshow below the hero section.` 
              : 'No active offers. The promotional section is automatically hidden from the storefront.'}
          </p>
        </div>

        <button 
          type="button" 
          className="btn-primary-gold"
          onClick={() => onOpenModal(null)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={15} />
          <span>CREATE ITEM OFFER</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="admin-reviews-grid">
        {offers.length === 0 ? (
          <div className="admin-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <Gift size={32} color="var(--gold-bright)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
              No Item Offers Configured
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-light-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Create your first per-item promotional offer to display in the interactive customer slideshow below the hero.
            </p>
            <button type="button" className="btn-primary-gold" onClick={() => onOpenModal(null)}>
              <Plus size={14} />
              <span>CREATE FIRST ITEM OFFER</span>
            </button>
          </div>
        ) : (
          offers.map((offer) => (
            <div 
              key={offer.id} 
              className={`admin-review-card ${offer.isActive ? 'featured' : ''}`}
              style={{
                borderLeft: offer.isActive ? '3px solid var(--gold-bright)' : '1px solid var(--border-dark)'
              }}
            >
              <div>
                {/* Header with Item Thumbnail */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img 
                    src={offer.productImage || '/images/hero_tshirt.webp'} 
                    alt={offer.productName} 
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#090a0c', border: '1px solid var(--border-dark)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="admin-badge-gold" style={{ fontSize: '0.64rem' }}>
                        {offer.badge || 'PRIVILEGE'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleOfferStatus(offer.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: offer.isActive ? 'rgba(197, 160, 89, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: offer.isActive ? 'var(--gold-bright)' : 'var(--text-light-muted)'
                        }}
                        title="Click to toggle slideshow visibility"
                      >
                        {offer.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{offer.isActive ? 'IN SLIDESHOW' : 'HIDDEN'}</span>
                      </button>
                    </div>

                    <strong style={{ color: '#fff', fontSize: '0.88rem', display: 'block', marginTop: '3px' }}>
                      {offer.productName}
                    </strong>
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#fff', margin: '0 0 0.4rem 0', fontWeight: 500 }}>
                  {offer.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-light-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  {offer.subtitle}
                </p>

                {/* Price & Scarcity Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--gold-bright)'
                  }}>
                    LKR {(offer.offerPriceLKR || 15500).toLocaleString()}
                  </span>
                  {offer.originalPriceLKR && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-light-muted)', textDecoration: 'line-through' }}>
                      LKR {offer.originalPriceLKR.toLocaleString()}
                    </span>
                  )}
                  {offer.discountTag && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', backgroundColor: 'rgba(197, 160, 89, 0.12)', border: '1px solid var(--gold-border)', padding: '2px 6px', borderRadius: '1px', fontWeight: 600 }}>
                      {offer.discountTag}
                    </span>
                  )}
                </div>


                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.74rem', color: 'var(--text-light-muted)', flexWrap: 'wrap' }}>
                  <Flame size={13} color="#f87171" />
                  <span>{offer.remainingUnits || 5} pieces left in allocation</span>
                  <span>•</span>
                  <span>Code: <strong style={{ color: 'var(--gold-bright)' }}>{offer.code || 'ATELIERVIP'}</strong></span>
                </div>

                {/* Expiry Timer Badge */}
                {(() => {
                  const expiry = offer.endsAt || offer.expires_at || offer.expiresAt;
                  if (!expiry) return null;
                  const diff = new Date(expiry).getTime() - Date.now();
                  const isExpired = diff <= 0;
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '2px', backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.12)' : 'rgba(197, 160, 89, 0.1)', color: isExpired ? '#f87171' : 'var(--gold-bright)', border: isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--gold-border)' }}>
                      <span>{isExpired ? '⚠️ EXPIRED' : '⏳ ACTIVE TIMER:'}</span>
                      <span>
                        {isExpired 
                          ? 'Auto-hidden from storefront' 
                          : `${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m remaining (Ends ${new Date(expiry).toLocaleDateString()})`}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.9rem', marginTop: '0.8rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>
                  Interactive Add to Bag Enabled
                </span>


                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="admin-icon-action-btn"
                    onClick={() => onOpenModal(offer)}
                    title="Edit Item Offer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-action-btn delete"
                    onClick={() => onDeleteOffer(offer.id)}
                    title="Delete Item Offer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
