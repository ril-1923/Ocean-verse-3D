import {Component,useEffect,useLayoutEffect,useMemo,useRef,ReactNode,ElementRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,Html} from '@react-three/drei';
import * as THREE from 'three';
import {useStore,moving} from './store';
import {SPECIES} from './data';

export type Variant='ocean'|'reef'|'deep'|'research';
export interface Info{id?:string;name:string;cat:string;text:string;hab?:string}
export interface SceneProps{variant:Variant;view?:string;tick?:number;stress?:number;depth?:number;rov?:boolean;light?:boolean;showSub?:boolean;sel?:string;onPick:(i:Info|null)=>void}
const VIEWS:Record<string,[number[],number[]]>={reset:[[0,4,16],[0,1,0]],surface:[[0,8,12],[0,6,0]],reef:[[5,0,8],[0,-1,0]],deep:[[0,-1,13],[0,-2,0]]};
const rnd=(i:number)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const hf=(x:number,z:number)=>Math.sin(x*.2)*Math.cos(-z*.17)*1.2+Math.sin(x*.5-z*.4)*.3;
const ground=(x:number,z:number)=>-2+hf(x,z);
const sp=(id:string):Info=>{const s=SPECIES.find(x=>x.id===id)!;return {id,name:s.name,cat:s.cat,hab:s.hab,text:`${s.fact} Status label: ${s.status} (mock data).`}};

function Terrain({color,rough}:{color:string;rough:number}){
 const g=useMemo(()=>{const p=new THREE.PlaneGeometry(90,90,70,70);const a=p.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);a.setZ(i,hf(x,-y)*rough+(Math.hypot(x,y)>25?(Math.hypot(x,y)-25)*.25:0))}p.computeVertexNormals();return p},[rough]);
 return <mesh geometry={g} rotation-x={-Math.PI/2} position-y={-2}><meshStandardMaterial color={color} flatShading/></mesh>}

function Mover({r,speed,y,phase=0,children}:{r:number;speed:number;y:number;phase?:number;children:ReactNode}){
 const g=useRef<THREE.Group>(null),a=useRef(phase);
 useFrame((_,d)=>{if(!moving()||!g.current)return;a.current+=d*speed;const t=a.current;g.current.position.set(Math.cos(t)*r,y+Math.sin(t*2)*.2,Math.sin(t)*r*.7);g.current.rotation.y=Math.atan2(-.7*Math.cos(t),-Math.sin(t))+(speed<0?Math.PI:0)});
 return <group ref={g} position={[Math.cos(phase)*r,y,Math.sin(phase)*r*.7]}>{children}</group>}

function Label({text}:{text:string}){const on=useStore(s=>s.labels);return on?<Html center distanceFactor={12} position={[0,.9,0]} style={{pointerEvents:'none'}}><span className="badge bg-dark opacity-75">{text}</span></Html>:null}
const Mat=({c,e=0}:{c:string;e?:number})=><meshStandardMaterial color={c} roughness={.55} emissive={c} emissiveIntensity={e}/>;

function Fish({color,stripe,s=1,info,onPick,r,speed,y,phase}:{color:string;stripe?:string;s?:number;info:Info;onPick:SceneProps['onPick'];r:number;speed:number;y:number;phase?:number}){
 const t=useRef<THREE.Group>(null);useFrame(({clock})=>{if(moving()&&t.current)t.current.rotation.y=Math.sin(clock.elapsedTime*10)*.5});
 return <Mover r={r} speed={speed} y={y} phase={phase}><group scale={s} onClick={e=>{e.stopPropagation();onPick(info)}}>
  <mesh scale={[1,.62,.34]}><sphereGeometry args={[.5,16,12]}/><Mat c={color}/></mesh>
  {stripe&&<mesh position={[.15,0,0]} scale={[.12,.64,.36]}><sphereGeometry args={[.5,12,10]}/><Mat c={stripe}/></mesh>}
  <mesh position={[0,.3,0]} rotation-z={-.3} scale={[1,1,.2]}><coneGeometry args={[.2,.4,4]}/><Mat c={color}/></mesh>
  <mesh position={[.3,0,0]} scale={[1,1,.6]}><sphereGeometry args={[.05,8,8]}/><meshBasicMaterial color="#000"/></mesh>
  <group ref={t} position={[-.45,0,0]}><mesh position={[-.18,0,0]} rotation-z={Math.PI/2} scale={[1,1,.25]}><coneGeometry args={[.28,.4,4]}/><Mat c={stripe??color}/></mesh></group>
  <Label text={info.name}/></group></Mover>}

