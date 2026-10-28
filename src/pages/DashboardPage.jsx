import React from 'react';
import {Link} from 'react-router-dom';
import {Refrigerator,Heart,ShoppingBasket,AlertTriangle,ArrowRight,Plus,UsersRound,BookOpen,Leaf} from 'lucide-react';
import {api} from '../api';
import {useAuth} from '../context/AuthContext';
import {PageHead,Panel,Status,Loading,ErrorState,Button,EmptyState} from '../components/UI';
import {useResource} from '../lib/useResource';
import {expiryInfo,humanDate} from '../lib/utils';
import RecipeCard from '../components/RecipeCard';

export default function DashboardPage(){
 const {user}=useAuth();
 const {data,loading,error,reload}=useResource(async()=>{
  const [pantry,favorites,shopping,posts,recipes]=await Promise.all([api.pantry.list(),api.favorites.list(),api.shopping.list(),api.community.list(),api.recipes.discover({})]);
  return {pantry,favorites,shopping,posts,recipes};
 },[]);
 const [pantry,favorites,shopping,posts,recipes]=data?[data.pantry,data.favorites,data.shopping,data.posts,data.recipes]:[[],[],[],[],[]];
 const expiring=pantry.filter(p=>['Expiring soon','Expired'].includes(expiryInfo(p.expiration_date).label));
 const stats=[{label:'Pantry items',count:pantry.length,icon:Refrigerator,to:'/pantry',detail:`${pantry.filter(p=>p.expiration_date).length} with dates`,tone:'green'},{label:'Saved recipes',count:favorites.length,icon:Heart,to:'/favorites',detail:'Your collection',tone:'rose'},{label:'Shopping list',count:shopping.filter(s=>!s.is_checked).length,icon:ShoppingBasket,to:'/shopping',detail:'Items remaining',tone:'mint'},{label:'Attention needed',count:expiring.length,icon:AlertTriangle,to:'/pantry',detail:'Expired or expiring',tone:'orange'}];
 return <><PageHead eyebrow="YOUR KITCHEN AT A GLANCE" title={`Good morning, ${user?.display_name?.split(' ')[0] || 'Cook'}! ☀️`} subtitle="A little organization goes a long way toward delicious meals."/>
 {loading&&<Loading label="Loading your kitchen…"/>}{error&&<ErrorState message={error} onRetry={reload}/>}
 {data&&<>
 <div className="stats-grid">{stats.map(s=><Link key={s.label} to={s.to} className={`stat-card stat-${s.tone}`}><div className="stat-card-top"><span>{s.label}</span><s.icon size={21}/></div><b>{s.count}</b><small>{s.detail}</small><ArrowRight className="stat-arrow" size={17}/></Link>)}</div>
 <div className="dashboard-columns"><Panel className="dashboard-expiring"><div className="section-head"><div><h2>Use these soon</h2><p>Ingredients that deserve your attention.</p></div><Link to="/pantry" className="text-link">Your pantry <ArrowRight size={15}/></Link></div>
 {expiring.length? <div className="simple-list">{expiring.slice(0,5).map(p=><div className="simple-row" key={p.id}><div className="ingredient-icon">🥬</div><div className="simple-row-name"><b>{p.name}</b><small>{p.expiration_date?humanDate(p.expiration_date):'No date'}</small></div><Status date={p.expiration_date}/></div>)}</div> : <EmptyState icon={Leaf} title="Everything looks fresh" description="Nothing is expired or expiring within the next three days."/>}
 </Panel><div className="dashboard-side"><Panel className="inspiration-card"><div className="inspiration-title"><Leaf/><span>Make the most of what you have</span></div><h2>What's cooking today?</h2><p>Find recipes that work with the ingredients already in your kitchen.</p><Link className="btn btn-white" to="/discover">Discover recipes <ArrowRight size={16}/></Link></Panel><Panel className="quick-panel"><h3>Quick actions</h3><Link to="/pantry" className="quick-link"><Plus/> Add pantry item <ArrowRight size={16}/></Link><Link to="/community" className="quick-link"><UsersRound/> Share a recipe <ArrowRight size={16}/></Link><Link to="/shopping" className="quick-link"><ShoppingBasket/> View shopping list <ArrowRight size={16}/></Link></Panel></div></div>
 <div className="section-head outside"><div><h2>Ideas for your next meal</h2><p>Preview recipes and discover what you're missing.</p></div><Link to="/discover" className="text-link">Browse all <ArrowRight size={16}/></Link></div>
 {recipes.length?<div className="recipe-grid">{recipes.slice(0,3).map(r=><RecipeCard key={r.id} recipe={r} pantry={pantry}/>)}</div>:<EmptyState title="No recipes yet" description="Add your ingredients and discover recipe ideas."/>}
 <div className="section-head outside"><div><h2>From the community</h2><p>Fresh ideas shared by home cooks.</p></div><Link to="/community" className="text-link">Join the community <ArrowRight size={16}/></Link></div>
 <div className="community-preview-grid">{posts.slice(0,3).map(p=><Link to="/community" key={p.id} className="community-preview"><div className="small-avatar">{p.author_name?.[0]?.toUpperCase()||'C'}</div><div><b>{p.title}</b><span>by {p.author_name} · {p.like_count??p.like_user_ids?.length??0} likes</span></div><ArrowRight size={17}/></Link>)}</div>
 </>}
 </>;
}
