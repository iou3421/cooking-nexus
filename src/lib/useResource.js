import {useCallback,useEffect,useState} from 'react';
import {getErrorMessage} from './utils';

// Fetch lifecycle that works with either the mock or real API.
export function useResource(loader, dependencies=[]) {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const reload=useCallback(async()=>{
    setLoading(true);setError('');
    try {const result=await loader();setData(result);return result;}
    catch(e){setError(getErrorMessage(e));return null;}
    finally{setLoading(false);}
  },dependencies);
  useEffect(()=>{reload();},[reload]);
  return {data,loading,error,reload,setData};
}
