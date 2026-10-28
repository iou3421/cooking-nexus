import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {api} from '../api';

const Context=createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null);
  const [initializing,setInitializing]=useState(true);
  useEffect(()=>{
    let active=true;
    api.auth.me().then(u=>{if(active)setUser(u);}).catch(()=>{if(active)setUser(null);}).finally(()=>{if(active)setInitializing(false);});
    const reject=()=>setUser(null);
    window.addEventListener('cn:unauthorized',reject);
    return ()=>{active=false;window.removeEventListener('cn:unauthorized',reject);};
  },[]);
  const value=useMemo(()=>({
    user, initializing,
    login: async (credentials)=>{const u=await api.auth.login(credentials);setUser(u);return u;},
    register: async (credentials)=>{const u=await api.auth.register(credentials);setUser(u);return u;},
    logout: async ()=>{try{await api.auth.logout();}finally{setUser(null);}},
    updateProfile: async (values)=>{const u=await api.auth.updateMe(values);setUser(u);return u;},
  }),[user,initializing]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const x=useContext(Context); if(!x)throw new Error('useAuth requires AuthProvider');return x;}
