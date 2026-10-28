// Real FastAPI adapter. No browser-side token handling: JWT stays in the
// backend-issued HttpOnly cookie. Configure VITE_API_BASE_URL=/api.
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message) { super(message); this.name = 'ApiError'; this.status = status; }
}

export async function request(path, {method='GET', body, signal}={}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method, signal, credentials: 'include',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : {'Content-Type':'application/json'}) },
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    });
  } catch (e) {
    throw new ApiError(0, 'Cannot reach the API. Start FastAPI or switch to VITE_DATA_MODE=mock.');
  }
  const raw = await response.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { data = raw; } }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/login')) window.dispatchEvent(new Event('cn:unauthorized'));
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map(d => `${d.loc?.slice(-1)[0] || 'Field'}: ${d.msg}`).join('; ')
      : typeof detail === 'string' ? detail : data?.message || `Request failed (${response.status}).`;
    throw new ApiError(response.status, message);
  }
  return data;
}
const arr = (data, key='items') => Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : Array.isArray(data?.results) ? data.results : [];
const obj = (data, key) => data?.[key] || data;
const enc = x => encodeURIComponent(String(x));

export const httpApi = {
  auth: {
    me: () => request('/me'),
    login: async credentials => { await request('/auth/login', {method:'POST',body:credentials}); return request('/me'); },
    register: async credentials => { await request('/auth/register',{method:'POST',body:credentials}); await request('/auth/login', {method:'POST',body:{email:credentials.email,password:credentials.password}}); return request('/me'); },
    logout: () => request('/auth/logout',{method:'POST'}),
    updateMe: values => request('/me',{method:'PATCH',body:values}),
  },
  pantry: {
    list: async () => arr(await request('/pantry')),
    create: values => request('/pantry',{method:'POST',body:values}),
    update: (id,values) => request(`/pantry/${enc(id)}`,{method:'PATCH',body:values}),
    remove: id => request(`/pantry/${enc(id)}`,{method:'DELETE'}),
  },
  recipes: {
    discover: async values => arr(await request('/recipes/discover',{method:'POST',body:values}), 'recipes'),
    get: id => request(`/recipes/${enc(id)}`),
  },
  favorites: {
    list: async () => arr(await request('/favorites'), 'recipes'),
    add: id => request(`/favorites/${enc(id)}`,{method:'POST'}),
    remove: id => request(`/favorites/${enc(id)}`,{method:'DELETE'}),
  },
  shopping: {
    list: async () => arr(await request('/shopping-list')),
    create: values => request('/shopping-list',{method:'POST',body:values}),
    update: (id,changes) => request(`/shopping-list/${enc(id)}`,{method:'PATCH',body:changes}),
    remove: id => request(`/shopping-list/${enc(id)}`,{method:'DELETE'}),
    // No bulk endpoint is specified by the SDD. Use existing POST in a loop.
    addMissing: async recipe => {
      const pantry = arr(await request('/pantry'));
      const owned = new Set(pantry.map(p => String(p.name).trim().toLowerCase()));
      const current = arr(await request('/shopping-list'));
      const pending = new Set(current.map(x => String(x.name).trim().toLowerCase()));
      const missing = (recipe.ingredients || []).filter(i => !owned.has(String(i.name || i).toLowerCase()) && !pending.has(String(i.name || i).toLowerCase()));
      for (const ingredient of missing) await request('/shopping-list', {method:'POST',body:{name:ingredient.name||ingredient,quantity:1,unit:''}});
      return {count:missing.length};
    },
  },
  community: {
    list: async () => arr(await request('/community/recipes'), 'recipes'),
    // No GET /my-recipes is specified in the original SDD. This returns the
    // public feed and filters by logged-in author; private drafts require a
    // future endpoint (recommended GET /community/recipes/mine).
    mine: async () => arr(await request('/community/recipes/mine'), 'recipes'),
    create: values => request('/community/recipes',{method:'POST',body:values}),
    update: (id,values) => request(`/community/recipes/${enc(id)}`,{method:'PATCH',body:values}),
    remove: id => request(`/community/recipes/${enc(id)}`,{method:'DELETE'}),
    publish: (id,is_published) => request(`/community/recipes/${enc(id)}/publish`,{method:'POST',body:{is_published}}),
    like: id => request(`/community/recipes/${enc(id)}/like`,{method:'POST'}),
    unlike: id => request(`/community/recipes/${enc(id)}/like`,{method:'DELETE'}),
    comment: (id,body) => request(`/community/recipes/${enc(id)}/comments`,{method:'POST',body:{body}}),
    deleteComment: id => request(`/comments/${enc(id)}`,{method:'DELETE'}),
  },
};
