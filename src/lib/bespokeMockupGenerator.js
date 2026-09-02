/**
 * Maison ELVANY — Bespoke Atelier Garment Mockup Generator
 * Produces ultra high-resolution, 4-angle (Front, Back, Left Sleeve, Right Sleeve) 
 * rendered blueprints of customized T-shirts.
 */

// SVG path definitions for the Atelier T-shirt silhouette across all 4 perspectives
const GARMENT_PATHS = {
  front: {
    body: 'M148 70 L112 78 L44 152 L72 188 L102 160 L98 280 Q170 290 242 280 L238 160 L268 188 L296 152 L228 78 L192 70 Q170 94 148 70 Z',
    leftSleeve: 'M112 78 L44 152 L72 188 L102 160 Q96 114 112 78 Z',
    rightSleeve: 'M228 78 L296 152 L268 188 L238 160 Q244 114 228 78 Z',
    collar: 'M148 70 Q170 94 192 70 L186 70 Q170 86 154 70 Z',
    seams: [
      'M53 145 L81 181',
      'M287 145 L259 181',
      'M101 268 Q170 278 239 268'
    ]
  },
  back: {
    body: 'M148 70 L112 78 L44 152 L72 188 L102 160 L98 280 Q170 290 242 280 L238 160 L268 188 L296 152 L228 78 L192 70 Q170 82 148 70 Z',
    leftSleeve: 'M112 78 L44 152 L72 188 L102 160 Q96 114 112 78 Z',
    rightSleeve: 'M228 78 L296 152 L268 188 L238 160 Q244 114 228 78 Z',
    collar: 'M148 70 Q170 82 192 70 L186 70 Q170 76 154 70 Z',
    seams: [
      'M53 145 L81 181',
      'M287 145 L259 181',
      'M101 268 Q170 278 239 268'
    ]
  },
  left: {
    body: 'M150 72 Q134 84 133 116 L131 280 Q170 289 209 280 L207 116 Q206 84 190 72 Q170 64 150 72 Z',
    sleeve: 'M155 86 Q170 79 186 86 Q195 96 194 122 L192 172 Q170 181 149 172 L147 122 Q146 96 155 86 Z',
    collar: null,
    seams: [
      'M148 158 Q170 167 193 158',
      'M132 268 Q170 277 208 268'
    ]
  },
  right: {
    body: 'M190 72 Q206 84 207 116 L209 280 Q170 289 131 280 L133 116 Q134 84 150 72 Q170 64 190 72 Z',
    sleeve: 'M185 86 Q170 79 154 86 Q145 96 146 122 L148 172 Q170 181 191 172 L193 122 Q194 96 185 86 Z',
    collar: null,
    seams: [
      'M192 158 Q170 167 147 158',
      'M208 268 Q170 277 132 268'
    ]
  }
};

const ZONES_BY_VIEW = {
  front: ['front', 'left_chest', 'right_chest'],
  back: ['back', 'nape'],
  left: ['left_sleeve'],
  right: ['right_sleeve']
};

/**
 * Generate a standalone SVG markup string of the T-shirt view with artworks
 */
