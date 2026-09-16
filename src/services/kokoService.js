/**
 * Maison ELVANY — Koko Buy Now Pay Later (BNPL) Payment Service
 * Connects frontend with backend RSA signature generator and initiates Koko checkout flow
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const KOKO_SURCHARGE_PERCENT = 12;

/**
 * Fetch Koko Gateway Configuration
 */
export async function getKokoGatewayConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/koko-config`);
    if (res.ok) {
      const data = await res.json();
      return data.data || { surchargePercent: 12, mode: 'qa' };
    }
  } catch (err) {
    console.warn('Could not fetch Koko config, fallback to default:', err);
  }
  return { surchargePercent: 12, mode: 'qa' };
}

/**
 * Calculate 12% surcharge and 3-instalment amount for Koko BNPL
 */
export function calculateKokoAmounts(totalAmountLKR, surchargePercent = KOKO_SURCHARGE_PERCENT) {
  const baseAmount = Number(totalAmountLKR || 0);
  const surcharge = Math.round(baseAmount * (surchargePercent / 100));
  const grandTotal = baseAmount + surcharge;
  const instalmentAmount = Math.round(grandTotal / 3);

  return {
    baseAmount,
    surchargePercent,
    surchargeAmount: surcharge,
    grandTotal,
    instalmentAmount
  };
}

/**
 * Initiate Koko BNPL Session & Redirect User to Koko Gateway
 */
export async function launchKokoPayment({
  orderId,
  amount,
  firstName,
  lastName,
  email,
  description = 'Maison ELVANY Order',
  returnUrl,
  cancelUrl,
  items = []
}) {
  const res = await fetch(`${API_BASE_URL}/payment/koko-initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      amount,
      firstName,
      lastName,
      email,
      description,
      returnUrl,
      cancelUrl,
      items
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Unable to establish secure connection with Koko payment gateway.');
  }

  const result = await res.json();
  if (!result.success || !result.data?.payload) {
    throw new Error(result.message || 'Invalid authorization payload returned from Koko service.');
  }

  const { apiUrl, payload } = result.data;

  // Create a hidden form and submit to Koko endpoint to perform the redirect seamlessly
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = apiUrl;
  form.style.display = 'none';

  Object.entries(payload).forEach(([key, val]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = typeof val === 'object' ? JSON.stringify(val) : String(val);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

/**
 * Query Koko Order Status
 */
export async function verifyKokoOrderStatus(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/koko-verify/${orderId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Koko order verification call failed:', err);
  }
  return { success: false };
}
