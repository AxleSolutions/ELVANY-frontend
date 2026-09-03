import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { uploadPaymentSlipToCloudinary, uploadBespokeMockupToCloudinary } from '../lib/cloudinary';
import { PRODUCTS } from '../data/products';
import { INITIAL_ORDERS } from '../data/orders';
import { INITIAL_OFFERS } from '../data/offers';
import { DEFAULT_POPUP_AD } from '../data/popupAd';

export const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};



/**
 * =========================================================================
 * PRODUCTS & CATALOG SERVICES
 * =========================================================================
 */
export async function getProducts() {
  const formatRawProduct = (p) => {
    const defaultVariant = p.product_variants?.find(v => v.is_default) || p.product_variants?.[0];
    const allImages = p.product_variants?.flatMap(v => v.gallery_images || []) || [];

    // Extract inventory matrix
    const inventory = {};
    let totalStock = 0;
    (defaultVariant?.product_stock || []).forEach(s => {
      inventory[s.size_code] = s.stock_quantity;
      totalStock += (s.stock_quantity || 0);
    });
    if (Object.keys(inventory).length === 0) {
      (p.product_variants || []).forEach(v => {
        (v.product_stock || []).forEach(s => {
          inventory[s.size_code] = (inventory[s.size_code] || 0) + (s.stock_quantity || 0);
          totalStock += (s.stock_quantity || 0);
        });
      });
    }

    const basePrice = parseFloat(p.base_price_lkr || p.price || 18500);
    const origPrice = parseFloat(p.original_price_lkr || basePrice);
    const offerPrice = (p.offer_price_lkr !== undefined && p.offer_price_lkr !== null)
      ? parseFloat(p.offer_price_lkr)
      : ((p.offerPriceLKR !== undefined && p.offerPriceLKR !== null) ? parseFloat(p.offerPriceLKR) : null);
    const hasOffer = Boolean(p.is_offer_applied || (offerPrice && offerPrice < basePrice));

    return {
      id: p.id,
      sku: p.sku || `ELV-${p.id?.slice(0, 4) || 'TEE'}`,
      slug: p.slug,
      name: p.title,
      title: p.title,
      subtitle: p.subtitle,
      category: p.category || 'heavyweight',
      silhouette: p.silhouette || 'Boxy Drop-Shoulder',
      price: basePrice,
      priceLKR: basePrice,
      originalPriceLKR: origPrice,
      offerPriceLKR: offerPrice,
      discountTag: p.discount_tag || (offerPrice && origPrice > offerPrice ? `SAVE LKR ${(origPrice - offerPrice).toLocaleString()}` : null),
      isOfferApplied: hasOffer,
      is_active: p.is_active !== false,
      status: p.is_active === false ? 'Draft' : 'Active',
      description: p.description,

      composition: p.fabric_composition || p.composition || '100% Long-Staple Combed Cotton',
      fabric: p.fabric_composition || p.fabric || '100% Long-Staple Combed Cotton',
      gsm: parseInt(p.fabric_weight, 10) || 280,
      weight: p.fabric_weight || '280 GSM',
      features: Array.isArray(p.craftsmanship_details) ? p.craftsmanship_details : [],
      care: Array.isArray(p.care_instructions) ? p.care_instructions : [],
      image: defaultVariant?.gallery_images?.[0] || allImages[0] || p.image || '/images/hero_tshirt.webp',
      images: defaultVariant?.gallery_images?.length > 0 
        ? defaultVariant.gallery_images 
        : (allImages.length > 0 ? allImages : [p.image || '/images/hero_tshirt.webp']),
      colors: (p.product_variants || []).map((v) => ({
        name: v.color_name,
        hex: v.color_hex,
        image: v.gallery_images?.[0] || '/images/hero_tshirt.webp'
      })),
      colorsAvailable: (p.product_variants && p.product_variants.length > 0)
        ? p.product_variants.map(v => v.color_hex)
        : ['#141518', '#c5a059'],
      color: defaultVariant?.color_name || 'Onyx Black',
      tagline: p.subtitle || p.silhouette || 'Noble Cotton Atelier Edition',
      badge: p.badge || (p.is_featured ? 'SIGNATURE EDITION' : null),
      sizes: defaultVariant?.product_stock?.length > 0 
        ? defaultVariant.product_stock.map(s => s.size_code)
        : ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'],
      inventory: Object.keys(inventory).length > 0 ? inventory : {
        'S (38)': 10,
        'M (40)': 15,
        'L (42)': 20,
        'XL (44)': 12,
        'XXL (46)': 6
      },
      totalStock: totalStock > 0 ? totalStock : Object.values(inventory).reduce((a, b) => a + b, 0) || 63,
      rating: 4.95,
      reviewsCount: 14,
      reviews: []
    };
  };

  // 1. Try Backend API
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/products`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map(formatRawProduct);
      }
    }
  } catch (apiErr) {
    console.warn('API products fetch notice:', apiErr);
  }

  // 2. Try Supabase Client Direct
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*, product_stock(*))')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(formatRawProduct);
      }
    } catch (err) {
      console.warn('Supabase products fetch notice:', err);
    }
  }

  return [];
}



export async function getNewsletterSubscribers() {
  const apiUrl = getApiUrl();

  // 1. Try Backend API (has service access to Supabase database)
  try {
    const res = await fetch(`${apiUrl}/newsletter/subscribers`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.subscribers) && json.subscribers.length > 0) {
        return json.subscribers;
      }
    }
  } catch (apiErr) {
    console.warn('API subscribers fetch notice:', apiErr);
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          email: s.email,
          source: s.source || 'Capsule Newsletter',
          subscribedAt: s.created_at,
          status: s.is_active !== false ? 'Active VIP' : 'Inactive'
        }));
      }
    } catch (err) {
      console.warn('Supabase newsletter fetch error:', err);
    }
  }

  // 3. Local storage fallback
  try {
    return JSON.parse(localStorage.getItem('elvany_newsletter_subscribers') || '[]');
  } catch {
    return [];
  }
}



/**
 * =========================================================================
 * ORDERS & BANK TRANSFER SLIP SERVICES
 * =========================================================================
 */
export async function createOrder(orderPayload, paymentSlipFile = null) {
  const apiUrl = getApiUrl();
  let slipData = null;

  // 1. Upload payment slip to Cloudinary if provided
  if (paymentSlipFile) {
    try {
      const formData = new FormData();
      formData.append('slip', paymentSlipFile);
      formData.append('orderCode', orderPayload.orderId);

      const uploadRes = await fetch(`${apiUrl}/uploads/slip`, {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data) {
          slipData = uploadJson.data;
        }
      }
    } catch (slipErr) {
      console.warn('API slip upload notice, trying direct upload:', slipErr);
      try {
        slipData = await uploadPaymentSlipToCloudinary(paymentSlipFile, orderPayload.orderId);
      } catch (e) {
        console.error('Cloudinary direct upload error:', e);
      }
    }
  }

  // 2. Upload any bespoke custom T-shirt mockup images (ALL angles: front, back, left, right, collage) AND customer uploaded artworks to Cloudinary
  const processedItems = await Promise.all((orderPayload.items || []).map(async (item) => {
    if (item.isBespokeCustom) {
      let finalViews = { ...(item.views || {}) };
      let finalArtworks = { ...(item.artworks || {}) };

      // 2a. Upload each angle (front, back, left, right, collage) to Cloudinary if it's base64 dataUrl
      if (item.views && typeof item.views === 'object') {
        for (const [viewKey, viewImg] of Object.entries(item.views)) {
          if (viewImg && typeof viewImg === 'string' && viewImg.startsWith('data:')) {
            try {
              const cloudView = await uploadBespokeMockupToCloudinary(viewImg, `mockup_${item.designCode || orderPayload.orderId}_${viewKey}`);
              if (cloudView?.secure_url) {
                finalViews[viewKey] = cloudView.secure_url;
              }
            } catch (vErr) {
              console.warn(`Bespoke view [${viewKey}] Cloudinary upload notice:`, vErr);
            }
          }
        }
      }

      // 2b. Upload blueprintImage / collage if separate
      let finalBlueprint = item.blueprintImage || finalViews.collage || item.previewThumbnail || null;
      if (finalBlueprint && typeof finalBlueprint === 'string' && finalBlueprint.startsWith('data:')) {
        try {
          const cloudBlueprint = await uploadBespokeMockupToCloudinary(finalBlueprint, `blueprint_${item.designCode || orderPayload.orderId}`);
          if (cloudBlueprint?.secure_url) {
            finalBlueprint = cloudBlueprint.secure_url;
            finalViews.collage = cloudBlueprint.secure_url;
          }
        } catch (bpErr) {
          console.warn('Bespoke blueprint upload notice:', bpErr);
        }
      }

      // 2c. Upload primary front image if base64
      let finalMockupUrl = finalViews.front || item.image || item.product_image_url || finalBlueprint;
      if (finalMockupUrl && typeof finalMockupUrl === 'string' && finalMockupUrl.startsWith('data:')) {
        try {
          const cloudUpload = await uploadBespokeMockupToCloudinary(finalMockupUrl, `mockup_${item.designCode || orderPayload.orderId}_front`);
          if (cloudUpload?.secure_url) {
            finalMockupUrl = cloudUpload.secure_url;
            finalViews.front = cloudUpload.secure_url;
          }
        } catch (mockUpErr) {
          console.warn('Bespoke mockup Cloudinary upload notice:', mockUpErr);
        }
      }

      // 2d. Upload each customer uploaded graphic artwork to Cloudinary
      if (item.artworks && typeof item.artworks === 'object') {
        for (const [spotKey, art] of Object.entries(item.artworks)) {
          if (art && art.dataUrl && typeof art.dataUrl === 'string' && art.dataUrl.startsWith('data:')) {
            try {
              const cloudArt = await uploadBespokeMockupToCloudinary(art.dataUrl, `artwork_${item.designCode || orderPayload.orderId}_${spotKey}`);
              if (cloudArt?.secure_url) {
                finalArtworks[spotKey] = {
                  ...art,
                  dataUrl: cloudArt.secure_url,
                  imageUrl: cloudArt.secure_url
                };
              }
            } catch (artErr) {
              console.warn(`Bespoke artwork [${spotKey}] Cloudinary upload notice:`, artErr);
            }
          }
        }
      }

      // 2e. Asynchronously update bespoke_designs table/registry with permanent Cloudinary URLs for ALL angles
      try {
        if (item.designCode) {
          fetch(`${apiUrl}/bespoke/${item.designCode}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderPayload.orderId,
              order_id: orderPayload.orderId,
              previewThumbnail: finalBlueprint || finalMockupUrl,
              preview_thumbnail: finalBlueprint || finalMockupUrl,
              blueprintImage: finalBlueprint || finalMockupUrl,
              views: finalViews,
              artworks: finalArtworks,
              customerName: orderPayload.customerName,
              customerEmail: orderPayload.customerEmail,
              customerPhone: orderPayload.customerPhone,
              status: 'Ordered / In Production'
            })
          }).catch(() => {});
        }
      } catch {}

      return {
        ...item,
        image: finalMockupUrl,
        product_image_url: finalMockupUrl,
        previewThumbnail: finalBlueprint || finalMockupUrl,
        customArtworkThumb: finalBlueprint || finalMockupUrl,
        blueprintImage: finalBlueprint || finalMockupUrl,
        views: finalViews,
        artworks: finalArtworks
      };
    }
    return item;
  }));

  const completeOrder = {
    ...orderPayload,
    items: processedItems,
    hasSlipAttached: !!(slipData?.url || paymentSlipFile || orderPayload.hasSlipAttached),
    paymentSlipUrl: slipData?.url || slipData?.secure_url || orderPayload.paymentSlipUrl || null,
    paymentSlipPublicId: slipData?.public_id || null,
    paymentSlipName: paymentSlipFile?.name || orderPayload.paymentSlipName || (orderPayload.paymentSlipUrl ? 'Bank_Transfer_Slip.png' : null)
  };

  // 3. Try Backend API for transactional creation & stock reduction
  try {
    const res = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeOrder)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { ...completeOrder, ...json.data };
      }
    }
  } catch (apiErr) {
    console.warn('Backend API order creation notice:', apiErr);
  }

  // 4. Persist to Supabase Direct Fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const isCard = (completeOrder.paymentMethod || '').toLowerCase().includes('card') || (completeOrder.paymentMethod || '').toLowerCase().includes('payhere');
      const isQr = (completeOrder.paymentMethod || '').toLowerCase().includes('qr') || (completeOrder.paymentMethod || '').toLowerCase().includes('lanka');
      const isCod = (completeOrder.paymentMethod || '').toLowerCase().includes('cod') || (completeOrder.paymentMethod || '').toLowerCase().includes('cash');

      const detectedPaymentType = isCard ? 'card' : isQr ? 'lanka_qr' : isCod ? 'cod' : 'bank_transfer';
      const detectedSpecificMethod = isCard
        ? 'PayHere Secure Online Card Payment'
        : isQr
        ? 'LankaQR Instant Transfer'
        : isCod
        ? 'Cash on Delivery (COD)'
        : 'Direct Bank Transfer';

      const structuredAddress = {
        ...(completeOrder.deliveryAddress || {}),
        location: completeOrder.customerLocation || completeOrder.deliveryAddress?.location || 'Colombo, Sri Lanka',
        deliveryFeeLKR: completeOrder.deliveryFeeLKR || 0,
        paymentType: detectedPaymentType,
        specificPaymentMethod: detectedSpecificMethod,
        orderedItems: completeOrder.items || []
      };

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_code: completeOrder.orderId,
          customer_name: completeOrder.customerName,
          customer_email: completeOrder.customerEmail || 'client@elvany.com',
          customer_phone: completeOrder.customerPhone || '',
          delivery_address: structuredAddress,
          payment_method: isCard ? 'card' : isCod ? 'cod' : 'bank_transfer',
          status: completeOrder.status || (isCard || isCod ? 'Payment Verified — Processing Dispatch' : 'Pending Slip Verification'),
          subtotal_lkr: completeOrder.subtotalLKR || completeOrder.totalLKR,
          discount_lkr: completeOrder.savingsLKR || 0,
          grand_total_lkr: completeOrder.grandTotalLKR || completeOrder.totalLKR,
          has_slip_attached: completeOrder.hasSlipAttached,
          payment_slip_url: completeOrder.paymentSlipUrl,
          payment_slip_public_id: completeOrder.paymentSlipPublicId,
          payment_slip_name: completeOrder.paymentSlipName,
          slip_uploaded_at: completeOrder.hasSlipAttached ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (orderErr) {
        console.warn('Supabase order insert error, using local state:', orderErr.message);
      } else if (insertedOrder && completeOrder.items?.length > 0) {
        // Fetch products to map valid UUIDs for order_items foreign key
        const { data: dbProducts } = await supabase.from('products').select('id, title');

        // Insert order line items
        const lineItems = completeOrder.items.map((item) => {
          let matchedProdId = item.productId || item.id;
          if (!matchedProdId || matchedProdId.length !== 36 || !matchedProdId.includes('-')) {
            const found = dbProducts?.find(p => p.title?.toLowerCase().trim() === (item.title || item.name || '').toLowerCase().trim());
            matchedProdId = found?.id || dbProducts?.[0]?.id || null;
          }

          return {
            order_id: insertedOrder.id,
            product_id: matchedProdId,
            product_title: item.name || item.title || 'Haute Atelier Garment',
            color: item.color || 'Onyx Black',
            size: item.selectedSize || item.size || 'M (40)',
            unit_price_lkr: parseFloat(item.priceLKR || 18500),
            original_price_lkr: parseFloat(item.originalPriceLKR || item.priceLKR || 18500),
            quantity: parseInt(item.quantity || item.qty || 1, 10),
            product_image_url: item.image || '/images/hero_tshirt.webp'
          };
        });

        await supabase.from('order_items').insert(lineItems);

        // Decrement live stock in product_stock
        for (const item of completeOrder.items) {
          const size = (item.selectedSize || item.size || '').trim();
          const orderedQty = parseInt(item.quantity || item.qty || 1, 10);
          const itemTitle = (item.title || item.name || '').trim().toLowerCase();

          try {
            let matchedProduct = dbProducts?.find(p => p.id === (item.productId || item.id));
            if (!matchedProduct && itemTitle) {
              matchedProduct = dbProducts?.find(p => p.title?.toLowerCase().trim() === itemTitle) || dbProducts?.[0];
            }

            if (matchedProduct) {
              const { data: variants } = await supabase
                .from('product_variants')
                .select('id, color_name')
                .eq('product_id', matchedProduct.id);

              if (variants?.length > 0) {
                const matchedVariant = (item.color 
                  ? variants.find(v => v.color_name?.toLowerCase().trim() === item.color.toLowerCase().trim())
                  : null) || variants[0];

                const variantId = matchedVariant.id;
                const { data: stockRows } = await supabase
                  .from('product_stock')
                  .select('id, size_code, stock_quantity')
                  .eq('variant_id', variantId);

                if (stockRows?.length > 0) {
                  const stockRow = stockRows.find(s => 
                    s.size_code.toLowerCase().trim() === size.toLowerCase().trim() ||
                    s.size_code.split(' ')[0].toLowerCase() === size.split(' ')[0].toLowerCase()
                  ) || stockRows[0];

                  if (stockRow) {
                    const currentStock = Number(stockRow.stock_quantity) || 0;
                    const newStock = Math.max(0, currentStock - orderedQty);
                    await supabase
                      .from('product_stock')
                      .update({ stock_quantity: newStock })
                      .eq('id', stockRow.id);
                  }
                }
              }
            }
          } catch (stkErr) {
            console.warn('Fallback stock decrement error:', stkErr);
          }
        }
      }
    } catch (dbErr) {
      console.error('Supabase transaction failed:', dbErr);
    }
  }

  return completeOrder;
}


