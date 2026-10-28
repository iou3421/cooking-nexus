import React, {createContext,useContext,useMemo,useState} from 'react';
import {CheckCircle2, AlertCircle, X} from 'lucide-react';
const Context=createContext(null);
export function ToastProvider({children}){
  const [toast,setToast]=useState(null);
  const notify=(message,type='success')=>setToast({id:Date.now(),message,type});
  const value=useMemo(()=>({notify}),[]);
  return <Context.Provider value={value}>{children}{toast && <div className={`toast ${toast.type}`} role="status">
    {toast.type==='error'?<AlertCircle size={19}/>:<CheckCircle2 size={19}/>}<span>{toast.message}</span>
    <button aria-label="Dismiss message" onClick={()=>setToast(null)}><X size={16}/></button>
  </div>}</Context.Provider>;
}
export const useToast=()=>useContext(Context);
