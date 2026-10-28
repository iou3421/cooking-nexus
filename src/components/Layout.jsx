import React,{useState} from 'react';
import {NavLink,Outlet,useNavigate} from 'react-router-dom';
import {LayoutDashboard,BookOpen,Heart,Refrigerator,ShoppingBasket,UsersRound,UserRound,LogOut,Menu,X,Search,Leaf,ChefHat} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {isDemo} from '../api';

const nav=[
  ['/',LayoutDashboard,'Dashboard'],
  ['/pantry',Refrigerator,'Pantry'],
  ['/discover',Search,'Discover'],
  ['/favorites',Heart,'Favorites'],
  ['/shopping',ShoppingBasket,'Shopping List'],
  ['/community',UsersRound,'Community'],
  ['/profile',UserRound,'Profile'],
];
export function Brand(){return <div className="brand"><span className="brand-symbol"><ChefHat size={21}/><Leaf size={13}/></span><span><b>Cooking<br/>Nexus</b><small>Good food. Less waste.</small></span></div>}
export default function Layout(){
 const {user,logout}=useAuth();const {notify}=useToast();const [menu,setMenu]=useState(false);const [search,setSearch]=useState(''); const navigate=useNavigate();
 async function handleLogout(){try{await logout();navigate('/login');}catch(e){notify(e.message,'error');}}
 function doSearch(e){e.preventDefault();navigate(`/discover?q=${encodeURIComponent(search.trim())}`);setSearch('');}
 return <div className="app-layout">
  {menu && <div className="mobile-backdrop" onClick={()=>setMenu(false)}/>}
  <aside className={`sidebar ${menu?'sidebar-show':''}`}><div className="sidebar-top"><Brand/><button className="mobile-close icon-button" onClick={()=>setMenu(false)}><X size={21}/></button></div>
   <nav className="side-nav">{nav.map(([to,Icon,label])=><NavLink key={to} end={to==='/'} to={to} className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={()=>setMenu(false)}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-footer"><div className="sidebar-inspiration"><div>🍅 🥬 🥕</div><p>Turn your ingredients into amazing meals.</p></div><button onClick={handleLogout} className="side-link logout"><LogOut size={18}/> Sign out</button></div>
  </aside>
  <div className="app-main"><header className="app-topbar"><button className="icon-button mobile-menu" onClick={()=>setMenu(true)} aria-label="Open menu"><Menu/></button><form className="top-search" onSubmit={doSearch}><Search size={18}/><input aria-label="Search recipes" placeholder="Search recipes or ingredients..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>↵</kbd></form><div className="topbar-right">{isDemo&&<span className="demo-pill">DEMO MODE</span>}<div className="user-avatar" title={user?.display_name}>{(user?.display_name||'U').slice(0,1).toUpperCase()}</div></div></header>
   {isDemo && <div className="demo-notice"><b>Frontend preview:</b> Data is stored in this browser only; login is simulated, and cookbook search/LLM are placeholders. <a href="/profile">About demo mode</a></div>}
   <div className="page-container"><Outlet/></div><footer className="site-footer">Cooking Nexus · Team Nexus · CSI 2999 <span>Made for thoughtful cooking and less food waste.</span></footer>
  </div>
 </div>
}
