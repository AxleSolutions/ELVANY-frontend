/**
 * Maison ELVANY — Dynamic Category Management Service
 * Supports fully customizable categories that can be created, updated, and deleted
 * dynamically in the Admin Panel and reflected immediately across both Admin and Client storefront.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || 'https://web-app-backend-production-19db.up.railway.app/api').replace(/\/+$/, '');
const STORAGE_KEY = 'elvany_store_categories';
const LEGACY_STORAGE_KEY = 'elvany_custom_categories';
const DELETED_STORAGE_KEY = 'elvany_deleted_categories';

export const INITIAL_DEFAULT_CATEGORIES = [
  { id: 'classic-crewneck', key: 'classic-crewneck', label: 'Classic Crewneck', isCustom: false },
  { id: 'relaxed-fit', key: 'relaxed-fit', label: 'Relaxed Fit', isCustom: false },
  { id: 'oversized', key: 'oversized', label: 'Oversized', isCustom: false }
];

/**
 * Deleted categories blacklist retrieval & mutation
 */
export function getDeletedCategoryKeys() {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

export function markCategoryDeleted(idOrKey) {
  if (!idOrKey) return;
  const key = formatCategoryKey(idOrKey);
  const deletedSet = getDeletedCategoryKeys();
  deletedSet.add(idOrKey);
  if (key) deletedSet.add(key);
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(deletedSet)));
  } catch {}
}

export function unmarkCategoryDeleted(idOrKey) {
  if (!idOrKey) return;
  const key = formatCategoryKey(idOrKey);
  const deletedSet = getDeletedCategoryKeys();
  deletedSet.delete(idOrKey);
  if (key) deletedSet.delete(key);
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(deletedSet)));
  } catch {}
}

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
  const cleanKey = key.trim();
  const categories = getStoredCategories();
  const match = categories.find(c => c.key === cleanKey || c.id === cleanKey || c.key === formatCategoryKey(cleanKey));
  if (match) return match.label;
  
  // Clean readable title from slug
  return cleanKey
    .replace(/^elv-|^cat-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Retrieve current categories from local storage cache
 */
export function getStoredCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({
          id: c.id || c.key,
          key: c.key || c.id,
          label: c.label || formatCategoryLabel(c.key || c.id),
          isCustom: c.isCustom !== false
        }));
      }
    }

    // Check legacy key
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const merged = [...INITIAL_DEFAULT_CATEGORIES];
        parsedLegacy.forEach(c => {
          const k = c.key || c.id;
          if (!merged.some(m => m.key === k)) {
            merged.push({ id: k, key: k, label: c.label || formatCategoryLabel(k), isCustom: true });
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Categories cache read note:', err);
  }

  return [...INITIAL_DEFAULT_CATEGORIES];
}

/**
 * Persist categories to local storage cache & sync to backend and Supabase Cloud
 */
function persistCategories(categories) {
  if (!Array.isArray(categories)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    
    // 1. Asynchronously sync to backend API for multi-client & cloud persistence
    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    }).catch(err => console.warn('Categories cloud sync note:', err?.message || err));

    // 2. Direct Supabase Cloud persistence via promotions table
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('promotions')
        .upsert({
          code: 'STORE_CATEGORIES_CONFIG',
          title: 'Store Product Categories Configuration',
          description: JSON.stringify(categories),
          is_active: true,
          discount_type: 'category_config',
          discount_value: 0
        }, { onConflict: 'code' })
        .then(({ error }) => {
          if (error) console.warn('Supabase categories direct sync note:', error.message);
        })
        .catch(err => console.warn('Supabase categories direct sync error:', err));
    }
  } catch (err) {
    console.warn('Failed to persist categories:', err);
  }
}

/**
 * Fetch categories from backend API or Supabase and update local cache
 */
export async function fetchCategories() {
  // 1. Try Backend API
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch categories from server, checking cloud:', err?.message || err);
  }

  // 2. Try Supabase Cloud direct
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', 'STORE_CATEGORIES_CONFIG')
        .maybeSingle();

      if (!error && data?.description) {
        const parsed = JSON.parse(data.description);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (sbErr) {
      console.warn('Supabase categories query notice:', sbErr);
    }
  }

  return getStoredCategories();
}

/**
 * Add a new custom category (or return existing if duplicate)
 */
