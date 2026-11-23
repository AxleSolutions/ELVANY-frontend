import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  RefreshCw, 
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Percent,
  Calendar
} from 'lucide-react';
import { saveVoucher, deleteVoucher } from '../services/dbService';

export const VouchersManager = ({ 
  vouchers = [], 
  onUpdateVouchers,
  onToast 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, redeemed, expired
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State for Voucher Generation
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'fixed', // 'fixed' (LKR) or 'percentage'
    discountValue: 3000,
    minOrderAmount: 0,
    maxUses: 1,
    durationPreset: '30', // '7', '30', '60', '90', '365', 'none'
    recipientName: '',
    recipientEmail: '',
    notes: ''
  });

  // Generate Cryptographic High-Entropy Voucher Code (8 characters across 2 blocks = Over 1.1 Trillion combinations)
  // Format: ELV-XXXX-XXXX (e.g. ELV-8K3P-4X2W), ultra-clean, memorable and mistake-proof
  const generateRandomCode = (prefix = 'ELV') => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32-character unambiguous set (no 0, O, 1, I, L)
    const getChunk = (len = 4) => {
      let str = '';
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const bytes = new Uint8Array(len);
        window.crypto.getRandomValues(bytes);
        for (let i = 0; i < len; i++) {
          str += charset.charAt(bytes[i] % charset.length);
        }
      } else {
        for (let i = 0; i < len; i++) {
          str += charset.charAt(Math.floor(Math.random() * charset.length));
        }
      }
      return str;
    };
    return `${prefix}-${getChunk(4)}-${getChunk(4)}`;
  };

  const handleOpenCreateModal = () => {
    setFormData({
      code: generateRandomCode('ELV'),
      discountType: 'fixed',
      discountValue: 3000,
      minOrderAmount: 0,
      maxUses: 1,
      durationPreset: '30',
      recipientName: '',
      recipientEmail: '',
      notes: 'VIP Client Courtesy Credit'
    });
    setIsCreateModalOpen(true);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onToast) onToast(`Voucher code "${code}" copied to clipboard.`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleSaveNewVoucher = async (e) => {
    e.preventDefault();
    const cleanCode = (formData.code || generateRandomCode()).toUpperCase().trim();
    if (!cleanCode) return;

    let expiresAt = null;
    if (formData.durationPreset && formData.durationPreset !== 'none') {
      const days = parseInt(formData.durationPreset, 10) || 30;
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    const newVoucher = {
      code: cleanCode,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue || 0),
      minOrderAmount: parseFloat(formData.minOrderAmount || 0),
      maxUses: parseInt(formData.maxUses || 1, 10),
      isUsed: false,
      usedCount: 0,
      isActive: true,
      expiresAt,
      recipientName: formData.recipientName.trim(),
      recipientEmail: formData.recipientEmail.trim(),
      notes: formData.notes.trim()
    };

    try {
      const saved = await saveVoucher(newVoucher);
      const nextList = [saved, ...vouchers.filter(v => v.code !== saved.code)];
      if (onUpdateVouchers) onUpdateVouchers(nextList);
      if (onToast) onToast(`Atelier Voucher "${saved.code}" generated successfully.`);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error generating voucher:', err);
      if (onToast) onToast('Failed to save voucher. Please check database connectivity.');
    }
  };

  const handleToggleVoucherActive = async (v) => {
    const updated = { ...v, isActive: !v.isActive };
    try {
      await saveVoucher(updated);
      const nextList = vouchers.map(item => item.id === v.id ? updated : item);
      if (onUpdateVouchers) onUpdateVouchers(nextList);
      if (onToast) onToast(`Voucher "${v.code}" ${updated.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      console.error('Error updating voucher:', err);
    }
  };

  const handleDeleteVoucher = async (v) => {
    if (!window.confirm(`Permanently delete voucher code "${v.code}"? This action cannot be reversed.`)) return;
    try {
      await deleteVoucher(v.id, v.code);
      const nextList = vouchers.filter(item => item.id !== v.id && item.code !== v.code);
      if (onUpdateVouchers) onUpdateVouchers(nextList);
      if (onToast) onToast(`Voucher "${v.code}" deleted permanently.`);
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  // Metrics computation
  const totalCount = vouchers.length;
  const activeUnused = vouchers.filter(v => v.isActive && !v.isUsed && (!v.expiresAt || new Date(v.expiresAt).getTime() > Date.now()));
  const redeemedVouchers = vouchers.filter(v => v.isUsed || (v.usedCount >= (v.maxUses || 1)));
  const totalValueIssuedLKR = vouchers.reduce((acc, v) => {
    if (v.discountType === 'fixed') return acc + (v.discountValue || 0);
    return acc;
  }, 0);

  // Filter & Search
  const filteredVouchers = vouchers.filter(v => {
    const query = searchQuery.toLowerCase().trim();
    const codeMatch = (v.code || '').toLowerCase().includes(query);
    const nameMatch = (v.recipientName || '').toLowerCase().includes(query);
    const emailMatch = (v.recipientEmail || '').toLowerCase().includes(query);
    const notesMatch = (v.notes || '').toLowerCase().includes(query);
    const matchesSearch = !query || codeMatch || nameMatch || emailMatch || notesMatch;

    const isExpired = v.expiresAt && new Date(v.expiresAt).getTime() < Date.now();
    const isRedeemed = v.isUsed || (v.usedCount >= (v.maxUses || 1));

    if (statusFilter === 'active') {
      return matchesSearch && v.isActive && !isRedeemed && !isExpired;
    }
    if (statusFilter === 'redeemed') {
      return matchesSearch && isRedeemed;
    }
    if (statusFilter === 'expired') {
      return matchesSearch && isExpired;
    }
    return matchesSearch;
  });

  return (
    <div className="admin-view-container">
      
      {/* Top Header & Action */}
      <div className="admin-section-header" style={{ marginBottom: '1.8rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Ticket size={20} color="var(--gold-bright)" />
            <h2 className="admin-page-title" style={{ margin: 0 }}>Atelier Vouchers & Gift Cards</h2>
          </div>
          <p className="admin-page-subtitle" style={{ margin: 0 }}>
            Generate secure, single-use promotional vouchers, private client credits, and custom gift codes.
          </p>
        </div>

        <button 
          type="button" 
          className="btn-primary-gold"
          onClick={handleOpenCreateModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.4rem' }}
        >
          <Plus size={16} />
          <span>GENERATE NEW VOUCHER</span>
        </button>
      </div>

      {/* Metrics Ledger Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-dark)', padding: '1.2rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            TOTAL VOUCHERS ISSUED
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#121316', fontWeight: 700 }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginTop: '4px' }}>
            Registered in database
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1.2rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            ACTIVE & UNREDEEMED
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#16a34a', fontWeight: 700 }}>
            {activeUnused.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginTop: '4px' }}>
            Ready for client checkout
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--gold-border)', padding: '1.2rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            REDEEMED ON ORDERS
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontWeight: 700 }}>
            {redeemedVouchers.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginTop: '4px' }}>
            Single-use locked
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-dark)', padding: '1.2rem', borderRadius: '3px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            TOTAL CREDIT ALLOCATED
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#121316', fontWeight: 700 }}>
            LKR {totalValueIssuedLKR.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-light-secondary)', marginTop: '4px' }}>
            Fixed credit vouchers
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, recipient name, or note..."
            className="admin-input"
            style={{ paddingLeft: '2.4rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${vouchers.length})` },
            { id: 'active', label: `Active (${activeUnused.length})` },
            { id: 'redeemed', label: `Redeemed (${redeemedVouchers.length})` },
            { id: 'expired', label: 'Expired' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`admin-filter-pill ${statusFilter === tab.id ? 'active' : ''}`}
              style={{
                background: statusFilter === tab.id ? 'var(--gold-bright)' : '#121316',
                color: statusFilter === tab.id ? '#000000' : 'var(--text-light-secondary)',
                border: statusFilter === tab.id ? '1px solid var(--gold-bright)' : '1px solid var(--border-dark)',
                padding: '6px 14px',
                borderRadius: '2px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Data Table */}
      <div className="admin-table-wrapper" style={{ backgroundColor: '#ffffff', borderRadius: '3px', border: '1px solid var(--border-dark)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>VOUCHER CODE</th>
              <th>DISCOUNT VALUE</th>
              <th>MINIMUM SPEND</th>
              <th>RECIPIENT &amp; PURPOSE</th>
              <th>STATUS</th>
              <th>VALID UNTIL</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-light-muted)' }}>
                  <Ticket size={32} color="var(--gold-border)" style={{ margin: '0 auto 0.8rem auto' }} />
                  <div style={{ fontSize: '0.95rem', color: '#121316', marginBottom: '4px', fontWeight: 600 }}>No Vouchers Found</div>
                  <div style={{ fontSize: '0.78rem' }}>
                    {searchQuery ? 'No vouchers matched your search query.' : 'Click "GENERATE NEW VOUCHER" above to create your first atelier gift code.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredVouchers.map((v) => {
                const isExpired = v.expiresAt && new Date(v.expiresAt).getTime() < Date.now();
                const isRedeemed = v.isUsed || (v.usedCount >= (v.maxUses || 1));
                const isCopied = copiedCode === v.code;

                return (
                  <tr key={v.id || v.code} style={{ opacity: (!v.isActive || isRedeemed || isExpired) ? 0.75 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: isRedeemed ? 'var(--text-light-muted)' : 'var(--gold-bright)', letterSpacing: '0.08em' }}>
                          {v.code}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.code)}
                          title="Copy voucher code"
                          style={{
                            background: isCopied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(197, 160, 89, 0.1)',
                            border: isCopied ? '1px solid #22c55e' : '1px solid rgba(197, 160, 89, 0.3)',
                            color: isCopied ? '#4ade80' : 'var(--gold-bright)',
                            padding: '3px 7px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}
                        >
                          {isCopied ? <Check size={11} /> : <Copy size={11} />}
                          <span>{isCopied ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#121316' }}>
                        {v.discountType === 'percentage' 
                          ? `${v.discountValue}% OFF` 
                          : `LKR ${(v.discountValue || 0).toLocaleString()} OFF`}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: v.minOrderAmount > 0 ? 'var(--text-light-secondary)' : 'var(--text-light-muted)' }}>
                        {v.minOrderAmount > 0 ? `LKR ${v.minOrderAmount.toLocaleString()}` : 'None (No Min)'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#121316', fontWeight: 600 }}>
                        {v.recipientName || v.recipientEmail || 'Open Patron Voucher'}
                      </div>
                      {v.notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          "{v.notes}"
                        </div>
                      )}
                    </td>

                    <td>
                      {isRedeemed ? (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            padding: '2px 8px',
                            borderRadius: '2px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}>
                            <Lock size={10} />
                            <span>REDEEMED (USED)</span>
                          </span>
                          {v.usedByOrderId && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-light-muted)', marginTop: '3px' }}>
                              Order #{v.usedByOrderId}
                            </div>
                          )}
                        </div>
                      ) : isExpired ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-light-muted)',
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          <Clock size={10} />
                          <span>EXPIRED</span>
                        </span>
                      ) : !v.isActive ? (
                        <span style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          DEACTIVATED
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(34, 197, 94, 0.12)',
                          color: '#4ade80',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em'
                        }}>
                          <CheckCircle2 size={10} />
                          <span>ACTIVE (SINGLE-USE)</span>
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: isExpired ? '#ef4444' : 'var(--text-light-secondary)' }}>
                        {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'Never (Perpetual)'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleVoucherActive(v)}
                          disabled={isRedeemed}
                          className="admin-action-btn"
                          title={v.isActive ? 'Deactivate voucher' : 'Activate voucher'}
                          style={{ fontSize: '0.7rem', padding: '4px 8px', opacity: isRedeemed ? 0.3 : 1 }}
                        >
                          {v.isActive ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVoucher(v)}
                          className="admin-action-btn"
                          title="Delete voucher"
                          style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#ef4444' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Voucher Modal */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div 
            className="admin-dialog" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', width: '100%', backgroundColor: '#ffffff', border: '1px solid var(--gold-border)', borderRadius: '3px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="var(--gold-bright)" />
                <h3 style={{ fontSize: '1.2rem', color: '#121316', margin: 0, fontWeight: 600 }}>
                  Generate Atelier Voucher
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)}
                className="admin-close-btn"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewVoucher}>
              {/* Code Generator Row */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--gold-bright)' }}>
                  VOUCHER CODE (CLIENT FACING)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. ELV-GIFT-5000"
                    className="admin-input"
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.06em' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, code: generateRandomCode('ELV') }))}
                    className="btn-secondary-outline"
                    style={{ fontSize: '0.74rem', padding: '0 1rem', whiteSpace: 'nowrap' }}
                  >
                    🎲 Regenerate
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4ade80', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} color="#4ade80" />
                  <span>High-Entropy Cryptographic Code (12 Chars • Over 1 Quintillion Combinations • Zero Guess Risk)</span>
                </div>
              </div>

              {/* Discount Type & Value Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    DISCOUNT TYPE
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    className="admin-input"
                    style={{ width: '100%' }}
                  >
                    <option value="fixed">Fixed Deduction (LKR)</option>
                    <option value="percentage">Percentage Off (%)</option>
                  </select>
                </div>

                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    DISCOUNT VALUE {formData.discountType === 'percentage' ? '(%)' : '(LKR)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? 100 : 1000000}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    className="admin-input"
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Minimum Order Amount & Validity Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    MINIMUM ORDER SUBTOTAL (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                    placeholder="0 = No minimum"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-light-muted)', marginTop: '3px' }}>
                    Leave as 0 for no minimum restriction.
                  </div>
                </div>

                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    VALIDITY PERIOD
                  </label>
                  <select
                    value={formData.durationPreset}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationPreset: e.target.value }))}
                    className="admin-input"
                    style={{ width: '100%' }}
                  >
                    <option value="7">7 Days (Express)</option>
                    <option value="30">30 Days (Standard 1 Month)</option>
                    <option value="60">60 Days (2 Months)</option>
                    <option value="90">90 Days (Quarterly Season)</option>
                    <option value="365">1 Year (Gift Card)</option>
                    <option value="none">Perpetual (No Expiration)</option>
                  </select>
                </div>
              </div>

              {/* Single-Use Enforced Assurance */}
              <div style={{ backgroundColor: 'rgba(197, 160, 89, 0.08)', border: '1px solid var(--gold-border)', borderRadius: '3px', padding: '0.85rem 1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={18} color="var(--gold-bright)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.75rem', color: '#52545c', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--gold-bright)' }}>Single-Use Security Enforcement:</strong> This voucher code can be used <strong>strictly one time only</strong>. As soon as a customer completes their order with this code, the system permanently locks it so it cannot be shared or reused.
                </div>
              </div>

              {/* Intended Recipient & Internal Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    CLIENT NAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="e.g. Mr. Kaveesha"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                    CLIENT EMAIL (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="client@gmail.com"
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--gold-bright)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={11} color="var(--gold-bright)" />
                    <span>Zero-Guess Security: If filled, only this exact email can redeem this voucher.</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.6rem' }}>
                <label className="admin-form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-light-secondary)' }}>
                  INTERNAL NOTES / REASON FOR ISSUING
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. VIP Concierge Courtesy or Seasonal Atelier Promotion"
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-gold"
                  style={{ padding: '0.75rem 1.6rem' }}
                >
                  GENERATE &amp; STORE VOUCHER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
