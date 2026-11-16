import 'react-native-url-polyfill/auto';
import {AppState} from 'react-native';
import Storage from '@react-native-async-storage/async-storage';
import {createClient,processLock} from '@supabase/supabase-js';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL,key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configured=Boolean(url&&key);
export const supabase=configured?createClient(url,key,{auth:{storage:Storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock}}):null;
export function watchAppState(refresh){const sub=AppState.addEventListener('change',state=>{if(state==='active'){supabase.auth.startAutoRefresh();refresh()}else supabase.auth.stopAutoRefresh()});supabase.auth.startAutoRefresh();return()=>{sub.remove();supabase.auth.stopAutoRefresh()}}
export async function rpc(name,params={}){const {data,error}=await supabase.rpc(name,params);if(error)throw error;return data}
export function message(e){if(e?.code==='23P01')return 'Esse horário acabou de ser reservado. Escolha outro.';if(e?.message?.includes('Invalid login'))return 'E-mail ou senha incorretos.';if(e?.message?.includes('Email not confirmed'))return 'Confirme seu e-mail antes de entrar.';return e?.message||'Falha de conexão. Verifique a internet e tente novamente.'}