function Turtle({info,onPick,r,speed,y,phase}:{info:Info;onPick:SceneProps['onPick'];r:number;speed:number;y:number;phase?:number}){
 const f=useRef<THREE.Group>(null);useFrame(({clock})=>{if(moving()&&f.current)f.current.children.forEach((c,i)=>{c.rotation.x=Math.sin(clock.elapsedTime*2+i)*.4*(i%2?1:-1)})});
 return <Mover r={r} speed={speed} y={y} phase={phase}><group scale={1.4} onClick={e=>{e.stopPropagation();onPick(info)}}>
  <mesh scale={[1,.45,.8]}><sphereGeometry args={[.5,16,10,0,Math.PI*2,0,Math.PI]}/><Mat c="#4d7a3a"/></mesh>
  <mesh position={[.55,.05,0]}><sphereGeometry args={[.16,10,8]}/><Mat c="#8aa65a"/></mesh>
  <group ref={f}>{[[.25,.45],[.25,-.45],[-.25,.4],[-.25,-.4]].map(([x,z],i)=><mesh key={i} position={[x,-.05,z]} scale={[.5,.08,.9]}><sphereGeometry args={[.25,8,6]}/><Mat c="#8aa65a"/></mesh>)}</group>
  <Label text={info.name}/></group></Mover>}

function Ray({info,onPick,r,speed,y,phase}:{info:Info;onPick:SceneProps['onPick'];r:number;speed:number;y:number;phase?:number}){
 const w=useRef<THREE.Group>(null);useFrame(({clock})=>{if(moving()&&w.current)w.current.rotation.x=Math.sin(clock.elapsedTime*2)*.12});
 return <Mover r={r} speed={speed} y={y} phase={phase}><group ref={w} scale={1.8} onClick={e=>{e.stopPropagation();onPick(info)}}>
  <mesh scale={[.9,.1,1.6]} rotation-y={Math.PI/4}><boxGeometry args={[.7,1,.7]}/><Mat c="#26303d"/></mesh>
  <mesh position={[-.8,0,0]} rotation-z={Math.PI/2}><cylinderGeometry args={[.015,.04,1.2,5]}/><Mat c="#26303d"/></mesh>
  <Label text={info.name}/></group></Mover>}

function School({n,color,hy}:{n:number;color:string;hy:number}){
 const m=useRef<THREE.InstancedMesh>(null),t=useRef(0),d=useMemo(()=>new THREE.Object3D(),[]);
 const geo=useMemo(()=>new THREE.ConeGeometry(.1,.4,5).rotateZ(-Math.PI/2),[]);
 const o=useMemo(()=>Array.from({length:n},(_,i)=>({r:rnd(i)*2+.4,h:rnd(i+9)*2-1,p:rnd(i+3)*6.28,s:.7+rnd(i+5)*.8})),[n]);
 useFrame((_,dt)=>{if(!m.current)return;if(moving())t.current+=dt;const T=t.current,cx=Math.cos(T*.2)*7,cz=Math.sin(T*.2)*5;
  o.forEach((f,i)=>{const p=T*f.s*.9+f.p;d.position.set(cx+Math.cos(p)*f.r,hy+f.h+Math.sin(T*2+f.p)*.15,cz+Math.sin(p)*f.r);d.rotation.y=Math.atan2(-Math.cos(p),-Math.sin(p));d.updateMatrix();m.current!.setMatrixAt(i,d.matrix)});m.current.instanceMatrix.needsUpdate=true});
 return <instancedMesh ref={m} args={[geo,undefined,n]} frustumCulled={false}><meshStandardMaterial color={color}/></instancedMesh>}

