import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, subtext, trend, isPositive = true, icon: Icon, badge }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <span className="admin-stat-title">{title}</span>
        {Icon && (
          <div className="admin-stat-icon-wrap">
            <Icon size={18} color="var(--gold-bright)" />
          </div>
        )}
      </div>

      <div className="admin-stat-value">{value}</div>

      <div className="admin-stat-footer">
        {trend && (
          <span className={`admin-stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{trend}</span>
          </span>
        )}
        {subtext && <span className="admin-stat-subtext">{subtext}</span>}
        {badge && <span className="admin-stat-badge">{badge}</span>}
      </div>
    </div>
  );
};
