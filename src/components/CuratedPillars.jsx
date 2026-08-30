import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const CuratedPillars = ({ onSelectCategory }) => {
  return (
    <section id="pillars" className="curated-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-row">
          <div>
            <div className="section-tag">SIGNATURE CATEGORIES</div>
            <h2 className="section-main-title">Curated Pillars</h2>
          </div>
          <button 
            className="section-action-link"
            onClick={() => onSelectCategory('all')}
          >
            <span>EXPLORE ALL (24)</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 3-Column Categories Grid */}
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => onSelectCategory(cat.categoryKey)}
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="category-card-bg" 
              />
              <div className="category-card-overlay">
                <div className="category-card-top">
                  <h3 className="category-card-title">{cat.title}</h3>
                  <p className="category-card-sub">{cat.subtitle}</p>
                </div>
                <div className="category-card-action">
                  <span>{cat.actionText}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
