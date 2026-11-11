import {useRef} from 'react';
import {motion} from 'framer-motion';
import {ArrowDown,ArrowUpRight,Code2,GitBranch,Layers,MapPin,Terminal,MousePointer2} from 'lucide-react';
import {site} from '../site';
import {PresenceBadge,usePresence} from './Presence';
export function Hero({animate}:{animate:boolean}){
 const hero=useRef<HTMLElement>(null);
 const {status,peers,selfId}=usePresence();
 return <section ref={hero} className="hero hero-new" id="home" onPointerMove={e=>{
 if(!animate||e.pointerType==='touch')return;
 const r=e.currentTarget.getBoundingClientRect();hero.current?.style.setProperty('--spot-x',(e.clientX-r.left)+'px');hero.current?.style.setProperty('--spot-y',(e.clientY-r.top)+'px');
 }}>
 <div className="hero-grid" aria-hidden="true"/><div className="hero-top"><span className="eyebrow"><span className="red-dot"/>WELCOME TO MY DIGITAL WORKSPACE</span><span className="location"><MapPin size={13}/>{site.location}</span></div>
 <div className="hero-layout"><div className="hero-content">
 <motion.p className="hello-label" initial={animate?{opacity:0,y:12}:false} animate={{opacity:1,y:0}}>Hi, I’m</motion.p>
 <motion.h1 initial={animate?{opacity:0,y:22}:false} animate={{opacity:1,y:0}} transition={{duration:.7,ease:[.22,1,.36,1]}} aria-label={'Hi, I’m '+site.name}>{site.name.split(" ")[0]}<br/><span>{site.name.split(" ").slice(1).join(" ")}</span><span className="name-period">.</span></motion.h1>
 <div className="role-line">Software Engineer <span>|</span> Full Stack Developer</div>
 <p className="hero-description">I build scalable applications and modern digital experiences.<br className="desktop-break"/> Turning complex business needs into software that just works.</p>
 <div className="actions"><a className="button primary" href="#work">Explore My Work <ArrowUpRight size={18}/></a><a className="button secondary" href="#contact">Let’s Connect <ArrowUpRight size={18}/></a></div>
 <div className="hero-stack"><span>MY EVERYDAY STACK</span><b>Angular</b><i/><b>NestJS</b><i/><b>MongoDB</b></div>
 </div><motion.div className="workspace-window" initial={animate?{opacity:0,y:30}:false} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.15}}>
 <div className="window-toolbar"><div className="window-dots"><i/><i/><i/></div><span>tasmin / workspace</span><Code2 size={15}/></div>
 <div className="workspace-tabs"><span><Terminal size={13}/> developer.ts</span><span>README.md</span></div>
 <div className="code-editor" aria-label="Developer profile">
 <div className="code-line"><em>01</em><code><b>const</b> developer = {'{'}</code></div>
 <div className="code-line"><em>02</em><code>&nbsp; name: <strong>“{site.name}”</strong>,</code></div>
 <div className="code-line"><em>03</em><code>&nbsp; location: <strong>“Dhaka, Bangladesh”</strong>,</code></div>
 <div className="code-line"><em>04</em><code>&nbsp; focus: [</code></div>
 <div className="code-line"><em>05</em><code>&nbsp;&nbsp; <strong>“Thoughtful systems”</strong>,</code></div>
 <div className="code-line"><em>06</em><code>&nbsp;&nbsp; <strong>“Meaningful experiences”</strong></code></div>
 <div className="code-line"><em>07</em><code>&nbsp; ],</code></div>
 <div className="code-line"><em>08</em><code>&nbsp; mindset: <strong>“Always learning”</strong></code></div>
 <div className="code-line"><em>09</em><code>{'};'}</code></div>
 </div>
 <div className="workspace-presence"><div className="flex items-center gap-2"><MousePointer2 size={16}/><span>A shared space to explore.</span></div><PresenceBadge/><p>{status==='live'&&peers.length>1?'You’re exploring with '+(peers.length-1)+' other '+(peers.length===2?'visitor.':'visitors.'):status==='live'?'You’re the first here. Open another tab to meet yourself.':'Real people. Real cursors. Connect when the live room is online.'}</p><div className="hero-avatars">{peers.slice(0,5).map(p=><span key={p.id} title={p.name+(p.id===selfId?' (you)':'')} style={{background:p.color}}>{p.name.charAt(0)}</span>)}</div></div>
 <div className="window-status"><span><GitBranch size={12}/> main</span><span><span className="green-dot"/> Ready to build</span><Layers size={13}/></div>
 </motion.div></div>
 <div className="hero-foot"><span>ENGINEER BY TRADE. PROBLEM-SOLVER BY NATURE.</span><a href="#work">SCROLL TO EXPLORE <ArrowDown size={14}/></a></div>
 </section>;
}
