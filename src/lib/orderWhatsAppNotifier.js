/**
 * Utilities for formatting WhatsApp dispatch and shipping messages for Maison ELVANY orders.
 */

/**
 * Standardize Sri Lankan or international phone numbers for WhatsApp wa.me links.
 * E.g., '071 909 2726' -> '94719092726'
 *       '+94 77 123 4567' -> '94771234567'
 *       '0771234567' -> '94771234567'
 */
export const formatWhatsAppPhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/[^0-9]/g, '');
  if (!digits) return '';

  if (digits.startsWith('0') && digits.length === 10) {
    return '94' + digits.slice(1);
  }
  if (digits.startsWith('94')) {
    return digits;
  }
  if (digits.length === 9) {
    return '94' + digits;
  }
  return digits;
};

/**
 * Generate a luxury formatted WhatsApp shipping notice.
 */
export const generateShippingWhatsAppMessage = (order, trackingNumber = null, customNote = '') => {
  if (!order) return '';

  const customerName = order.customerName || order.name || 'Valued Client';
  const orderId = order.orderId || order.id || 'N/A';
  const activeTracking = (trackingNumber !== null && trackingNumber !== undefined && trackingNumber !== '')
    ? String(trackingNumber).trim()
    : (order.trackingNumber || order.tracking_number || '').trim();

  // Extract items list
  const itemsList = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(item => {
        const title = item.title || item.name || 'Haute Garment';
        const size = item.size || item.selectedSize || item.sizeCode || '';
        const qty = item.quantity || 1;
        const sizeStr = size ? ` [Size ${size}]` : '';
        return `• ${title}${sizeStr} × ${qty}`;
      }).join('\n')
    : '• ELVANY Luxury Capsule Garment';

  const destination = order.customerLocation || order.shippingAddress?.city || 'Sri Lanka';
  const totalLKR = order.totalLKR || order.total || order.items?.reduce((a, b) => a + (b.priceLKR || 18500) * (b.quantity || 1), 0) || 0;
  const paymentMethod = order.paymentMethod || 'Online Payment';

  const trackingSection = activeTracking ? `
🚚 *LIVE COURIER TRACKING:*
• Courier: *Citypak Express*
• Tracking / Waybill No: *${activeTracking}*
• Live Tracking URL: https://track.citypak.lk/track?tracking_number=${encodeURIComponent(activeTracking)}` : `
🚚 *DISPATCH STATUS:*
• Courier: *Citypak Express*
• Status: *Dispatched from Atelier*`;

  const customNoteSection = customNote && customNote.trim() ? `\n📝 *ATELIER DISPATCH NOTE:*\n${customNote.trim()}\n` : '';

  return `✨ *MAISON ELVANY — ORDER DISPATCH & SHIPPING NOTIFICATION* ✨

Dear ${customerName},

We are pleased to inform you that your order *#${orderId}* has been meticulously inspected, hand-packed, and officially handed over to our express courier partner (*Citypak Courier*) for priority delivery to *${destination}*.

📦 *PARCEL SUMMARY:*
${itemsList}

💰 *VALUATION & PAYMENT:*
• Total: LKR ${Number(totalLKR).toLocaleString()}
• Settlement: ${paymentMethod}
${trackingSection}
${customNoteSection}
🌐 *CLIENT PASSPORT & ORDER STATUS:*
You may also review your live order status and digital passport online:
${typeof window !== 'undefined' ? window.location.origin : 'https://elvanywear.com'}/account

Thank you for selecting ELVANY. Our concierge remains at your disposal should you require styling or delivery assistance.

Warmest regards,
*ELVANY Atelier Desk*
Colombo, Sri Lanka
WhatsApp Concierge: +94 71 909 2726`;
};

/**
 * Generate full wa.me direct URL with encoded message.
 */
export const generateWhatsAppUrl = (phone, message) => {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message || '');
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
};
