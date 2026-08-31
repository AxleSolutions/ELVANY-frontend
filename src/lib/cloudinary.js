/**
 * Cloudinary Secure Payment Slip & Media Upload Service
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

/**
 * Upload a payment slip or document to Cloudinary
 * @param {File|Blob} file - The slip image/PDF file
 * @param {string} orderCode - The order identifier (e.g. 'ELV-78920')
 * @returns {Promise<{ secure_url: string, public_id: string, format: string }>}
 */
export async function uploadPaymentSlipToCloudinary(file, orderCode = '') {
  if (!file) return null;

  // If Cloudinary credentials are not configured, fallback to standard FileReader Data URL
  if (!isCloudinaryConfigured) {
    console.info('Cloudinary credentials not set in .env. Falling back to local data URL preview.');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          secure_url: reader.result,
          public_id: `local_${Date.now()}`,
          format: file.type?.split('/')[1] || 'png'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'elvany/payment_slips');
  if (orderCode) {
    formData.append('tags', `order_${orderCode},payment_slip`);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload payment slip to Cloudinary');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format
  };
}


/**
 * Upload a garment product image to Cloudinary
 * @param {File|Blob} file - The image file to upload
 * @returns {Promise<{ secure_url: string, public_id: string, format: string }>}
 */
export async function uploadGarmentImageToCloudinary(file) {
  if (!file) return null;

  // 1. Try Backend Cloudinary Upload Route (Server-side signed & authenticated)
  try {
    const apiUrl = getApiUrl();
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${apiUrl}/uploads/image`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data?.url) {
        return {
          secure_url: data.data.url,
          public_id: data.data.public_id || `cloud_${Date.now()}`,
          format: data.data.format || 'jpg'
        };
      }
    }
  } catch (apiErr) {
    console.warn('Backend image upload endpoint notice:', apiErr);
  }

  // 2. Direct Cloudinary Client Upload fallback
  if (isCloudinaryConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'elvany/products');
      formData.append('tags', 'elvany_garment,product_image');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format
        };
      }
    } catch (directErr) {
      console.warn('Direct Cloudinary client upload notice:', directErr);
    }
  }

  // 3. Development FileReader Base64 fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        secure_url: reader.result,
        public_id: `local_${Date.now()}`,
        format: file.type?.split('/')[1] || 'jpg'
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an entrance popup advertisement image to Cloudinary
 * @param {File|Blob} file - The image file to upload
 * @returns {Promise<{ secure_url: string, public_id: string, format: string }>}
 */
export async function uploadPopupAdImageToCloudinary(file) {
  if (!file) return null;

  // 1. Try Backend Cloudinary Upload Route
  try {
    const apiUrl = getApiUrl();
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${apiUrl}/uploads/ad-image`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data?.url) {
        return {
          secure_url: data.data.url,
          public_id: data.data.public_id || `ad_${Date.now()}`,
          format: data.data.format || 'jpg'
        };
      }
    }
  } catch (apiErr) {
    console.warn('Backend ad image upload notice:', apiErr);
  }

  // 2. Direct Cloudinary Client Upload fallback
  if (isCloudinaryConfigured) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'elvany/popup_ads');
      formData.append('tags', 'elvany_popup_ad,entrance_advertisement');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format
        };
      }
    } catch (directErr) {
      console.warn('Direct Cloudinary ad upload notice:', directErr);
    }
  }

  // 3. Fallback to FileReader Data URI
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        secure_url: reader.result,
        public_id: `local_ad_${Date.now()}`,
        format: file.type?.split('/')[1] || 'jpg'
      });
    };
    reader.readAsDataURL(file);
  });
}


