import { makeInitialStore, DEMO_USER } from '../demo/seed.js';
import { ingredientsMissing, normalizeIngredient } from '../lib/utils.js';

// This store is an in-browser demo ONLY. It is not an auth system and must NOT
// be used to protect private user data. The real backend owns all permissions.
const KEY = 'cooking-nexus-demo-v2';
const sleep = () => new Promise(resolve => setTimeout(resolve, 140));
const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const copy = x => structuredClone(x);
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || makeInitialStore(); } catch { return makeInitialStore(); } };
const save = data => localStorage.setItem(KEY, JSON.stringify(data));
const transaction = async fn => { await sleep(); const data = read(); const result = fn(data); save(data); return copy(result); };
const query = async fn => { await sleep(); return copy(fn(read())); };
const requireUser = data => {
  const user = data.users.find(u => u.id === data.current_user_id);
  if (!user) throw new Error('Please sign in to continue.');
  return user;
};
const requireOwned = (array, itemId, uid, field='user_id') => {
  const item = array.find(x => String(x.id) === String(itemId) && x[field] === uid);
  if (!item) throw new Error('Item not found or you do not have access.');
  return item;
};
const recView = (r, userId) => ({...r, like_count:r.like_user_ids?.length || 0, liked_by_me:(r.like_user_ids || []).includes(userId)});
const visibleRecipe = (r, userId) => r.is_published || r.author_user_id === userId;

