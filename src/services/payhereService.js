/**
 * Maison ELVANY — PayHere Card Payment Gateway Service
 * Securely communicates with backend hash generator and wraps PayHere.js SDK
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch public payment config (sandbox status & test card guides)
 */
export async function getPaymentGatewayConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/config`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch payment config, using defaults:', err);
  }
  return {
    success: true,
    isSandbox: true,
    merchantId: '1211149',
    currency: 'LKR',
    testCards: []
  };
}

/**
 * Request cryptographically signed PayHere checkout parameters from backend
 */
export async function getPayHereParameters(orderData) {
  const res = await fetch(`${API_BASE_URL}/payment/payhere-params`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.orderId,
      amount: orderData.grandTotalLKR || orderData.totalLKR,
      currency: 'LKR',
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || []
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Failed to authenticate payment with Maison payment gateway.');
  }

  const result = await res.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Invalid gateway authorization response.');
  }

  return result.data;
}

/**
 * Inform backend that client successfully completed PayHere payment flow
 */
export async function confirmCardPayment(orderId, paymentDetails = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/confirm-card-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentDetails })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend order confirmation notice:', err);
  }
  return { success: true };
}

/**
 * Ensure PayHere SDK script is loaded
 */
function ensurePayHereLoaded() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.payhere) {
      return resolve(window.payhere);
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[src*="payhere.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.payhere));
      existing.addEventListener('error', () => reject(new Error('PayHere script could not load.')));
      // Wait up to 3s for already injected script
      setTimeout(() => {
        if (window.payhere) resolve(window.payhere);
        else reject(new Error('PayHere SDK timed out loading.'));
      }, 3000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve(window.payhere);
    script.onerror = () => reject(new Error('Failed to load PayHere payment library.'));
    document.head.appendChild(script);
  });
}

/**
 * Launch PayHere Modal Popup with event handlers
 */
export async function launchPayHerePayment(paymentParams, { onCompleted, onDismissed, onError }) {
  await ensurePayHereLoaded();

  if (!window.payhere) {
    throw new Error('PayHere payment window could not be initialized. Please refresh and try again.');
  }

  // Register SDK lifecycle listeners
  window.payhere.onCompleted = function (orderId) {
    console.log(`[PayHere Client SDK] Payment completed successfully for Order #${orderId}`);
    if (onCompleted) {
      onCompleted(orderId);
    }
  };

  window.payhere.onDismissed = function () {
    console.log('[PayHere Client SDK] Payment popup was dismissed by client.');
    if (onDismissed) {
      onDismissed();
    }
  };

  window.payhere.onError = function (error) {
    console.error('[PayHere Client SDK] Payment error:', error);
    if (onError) {
      onError(error);
    }
  };

  // Launch popup
  window.payhere.startPayment(paymentParams);
}
