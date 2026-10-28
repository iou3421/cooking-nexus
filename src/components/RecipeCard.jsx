import React from 'react';
import {Heart, Clock3, ChefHat, ArrowUpRight, ShoppingBasket} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button, Tag} from './UI';
export default function RecipeCard({recipe,isFavorite,onFavorite,onAddMissing,pantry=[]}){
 const ingredients=recipe.ingredients||[];
 const have=ingredients.filter(i=>pantry.some(p=>String(p.name).trim().toLowerCase()===String(i.name||i).trim().toLowerCase())).length;
 const isSample=recipe.source_type==='sample';
 return <article className="recipe-card">
  <div className="recipe-image" style={{backgroundImage:recipe.image_url ? `url(${recipe.image_url})` : undefined}}>
   {!recipe.image_url && <ChefHat size={32}/>}
   <span className="match-pill">{ingredients.length?`${have}/${ingredients.length} ingredients in pantry`:'Community recipe'}</span>
   <button className={`favorite-float ${isFavorite?'selected':''}`} aria-label={isFavorite?'Remove from favorites':'Add to favorites'} onClick={()=>onFavorite?.(recipe)}><Heart size={19} fill={isFavorite?'currentColor':'none'}/></button>
  </div>
  <div className="recipe-info"><div className="recipe-topline"><Tag tone={isSample?'soft':'cream'}>{recipe.source_label || (isSample?'Sample • Demo':'Community')}</Tag><span className="recipe-time"><Clock3 size={14}/>{recipe.prep_time_minutes || '—'} min</span></div>
   <h3>{recipe.title}</h3><p>{recipe.description || 'View the ingredients and cooking instructions.'}</p>
   <div className="tags">{(recipe.dietary_tags||[]).slice(0,3).map(x=><Tag key={x} tone="light">{x}</Tag>)}</div>
   <div className="recipe-actions"><Link className="btn btn-primary" to={`/recipes/${encodeURIComponent(recipe.id)}`}>View recipe <ArrowUpRight size={16}/></Link>{onAddMissing&&<button title="Add missing ingredients" className="icon-button border" onClick={()=>onAddMissing(recipe)}><ShoppingBasket size={18}/></button>}</div>
  </div>
 </article>;
}
