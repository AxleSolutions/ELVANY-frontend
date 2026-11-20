/**
 * ELVANY — Haute Email Template Engine
 * Generates fully responsive, cross-client compatible HTML email designs
 * with dark luxury aesthetic, KaTeX/font fallbacks, and bulletproof tables.
 */

const SITE_URL = 'https://elvany.vercel.app';
const LOGO_URL = 'https://elvany.vercel.app/logo/Main-4.png';

/**
 * Base Email Wrapper styling
 */
function wrapEmailHtml(contentHtml, preheaderText = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ELVANY</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #08090a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .fluid-col { display: block !important; width: 100% !important; }
      .mobile-padding { padding: 24px 18px !important; }
      .mobile-headline { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #08090a; color: #f4ede4;">
  <!-- Preheader preview text (invisible in body, shows in inbox snippet) -->
  <div style="display: none; font-size: 1px; color: #08090a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheaderText || 'ELVANY — Haute Heavyweight T-Shirts & Noble Cotton Essentials.'}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #08090a;">
    <tr>
      <td align="center" style="padding: 30px 10px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; background-color: #0f1013; border: 1px solid #23252a; border-radius: 4px; overflow: hidden;">
          
          <!-- Atelier Header -->
          <tr>
            <td align="center" style="padding: 34px 20px 24px 20px; background-color: #0b0c0e; border-bottom: 1px solid #1a1b1f;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${LOGO_URL}" alt="ELVANY" width="70" style="display: block; margin: 0 auto; filter: brightness(1.2);" />
                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 20px; letter-spacing: 0.28em; color: #ffffff; margin-top: 10px; font-weight: 400;">
                      ELVANY
                    </div>
                    <div style="font-size: 8px; letter-spacing: 0.28em; color: #c5a059; text-transform: uppercase; margin-top: 4px;">
                      HAUTE ATELIER • SRI LANKA
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Dynamic Content -->
          ${contentHtml}

          <!-- Luxury Footer -->
          <tr>
            <td align="center" style="padding: 30px 24px; background-color: #07080a; border-top: 1px solid #191a1e;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="color: #c5a059; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; padding-bottom: 12px;">
                    CRAFTED WITH NOBLE INTEGRITY
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #7d828c; font-size: 11px; line-height: 1.6; padding-bottom: 16px;">
                    You are receiving this communication as a valued private client or subscriber of ELVANY.<br/>
                    Flagship Atelier: Sri Lanka • Worldwide Courier Dispatch
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}" style="color: #ffffff; font-size: 11px; text-decoration: none; margin: 0 10px; letter-spacing: 0.08em;">VISIT STORE</a>
                    <span style="color: #33363f;">•</span>
                    <a href="${SITE_URL}/collection" style="color: #ffffff; font-size: 11px; text-decoration: none; margin: 0 10px; letter-spacing: 0.08em;">COLLECTIONS</a>
                    <span style="color: #33363f;">•</span>
                    <a href="${SITE_URL}/account" style="color: #ffffff; font-size: 11px; text-decoration: none; margin: 0 10px; letter-spacing: 0.08em;">CLIENT PROFILE</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #4b4e57; font-size: 9px; padding-top: 20px; letter-spacing: 0.05em;">
                    © ${new Date().getFullYear()} ELVANY. All Rights Reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Promotional Privilege & Discount Code Template
 */
export function generatePrivilegeOfferTemplate(options = {}) {
  const {
    headline = 'Private Atelier Privilege',
    subheadline = 'EXCLUSIVE INVITATION FOR DISCERNING CLIENTS',
    message = 'We are pleased to extend an exclusive atelier privilege on our permanent Noble Cotton garment capsule. Each piece is meticulously knitted with 100% combed heavyweight cotton for enduring form and architectural elegance.',
    discountCode = 'PRIVILEGE20',
    discountValue = '20% OFF',
    featuredProduct = null,
    ctaText = 'CLAIM PRIVILEGE AT CHECKOUT',
    ctaUrl = `${SITE_URL}/collection`
  } = options;

  const content = `
    <!-- Hero Headline & Badge -->
    <tr>
      <td class="mobile-padding" style="padding: 38px 36px 20px 36px; text-align: center;">
        <span style="display: inline-block; background-color: rgba(197, 160, 89, 0.12); border: 1px solid #c5a059; color: #e6be75; font-size: 10px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; padding: 5px 14px; border-radius: 2px; margin-bottom: 18px;">
          ${subheadline}
        </span>
        <h1 class="mobile-headline" style="font-family: 'Times New Roman', Times, serif; font-size: 30px; font-weight: 400; color: #ffffff; line-height: 1.25; margin: 0 0 14px 0; letter-spacing: 0.02em;">
          ${headline}
        </h1>
        <p style="font-size: 14px; line-height: 1.7; color: #9da3af; margin: 0 auto; max-width: 480px; font-weight: 300;">
          ${message}
        </p>
      </td>
    </tr>

    <!-- Discount Voucher Card -->
    ${discountCode ? `
    <tr>
      <td style="padding: 10px 36px 26px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #15171b; border: 1px dashed #c5a059; border-radius: 3px; padding: 22px;">
          <tr>
            <td align="center">
              <div style="font-size: 11px; letter-spacing: 0.18em; color: #c5a059; text-transform: uppercase; margin-bottom: 6px;">
                YOUR EXCLUSIVE PRIVILEGE CODE
              </div>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.16em; background-color: #0b0c0e; border: 1px solid #2d3038; display: inline-block; padding: 8px 24px; border-radius: 2px;">
                ${discountCode}
              </div>
              <div style="font-size: 13px; color: #e6be75; font-weight: 600; margin-top: 8px;">
                ${discountValue} ON YOUR ENTIRE ATELIER ACQUISITION
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <!-- Featured Product Preview (if provided) -->
    ${featuredProduct ? `
    <tr>
      <td style="padding: 10px 36px 24px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121316; border: 1px solid rgba(255,255,255,0.12); border-radius: 2px;">
          <tr>
            <td width="130" style="vertical-align: middle; padding: 0;">
              <img src="${featuredProduct.image || 'https://elvany.vercel.app/images/hero_tshirt.webp'}" alt="${featuredProduct.name || featuredProduct.title}" width="130" style="display: block; width: 130px; height: 140px; object-fit: cover;" />
            </td>
            <td style="padding: 18px 20px; vertical-align: middle;">
              <div style="font-size: 9px; letter-spacing: 0.18em; color: #c5a059; text-transform: uppercase;">
                FEATURED PIECE
              </div>
              <div style="font-family: 'Times New Roman', Times, serif; font-size: 18px; color: #ffffff; margin-top: 4px;">
                ${featuredProduct.name || featuredProduct.title}
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #c5a059; margin-top: 6px;">
                LKR ${(featuredProduct.priceLKR || featuredProduct.price || 1600).toLocaleString()}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <!-- Call to Action Button -->
    <tr>
      <td align="center" style="padding: 10px 36px 38px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color: #c5a059; border-radius: 2px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #c5a059; color: #0b0c0e; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-decoration: none; padding: 15px 36px; border-radius: 2px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                ${ctaText} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailHtml(content, `${headline} — ${discountCode ? `${discountValue} with code ${discountCode}` : 'Exclusive privilege from ELVANY'}`);
}

/**
 * 2. New Collection / Capsule Launch Template
 */
export function generateCollectionLaunchTemplate(options = {}) {
  const {
    headline = 'Introducing The Noble Cotton Editions',
    subheadline = 'NEW ATELIER RELEASE',
    message = 'Engineered from raw, hand-selected combed long-staple cotton, our newly arrived capsule embraces quiet luxury through structural density and relaxed tailored drape. Available in limited batch units for priority acquisition.',
    heroImageUrl = 'https://elvany.vercel.app/images/hero_tshirt.webp',
    ctaText = 'DISCOVER THE CAPSULE',
    ctaUrl = `${SITE_URL}/collection`
  } = options;

  const content = `
    <!-- Hero Image Banner -->
    ${heroImageUrl ? `
    <tr>
      <td style="padding: 0;">
        <img src="${heroImageUrl}" alt="Collection" width="600" style="display: block; width: 100%; max-height: 320px; object-fit: cover;" />
      </td>
    </tr>` : ''}

    <!-- Body -->
    <tr>
      <td class="mobile-padding" style="padding: 36px 36px 20px 36px; text-align: center;">
        <span style="display: inline-block; color: #c5a059; font-size: 10px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 12px;">
          ${subheadline}
        </span>
        <h1 class="mobile-headline" style="font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: 400; color: #ffffff; line-height: 1.25; margin: 0 0 16px 0;">
          ${headline}
        </h1>
        <p style="font-size: 14px; line-height: 1.72; color: #9da3af; margin: 0 auto; max-width: 490px; font-weight: 300;">
          ${message}
        </p>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td align="center" style="padding: 16px 36px 38px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color: #c5a059; border-radius: 2px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #c5a059; color: #0b0c0e; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-decoration: none; padding: 15px 36px; border-radius: 2px; text-transform: uppercase;">
                ${ctaText} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailHtml(content, `${headline} — Available now at ELVANY.`);
}

/**
 * 3. Client Restock / Re-Issue Notification Template
 */
export function generateRestockNotificationTemplate(options = {}) {
  const {
    clientName = 'VIP Client',
    productTitle = 'Haute Atelier T-Shirt',
    variantColor = 'Onyx Black',
    sizeCode = 'M',
    productImage = 'https://elvany.vercel.app/images/hero_tshirt.webp',
    ctaText = 'ACQUIRE RESERVED PIECE',
    ctaUrl = `${SITE_URL}/collection`
  } = options;

  const content = `
    <tr>
      <td class="mobile-padding" style="padding: 36px 36px 16px 36px; text-align: center;">
        <span style="display: inline-block; background-color: rgba(74, 222, 128, 0.12); border: 1px solid #4ade80; color: #4ade80; font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; padding: 5px 14px; border-radius: 2px; margin-bottom: 16px;">
          GARMENT RE-ISSUE NOTIFICATION
        </span>
        <h1 class="mobile-headline" style="font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: 400; color: #ffffff; line-height: 1.25; margin: 0 0 12px 0;">
          Your Requested Piece is Ready
        </h1>
        <p style="font-size: 14px; line-height: 1.68; color: #9da3af; margin: 0 auto; max-width: 480px; font-weight: 300;">
          Dear ${clientName},<br/><br/>
          Regarding your inquiry with our concierge team: fresh atelier stock for <strong style="color: #ffffff;">${productTitle}</strong> (${variantColor}, Size ${sizeCode}) has been prepared for priority acquisition.
        </p>
      </td>
    </tr>

    <!-- Piece Card -->
    <tr>
      <td style="padding: 10px 36px 26px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121316; border: 1px solid rgba(255,255,255,0.15); border-radius: 2px;">
          <tr>
            <td width="140" style="vertical-align: middle;">
              <img src="${productImage}" alt="${productTitle}" width="140" style="display: block; width: 140px; height: 150px; object-fit: cover;" />
            </td>
            <td style="padding: 18px 20px; vertical-align: middle;">
              <div style="font-size: 9px; letter-spacing: 0.18em; color: #c5a059; text-transform: uppercase;">
                RESERVED ATELIER SPECIFICATION
              </div>
              <div style="font-family: 'Times New Roman', Times, serif; font-size: 18px; color: #ffffff; margin-top: 4px;">
                ${productTitle}
              </div>
              <div style="font-size: 13px; color: #9da3af; margin-top: 6px;">
                Color: <span style="color: #fff;">${variantColor}</span> • Size: <span style="color: #c5a059; font-weight: 600;">${sizeCode}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td align="center" style="padding: 10px 36px 38px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color: #c5a059; border-radius: 2px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #c5a059; color: #0b0c0e; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-decoration: none; padding: 15px 36px; border-radius: 2px; text-transform: uppercase;">
                ${ctaText} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailHtml(content, `Your restock inquiry for ${productTitle} has been prepared.`);
}

/**
 * 4. General Atelier Announcement Template
 */
export function generateAnnouncementTemplate(options = {}) {
  const {
    headline = 'ELVANY Bulletin',
    subheadline = 'ATELIER DISPATCH',
    message = 'We welcome you to explore our refined curation of luxury everyday heavyweight cotton apparel.',
    ctaText = 'VISIT ELVANY',
    ctaUrl = SITE_URL
  } = options;

  const content = `
    <tr>
      <td class="mobile-padding" style="padding: 38px 36px 24px 36px; text-align: center;">
        <span style="display: inline-block; color: #c5a059; font-size: 10px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 14px;">
          ${subheadline}
        </span>
        <h1 class="mobile-headline" style="font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: 400; color: #ffffff; line-height: 1.25; margin: 0 0 16px 0;">
          ${headline}
        </h1>
        <div style="font-size: 14px; line-height: 1.72; color: #9da3af; margin: 0 auto; max-width: 490px; font-weight: 300; text-align: left; white-space: pre-line;">
          ${message}
        </div>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 16px 36px 38px 36px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color: #c5a059; border-radius: 2px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #c5a059; color: #0b0c0e; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-decoration: none; padding: 15px 36px; border-radius: 2px; text-transform: uppercase;">
                ${ctaText} →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return wrapEmailHtml(content, headline);
}