function resolvePaymentMethod(o) {
  const specific = o.delivery_address?.specificPaymentMethod || o.deliveryAddress?.specificPaymentMethod;
  if (specific) return specific;

  const raw = (o.paymentMethod || o.payment_method || o.delivery_address?.paymentType || o.deliveryAddress?.paymentType || '').toLowerCase();
  if (raw.includes('card') || raw.includes('payhere') || raw.includes('online')) {
    return 'PayHere Secure Online Card Payment';
  }
  if (raw.includes('qr') || raw.includes('lanka_qr') || raw.includes('lankaqr')) {
    return 'LankaQR Instant Transfer';
  }
  if (raw.includes('cod') || raw.includes('cash')) {
    return 'Cash on Delivery (COD)';
  }
  if (raw.includes('bank') || raw.includes('transfer')) {
    return 'Direct Bank Transfer';
  }
  if (o.payment_method === 'card') return 'PayHere Secure Online Card Payment';
  if (o.payment_method === 'cod') return 'Cash on Delivery (COD)';
  return 'Direct Bank Transfer';
}

export async function getOrders() {
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/orders`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map(o => {
          const storedItems = o.delivery_address?.orderedItems || o.items || [];
          return {
            orderId: o.order_code || o.orderId,
            customerName: o.customer_name || o.customerName,
            customerEmail: o.customer_email || o.customerEmail,
            customerPhone: o.customer_phone || o.customerPhone,
            customerLocation: o.delivery_address?.location || o.customerLocation || 'Colombo, Sri Lanka',
            deliveryAddress: o.delivery_address || o.deliveryAddress,
            // Accurate live tracking number: check direct field, column, delivery_address JSONB, or courier notes
            trackingNumber: o.trackingNumber || o.tracking_number || o.delivery_address?.trackingNumber || o.deliveryAddress?.trackingNumber || (o.courier_notes?.match(/(?:Citypak|Tracking|Citypak Tracking)[\s:]*([A-Za-z0-9\-]+)/i)?.[1]) || (typeof o.courier_notes === 'string' && !o.courier_notes.includes(' ') ? o.courier_notes : null) || null,
            tracking_number: o.trackingNumber || o.tracking_number || o.delivery_address?.trackingNumber || o.deliveryAddress?.trackingNumber || (o.courier_notes?.match(/(?:Citypak|Tracking|Citypak Tracking)[\s:]*([A-Za-z0-9\-]+)/i)?.[1]) || (typeof o.courier_notes === 'string' && !o.courier_notes.includes(' ') ? o.courier_notes : null) || null,
            orderDate: new Date(o.created_at || o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            createdAt: o.created_at || o.createdAt,
            status: o.status || 'Pending Slip Verification',
            paymentMethod: resolvePaymentMethod(o),
            hasSlipAttached: Boolean(o.has_slip_attached || o.paymentSlipUrl || o.payment_slip_url),
            paymentSlipUrl: o.payment_slip_url || o.paymentSlipUrl,
            paymentSlipName: o.payment_slip_name || o.paymentSlipName,
            subtotalLKR: parseFloat(o.subtotal_lkr || o.subtotalLKR || o.subtotal || 0),
            deliveryFeeLKR: parseFloat(o.delivery_fee_lkr || o.deliveryFeeLKR || o.shippingFeeLKR || o.delivery_address?.deliveryFeeLKR || o.deliveryAddress?.deliveryFeeLKR || 0),
            savingsLKR: parseFloat(o.discount_lkr || o.savingsLKR || 0),
            grandTotalLKR: parseFloat(o.grand_total_lkr || o.grandTotalLKR || o.totalLKR || 0),
            totalLKR: parseFloat(o.grand_total_lkr || o.grandTotalLKR || o.totalLKR || 0),
            items: (o.order_items && o.order_items.length > 0 ? o.order_items : (o.items || [])).map(i => {
              const matched = storedItems.find(si => (si.id === i.product_id || (si.name || si.title) === (i.product_title || i.title || i.name)));
              return {
                productId: i.product_id || i.productId,
                title: i.product_title || i.title || i.name,
                name: i.product_title || i.name || i.title,
                size: i.size || i.selectedSize || 'M (40)',
                selectedSize: i.size || i.selectedSize || 'M (40)',
                color: i.color || 'Onyx Black',
                priceLKR: parseFloat(i.unit_price_lkr || i.priceLKR || 18500),
                originalPriceLKR: parseFloat(i.original_price_lkr || i.originalPriceLKR || 18500),
                quantity: i.quantity || i.qty || 1,
                image: i.product_image_url || i.image || matched?.image || '/images/hero_tshirt.webp',
                isBespokeCustom: i.isBespokeCustom || matched?.isBespokeCustom || Boolean(i.designCode || matched?.designCode) || (i.product_title || i.title || '').toLowerCase().includes('custom') || (i.product_title || i.title || '').toLowerCase().includes('bespoke'),
                designCode: i.designCode || matched?.designCode || ((i.product_title || i.title || '').match(/BL-[A-Z0-9]{4,6}/)?.[0]) || null,
                fabric: i.fabric || matched?.fabric || matched?.fabricName || null,
                cut: i.cut || matched?.cut || matched?.cutName || null,
                customPlacements: i.customPlacements || matched?.customPlacements || [],
                customNotes: i.customNotes || matched?.customNotes || matched?.notes || null,
                artworks: i.artworks || matched?.artworks || {}
              };
            })
          };
        });
      }
    }
  } catch (apiErr) {
    console.warn('API getOrders notice, falling back to direct Supabase:', apiErr);
  }

  // 2. Direct Supabase Client Query
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase orders fetch error:', error.message);
        return [];
      }

      if (Array.isArray(data)) {
        return data.map((o) => {
          const storedItems = o.delivery_address?.orderedItems || [];
          return {
            orderId: o.order_code,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: o.customer_phone,
            customerLocation: o.delivery_address?.location || 'Colombo, Sri Lanka',
            deliveryAddress: o.delivery_address,
            orderDate: new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            createdAt: o.created_at,
            status: o.status,
            trackingNumber: o.tracking_number || o.delivery_address?.trackingNumber || (o.courier_notes?.match(/(?:Citypak|Tracking|Citypak Tracking)[\s:]*([A-Za-z0-9\-]+)/i)?.[1]) || o.courier_notes || null,
            tracking_number: o.tracking_number || o.delivery_address?.trackingNumber || (o.courier_notes?.match(/(?:Citypak|Tracking|Citypak Tracking)[\s:]*([A-Za-z0-9\-]+)/i)?.[1]) || o.courier_notes || null,
            paymentMethod: resolvePaymentMethod(o),
            hasSlipAttached: o.has_slip_attached,
            paymentSlipUrl: o.payment_slip_url,
            paymentSlipName: o.payment_slip_name,
            subtotalLKR: parseFloat(o.subtotal_lkr || 0),
            deliveryFeeLKR: parseFloat(o.delivery_address?.deliveryFeeLKR || 0),
            savingsLKR: parseFloat(o.discount_lkr || 0),
            grandTotalLKR: parseFloat(o.grand_total_lkr || 0),
            totalLKR: parseFloat(o.grand_total_lkr || 0),
            items: (o.order_items || []).map((i) => {
              const matched = storedItems.find(si => (si.id === i.product_id || (si.name || si.title) === i.product_title));
              return {
                productId: i.product_id,
                title: i.product_title,
                name: i.product_title,
                size: i.size,
                selectedSize: i.size,
                color: i.color,
                priceLKR: parseFloat(i.unit_price_lkr),
                originalPriceLKR: parseFloat(i.original_price_lkr),
                quantity: i.quantity,
                image: i.product_image_url || matched?.image || '/images/hero_tshirt.webp',
                isBespokeCustom: matched?.isBespokeCustom || Boolean(matched?.designCode) || (i.product_title || '').toLowerCase().includes('custom') || (i.product_title || '').toLowerCase().includes('bespoke'),
                designCode: matched?.designCode || (i.product_title?.match(/BL-[A-Z0-9]{4,6}/)?.[0]) || null,
                fabric: matched?.fabric || matched?.fabricName || null,
                cut: matched?.cut || matched?.cutName || null,
                customPlacements: matched?.customPlacements || [],
                customNotes: matched?.customNotes || matched?.notes || null,
                artworks: matched?.artworks || {}
              };
            })
          };
        });
      }
    } catch (err) {
      console.error('Supabase fetch failed:', err);
    }
  }

  return [];
}

export async function updateOrderStatus(orderCode, newStatus, trackingNumber = null) {
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/orders/${orderCode}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, trackingNumber })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { orderCode, newStatus, trackingNumber, ...json.data };
    }
  } catch (e) {
    console.warn('API updateOrderStatus notice:', e);
  }

  // 2. Direct Supabase Update
  if (isSupabaseConfigured && supabase) {
    try {
        const updateData = { 
          status: newStatus,
          updated_at: new Date().toISOString(),
          slip_approved_at: newStatus === 'Payment Verified — Processing Dispatch' ? new Date().toISOString() : null
        };

        // Only apply tracking updates if a tracking number argument was provided (including empty string for clearing)
        if (trackingNumber !== undefined) {
          const clean = trackingNumber ? String(trackingNumber).trim() : null;
          // Store in courier_notes for backward compatibility (null clears the note)
          updateData.courier_notes = clean ? `Citypak: ${clean}` : null;
          // Fetch current delivery_address to preserve other fields
          const { data: current } = await supabase
            .from('orders')
            .select('delivery_address')
            .eq('order_code', orderCode)
            .maybeSingle();

          if (current?.delivery_address && typeof current.delivery_address === 'object') {
            updateData.delivery_address = {
              ...current.delivery_address,
              trackingNumber: clean
            };
          }

          // Attempt to write to the dedicated tracking_number column first
          const attempt = await supabase
            .from('orders')
            .update({ ...updateData, tracking_number: clean })
            .eq('order_code', orderCode);

          if (attempt.error && attempt.error.code === 'PGRST204') {
            // Column does not exist yet – fall back to updating JSONB field only
            await supabase
              .from('orders')
              .update(updateData)
              .eq('order_code', orderCode);
          }
        } else {
          // No tracking number argument supplied – just update status fields
          await supabase
            .from('orders')
            .update(updateData)
            .eq('order_code', orderCode);
        }
    } catch (err) {
      console.error('Failed to update status in Supabase:', err);
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('elvany_order_updated', { 
      detail: { orderCode, newStatus, trackingNumber } 
    }));
  } catch {}

  return { orderCode, newStatus, trackingNumber, tracking_number: trackingNumber };
}


/**
 * =========================================================================
 * PRODUCTS & CATALOG ADMIN MANAGEMENT
 * =========================================================================
 */
const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function saveProduct(productData) {
  const isNew = !productData.id || !isUuid(productData.id);
  const apiUrl = getApiUrl();

  // 1. Try Backend API (Full Service-Role Supabase Access)
  try {
    const url = isNew ? `${apiUrl}/products` : `${apiUrl}/products/${productData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const p = json.data;
        const defaultVariant = p.product_variants?.find(v => v.is_default) || p.product_variants?.[0];
        const finalImages = Array.isArray(productData.images)
          ? productData.images
          : (defaultVariant?.gallery_images?.length > 0 ? defaultVariant.gallery_images : [productData.image]);

        return {
          ...productData,
          id: p.id,
          sku: p.sku || productData.sku,
          slug: p.slug,
          image: finalImages[0] || '',
          images: finalImages,
          color: defaultVariant?.color_name || productData.color || 'Onyx Black',
          colorHex: defaultVariant?.color_hex || productData.colorHex || '#121316',
          colors: (p.product_variants && p.product_variants.length > 0)
            ? p.product_variants.map(v => ({ name: v.color_name, hex: v.color_hex, isDefault: v.is_default }))
            : (productData.colors || [{ name: productData.color || 'Onyx Black', hex: productData.colorHex || '#121316', isDefault: true }]),
          colorsAvailable: (p.product_variants && p.product_variants.length > 0)
            ? p.product_variants.map(v => v.color_hex)
            : (productData.colorsAvailable || [productData.colorHex || '#121316']),
          totalStock: Object.values(productData.inventory || {}).reduce((a, b) => a + Number(b), 0)
        };
      }
    }
  } catch (apiErr) {
    console.warn('API product save notice:', apiErr);
  }

  // 2. Fallback to Supabase direct client if available
  if (isSupabaseConfigured && supabase) {
    try {
      const slug = (productData.title || 'garment').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let productId = productData.id;

      const orderedImages = Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : [productData.image || '/images/hero_tshirt.webp'];

      const configuredColors = Array.isArray(productData.colors) && productData.colors.length > 0
        ? productData.colors
        : [{ name: productData.color || 'Onyx Black', hex: productData.colorHex || '#121316', isDefault: true }];

      const defaultCol = configuredColors.find(c => c.isDefault) || configuredColors[0];

      if (isNew) {
        const { data: inserted } = await supabase
          .from('products')
          .insert({
            sku: productData.sku || `ELV-${Date.now().toString().slice(-4)}`,
            slug: slug + '-' + Date.now().toString().slice(-4),
            title: productData.title,
            subtitle: productData.subtitle || productData.silhouette || 'Noble Cotton Atelier Edition',
            category: productData.category || 'heavyweight',
            silhouette: productData.silhouette || 'Boxy Drop-Shoulder',
            base_price_lkr: parseFloat(productData.price || productData.priceLKR || 18500),
            original_price_lkr: parseFloat(productData.originalPriceLKR || productData.price || 18500),
            is_active: productData.status !== 'Draft',
            is_offer_applied: !!productData.isOfferApplied,
            fabric_composition: productData.composition || productData.fabric || '100% Noble Long-Staple Cotton',
            fabric_weight: productData.gsm ? `${productData.gsm} GSM` : (productData.weight || '280 GSM'),
            description: productData.description || 'Crafted in Florence and finished with minimalist atelier precision.'
          })
          .select()
          .single();

        if (inserted) {
          productId = inserted.id;

          const { data: variant } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              color_name: defaultCol.name,
              color_hex: defaultCol.hex,
              is_default: true,
              gallery_images: orderedImages
            })
            .select()
            .single();

          if (variant && productData.inventory) {
            const stockRows = Object.entries(productData.inventory).map(([sizeCode, qty]) => ({
              variant_id: variant.id,
              size_code: sizeCode,
              stock_quantity: parseInt(qty, 10) || 0
            }));
            await supabase.from('product_stock').insert(stockRows);
          }

          return { 
            ...productData, 
            id: productId,
            image: orderedImages[0],
            images: orderedImages,
            color: defaultCol.name,
            colorHex: defaultCol.hex,
            colors: configuredColors,
            colorsAvailable: configuredColors.map(c => c.hex)
          };
        }
      } else {
        await supabase
          .from('products')
          .update({
            title: productData.title,
            subtitle: productData.subtitle || productData.silhouette,
            category: productData.category,
            silhouette: productData.silhouette,
            base_price_lkr: parseFloat(productData.price || productData.priceLKR || 18500),
            is_active: productData.status !== 'Draft',
            fabric_composition: productData.composition || productData.fabric,
            fabric_weight: productData.gsm ? `${productData.gsm} GSM` : productData.weight,
            description: productData.description
          })
        // Update gallery_images across all variants for this product
        await supabase
          .from('product_variants')
          .update({ gallery_images: orderedImages })
          .eq('product_id', productData.id);

        let { data: existingVariant } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', productData.id)
          .limit(1)
          .maybeSingle();

        if (existingVariant) {
          await supabase
            .from('product_variants')
            .update({
              color_name: defaultCol.name,
              color_hex: defaultCol.hex
            })
            .eq('id', existingVariant.id);
        }

        return {
          ...productData,
          image: orderedImages[0],
          images: orderedImages,
          color: defaultCol.name,
          colorHex: defaultCol.hex,
          colors: configuredColors,
          colorsAvailable: configuredColors.map(c => c.hex)
        };
      }
    } catch (err) {
      console.warn('Supabase direct save notice:', err);
    }
  }

  return { ...productData, id: productData.id || `local_${Date.now()}` };
}

