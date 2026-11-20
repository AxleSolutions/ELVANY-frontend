import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MAIN_LOGO_BASE64 } from './mainLogoBase64.js';

/**
 * Generate luxury invoice HTML for ELVANY
 * Ultra-professional haute couture atelier passport with clean typography,
 * Main-2.png official brand mark, explicit Koko BNPL surcharge breakdown, and verified credentials.
 */
export function generateInvoiceHtml(order, isScreenView = false) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = Number(order?.subtotalLKR || order?.totalLKR || 0);
  const deliveryFee = Number(order?.deliveryFeeLKR ?? order?.shippingFeeLKR ?? order?.deliveryAddress?.deliveryFeeLKR ?? order?.delivery_address?.deliveryFeeLKR ?? 0);
  const savings = Number(order?.savingsLKR || order?.discount_lkr || 0);
  const voucherDiscount = Number(order?.voucherDiscountLKR ?? order?.voucher_discount_lkr ?? order?.deliveryAddress?.voucherDiscountLKR ?? order?.delivery_address?.voucherDiscountLKR ?? 0);
  const voucherCode = order?.voucherCode || order?.voucher_code || order?.deliveryAddress?.voucherCode || order?.delivery_address?.voucherCode || order?.appliedVoucher?.code || '';

  // Koko BNPL Surcharge Detection & Calculations
  const paymentMethodStr = String(order?.paymentMethod || '').toLowerCase();
  const hasKokoMethod = paymentMethodStr.includes('koko');
  const storedSurcharge = Number(order?.surchargeLKR || order?.paymentSurchargeLKR || 0);
  const hasSurcharge = storedSurcharge > 0;
  const isKoko = hasKokoMethod || hasSurcharge;

  let kokoSurcharge = storedSurcharge;
  const netPreSurcharge = Math.max(0, subtotal + deliveryFee - savings - voucherDiscount);

  if (isKoko && kokoSurcharge <= 0) {
    const rawGrand = Number(order?.grandTotalLKR || order?.totalLKR || 0);
    if (rawGrand > netPreSurcharge) {
      kokoSurcharge = Math.round(rawGrand - netPreSurcharge);
    } else {
      kokoSurcharge = Math.round(netPreSurcharge * 0.12);
    }
  }

  const grandTotal = Number(
    order?.grandTotalLKR || 
    order?.totalLKR || 
    (netPreSurcharge + (isKoko ? kokoSurcharge : 0))
  );

  const kokoInstalment = isKoko ? Math.round(grandTotal / 3) : 0;

  const now = new Date();
  const orderDate = order?.orderDate || now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const orderTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const itemsRowsHtml = items.map((item, idx) => {
    const itemTitle = item.name || item.title || 'Haute Atelier Garment';
    const rawSize = item.selectedSize || item.size || 'M';
    const itemSize = typeof rawSize === 'string' ? rawSize.replace(/\s*\([^)]*\)\s*\d*/g, '').trim() : 'M';
    const itemColor = item.color || 'Onyx Black';
    const qty = parseInt(item.quantity || item.qty || 1, 10);
    const unitPrice = parseFloat(item.priceLKR || item.price || 0);
    const totalLine = unitPrice * qty;
    const isBespoke = Boolean(item.isBespokeCustom || item.designCode);

    return `
      <tr style="border-bottom: 1px solid #f0f0f2;">
        <td style="padding: 13px 12px; vertical-align: top;">
          <div style="font-weight: 700; color: #111215; font-size: 13px; letter-spacing: 0.01em;">
            ${itemTitle}
          </div>
          ${isBespoke ? '<div style="font-size: 10px; color: #9c7b38; font-weight: 700; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.04em;">★ Bespoke Atelier Customization</div>' : ''}
          <div style="font-size: 11px; color: #77777e; margin-top: 3px; font-family: monospace;">
            REF: ${item.designCode || item.productId || item.id || `GAR-${idx + 1}`}
          </div>
        </td>
        <td style="padding: 13px 12px; vertical-align: top; font-size: 12px; color: #2d2e33;">
          <div><strong style="color: #111215;">Size:</strong> ${itemSize}</div>
          <div style="margin-top: 3px;"><strong style="color: #111215;">Color:</strong> ${itemColor}</div>
        </td>
        <td style="padding: 13px 12px; vertical-align: top; text-align: center; font-size: 12.5px; font-weight: 700; color: #111215;">
          ${qty}
        </td>
        <td style="padding: 13px 12px; vertical-align: top; text-align: right; font-size: 12px; color: #333336; font-family: -apple-system, sans-serif;">
          LKR ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 13px 12px; vertical-align: top; text-align: right; font-size: 13px; font-weight: 700; color: #111215; font-family: -apple-system, sans-serif;">
          LKR ${totalLine.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `;
  }).join('');

  return `
  <div class="invoice-card" style="
    width: 100%;
    max-width: 794px;
    background: #ffffff;
    color: #111215;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    border-top: 5px solid #c5a059;
    box-sizing: border-box;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  ">
    <!-- Prestige Atelier Noir Header with Official White Main-5.png Logo -->
    <div style="
      background-color: #0c0d10;
      color: #ffffff;
      padding: 26px 38px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #c5a059;
    ">
      <!-- Left: Haute Logo Mark (Main-5.png) -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center;">
        <img 
          src="${MAIN_LOGO_BASE64}" 
          alt="ELVANY" 
          style="height: 68px; width: auto; max-width: 320px; object-fit: contain; display: block;" 
        />
        <div style="font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #c5a059; margin-top: 7px; font-weight: 600;">
          HAUTE HEAVYWEIGHT ATELIER &bull; FLORENCE &bull; SRI LANKA
        </div>
      </div>

      <!-- Right: Document Passport Credentials -->
      <div style="text-align: right;">
        <div style="font-size: 10.5px; font-weight: 700; color: #c5a059; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px;">
          OFFICIAL ATELIER PASSPORT & INVOICE
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: 0.06em; font-family: monospace;">
          ORDER #${order.orderId || 'PENDING'}
        </div>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
          <span>${orderDate}</span> &bull; <span>${orderTime}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Container with Elegant Margins -->
    <div style="padding: 32px 40px;">

      <!-- Client Dossier & Settlement Matrix (2-Column Structured Card) -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        background-color: #fbfbfb;
        border: 1px solid #ebebeb;
        border-left: 3px solid #c5a059;
        border-radius: 3px;
        padding: 18px 22px;
        margin-bottom: 26px;
      ">
        <!-- Client & Delivery Destination -->
        <div>
          <div style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; color: #8c6d2d; text-transform: uppercase; margin-bottom: 6px;">
            BILLED & DELIVERED TO
          </div>
          <div style="font-size: 14px; color: #111215; font-weight: 700; line-height: 1.35;">
            ${order.customerName || 'Valued Atelier Client'}
          </div>
          <div style="font-size: 11.5px; color: #4b4b52; margin-top: 4px; line-height: 1.5;">
            ${order.customerLocation || 'Sri Lanka'}<br/>
            ${order.customerPhone ? `Courier Contact: <strong style="color: #111215;">${order.customerPhone}</strong><br/>` : ''}
            ${order.customerEmail ? `Email: <span style="color: #111215;">${order.customerEmail}</span>` : ''}
          </div>
        </div>

        <!-- Settlement & Logistics Status -->
        <div>
          <div style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; color: #8c6d2d; text-transform: uppercase; margin-bottom: 6px;">
            SETTLEMENT & LOGISTICS
          </div>
          <div style="font-size: 13px; color: #111215; font-weight: 700;">
            ${isKoko ? 'Koko Buy Now Pay Later (3x Instalments)' : (order.paymentMethod || 'Online Settlement')}
          </div>
          <div style="font-size: 11px; color: #55555c; margin-top: 6px; line-height: 1.45;">
            ${(order.trackingNumber || order.tracking_number) 
              ? `<strong style="color: #111215;">Waybill Tracking:</strong> ${order.trackingNumber || order.tracking_number} &bull; <span style="color: #8c6d2d;">track.citypak.lk</span>`
              : 'Island-Wide White-Glove Courier Dispatch Guaranteed'}
          </div>
        </div>
      </div>

      <!-- Garment Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
        <thead>
          <tr style="background-color: #f5f5f7; border-top: 1px solid #e2e2e6; border-bottom: 2px solid #c5a059;">
            <th style="padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #333336; text-align: left; width: 44%;">Garment Specification</th>
            <th style="padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #333336; text-align: left; width: 22%;">Cut & Shade</th>
            <th style="padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #333336; text-align: center; width: 8%;">Qty</th>
            <th style="padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #333336; text-align: right; width: 13%;">Unit Price</th>
            <th style="padding: 10px 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #333336; text-align: right; width: 13%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <!-- Financial Ledger Summary -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 22px;">
        <div style="width: 350px; background: #fafafb; border: 1px solid #ebebeb; border-radius: 3px; padding: 14px 18px;">
          
          <!-- Garment Subtotal -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 12px; color: #55555c;">
            <span>Garment Subtotal:</span>
            <strong style="color: #111215;">LKR ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          <!-- Island-Wide Courier Delivery -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 12px; color: #55555c;">
            <span>Island-Wide Courier:</span>
            <span>${deliveryFee === 0 ? '<strong style="color: #8c6d2d;">COMPLIMENTARY</strong>' : `<strong style="color: #111215;">LKR ${deliveryFee.toFixed(2)}</strong>`}</span>
          </div>

          <!-- Privilege Savings -->
          ${savings > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 12px; color: #15803d;">
              <span>Privilege Savings Applied:</span>
              <strong>- LKR ${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          ` : ''}

          <!-- Atelier Single-Use Voucher Applied -->
          ${(voucherCode || voucherDiscount > 0) ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 12px; color: #15803d;">
              <span>Atelier Voucher Applied (${voucherCode || 'GIFT'}):</span>
              <strong>- LKR ${Number(voucherDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          ` : ''}

          <!-- Koko BNPL Processing Surcharge (Prominently Disclosed) -->
          ${(isKoko && kokoSurcharge > 0) ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 12px; color: #8c6d2d; border-top: 1px dashed #e2d2b5; margin-top: 4px;">
              <div>
                <strong style="color: #8c6d2d;">Koko BNPL Surcharge (12%):</strong>
                <div style="font-size: 9.5px; color: #9c7b38; margin-top: 1px;">Koko 3-month split merchant fee</div>
              </div>
              <strong style="color: #8c6d2d; font-size: 12.5px;">+ LKR ${kokoSurcharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          ` : ''}

          <!-- Grand Total Settled -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0 4px 0; margin-top: 6px; border-top: 2px solid #c5a059; font-size: 14px; font-weight: 800; color: #111215;">
            <span>TOTAL SETTLED:</span>
            <span style="font-size: 18px; color: #8c6d2d; font-weight: 800;">LKR ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

        </div>
      </div>

      <!-- Koko 3-Month Equal Installment Breakdown Schedule (When Koko is selected) -->
      ${isKoko ? `
        <div style="
          background-color: #fbf9f4;
          border: 1px solid #ebd9b7;
          border-left: 3px solid #c5a059;
          border-radius: 3px;
          padding: 12px 18px;
          margin-bottom: 22px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; color: #8c6d2d; text-transform: uppercase;">
              KOKO BUY NOW PAY LATER &bull; 3 EQUAL MONTHLY INSTALMENTS
            </div>
            <div style="font-size: 11.5px; font-weight: 800; color: #8c6d2d;">
              3 x LKR ${kokoInstalment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 10.5px; text-align: center;">
            <div style="background: #ffffff; padding: 7px; border: 1px solid #e8dbbe; border-radius: 2px;">
              <div style="font-weight: 700; color: #111215;">Instalment 1</div>
              <div style="color: #8c6d2d; font-weight: 800; margin-top: 2px;">LKR ${kokoInstalment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 9px; color: #15803d; font-weight: 700; margin-top: 2px;">✓ Settled at Checkout</div>
            </div>
            <div style="background: #ffffff; padding: 7px; border: 1px solid #e8dbbe; border-radius: 2px;">
              <div style="font-weight: 700; color: #111215;">Instalment 2</div>
              <div style="color: #4b4b52; font-weight: 800; margin-top: 2px;">LKR ${kokoInstalment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 9px; color: #77777e; margin-top: 2px;">Due in 30 Days</div>
            </div>
            <div style="background: #ffffff; padding: 7px; border: 1px solid #e8dbbe; border-radius: 2px;">
              <div style="font-weight: 700; color: #111215;">Instalment 3</div>
              <div style="color: #4b4b52; font-weight: 800; margin-top: 2px;">LKR ${kokoInstalment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div style="font-size: 9px; color: #77777e; margin-top: 2px;">Due in 60 Days</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Special Gift Message / Atelier Delivery Notes (If provided) -->
      ${(order.giftMessage || order.deliveryNotes) ? `
        <div style="
          background-color: #fbfbfb;
          border: 1px solid #ebebeb;
          border-radius: 3px;
          padding: 12px 18px;
          margin-bottom: 22px;
          font-size: 11px;
          color: #4b4b52;
        ">
          ${order.giftMessage ? `<div><strong style="color: #8c6d2d; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.08em;">Gift Presentation Message:</strong> "${order.giftMessage}"</div>` : ''}
          ${order.deliveryNotes ? `<div style="margin-top: ${order.giftMessage ? '6px' : '0'};"><strong style="color: #111215; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.08em;">Courier Dispatch Instructions:</strong> ${order.deliveryNotes}</div>` : ''}
        </div>
      ` : ''}

      <!-- Official Return & Exchange Guidelines Card -->
      <div style="
        background-color: #fafafb;
        border: 1px solid #eaeaea;
        border-left: 3px solid #c5a059;
        border-radius: 3px;
        padding: 12px 18px;
        margin-bottom: 22px;
        text-align: left;
      ">
        <div style="font-weight: 800; font-size: 10px; letter-spacing: 0.1em; color: #8c6d2d; text-transform: uppercase; margin-bottom: 6px;">
          Return & Exchange Guidelines
        </div>
        <div style="font-size: 10px; color: #55555c; line-height: 1.6;">
          &bull; <strong>Exchange Window:</strong> Garments can be returned or exchanged within 7 days from the delivery handover date.<br/>
          &bull; <strong>Condition:</strong> Items must be unworn, unwashed, and in original packaging with all atelier tags intact.<br/>
          &bull; <strong>Standard Return Delivery Fees:</strong> If you are returning an item, delivery fees should be handled by you.<br/>
          &bull; <strong>Damaged Goods:</strong> If return is due to damage or defect only, ELVANY will handle and cover the delivery fees.<br/>
          &bull; <strong>Exchange Delivery Fees:</strong> If you are exchanging an item, both delivery fees (return courier & replacement dispatch) should be handled by you.<br/>
          &bull; <strong>Refund Processing:</strong> Any funds or refunds will be received after the package is safely received and verified by our atelier.<br/>
          &bull; <strong>How to Initiate:</strong> Contact concierge at <strong>elvanywear@gmail.com</strong> or WhatsApp <strong>+94 71 909 2726</strong> quoting Order Reference <strong>#${order.orderId || 'BILL'}</strong>.
        </div>
      </div>

      <!-- Atelier Guarantee & Verification Footer -->
      <div style="border-top: 1px solid #eaeaea; padding-top: 16px; text-align: center; font-size: 10px; color: #77777e; line-height: 1.5;">
        <div style="font-weight: 800; color: #8c6d2d; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px;">
          ★ ELVANY NOBLE ATELIER CERTIFICATE OF AUTHENTICITY ★
        </div>
        <div>
          This passport verifies genuine acquisition registered on www.elvanywear.com.<br/>
          Concierge Assistance: <strong>elvanywear@gmail.com</strong> | <strong>+94 71 909 2726</strong> &bull; Sri Lanka
        </div>
      </div>

    </div>
  </div>
  `;
}

/**
 * Generates the luxury invoice as a base64 string for automated email attachments
 */
export async function generateInvoicePdfBase64(order) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.innerHTML = generateInvoiceHtml(order, false);
  document.body.appendChild(container);

  try {
    const cardEl = container.querySelector('.invoice-card') || container;

    // Render high-resolution canvas (2x scale for ultra crisp text and borders)
    const canvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    const dataUri = pdf.output('datauristring');
    const base64Data = dataUri.indexOf(',') !== -1 ? dataUri.split(',')[1] : dataUri;
    return base64Data;
  } catch (err) {
    console.warn('Background invoice PDF generation error:', err);
    return null;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Generates and downloads a direct high-resolution PDF document (A4 format)
 */
export async function downloadOrderInvoice(order) {
  // Create an off-screen container for rendering with explicit styling
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.innerHTML = generateInvoiceHtml(order, false);
  document.body.appendChild(container);

  try {
    const cardEl = container.querySelector('.invoice-card') || container;

    // Render high-resolution canvas (2x scale for ultra crisp text and borders)
    const canvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    // Save as true PDF
    const filename = `ELVANY_Order_Passport_${order.orderId || 'BILL'}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('PDF generation error:', err);
    alert('Could not download PDF. Please try again or take a screenshot.');
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
