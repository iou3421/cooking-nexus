import React from 'react';
import {Link} from 'react-router-dom';
import {Heart,Search,ArrowRight} from 'lucide-react';
import {api} from '../api';
import {useResource} from '../lib/useResource';
import {useToast} from '../context/ToastContext';
import {PageHead,Button,EmptyState,Loading,ErrorState} from '../components/UI';
import RecipeCard from '../components/RecipeCard';
export default function FavoritesPage(){
 const {notify}=useToast();const {data,loading,error,reload}=useResource(async()=>{const [favorites,pantry]=await Promise.all([api.favorites.list(),api.pantry.list()]);return {favorites,pantry};},[]);
 async function remove(r){try{await api.favorites.remove(r.id);notify('Removed from favorites.');reload();}catch(e){notify(e.message,'error');}}
 return <><PageHead eyebrow="YOUR SAVED COLLECTION" title="Favorite recipes" subtitle="Keep your best cooking ideas within reach." action={<Link className="btn btn-outline" to="/discover"><Search size={17}/> Discover more</Link>}/>
 {loading?<Loading/>:error?<ErrorState message={error} onRetry={reload}/>:data?.favorites?.length?<div className="recipe-grid">{data.favorites.map(r=><RecipeCard key={r.id} recipe={r} pantry={data.pantry} isFavorite onFavorite={remove}/>)}</div>:<EmptyState icon={Heart} title="No favorite recipes yet" description="Explore recipes and tap the heart to save ones you want to make again." action={<Link className="btn btn-primary" to="/discover">Browse recipes <ArrowRight size={16}/></Link>}/>}
 </>;
}