export async function toggleProductStatus(productId, nextActiveState) {
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/products/${productId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActiveState })
    });
    if (res.ok) {
      return { productId, isActive: nextActiveState };
    }
  } catch (apiErr) {
    console.warn('API product toggle notice:', apiErr);
  }

  // 2. Direct Supabase fallback
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('products')
        .update({ is_active: Boolean(nextActiveState), updated_at: new Date().toISOString() })
        .eq('id', productId);
    } catch (err) {
      console.warn('Supabase toggle product status error:', err);
    }
  }

  return { productId, isActive: nextActiveState };
}

export async function deleteProduct(productId) {

  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      return productId;
    }
  } catch (apiErr) {
    console.warn('API product delete notice:', apiErr);
  }

  // 2. Direct Supabase fallback
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.warn('Supabase product delete error:', err);
    }
  }
  return productId;
}


export async function updateProductStock(productId, inventoryMap) {
  if (isSupabaseConfigured && supabase) {
    try {
      // Find default variant for this product
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)
        .eq('is_default', true)
        .single();

      if (variant && inventoryMap) {
        for (const [sizeCode, qty] of Object.entries(inventoryMap)) {
          await supabase
            .from('product_stock')
            .upsert({
              variant_id: variant.id,
              size_code: sizeCode,
              stock_quantity: parseInt(qty, 10) || 0
            }, { onConflict: 'variant_id,size_code' });
        }
      }
    } catch (err) {
      console.warn('Supabase stock update error:', err);
    }
  }
  return { productId, inventoryMap };
}

