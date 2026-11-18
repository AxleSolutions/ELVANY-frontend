/**
 * Maison ELVANY — Dynamic Category Management Service
 * Supports dynamic categories that can be created, customized, and updated over time.
 */

export const DEFAULT_CATEGORIES = [
  { id: 'heavyweight', key: 'heavyweight', label: 'Classic Crewneck' },
  { id: 'silk-cotton', key: 'silk-cotton', label: 'Essential Fit' },
  { id: 'oversized', key: 'oversized', label: 'Relaxed & Boxy' }
];

const STORAGE_KEY = 'elvany_custom_categories';

/**
 * Format label into slug key
 */
export function formatCategoryKey(label) {
  if (!label || typeof label !== 'string') return '';
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const slugifyCategory = formatCategoryKey;

/**
 * Format slug key into human readable title
 */
export function formatCategoryLabel(key) {
  if (!key || typeof key !== 'string') return '';
  const match = DEFAULT_CATEGORIES.find(c => c.key === key || c.id === key);
  if (match) return match.label;
  return key
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get custom categories created in Admin Panel
 */
export function getCustomCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(c => ({
      ...c,
      id: c.id || c.key,
      key: c.key || c.id
    }));
  } catch {
    return [];
  }
}

/**
 * Add a new custom category
 */
export function addCustomCategory(label) {
  if (!label || typeof label !== 'string') return null;
  const cleanLabel = label.trim();
  if (!cleanLabel) return null;

  const key = formatCategoryKey(cleanLabel);
  const existing = getCustomCategories();

  const found = existing.find(c => c.key === key || c.id === key || c.label.toLowerCase() === cleanLabel.toLowerCase())
    || DEFAULT_CATEGORIES.find(c => c.key === key || c.id === key || c.label.toLowerCase() === cleanLabel.toLowerCase());

  if (found) return { ...found, id: found.id || found.key, key: found.key || found.id };

  const newCat = { id: key, key, label: cleanLabel, isCustom: true };
  const updated = [...existing, newCat];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return newCat;
}

/**
 * Get all available categories (Defaults + Custom + Any present in Products catalog)
 */
export function getAllCategories(products = []) {
  const map = new Map();

  // 1. Add Default Categories
  DEFAULT_CATEGORIES.forEach(c => map.set(c.key, { ...c, id: c.key }));

  // 2. Add Custom Categories stored in localStorage
  const custom = getCustomCategories();
  custom.forEach(c => map.set(c.key, { ...c, id: c.key, isCustom: true }));

  // 3. Add any categories from products in database that might not be in default/custom
  if (Array.isArray(products)) {
    products.forEach(p => {
      const catKey = p.category;
      if (catKey && catKey !== 'all' && !map.has(catKey)) {
        map.set(catKey, {
          id: catKey,
          key: catKey,
          label: formatCategoryLabel(catKey)
        });
      }
    });
  }

  return Array.from(map.values());
}
