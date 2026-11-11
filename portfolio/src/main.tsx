import {useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,MotionConfig,useScroll,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,ArrowUp,Menu,X,Search,Download,Plus,Github,Linkedin,BookOpen,RotateCcw} from 'lucide-react';
import {site,projects} from './site';
import type {Project} from './types';
import {Hero} from './components/Hero';
import {TechStack} from './components/TechStack';
import {PresenceProvider,PresenceLayer} from './components/Presence';
import {ContactForm} from './components/ContactForm';
import {BuildSequence} from './components/BuildSequence';
import './styles.css';

function App(){
 const reduced=useReducedMotion();
 const [motionOn,setMotionOn]=useState(()=>{try{return localStorage.getItem('tasmin-portfolio-motion')!=='off'}catch{return true}});
 const [buildRequest,setBuildRequest]=useState(0);
 const [menu,setMenu]=useState(false),[active,setActive]=useState('home');
 const [category,setCategory]=useState('All work'),[query,setQuery]=useState('');
 const [selected,setSelected]=useState<Project|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const {scrollYProgress}=useScroll();const animate=motionOn&&!reduced;
 useEffect(()=>{
  document.documentElement.dataset.motion=animate?'on':'off';
  try{localStorage.setItem('tasmin-portfolio-motion',motionOn?'on':'off')}catch{/* optional storage */}
 },[motionOn,animate]);
 useEffect(()=>{
  const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',fn);
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)}),{rootMargin:'-15% 0px -55% 0px'});
  document.querySelectorAll('main > section[id]').forEach(e=>observer.observe(e));
  return()=>{window.removeEventListener('keydown',fn);observer.disconnect()};
 },[]);
 useEffect(()=>{
  if(selected){dialog.current?.showModal();document.body.style.overflow='hidden'}
  else{dialog.current?.close();document.body.style.overflow=''}
  return()=>{document.body.style.overflow=''};
 },[selected]);
 const filtered=projects.filter(p=>(category==='All work'||p.category===category)&&[p.title,p.description,...p.tools].join(' ').toLowerCase().includes(query.toLowerCase()));
 const links=[['work','Work'],['about','About'],['skills','Stack'],['experience','Journey']];
 return <MotionConfig reducedMotion={animate?'user':'always'}>
  <a className="skip" href="#work">Skip to work</a>
  <motion.div className="progress" style={{scaleX:animate?scrollYProgress:0}}/>
  <header>
   <a href="#home" className="wordmark" aria-label={site.name+' home'}><span className="brand-bracket">&lt;</span>{site.shortName.toLowerCase()}<span className="brand-bracket"> /&gt;</span></a>
   <nav aria-label="Main navigation" className={menu?'open':''}>{links.map(([id,label])=><a key={id} className={active===id?'active':''} href={'#'+id} onClick={()=>setMenu(false)}>{label}</a>)}<a className="nav-contact" href="#contact" onClick={()=>setMenu(false)}>Let’s connect <ArrowUpRight size={15}/></a></nav>
   <button className="replay-build" aria-label="Replay Build" disabled={!!reduced} title={reduced ? "Build animation is disabled by your reduced-motion setting" : "Replay the animated website-building demo"} onClick={()=>{setMotionOn(true);setBuildRequest(n=>n+1);setMenu(false)}}><RotateCcw size={14}/><span>Replay Build</span></button>
   <button className="motion-toggle" onClick={()=>setMotionOn(!motionOn)} aria-pressed={motionOn}><span className={motionOn?'dot on':'dot'}/>Motion <span>{motionOn?'on':'off'}</span></button>
   <button className="menu-toggle icon-button" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
  </header>
  <main><Hero animate={animate}/>
   <section className="section work" id="work">
    <div className="section-heading"><div><p className="eyebrow">01 / SELECTED WORK</p><h2>Ideas, brought<br/><span>to life.</span></h2></div><p>Purposeful products. Thoughtful engineering.<br/>A closer look at what I’ve been building.</p></div>
    <div className="work-toolbar"><div className="filters" aria-label="Filter projects">{['All work',...new Set(projects.map(p=>p.category))].map(c=><button key={c} className={category===c?'selected':''} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search"><Search size={16}/><input aria-label="Search projects" placeholder="Find a project" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
    <div className="project-grid">{filtered.map(p=><motion.article key={p.id} layout={animate} initial={false} className={'project-card '+p.graphic}>
     <button className="project-open" onClick={()=>setSelected(p)} aria-label={'View '+p.title+' project details'}>
      <ProjectArtwork project={p}/>
      <div className="project-info"><div><span className="project-category">{p.category}</span><h3>{p.title}</h3><p>{p.summary}</p></div><span className="circle-arrow"><ArrowUpRight size={21}/></span></div>
     </button>
     <div className="project-card-footer"><div className="tags">{p.tools.map(t=><span key={t}>{t}</span>)}</div><div className="project-links">{p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer">Live site <ArrowUpRight size={14}/></a>}{p.sourceUrl&&<a href={p.sourceUrl} target="_blank" rel="noopener noreferrer"><Github size={14}/> Code</a>}{p.pending&&<span className="pending-label">Details coming soon</span>}</div></div>
    </motion.article>)}</div>
    {!filtered.length&&<div className="empty"><h3>No matching projects</h3><p>Try another search or view all work.</p><button className="button" onClick={()=>{setQuery('');setCategory('All work')}}>Reset filters</button></div>}
    <div className="work-outro"><p>Explore more of my development journey.</p><a className="text-link" href={site.github} target="_blank" rel="noopener noreferrer"><Github size={16}/> Find me on GitHub <ArrowUpRight size={16}/></a></div>
   </section>
   <section className="section about" id="about"><div className="about-title"><p className="eyebrow">02 / THE PERSON BEHIND THE CODE</p><h2>Curious mind.<br/><span>Builder at heart.</span></h2><div className="about-monogram" aria-hidden="true"><span>TA</span><span className="monogram-caption">DHAKA · BANGLADESH</span></div><a className="text-link" href={site.resume} download>Download résumé <Download size={17}/></a></div><div className="about-body"><p className="large-copy">I build at the intersection of technology and business.</p><p>{site.about}</p><p className="about-interests">I’m interested in scalable architecture, connected commerce, and making complex workflows feel simple. I enjoy the whole journey: understanding the problem, building the solution, and improving it with the people who use it.</p><div className="skills">{site.skills.map((s,i)=><div className="skill-row" key={s.name}><span className="index">0{i+1}</span><div><h3>{s.name}</h3><div className="tags">{s.items.map(t=><span key={t}>{t}</span>)}</div></div></div>)}</div></div></section>
   <TechStack animate={animate}/>
   <section className="section experience" id="experience"><div className="section-heading"><div><p className="eyebrow">04 / THE JOURNEY SO FAR</p><h2>Always building.<br/><span>Always learning.</span></h2></div><p>Experience that connects engineering,<br/>people, and business.</p></div><div className="timeline">{site.experience.map((e,i)=><details key={e.company} open={i===0}><summary><span className="dates">{e.dates}</span><span className="job"><strong>{e.company}</strong><span>{e.role}</span></span><Plus size={22}/></summary><p>{e.detail}</p></details>)}</div><div className="education"><p className="eyebrow">THE FOUNDATION / EDUCATION</p><div>{site.education.map(e=><article key={e.school}><span className="dates">{e.year}</span><h3>{e.school}</h3><p>{e.degree}</p><span className="grade">{e.grade}</span></article>)}</div></div></section>
   <section className="section contact" id="contact"><div className="contact-top"><p className="eyebrow">05 / START A CONVERSATION</p><span>{site.location}</span></div><h2>Great things start<br/>with <span>hello.</span><ArrowUpRight className="contact-arrow" aria-hidden="true"/></h2><div className="contact-bottom"><div><p>A project, an opportunity, or a good conversation.<br/>I’d love to hear from you.</p><a className="contact-email" href={'mailto:'+site.email}>{site.email} <ArrowUpRight size={17}/></a></div><div className="contact-socials"><a href={site.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={15}/></a><a href={site.github} target="_blank" rel="noopener noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a></div></div><ContactForm/></section>
  </main>
  <footer><a className="wordmark" href="#home">{site.shortName.toLowerCase()}<span>.</span></a><span>© {new Date().getFullYear()} {site.name}</span><div><span className="footer-note">Built with curiosity & a little caffeine.</span><a href="#home" aria-label="Back to top" className="icon-button"><ArrowUp size={18}/></a></div></footer>
  <dialog ref={dialog} aria-labelledby="project-title" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===dialog.current)setSelected(null)}}>{selected&&<div className="dialog-inner"><button autoFocus className="dialog-close icon-button" onClick={()=>setSelected(null)} aria-label="Close project"><X/></button><p className="eyebrow">{selected.category}</p><h2 id="project-title">{selected.title}</h2>{selected.image&&<img className="dialog-image" src={selected.image} alt={selected.title+' live website screenshot'} width={1440} height={960}/>}<p className="dialog-description">{selected.description}</p>{selected.details.length>0&&<><h3>What I built</h3><ul>{selected.details.map(d=><li key={d}>{d}</li>)}</ul></>}<div className="tags">{selected.tools.map(t=><span key={t}>{t}</span>)}</div><div className="flex flex-wrap gap-3">{selected.url&&<a className="button primary" href={selected.url} target="_blank" rel="noopener noreferrer">Visit live website <ArrowUpRight size={18}/></a>}{selected.sourceUrl&&<a className="button secondary" href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"><Github size={17}/> Source code</a>}</div></div>}</dialog>
  <PresenceLayer animate={animate}/>
  <BuildSequence enabled={animate} request={buildRequest}/>
 </MotionConfig>;
}
function ProjectArtwork({project:p}:{project:Project}){
 return <div className={'project-art '+(p.image?'has-screenshot':'')}>
  {p.image?<><div className="project-browser-bar"><span>● ● ●</span><span>{p.url?new URL(p.url).hostname:p.title}</span><ArrowUpRight size={12}/></div><img src={p.image} width={1440} height={960} loading="lazy" alt={p.title+' live website screenshot'}/></>:<>
  <div className="art-top"><span>{p.label}</span><ArrowUpRight size={22}/></div>
  <div className={'abstract '+p.graphic} aria-hidden="true">{p.graphic==='commerce'?<><div className="bag one">c<span>clothigo</span></div><div className="bag two">c<span>clothigo</span></div></>:p.graphic==='pharma'?<><div className="cross"/><div className="orbit"/><div className="small-cross">+</div></>:p.graphic==='academic'?<div className="academic-art"><BookOpen size={72} strokeWidth={1}/><span>Academic<br/>Thesis Portal</span></div>:<><div className="book one">বই<br/><small>BOI PORIBAR</small></div><div className="book two"/><div className="book three"/></>}</div><div className="art-bottom"><span>{p.tools.slice(0,2).join(' / ')}</span><span>CONCEPT ART</span></div></>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<PresenceProvider><App/></PresenceProvider>);
