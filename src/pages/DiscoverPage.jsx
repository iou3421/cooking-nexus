import React,{useEffect,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search,SlidersHorizontal,ChefHat,Leaf,Info,ShoppingBasket} from 'lucide-react';
import {api,isDemo} from '../api';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {getErrorMessage} from '../lib/utils';
import {PageHead,Panel,Button,EmptyState,Loading,ErrorState} from '../components/UI';
import RecipeCard from '../components/RecipeCard';

const tags=['Vegetarian','Vegan','Gluten-free','Dairy-free'];
export default function DiscoverPage(){
 const {user}=useAuth();const {notify}=useToast();const [params]=useSearchParams();const q=params.get('q')||'';
 const [term,setTerm]=useState(q);const [selected,setSelected]=useState(user?.dietary_preferences||[]);const [quick,setQuick]=useState(false);const [budget,setBudget]=useState(false);
 const [recipes,setRecipes]=useState([]);const [favorites,setFavorites]=useState([]);const [pantry,setPantry]=useState([]);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 async function search(values){setLoading(true);setError('');try{const [results,faves,items]=await Promise.all([api.recipes.discover(values),api.favorites.list(),api.pantry.list()]);setRecipes(results);setFavorites(faves);setPantry(items);}catch(e){setError(getErrorMessage(e));}finally{setLoading(false);}}
 useEffect(()=>{setTerm(q);search({search:q,dietary_tags:selected,quick,budget});},[q]);
 const isFavorite=id=>favorites.some(f=>String(f.id)===String(id));
 async function toggleFavorite(r){try{if(isFavorite(r.id))await api.favorites.remove(r.id);else await api.favorites.add(r.id);setFavorites(await api.favorites.list());notify(isFavorite(r.id)?'Recipe removed from favorites.':'Recipe saved to favorites.');}catch(e){notify(getErrorMessage(e),'error');}}
 async function addMissing(recipe){try{const result=await api.shopping.addMissing(recipe);notify(`${result.count||0} missing ingredients added or already on your shopping list.`);}catch(e){notify(e.message,'error');}}
 return <><PageHead eyebrow="COOK WITH WHAT YOU HAVE" title="Discover recipes" subtitle="Explore meal ideas based on your pantry and preferences."/>
 <Panel className="discover-panel"><form onSubmit={e=>{e.preventDefault();search({search:term,dietary_tags:selected,quick,budget});}}><div className="discover-top"><div><h2><SlidersHorizontal size={19}/> Find recipes from what you have</h2><p>Choose filters, then search.</p></div><button type="button" className="clear-btn" onClick={()=>{setSelected([]);setQuick(false);setBudget(false);setTerm('');search({});}}>Clear all filters</button></div>
 <div className="search-input discover-search"><Search size={18}/><input aria-label="Search recipes by name or ingredient" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Try spinach, quick dinner, rice…"/></div>
 <div className="filters-label">Dietary preferences</div><div className="filter-chips">{tags.map(t=><button type="button" className={`filter-chip ${selected.includes(t)?'checked':''}`} aria-pressed={selected.includes(t)} key={t} onClick={()=>setSelected(current=>current.includes(t)?current.filter(x=>x!==t):[...current,t])}>{selected.includes(t)?'✓ ':''}{t}</button>)}</div>
 <div className="filters-label">Practical filters</div><div className="filter-chips"><button type="button" className={`filter-chip ${quick?'checked':''}`} aria-pressed={quick} onClick={()=>setQuick(!quick)}>⚡ 30 minutes or less</button><button type="button" className={`filter-chip ${budget?'checked':''}`} aria-pressed={budget} onClick={()=>setBudget(!budget)}>Budget-friendly</button></div>
 <div className="filter-footer"><small><Info size={15}/> Dietary tags are preferences, not allergy-safety guarantees. Unknown tags are not assumed safe.</small><Button type="submit" disabled={loading}><Search size={17}/> Find recipes</Button></div>
 </form></Panel>
 <div className="section-head outside"><div><h2>{loading?'Finding recipes…':`${recipes.length} recipe${recipes.length===1?'':'s'} found`}</h2><p>{isDemo?'Illustrative demo recipes (no cookbook or LLM currently connected).':'Results from the configured cookbook retrieval API.'}</p></div></div>
 {loading?<Loading label="Searching recipe collection…"/>:error?<ErrorState message={error} onRetry={()=>search({search:term,dietary_tags:selected,quick,budget})}/>:recipes.length?<div className="recipe-grid">{recipes.map(r=><RecipeCard key={r.id} recipe={r} pantry={pantry} isFavorite={isFavorite(r.id)} onFavorite={toggleFavorite} onAddMissing={addMissing}/>)}</div>:<EmptyState icon={ChefHat} title="No recipes match those filters" description="Try clearing a filter or searching for a different ingredient." action={<Button variant="outline" onClick={()=>{setSelected([]);setQuick(false);setBudget(false);setTerm('');search({});}}>Clear filters</Button>}/>}
 <div className="info-note"><Leaf size={18}/><div><b>How the real feature will work:</b> FastAPI searches the local cookbook dataset, applies supported dietary metadata, and may use the local LLM to rank or explain retrieved recipes. The frontend will only display grounded results returned by the API.</div></div>
 </>;
}