/**
 * =========================================================================
 * PROMOTIONS & PRIVILEGE OFFERS SERVICES
 * =========================================================================
 */
function mapPromotionToOffer(p, productsMap = {}) {
  const productId = Array.isArray(p.applied_product_ids) && p.applied_product_ids.length > 0
    ? p.applied_product_ids[0]
    : null;

  const linkedProduct = productId ? productsMap[productId] : null;
  const fallbackProduct = Object.values(productsMap)[0] || null;
  const targetProduct = linkedProduct || fallbackProduct;

  const originalPrice = targetProduct 
    ? (targetProduct.originalPriceLKR || targetProduct.priceLKR || targetProduct.original_price_lkr || targetProduct.base_price_lkr || 18500)
    : 18500;

  const discountVal = parseFloat(p.discount_value || 3000);
  const offerPrice = p.discount_type === 'percentage'
    ? Math.round(originalPrice * (1 - discountVal / 100))
    : Math.max(0, originalPrice - discountVal);

  const defaultVariant = targetProduct?.product_variants?.find(v => v.is_default) || targetProduct?.product_variants?.[0];
  const galleryImage = targetProduct?.image || targetProduct?.images?.[0] || defaultVariant?.gallery_images?.[0] || '/images/hero_tshirt.webp';

  const sizes = targetProduct?.sizes || defaultVariant?.product_stock?.map(s => s.size_code) || [
    'S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)'
  ];

  return {
    id: p.id,
    code: p.code,
    title: p.title,
    badge: p.badge_label || 'SPECIAL PRIVILEGE',
    productName: targetProduct?.title || targetProduct?.name || p.title,
    productId: targetProduct?.id || null,
    productImage: galleryImage,
    subtitle: targetProduct?.subtitle || targetProduct?.description || p.badge_label || 'Exclusive Atelier privilege allocation.',
    category: targetProduct?.category || 'heavyweight-tees',
    originalPriceLKR: parseFloat(originalPrice),
    offerPriceLKR: parseFloat(offerPrice),
    discountTag: p.discount_type === 'percentage' 
      ? `SAVE ${discountVal}%` 
      : `SAVE LKR ${discountVal.toLocaleString()}`,
    discountType: p.discount_type || 'fixed_amount',
    discountValue: discountVal,
    minOrderAmount: parseFloat(p.min_order_amount_lkr || 0),
    remainingUnits: p.remaining_units !== undefined ? p.remaining_units : null,
    totalAllocation: p.total_allocation !== undefined ? p.total_allocation : null,
    availableSizes: sizes,
    isActive: p.is_active !== false,
    endsAt: p.expires_at || p.ends_at || p.endsAt || null,
    expiresAt: p.expires_at || p.ends_at || p.endsAt || null,
    createdAt: p.created_at
  };
}


