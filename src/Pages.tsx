import {useEffect,useState,ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import {useStore} from './store';
import {SPECIES,CATS,HABS,LOCS,MISSIONS,MONTHLY,progress,Species} from './data';
import Scene,{Info,RESEARCH_OBJS,Variant} from './Scene';

const Head=({t,s}:{t:string;s:string})=><div className="mb-3"><h1 className="h3 mb-1">{t}</h1><p className="opacity-75 mb-0">{s}</p></div>;
const Sim=()=><span className="badge text-bg-warning">Simulated demo data</span>;
const Slider=({l,v,min,max,step,on}:{l:string;v:number;min:number;max:number;step:number;on:(n:number)=>void})=><label className="d-block small mb-2">{l}: <b>{v}</b><input className="form-range" type="range" min={min} max={max} step={step} value={v} onChange={e=>on(+e.target.value)}/></label>;
const Sw=({l,v,on}:{l:string;v:boolean;on:(b:boolean)=>void})=><div className="form-check form-switch mb-1"><input className="form-check-input" type="checkbox" role="switch" id={l} checked={v} onChange={e=>on(e.target.checked)}/><label className="form-check-label small" htmlFor={l}>{l}</label></div>;
const InfoCard=({i,close}:{i:Info;close:()=>void})=><div className="glass ov r"><div className="d-flex justify-content-between"><h2 className="h6">{i.name}</h2><button className="btn-close" aria-label="Close" onClick={close}/></div><div className="small"><span className="badge text-bg-info me-1">{i.cat}</span>{i.hab&&<span className="badge text-bg-secondary">{i.hab}</span>}<p className="mt-2 mb-0">{i.text}</p></div></div>;

function EnvControls({go}:{go?:(v:string)=>void}){const s=useStore();
 return <div className="glass ov l"><h2 className="h6">Controls</h2>
 <button className="btn btn-sm btn-ocean mb-2 me-1" onClick={()=>s.set({anim:!s.anim})}>{s.anim?'Pause':'Resume'}</button><button className="btn btn-sm btn-outline-info mb-2" onClick={s.resetEnv}>Reset environment</button>
 <Slider l="Daylight" v={s.daylight} min={.1} max={1.5} step={.1} on={n=>s.set({daylight:n})}/><Slider l="Water clarity" v={s.clarity} min={0} max={100} step={5} on={n=>s.set({clarity:n})}/><Slider l="Particles" v={s.particles} min={0} max={2} step={.1} on={n=>s.set({particles:n})}/>
 <Sw l="Marine life" v={s.marine} on={b=>s.set({marine:b})}/><Sw l="Corals" v={s.coral} on={b=>s.set({coral:b})}/><Sw l="Labels" v={s.labels} on={b=>s.set({labels:b})}/>
 {go&&<div className="mt-2 d-flex flex-wrap gap-1">{[['reset','Reset camera'],['surface','Surface'],['reef','Reef'],['deep','Deep']].map(([k,n])=><button key={k} className="btn btn-sm btn-outline-info" onClick={()=>go(k)}>{n}</button>)}</div>}</div>}

function useView(){const [view,setV]=useState(useStore.getState().defView),[tick,setT]=useState(0);return {view,tick,go:(v:string)=>{setV(v);setT(t=>t+1)}}}

export function Explorer(){const s=useStore(),v=useView();const [i,setI]=useState<Info|null>(null);
 return <div className="stage"><Scene variant="ocean" view={v.view} tick={v.tick} onPick={n=>{setI(n);if(n?.id&&!n.id.startsWith('coral'))s.see(n.id)}}/><EnvControls go={v.go}/>{i&&<InfoCard i={i} close={()=>setI(null)}/>}</div>}

export function Reef(){const s=useStore();const [i,setI]=useState<Info|null>(null);const [st,setSt]=useState(10);
 const m=[['Water temperature (sim.)',(26+st*.06).toFixed(1)+' °C'],['Water clarity (sim.)',Math.round(90-st*.5)+' %'],['Reef condition (sim.)',Math.round(100-st*.8)+' / 100'],['Biodiversity index (sim.)',(8.5-st*.05).toFixed(1)]];
 return <div className="stage"><Scene variant="reef" stress={st} sel={i?.id?.slice(6)} view="reef" onPick={n=>{setI(n);if(n?.id?.startsWith('coral'))s.visit('reef');else if(n?.id)s.see(n.id)}}/>
 <div className="glass ov l"><h2 className="h6">Reef health <Sim/></h2><Slider l="Stress scenario (%)" v={st} min={0} max={100} step={5} on={setSt}/>{m.map(([a,b])=><div key={a} className="d-flex justify-content-between small"><span>{a}</span><b>{b}</b></div>)}
 <div className="progress my-2" role="progressbar" aria-label="Reef condition"><div className="progress-bar bg-info" style={{width:100-st*.8+'%'}}/></div><p className="small opacity-75 mb-0">Higher stress bleaches corals toward white. This is an illustration, not a validated prediction model. Click a coral to inspect it.</p></div>{i&&<InfoCard i={i} close={()=>setI(null)}/>}</div>}

const DEPTH:Record<number,string>={200:'Sunlight fades; many fish still visible.',500:'Twilight zone: very little light remains.',1000:'Mostly dark; bioluminescence becomes common.',3000:'Cold, dark water with sparse life.',6000:'Trench depths: extreme pressure, near-total darkness.'};
export function Deep(){const s=useStore();const [d,setD]=useState(200),[rov,setRov]=useState(false),[lt,setLt]=useState(true),[i,setI]=useState<Info|null>(null);
 useEffect(()=>{s.visit('deep')},[]);// eslint-disable-line
 return <div className="stage"><Scene variant="deep" depth={d} rov={rov} light={lt} view="deep" onPick={setI}/>
 <div className="glass ov l"><h2 className="h6">Depth (preset)</h2><div className="d-flex flex-wrap gap-1 mb-2">{Object.keys(DEPTH).map(k=><button key={k} className={'btn btn-sm '+(+k===d?'btn-ocean':'btn-outline-info')} onClick={()=>setD(+k)}>{(+k).toLocaleString()} m</button>)}</div>
 <p className="display-6 mb-0">{d.toLocaleString()} m</p><p className="small">{DEPTH[d]} <Sim/></p>
 <Sw l="ROV mode" v={rov} on={setRov}/><Sw l="Searchlight" v={lt} on={setLt}/><Sw l="Marine life" v={s.marine} on={b=>s.set({marine:b})}/>
 <p className="small mt-2 mb-0">ROV keys: <b>W/S</b> forward/back, <b>A/D</b> turn, <b>Q/E</b> up/down.{!rov&&' Turn on ROV mode first.'}</p></div>{i&&<InfoCard i={i} close={()=>setI(null)}/>}</div>}

export function Research(){const s=useStore();const v=useView();const [lt,setLt]=useState(true),[sub,setSub]=useState(true),[sel,setSel]=useState<string>();const [i,setI]=useState<Info|null>(null);
 const pick=(n:Info|null)=>{setI(n);setSel(n?.id);if(n)s.visit('station')};
 const pickId=(id:string)=>{const o=RESEARCH_OBJS.find(x=>x.id===id);if(o)pick({id,name:o.name,cat:'Research facility',text:`${o.text} Simulated status: ${o.status}.`})};
 return <div className="stage"><Scene variant="research" light={lt} showSub={sub} sel={sel} view="reef" tick={v.tick} onPick={pick}/>
 <div className="glass ov l"><h2 className="h6">Station controls <Sim/></h2><Sw l="Exterior lights" v={lt} on={setLt}/><Sw l="Submersible" v={sub} on={setSub}/><Sw l="Labels" v={s.labels} on={b=>s.set({labels:b})}/>
 <label className="small d-block mt-2">Module<select className="form-select form-select-sm" value={sel??''} onChange={e=>e.target.value&&pickId(e.target.value)}><option value="">Select…</option>{RESEARCH_OBJS.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
 <button className="btn btn-sm btn-outline-info mt-2" onClick={()=>v.go('reef')}>Reset camera</button>
 <hr/>{['Oxygen systems','Power systems','Water monitoring','Research vehicle','Communications'].map((n,k)=><div key={n} className="small d-flex justify-content-between"><span>{n}</span><span className={'badge '+(k===2?'text-bg-warning':'text-bg-success')}>{k===2?'Calibrating':'Nominal'}</span></div>)}</div>{i&&<InfoCard i={i} close={()=>pick(null)}/>}</div>}

export function Dashboard(){const nav=useNavigate();const s=useStore();
 const stats=[[SPECIES.length,'marine species featured'],[LOCS.length,'exploration locations'],[MISSIONS.length,'research missions'],[4,'environmental indicators']];
 return <div><div className="hero mb-3"><h1 className="display-5">Explore the Ocean. Discover the Unknown.</h1><p className="lead">Journey beneath the surface to discover marine life, explore vibrant coral ecosystems, and understand the changing health of our oceans.</p>
 <button className="btn btn-ocean me-2" onClick={()=>nav('/explorer')}>Explore Ocean</button><button className="btn btn-outline-light" onClick={()=>nav('/analytics')}>View Ocean Analytics</button></div>
 <div className="stage preview mb-3"><Scene variant="ocean" onPick={()=>{}}/></div>
 <div className="row g-3 mb-1">{stats.map(([n,l])=><div className="col-6 col-md-3" key={l}><div className="card p-3"><div className="h2 mb-0">{n}</div><div className="small">{l}</div></div></div>)}</div><p className="small opacity-75 mb-4">Statistics are counted from the app's simulated demo datasets, not live scientific measurements.</p>
 <h2 className="h4">Discover the ocean</h2><div className="row g-3 mb-4">{LOCS.map(l=><div className="col-12 col-sm-6 col-lg-4" key={l.id}><div className="card h-100 overflow-hidden"><div className="vis" style={{background:`linear-gradient(135deg,${l.c},#062C43)`}} aria-hidden>{l.emoji}</div><div className="p-3"><h3 className="h6">{l.name}</h3><p className="small">{l.desc}</p><button className="btn btn-sm btn-ocean" onClick={()=>{if(l.id==='kelp')s.set({defView:'reef'});nav(l.to)}}>Explore {l.name}</button></div></div></div>)}</div>
 <h2 className="h4">Featured marine life</h2><div className="row g-3">{SPECIES.filter(x=>['clownfish','turtle','manta'].includes(x.id)).map(x=><div className="col-md-4" key={x.id}><SpeciesCard sp={x} onOpen={()=>nav('/marine-life')}/></div>)}</div></div>}

function SpeciesCard({sp,onOpen}:{sp:Species;onOpen:()=>void}){const s=useStore();const f=s.favs.includes(sp.id);
 return <div className="card h-100"><div className="vis" style={{background:'linear-gradient(135deg,#087CA7,#062C43)'}} aria-hidden>{sp.emoji}</div><div className="p-3"><div className="d-flex justify-content-between"><h3 className="h6">{sp.name}</h3><button className="btn btn-sm" aria-pressed={f} aria-label={(f?'Remove ':'Add ')+sp.name+' favorite'} onClick={()=>s.toggleFav(sp.id)}>{f?'★':'☆'}</button></div>
 <p className="small mb-1"><i>{sp.sci}</i></p><p className="small">{sp.hab} · {sp.cat} · Status label: {sp.status}*</p><button className="btn btn-sm btn-ocean" onClick={onOpen}>Details</button></div></div>}

export function Marine(){const s=useStore(),nav=useNavigate();const [q,setQ]=useState(''),[c,setC]=useState(''),[h,setH]=useState(''),[fo,setFo]=useState(false),[open,setOpen]=useState<Species|null>(null);
 const list=SPECIES.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())&&(!c||x.cat===c)&&(!h||x.hab===h)&&(!fo||s.favs.includes(x.id))).sort((a,b)=>a.name.localeCompare(b.name));
 return <div><Head t="Marine life" s="A curated catalogue of 12 species."/><div className="row g-2 mb-3"><div className="col-md-4"><input className="form-control" aria-label="Search species" placeholder="Search by name" value={q} onChange={e=>setQ(e.target.value)}/></div>
 <div className="col-6 col-md-3"><select className="form-select" aria-label="Category" value={c} onChange={e=>setC(e.target.value)}><option value="">All categories</option>{CATS.map(x=><option key={x}>{x}</option>)}</select></div>
 <div className="col-6 col-md-3"><select className="form-select" aria-label="Habitat" value={h} onChange={e=>setH(e.target.value)}><option value="">All habitats</option>{HABS.map(x=><option key={x}>{x}</option>)}</select></div><div className="col-md-2"><Sw l="Favorites only" v={fo} on={setFo}/></div></div>
 {list.length===0?<div className="glass text-center">No species match these filters. Clear a filter to see more.</div>:<div className="row g-3">{list.map(x=><div className="col-12 col-sm-6 col-lg-3" key={x.id}><SpeciesCard sp={x} onOpen={()=>{setOpen(x);s.see(x.id)}}/></div>)}</div>}
 <p className="small opacity-75 mt-3">*Conservation status labels are curated mock catalogue data and may not match current official assessments. This app is not connected to a live database.</p>
 {open&&<div className="modalx" role="dialog" aria-modal="true" aria-label={open.name} onClick={()=>setOpen(null)}><div className="glass" onClick={e=>e.stopPropagation()}><div className="d-flex justify-content-between"><h2 className="h5">{open.emoji} {open.name}</h2><button className="btn-close" aria-label="Close" onClick={()=>setOpen(null)}/></div>
 <p><i>{open.sci}</i></p><p>{open.desc}</p><ul className="small"><li>Category: {open.cat}</li><li>Habitat: {open.hab}</li><li>Diet: {open.diet}</li><li>Size: {open.size}</li><li>Status label (mock): {open.status}</li><li>Fact: {open.fact}</li></ul><button className="btn btn-ocean" onClick={()=>nav('/explorer')}>Find in 3D Explorer</button></div></div>}</div>}

