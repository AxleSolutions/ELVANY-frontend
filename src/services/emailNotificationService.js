/**
 * ELVANY — AUTOMATED EMAIL NOTIFICATION SERVICE
 * Dispatches automated transactional emails (Order Confirmation Receipts,
 * Welcome & Verification notifications) directly through the Google Apps Script gateway.
 */

const FALLBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz_XKyqOJ3x72nKUyVfJDCGbyO_U3gWYCe61gxFF2osFWnx7RS29_cdgAqT8J7DX0h7/exec';

export function getEmailEndpoint() {
  return localStorage.getItem('elvany_google_email_endpoint') ||
    import.meta.env.VITE_GOOGLE_EMAIL_ENDPOINT ||
    FALLBACK_ENDPOINT;
}

/**
 * Resilient email dispatcher with CORS + no-cors fallback
 */
export async function sendEmail({ to, subject, htmlBody, senderName = 'ELVANY', fromEmail, attachments }) {
  const endpoint = getEmailEndpoint();
  if (!endpoint || !to) return { success: false, error: 'Missing endpoint or recipient' };

  const recipients = Array.isArray(to) ? to : [to];
  const cleanRecipients = recipients
    .map(e => String(e).trim().toLowerCase())
    .filter(e => e && e.includes('@'));

  if (cleanRecipients.length === 0) {
    return { success: false, error: 'No valid recipient email address' };
  }

  const payload = {
    action: 'send_email',
    to: cleanRecipients,
    recipients: cleanRecipients,
    subject: subject || 'Notice from ELVANY',
    htmlBody: htmlBody || '<p>Greetings from ELVANY.</p>',
    senderName: senderName || 'ELVANY Concierge',
    fromEmail: fromEmail || localStorage.getItem('elvany_email_from_address') || undefined,
    attachments: (Array.isArray(attachments) && attachments.length > 0) ? attachments : undefined
  };

  const serialized = JSON.stringify(payload);

  // 1. Try standard CORS fetch first
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: serialized
    });

    try {
      const data = await res.json();
      return {
        success: data.status === 'success' || data.success === true,
        message: data.message || 'Email dispatched successfully'
      };
    } catch {
      return { success: true, message: 'Dispatched via Google Web App' };
    }
  } catch (corsErr) {
    // 2. Fallback to mode: 'no-cors' if browser restricts 302 cross-origin redirect reading
    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: serialized
      });
      return { success: true, message: 'Dispatched via Google Web App (no-cors fallback)' };
    } catch (fallbackErr) {
      console.warn('Email dispatch notice:', fallbackErr);
      return { success: false, error: fallbackErr.message };
    }
  }
}

/**
 * Dispatches an official order confirmation & itemized receipt to the client,
 * with the official generated PDF bill attached.
 */
