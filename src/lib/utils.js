export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const year = d.getFullYear();
  return `${year}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const humanDate = (iso) => iso ? new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const expiryInfo = (date) => {
  if (!date) return { label: 'Not tracked', tone: 'neutral' };
  const now = new Date(); now.setHours(0,0,0,0);
  const target = new Date(`${date}T00:00:00`);
  const days = Math.round((target - now) / 86400000);
  return days < 0 ? { label: 'Expired', tone: 'danger' }
    : days <= 3 ? { label: 'Expiring soon', tone: 'warning' }
    : { label: 'Normal', tone: 'success' };
};

export const normalizeIngredient = (x) => String(x ?? '').trim().toLowerCase().replace(/es$/, '').replace(/s$/, '');
export const ingredientsOwned = (recipe, pantry) => (recipe.ingredients ?? []).filter(i => pantry.some(p => normalizeIngredient(p.name) === normalizeIngredient(i.name ?? i)));
export const ingredientsMissing = (recipe, pantry) => (recipe.ingredients ?? []).filter(i => !pantry.some(p => normalizeIngredient(p.name) === normalizeIngredient(i.name ?? i)));
export const getErrorMessage = (error) => error?.message || 'Something went wrong. Please try again.';
export const timeAgo = () => 'Recently'; // demo data has no synchronized server timestamps
export const initial = (value) => (value || '?').slice(0, 1).toUpperCase();
export const parseTags = (s) => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
