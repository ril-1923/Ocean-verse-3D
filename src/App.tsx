import {Component,ReactNode,useEffect} from 'react';
import {HashRouter,NavLink,Route,Routes} from 'react-router-dom';
import {Waves} from 'lucide-react';
import {useStore} from './store';
import {Dashboard,Explorer,Marine,Reef,Deep,Research,Analytics,Missions,Settings} from './Pages';
const NAV=[['/','Dashboard'],['/explorer','Ocean Explorer'],['/marine-life','Marine Life'],['/coral-reef','Coral Reef'],['/deep-ocean','Deep Ocean'],['/research','Research Stations'],['/analytics','Ocean Analytics'],['/missions','Missions'],['/settings','Settings']];
class EB extends Component<{children:ReactNode},{e:boolean}>{state={e:false};static getDerivedStateFromError(){return {e:true}}render(){return this.state.e?<div className="glass">Something went wrong in this section. Reload the page to try again.</div>:this.props.children}}
export default function App(){const {theme,reduce}=useStore();
 useEffect(()=>{document.documentElement.setAttribute('data-bs-theme',theme);document.documentElement.setAttribute('data-reduce',String(reduce))},[theme,reduce]);
 return <HashRouter><div className="app"><nav className="side" aria-label="Main"><div className="brand"><Waves color="#20D6C7"/>OceanVerse 3D</div>{NAV.map(([to,n])=><NavLink key={to} to={to} end>{n}</NavLink>)}<p className="small opacity-50 mt-3 d-none d-md-block">Discover the Hidden Wonders of Our Ocean.</p></nav>
 <main><EB><Routes><Route path="/" element={<Dashboard/>}/><Route path="/explorer" element={<Explorer/>}/><Route path="/marine-life" element={<Marine/>}/><Route path="/coral-reef" element={<Reef/>}/><Route path="/deep-ocean" element={<Deep/>}/><Route path="/research" element={<Research/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/missions" element={<Missions/>}/><Route path="/settings" element={<Settings/>}/></Routes></EB></main></div></HashRouter>}
