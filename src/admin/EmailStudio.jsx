import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Upload,
  Code,
  Eye,
  Smartphone,
  Monitor,
  Settings,
  RefreshCw,
  Users,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getNewsletterSubscribers } from '../services/dbService';

const DEFAULT_STARTER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ELVANY</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0b0b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #121212; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header / Brand with Official Logo -->
          <tr>
            <td align="center" style="padding: 36px 20px 24px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <img src="https://elvany.vercel.app/logo/Main-6.png" alt="ELVANY" width="135" style="display: block; border: 0; max-width: 135px; height: auto; margin: 0 auto 10px auto;" />
              <p style="margin: 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #c5a059;">Haute Couture &bull; Atelier</p>
            </td>
          </tr>

          <!-- Hero Content -->
          <tr>
            <td style="padding: 40px 32px 30px 32px; text-align: center;">
              <span style="display: inline-block; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #c5a059; border: 1px solid rgba(197, 160, 89, 0.4); padding: 4px 12px; margin-bottom: 20px;">
                Private Invitation
              </span>
              <h2 style="margin: 0 0 16px 0; font-size: 28px; line-height: 1.3; font-weight: 300; color: #ffffff; letter-spacing: -0.01em;">
                The New Collection Has Arrived
              </h2>
              <p style="margin: 0 auto 30px auto; max-width: 480px; font-size: 14px; line-height: 1.7; color: #a1a1aa;">
                Experience master-crafted Peruvian Pima cotton and Japanese Mercerized garments engineered with timeless silhouettes and bespoke finishing.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 30px auto;">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 2px;">
                    <a href="https://elvany.vercel.app/collection" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #000000; text-decoration: none;">
                      Explore Collection &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Offer Highlight Banner -->
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <div style="background-color: #1a1a1a; border: 1px dashed rgba(197, 160, 89, 0.4); padding: 20px; text-align: center; border-radius: 4px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c5a059;">Complimentary Privilege</p>
                <div style="font-size: 20px; font-weight: 600; letter-spacing: 0.2em; color: #ffffff; margin: 4px 0;">ELVANY-VIP</div>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #71717a;">Apply at checkout for 15% off your next curation.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-size: 11px; line-height: 1.8; color: #71717a;">
              <p style="margin: 0 0 8px 0;">You received this private dispatch as a registered patron of ELVANY.</p>
              <p style="margin: 0;">&copy; 2026 ELVANY Atelier &bull; Sri Lanka</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const PERMANENT_GOOGLE_ENDPOINT = import.meta.env.VITE_GOOGLE_EMAIL_ENDPOINT || 'https://script.google.com/macros/s/AKfycbz_XKyqOJ3x72nKUyVfJDCGbyO_U3gWYCe61gxFF2osFWnx7RS29_cdgAqT8J7DX0h7/exec';