function Particles({density,color}:{density:number;color:string}){
 const n=Math.round(400*density),m=useRef<THREE.InstancedMesh>(null),g=useRef<THREE.Group>(null);
 useLayoutEffect(()=>{if(!m.current)return;const d=new THREE.Object3D();for(let i=0;i<n;i++){d.position.set((rnd(i)-.5)*50,rnd(i+1)*14-2,(rnd(i+2)-.5)*50);d.scale.setScalar(.03+rnd(i+3)*.05);d.updateMatrix();m.current.setMatrixAt(i,d.matrix)}m.current.instanceMatrix.needsUpdate=true},[n]);
 useFrame((_,dt)=>{if(moving()&&g.current){g.current.rotation.y+=dt*.01;g.current.position.y=Math.sin(performance.now()/3000)*.3}});
 return <group ref={g}><instancedMesh key={n} ref={m} args={[undefined,undefined,Math.max(n,1)]} count={n}><sphereGeometry args={[1,5,5]}/><meshBasicMaterial color={color} transparent opacity={.55}/></instancedMesh></group>}

type CT='branch'|'brain'|'fan'|'tube';
const CORAL:Record<CT,Info>={branch:{name:'Branching coral',cat:'Coral',hab:'Shallow reef',text:'Ecological role: nursery shelter for small fish. Threats: warming water, bleaching, storms. Conservation: reduce emissions, protect reefs, limit pollution.'},
brain:{name:'Brain coral',cat:'Coral',hab:'Reef slopes',text:'Ecological role: slow-growing reef builder. Threats: disease, ocean acidification, bleaching. Conservation: marine protected areas.'},
fan:{name:'Sea fan',cat:'Soft coral',hab:'Reef walls',text:'Ecological role: filter feeder that adds structure. Threats: damage by anchors and nets. Conservation: responsible diving, anchoring rules.'},
tube:{name:'Anemone / tube coral',cat:'Reef invertebrate',hab:'Reef crevices',text:'Ecological role: shelter and food source for reef animals. Threats: pollution, collection, heat stress. Conservation: stricter trade controls.'}};
function Corals({n,stress,onPick,sel}:{n:number;stress:number;onPick:SceneProps['onPick'];sel?:string}){
 const items=useMemo(()=>Array.from({length:n},(_,i)=>{const x=(rnd(i)-.5)*30,z=(rnd(i+50)-.5)*22-2;return {x,z,y:ground(x,z),t:(['branch','brain','fan','tube'] as CT[])[i%4],c:['#ff6f61','#ffb347','#d65db1','#7c5cff','#ff8fab','#f9d71c'][Math.floor(rnd(i+7)*6)],s:.6+rnd(i+11)*.9,rot:rnd(i)*6}}),[n]);
 const w=new THREE.Color('#f2efe6');
 return <group>{items.map((c,i)=>{const col=new THREE.Color(c.c).lerp(w,stress/100*.9);const hi=sel===String(i);
  return <group key={i} position={[c.x,c.y,c.z]} scale={c.s} rotation-y={c.rot} onClick={e=>{e.stopPropagation();onPick({...CORAL[c.t],id:'coral-'+i})}}>
  {c.t==='branch'&&[0,1,2,3].map(k=><mesh key={k} position={[(k-1.5)*.18,.35,0]} rotation-z={(k-1.5)*.25}><cylinderGeometry args={[.05,.09,.8+k%2*.3,6]}/><meshStandardMaterial color={col} emissive={col} emissiveIntensity={hi?.6:0}/></mesh>)}
  {c.t==='brain'&&<mesh position-y={.2} scale={[1,.6,1]}><icosahedronGeometry args={[.45,1]}/><meshStandardMaterial color={col} flatShading/></mesh>}
  {c.t==='fan'&&<mesh position-y={.55} scale={[1,1.2,.08]}><circleGeometry args={[.5,10]}/><meshStandardMaterial color={col} side={THREE.DoubleSide}/></mesh>}
  {c.t==='tube'&&[0,1,2,3,4].map(k=><mesh key={k} position={[Math.cos(k*1.3)*.2,.2,Math.sin(k*1.3)*.2]} rotation-z={Math.cos(k)*.4}><coneGeometry args={[.07,.6,6]}/><meshStandardMaterial color={col}/></mesh>)}
  </group>})}</group>}

