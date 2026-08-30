import React from 'react';
import { Shield, Feather, Clock } from 'lucide-react';

export const Philosophy = () => {
  return (
    <section id="philosophy" className="philosophy-section">
      <div className="container">
        <div className="philosophy-accent-line" />

        <blockquote className="philosophy-quote">
          “The luxury T-shirt is the foundation of modern elegance—defined by precise collar geometry, heavyweight drape, and pure cotton integrity.”
        </blockquote>

        <div className="pillars-grid">
          <div className="pillar-item">
            <h3 className="pillar-title">
              <Shield size={18} color="var(--gold-primary)" />
              280 GSM Heavyweight Cotton
            </h3>
            <p className="pillar-text">
              Dense organic combed cotton jersey that holds an immaculate, structured silhouette without clinging.
            </p>
          </div>

          <div className="pillar-item">
            <h3 className="pillar-title">
              <Feather size={18} color="var(--gold-primary)" />
              Reinforced Collar Geometry
            </h3>
            <p className="pillar-text">
              High-density double-needle bound ribbing engineered to maintain a crisp, permanent neckline.
            </p>
          </div>

          <div className="pillar-item">
            <h3 className="pillar-title">
              <Clock size={18} color="var(--gold-primary)" />
              Pre-Shrunk Dimensional Stability
            </h3>
            <p className="pillar-text">
              Combed long-staple cotton treated to preserve exact fit, texture, and deep color across years of wear.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