export function addCustomCategory(label) {
  if (!label || typeof label !== 'string') return null;
  const cleanLabel = label.trim();
  if (!cleanLabel) return null;

  const key = formatCategoryKey(cleanLabel);
  unmarkCategoryDeleted(key);
  unmarkCategoryDeleted(cleanLabel);
  const current = getStoredCategories();

  const existing = current.find(
    c => c.key === key || c.id === key || c.label.toLowerCase() === cleanLabel.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  const newCat = {
    id: key,
    key,
    label: cleanLabel,
    isCustom: true
  };

  const updated = [...current, newCat];
  persistCategories(updated);
  return newCat;
}

/**
 * Update an existing category's label or properties
 */
export function updateCustomCategory(idOrKey, newLabel) {
  if (!idOrKey || !newLabel || typeof newLabel !== 'string') return null;
  const cleanLabel = newLabel.trim();
  if (!cleanLabel) return null;

  const current = getStoredCategories();
  const index = current.findIndex(c => c.id === idOrKey || c.key === idOrKey);
  if (index === -1) return null;

  const updatedCat = {
    ...current[index],
    label: cleanLabel
  };

  current[index] = updatedCat;
  persistCategories(current);
  return updatedCat;
}

/**
 * Delete a category by id or key
 */
export function deleteCustomCategory(idOrKey) {
  if (!idOrKey) return false;
  markCategoryDeleted(idOrKey);
  const current = getStoredCategories();
  const filtered = current.filter(c => c.id !== idOrKey && c.key !== idOrKey);
  persistCategories(filtered);

  // Send delete call to backend
  try {
    fetch(`${API_BASE}/categories/${idOrKey}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  return filtered;
}

/**
 * Reassign any products linked to oldCatId to targetCatId
 */
export function reassignProductsCategory(products = [], oldCatId, targetCatId = 'classic-crewneck') {
  if (!Array.isArray(products) || !oldCatId) return products;
  const oldKey = formatCategoryKey(oldCatId);
  const updated = products.map(p => {
    const pCat = p.category || '';
    const pKey = formatCategoryKey(pCat);
    if (pCat === oldCatId || pKey === oldKey || pCat === oldKey) {
      return { ...p, category: targetCatId };
    }
    return p;
  });
  try {
    localStorage.setItem('elvany_catalog_cache', JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * Get all available categories:
 * Merges stored categories with any category found on live products, respecting deleted category blacklist.
 * When products are available, mock default categories with 0 products are automatically filtered out.
 */
export function getAllCategories(products = []) {
  const map = new Map();
  const deletedKeys = getDeletedCategoryKeys();

  // Find all category keys actually present on products
  const productCategoryKeys = new Set();
  const productCategoryLabels = new Map();

  if (Array.isArray(products) && products.length > 0) {
    products.forEach(p => {
      const rawCat = p.category;
      if (rawCat && rawCat !== 'all') {
        const catKey = formatCategoryKey(rawCat);
        if (
          catKey && 
          !deletedKeys.has(catKey) && 
          !deletedKeys.has(rawCat)
        ) {
          productCategoryKeys.add(catKey);
          productCategoryKeys.add(rawCat);
          if (!productCategoryLabels.has(catKey)) {
            productCategoryLabels.set(catKey, formatCategoryLabel(rawCat));
          }
        }
      }
    });
  }

  // 1. Load Stored Categories (User configured / custom)
  const stored = getStoredCategories();
  stored.forEach(c => {
    const k = c.key || c.id;
    if (!k || deletedKeys.has(k) || deletedKeys.has(c.id) || deletedKeys.has(formatCategoryKey(c.label || ''))) {
      return;
    }

    // If products exist, drop mock default categories if no active products belong to them
    const isMock = INITIAL_DEFAULT_CATEGORIES.some(m => m.key === k || m.id === k);
    if (products.length > 0 && isMock && !productCategoryKeys.has(k) && !productCategoryKeys.has(c.id)) {
      return;
    }

    map.set(k, {
      id: k,
      key: k,
      label: c.label || formatCategoryLabel(k),
      isCustom: c.isCustom !== false
    });
  });

  // 2. Discover any categories from live product catalog (excluding deleted)
  productCategoryLabels.forEach((readable, catKey) => {
    if (!map.has(catKey)) {
      map.set(catKey, {
        id: catKey,
        key: catKey,
        label: readable,
        isCustom: true
      });
    }
  });

  // Ensure at least one category remains if all were deleted or empty catalog
  if (map.size === 0) {
    if (products.length === 0) {
      INITIAL_DEFAULT_CATEGORIES.forEach(c => map.set(c.key, c));
    }
  }

  return Array.from(map.values());
}
