import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {mockApi, resetDemo} from '../src/api/mock.js';

// Tiny localStorage polyfill so mock API can be tested without a browser.
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key)?storage.get(key):null,
  setItem: (key,value) => storage.set(key,String(value)),
  removeItem: key => storage.delete(key),
};
const requiredFiles=['index.html','vite.config.js','.env.example','src/App.jsx','src/api/index.js','src/api/http.js','src/api/mock.js','src/context/AuthContext.jsx','src/pages/DashboardPage.jsx','src/pages/PantryPage.jsx','src/pages/DiscoverPage.jsx','src/pages/RecipePage.jsx','src/pages/FavoritesPage.jsx','src/pages/ShoppingPage.jsx','src/pages/CommunityPage.jsx','src/pages/ProfilePage.jsx','public/images/pasta.jpg'];
for(const file of requiredFiles)assert(existsSync(join(process.cwd(),file)),`Missing ${file}`);

let user=await mockApi.auth.login({email:'demo@cookingnexus.local',password:'not-a-real-password'});
assert.equal(user.id,'demo-user');
let pantry=await mockApi.pantry.list();assert(pantry.length>=7);
let created=await mockApi.pantry.create({name:'Saffron',quantity:2,unit:'g',expiration_date:null});
assert.equal(created.expiration_date,null);
await mockApi.pantry.update(created.id,{quantity:1});
assert((await mockApi.pantry.list()).some(x=>x.id===created.id&&x.quantity===1));
let recipes=await mockApi.recipes.discover({dietary_tags:['Vegan']});
assert(recipes.length>0 && recipes.every(x=>x.dietary_tags.includes('Vegan')));
await mockApi.favorites.add(recipes[0].id);
await mockApi.favorites.add(recipes[0].id);
assert.equal((await mockApi.favorites.list()).length,1);
await mockApi.shopping.addMissing(recipes[0]);
assert((await mockApi.shopping.list()).length>0);
const post=await mockApi.community.create({title:'Test dish',description:'Just a test',ingredients:[{name:'Rice'}],instructions:['Cook rice.'],prep_time_minutes:10,dietary_tags:[]});
assert(!(await mockApi.community.list()).some(x=>x.id===post.id),'Draft accidentally public');
await mockApi.community.publish(post.id,true);
await mockApi.community.like(post.id);await mockApi.community.like(post.id);
assert.equal((await mockApi.community.list()).find(x=>x.id===post.id).like_count,1);
const comment=await mockApi.community.comment(post.id,'Sounds good!');
assert.equal(comment.body,'Sounds good!');
await mockApi.community.deleteComment(comment.id);
await mockApi.auth.logout();
assert.equal(await mockApi.auth.me(),null);
await mockApi.auth.register({email:'other@example.com',display_name:'Other',password:'test-password'});
assert(!(await mockApi.pantry.list()).some(x=>x.id===created.id),'Mock should scope private pantry items per user');
let denied=false;try{await mockApi.pantry.update(created.id,{name:'stolen'});}catch{denied=true;}
assert(denied,'Mock owner check missing');
resetDemo();
console.log('✓ Structure present; demo auth, pantry, dietary filters, favorites, shopping, drafts, likes, comments, and ownership smoke checks passed.');
console.log('Note: Vite compilation still requires npm install (offline registry unavailable in this environment).');