export const mockApi = {
  auth: {
    me: () => query(data => data.users.find(u => u.id === data.current_user_id) || null),
    login: ({email}) => transaction(data => {
      const normalized = String(email).trim().toLowerCase();
      if (!normalized.includes('@')) throw new Error('Enter a valid email.');
      let user = data.users.find(u => u.email === normalized);
      if (!user) { user = {id:id(),email:normalized,display_name:normalized.split('@')[0],dietary_preferences:[]}; data.users.push(user); }
      data.current_user_id = user.id;
      return user;
    }),
    register: ({email,display_name}) => transaction(data => {
      const normalized = String(email).trim().toLowerCase();
      if (!normalized.includes('@')) throw new Error('Enter a valid email.');
      if (data.users.some(u => u.email === normalized)) throw new Error('That demo account already exists. Try Sign in.');
      const user = {id:id(), email:normalized, display_name:display_name.trim(), dietary_preferences:[]};
      data.users.push(user); data.current_user_id=user.id; return user;
    }),
    logout: () => transaction(data => {data.current_user_id=null; return {ok:true};}),
    updateMe: changes => transaction(data => {
      const user = requireUser(data); Object.assign(user,{display_name:changes.display_name ?? user.display_name, dietary_preferences:changes.dietary_preferences ?? user.dietary_preferences}); return user;
    }),
  },
  pantry: {
    list: () => query(data => {const user=requireUser(data); return data.pantry.filter(p => p.user_id === user.id);}),
    create: values => transaction(data => {const user=requireUser(data); const item={id:id(), user_id:user.id, name:values.name, quantity:Number(values.quantity), unit:values.unit || '', expiration_date:values.expiration_date || null}; data.pantry.push(item); return item;}),
    update: (itemId, changes) => transaction(data => {const user=requireUser(data);const item=requireOwned(data.pantry,itemId,user.id); Object.assign(item,changes);if ('quantity' in changes) item.quantity=Number(changes.quantity);return item;}),
    remove: itemId => transaction(data => {const user=requireUser(data);requireOwned(data.pantry,itemId,user.id);data.pantry = data.pantry.filter(p=>String(p.id)!==String(itemId));return {ok:true};}),
  },
  recipes: {
    discover: ({search='', dietary_tags=[],quick=false,budget=false}={}) => query(data => {
      const user=requireUser(data);
      const pantry=data.pantry.filter(p=>p.user_id===user.id);
      return data.cookbook_recipes.filter(r => {
        if (search && !`${r.title} ${r.ingredients.map(i=>i.name).join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (dietary_tags.length && !dietary_tags.every(t => r.dietary_tags.includes(t))) return false;
        if (quick && r.prep_time_minutes>30) return false;
        if (budget && r.cost_band!=='low') return false;
        return true;
      }).map(r => ({...r, have_count: r.ingredients.length - ingredientsMissing(r,pantry).length, missing_ingredients: ingredientsMissing(r,pantry)}));
    }),
    get: recipeId => query(data => {const user=requireUser(data);const recipe = data.cookbook_recipes.find(r=>String(r.id)===String(recipeId)) || data.community_recipes.find(r=>String(r.id)===String(recipeId) && visibleRecipe(r,user.id));if(!recipe) throw new Error('Recipe not found.');return recipe.source_type ? recipe : {...recView(recipe,user.id),source_type:'community',source_label:'Community recipe'};}),
  },
  favorites: {
    list: () => query(data => {const u=requireUser(data);return data.favorites.filter(f=>f.user_id===u.id).map(f=>data.cookbook_recipes.find(r=>r.id===f.recipe_id)||data.community_recipes.find(r=>r.id===f.recipe_id)).filter(Boolean);}),
    add: recipeId => transaction(data => {const u=requireUser(data);if(!data.favorites.some(f=>f.user_id===u.id&&String(f.recipe_id)===String(recipeId)))data.favorites.push({id:id(),user_id:u.id,recipe_id:recipeId});return {ok:true};}),
    remove: recipeId => transaction(data => {const u=requireUser(data);data.favorites=data.favorites.filter(f=>!(f.user_id===u.id&&String(f.recipe_id)===String(recipeId)));return {ok:true};}),
  },
  shopping: {
    list: () => query(data => {const u=requireUser(data);return data.shopping.filter(i=>i.user_id===u.id);}),
    create: values => transaction(data => {const u=requireUser(data);const item={id:id(),user_id:u.id,name:values.name,quantity:Number(values.quantity)||1,unit:values.unit||'',is_checked:false};data.shopping.push(item);return item;}),
    update: (itemId,changes) => transaction(data=>{const u=requireUser(data);const item=requireOwned(data.shopping,itemId,u.id);Object.assign(item,changes);return item;}),
    remove: itemId => transaction(data=>{const u=requireUser(data);requireOwned(data.shopping,itemId,u.id);data.shopping=data.shopping.filter(x=>String(x.id)!==String(itemId));return {ok:true};}),
    addMissing: async (recipe) => {
      const pantry=await mockApi.pantry.list();
      const missing=ingredientsMissing(recipe,pantry);
      return transaction(data => {const u=requireUser(data);missing.forEach(i=>{const name=i.name||i;if(!data.shopping.some(s=>s.user_id===u.id&&normalizeIngredient(s.name)===normalizeIngredient(name)))data.shopping.push({id:id(),user_id:u.id,name,quantity:1,unit:'',is_checked:false});});return {count:missing.length};});
    },
  },
  community: {
    list: () => query(data => {const u=requireUser(data);return data.community_recipes.filter(r=>r.is_published).map(r=>recView(r,u.id));}),
    mine: () => query(data => {const u=requireUser(data);return data.community_recipes.filter(r=>r.author_user_id===u.id).map(r=>recView(r,u.id));}),
    create: payload => transaction(data => {const u=requireUser(data);const post={id:id(),author_user_id:u.id,author_name:u.display_name,title:payload.title,description:payload.description||'',ingredients:payload.ingredients||[],instructions:payload.instructions||[],prep_time_minutes:Number(payload.prep_time_minutes)||30,dietary_tags:payload.dietary_tags||[],is_published:false,image_url:null,like_user_ids:[],comments:[]};data.community_recipes.unshift(post);return recView(post,u.id);}),
    update: (postId,payload) => transaction(data=>{const u=requireUser(data);const post=requireOwned(data.community_recipes,postId,u.id,'author_user_id');Object.assign(post,payload);return recView(post,u.id);}),
    remove: postId => transaction(data=>{const u=requireUser(data);requireOwned(data.community_recipes,postId,u.id,'author_user_id');data.community_recipes=data.community_recipes.filter(r=>String(r.id)!==String(postId));return {ok:true};}),
    publish: (postId, published) => transaction(data=>{const u=requireUser(data);const post=requireOwned(data.community_recipes,postId,u.id,'author_user_id');post.is_published=published;return recView(post,u.id);}),
    like: postId => transaction(data=>{const u=requireUser(data);const post=data.community_recipes.find(x=>String(x.id)===String(postId)&&x.is_published);if(!post)throw new Error('Recipe not found.');if(!post.like_user_ids.includes(u.id))post.like_user_ids.push(u.id);return recView(post,u.id);}),
    unlike: postId => transaction(data=>{const u=requireUser(data);const post=data.community_recipes.find(x=>String(x.id)===String(postId)&&x.is_published);if(!post)throw new Error('Recipe not found.');post.like_user_ids=post.like_user_ids.filter(x=>x!==u.id);return recView(post,u.id);}),
    comment: (postId,body) => transaction(data=>{const u=requireUser(data);const post=data.community_recipes.find(x=>String(x.id)===String(postId)&&x.is_published);if(!post)throw new Error('Recipe not found.');const comment={id:id(),user_id:u.id,author_name:u.display_name,body};post.comments.push(comment);return comment;}),
    deleteComment: commentId => transaction(data=>{const u=requireUser(data);const post=data.community_recipes.find(r=>r.comments.some(c=>String(c.id)===String(commentId)&&c.user_id===u.id));if(!post)throw new Error('Comment not found or not yours.');post.comments=post.comments.filter(c=>String(c.id)!==String(commentId));return {ok:true};}),
  },
};

export function resetDemo() {localStorage.removeItem(KEY);}
export const demoAccount = DEMO_USER;