export async function getOffers() {
  // 1. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: promotions, error: promoError } = await supabase
        .from('promotions')
        .select('*')
        .neq('code', 'MAISON_RESTOCK_REGISTRY')
        .order('created_at', { ascending: false });

      if (!promoError && Array.isArray(promotions) && promotions.length > 0) {
        // Fetch products to hydrate
        const { data: products } = await supabase
          .from('products')
          .select('*, product_variants(*, product_stock(*))');

        const productsMap = {};
        (products || []).forEach(p => {
          const defaultVariant = p.product_variants?.find(v => v.is_default) || p.product_variants?.[0];
          productsMap[p.id] = {
            id: p.id,
            title: p.title,
            name: p.title,
            subtitle: p.subtitle,
            description: p.description,
            category: p.category,
            priceLKR: parseFloat(p.base_price_lkr),
            originalPriceLKR: parseFloat(p.original_price_lkr || p.base_price_lkr),
            image: defaultVariant?.gallery_images?.[0] || '/images/hero_tshirt.webp',
            sizes: defaultVariant?.product_stock?.map(s => s.size_code) || ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'XXL (46)']
          };
        });

        return promotions.map(p => mapPromotionToOffer(p, productsMap));
      }
    } catch (err) {
      console.warn('Supabase promotions fetch error:', err);
    }
  }

  // 2. Try Backend API
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/offers`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (apiErr) {
    console.warn('API getOffers fetch notice:', apiErr);
  }

  return [];
}

export async function saveOffer(offerData) {
  const isNew = !offerData.id || !isUuid(offerData.id);
  const originalPrice = parseFloat(offerData.originalPriceLKR || 18500);
  const offerPrice = parseFloat(offerData.offerPriceLKR || 15500);
  const discountVal = offerData.discountValue !== undefined 
    ? parseFloat(offerData.discountValue) 
    : Math.max(0, originalPrice - offerPrice);

  const appliedProducts = offerData.productId ? [offerData.productId] : [];

  const promotionPayload = {
    code: (offerData.code || `ELVANY-${Date.now().toString().slice(-4)}`).toUpperCase().trim(),
    title: offerData.title || offerData.productName || 'Privilege Allocation',
    badge_label: (offerData.badge || 'SPECIAL PRIVILEGE').slice(0, 80),
    discount_type: offerData.discountType === 'percentage' ? 'percentage' : 'fixed_amount',
    discount_value: discountVal,
    min_order_amount_lkr: parseFloat(offerData.minOrderAmount || 0),
    applied_product_ids: appliedProducts,
    is_active: offerData.isActive !== false,
    expires_at: offerData.endsAt || offerData.expiresAt || null
  };


  if (isSupabaseConfigured && supabase) {
    try {
      if (isNew) {
        const { data: inserted, error } = await supabase
          .from('promotions')
          .insert(promotionPayload)
          .select()
          .single();

        if (!error && inserted) {
          if (offerData.productId) {
            await supabase.from('products').update({ is_offer_applied: true }).eq('id', offerData.productId);
          }
          return { ...offerData, ...inserted, id: inserted.id };
        }
      } else {
        const { data: updated, error } = await supabase
          .from('promotions')
          .update(promotionPayload)
          .eq('id', offerData.id)
          .select()
          .single();

        if (!error && updated) {
          if (offerData.productId) {
            await supabase.from('products').update({ is_offer_applied: true }).eq('id', offerData.productId);
          }
          return { ...offerData, ...updated };
        }
      }
    } catch (err) {
      console.warn('Supabase save offer error:', err);
    }
  }

  // Fallback to Backend API
  try {
    const apiUrl = getApiUrl();
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? `${apiUrl}/offers` : `${apiUrl}/offers/${offerData.id}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...offerData, discountValue: discountVal })
    });
    if (res.ok) {
      const data = await res.json();
      return { ...offerData, ...(data.data || {}) };
    }
  } catch (apiErr) {
    console.warn('API save offer error:', apiErr);
  }

  return offerData;
}