function Kelp({n,height}:{n:number;height:number}){
 const g=useRef<THREE.Group>(null);const it=useMemo(()=>Array.from({length:n},(_,i)=>{const x=(rnd(i+200)-.5)*36,z=(rnd(i+300)-.5)*26-3;return {x,z,y:ground(x,z),h:height*(.6+rnd(i)*.8)}}),[n,height]);
 useFrame(({clock})=>{if(!moving()||!g.current)return;g.current.children.forEach((c,i)=>{c.rotation.z=Math.sin(clock.elapsedTime*.9+i)*.12;c.rotation.x=Math.cos(clock.elapsedTime*.7+i)*.08})});
 return <group ref={g}>{it.map((k,i)=><group key={i} position={[k.x,k.y,k.z]}><mesh position-y={k.h/2}><cylinderGeometry args={[.02,.07,k.h,5]}/><meshStandardMaterial color="#2f9e5b"/></mesh></group>)}</group>}

function Rocks({n,scale,color}:{n:number;scale:number;color:string}){
 const it=useMemo(()=>Array.from({length:n},(_,i)=>{const x=(rnd(i+400)-.5)*40,z=(rnd(i+500)-.5)*30-4;return {x,z,y:ground(x,z),s:(.4+rnd(i)*1.2)*scale,k:.5+rnd(i+1)}}),[n,scale]);
 return <group>{it.map((r,i)=><mesh key={i} position={[r.x,r.y+r.s*.3,r.z]} scale={[r.s,r.s*r.k*(scale>1?3:1),r.s]} rotation-y={i}><icosahedronGeometry args={[.8,0]}/><meshStandardMaterial color={color} flatShading/></mesh>)}</group>}