export function EmailStudio() {
  // Google Endpoint (permanently wired)
  const [googleEndpoint, setGoogleEndpoint] = useState(() => {
    const saved = localStorage.getItem('elvany_google_email_endpoint');
    return (saved && saved.startsWith('http')) ? saved : PERMANENT_GOOGLE_ENDPOINT;
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Email Code & Details
  const [subject, setSubject] = useState('Privilege Invitation | The New ELVANY Collection');
  const [senderName, setSenderName] = useState(() => localStorage.getItem('elvany_email_sender_name') || 'ELVANY');
  const [fromEmail, setFromEmail] = useState(() => localStorage.getItem('elvany_email_from_address') || '');
  const [htmlCode, setHtmlCode] = useState(() => localStorage.getItem('elvany_saved_email_html') || DEFAULT_STARTER_HTML);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [logoCopied, setLogoCopied] = useState(false);

  // Contacts with Name & Email
  const [contacts, setContacts] = useState([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [manualRecipients, setManualRecipients] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ sent: 0, total: 0, status: 'idle', logs: [] });
  const fileInputRef = useRef(null);

  // Persist code in browser storage
  useEffect(() => {
    localStorage.setItem('elvany_saved_email_html', htmlCode);
  }, [htmlCode]);

  // Ensure the permanent endpoint is synced
  useEffect(() => {
    setGoogleEndpoint(PERMANENT_GOOGLE_ENDPOINT);
    localStorage.setItem('elvany_google_email_endpoint', PERMANENT_GOOGLE_ENDPOINT);
  }, []);

  // Load existing subscribers automatically on mount
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const subscribers = await getNewsletterSubscribers();
        if (subscribers && subscribers.length > 0) {
          const list = subscribers
            .map(u => {
              const email = typeof u === 'string' ? u : (u.email || '');
              const name = (typeof u === 'object' && u.name) ? u.name : email.split('@')[0].replace(/[._-]/g, ' ');
              return { name: name || 'Patron', email: email.trim().toLowerCase() };
            })
            .filter(c => c.email && c.email.includes('@'));

          const unique = [];
          const seen = new Set();
          for (const c of list) {
            if (!seen.has(c.email)) {
              seen.add(c.email);
              unique.push({ id: `sub-${unique.length}`, ...c });
            }
          }

          if (contacts.length === 0 && unique.length > 0) {
            setContacts(unique);
            setUploadStats({ source: 'Store Subscribers', count: unique.length });
          }
        }
      } catch (err) {
        console.warn('Could not auto-populate subscribers:', err);
      }
    };
    fetchSubscribers();
  }, []);

  // Parse CSV or plain text file extracting both Names and Emails
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (rawLines.length === 0) {
          alert('Selected file is empty.');
          return;
        }

        const parseCsvRow = (line) => {
          const delimiter = line.includes(';') && !line.includes(',') ? ';' : (line.includes('\t') && !line.includes(',') ? '\t' : ',');
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current.trim().replace(/^["']|["']$/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          return result;
        };

        const firstLine = rawLines[0];
        const isHeader = /email|mail|name|first|last/i.test(firstLine);

        let nameColIndex = -1;
        let emailColIndex = -1;
        let firstNameColIndex = -1;
        let lastNameColIndex = -1;

        if (isHeader) {
          const headers = parseCsvRow(firstLine).map(h => h.toLowerCase());
          headers.forEach((h, idx) => {
            if (/^email|^e-mail|^mail/i.test(h)) emailColIndex = idx;
            else if (/full.*name|^name$|customer.*name|contact.*name|patron.*name/i.test(h)) nameColIndex = idx;
            else if (/first.*name|^fname$/i.test(h)) firstNameColIndex = idx;
            else if (/last.*name|^lname$/i.test(h)) lastNameColIndex = idx;
          });
        }

        const startIndex = isHeader ? 1 : 0;
        const extracted = [];
        const seen = new Set(contacts.map(c => c.email.toLowerCase()));

        for (let i = startIndex; i < rawLines.length; i++) {
          const line = rawLines[i];
          const cols = parseCsvRow(line);

          let foundEmail = '';
          if (emailColIndex !== -1 && cols[emailColIndex]) {
            const m = cols[emailColIndex].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (m) foundEmail = m[0].toLowerCase();
          }

          if (!foundEmail) {
            for (let c = 0; c < cols.length; c++) {
              const m = cols[c].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (m) {
                foundEmail = m[0].toLowerCase();
                break;
              }
            }
          }

          if (!foundEmail || seen.has(foundEmail)) continue;

          let foundName = '';
          if (nameColIndex !== -1 && cols[nameColIndex]) {
            foundName = cols[nameColIndex].trim();
          } else if (firstNameColIndex !== -1) {
            const fn = cols[firstNameColIndex] || '';
            const ln = lastNameColIndex !== -1 ? (cols[lastNameColIndex] || '') : '';
            foundName = `${fn} ${ln}`.trim();
          }

          if (!foundName) {
            for (let c = 0; c < cols.length; c++) {
              const val = cols[c].trim();
              if (val && !val.includes('@') && isNaN(Number(val)) && val.length < 50) {
                foundName = val;
                break;
              }
            }
          }

          if (!foundName) {
            const localPart = foundEmail.split('@')[0];
            foundName = localPart.charAt(0).toUpperCase() + localPart.slice(1).replace(/[._-]/g, ' ');
          }

          seen.add(foundEmail);
          extracted.push({
            id: `cnt-${Date.now()}-${extracted.length}`,
            name: foundName,
            email: foundEmail
          });
        }

        if (extracted.length === 0) {
          alert('No valid contacts with email addresses found in the file.');
        } else {
          const updated = [...contacts, ...extracted];
          setContacts(updated);
          setUploadStats({
            source: file.name,
            count: updated.length,
            newCount: extracted.length
          });
        }
      } catch (err) {
        alert('Failed to parse CSV file: ' + err.message);
      } finally {
        setIsParsingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      alert('Error reading uploaded file');
      setIsParsingFile(false);
    };

    reader.readAsText(file);
  };

  const handleAddManualEmails = () => {
    if (!manualRecipients.trim()) return;
    const lines = manualRecipients.split(/[\n,;]+/);
    const seen = new Set(contacts.map(c => c.email.toLowerCase()));
    const newItems = [];

    lines.forEach(item => {
      const trimmed = item.trim();
      const m = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (m) {
        const email = m[0].toLowerCase();
        if (!seen.has(email)) {
          seen.add(email);
          const name = trimmed.replace(email, '').trim().replace(/^[-:;,]+|[-:;,]+$/g, '') || email.split('@')[0];
          newItems.push({
            id: `man-${Date.now()}-${newItems.length}`,
            name: name || 'Patron',
            email
          });
        }
      }
    });

    if (newItems.length > 0) {
      const updated = [...contacts, ...newItems];
      setContacts(updated);
      setUploadStats({
        source: 'Manual entry',
        count: updated.length
      });
    }

    setManualRecipients('');
    setShowManualInput(false);
  };

  const handleAddSingleContact = (e) => {
    e?.preventDefault();
    const cleanEmail = singleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      alert('Please enter a valid email address.');
      return;
    }

    if (contacts.some(c => c.email.toLowerCase() === cleanEmail)) {
      alert(`The email "${cleanEmail}" is already in the contact list.`);
      return;
    }

    const cleanName = singleName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const newContact = {
      id: `man-${Date.now()}`,
      name: cleanName,
      email: cleanEmail
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    setSingleName('');
    setSingleEmail('');
    setUploadStats({
      source: 'Active Roster',
      count: updated.length
    });
  };

  const handleRemoveContact = (emailToRemove) => {
    const updated = contacts.filter(c => c.email !== emailToRemove);
    setContacts(updated);
    setUploadStats(updated.length > 0 ? { source: 'Active List', count: updated.length } : null);
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter(c => {
    if (!contactSearchQuery.trim()) return true;
    const q = contactSearchQuery.toLowerCase().trim();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  // Central dispatcher handling standard fetch + no-cors fallback for Google Apps Script redirects
  const sendEmailRequest = async (recipients, emailSubject, emailHtml) => {
    const list = Array.isArray(recipients) ? recipients : [recipients];
    const payload = {
      action: 'send_email',
      to: list,
      recipients: list,
      subject: emailSubject,
      htmlBody: emailHtml,
      senderName: senderName || 'ELVANY',
      fromEmail: fromEmail.trim() || undefined
    };

    const serialized = JSON.stringify(payload);

    // 1. Try standard CORS fetch first
    try {
      const res = await fetch(googleEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: serialized
      });

      try {
        const data = await res.json();
        if (data.status === 'success' || data.success === true) {
          return { success: true, message: `Dispatched successfully to ${list.length} recipient(s)!` };
        }
        return { success: false, message: data.message || data.error || 'Google Script reported an issue.' };
      } catch {
        return { success: true, message: 'Dispatched via Google Web App.' };
      }
    } catch (corsErr) {
      // 2. If standard fetch throws (browser blocked reading the 302 redirect),
      // dispatch directly via mode: 'no-cors'. Google will still receive the POST and send the email!
      try {
        await fetch(googleEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: serialized
        });
        return {
          success: true,
          message: `Dispatched test email to ${list.join(', ')}! Check your inbox in 15-30 seconds.`
        };
      } catch (fallbackErr) {
        throw corsErr;
      }
    }
  };

  // Bulk Broadcast to all parsed contacts
  const handleBroadcastCampaign = async () => {
    if (!googleEndpoint) {
      setShowConfigModal(true);
      return;
    }
    if (contacts.length === 0) {
      alert('Please upload a CSV contact list first.');
      return;
    }

    const recipientEmails = contacts.map(c => c.email);

    const confirmSend = window.confirm(
      `Send campaign "${subject}" to ${contacts.length} patron(s)? This will dispatch via your connected Google Account.`
    );
    if (!confirmSend) return;

    setIsBroadcasting(true);
    setBroadcastProgress({
      sent: 0,
      total: recipientEmails.length,
      status: 'sending',
      logs: []
    });

    const CHUNK_SIZE = 25;
    let totalSent = 0;
    const logs = [];

    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const batch = recipientEmails.slice(i, i + CHUNK_SIZE);
      const batchNum = Math.floor(i / CHUNK_SIZE) + 1;
      const totalBatches = Math.ceil(recipientEmails.length / CHUNK_SIZE);

      try {
        const result = await sendEmailRequest(batch, subject, htmlCode);

        if (result.success) {
          totalSent += batch.length;
          logs.unshift({
            time: new Date().toLocaleTimeString(),
            batch: `Batch ${batchNum}/${totalBatches}`,
            count: batch.length,
            status: 'Delivered'
          });
        } else {
          logs.unshift({
            time: new Date().toLocaleTimeString(),
            batch: `Batch ${batchNum}/${totalBatches}`,
            count: batch.length,
            status: 'Failed: ' + result.message
          });
        }
      } catch (err) {
        logs.unshift({
          time: new Date().toLocaleTimeString(),
          batch: `Batch ${batchNum}/${totalBatches}`,
          count: batch.length,
          status: 'Error: ' + err.message
        });
      }

      setBroadcastProgress({
        sent: totalSent,
        total: recipientEmails.length,
        status: i + CHUNK_SIZE >= recipientEmails.length ? 'complete' : 'sending',
        logs: [...logs]
      });

      if (i + CHUNK_SIZE < recipientEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    setIsBroadcasting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Top Banner */}
      <div style={{
        background: '#121316',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '4px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#c5a059',
              display: 'inline-block'
            }} />
            <h1 style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ffffff',
              fontFamily: 'var(--font-sans, inherit)'
            }}>
              Email Studio & Campaign Dispatch
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#a1a1aa' }}>
            Custom HTML code editor, live sandboxed preview & Google serverless email dispatch engine.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '8px 14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '2px',
              backgroundColor: googleEndpoint ? 'rgba(16, 185, 129, 0.12)' : 'rgba(197, 160, 89, 0.15)',
              color: googleEndpoint ? '#34d399' : '#c5a059',
              border: googleEndpoint ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(197, 160, 89, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Settings style={{ width: 14, height: 14 }} />
            <span>{googleEndpoint ? 'Google Endpoint Connected' : 'Connect Google Endpoint'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Code Editor (Left) & Preview / Dispatch (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: Customizable Code Environment */}
        <div style={{
          background: '#121316',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Subject Line & Code Controls */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: '#fbf9f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#a1a1aa',
                marginBottom: '6px'
              }}>
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter campaign subject line..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#07080a',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '2px',
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#a1a1aa',
                  marginBottom: '4px'
                }}>
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => {
                    setSenderName(e.target.value);
                    localStorage.setItem('elvany_email_sender_name', e.target.value);
                  }}
                  placeholder="ELVANY"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#07080a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '2px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#a1a1aa',
                  marginBottom: '4px'
                }}>
                  Sender Email Alias (e.g. @elvany)
                </label>
                <input
                  type="text"
                  value={fromEmail}
                  onChange={(e) => {
                    setFromEmail(e.target.value);
                    localStorage.setItem('elvany_email_from_address', e.target.value);
                  }}
                  placeholder="elvanywear@gmail.com (optional)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#07080a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '2px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Quick Logo URL Copy Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              fontSize: '0.7rem',
              color: '#71717a',
              background: '#07080a',
              padding: '6px 10px',
              borderRadius: '2px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <span style={{ color: '#c5a059', fontWeight: 600 }}>Official Logos:</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://elvany.vercel.app/logo/Main-6.png');
                  setLogoCopied('Gold Logo');
                  setTimeout(() => setLogoCopied(false), 2000);
                }}
                style={{
                  background: '#1a1b20',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  color: '#e2be75',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.68rem'
                }}
              >
                📋 Copy Gold Logo URL
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://elvany.vercel.app/logo/Main-2.png');
                  setLogoCopied('White Logo');
                  setTimeout(() => setLogoCopied(false), 2000);
                }}
                style={{
                  background: '#1a1b20',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.68rem'
                }}
              >
                📋 Copy White Logo URL
              </button>
              {logoCopied && <span style={{ color: '#34d399', fontWeight: 600 }}>Copied {logoCopied}!</span>}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code style={{ width: 15, height: 15, color: '#c5a059' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                  Custom HTML Code
                </span>
                <span style={{ fontSize: '0.72rem', color: '#71717a' }}>
                  ({htmlCode.length.toLocaleString()} chars)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset code to default luxury ELVANY template?')) {
                      setHtmlCode(DEFAULT_STARTER_HTML);
                    }
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    background: '#1a1b20',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#a1a1aa',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all HTML code in the box?')) {
                      setHtmlCode('');
                    }
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Code
                </button>
              </div>
            </div>
          </div>

          {/* The Pure Single Customizable Code Box */}
          <div style={{ padding: '0.75rem', background: '#050608' }}>
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="Paste or write your full HTML email code here..."
              spellCheck={false}
              style={{
                width: '100%',
                height: '520px',
                boxSizing: 'border-box',
                background: '#07080a',
                color: '#4ade80',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                padding: '12px',
                fontFamily: 'Consolas, "Fira Code", Monaco, Menlo, monospace',
                fontSize: '0.78rem',
                lineHeight: 1.55,
                resize: 'vertical',
                outline: 'none',
                whiteSpace: 'pre'
              }}
            />
          </div>

          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: '#fbf9f5',
            fontSize: '0.72rem',
            color: 'var(--text-light-muted)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Inline CSS styles recommended for all email clients.</span>
            <span style={{ color: 'var(--text-light-secondary)' }}>Auto-saved to browser</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Dispatch Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Live Sandboxed Preview Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-dark)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '0.9rem 1.25rem',
              borderBottom: '1px solid var(--border-light)',
              backgroundColor: '#fbf9f5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye style={{ width: 15, height: 15, color: '#8f6f32' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#121316' }}>
                  Live Sandboxed Preview
                </span>
              </div>

              {/* Device switch buttons */}
              <div style={{ display: 'flex', background: '#07080a', padding: '2px', borderRadius: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    borderRadius: '2px',
                    background: previewDevice === 'desktop' ? '#1f2127' : 'transparent',
                    color: previewDevice === 'desktop' ? '#ffffff' : '#71717a',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Monitor style={{ width: 13, height: 13 }} />
                  <span>Desktop (600px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    borderRadius: '2px',
                    background: previewDevice === 'mobile' ? '#1f2127' : 'transparent',
                    color: previewDevice === 'mobile' ? '#ffffff' : '#71717a',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Smartphone style={{ width: 13, height: 13 }} />
                  <span>Mobile (375px)</span>
                </button>
              </div>
            </div>

            {/* Centered Preview Display Area */}
            <div style={{
              background: '#07080a',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: '380px',
              maxHeight: '440px',
              overflow: 'auto'
            }}>
              <div style={{
                width: previewDevice === 'mobile' ? '375px' : '600px',
                maxWidth: '100%',
                transition: 'width 0.25s ease',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
              }}>
                <iframe
                  title="Email Preview"
                  srcDoc={htmlCode || '<div style="color:#666;padding:30px;text-align:center;font-family:sans-serif;">Enter HTML code on the left to preview here...</div>'}
                  style={{
                    width: '100%',
                    height: '400px',
                    border: 'none',
                    display: 'block'
                  }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

          {/* Bulk Contact Upload & Dispatch Hub */}
          <div style={{
            background: '#121316',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users style={{ width: 16, height: 16, color: '#c5a059' }} />
                <h3 style={{ margin: 0, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff' }}>
                  Bulk Contact List & Dispatch
                </h3>
              </div>

              {contacts.length > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)'
                }}>
                  {contacts.length} Patrons Ready
                </span>
              )}
            </div>

            {/* 1. CSV File Upload Area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a1a1aa', marginBottom: '8px' }}>
                Upload Contact List (CSV with Names & Emails)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1px dashed rgba(197, 160, 89, 0.45)',
                  background: 'rgba(11, 12, 14, 0.8)',
                  borderRadius: '4px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  style={{ display: 'none' }}
                />
                <Upload style={{ width: 24, height: 24, color: '#c5a059', margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 500 }}>
                  {isParsingFile ? (
                    <span style={{ color: '#c5a059' }}>Extracting names & emails...</span>
                  ) : (
                    <span>Click to browse and upload <strong style={{ color: '#c5a059' }}>.csv</strong></span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
                  Auto-detects Name (Full Name, First/Last) and Email Address columns.
                </div>
              </div>

              {uploadStats && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#07080a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '8px 12px',
                  borderRadius: '2px',
                  marginTop: '8px',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: '#d4d4d8' }}>
                    Loaded: <strong style={{ color: '#ffffff' }}>{uploadStats.source}</strong> ({uploadStats.count} contacts total)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContacts([]);
                      setUploadStats(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Clear contacts"
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              )}

              {/* Quick Add Single Contact Form (Name + Email) */}
              <form onSubmit={handleAddSingleContact} style={{
                marginTop: '10px',
                background: '#fbf9f5',
                border: '1px solid var(--border-dark)',
                borderRadius: '4px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059', fontWeight: 600 }}>
                    Add Contact Manually
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {showManualInput ? 'Hide bulk paste' : 'Or bulk paste list'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) auto', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Patron Name (e.g. John Doe)"
                    style={{
                      background: '#07080a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '2px',
                      padding: '7px 10px',
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="email"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    placeholder="Email (e.g. patron@gmail.com)"
                    style={{
                      background: '#07080a',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '2px',
                      padding: '7px 10px',
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: '#1f2127',
                      border: '1px solid rgba(197, 160, 89, 0.35)',
                      color: '#c5a059',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Add Patron
                  </button>
                </div>

                {showManualInput && (
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <textarea
                      rows={2}
                      value={manualRecipients}
                      onChange={(e) => setManualRecipients(e.target.value)}
                      placeholder="Paste contacts e.g.:&#10;Jane Doe, jane@example.com&#10;John Smith, john@example.com"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: '#07080a',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        padding: '8px',
                        borderRadius: '2px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddManualEmails}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '5px 12px',
                        fontSize: '0.72rem',
                        background: '#1f2127',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Add Pasted Contacts
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Added Contacts Table (Names & Emails) */}
            {contacts.length > 0 && (
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059', fontWeight: 600 }}>
                    Loaded Patrons Roster ({contacts.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setContacts([]);
                      setUploadStats(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Clear Roster
                  </button>
                </div>

                {contacts.length > 5 && (
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#07080a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                )}

                <div style={{
                  maxHeight: '230px',
                  overflowY: 'auto',
                  background: '#07080a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                    <thead>
                      <tr style={{ background: '#0e0f13', color: '#a1a1aa', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '7px 10px', width: '30px' }}>#</th>
                        <th style={{ padding: '7px 10px' }}>Patron Name</th>
                        <th style={{ padding: '7px 10px' }}>Email Address</th>
                        <th style={{ padding: '7px 10px', width: '24px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((c, idx) => (
                        <tr key={c.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '6px 10px', color: '#71717a' }}>{idx + 1}</td>
                          <td style={{ padding: '6px 10px', color: '#ffffff', fontWeight: 500 }}>{c.name}</td>
                          <td style={{ padding: '6px 10px', color: '#c5a059', fontFamily: 'monospace' }}>{c.email}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveContact(c.email)}
                              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
                              title="Remove"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Campaign Broadcast Action */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={handleBroadcastCampaign}
                disabled={isBroadcasting || contacts.length === 0}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  background: (isBroadcasting || contacts.length === 0)
                    ? '#1f2127'
                    : 'linear-gradient(135deg, #c5a059 0%, #e2be75 100%)',
                  color: (isBroadcasting || contacts.length === 0) ? '#71717a' : '#000000',
                  border: 'none',
                  cursor: (isBroadcasting || contacts.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: contacts.length > 0 ? '0 4px 14px rgba(197, 160, 89, 0.25)' : 'none'
                }}
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw style={{ width: 15, height: 15 }} className="spin-animation" />
                    <span>Broadcasting Campaign ({broadcastProgress.sent}/{broadcastProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Mail style={{ width: 15, height: 15 }} />
                    <span>Broadcast Campaign ({contacts.length} Contacts)</span>
                  </>
                )}
              </button>

              {/* Broadcast Progress Tracker */}
              {broadcastProgress.status !== 'idle' && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#07080a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#ffffff' }}>
                    <span>Progress: {broadcastProgress.sent} of {broadcastProgress.total} sent</span>
                    <span style={{ color: '#c5a059', fontWeight: 600 }}>
                      {Math.round((broadcastProgress.sent / (broadcastProgress.total || 1)) * 100)}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '4px', background: '#1a1b20', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.round((broadcastProgress.sent / (broadcastProgress.total || 1)) * 100)}%`,
                      height: '100%',
                      backgroundColor: '#c5a059',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
                    {broadcastProgress.logs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a' }}>
                        <span>[{log.time}] {log.batch} ({log.count} recipients)</span>
                        <span style={{ color: log.status.includes('Delivered') ? '#34d399' : '#f87171' }}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Google Endpoint Setup Modal */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#121316',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            borderRadius: '4px',
            maxWidth: '560px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings style={{ width: 18, height: 18, color: '#c5a059' }} />
                <h3 style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff' }}>
                  Google Apps Script Endpoint Setup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0 }}>
                To send emails directly from your official Google account without any backend server:
              </p>

              <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" style={{ color: '#c5a059', textDecoration: 'underline' }}>script.google.com</a> and click <strong>New Project</strong>.
                </li>
                <li>
                  Copy the code from <code style={{ color: '#ffffff', background: '#1f2127', padding: '2px 6px', borderRadius: '2px' }}>google_apps_script.js</code> (in your project folder) and paste it into the editor.
                </li>
                <li>
                  Click <strong>Deploy &rarr; New deployment &rarr; Select type: Web app</strong>:
                  <br />
                  - <em>Execute as</em>: <strong>Me</strong>
                  <br />
                  - <em>Who has access</em>: <strong>Anyone</strong> (required so your store can call it)
                </li>
                <li>
                  Click <strong>Deploy</strong>, grant permission, and copy your <strong>Web App URL</strong>.
                </li>
              </ol>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '6px' }}>
                  Paste Google Web App URL:
                </label>
                <input
                  type="text"
                  value={googleEndpoint}
                  onChange={(e) => setGoogleEndpoint(e.target.value.trim())}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#07080a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '2px',
                    padding: '9px 12px',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setGoogleEndpoint(PERMANENT_GOOGLE_ENDPOINT);
                  localStorage.setItem('elvany_google_email_endpoint', PERMANENT_GOOGLE_ENDPOINT);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c5a059',
                  fontSize: '0.72rem',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Reset to Default Endpoint
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.75rem',
                    background: '#1f2127',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (googleEndpoint) {
                      localStorage.setItem('elvany_google_email_endpoint', googleEndpoint);
                    }
                    setShowConfigModal(false);
                  }}
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #c5a059 0%, #e2be75 100%)',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmailStudio;