export async function toggleOfferStatus(offerId, nextActiveState) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('promotions')
        .update({ is_active: nextActiveState })
        .eq('id', offerId);
    } catch (err) {
      console.warn('Supabase toggle offer status error:', err);
    }
  }

  // Also sync to backend API
  try {
    const apiUrl = getApiUrl();
    await fetch(`${apiUrl}/offers/${offerId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActiveState })
    });
  } catch {}

  return { offerId, isActive: nextActiveState };
}

export async function deleteOffer(offerId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('promotions').delete().eq('id', offerId);
    } catch (err) {
      console.warn('Supabase delete offer error:', err);
    }
  }

  // Also sync to backend API
  try {
    const apiUrl = getApiUrl();
    await fetch(`${apiUrl}/offers/${offerId}`, {
      method: 'DELETE'
    });
  } catch {}

  return offerId;
}

/**
 * =========================================================================
 * REVIEWS & CLIENT EVALUATIONS SERVICES
 * =========================================================================
 */
export async function getReviews() {
  // 1. Try Backend API
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/reviews`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map(r => ({
          id: r.id,
          productId: r.productId || r.product_id,
          product_id: r.productId || r.product_id,
          orderId: r.orderId || r.order_id,
          author: r.customerName || r.client_name || r.author || 'Verified Client',
          customerName: r.customerName || r.client_name || r.author || 'Verified Client',
          customerEmail: r.customerEmail || 'client@elvany.com',
          productTitle: r.productTitle || r.title || 'Heavyweight Atelier Tee',
          title: r.title || 'Exceptional Quality',
          rating: Number(r.rating) || 5,
          fitRating: r.fitRating || r.fit_rating || 'True to Atelier Boxy Spec',
          content: r.comment || '',
          comment: r.comment || '',
          location: r.clientLocation || r.client_location || 'Colombo, Sri Lanka',
          date: r.date || new Date().toLocaleDateString(),
          status: r.status || 'Approved',
          isFeatured: !!r.isFeatured,
          helpfulCount: r.helpfulCount || 0
        }));
      }
    }
  } catch (apiErr) {
    console.warn('API getReviews notice:', apiErr);
  }

  // 2. Direct Supabase
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((r) => ({
      id: r.id,
      productId: r.product_id,
      product_id: r.product_id,
      orderId: r.order_id,
      author: r.client_name || r.customer_name || 'Verified Client',
      customerName: r.client_name || r.customer_name || 'Verified Client',
      customerEmail: r.customer_email || 'client@elvany.com',
      productTitle: r.product_title || r.title || 'Heavyweight Atelier Tee',
      title: r.title || 'Exceptional Quality',
      rating: Number(r.rating) || 5,
      fitRating: r.fit_rating || 'True to Atelier Boxy Spec',
      content: r.comment || '',
      comment: r.comment || '',
      location: r.client_location || 'Colombo, Sri Lanka',
      date: new Date(r.created_at || Date.now()).toLocaleDateString(),
      status: r.status === 'published' ? 'Approved' : (r.status || 'Approved'),
      isFeatured: r.is_featured || false,
      helpfulCount: r.helpful_votes || 0
    }));
  } catch {
    return [];
  }
}


export async function addReview(reviewData) {
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: reviewData.productId,
        orderId: reviewData.orderId || null,
        clientName: reviewData.author || reviewData.clientName || reviewData.customerName,
        clientLocation: reviewData.location || 'Colombo, Sri Lanka',
        rating: Number(reviewData.rating) || 5,
        title: reviewData.title || 'Exceptional Craftsmanship',
        comment: reviewData.comment || reviewData.content,
        fitRating: reviewData.fitRating || 'True to Size'
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (apiErr) {
    console.warn('API review submission notice:', apiErr);
  }

  // 2. Direct Supabase Fallback
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reviews').insert({
        product_id: reviewData.productId,
        order_id: reviewData.orderId || null,
        client_name: reviewData.author || reviewData.clientName || reviewData.customerName,
        client_location: reviewData.location || 'Colombo, Sri Lanka',
        rating: Number(reviewData.rating) || 5,
        title: reviewData.title || 'Exceptional Craftsmanship',
        comment: reviewData.comment || reviewData.content,
        is_verified_buyer: true,
        status: 'published'
      });
    } catch (err) {
      console.warn('Supabase direct review insert notice:', err);
    }
  }

  return reviewData;
}


export async function updateReviewStatus(reviewId, newStatus) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);
    } catch (err) {
      console.warn('Supabase review status update error:', err);
    }
  }
  return { reviewId, newStatus };
}

export async function toggleReviewFeatured(reviewId, nextFeaturedState) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('reviews')
        .update({ is_featured: nextFeaturedState })
        .eq('id', reviewId);
    } catch (err) {
      console.warn('Supabase review feature toggle error:', err);
    }
  }
  return { reviewId, isFeatured: nextFeaturedState };
}

export async function deleteReview(reviewId) {
  const apiUrl = getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/reviews/${reviewId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return reviewId;
    }
  } catch (apiErr) {
    console.warn('API deleteReview notice, trying Supabase fallback:', apiErr);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reviews').delete().eq('id', reviewId);
    } catch (err) {
      console.warn('Supabase delete review error:', err);
    }
  }
  return reviewId;
}