export async function sendOrderConfirmationReceipt(order, options = {}) {
  if (!order || !order.customerEmail) {
    console.warn('sendOrderConfirmationReceipt: missing order or customer email');
    return { success: false, error: 'Missing customer email' };
  }

  const orderId = order.orderId || `ELV-${Math.floor(10000 + Math.random() * 90000)}`;
  const customerName = order.customerName || (order.deliveryAddress?.firstName ? `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName || ''}`.trim() : 'Valued Patron');
  const items = Array.isArray(order.items) ? order.items : [];
  const totalLKR = Number(order.totalLKR || order.grandTotalLKR || 0).toLocaleString();
  const subtotalLKR = Number(order.subtotalLKR || order.totalLKR || 0).toLocaleString();
  const deliveryFeeLKR = Number(order.deliveryFeeLKR || order.shippingFeeLKR || 0).toLocaleString();
  const paymentMethod = order.paymentMethod || 'Direct Payment';
  const orderDate = order.orderDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const address = order.deliveryAddress?.location || order.customerLocation || 'Address on file';

  // Automatically generate official PDF invoice attachment if not pre-passed
  let pdfAttachment = null;
  try {
    let rawB64 = options.pdfBase64;
    if (!rawB64) {
      const { generateInvoicePdfBase64 } = await import('../lib/orderInvoiceGenerator');
      rawB64 = await generateInvoicePdfBase64(order);
    }
    if (rawB64) {
      pdfAttachment = {
        name: `ELVANY_Order_Passport_${orderId}.pdf`,
        mimeType: 'application/pdf',
        base64: rawB64
      };
    }
  } catch (pdfErr) {
    console.warn('PDF invoice attachment generation notice:', pdfErr);
  }

  // Build itemized rows
  const itemsHtml = items.map(item => {
    const title = item.name || item.title || 'Haute Atelier Garment';
    const color = item.color || 'Standard';
    const size = item.size || item.selectedSize || 'M';
    const qty = item.quantity || item.qty || 1;
    const price = Number(item.priceLKR || 0).toLocaleString();

    return `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #ffffff;">
          <div style="font-weight: 500; letter-spacing: 0.03em;">${title}</div>
          <div style="font-size: 11px; color: #a1a1aa; margin-top: 3px;">
            <span>Color: <strong style="color: #c5a059;">${color}</strong></span>
            &bull;
            <span>Size: <strong style="color: #c5a059;">${size}</strong></span>
          </div>
        </td>
        <td align="center" style="padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #a1a1aa;">
          ${qty}
        </td>
        <td align="right" style="padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; font-weight: 600; color: #c5a059; white-space: nowrap;">
          LKR ${price}
        </td>
      </tr>
    `;
  }).join('');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ELVANY — Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0b0b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #121212; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding: 36px 20px 24px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <img src="https://elvany.vercel.app/logo/Main-6.png" alt="ELVANY" width="135" style="display: block; border: 0; max-width: 135px; height: auto; margin: 0 auto 10px auto;" />
              <p style="margin: 0; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #c5a059;">Haute Couture &bull; Atelier</p>
            </td>
          </tr>

          <!-- Confirmation Hero Banner -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center;">
              <span style="display: inline-block; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); background-color: rgba(16, 185, 129, 0.1); padding: 4px 14px; margin-bottom: 18px; border-radius: 2px;">
                Order Confirmed
              </span>
              <h2 style="margin: 0 0 12px 0; font-size: 26px; line-height: 1.3; font-weight: 300; color: #ffffff; letter-spacing: -0.01em;">
                Thank You for Your Patronage
              </h2>
              <p style="margin: 0 auto 20px auto; max-width: 480px; font-size: 14px; line-height: 1.7; color: #a1a1aa;">
                Dear <strong style="color: #ffffff;">${customerName}</strong>, your order has been received by our atelier and is being carefully prepared for master inspection.
              </p>
              
              <!-- Order Reference Box -->
              <div style="background-color: #1a1a1e; border: 1px solid rgba(197, 160, 89, 0.3); border-radius: 4px; padding: 14px 20px; display: inline-block; text-align: left; margin-top: 10px;">
                <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Order Reference</div>
                <div style="font-size: 18px; font-weight: 600; letter-spacing: 0.1em; color: #c5a059; margin-top: 2px;">#${orderId}</div>
                <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">Placed on: ${orderDate} &bull; ${paymentMethod}</div>
              </div>
            </td>
          </tr>

          <!-- Itemized Receipt Table -->
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <div style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #c5a059; font-weight: 600; margin-bottom: 12px;">
                Curation Summary (${items.length} ${items.length === 1 ? 'Garment' : 'Garments'})
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0d10; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #14161a; text-transform: uppercase; font-size: 10px; letter-spacing: 0.12em; color: #71717a;">
                    <th align="left" style="padding: 10px 16px;">Item</th>
                    <th align="center" style="padding: 10px 16px;">Qty</th>
                    <th align="right" style="padding: 10px 16px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px; font-size: 13px; color: #a1a1aa;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; color: #ffffff;">LKR ${subtotalLKR}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Atelier Courier Delivery</td>
                  <td align="right" style="padding: 4px 0; color: #ffffff;">LKR ${deliveryFeeLKR}</td>
                </tr>
                ${(order.surchargeLKR > 0 || String(paymentMethod).toLowerCase().includes('koko')) ? `
                <tr>
                  <td style="padding: 4px 0; color: #c5a059;">Koko BNPL Processing Surcharge (12%)</td>
                  <td align="right" style="padding: 4px 0; color: #c5a059; font-weight: 600;">+ LKR ${Number(order.surchargeLKR || Math.round((order.totalLKR || order.grandTotalLKR || 0) * 0.12 / 1.12)).toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: 600; color: #ffffff; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    Total Paid / Payable
                  </td>
                  <td align="right" style="padding: 10px 0 0 0; font-size: 16px; font-weight: 700; color: #c5a059; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    LKR ${totalLKR}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Official PDF Invoice Attachment Callout Banner -->
          <tr>
            <td style="padding: 0 32px 18px 32px;">
              <div style="background-color: #16171c; border: 1px solid rgba(197, 160, 89, 0.4); border-left: 4px solid #c5a059; border-radius: 4px; padding: 14px 18px; font-size: 12px; color: #e2be75;">
                <div style="font-weight: 700; color: #ffffff; font-size: 12px; letter-spacing: 0.06em; margin-bottom: 3px;">
                  📎 OFFICIAL ORDER PASSPORT &amp; INVOICE ATTACHED (PDF)
                </div>
                <div style="font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                  Your official printable acquisition passport (<code>ELVANY_Order_Passport_${orderId}.pdf</code>) is attached to this email for your permanent records.
                </div>
              </div>
            </td>
          </tr>

          <!-- Delivery Address & Concierge Notice -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background-color: #18191e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px; padding: 16px 20px; font-size: 12px; line-height: 1.7; color: #a1a1aa;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #c5a059; font-weight: 600; margin-bottom: 6px;">
                  Delivery Destination
                </div>
                <div style="color: #ffffff;">${address}</div>
                <div style="margin-top: 10px; font-size: 11px; color: #71717a;">
                  Standard Atelier courier dispatch arrives within 2 to 4 business days. You will receive an SMS and notification upon carrier handoff.
                </div>
              </div>
            </td>
          </tr>

          <!-- Client Support Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 2px;">
                    <a href="https://elvany.vercel.app/account" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #000000; text-decoration: none;">
                      View Order in Atelier Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-size: 11px; line-height: 1.8; color: #71717a;">
              <p style="margin: 0 0 6px 0;">For inquiries or bespoke adjustments, contact your concierge at <a href="mailto:concierge@elvany.com" style="color: #c5a059; text-decoration: none;">concierge@elvany.com</a>.</p>
              <p style="margin: 0;">&copy; 2026 ELVANY Atelier &bull; Sri Lanka</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation #${orderId} | ELVANY`,
    htmlBody,
    senderName: 'ELVANY',
    attachments: pdfAttachment ? [pdfAttachment] : undefined
  });
}

