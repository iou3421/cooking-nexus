import React,{useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {ChefHat,Leaf,Refrigerator,BookOpen,Heart,ArrowRight,LockKeyhole,AlertCircle} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {isDemo} from '../api';
import {Brand} from '../components/Layout';
import {Button,Field} from '../components/UI';

export default function LoginPage(){
 const {login,register}=useAuth();const {notify}=useToast();const navigate=useNavigate();const location=useLocation();
 const [mode,setMode]=useState('login');const [form,setForm]=useState({email:'',password:'',display_name:''});const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function submit(e){e.preventDefault();setError('');if(!form.email.includes('@'))return setError('Enter a valid email.');if(form.password.length<8)return setError('Please use at least 8 characters for your password.');if(mode==='register'&&!form.display_name.trim())return setError('Enter a display name.');
   setBusy(true);try{await (mode==='login'?login({email:form.email,password:form.password}):register(form));navigate(location.state?.from||'/',{replace:true});notify(mode==='login'?'Welcome back!':'Account created. Welcome!');}catch(e){setError(e.message);}finally{setBusy(false);}}
 function useDemo(){setForm({email:'demo@cookingnexus.local',password:'demo-password',display_name:'Demo Cook'});setError('');}
 return <div className="auth-screen"><section className="auth-hero"><Brand/><div className="auth-hero-center"><div className="hero-kicker"><Leaf size={17}/> COOK SMARTER, WASTE LESS</div><h1>Good food starts with what you <em>already have.</em></h1><p>A thoughtful place to manage your pantry, discover recipes, and share the meals you love.</p><div className="hero-features"><div><Refrigerator/><span>Track your pantry</span></div><div><BookOpen/><span>Discover recipes</span></div><div><Heart/><span>Share what you cook</span></div></div><div className="auth-image"><img src="/images/pasta.jpg" alt="A pasta dish with vegetables"/><div className="auth-image-badge"><ChefHat size={20}/><strong>Less waste.<br/>More delicious.</strong></div></div></div><span className="hero-watermark">Cooking Nexus · Team Nexus</span></section>
 <section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand/></div><div className="eyebrow">YOUR KITCHEN COMPANION</div><h2>{mode==='login'?'Welcome back!':'Join Cooking Nexus'}</h2><p className="auth-subtitle">{mode==='login'?'Sign in to organize your ingredients and find something great to cook.':'Create an account to start building your pantry.'}</p>
 <form onSubmit={submit} className="auth-form">{mode==='register'&&<Field label="Display name"><input required maxLength={50} value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} placeholder="Your name"/></Field>}<Field label="Email address"><input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></Field><Field label="Password"><input type="password" minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters" required/></Field>
 {error&&<div className="form-alert" role="alert"><AlertCircle size={17}/>{error}</div>}<Button type="submit" className="w-full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}<ArrowRight size={17}/></Button></form>
 <p className="auth-switch">{mode==='login'?"Don't have an account?":'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'register':'login');setError('');}}>{mode==='login'?'Create one':'Sign in'}</button></p>
 {isDemo&&<div className="auth-demo"><div><LockKeyhole size={18}/><strong>Frontend demonstration</strong></div><p>Sign-in is simulated in demo mode. No password is stored or verified. Real authentication will come from FastAPI.</p><Button variant="outline" onClick={useDemo}>Fill demo credentials</Button></div>}
 </div></section></div>;
}