export function generateGarmentSvgString({
  view = 'front',
  colorHex = '#0a0a0b',
  cutId = 'tailored',
  sleeveColorHex = null,
  artworks = {},
  width = 400,
  height = 440,
  showBackdrop = true
}) {
  const paths = GARMENT_PATHS[view] || GARMENT_PATHS.front;
  const isDark = ['#0a0a0b', '#0d1b3e', '#3d2319', '#28292d', '#2c3d2b', '#5a0d1e'].includes(colorHex.toLowerCase());
  const rimStroke = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.28)';
  const seamStroke = isDark ? 'rgba(255, 255, 255, 0.32)' : 'rgba(0, 0, 0, 0.32)';
  const effectiveSleeveColor = (cutId === 'raglan' && sleeveColorHex) ? sleeveColorHex : colorHex;

  // Render artwork <image> tags
  const activeZones = ZONES_BY_VIEW[view] || [];
  const artworkImagesSvg = activeZones
    .map(zoneId => {
      const art = artworks[zoneId];
      const artUrl = art?.dataUrl || art?.imageUrl || (typeof art === 'string' ? art : null);
      if (!artUrl) return '';

      const cx = ((art.x !== undefined ? art.x : 50) / 100) * 340;
      const cy = ((art.y !== undefined ? art.y : 45) / 100) * 380;
      const artWidth = ((art.scale !== undefined ? art.scale : 35) / 100) * 340;
      const artHeight = artWidth;

      const rot = art.rotation || 0;

      return `
        <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rot}) translate(${(-artWidth / 2).toFixed(1)}, ${(-artHeight / 2).toFixed(1)})">
          <image 
            href="${artUrl}" 
            width="${artWidth.toFixed(1)}" 
            height="${artHeight.toFixed(1)}" 
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      `;
    })
    .join('');

  const seamElements = (paths.seams || [])
    .map(s => `<path d="${s}" stroke="${seamStroke}" stroke-width="1.4" fill="none" />`)
    .join('');

  let garmentSilhouette = '';
  if (view === 'left' || view === 'right') {
    garmentSilhouette = `
      <g filter="url(#garmentShadow)">
        <path d="${paths.body}" fill="${colorHex}" stroke="${rimStroke}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="${paths.sleeve}" fill="${effectiveSleeveColor}" stroke="${rimStroke}" stroke-width="1"/>
        ${seamElements}
      </g>
    `;
  } else {
    garmentSilhouette = `
      <g filter="url(#garmentShadow)">
        <path d="${paths.body}" fill="${colorHex}" stroke="${rimStroke}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="${paths.leftSleeve}" fill="${effectiveSleeveColor}" stroke="${rimStroke}" stroke-width="1"/>
        <path d="${paths.rightSleeve}" fill="${effectiveSleeveColor}" stroke="${rimStroke}" stroke-width="1"/>
        <path d="${paths.collar}" fill="${colorHex}" stroke="${rimStroke}" stroke-width="1"/>
        ${seamElements}
      </g>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 380" width="${width}" height="${height}">
      <defs>
        <radialGradient id="stageSpotlight" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#2a2e3a" stop-opacity="0.6"/>
          <stop offset="60%" stop-color="#141720" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0a0c10" stop-opacity="1"/>
        </radialGradient>
        <filter id="garmentShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.75" />
          <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="#ffffff" flood-opacity="0.18" />
        </filter>
      </defs>
      ${showBackdrop ? '<rect width="100%" height="100%" fill="url(#stageSpotlight)" rx="6"/>' : ''}
      ${garmentSilhouette}
      ${artworkImagesSvg}
    </svg>
  `;
}

/**
 * Convert SVG string to a high-res PNG Data URL via HTML5 Canvas
 */
export async function convertSvgToPngDataUrl(svgString, targetWidth = 600, targetHeight = 600) {
  return new Promise((resolve) => {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL('image/png', 0.98);
          URL.revokeObjectURL(blobUrl);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };

      img.src = blobUrl;
    } catch (err) {
      console.warn('convertSvgToPngDataUrl error:', err);
      resolve(null);
    }
  });
}

/**
 * Generate a complete Atelier Mockup 4-Axis Blueprint (Front, Back, Left Sleeve, Right Sleeve)
 * rendered at ultra crisp high resolution (1600x560).
 */