function Jelly({x,z,p,color}:{x:number;z:number;p:number;color:string}){
 const g=useRef<THREE.Group>(null);useFrame(({clock})=>{if(!moving()||!g.current)return;const t=clock.elapsedTime+p;g.current.position.y=1+Math.sin(t*.6)*1.2;g.current.scale.set(1,1+Math.sin(t*2)*.12,1)});
 return <group ref={g} position={[x,1,z]}><mesh><sphereGeometry args={[.4,14,10,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={.75}/></mesh>
 {[0,1,2,3].map(k=><mesh key={k} position={[Math.cos(k*1.6)*.2,-.35,Math.sin(k*1.6)*.2]}><cylinderGeometry args={[.01,.01,.6,4]}/><meshBasicMaterial color={color}/></mesh>)}<pointLight color={color} intensity={1.5} distance={5}/></group>}

function Angler({info,onPick,r,speed,y,phase}:{info:Info;onPick:SceneProps['onPick'];r:number;speed:number;y:number;phase?:number}){
 return <Mover r={r} speed={speed} y={y} phase={phase}><group onClick={e=>{e.stopPropagation();onPick(info)}}>
  <mesh scale={[1,.8,.8]}><sphereGeometry args={[.5,12,10]}/><Mat c="#3a2418"/></mesh>
  <mesh position={[.45,.25,0]} rotation-z={.9}><cylinderGeometry args={[.01,.01,.5,4]}/><Mat c="#222"/></mesh>
  <mesh position={[.7,.5,0]}><sphereGeometry args={[.08,8,8]}/><meshBasicMaterial color="#ffe66b"/></mesh><pointLight position={[.7,.5,0]} color="#ffe66b" intensity={2} distance={6}/>
  <mesh position={[-.55,0,0]} rotation-z={Math.PI/2} scale={[1,1,.3]}><coneGeometry args={[.3,.4,4]}/><Mat c="#3a2418"/></mesh></group></Mover>}

function ROV({on,light}:{on:boolean;light:boolean}){
 const g=useRef<THREE.Group>(null),k=useRef(new Set<string>());
 useEffect(()=>{if(!on)return;const dn=(e:KeyboardEvent)=>{const t=e.target as HTMLElement;if(/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;k.current.add(e.key.toLowerCase())},up=(e:KeyboardEvent)=>{k.current.delete(e.key.toLowerCase())};
  window.addEventListener('keydown',dn);window.addEventListener('keyup',up);const set=k.current;return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);set.clear()}},[on]);
 useFrame((_,d)=>{const o=g.current;if(!o||!on)return;const K=k.current;if(K.has('a'))o.rotation.y+=d*1.5;if(K.has('d'))o.rotation.y-=d*1.5;o.translateX(((K.has('w')?1:0)-(K.has('s')?1:0))*d*4);if(K.has('q'))o.position.y+=d*2;if(K.has('e'))o.position.y-=d*2;o.position.y=Math.max(o.position.y,ground(o.position.x,o.position.z)+.5)});
 return <group ref={g} position={[-3,0,4]}><mesh><boxGeometry args={[.9,.4,.6]}/><Mat c="#e8b020"/></mesh><mesh position={[0,.28,0]}><boxGeometry args={[.5,.15,.4]}/><Mat c="#333"/></mesh>
  {[-.3,.3].map(z=><mesh key={z} position={[-.4,0,z]} rotation-z={Math.PI/2}><cylinderGeometry args={[.1,.1,.2,8]}/><Mat c="#444"/></mesh>)}
  <mesh position={[.5,0,0]}><sphereGeometry args={[.1,8,8]}/><meshBasicMaterial color={light?'#ffffff':'#333'}/></mesh><pointLight position={[1.2,0,0]} intensity={light?40:0} distance={18} color="#dff4ff"/></group>}

function Station({light,showSub,sel,onPick}:{light:boolean;showSub:boolean;sel?:string;onPick:SceneProps['onPick']}){
 const O=(id:string)=>(e:{stopPropagation:()=>void})=>{e.stopPropagation();const o=RESEARCH_OBJS.find(x=>x.id===id)!;onPick({id,name:o.name,cat:'Research facility',text:`${o.text} Simulated status: ${o.status}.`})};
 const em=(id:string)=>sel===id?.7:.05;
 return <group position={[0,-1.2,0]}>
  <mesh position-y={-.25} onClick={O('dock')}><boxGeometry args={[6,.2,3]}/><Mat c="#4a5b66"/></mesh>
  <mesh rotation-z={Math.PI/2} onClick={O('lab')}><cylinderGeometry args={[.9,.9,3.2,20]}/><meshStandardMaterial color="#cfe3ea" emissive="#20D6C7" emissiveIntensity={em('lab')}/></mesh>
  <mesh position={[0,.9,0]} onClick={O('dome')}><sphereGeometry args={[1,20,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#8AF5E8" transparent opacity={.45} emissive="#20D6C7" emissiveIntensity={em('dome')}/></mesh>
  {[-2.7,2.7].map((x,i)=><mesh key={x} position={[x,0,0]} onClick={O(i?'modB':'modA')}><sphereGeometry args={[.8,16,12]}/><meshStandardMaterial color="#b8d0d8" emissive="#20D6C7" emissiveIntensity={em(i?'modB':'modA')}/></mesh>)}
  {[-1.9,1.9].map(x=><mesh key={x} position={[x,0,0]} rotation-z={Math.PI/2}><cylinderGeometry args={[.2,.2,1,8]}/><Mat c="#6c8794"/></mesh>)}
  <group position={[0,.2,2.6]} onClick={O('sensor')}><mesh position-y={.5}><cylinderGeometry args={[.05,.08,1,6]}/><Mat c="#ccc"/></mesh><mesh position-y={1.1}><sphereGeometry args={[.2,10,8]}/><meshStandardMaterial color="#ff6f61" emissive="#ff6f61" emissiveIntensity={sel==='sensor'?1:.3}/></mesh></group>
  {showSub&&<group position={[0,1.3,-3]} onClick={O('sub')}><mesh scale={[1.6,.7,.7]}><sphereGeometry args={[.8,16,12]}/><meshStandardMaterial color="#e8b020" emissive="#e8b020" emissiveIntensity={em('sub')}/></mesh><mesh position={[.6,.2,0]}><sphereGeometry args={[.3,10,8]}/><meshStandardMaterial color="#8AF5E8" transparent opacity={.6}/></mesh></group>}
  {[[-3.4,.6,1.2],[3.4,.6,1.2],[0,1.9,0]].map((p,i)=><group key={i} position={p as [number,number,number]}><mesh><sphereGeometry args={[.1,8,8]}/><meshBasicMaterial color={light?'#fff7c2':'#222'}/></mesh>{light&&<pointLight color="#fff2b0" intensity={12} distance={9}/>}</group>)}</group>}
export const RESEARCH_OBJS=[
{id:'lab',name:'Main laboratory',text:'Sample analysis and water chemistry work.',status:'Oxygen: nominal'},
{id:'dome',name:'Observation dome',text:'Crew viewing area with a wide view of the reef.',status:'Power: nominal'},
{id:'modA',name:'Research module A',text:'Biology workspace and sample storage.',status:'Water monitoring: nominal'},
{id:'modB',name:'Research module B',text:'Communications and data relay.',status:'Comms: nominal'},
{id:'sensor',name:'Sensor station',text:'Measures temperature, clarity and currents (simulated).',status:'Water monitoring: calibrating'},
{id:'sub',name:'Submersible',text:'Crewed vehicle for short dives from the docking platform.',status:'Vehicle: docked, charging'},
{id:'dock',name:'Docking platform',text:'Mooring and charging point for vehicles.',status:'Power: nominal'}];

function Rig({view,tick}:{view?:string;tick?:number}){
 const {camera}=useThree(),ctl=useRef<ElementRef<typeof OrbitControls>>(null),go=useRef(1.5);
 useEffect(()=>{go.current=1.5},[view,tick]);
 useFrame((_,d)=>{const c=ctl.current;if(go.current<=0||!c)return;go.current-=d;const [p,t]=VIEWS[view??'reset']??VIEWS.reset;camera.position.lerp(new THREE.Vector3(...p),.06);c.target.lerp(new THREE.Vector3(...t),.06);c.update()});
 return <OrbitControls ref={ctl} minDistance={3} maxDistance={40} maxPolarAngle={Math.PI/2.05} enableDamping/>}

class Boundary extends Component<{children:ReactNode},{e:boolean}>{state={e:false};static getDerivedStateFromError(){return {e:true}}render(){return this.state.e?<Fallback/>:this.props.children}}
const Fallback=()=><div className="d-flex h-100 align-items-center justify-content-center text-center p-4 text-white"><div><h5>3D view unavailable</h5><p>WebGL could not start. Enable hardware acceleration or try another browser.</p></div></div>;
const hasGL=()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch{return false}};

export default function Scene(p:SceneProps){
 const {daylight,clarity,particles,marine,coral}=useStore();const V=p.variant,dep=p.depth??0,deep=V==='deep';
 const bg=useMemo(()=>deep?new THREE.Color('#0a4a72').lerp(new THREE.Color('#000308'),Math.min(1,dep/1500)):new THREE.Color(V==='reef'?'#0a86a8':V==='research'?'#0a4f78':'#0a5f86'),[deep,dep,V]);
 const lit=deep?Math.max(.06,1-dep/1200):daylight;const fogFar=(deep?10+clarity*.2:12+clarity*.65)*(deep?Math.max(.5,1-dep/8000):1);
 const sand=deep?'#2a2f3a':'#d8c690';
 if(!hasGL())return <div className="cv"><Fallback/></div>;
 const pick=p.onPick,sB=(V==='reef'?p.stress:0)??0;
 return <div className="cv"><Boundary><Canvas dpr={[1,1.5]} camera={{position:[0,4,16],fov:55}} onPointerMissed={()=>pick(null)}>
  <color attach="background" args={[bg.getStyle()]}/><fog attach="fog" args={[bg.getStyle(),1,fogFar]}/>
  <ambientLight intensity={.35+lit*.5} color="#9fdcf0"/><directionalLight position={[6,14,4]} intensity={lit*1.6} color="#e8fbff"/>
  <Terrain color={sand} rough={deep?2.2:1}/><Rocks n={deep?16:14} scale={deep?2.2:1} color={deep?'#1d222b':'#6b7a80'}/>
  {!deep&&<><mesh position-y={10} rotation-x={Math.PI/2}><planeGeometry args={[90,90]}/><meshBasicMaterial color="#7fe3f2" transparent opacity={.25*lit} side={THREE.DoubleSide}/></mesh>
   {[-8,-2,5,11].map((x,i)=><mesh key={i} position={[x,4,-3]} rotation-z={.15}><cylinderGeometry args={[.3,1.8,14,12,1,true]}/><meshBasicMaterial color="#cffaff" transparent opacity={.07*lit} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide}/></mesh>)}</>}
  <Particles density={particles} color={deep?'#9fd8ff':'#dff9ff'}/>
  {!deep&&V!=='research'&&<><group visible={coral}><Corals n={V==='reef'?60:26} stress={sB} sel={p.sel} onPick={pick}/></group><Kelp n={V==='reef'?30:22} height={V==='reef'?1.4:4}/></>}
  {(V==='ocean'||V==='reef')&&<group visible={marine}>
   <Fish color="#ff7a1a" stripe="#fff" info={sp('clownfish')} onPick={pick} r={5} speed={.5} y={-.5} s={1.2}/>
   <Fish color="#2b6fff" stripe="#ffd21a" info={sp('tang')} onPick={pick} r={7} speed={-.4} y={.5} phase={1} s={1.5}/>
   <Fish color="#ffd21a" stripe="#2b6fff" info={{name:'Angelfish',cat:'Fish',hab:'Coral Reef',text:'Angelfish have tall, flattened bodies suited to reef life.'}} onPick={pick} r={6} speed={.35} y={0} phase={2} s={1.4}/>
   <Fish color="#f7f3d8" stripe="#222" info={{name:'Butterflyfish',cat:'Fish',hab:'Coral Reef',text:'Butterflyfish often feed on coral polyps and small invertebrates.'}} onPick={pick} r={4} speed={-.6} y={.8} phase={3}/>
   <Turtle info={sp('turtle')} onPick={pick} r={9} speed={.15} y={1.5}/><Ray info={sp('manta')} onPick={pick} r={11} speed={-.12} y={3} phase={2}/>
   <School n={V==='reef'?60:40} color="#bfe8ff" hy={1.2}/></group>}
  {deep&&<><group visible={marine}>{[[-4,-3,0],[3,-5,1.5],[6,2,3],[-7,4,4],[0,-8,5],[8,-6,2]].map(([x,z,q],i)=><Jelly key={i} x={x} z={z} p={q} color={i%2?'#ff6bd6':'#59f2ff'}/>)}
   {dep>=1000&&[0,1].map(i=><Angler key={i} info={{name:'Anglerfish-inspired model',cat:'Deep-sea fish',hab:'Deep ocean',text:'Simplified model of a fish with a glowing lure. Not a scientific reconstruction.'}} onPick={pick} r={5+i*3} speed={.3*(i?-1:1)} y={-.5} phase={i*2}/>)}</group>
   <ROV on={!!p.rov} light={!!p.light}/></>}
  {V==='research'&&<Station light={!!p.light} showSub={p.showSub!==false} sel={p.sel} onPick={pick}/>}
  <Rig view={p.view} tick={p.tick}/>
 </Canvas></Boundary></div>}