/**
 * Dispatches a welcoming email to newly registered patrons
 */
export async function sendWelcomeRegistrationEmail({ email, name }) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email' };
  }

  const patronName = name || email.split('@')[0];

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ELVANY</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0b0b; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #121212; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding: 36px 20px 24px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <img src="https://elvany.vercel.app/logo/Main-6.png" alt="ELVANY" width="135" style="display: block; border: 0; max-width: 135px; height: auto; margin: 0 auto 10px auto;" />
              <p style="margin: 0; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #c5a059;">Haute Couture &bull; Atelier</p>
            </td>
          </tr>

          <!-- Welcome Content -->
          <tr>
            <td style="padding: 40px 32px 24px 32px; text-align: center;">
              <span style="display: inline-block; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #c5a059; border: 1px solid rgba(197, 160, 89, 0.4); padding: 4px 14px; margin-bottom: 18px; border-radius: 2px;">
                Client Register Enrolled
              </span>
              <h2 style="margin: 0 0 16px 0; font-size: 28px; line-height: 1.3; font-weight: 300; color: #ffffff; letter-spacing: -0.01em;">
                Welcome to ELVANY
              </h2>
              <p style="margin: 0 auto 24px auto; max-width: 480px; font-size: 14px; line-height: 1.7; color: #a1a1aa;">
                Dear <strong style="color: #ffffff;">${patronName}</strong>, your private account has been successfully created. You now have priority access to seasonal drops, atelier bespoke tailoring, and private client services.
              </p>

              <!-- Privilege Code Card -->
              <div style="background-color: #1a1a1e; border: 1px dashed rgba(197, 160, 89, 0.4); border-radius: 4px; padding: 20px; margin: 20px auto; max-width: 420px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #c5a059; margin-bottom: 6px;">Your Inaugural Privilege</div>
                <div style="font-size: 22px; font-weight: 700; letter-spacing: 0.2em; color: #ffffff; margin: 4px 0;">ELVANY-WELCOME</div>
                <div style="font-size: 12px; color: #71717a; margin-top: 6px;">Enjoy 10% privilege on your inaugural collection order.</div>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 28px auto 10px auto;">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 2px;">
                    <a href="https://elvany.vercel.app/collection" target="_blank" style="display: inline-block; padding: 13px 30px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #000000; text-decoration: none;">
                      Explore The Collection &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-size: 11px; line-height: 1.8; color: #71717a;">
              <p style="margin: 0 0 6px 0;">This email was sent to <strong style="color: #a1a1aa;">${email}</strong> as part of your ELVANY membership.</p>
              <p style="margin: 0;">&copy; 2026 ELVANY Atelier &bull; Sri Lanka</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ELVANY | Your Private Client Access`,
    htmlBody,
    senderName: 'ELVANY'
  });
}
