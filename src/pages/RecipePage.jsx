import React,{useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {ArrowLeft,Heart,ShoppingBasket,Clock3,ChefHat,Info,BookOpen} from 'lucide-react';
import {api,isDemo} from '../api';
import {useResource} from '../lib/useResource';
import {useToast} from '../context/ToastContext';
import {PageHead,Panel,Button,Tag,Loading,ErrorState} from '../components/UI';
import {ingredientsMissing} from '../lib/utils';
export default function RecipePage(){
 const {recipeId}=useParams();const {notify}=useToast();const navigate=useNavigate();
 const {data,loading,error,reload}=useResource(async()=>{const [recipe,pantry,favorites]=await Promise.all([api.recipes.get(recipeId),api.pantry.list(),api.favorites.list()]);return {recipe,pantry,favorites};},[recipeId]);
 const [favorited,setFavorited]=useState(false);
 useEffect(()=>{if(data)setFavorited(data.favorites.some(f=>String(f.id)===String(recipeId)));},[data,recipeId]);
 async function toggle(){try{if(favorited)await api.favorites.remove(recipeId);else await api.favorites.add(recipeId);setFavorited(!favorited);notify(favorited?'Removed from favorites.':'Saved to favorites.');}catch(e){notify(e.message,'error');}}
 async function missing(){try{const result=await api.shopping.addMissing(data.recipe);notify(`${result.count||0} ingredients processed for your shopping list.`);}catch(e){notify(e.message,'error');}}
 if(loading)return <Loading label="Loading recipe…"/>;
 if(error)return <ErrorState message={error} onRetry={reload}/>;
 if(!data)return null;
 const {recipe,pantry}=data;const missingItems=ingredientsMissing(recipe,pantry);
 return <><button className="text-link back-link" onClick={()=>navigate(-1)}><ArrowLeft size={17}/> Back to recipes</button><PageHead eyebrow={recipe.source_label||(recipe.source_type==='community'?'COMMUNITY RECIPE':'RECIPE')} title={recipe.title} subtitle={recipe.description||'Your next homemade meal.'} action={<div className="header-actions"><Button variant="outline" onClick={toggle}><Heart size={18} fill={favorited?'currentColor':'none'}/>{favorited?'Saved':'Save recipe'}</Button><Button onClick={missing}><ShoppingBasket size={18}/> Add missing ingredients</Button></div>}/>
 <div className="recipe-detail-layout"><div><div className="recipe-banner" style={{backgroundImage:recipe.image_url?`url(${recipe.image_url})`:undefined}}>{!recipe.image_url&&<ChefHat size={65}/>}</div><Panel className="section-panel"><h2>Instructions</h2>{recipe.instructions?.length?<ol className="steps-list">{recipe.instructions.map((s,i)=><li key={i}><span>{i+1}</span><p>{s}</p></li>)}</ol>:<p className="muted">Instructions are not available for this record yet. Connect recipe details through FastAPI.</p>}</Panel></div><aside><Panel className="section-panel"><div className="detail-time"><Clock3 size={19}/> {recipe.prep_time_minutes||'—'} minutes</div><div className="tags detail-tags">{(recipe.dietary_tags||[]).map(t=><Tag key={t} tone="light">{t}</Tag>)}</div><h2>Ingredients</h2><div className="ingredient-checklist">{(recipe.ingredients||[]).map((ingredient,i)=>{const name=ingredient.name||ingredient;const have=!missingItems.some(x=>(x.name||x)===name);return <div key={i}><span className={have?'ingredient-have':'ingredient-need'}>{have?'✓':'+'}</span><span>{ingredient.quantity?`${ingredient.quantity} ${ingredient.unit||''} `:''}{name}</span><small>{have?'In pantry':'Missing'}</small></div>})}</div><Button className="w-full" onClick={missing}><ShoppingBasket size={17}/> Add missing to shopping list</Button></Panel><Panel className="source-panel"><BookOpen size={22}/><div><b>Recipe source</b><p>{recipe.source_label||(recipe.source_type==='community'?'Community-authored':'Cookbook source')}</p></div></Panel>{isDemo&&<div className="info-note"><Info size={17}/> Demonstration recipe. These cooking steps are examples, not extracted from installed cookbooks.</div>}</aside></div>
 </>;
}