/**
 * =========================================================================
 * CLIENT SHOPPING BAG DATABASE SYNCHRONIZATION
 * =========================================================================
 */
export async function getDatabaseCart(email) {
  if (!email) return [];
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/cart?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('API getCart notice:', e);
  }

  // 2. Try Supabase Auth metadata
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.cart) {
        return Array.isArray(user.user_metadata.cart) ? user.user_metadata.cart : [];
      }
    } catch (sbErr) {
      console.warn('Supabase getCart auth notice:', sbErr);
    }
  }

  // 3. Local fallback by user email
  try {
    const saved = localStorage.getItem(`elvany_cart_${email.toLowerCase()}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveDatabaseCart(email, cart) {
  if (!email) return [];
  const apiUrl = getApiUrl();
  const cleanCart = Array.isArray(cart) ? cart : [];

  // Always keep user-specific local copy
  try {
    localStorage.setItem(`elvany_cart_${email.toLowerCase()}`, JSON.stringify(cleanCart));
  } catch {}

  // 1. Try Backend API
  try {
    await fetch(`${apiUrl}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, cart: cleanCart })
    });
  } catch (e) {
    console.warn('API saveCart notice:', e);
  }

  // 2. Try Supabase Auth metadata
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.updateUser({ data: { cart: cleanCart } }).catch(() => {});
    } catch {}
  }

  return cleanCart;
}

/**
 * =========================================================================
 * ENTRANCE POPUP ADVERTISEMENT DATABASE & CLOUDINARY SERVICES
 * =========================================================================
 */

/**
 * Get current popup ad settings from backend / Supabase with local fallback
 */
export async function getPopupAdSettings() {
  const apiUrl = getApiUrl();

  // 1. Try Backend API (which checks Supabase promotions & local JSON)
  try {
    const res = await fetch(`${apiUrl}/popup-ad`);
    if (res.ok) {
      const body = await res.json();
      if (body.data) {
        try {
          localStorage.setItem('elvany_popup_ad_settings', JSON.stringify(body.data));
        } catch {}
        return body.data;
      }
    }
  } catch (apiErr) {
    console.warn('API getPopupAdSettings notice:', apiErr);
  }

  // 2. Direct Supabase Query Fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', 'POPUP_AD_CAMPAIGN')
        .maybeSingle();

      if (!error && data) {
        const targetUrl = Array.isArray(data.applied_product_ids) && data.applied_product_ids.length > 0
          ? data.applied_product_ids[0]
          : '/collection';

        const parsed = {
          enabled: data.is_active !== false,
          imageUrl: data.badge_label || '/images/editorial_brutalist.webp',
          targetUrl: targetUrl || '/collection',
          altText: data.title || 'ELVANY Seasonal Advertisement',
          showOncePerSession: true,
          updatedAt: data.created_at || new Date().toISOString()
        };

        try {
          localStorage.setItem('elvany_popup_ad_settings', JSON.stringify(parsed));
        } catch {}
        return parsed;
      }
    } catch (sbErr) {
      console.warn('Supabase getPopupAdSettings notice:', sbErr);
    }
  }

  // 3. LocalStorage Fallback
  try {
    const saved = localStorage.getItem('elvany_popup_ad_settings');
    if (saved) return JSON.parse(saved);
  } catch {}

  return DEFAULT_POPUP_AD;
}

/**
 * Save popup ad settings to Backend API, Supabase Database, and localStorage
 */
export async function savePopupAdSettings(settings) {
  const apiUrl = getApiUrl();
  const cleanSettings = {
    enabled: settings.enabled !== false,
    imageUrl: settings.imageUrl || '/images/editorial_brutalist.webp',
    targetUrl: settings.targetUrl || '/collection',
    altText: settings.altText || 'ELVANY Seasonal Advertisement',
    showOncePerSession: settings.showOncePerSession !== false,
    updatedAt: new Date().toISOString()
  };

  // Always sync local storage immediately for real-time frontend reactivity
  try {
    localStorage.setItem('elvany_popup_ad_settings', JSON.stringify(cleanSettings));
  } catch {}

  // 1. Save to Backend API
  try {
    const res = await fetch(`${apiUrl}/popup-ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanSettings)
    });
    if (res.ok) {
      const body = await res.json();
      if (body.data) return body.data;
    }
  } catch (apiErr) {
    console.warn('API savePopupAdSettings notice:', apiErr);
  }

  // 2. Direct Supabase Upsert Fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('promotions')
        .select('id')
        .eq('code', 'POPUP_AD_CAMPAIGN')
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('promotions')
          .update({
            title: cleanSettings.altText,
            badge_label: cleanSettings.imageUrl,
            discount_type: 'popup_ad',
            applied_product_ids: [cleanSettings.targetUrl || '/collection'],
            is_active: cleanSettings.enabled,
            created_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('promotions')
          .insert({
            code: 'POPUP_AD_CAMPAIGN',
            title: cleanSettings.altText,
            badge_label: cleanSettings.imageUrl,
            discount_type: 'popup_ad',
            discount_value: 0,
            min_order_amount_lkr: 0,
            applied_product_ids: [cleanSettings.targetUrl || '/collection'],
            is_active: cleanSettings.enabled,
            starts_at: new Date().toISOString()
          });
      }
    } catch (sbErr) {
      console.warn('Supabase savePopupAdSettings notice:', sbErr);
    }
  }

  return cleanSettings;
}


/**
 * Upload an advertisement image file directly to Cloudinary
 */
export async function uploadPopupAdImage(file) {
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
          format: data.data.format || 'webp'
        };
      }
    }
  } catch (apiErr) {
    console.warn('Backend ad image upload notice:', apiErr);
  }

  // 2. Fallback to FileReader Data URI
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        secure_url: reader.result,
        public_id: `local_ad_${Date.now()}`,
        format: file.type?.split('/')[1] || 'webp'
      });
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================================
   RESTOCK / GARMENT RE-ISSUE DEMAND REQUESTS
   ========================================================================= */

const LOCAL_RESTOCK_KEY = 'elvany_restock_requests';

/**
 * Submit a new restock / re-issue request
 */
export async function createRestockRequest(payload) {
  const apiUrl = getApiUrl();

  const normalizedReq = {
    id: `req-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    productId: payload.productId || null,
    productTitle: payload.productTitle || 'Haute Atelier Garment',
    productImage: payload.productImage || '/images/hero_tshirt.webp',
    variantColor: payload.variantColor || 'Onyx Black',
    sizeCode: payload.sizeCode || 'M (40)',
    customerName: payload.customerName || 'VIP Client',
    customerEmail: payload.customerEmail || '',
    customerPhone: payload.customerPhone || '',
    notes: payload.notes || '',
    status: 'Pending Atelier Review',
    createdAt: new Date().toISOString()
  };

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/restock-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Save to localStorage as backup
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_RESTOCK_KEY) || '[]');
          const updated = [json.data, ...existing.filter(r => r.id !== json.data.id)];
          localStorage.setItem(LOCAL_RESTOCK_KEY, JSON.stringify(updated));
        } catch {}
        return json.data;
      }
    }
  } catch (apiErr) {
    console.warn('API createRestockRequest notice:', apiErr);
  }

  // 2. LocalStorage Fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RESTOCK_KEY) || '[]');
    const updated = [normalizedReq, ...existing];
    localStorage.setItem(LOCAL_RESTOCK_KEY, JSON.stringify(updated));
    return normalizedReq;
  } catch {
    return normalizedReq;
  }
}

/**
 * Fetch all restock requests for admin review
 */
export async function getRestockRequests() {
  const apiUrl = getApiUrl();

  // 1. Try Backend API
  try {
    const res = await fetch(`${apiUrl}/restock-requests`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Save to localStorage as backup
        try {
          localStorage.setItem(LOCAL_RESTOCK_KEY, JSON.stringify(json.data));
        } catch {}

        return {
          requests: json.data,
          stats: json.stats || {}
        };
      }
    }
  } catch (apiErr) {
    console.warn('API getRestockRequests notice:', apiErr);
  }

  // 2. LocalStorage Fallback
  const stored = JSON.parse(localStorage.getItem(LOCAL_RESTOCK_KEY) || '[]');
  return {
    requests: stored,
    stats: {}
  };
}

