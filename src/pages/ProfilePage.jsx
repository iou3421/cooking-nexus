import React,{useState} from 'react';
import {UserRound,ShieldCheck,Leaf,Info,RefreshCcw} from 'lucide-react';
import {api,isDemo,resetDemo} from '../api';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {PageHead,Panel,Button,Field} from '../components/UI';

const prefs=['Vegetarian','Vegan','Gluten-free','Dairy-free'];
export default function ProfilePage(){
 const {user,updateProfile}=useAuth();const {notify}=useToast();const [name,setName]=useState(user?.display_name||'');const [selected,setSelected]=useState(user?.dietary_preferences||[]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function save(e){e.preventDefault();if(!name.trim())return setError('A display name is required.');setBusy(true);setError('');try{await updateProfile({display_name:name.trim(),dietary_preferences:selected});notify('Profile saved.');}catch(e){setError(e.message);}finally{setBusy(false);}}
 function reset(){if(confirm('This erases all Cooking Nexus demo data in this browser. Continue?')){resetDemo();location.reload();}}
 return <><PageHead eyebrow="ACCOUNT SETTINGS" title="My profile" subtitle="Manage your account details and cooking preferences."/>
 <div className="profile-layout"><Panel className="profile-card"><div className="profile-large-avatar">{(user?.display_name||'U').slice(0,1).toUpperCase()}</div><h2>{user?.display_name}</h2><p>{user?.email}</p><div className="profile-note"><UserRound size={19}/> Personal pantry and shopping lists stay private to your account in the real backend.</div></Panel>
 <Panel className="profile-settings"><h2>Personal information</h2><p className="muted">These preferences will help you filter recipe discovery results.</p><form onSubmit={save} className="form-stack"><Field label="Display name"><input maxLength={50} value={name} onChange={e=>setName(e.target.value)}/></Field><Field label="Email address"><input type="email" disabled value={user?.email||''}/></Field><div className="preferences"><b>Dietary preferences</b><p>Choose whichever apply. They are filters only, not allergy-safety assurances.</p><div className="filter-chips">{prefs.map(p=><button type="button" aria-pressed={selected.includes(p)} className={`filter-chip ${selected.includes(p)?'checked':''}`} key={p} onClick={()=>setSelected(old=>old.includes(p)?old.filter(x=>x!==p):[...old,p])}>{selected.includes(p)?'✓ ':''}{p}</button>)}</div></div>{error&&<div className="form-alert">{error}</div>}<div><Button type="submit" disabled={busy}>{busy?'Saving…':'Save changes'}</Button></div></form></Panel></div>
 <Panel className="security-explanation"><div><ShieldCheck size={24}/><h3>Security architecture</h3></div><p><b>When FastAPI is connected:</b> passwords are hashed by the server, a signed JWT is stored in an HttpOnly cookie, and FastAPI checks ownership for private pantry, shopping, favorites, drafts, and edits. React does not decide authorization.</p><p><b>Current frontend:</b> {isDemo?'Demonstration mode has no real authentication or access control. Do not use real private information.':'Connected HTTP mode delegates auth and access control to FastAPI.'}</p>{isDemo&&<Button variant="outline" onClick={reset}><RefreshCcw size={17}/> Reset demo data</Button>}</Panel>
 </>;
}
