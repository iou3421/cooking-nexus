import React, {useEffect} from 'react';
import {AlertCircle, CheckCircle2, Clock3, X, PackageOpen, LoaderCircle, Leaf, ArrowRight} from 'lucide-react';

export function Panel({children,className='',...props}) {return <section className={`panel ${className}`} {...props}>{children}</section>;}
export function PageHead({eyebrow,title,subtitle,action}){return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;}
export function Button({children,variant='primary',className='',type='button',...props}){return <button type={type} className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;}
export function Status({date}){
  const today = new Date();today.setHours(0,0,0,0);
  const days = date ? Math.round((new Date(`${date}T00:00:00`)-today)/86400000) : null;
  const tone = days===null?'neutral':days<0?'danger':days<=3?'warning':'success';
  const label=days===null?'Not tracked':days<0?'Expired':days<=3?'Expiring soon':'Normal';
  return <span className={`status status-${tone}`}>{tone==='success'?<CheckCircle2 size={13}/>:tone==='neutral'?<PackageOpen size={13}/>:<AlertCircle size={13}/>} {label}</span>;
}
export function Tag({children,tone='soft'}){return <span className={`tag tag-${tone}`}>{children}</span>;}
export function Field({label,hint,children}){return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;}
export function EmptyState({title='Nothing here yet',description,action,icon:Icon=PackageOpen}) {return <div className="empty-state"><div className="empty-illustration"><Icon size={28}/></div><h3>{title}</h3><p>{description}</p>{action}</div>;}
export function Loading({label='Loading…'}){return <div className="centered loading"><LoaderCircle size={25} className="spin"/><span>{label}</span></div>;}
export function ErrorState({message,onRetry}){return <div className="error-state" role="alert"><AlertCircle/><span>{message}</span>{onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}</div>;}
export function Modal({title,children,onClose,wide=false}){
  useEffect(()=>{const key=e=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);
  return <div className="modal-overlay" onMouseDown={onClose} role="presentation"><section className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()}><header className="modal-title"><h2>{title}</h2><button aria-label="Close" className="icon-button" onClick={onClose}><X size={19}/></button></header>{children}</section></div>;
}
export function Divider(){return <div className="divider"/>;}
export function FeaturePreview({title,description,icon:Icon=Leaf}) {return <Panel className="feature-preview"><Icon size={30}/><h3>{title}</h3><p>{description}</p><span>Future update <ArrowRight size={15}/></span></Panel>;}
