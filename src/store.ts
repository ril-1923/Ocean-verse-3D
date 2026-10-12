import {create} from 'zustand';import {persist} from 'zustand/middleware';
const PREFS={theme:'dark' as 'dark'|'light',reduce:false,labels:false,defView:'reset',defParticles:1};
const ENV={anim:true,particles:1,clarity:70,daylight:1,marine:true,coral:true};
const DEF={...PREFS,...ENV,favs:[] as string[],seen:[] as string[],visited:[] as string[]};
type D=typeof DEF;
interface S extends D{set:(p:Partial<D>)=>void;toggleFav:(id:string)=>void;see:(id:string)=>void;visit:(k:string)=>void;resetEnv:()=>void;resetMissions:()=>void;resetPrefs:()=>void;clearFavs:()=>void}
export const useStore=create<S>()(persist((set,get)=>({...DEF,
 set:p=>set(p),
 toggleFav:id=>set(s=>({favs:s.favs.includes(id)?s.favs.filter(x=>x!==id):[...s.favs,id]})),
 see:id=>{if(!get().seen.includes(id))set(s=>({seen:[...s.seen,id]}))},
 visit:k=>{if(!get().visited.includes(k))set(s=>({visited:[...s.visited,k]}))},
 resetEnv:()=>set({...ENV,particles:get().defParticles}),
 resetMissions:()=>set({seen:[],visited:[]}),clearFavs:()=>set({favs:[]}),
 resetPrefs:()=>set({...PREFS,...ENV})}),{name:'oceanverse-v1'}));
export const moving=()=>{const s=useStore.getState();return s.anim&&!s.reduce};
