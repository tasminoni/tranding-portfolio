import {motion} from 'framer-motion';
import {Code2,Braces,Server,Database,GitBranch,Container,Network,Layers} from 'lucide-react';
const technologies=[
 {name:'Angular',tag:'Interfaces',icon:Layers,color:'#fb7e98'},
 {name:'NestJS',tag:'Backend',icon:Server,color:'#f983a3'},
 {name:'TypeScript',tag:'Typed systems',icon:Code2,color:'#7cbcff'},
 {name:'JavaScript',tag:'Web foundations',icon:Braces,color:'#f3d778'},
 {name:'Node.js',tag:'Runtime',icon:Server,color:'#8bdab1'},
 {name:'MongoDB',tag:'Document data',icon:Database,color:'#8bdab1'},
 {name:'MySQL',tag:'Relational data',icon:Database,color:'#7cbcff'},
 {name:'PostgreSQL',tag:'Relational data',icon:Database,color:'#a4b7ef'},
 {name:'REST API',tag:'Connected systems',icon:Network,color:'#b9a0ff'},
 {name:'Git & GitHub',tag:'Version control',icon:GitBranch,color:'#ffa98b'},
 {name:'Docker',tag:'Containers',icon:Container,color:'#7cbcff'}
];
export function TechStack({animate}:{animate:boolean}){
 return <section id="skills" className="section tech-section"><div className="section-heading"><div><p className="eyebrow">03 / MY TOOLKIT</p><h2>The tools behind<br/>the <span>experience.</span></h2></div><p>From the first interface to the last API call.<br/>A stack built for connected applications.</p></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{technologies.map(({name,tag,icon:Icon,color})=><motion.div key={name} className="tech-card group" whileHover={animate?{y:-4}:undefined}><Icon size={25} style={{color}}/><h3>{name}</h3><p>{tag}</p><span className="tech-corner">↗</span></motion.div>)}</div></section>
}