export function Analytics(){const [rng,setR]=useState(12),[hab,setH]=useState(''),[cat,setC]=useState('');
 const data=MONTHLY.slice(12-rng);const sp=SPECIES.filter(x=>(!hab||x.hab===hab)&&(!cat||x.cat===cat));
 const byCat=CATS.map(k=>({k,n:sp.filter(x=>x.cat===k).length})).filter(x=>x.n>0);const byHab=HABS.map(k=>({k,n:SPECIES.filter(x=>x.hab===k&&(!cat||x.cat===cat)).length})).filter(x=>x.n>0);
 const last=data[data.length-1],done=data.reduce((a,b)=>a+b.missions,0),COL=['#20D6C7','#087CA7','#8AF5E8','#e0733a','#7c5cff'];
 const Card=({t,children}:{t:string;children:ReactNode})=><div className="col-lg-6"><div className="card p-3"><h2 className="h6">{t}</h2><div style={{height:230}}>{children}</div></div></div>;
 return <div><Head t="Ocean analytics" s="Demonstration dashboard built on mock data. Not real-time ocean monitoring."/><Sim/>
 <div className="row g-2 my-2"><div className="col-md-3"><select className="form-select" aria-label="Time range" value={rng} onChange={e=>setR(+e.target.value)}><option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select></div>
 <div className="col-md-3"><select className="form-select" aria-label="Habitat" value={hab} onChange={e=>setH(e.target.value)}><option value="">All habitats (species charts)</option>{HABS.map(x=><option key={x}>{x}</option>)}</select></div><div className="col-md-3"><select className="form-select" aria-label="Species category" value={cat} onChange={e=>setC(e.target.value)}><option value="">All categories</option>{CATS.map(x=><option key={x}>{x}</option>)}</select></div></div>
 <div className="row g-3 mb-3">{[['Temperature (sim.)',last.temp+' °C'],['Clarity (sim.)',last.clarity+' %'],['Species tracked',sp.length],['Biodiversity (sim.)',(sp.length*.7).toFixed(1)],['Missions completed',done]].map(([a,b])=><div className="col-6 col-md" key={a}><div className="card p-3"><div className="small">{a}</div><div className="h4 mb-0">{b}</div></div></div>)}</div>
 <p className="small opacity-75">Time range applies to line and activity charts; habitat applies to the species bar chart; category applies to the species bar and habitat charts.</p>
 <div className="row g-3"><Card t="Water temperature (°C)"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeOpacity={.2}/><XAxis dataKey="m"/><YAxis domain={['auto','auto']}/><Tooltip/><Line dataKey="temp" stroke="#20D6C7" strokeWidth={2}/></LineChart></ResponsiveContainer></Card>
 <Card t="Ocean clarity (%)"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeOpacity={.2}/><XAxis dataKey="m"/><YAxis domain={[0,100]}/><Tooltip/><Line dataKey="clarity" stroke="#8AF5E8" strokeWidth={2}/></LineChart></ResponsiveContainer></Card>
 <Card t="Species by group">{byCat.length?<ResponsiveContainer><BarChart data={byCat}><XAxis dataKey="k"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="n" fill="#087CA7"/></BarChart></ResponsiveContainer>:<p>No species match this habitat and category.</p>}</Card>
 <Card t="Habitat distribution">{byHab.length?<ResponsiveContainer><PieChart><Pie data={byHab} dataKey="n" nameKey="k" innerRadius={45} outerRadius={80} label>{byHab.map((_,i)=><Cell key={i} fill={COL[i%5]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>:<p>No data for this category.</p>}</Card>
 <Card t="Research missions per month"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="m"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="missions" fill="#20D6C7"/></BarChart></ResponsiveContainer></Card></div></div>}

export function Missions(){const s=useStore();const rows=MISSIONS.map(m=>({m,p:progress(m,s.seen,s.visited)}));const done=rows.filter(r=>r.p>=r.m.target),pts=done.reduce((a,r)=>a+r.m.pts,0),nav=useNavigate();
 const badges=[['🪸','Reef Finder','reef'],['🐢','Turtle Spotter','turtle'],['🔬','Station Inspector','station'],['🌑','Deep Diver','deep'],['🏅','Surveyor','survey']];
 return <div><Head t="Missions" s="Progress comes from what you do in the 3D scenes and catalogue."/><div className="row g-3 mb-3">{[['Exploration points',pts],['Completed',`${done.length}/${MISSIONS.length}`],['Completion',Math.round(done.length/MISSIONS.length*100)+'%']].map(([a,b])=><div className="col-4" key={a}><div className="card p-3"><div className="small">{a}</div><div className="h4 mb-0">{b}</div></div></div>)}</div>
 <div className="mb-3 d-flex gap-2 flex-wrap">{badges.map(([e,n,id])=>{const ok=done.some(r=>r.m.id===id);return <span key={id} className={'badge fs-6 '+(ok?'text-bg-success':'text-bg-secondary opacity-50')} title={ok?'Earned':'Locked'}>{e} {n}</span>})}</div>
 <div className="row g-3">{rows.map(({m,p})=><div className="col-md-6" key={m.id}><div className="card p-3 h-100"><div className="d-flex justify-content-between"><h2 className="h6">{m.title}</h2><span className="badge text-bg-info">{m.diff} · {m.pts} pts</span></div><p className="small">{m.desc}</p><div className="progress mb-2" role="progressbar" aria-label={m.title}><div className="progress-bar bg-success" style={{width:p/m.target*100+'%'}}/></div>
 <div className="d-flex justify-content-between small"><span>{p>=m.target?'Completed':`${p}/${m.target}`}</span><button className="btn btn-sm btn-ocean" onClick={()=>nav(m.to)}>{p>0&&p<m.target?'Continue':p>=m.target?'Revisit':'Start'}</button></div></div></div>)}</div>
 <button className="btn btn-outline-danger mt-3" onClick={()=>{if(window.confirm('Reset all mission progress?'))s.resetMissions()}}>Reset progress</button></div>}

export function Settings(){const s=useStore();const ex=()=>{const b=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),seen:s.seen,visited:s.visited,favorites:s.favs,missions:MISSIONS.map(m=>({id:m.id,progress:progress(m,s.seen,s.visited),target:m.target}))},null,2)],{type:'application/json'});const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='oceanverse-progress.json';a.click();URL.revokeObjectURL(u)};
 const cf=(m:string,f:()=>void)=>()=>{if(window.confirm(m))f()};
 return <div style={{maxWidth:640}}><Head t="Settings" s="Saved in this browser."/><div className="card p-3 mb-3"><h2 className="h6">Appearance</h2><select className="form-select mb-2" aria-label="Theme" value={s.theme} onChange={e=>s.set({theme:e.target.value as 'dark'|'light'})}><option value="dark">Dark</option><option value="light">Light</option></select></div>
 <div className="card p-3 mb-3"><h2 className="h6">Exploration</h2><label className="small">Default camera view<select className="form-select mb-2" value={s.defView} onChange={e=>s.set({defView:e.target.value})}><option value="reset">Default</option><option value="surface">Surface</option><option value="reef">Reef</option><option value="deep">Deep</option></select></label>
 <Sw l="Animation enabled" v={s.anim} on={b=>s.set({anim:b})}/><Sw l="Show object labels" v={s.labels} on={b=>s.set({labels:b})}/><Slider l="Default particle density" v={s.defParticles} min={0} max={2} step={.1} on={n=>s.set({defParticles:n,particles:n})}/></div>
 <div className="card p-3 mb-3"><h2 className="h6">Accessibility</h2><Sw l="Reduce motion" v={s.reduce} on={b=>s.set({reduce:b})}/></div>
 <div className="card p-3"><h2 className="h6">Data</h2><div className="d-flex flex-wrap gap-2"><button className="btn btn-ocean" onClick={ex}>Export progress (JSON)</button><button className="btn btn-outline-danger" onClick={cf('Reset mission progress?',s.resetMissions)}>Reset missions</button><button className="btn btn-outline-danger" onClick={cf('Clear saved favorites?',s.clearFavs)}>Clear favorites</button><button className="btn btn-outline-danger" onClick={cf('Reset all preferences?',s.resetPrefs)}>Reset preferences</button></div></div></div>}
export type {Variant};
