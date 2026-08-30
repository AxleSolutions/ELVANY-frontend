import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Star, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export const SubmitReviewPage = ({ onAddNewReview }) => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Find pre-selected product if specified in URL or default to first product
  const defaultProduct = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const [selectedProdId, setSelectedProdId] = useState(defaultProduct.id);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [rating, setRating] = useState(5);
  const [sizePurchased, setSizePurchased] = useState('M (40)');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentProduct = PRODUCTS.find((p) => p.id === selectedProdId) || defaultProduct;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!author || !content) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author,
      location: location || 'Verified Client',
      rating: Number(rating),
      date: 'Just now',
      sizePurchased,
      colorPurchased: currentProduct.color,
      title: title || 'Exceptional Quality',
      content,
      helpfulCount: 0
    };

    if (onAddNewReview) {
      onAddNewReview(selectedProdId, newRev);
    }

    setSubmitted(true);
  };

  return (
    <div className="submit-review-page" style={{ minHeight: '100vh', backgroundColor: '#090a0c', color: '#fff', padding: '4rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', marginBottom: '2.5rem' }}>
          <button 
            className="search-back-btn"
            onClick={() => navigate('/')}
            style={{ marginBottom: 0 }}
          >
            <Home size={14} color="var(--gold-bright)" />
            <span>HOME</span>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            PRIVATE CLIENT INVITATION REVIEW
          </span>
        </div>

        {submitted ? (
          <div className="review-submitted-card" style={{
            backgroundColor: '#121316',
            border: '1px solid var(--gold-border)',
            padding: '3.5rem 2rem',
            borderRadius: '2px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(197, 160, 89, 0.15)',
              border: '1px solid var(--gold-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--gold-bright)'
            }}>
              <Check size={32} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#fff', marginBottom: '0.8rem' }}>
              Evaluation Recorded
            </h2>
            <p style={{ color: 'var(--text-light-secondary)', fontSize: '0.94rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
              Thank you, {author}. Your verified evaluation for <strong>{currentProduct.name}</strong> has been authenticated and published to the Maison product archive.
            </p>

            <button 
              className="btn-primary-gold"
              onClick={() => navigate(`/product/${currentProduct.id}`)}
              style={{ padding: '1rem 2.2rem' }}
            >
              <span>VIEW ON PRODUCT PAGE</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#121316',
            border: '1px solid var(--border-dark)',
            padding: '3rem 2.5rem',
            borderRadius: '2px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--gold-bright)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem'
              }}>
                <ShieldCheck size={15} />
                <span>PRIVATE CLIENT EVALUATION PORTAL</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 400, color: '#fff' }}>
                Submit Client Review
              </h1>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.86rem', marginTop: '0.4rem' }}>
                Invitation portal for verified patrons of Maison ELVANY.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Product Selector */}
              <div className="form-group">
                <label className="form-label">Garment Being Evaluated</label>
                <select
                  className="form-input"
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.color})
                    </option>
                  ))}
                </select>
              </div>

              {/* Order / Client Verification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Client Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Julian Sterling"
                    className="form-input"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location (City, Country)</label>
                  <input
                    type="text"
                    placeholder="Milan, Italy"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Order Reference # (Optional)</label>
                  <input
                    type="text"
                    placeholder="ELV-89421"
                    className="form-input"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Size Purchased</label>
                  <select
                    className="form-input"
                    value={sizePurchased}
                    onChange={(e) => setSizePurchased(e.target.value)}
                  >
                    {currentProduct.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rating Selector */}
              <div className="form-group">
                <label className="form-label">Overall Rating Score</label>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: star <= rating ? 'var(--gold-bright)' : 'rgba(255,255,255,0.2)',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <Star size={24} fill={star <= rating ? 'var(--gold-bright)' : 'transparent'} />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', color: 'var(--gold-bright)', fontWeight: 600, marginLeft: '0.5rem' }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Uncompromising collar weight and drape"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Client Feedback</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the 280 GSM fabric density, collar retention across washes, and fit silhouette..."
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', marginTop: '1rem' }}
              >
                <span>PUBLISH VERIFIED EVALUATION</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