/**
 * Update request status (e.g. Restocked / Handled)
 */
export async function updateRestockRequestStatus(id, status) {
  const apiUrl = getApiUrl();

  // 1. LocalStorage update
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RESTOCK_KEY) || '[]');
    const updated = existing.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem(LOCAL_RESTOCK_KEY, JSON.stringify(updated));
  } catch {}

  // 2. Backend API
  try {
    const res = await fetch(`${apiUrl}/restock-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('API updateRestockRequestStatus notice:', err);
  }

  return { id, status };
}

/**
 * Delete a restock request
 */
export async function deleteRestockRequest(id) {
  const apiUrl = getApiUrl();

  // 1. LocalStorage update
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RESTOCK_KEY) || '[]');
    const updated = existing.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_RESTOCK_KEY, JSON.stringify(updated));
  } catch {}

  // 2. Backend API
  try {
    await fetch(`${apiUrl}/restock-requests/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deleteRestockRequest notice:', err);
  }

  return true;
}

// =========================================================================
// BESPOKE ATELIER CUSTOM T-SHIRT STUDIO SERVICE
// =========================================================================
const LOCAL_BESPOKE_KEY = 'elvany_bespoke_designs_v1';

/**
 * Register / Save a custom bespoke T-shirt design
 */
export async function saveBespokeDesign(designData) {
  const apiUrl = getApiUrl();
  const timestamp = new Date().toISOString();
  const fallbackCode = `BL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const localPayload = {
    id: `bl-${Date.now()}`,
    designCode: designData.designCode || fallbackCode,
    fabricName: designData.fabricName || '240 GSM Luxury Supima Cotton',
    fabricGsm: designData.fabricGsm || '240 GSM',
    cutName: designData.cutName || 'Classic Regular Fit',
    cutId: designData.cutId || 'tailored',
    colorName: designData.colorName || 'Pure Black',
    colorHex: designData.colorHex || '#0a0a0b',
    sleeveColorName: designData.sleeveColorName || null,
    sleeveColorHex: designData.sleeveColorHex || null,
    size: designData.size || 'L',
    quantity: Number(designData.quantity) || 1,
    unitPrice: Number(designData.unitPrice) || 14500,
    totalPrice: Number(designData.totalPrice) || 14500,
    artworks: designData.artworks || {},
    notes: designData.notes || '',
    tailorTuning: designData.tailorTuning !== false,
    customerName: designData.customerName || 'VIP Guest',
    customerEmail: designData.customerEmail || '',
    customerPhone: designData.customerPhone || '',
    previewThumbnail: designData.previewThumbnail || null,
    blueprintImage: designData.blueprintImage || designData.previewThumbnail || null,
    views: designData.views || (designData.previewThumbnail ? { front: designData.previewThumbnail, back: null, left: null, right: null, collage: designData.previewThumbnail } : null),
    status: 'Saved / In Design',
    createdAt: timestamp
  };

  // 1. Save to LocalStorage immediately
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_BESPOKE_KEY) || '[]');
    const updated = [localPayload, ...existing.filter(d => d.designCode !== localPayload.designCode)];
    localStorage.setItem(LOCAL_BESPOKE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage saveBespokeDesign notice:', err);
  }

  // 2. Persist to Backend API / Supabase
  try {
    const res = await fetch(`${apiUrl}/bespoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localPayload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        // Update local with database ID
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_BESPOKE_KEY) || '[]');
          const merged = existing.map(d => d.designCode === localPayload.designCode ? json.data : d);
          localStorage.setItem(LOCAL_BESPOKE_KEY, JSON.stringify(merged));
        } catch {}
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend API saveBespokeDesign notice (local fallback active):', err);
  }

  return localPayload;
}

// Bespoke designs registry handled through backend API and client store
export async function getBespokeDesigns() {
  const apiUrl = getApiUrl();
  const map = new Map();

  // 1. Seed from local storage
  try {
    const localList = JSON.parse(localStorage.getItem(LOCAL_BESPOKE_KEY) || '[]');
    localList.forEach(d => {
      const code = d.designCode || d.design_code || d.id;
      if (code) map.set(code, d);
    });
  } catch {}

  // 2. Fetch from Backend API (reads database, orders, and local file storage)
  try {
    const res = await fetch(`${apiUrl}/bespoke`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        json.data.forEach(d => {
          const code = d.designCode || d.design_code || d.id;
          if (code) map.set(code, { ...d, designCode: code });
        });
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 4. Also scan orders for any custom bespoke items placed by real customers
  try {
    const ordersList = await getOrders();
    if (Array.isArray(ordersList)) {
      ordersList.forEach(order => {
        (order.items || []).forEach(item => {
          const isBespoke = item.isBespokeCustom || Boolean(item.designCode) || (item.title || item.name || '').toLowerCase().includes('custom') || (item.title || item.name || '').toLowerCase().includes('bespoke');
          if (isBespoke) {
            const code = item.designCode || (item.title || item.name || '').match(/BL-[A-Z0-9]{4,6}/)?.[0] || `BL-${(order.orderId || '').slice(-4)}`;
            if (!map.has(code)) {
              map.set(code, {
                id: `order-bespoke-${order.orderId}-${item.id || code}`,
                designCode: code,
                orderId: order.orderId,
                fabricName: item.fabric || 'Heavyweight Cotton (240 GSM)',
                fabricGsm: '240 GSM',
                cutName: item.cut || 'Classic Regular Fit',
                cutId: 'tailored',
                colorName: item.color || 'Pure Black',
                colorHex: item.colorHex || '#0a0a0b',
                size: item.size || item.selectedSize || 'L',
                quantity: Number(item.quantity || item.qty) || 1,
                unitPrice: Number(item.priceLKR || 18500),
                totalPrice: Number((item.priceLKR || 18500) * (item.quantity || 1)),
                artworks: item.artworks || {},
                notes: item.customNotes || order.deliveryNotes || '',
                tailorTuning: true,
                customerName: order.customerName || 'VIP Guest',
                customerEmail: order.customerEmail || '',
                customerPhone: order.customerPhone || '',
                status: order.status || 'Ordered / In Production',
                previewThumbnail: item.image || item.product_image_url || null,
                createdAt: order.createdAt || new Date().toISOString(),
                updatedAt: order.createdAt || new Date().toISOString()
              });
            }
          }
        });
      });
    }
  } catch (scanErr) {
    console.warn('Orders bespoke scan in frontend notice:', scanErr);
  }

  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get single bespoke design by ID or code
 */
export async function getBespokeDesignById(idOrCode) {
  const apiUrl = getApiUrl();

  try {
    const res = await fetch(`${apiUrl}/bespoke/${idOrCode}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn('Backend API getBespokeDesignById notice:', err);
  }

  try {
    const all = await getBespokeDesigns();
    return all.find(d => d.id === idOrCode || d.designCode === idOrCode) || null;
  } catch {
    return null;
  }
}

/**
 * Update bespoke design status or properties
 */
export async function updateBespokeDesign(idOrCode, updateFields = {}) {
  const apiUrl = getApiUrl();

  // 1. Update local storage
  try {
    const localList = JSON.parse(localStorage.getItem(LOCAL_BESPOKE_KEY) || '[]');
    const updated = localList.map(d => (d.id === idOrCode || d.designCode === idOrCode) ? { ...d, ...updateFields, updatedAt: new Date().toISOString() } : d);
    localStorage.setItem(LOCAL_BESPOKE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local bespoke update notice:', e);
  }

  // 2. Update Backend API
  try {
    const res = await fetch(`${apiUrl}/bespoke/${idOrCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateFields)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn('Backend API updateBespokeDesign notice:', err);
  }

  return { id: idOrCode, ...updateFields };
}