export async function generateBespokeMockupCollage({
  artworks = {},
  colorHex = '#0a0a0b',
  colorName = 'Pure Black',
  cutId = 'tailored',
  cutName = 'Classic Regular Fit',
  fabricName = 'Heavyweight Cotton',
  sleeveColorHex = null,
  size = 'L'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const singleSvg = generateGarmentSvgString({
      view: 'front',
      colorHex,
      cutId,
      sleeveColorHex,
      artworks,
      showBackdrop: true
    });
    return await convertSvgToPngDataUrl(singleSvg, 800, 800);
  }

  // 1. Draw Luxury Studio Stage Backdrop
  const bgGradient = ctx.createRadialGradient(800, 280, 80, 800, 280, 950);
  bgGradient.addColorStop(0, '#1c1f2c');
  bgGradient.addColorStop(0.55, '#0f1118');
  bgGradient.addColorStop(1, '#06070a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1600, 560);

  // Subtle luxury gold border
  ctx.strokeStyle = 'rgba(197, 160, 89, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 1576, 536);

  // Header Title
  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 13px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('MAISON ELVANY • BESPOKE 4-AXIS ATELIER BLUEPRINT', 35, 42);

  // Configuration Info Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '11px sans-serif';
  const infoText = `${fabricName} • ${cutName} • ${colorName} • Size ${size}`;
  ctx.fillText(infoText, 1600 - ctx.measureText(infoText).width - 35, 42);

  // 2. Render All 4 View SVGs (Front, Back, Left Sleeve, Right Sleeve)
  const [frontSvg, backSvg, leftSvg, rightSvg] = [
    generateGarmentSvgString({ view: 'front', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: false }),
    generateGarmentSvgString({ view: 'back', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: false }),
    generateGarmentSvgString({ view: 'left', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: false }),
    generateGarmentSvgString({ view: 'right', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: false })
  ];

  const [frontImgData, backImgData, leftImgData, rightImgData] = await Promise.all([
    convertSvgToPngDataUrl(frontSvg, 420, 460),
    convertSvgToPngDataUrl(backSvg, 420, 460),
    convertSvgToPngDataUrl(leftSvg, 420, 460),
    convertSvgToPngDataUrl(rightSvg, 420, 460)
  ]);

  const loadImg = (src) => new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const [frontImage, backImage, leftImage, rightImage] = await Promise.all([
    loadImg(frontImgData),
    loadImg(backImgData),
    loadImg(leftImgData),
    loadImg(rightImgData)
  ]);

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const panels = [
    { img: frontImage, title: '1. FRONT VIEW', x: 30, tag: (artworks.front || artworks.left_chest || artworks.right_chest) ? 'PRINT ATTACHED' : 'CLEAN' },
    { img: backImage, title: '2. BACK VIEW', x: 420, tag: (artworks.back || artworks.nape) ? 'PRINT ATTACHED' : 'CLEAN' },
    { img: leftImage, title: '3. LEFT SLEEVE', x: 810, tag: artworks.left_sleeve ? 'PRINT ATTACHED' : 'CLEAN' },
    { img: rightImage, title: '4. RIGHT SLEEVE', x: 1200, tag: artworks.right_sleeve ? 'PRINT ATTACHED' : 'CLEAN' }
  ];

  panels.forEach((p, idx) => {
    // Draw Panel Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(p.x, 65, 370, 465);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeRect(p.x, 65, 370, 465);

    // Draw Rendered Silhouette
    if (p.img) {
      ctx.drawImage(p.img, p.x + 10, 75, 350, 395);
    }

    // Panel View Title
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 11px sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(p.title, p.x + 20, 502);

    // Panel Print Badge
    ctx.fillStyle = p.tag === 'PRINT ATTACHED' ? '#10b981' : 'rgba(255, 255, 255, 0.35)';
    ctx.font = '9px sans-serif';
    const tagW = ctx.measureText(p.tag).width;
    ctx.fillText(p.tag, p.x + 350 - tagW, 502);

    // Vertical Divider
    if (idx < 3) {
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.15)';
      ctx.beginPath();
      ctx.moveTo(p.x + 380, 80);
      ctx.lineTo(p.x + 380, 510);
      ctx.stroke();
    }
  });

  return canvas.toDataURL('image/png', 0.98);
}

/**
 * Generate all 4 individual perspective renders (Front, Back, Left, Right)
 * and the complete 4-panel collage blueprint.
 */
export async function generateBespokeAllAngles({
  artworks = {},
  colorHex = '#0a0a0b',
  colorName = 'Pure Black',
  cutId = 'tailored',
  cutName = 'Classic Regular Fit',
  fabricName = 'Heavyweight Cotton',
  sleeveColorHex = null,
  size = 'L'
}) {
  const [frontSvg, backSvg, leftSvg, rightSvg] = [
    generateGarmentSvgString({ view: 'front', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: true, width: 500, height: 560 }),
    generateGarmentSvgString({ view: 'back', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: true, width: 500, height: 560 }),
    generateGarmentSvgString({ view: 'left', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: true, width: 500, height: 560 }),
    generateGarmentSvgString({ view: 'right', colorHex, cutId, sleeveColorHex, artworks, showBackdrop: true, width: 500, height: 560 })
  ];

  const [front, back, left, right, collage] = await Promise.all([
    convertSvgToPngDataUrl(frontSvg, 600, 680),
    convertSvgToPngDataUrl(backSvg, 600, 680),
    convertSvgToPngDataUrl(leftSvg, 600, 680),
    convertSvgToPngDataUrl(rightSvg, 600, 680),
    generateBespokeMockupCollage({ artworks, colorHex, colorName, cutId, cutName, fabricName, sleeveColorHex, size })
  ]);

  return {
    front: front || null,
    back: back || null,
    left: left || null,
    right: right || null,
    collage: collage || null
  };
}

/**
 * Universally downloads any image (Base64 data URL, Blob, or Remote Cloudinary URL)
 * directly to the user's computer/phone with the given filename.
 * 
 * @param {string} urlOrDataUrl - Image URL or Base64 string
 * @param {string} filename - Desired downloaded filename (e.g. 'bespoke_shirt_BL-89A.png')
 */
export async function downloadImageFile(urlOrDataUrl, filename = 'elvany_bespoke_tshirt.png') {
  if (!urlOrDataUrl) return;

  try {
    // If it's already a Base64 data URL or local object URL
    if (urlOrDataUrl.startsWith('data:') || urlOrDataUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = urlOrDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // If it's a remote URL (e.g. Cloudinary), fetch as blob to bypass cross-origin download restrictions
    const response = await fetch(urlOrDataUrl, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('downloadImageFile notice, using direct window trigger:', err);
    // Fallback
    const link = document.createElement('a');
    link.href = urlOrDataUrl;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


