import React, { useState } from 'react';
import { Search, Phone, Mail, MessageSquare, ExternalLink, ShieldCheck, UserCheck } from 'lucide-react';

export const CustomersCRM = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c) => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.phone.includes(searchQuery) ||
           c.city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="admin-view-container">
      
      {/* Search Bar */}
      <div className="admin-action-bar">
        <div className="admin-search-wrapper" style={{ maxWidth: '380px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search client by name, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CLIENT PROFILE</th>
                <th>TIER & STATUS</th>
                <th>PREFERRED SILHOUETTE SIZE</th>
                <th>ORDERS PLACED</th>
                <th>LIFETIME VALUE (LKR)</th>
                <th>CITY / LOCATION</th>
                <th>DIRECT CONCIERGE ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light-muted)' }}>
                    No client profiles found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((client) => {
                  const cleanPhone = client.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr key={client.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div className="admin-avatar-disc">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="admin-client-name">{client.name}</div>
                            <div className="admin-table-sub">{client.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-tier-badge">
                          <ShieldCheck size={12} color="var(--gold-bright)" />
                          <span>{client.tier}</span>
                        </span>
                      </td>

                      <td>
                        <span className="admin-size-pref-tag">
                          {client.preferredSize || 'L (42)'}
                        </span>
                      </td>

                      <td>
                        <strong>{client.totalOrders} {client.totalOrders === 1 ? 'Order' : 'Orders'}</strong>
                      </td>

                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                          LKR {client.totalSpentLKR.toLocaleString()}
                        </div>
                      </td>

                      <td>
                        <span style={{ color: 'var(--text-light-secondary)', fontSize: '0.82rem' }}>
                          {client.city}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-concierge-action-btn"
                            title="Direct WhatsApp Advisory"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            className="admin-concierge-action-btn"
                            title="Direct Phone Call"
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
