import React, { useState } from 'react';
import { Star, Check, X, ShieldCheck, Search, Trash2 } from 'lucide-react';

export const ReviewsModeration = ({ reviews, onToggleStatus, onDeleteReview }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReviews = reviews.filter((r) => {
    const name = (r.customerName || '').toLowerCase();
    const prod = (r.productTitle || '').toLowerCase();
    const comment = (r.comment || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = name.includes(search) || prod.includes(search) || comment.includes(search);
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && r.status === 'Pending';
    if (statusFilter === 'approved') return matchesSearch && r.status === 'Approved';
    return matchesSearch;
  });

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);
  const trueToSizePercent = Math.round((reviews.filter(r => r.fitRating === 'True to Size').length / (reviews.length || 1)) * 100);

  return (
    <div className="admin-view-container">
      
      {/* Top Metrics Row */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <span className="admin-stat-title">AVERAGE CLIENT RATING</span>
          <div className="admin-stat-value">{avgRating} ★</div>
          <span className="admin-stat-subtext">Across {reviews.length} Verified Reviews</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-title">FIT ACCURACY SCORE</span>
          <div className="admin-stat-value" style={{ color: 'var(--gold-bright)' }}>{trueToSizePercent}%</div>
          <span className="admin-stat-subtext">Rated True to Size</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-title">PENDING MODERATION</span>
          <div className="admin-stat-value" style={{ color: reviews.filter(r => r.status === 'Pending').length > 0 ? '#eab308' : 'var(--gold-bright)' }}>
            {reviews.filter(r => r.status === 'Pending').length} Reviews
          </div>
          <span className="admin-stat-subtext">Awaiting Public Storefront Approval</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="admin-search-wrapper" style={{ maxWidth: '340px' }}>
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search reviewer, garment, comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-pills">
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Evaluations ({reviews.length})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({reviews.filter(r => r.status === 'Pending').length})
            </button>
            <button 
              type="button" 
              className={`admin-filter-pill ${statusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved ({reviews.filter(r => r.status === 'Approved').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="admin-reviews-grid">
        {filteredReviews.length === 0 ? (
          <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            No client reviews found matching your filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="admin-review-card">
              <div className="admin-review-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{rev.customerName}</strong>
                    <span className="admin-verified-buyer-badge">
                      <ShieldCheck size={12} />
                      <span>VERIFIED ORDER #{rev.orderId}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                    {rev.location} • Submitted on {rev.date}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={`admin-status-badge ${rev.status === 'Approved' ? 'active' : 'pending'}`}>
                    {rev.status}
                  </span>
                </div>
              </div>

              {/* Garment & Fit Bar */}
              <div className="admin-review-product-bar">
                <span style={{ color: '#fff', fontWeight: 500 }}>{rev.productTitle}</span>
                <span style={{ color: 'var(--gold-bright)', fontSize: '0.76rem' }}>
                  Fit: <strong>{rev.fitRating}</strong>
                </span>
                <span style={{ color: 'var(--gold-bright)' }}>
                  {'★'.repeat(rev.rating)}
                </span>
              </div>

              <p className="admin-review-body-text">
                "{rev.comment}"
              </p>

              {/* Moderation Actions Bar */}
              <div className="admin-review-actions-bar">
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {rev.status === 'Pending' ? (
                    <button
                      type="button"
                      className="admin-mod-btn approve"
                      onClick={() => onToggleStatus(rev.id, 'Approved')}
                    >
                      <Check size={13} />
                      <span>Approve for Storefront</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-mod-btn unpublish"
                      onClick={() => onToggleStatus(rev.id, 'Pending')}
                    >
                      <X size={13} />
                      <span>Set to Pending</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="admin-mod-btn delete"
                  onClick={() => onDeleteReview(rev.id)}
                  title="Delete Review Permanently"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

