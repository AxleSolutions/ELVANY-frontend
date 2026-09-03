import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MAIN_LOGO_BASE64 } from './mainLogoBase64.js';

/**
 * Generate luxury invoice HTML for Maison ELVANY (Clean, Gold Accents, No Green, Pure PDF Layout)
 */
export function generateInvoiceHtml(order, isScreenView = false) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const subtotal = Number(order?.subtotalLKR || order?.totalLKR || 0);
  const deliveryFee = Number(order?.deliveryFeeLKR ?? order?.shippingFeeLKR ?? 0);
  const grandTotal = Number(order?.grandTotalLKR || order?.totalLKR || (subtotal + deliveryFee));
  const savings = Number(order?.savingsLKR || 0);

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
    const itemSize = item.selectedSize || item.size || 'M (40)';
    const itemColor = item.color || 'Onyx Black';
    const qty = parseInt(item.quantity || item.qty || 1, 10);
    const unitPrice = parseFloat(item.priceLKR || item.price || 0);
    const totalLine = unitPrice * qty;
    const isBespoke = Boolean(item.isBespokeCustom || item.designCode);

    return `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 14px 12px; vertical-align: top;">
          <div style="font-weight: 700; color: #111111; font-size: 13.5px; letter-spacing: 0.01em;">
            ${itemTitle}
          </div>
          ${isBespoke ? '<div style="font-size: 10.5px; color: #c5a059; font-weight: 600; text-transform: uppercase; margin-top: 2px;">★ Bespoke Atelier Customization</div>' : ''}
          <div style="font-size: 11.5px; color: #666666; margin-top: 3px;">
            Atelier Code: ${item.designCode || item.productId || item.id || `GAR-${idx + 1}`}
          </div>
        </td>
        <td style="padding: 14px 12px; vertical-align: top; font-size: 12.5px; color: #333333;">
          <div><strong>Size:</strong> ${itemSize}</div>
          <div style="margin-top: 2px;"><strong>Color:</strong> ${itemColor}</div>
        </td>
        <td style="padding: 14px 12px; vertical-align: top; text-align: center; font-size: 12.5px; font-weight: 600; color: #111111;">
          ${qty}
        </td>
        <td style="padding: 14px 12px; vertical-align: top; text-align: right; font-size: 12.5px; color: #444444;">
          LKR ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 14px 12px; vertical-align: top; text-align: right; font-size: 13.5px; font-weight: 700; color: #111111;">
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
    color: #111111;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    border-top: 4px solid #c5a059;
    padding: 42px 48px;
    box-sizing: border-box;
    margin: 0 auto;
  ">
    <!-- Header Section -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e5e5e5; padding-bottom: 24px; margin-bottom: 24px;">
      <!-- Brand Logo (Main logo contains symbol and name) -->
      <div>
        <img 
          src="${MAIN_LOGO_BASE64}" 
          alt="ELVANY" 
          style="max-height: 54px; max-width: 220px; object-fit: contain; display: block;" 
        />
      </div>

      <!-- Invoice Metadata -->
      <div style="text-align: right;">
        <div style="font-size: 16px; font-weight: 800; color: #111111; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">
          ORDER PASSPORT
        </div>
        <div style="font-size: 13.5px; font-weight: 700; color: #c5a059; letter-spacing: 0.04em;">
          REF #${order.orderId || 'PENDING'}
        </div>
        <div style="font-size: 11px; color: #666666; margin-top: 4px;">
          <strong>Date:</strong> ${orderDate} &bull; <strong>Time:</strong> ${orderTime}
        </div>
      </div>
    </div>

    <!-- Client & Delivery Metadata Grid -->
    <div style="
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      background-color: #fafafb;
      border: 1px solid #eaeaea;
      border-radius: 4px;
      padding: 18px 20px;
      margin-bottom: 28px;
    ">
      <div>
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #888888; text-transform: uppercase; margin-bottom: 4px;">
          BILLED & DELIVERED TO
        </div>
        <div style="font-size: 13.5px; color: #111111; font-weight: 600; line-height: 1.4;">
          ${order.customerName || 'Valued Client'}
        </div>
        <div style="font-size: 11.5px; color: #555555; margin-top: 3px; line-height: 1.45;">
          ${order.customerLocation || 'Colombo, Sri Lanka'}<br/>
          ${order.customerPhone ? `Contact: ${order.customerPhone}<br/>` : ''}
          ${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
        </div>
      </div>

      <div>
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #888888; text-transform: uppercase; margin-bottom: 4px;">
          SETTLEMENT & VERIFICATION
        </div>
        <div style="font-size: 13.5px; color: #111111; font-weight: 600;">
          ${order.paymentMethod || 'Online Settlement'}
        </div>
        <div style="color: #c5a059; font-weight: 700; font-size: 12px; margin-top: 4px;">
          ✓ Authenticated & Confirmed
        </div>
        <div style="font-size: 11px; color: #666666; margin-top: 6px;">
          ${(order.trackingNumber || order.tracking_number) 
            ? `<span style="color: #111111; font-weight: 700;">Citypak Waybill: ${order.trackingNumber || order.tracking_number}</span> &bull; Track via track.citypak.lk`
            : 'Island-Wide White-Glove Courier Dispatch Guaranteed'}
        </div>
      </div>
    </div>

    <!-- Garment Line Items Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f7f7f8; border-top: 1px solid #e5e5e5; border-bottom: 2px solid #c5a059;">
          <th style="padding: 10px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444444; text-align: left; width: 44%;">Garment Specification</th>
          <th style="padding: 10px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444444; text-align: left; width: 22%;">Fit & Cut</th>
          <th style="padding: 10px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444444; text-align: center; width: 10%;">Qty</th>
          <th style="padding: 10px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444444; text-align: right; width: 12%;">Unit Price</th>
          <th style="padding: 10px 12px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444444; text-align: right; width: 12%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <!-- Financial Ledger -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 26px;">
      <div style="width: 320px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 12.5px; color: #555555;">
          <span>Garment Subtotal:</span>
          <strong style="color: #111111;">LKR ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 12.5px; color: #555555;">
          <span>Island-Wide Courier:</span>
          <span>${deliveryFee === 0 ? '<strong style="color: #c5a059;">COMPLIMENTARY</strong>' : `LKR ${deliveryFee.toFixed(2)}`}</span>
        </div>

        ${savings > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 12.5px; color: #c5a059;">
            <span>Privilege Savings Applied:</span>
            <strong>- LKR ${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-top: 8px; border-top: 2px solid #c5a059; font-size: 15px; font-weight: 800; color: #111111;">
          <span>TOTAL SETTLED:</span>
          <span style="font-size: 19px; color: #c5a059; font-weight: 800;">LKR ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <!-- Return & Exchange Instructions -->
    <div style="
      background-color: #fafafb;
      border: 1px solid #eaeaea;
      border-left: 3px solid #c5a059;
      border-radius: 3px;
      padding: 14px 18px;
      margin-bottom: 22px;
      text-align: left;
    ">
      <div style="font-weight: 700; font-size: 11px; letter-spacing: 0.1em; color: #c5a059; text-transform: uppercase; margin-bottom: 6px;">
        Return & Exchange Guidelines
      </div>
      <div style="font-size: 10px; color: #555555; line-height: 1.65;">
        &bull; <strong>Exchange Window:</strong> Garments can be returned or exchanged within 7 days from the delivery handover date.<br/>
        &bull; <strong>Condition:</strong> Items must be unworn, unwashed, and in original packaging with all atelier tags intact.<br/>
        &bull; <strong>Standard Return Delivery Fees:</strong> If you are returning an item, delivery fees should be handled by you.<br/>
        &bull; <strong>Damaged Goods:</strong> If return is due to damage or defect only, ELVANY will handle and cover the delivery fees.<br/>
        &bull; <strong>Exchange Delivery Fees:</strong> If you are exchanging an item, both delivery fees (return courier & replacement dispatch) should be handled by you.<br/>
        &bull; <strong>Refund Processing:</strong> Any funds or refunds will be received after the package is safely received and verified by our atelier.<br/>
        &bull; <strong>How to Initiate:</strong> Contact concierge at <strong>elvanywear@gmail.com</strong> or WhatsApp <strong>+94 71 909 2726</strong> quoting Order Reference <strong>#${order.orderId || 'BILL'}</strong>.
      </div>
    </div>

    <!-- Atelier Guarantee Footer -->
    <div style="border-top: 1px solid #e5e5e5; padding-top: 18px; text-align: center; font-size: 10.5px; color: #777777; line-height: 1.55;">
      <div style="font-weight: 700; color: #c5a059; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">
        ★ MAISON ELVANY NOBLE ATELIER CERTIFICATE OF AUTHENTICITY ★
      </div>
      <div>
        This passport verifies genuine transaction executed via www.elvanywear.com.<br/>
        Concierge Assistance: <strong>elvanywear@gmail.com</strong> | <strong>+94 71 909 2726</strong> &bull; Sri Lanka
      </div>
    </div>
  </div>
  `;
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
