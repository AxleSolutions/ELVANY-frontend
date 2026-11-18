import React from 'react';
import { Shield, Feather, Clock } from 'lucide-react';

export const Philosophy = () => {
  return (
    <section id="philosophy" className="philosophy-section">
      <div className="container">
        <div className="philosophy-accent-line" />

        <blockquote className="philosophy-quote">
          “The essential T-shirt is the foundation of modern style—defined by precise collar geometry, clean structural drape, and reliable everyday comfort.”
        </blockquote>

        <div className="pillars-grid">
          <div className="pillar-item">
            <h3 className="pillar-title">
              <Shield size={18} color="var(--gold-primary)" />
              Durable Fabric Structure
            </h3>
            <p className="pillar-text">
              High-grade jersey engineered to hold an immaculate, clean silhouette without clinging.
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
              Treated yarns formulated to preserve exact fit, texture, and deep color across daily wear and washes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
