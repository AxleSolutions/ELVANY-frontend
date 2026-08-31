import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Flame, 
  Check, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  Sparkles,
  TrendingUp,
  Filter,
  CheckCircle2,
  Download,
  Copy,
  Layers,
  Send,
  X,
  AlertCircle,
  Eye,
  Tag,
  UserCheck,
  RefreshCw
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'Pending Atelier Review', label: 'Pending Atelier Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  { id: 'In Production / Sourcing', label: 'In Production / Sourcing', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
  { id: 'Restocked / Ready', label: 'Restocked / Ready', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.3)' },
  { id: 'Client Notified', label: 'Client Notified', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
  { id: 'Archived', label: 'Archived', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.25)' }
];

export const RestockRequestsManager = ({
  requests = [],
  onUpdateStatus,
  onDeleteRequest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifyRequest, setSelectedNotifyRequest] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [customNotifyNote, setCustomNotifyNote] = useState('');
  const [notifyTemplateType, setNotifyTemplateType] = useState('restocked');

  // Aggregated demand per product, colorway and size
  const demandMap = {};
  requests.forEach(r => {
    const key = `${r.productTitle || 'Garment'} — ${r.variantColor || 'Standard'} (${r.sizeCode || 'M'})`;
    if (!demandMap[key]) {
      demandMap[key] = {
        title: r.productTitle || 'Haute Atelier Garment',
        color: r.variantColor || 'Onyx Black',
        size: r.sizeCode || 'M (40)',
        image: r.productImage || '/images/hero_tshirt.jpg',
        count: 0
      };
    }
    demandMap[key].count += 1;
  });

  const topDemands = Object.values(demandMap).sort((a, b) => b.count - a.count);

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const title = (r.productTitle || '').toLowerCase();
    const name = (r.customerName || '').toLowerCase();
    const email = (r.customerEmail || '').toLowerCase();
    const phone = (r.customerPhone || '').toLowerCase();
    const size = (r.sizeCode || '').toLowerCase();
    const color = (r.variantColor || '').toLowerCase();
    const notes = (r.notes || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = 
      title.includes(q) || 
      name.includes(q) || 
      email.includes(q) || 
      phone.includes(q) || 
      size.includes(q) ||
      color.includes(q) ||
      notes.includes(q);

    if (!matchesSearch) return false;

    const s = (r.status || '').toLowerCase();
    if (statusFilter === 'pending') {
      return s.includes('pending');
    }
    if (statusFilter === 'production') {
      return s.includes('production');
    }
    if (statusFilter === 'fulfilled') {
      return s.includes('restocked') || s.includes('notified') || s.includes('fulfilled');
    }
    return true;
  });

  // Calculate metrics
  const pendingCount = requests.filter(r => (r.status || '').includes('Pending')).length;
  const inProductionCount = requests.filter(r => (r.status || '').includes('Production')).length;
  const fulfilledCount = requests.filter(r => 
    (r.status || '').includes('Restocked') || 
    (r.status || '').includes('Notified') || 
    (r.status || '').includes('Fulfilled')
  ).length;
  const uniqueClients = new Set(requests.map(r => r.customerEmail || r.customerPhone || r.customerName)).size;

  // Copy full customer demand record
  const handleCopyRecord = (r) => {
    const text = `ELVANY RESTOCK DEMAND #${r.id}
Client Name: ${r.customerName}
Email: ${r.customerEmail || 'N/A'}
Phone: ${r.customerPhone || 'N/A'}
Garment: ${r.productTitle} (${r.variantColor}, Size ${r.sizeCode})
Special Notes: ${r.notes || 'None'}
Status: ${r.status}
Requested On: ${new Date(r.createdAt).toLocaleString()}`;
    
    navigator.clipboard.writeText(text);
    setCopyFeedback(r.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Export ledger to CSV
  const handleExportCSV = () => {
    if (requests.length === 0) return;
    const headers = ['Request ID', 'Garment Title', 'Colorway', 'Size', 'Client Name', 'Client Email', 'Client Phone', 'Client Notes', 'Status', 'Requested Date'];
    const rows = requests.map(r => [
      `"${r.id}"`,
      `"${(r.productTitle || '').replace(/"/g, '""')}"`,
      `"${(r.variantColor || '').replace(/"/g, '""')}"`,
      `"${(r.sizeCode || '').replace(/"/g, '""')}"`,
      `"${(r.customerName || '').replace(/"/g, '""')}"`,
      `"${(r.customerEmail || '').replace(/"/g, '""')}"`,
      `"${(r.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${(r.status || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ELVANY_Restock_Demand_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build customer notification message
  const getNotificationText = (req, type) => {
    if (!req) return '';
    const name = req.customerName || 'Valued Client';
    const piece = `${req.productTitle} (${req.variantColor}, Size ${req.sizeCode})`;
    
    if (type === 'restocked') {
      return `Dear ${name},\n\nWe are delighted to inform you that the piece you registered interest for — ${piece} — has now arrived and is available for priority acquisition at Maison ELVANY.\n\nPlease visit our boutique or private client online portal to secure your piece.\n\nWarm regards,\nELVANY Atelier Team`;
    }
    if (type === 'production') {
      return `Dear ${name},\n\nFollowing elevated private client interest, our atelier has officially scheduled a limited production re-issue for ${piece}.\n\nWe will notify you immediately once your piece is completed and inspected by our master tailors.\n\nWarm regards,\nELVANY Atelier Concierge`;
    }
    return `Dear ${name},\n\nRegarding your restock inquiry for ${piece}: ${customNotifyNote || 'Our concierge team has received your inquiry and is attending to your garment request.'}\n\nWarm regards,\nELVANY Atelier Team`;
  };

  // Helper for formatting time ago
  const formatTimeAgo = (dateStr) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Yesterday';
      if (days < 30) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="admin-view-container">

      {/* Top Banner & Demand Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.8rem'
      }}>
        
        <div style={{
          backgroundColor: '#0d0e12',
          border: '1px solid var(--border-dark)',
          borderRadius: '2px',
          padding: '1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Re-Issue Requests</span>
            <Bell size={16} color="var(--gold-bright)" />
          </div>
          <div style={{ fontSize: '1.8rem', color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {requests.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
            Client interest signals recorded
          </div>
        </div>

        <div style={{
          backgroundColor: '#0d0e12',
          border: '1px solid var(--border-dark)',
          borderRadius: '2px',
          padding: '1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending Atelier Review</span>
            <Flame size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', color: '#f59e0b', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
            Awaiting production assessment
          </div>
        </div>

        <div style={{
          backgroundColor: '#0d0e12',
          border: '1px solid var(--border-dark)',
          borderRadius: '2px',
          padding: '1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>In Production / Sourcing</span>
            <Layers size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', color: '#38bdf8', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {inProductionCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
            Scheduled batch fabrication
          </div>
        </div>

        <div style={{
          backgroundColor: '#0d0e12',
          border: '1px solid var(--border-dark)',
          borderRadius: '2px',
          padding: '1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Restocked & Notified</span>
            <CheckCircle2 size={16} color="#4ade80" />
          </div>
          <div style={{ fontSize: '1.8rem', color: '#4ade80', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {fulfilledCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)' }}>
            {uniqueClients} unique client leads
          </div>
        </div>

      </div>

      {/* Top In-Demand Heatmap Widget */}
      {topDemands.length > 0 && (
        <div style={{
          backgroundColor: '#0d0e12',
          border: '1px solid var(--gold-border)',
          borderRadius: '2px',
          padding: '1.4rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--gold-bright)" />
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 400 }}>
                High-Demand Sold Out Pieces (Production Recommendations)
              </h4>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
              Ranked by Client Demand Signal
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {topDemands.slice(0, 4).map((d, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  backgroundColor: '#07080a',
                  padding: '0.85rem 1rem',
                  borderRadius: '2px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <img 
                  src={d.image || '/images/hero_tshirt.jpg'} 
                  alt={d.title} 
                  onClick={() => setPreviewImage(d.image || '/images/hero_tshirt.jpg')}
                  style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)', cursor: 'pointer' }} 
                  title="Click to view image"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-light-muted)', marginTop: '2px' }}>
                    {d.color} • <strong style={{ color: 'var(--gold-bright)' }}>Size {d.size}</strong>
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid var(--gold-bright)',
                  color: 'var(--gold-bright)',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Flame size={13} />
                  <span>{d.count} {d.count === 1 ? 'Req' : 'Reqs'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter, Search & Export Bar */}
      <div className="admin-action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
        <div className="admin-search-wrapper" style={{ maxWidth: '380px', flex: '1 1 280px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, size, color or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '2px',
                backgroundColor: statusFilter === 'all' ? 'var(--gold-bright)' : '#07080a',
                color: statusFilter === 'all' ? '#000000' : '#ffffff',
                border: '1px solid var(--border-dark)',
                cursor: 'pointer'
              }}
            >
              All ({requests.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '2px',
                backgroundColor: statusFilter === 'pending' ? '#f59e0b' : '#07080a',
                color: statusFilter === 'pending' ? '#000000' : '#ffffff',
                border: '1px solid var(--border-dark)',
                cursor: 'pointer'
              }}
            >
              Pending ({pendingCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('production')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '2px',
                backgroundColor: statusFilter === 'production' ? '#38bdf8' : '#07080a',
                color: statusFilter === 'production' ? '#000000' : '#ffffff',
                border: '1px solid var(--border-dark)',
                cursor: 'pointer'
              }}
            >
              Production ({inProductionCount})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('fulfilled')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '2px',
                backgroundColor: statusFilter === 'fulfilled' ? '#4ade80' : '#07080a',
                color: statusFilter === 'fulfilled' ? '#000000' : '#ffffff',
                border: '1px solid var(--border-dark)',
                cursor: 'pointer'
              }}
            >
              Restocked ({fulfilledCount})
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={requests.length === 0}
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '2px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              border: '1px solid var(--border-dark)',
              cursor: requests.length === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Download full client demand ledger as CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Requests Ledger Table with all details */}
      <div style={{
        backgroundColor: '#0d0e12',
        border: '1px solid var(--border-dark)',
        borderRadius: '2px',
        overflowX: 'auto'
      }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <Bell size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.35, color: 'var(--gold-bright)' }} />
            <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 600 }}>No Re-Issue Requests Found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
              {searchQuery ? 'No client requests match your current search criteria.' : 'When clients register interest for out-of-stock items, all customer details and garment specifications will appear here in real-time.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#07080a', borderBottom: '1px solid var(--border-dark)', color: 'var(--text-light-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <th style={{ padding: '1rem 1.2rem', minWidth: '220px' }}>GARMENT & VARIANT</th>
                <th style={{ padding: '1rem 1.2rem', minWidth: '200px' }}>CLIENT CONTACT DETAILS</th>
                <th style={{ padding: '1rem 1.2rem', minWidth: '220px' }}>CLIENT NOTES & INTEREST</th>
                <th style={{ padding: '1rem 1.2rem', minWidth: '130px' }}>TIMESTAMP</th>
                <th style={{ padding: '1rem 1.2rem', minWidth: '180px' }}>PRODUCTION STATUS</th>
                <th style={{ padding: '1rem 1.2rem', textAlign: 'right', minWidth: '180px' }}>CLIENT ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const currentStatus = req.status || 'Pending Atelier Review';
                const statusMeta = STATUS_OPTIONS.find(s => s.id === currentStatus) || STATUS_OPTIONS[0];

                // Sanitize phone for WhatsApp
                const cleanPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('0') ? `94${cleanPhone.slice(1)}` : cleanPhone;
                const waMessage = encodeURIComponent(`Greetings ${req.customerName || 'from Maison ELVANY'}. Regarding your garment re-issue inquiry for "${req.productTitle}" in ${req.variantColor} (Size ${req.sizeCode}): stock has arrived at our atelier.`);

                return (
                  <tr 
                    key={req.id}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Garment Details */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        <div 
                          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => setPreviewImage(req.productImage || '/images/hero_tshirt.jpg')}
                          title="Click to zoom garment image"
                        >
                          <img 
                            src={req.productImage || '/images/hero_tshirt.jpg'} 
                            alt={req.productTitle} 
                            style={{ width: '46px', height: '58px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-dark)' }} 
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            borderRadius: '2px',
                            padding: '1px 3px',
                            color: '#ffffff'
                          }}>
                            <Eye size={10} />
                          </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.88rem', lineHeight: 1.3 }}>
                            {req.productTitle}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              backgroundColor: 'rgba(255,255,255,0.06)', 
                              padding: '2px 6px', 
                              borderRadius: '2px',
                              color: 'var(--text-light-secondary)',
                              border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                              {req.variantColor}
                            </span>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              backgroundColor: 'rgba(197, 160, 89, 0.12)', 
                              color: 'var(--gold-bright)', 
                              fontWeight: 700, 
                              padding: '2px 6px', 
                              borderRadius: '2px',
                              border: '1px solid rgba(197, 160, 89, 0.25)'
                            }}>
                              Size: {req.sizeCode}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                            ID: {req.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Client Contact Details */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={14} color="var(--gold-bright)" />
                        <span>{req.customerName || 'VIP Client'}</span>
                      </div>
                      
                      <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {req.customerEmail ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} color="var(--gold-bright)" style={{ flexShrink: 0 }} />
                            <a 
                              href={`mailto:${req.customerEmail}`} 
                              style={{ color: 'var(--text-light-secondary)', textDecoration: 'none', wordBreak: 'break-all' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light-secondary)'}
                            >
                              {req.customerEmail}
                            </a>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>No email registered</span>
                        )}

                        {req.customerPhone ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} color="#4ade80" style={{ flexShrink: 0 }} />
                            <span>{req.customerPhone}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)' }}>No phone registered</span>
                        )}
                      </div>
                    </td>

                    {/* Client Notes & Custom Inquiries */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      {req.notes ? (
                        <div style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderLeft: '2px solid var(--gold-bright)',
                          padding: '6px 10px',
                          borderRadius: '0 2px 2px 0',
                          fontSize: '0.76rem',
                          color: '#ffffff',
                          lineHeight: 1.45,
                          maxWidth: '280px'
                        }}>
                          "{req.notes}"
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light-muted)', fontSize: '0.74rem', fontStyle: 'italic' }}>
                          No additional notes submitted
                        </span>
                      )}
                    </td>

                    {/* Request Timestamp */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 600 }}>
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ color: 'var(--text-light-muted)', fontSize: '0.7rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        <span>{new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ color: 'var(--gold-bright)', marginLeft: '4px' }}>({formatTimeAgo(req.createdAt)})</span>
                      </div>
                    </td>

                    {/* Status with Interactive Dropdown Selector */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <select
                          value={currentStatus}
                          onChange={(e) => onUpdateStatus(req.id, e.target.value)}
                          style={{
                            backgroundColor: statusMeta.bg,
                            color: statusMeta.color,
                            border: `1px solid ${statusMeta.border}`,
                            borderRadius: '2px',
                            padding: '5px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                            width: '100%',
                            maxWidth: '180px'
                          }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id} style={{ backgroundColor: '#0c0d11', color: '#ffffff' }}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Quick Actions & Client Communication */}
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        
                        {/* Notify / Concierge Dispatch Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNotifyRequest(req);
                            setCustomNotifyNote('');
                            setNotifyTemplateType('restocked');
                          }}
                          style={{
                            backgroundColor: 'rgba(197, 160, 89, 0.15)',
                            color: 'var(--gold-bright)',
                            border: '1px solid var(--gold-bright)',
                            padding: '5px 9px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                          title="Compose and send VIP notification"
                        >
                          <Send size={11} />
                          <span>Notify</span>
                        </button>

                        {/* WhatsApp CTA */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${waNumber}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: 'rgba(37, 211, 102, 0.12)',
                              color: '#25D366',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              padding: '5px 8px',
                              borderRadius: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                            title="Direct WhatsApp chat with client"
                          >
                            <MessageSquare size={12} />
                          </a>
                        )}

                        {/* Email CTA */}
                        {req.customerEmail && (
                          <a
                            href={`mailto:${req.customerEmail}?subject=Maison ELVANY — Garment Re-Issue Update: ${req.productTitle}&body=Dear ${req.customerName || 'Client'},%0D%0A%0D%0ARegarding your restock inquiry for ${req.productTitle} (${req.variantColor}, Size ${req.sizeCode}): stock has been prepared for priority acquisition.`}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#ffffff',
                              border: '1px solid var(--border-dark)',
                              padding: '5px 8px',
                              borderRadius: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                            title="Send email to client"
                          >
                            <Mail size={12} />
                          </a>
                        )}

                        {/* Copy record details */}
                        <button
                          type="button"
                          onClick={() => handleCopyRecord(req)}
                          style={{
                            backgroundColor: copyFeedback === req.id ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: copyFeedback === req.id ? '#4ade80' : 'var(--text-light-secondary)',
                            border: '1px solid var(--border-dark)',
                            padding: '5px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Copy all customer demand details"
                        >
                          {copyFeedback === req.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>

                        {/* Delete / Archive */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remove restock request #${req.id} for "${req.productTitle}"?`)) {
                              onDeleteRequest(req.id);
                            }
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            padding: '5px',
                            cursor: 'pointer'
                          }}
                          title="Remove request"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="modal-backdrop"
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11000,
            padding: '1rem'
          }}
        >
          <div 
            style={{ position: 'relative', maxWidth: '480px', width: '100%', backgroundColor: '#07080a', padding: '1rem', border: '1px solid var(--gold-border)', borderRadius: '2px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <img src={previewImage} alt="Garment preview" style={{ width: '100%', height: 'auto', maxHeight: '75vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* VIP Client Notification Dispatch Modal */}
      {selectedNotifyRequest && (
        <div 
          className="modal-backdrop"
          onClick={() => setSelectedNotifyRequest(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11000,
            padding: '1rem'
          }}
        >
          <div 
            style={{ 
              maxWidth: '560px', 
              width: '100%', 
              backgroundColor: '#0c0d11', 
              border: '1px solid var(--gold-border)', 
              borderRadius: '2px',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotifyRequest(null)}
              style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', color: 'var(--gold-bright)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              <Sparkles size={14} />
              <span>ATELIER VIP NOTIFICATION CONCIERGE</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.8rem 0' }}>
              Notify {selectedNotifyRequest.customerName}
            </h3>

            <div style={{
              backgroundColor: '#07080a',
              border: '1px solid var(--border-dark)',
              padding: '0.8rem 1rem',
              borderRadius: '2px',
              marginBottom: '1.2rem',
              fontSize: '0.78rem',
              color: 'var(--text-light-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ color: '#ffffff' }}>{selectedNotifyRequest.productTitle}</strong>
                <div>{selectedNotifyRequest.variantColor} • Size {selectedNotifyRequest.sizeCode}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--gold-bright)' }}>{selectedNotifyRequest.customerEmail || 'No email'}</div>
                <div>{selectedNotifyRequest.customerPhone || 'No phone'}</div>
              </div>
            </div>

            {/* Template Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                SELECT NOTIFICATION TEMPLATE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setNotifyTemplateType('restocked')}
                  style={{
                    padding: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    backgroundColor: notifyTemplateType === 'restocked' ? 'rgba(74, 222, 128, 0.15)' : '#07080a',
                    color: notifyTemplateType === 'restocked' ? '#4ade80' : '#ffffff',
                    border: notifyTemplateType === 'restocked' ? '1px solid #4ade80' : '1px solid var(--border-dark)',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Back in Stock
                </button>

                <button
                  type="button"
                  onClick={() => setNotifyTemplateType('production')}
                  style={{
                    padding: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    backgroundColor: notifyTemplateType === 'production' ? 'rgba(56, 189, 248, 0.15)' : '#07080a',
                    color: notifyTemplateType === 'production' ? '#38bdf8' : '#ffffff',
                    border: notifyTemplateType === 'production' ? '1px solid #38bdf8' : '1px solid var(--border-dark)',
                    cursor: 'pointer'
                  }}
                >
                  ⚙ In Production
                </button>

                <button
                  type="button"
                  onClick={() => setNotifyTemplateType('custom')}
                  style={{
                    padding: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    backgroundColor: notifyTemplateType === 'custom' ? 'rgba(197, 160, 89, 0.15)' : '#07080a',
                    color: notifyTemplateType === 'custom' ? 'var(--gold-bright)' : '#ffffff',
                    border: notifyTemplateType === 'custom' ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                    cursor: 'pointer'
                  }}
                >
                  ✎ Custom Concierge
                </button>
              </div>
            </div>

            {/* Custom note textarea if custom */}
            {notifyTemplateType === 'custom' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                  CUSTOM MESSAGE DETAILS
                </label>
                <textarea
                  value={customNotifyNote}
                  onChange={(e) => setCustomNotifyNote(e.target.value)}
                  placeholder="e.g. We have prepared an exclusive pre-order allocation for you..."
                  rows={3}
                  className="form-input"
                  style={{ backgroundColor: '#07080a', fontSize: '0.8rem', width: '100%' }}
                />
              </div>
            )}

            {/* Message Preview */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                MESSAGE PREVIEW
              </label>
              <div style={{
                backgroundColor: '#07080a',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1rem',
                borderRadius: '2px',
                fontSize: '0.78rem',
                color: '#e5e7eb',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                maxHeight: '160px',
                overflowY: 'auto'
              }}>
                {getNotificationText(selectedNotifyRequest, notifyTemplateType)}
              </div>
            </div>

            {/* Direct Send CTAs */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {selectedNotifyRequest.customerPhone && (
                <a
                  href={`https://wa.me/${(selectedNotifyRequest.customerPhone || '').replace(/[^0-9]/g, '').startsWith('0') ? '94' + (selectedNotifyRequest.customerPhone || '').replace(/[^0-9]/g, '').slice(1) : (selectedNotifyRequest.customerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getNotificationText(selectedNotifyRequest, notifyTemplateType))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onUpdateStatus(selectedNotifyRequest.id, notifyTemplateType === 'production' ? 'In Production / Sourcing' : 'Client Notified');
                    setSelectedNotifyRequest(null);
                  }}
                  className="btn-primary-gold"
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#25D366',
                    color: '#000000',
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={15} />
                  <span>DISPATCH WHATSAPP</span>
                </a>
              )}

              {selectedNotifyRequest.customerEmail && (
                <a
                  href={`mailto:${selectedNotifyRequest.customerEmail}?subject=Maison ELVANY — Garment Re-Issue Update: ${selectedNotifyRequest.productTitle}&body=${encodeURIComponent(getNotificationText(selectedNotifyRequest, notifyTemplateType))}`}
                  onClick={() => {
                    onUpdateStatus(selectedNotifyRequest.id, notifyTemplateType === 'production' ? 'In Production / Sourcing' : 'Client Notified');
                    setSelectedNotifyRequest(null);
                  }}
                  className="btn-primary-gold"
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={15} />
                  <span>DISPATCH EMAIL</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getNotificationText(selectedNotifyRequest, notifyTemplateType));
                  onUpdateStatus(selectedNotifyRequest.id, notifyTemplateType === 'production' ? 'In Production / Sourcing' : 'Client Notified');
                  alert('Notification message copied to clipboard & status updated to Notified!');
                  setSelectedNotifyRequest(null);
                }}
                style={{
                  padding: '0.8rem 1.2rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                Copy & Mark Notified
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
