import React,{useState} from 'react';
import {ShoppingBasket,Plus,Trash2,Store,Check,Info} from 'lucide-react';
import {api} from '../api';
import {useResource} from '../lib/useResource';
import {useToast} from '../context/ToastContext';
import {getErrorMessage} from '../lib/utils';
import {PageHead,Panel,Button,EmptyState,Loading,ErrorState,Field} from '../components/UI';

export default function ShoppingPage(){
 const {notify}=useToast();const {data:items,loading,error,reload}=useResource(()=>api.shopping.list(),[]);const [name,setName]=useState('');const [quantity,setQuantity]=useState(1);const [busy,setBusy]=useState(false);
 async function add(e){e.preventDefault();if(!name.trim())return;setBusy(true);try{await api.shopping.create({name:name.trim(),quantity:Number(quantity),unit:''});setName('');setQuantity(1);notify('Added to your shopping list.');reload();}catch(e){notify(getErrorMessage(e),'error');}finally{setBusy(false);}}
 async function toggle(item){try{await api.shopping.update(item.id,{is_checked:!item.is_checked});reload();}catch(e){notify(e.message,'error');}}
 async function remove(item){try{await api.shopping.remove(item.id);notify('Item removed.');reload();}catch(e){notify(e.message,'error');}}
 const done=(items||[]).filter(i=>i.is_checked).length;
 return <><PageHead eyebrow="PREPARE YOUR NEXT MEAL" title="Shopping list" subtitle="Everything you need, all in one place."/>
 <div className="shopping-layout"><Panel className="section-panel"><div className="section-head"><div><h2>My list</h2><p>{items?.length||0} items · {done} checked off</p></div></div><form className="add-shopping" onSubmit={add}><input value={name} onChange={e=>setName(e.target.value)} maxLength={100} placeholder="Add an ingredient…" aria-label="Ingredient name" required/><input value={quantity} onChange={e=>setQuantity(e.target.value)} type="number" min="0.01" step="any" aria-label="Quantity" required/><Button type="submit" disabled={busy}><Plus size={17}/> Add</Button></form>
 {loading?<Loading/>:error?<ErrorState message={error} onRetry={reload}/>:items?.length?<div className="shopping-items">{items.map(item=><div key={item.id} className={`shopping-item ${item.is_checked?'checked':''}`}><label><input type="checkbox" checked={Boolean(item.is_checked)} onChange={()=>toggle(item)}/><span>{item.name}</span></label><small>{item.quantity} {item.unit||''}</small><button className="icon-button destructive" onClick={()=>remove(item)} aria-label={`Remove ${item.name}`}><Trash2 size={17}/></button></div>)}</div>:<EmptyState icon={ShoppingBasket} title="Your list is empty" description="Add items manually or add missing recipe ingredients from Discover."/>}
 </Panel><aside className="shopping-aside"><Panel className="retailer-panel"><div className="retailer-icon"><Store size={27}/></div><h2>Online grocery ordering</h2><p>One day, Cooking Nexus may connect to Walmart or other retailers. For now, keep the list here and shop as you normally would.</p><Button variant="outline" disabled>Connect Walmart — future update</Button><span className="future-label">Not included in this MVP</span></Panel><Panel className="hint-panel"><h3><Info size={19}/> Helpful tip</h3><p>When you open a recipe, use <b>Add missing ingredients</b> to automatically fill your shopping list from that recipe's ingredient list.</p></Panel></aside></div>
 </>;
}
