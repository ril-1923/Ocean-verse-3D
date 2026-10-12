export interface Species{id:string;name:string;sci:string;cat:string;hab:string;diet:string;size:string;status:string;fact:string;emoji:string;desc:string}
const R:string[][]=[
['clownfish','Clownfish','Amphiprion ocellaris','Fish','Coral Reef','Plankton and algae','8–11 cm','Least Concern','Lives among anemone tentacles without being harmed.','🐠'],
['tang','Blue Tang','Paracanthurus hepatus','Fish','Coral Reef','Algae and zooplankton','~30 cm','Least Concern','Often forms groups that graze on reef algae.','🐟'],
['turtle','Green Sea Turtle','Chelonia mydas','Reptile','Coastal','Seagrass and algae','~1 m shell','Endangered','Adults are mostly herbivorous and migrate long distances.','🐢'],
['dolphin','Bottlenose Dolphin','Tursiops truncatus','Mammal','Open Ocean','Fish and squid','2–4 m','Least Concern','Uses echolocation to find prey.','🐬'],
['whaleshark','Whale Shark','Rhincodon typus','Shark & Ray','Open Ocean','Plankton','9–12 m','Endangered','The largest living fish species.','🦈'],
['greatwhite','Great White Shark','Carcharodon carcharias','Shark & Ray','Coastal','Fish and marine mammals','4–5 m','Vulnerable','A top predator in cooler coastal waters.','🦈'],
['manta','Manta Ray','Mobula birostris','Shark & Ray','Open Ocean','Plankton','4–5 m wingspan','Vulnerable','Filter feeds by gliding with open mouth.','🪼'],
['octopus','Octopus','Octopus vulgaris','Invertebrate','Coastal','Crabs and molluscs','~1 m arm span','Least Concern','Can change skin colour and texture quickly.','🐙'],
['jelly','Moon Jellyfish','Aurelia aurita','Invertebrate','Open Ocean','Small plankton','25–40 cm','Least Concern','Drifts with currents and pulses its bell to move.','🪼'],
['seahorse','Seahorse','Hippocampus spp.','Fish','Kelp Forest','Small crustaceans','2–35 cm (varies)','Vulnerable','Males carry the developing eggs.','🐴'],
['bluewhale','Blue Whale','Balaenoptera musculus','Mammal','Open Ocean','Krill','24–30 m','Endangered','Among the largest animals known to have lived.','🐋'],
['lionfish','Lionfish','Pterois volitans','Fish','Coral Reef','Small fish and crustaceans','~35 cm','Least Concern','Venomous spines deter predators.','🦁']];
export const SPECIES:Species[]=R.map(r=>({id:r[0],name:r[1],sci:r[2],cat:r[3],hab:r[4],diet:r[5],size:r[6],status:r[7],fact:r[9]?r[8]:'',emoji:r[9],desc:`${r[1]} is a ${r[3].toLowerCase()} found mostly in ${r[4].toLowerCase()} habitats.`}));
export const CATS=[...new Set(SPECIES.map(s=>s.cat))];
export const HABS=[...new Set(SPECIES.map(s=>s.hab))];
export const LOCS=[
{id:'reef',name:'Tropical Coral Reef',to:'/coral-reef',emoji:'🪸',desc:'Colourful corals, tropical fish and sea turtles.',c:'#20D6C7'},
{id:'deep',name:'Deep Ocean Trench',to:'/deep-ocean',emoji:'🌑',desc:'Dark water, bioluminescence and an ROV to pilot.',c:'#3a4aa8'},
{id:'kelp',name:'Kelp Forest',to:'/explorer',emoji:'🌿',desc:'Swaying kelp and schooling fish in the main explorer.',c:'#2f9e6b'},
{id:'open',name:'Open Ocean',to:'/explorer',emoji:'🌊',desc:'Rays, turtles and schools in clear blue water.',c:'#087CA7'},
{id:'station',name:'Research Station',to:'/research',emoji:'🔬',desc:'Inspect the lab, dome, sensors and submersible.',c:'#8AF5E8'},
{id:'bio',name:'Biodiversity Zone',to:'/marine-life',emoji:'🐙',desc:'Browse the marine life catalogue.',c:'#e0733a'}];
export interface Mission{id:string;title:string;desc:string;diff:string;pts:number;to:string;target:number}
export const MISSIONS:Mission[]=[
{id:'reef',title:'Discover the Coral Reef',desc:'Select a coral formation in the Coral Reef scene.',diff:'Easy',pts:100,to:'/coral-reef',target:1},
{id:'species5',title:'Identify Five Marine Species',desc:'Open or click five different species (catalogue or 3D scenes).',diff:'Medium',pts:200,to:'/marine-life',target:5},
{id:'deep',title:'Explore the Deep Ocean',desc:'Visit the Deep Ocean page.',diff:'Easy',pts:100,to:'/deep-ocean',target:1},
{id:'station',title:'Inspect the Research Station',desc:'Click an object at the research station.',diff:'Easy',pts:150,to:'/research',target:1},
{id:'turtle',title:'Discover a Sea Turtle',desc:'Click a sea turtle in the Explorer.',diff:'Medium',pts:150,to:'/explorer',target:1},
{id:'survey',title:'Complete the Ocean Biodiversity Survey',desc:'Complete the five other missions.',diff:'Hard',pts:300,to:'/missions',target:5}];
export function progress(m:Mission,seen:string[],visited:string[]):number{
 const one=(id:string)=>id==='species5'?Math.min(5,seen.length):id==='turtle'?(seen.includes('turtle')?1:0):visited.includes(id)?1:0;
 if(m.id==='survey')return MISSIONS.filter(x=>x.id!=='survey').filter(x=>one(x.id)>=x.target).length;return Math.min(m.target,one(m.id));}
const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTHLY=MO.map((m,i)=>({m,temp:+(24+Math.sin(i/1.9)*2.2).toFixed(1),clarity:Math.round(68+Math.cos(i/2)*14),missions:2+((i*5)%7)}));
