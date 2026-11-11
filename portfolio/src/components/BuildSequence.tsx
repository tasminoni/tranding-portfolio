import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {MousePointer2,Sparkles,X} from 'lucide-react';

const builders=[{name:'Layout',color:'#8adeb6'},{name:'Typography',color:'#bba4ff'},{name:'Code',color:'#ffc085'}];
type Task={element:HTMLElement;at:number;agent:number;label:string;revealed:boolean;rect:{left:number;top:number;width:number;height:number};typing:boolean};
type Scene={title:string;elements:HTMLElement[];start:number;duration:number;tasks:Task[]};
type Frame=Task['rect']&{id:number;agent:number;label:string;at:number};
const select=(selector:string)=>Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0);
const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
function documentRect(element:HTMLElement){
 const r=element.getBoundingClientRect();
 return {left:r.left,top:r.top+window.scrollY,width:r.width,height:r.height};
}
function makeScenes():Scene[]{
 const specs:{title:string;elements:HTMLElement[];targets:HTMLElement[]}[]=[];
 const add=(title:string,selector:string)=>{const elements=select(selector);if(elements.length)specs.push({title,elements,targets:elements})};
 // Separate visual rows into scenes so every element is built on screen on phones too.
 const bands=(title:string,selector:string,children?:string)=>{
  const elements=select(selector).sort((a,b)=>{const ra=documentRect(a),rb=documentRect(b);return Math.abs(ra.top-rb.top)>10?ra.top-rb.top:ra.left-rb.left});let group:HTMLElement[]=[];let top=0;
  const flush=()=>{if(group.length)specs.push({title,elements:group,targets:children?group.flatMap(e=>Array.from(e.querySelectorAll<HTMLElement>(children))):group});group=[]};
  elements.forEach(el=>{
   const r=documentRect(el);
   if(group.length&&r.top+r.height-top>window.innerHeight-220){flush()}
   if(!group.length)top=r.top;
   group.push(el);
  });flush();
 };
 add('Setting up the header','header > .wordmark, header > nav, .hero-top');
 add('Writing the introduction','.hello-label, .hero-new h1, .role-line, .hero-description, .hero-new .actions, .hero-stack');
 add('Building the workspace','.window-toolbar, .workspace-tabs, .code-line, .workspace-presence, .window-status, .hero-foot');
 add('Laying out selected work','#work > .section-heading, .work-toolbar');
 bands('Bringing projects to life','.project-card','.project-art, .project-info, .project-card-footer');
 add('Connecting the work','.work-outro');
 bands('Introducing the person behind the code','.about-title > .eyebrow, .about-title > h2, .about-monogram, .about-title > .text-link, .about-body > p');
 bands('Adding experience and skills','.skill-row');
 add('Opening the toolkit','#skills > .section-heading');
 bands('Assembling the technology stack','.tech-card');
 add('Mapping the journey','#experience > .section-heading');
 bands('Building the experience timeline','.timeline > details');
 add('Adding the education foundation','.education > .eyebrow');
 bands('Adding the education foundation','.education article');
 add('Starting a conversation','.contact-top, #contact > h2, .contact-bottom');
 bands('Connecting the contact form','.contact-form > label, .contact-form > button, .contact-form > p');
 add('Finishing the footer','footer > .wordmark, footer > span, footer > div');
 let time=0;
 return specs.map((spec,sceneIndex)=>{
  const lead=sceneIndex===0?180:650;
  const stagger=spec.targets.length>9?75:135;
  const duration=lead+Math.max(0,spec.targets.length-1)*stagger+950;
  const scene:Scene={title:spec.title,elements:spec.elements,start:time,duration,tasks:spec.targets.map((element,index)=>({
   element,at:time+lead+index*stagger,agent:index%3,label:spec.title,
   revealed:false,rect:documentRect(element),
   typing:element.matches('h1,h2,.hello-label,.role-line,.hero-description,.code-line,.about-body > p')
  }))};
  time+=duration;return scene;
 });
}
export function BuildSequence({enabled,request}:{enabled:boolean;request:number}){
 const lastRequest=useRef(-1);
 const cursorRefs=useRef<(HTMLDivElement|null)[]>([]);
 const wireframeRef=useRef<HTMLDivElement>(null);
 const finishRef=useRef<()=>void>(()=>{});
 const [running,setRunning]=useState(false),[frames,setFrames]=useState<Frame[]>([]);
 const [elapsed,setElapsed]=useState(0),[duration,setDuration]=useState(1),[stage,setStage]=useState('');
 const [announcement,setAnnouncement]=useState('');
 useLayoutEffect(()=>{
  const isNewRequest=request!==lastRequest.current;
  lastRequest.current=request;
  if(!enabled||!isNewRequest)return;
  if(request===0&&(window.scrollY>80||window.location.hash))return;
  if(request>0)window.scrollTo({top:0,behavior:'instant'});
  const width=window.innerWidth,height=window.innerHeight;
  const scenes=makeScenes();
  if(!scenes.length)return;
  const tasks=scenes.flatMap(s=>s.tasks);
  const total=scenes.at(-1)!.start+scenes.at(-1)!.duration;
  let stopped=false,raf=0,lastTick=-100,sceneIndex=-1,cameraFrom=0,cameraTo=0,lastFrame=performance.now();
  const animations:Animation[]=[];
  const previous=tasks.map(t=>({element:t.element,state:t.element.getAttribute('data-build-state')}));
  const positions=builders.map((_b,i)=>({x:i===1?-60:width+60,y:120+i*100}));
  document.documentElement.dataset.buildActive='true';
  tasks.forEach(t=>t.element.setAttribute('data-build-state','waiting'));
  setFrames(tasks.map((t,id)=>({...t.rect,id,agent:t.agent,label:t.label,at:t.at})));
  setElapsed(0);setDuration(total);setRunning(true);
  setAnnouncement('Build demo started. The page will scroll from header to footer. Skip intro or scroll to take control.');
  const restore=()=>{
   previous.forEach(({element,state})=>state===null?element.removeAttribute('data-build-state'):element.setAttribute('data-build-state',state));
   animations.forEach(a=>a.cancel());
   delete document.documentElement.dataset.buildActive;
  };
  const finish=()=>{
   if(stopped)return;stopped=true;cancelAnimationFrame(raf);restore();
   setRunning(false);setFrames([]);setAnnouncement('Portfolio ready to explore.');
  };
  finishRef.current=finish;
  const start=performance.now();
  const tick=(now:number)=>{
   if(stopped)return;
   const t=now-start,dt=Math.min(60,now-lastFrame);lastFrame=now;
   let nextIndex=scenes.findIndex(s=>t<s.start+s.duration);
   if(nextIndex<0){finish();return}
   const scene=scenes[nextIndex];
   if(nextIndex!==sceneIndex){
    sceneIndex=nextIndex;cameraFrom=window.scrollY;
    const bounds=scene.elements.map(documentRect);
    const top=Math.min(...bounds.map(r=>r.top)),bottom=Math.max(...bounds.map(r=>r.top+r.height));
    const maxScroll=Math.max(0,document.documentElement.scrollHeight-height);
    cameraTo=nextIndex===0?0:top>=cameraFrom+100&&bottom<=cameraFrom+height-125?cameraFrom:clamp(top-115,0,maxScroll);
    scene.tasks.forEach(task=>{task.rect=documentRect(task.element)});
    setFrames(tasks.map((task,id)=>({...task.rect,id,agent:task.agent,label:task.label,at:task.at})));
    setStage(scene.title);
   }
   const cameraProgress=clamp((t-scene.start)/650,0,1);
   window.scrollTo({top:cameraFrom+(cameraTo-cameraFrom)*ease(cameraProgress),behavior:'instant'});
   const scroll=window.scrollY;
   if(wireframeRef.current)wireframeRef.current.style.transform='translate3d(0,'+(-scroll)+'px,0)';
   scene.tasks.forEach(task=>{
    if(!task.revealed&&t>=task.at+420){
     task.revealed=true;task.element.setAttribute('data-build-state','ready');
     animations.push(task.element.animate(task.typing?[
      {opacity:.2,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}
     ]:[{opacity:0,translate:'0 16px',scale:'.975',filter:'blur(3px)'},{opacity:1,translate:'0 0',scale:'1',filter:'blur(0px)'}],
     {duration:task.typing?480:520,easing:task.typing?'steps(18,end)':'cubic-bezier(.22,1,.36,1)'}));
    }
   });
   builders.forEach((_builder,index)=>{
    const cursor=cursorRefs.current[index];if(!cursor)return;
    const own=scene.tasks.filter(task=>task.agent===index);
    const active=own.find(task=>t<task.at+900)||own.at(-1);
    let x=width-65-index*28,y=height-160-index*35,working=false;
    if(active){
     const r=active.rect;
     const phase=t-active.at;
     const left=clamp(r.left+8,12,width-24),right=clamp(r.left+r.width-12,12,width-24);
     const top=clamp(r.top-scroll+10,95,height-105),bottom=clamp(r.top+r.height-scroll-10,95,height-105);
     if(phase<140){x=left;y=top}
     else if(phase<430){
      const p=ease(clamp((phase-140)/290,0,1));
      x=left+(right-left)*p;y=top+(active.typing?0:(bottom-top)*p)+Math.sin(p*Math.PI)*-16;
     }else{x=right+Math.sin(t/800+index)*5;y=bottom+Math.cos(t/950+index)*3}
     working=phase>=0&&phase<440;
    }
    // Slightly different response per agent gives a coordinated, human-paced motion.
    const blend=1-Math.exp(-dt/(65+index*12));
    positions[index].x+=(x-positions[index].x)*blend;
    positions[index].y+=(y-positions[index].y)*blend;
    cursor.style.transform='translate3d('+positions[index].x+'px,'+positions[index].y+'px,0)';
    cursor.dataset.flip=positions[index].x>width-145?'true':'false';
    cursor.dataset.working=working?'true':'false';
   });
   if(t-lastTick>=80){setElapsed(t);lastTick=t}
   raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  const onKey=(event:KeyboardEvent)=>{if(['Escape','Tab','ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))finish()};
  const onPointer=(event:PointerEvent)=>{if(!(event.target as Element)?.closest('.build-controls,.replay-build,.motion-toggle'))finish()};
  const onResize=()=>{if(Math.abs(window.innerWidth-width)>20||Math.abs(window.innerHeight-height)>120)finish()};
  const onVisibility=()=>{if(document.hidden)finish()};
  // Only human input cancels; the cinematic camera scroll must not cancel itself.
  window.addEventListener('wheel',finish,{passive:true});window.addEventListener('touchmove',finish,{passive:true});
  window.addEventListener('pointerdown',onPointer);window.addEventListener('resize',onResize);window.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{
   finish();
   window.removeEventListener('wheel',finish);window.removeEventListener('touchmove',finish);
   window.removeEventListener('pointerdown',onPointer);window.removeEventListener('resize',onResize);window.removeEventListener('keydown',onKey);
   document.removeEventListener('visibilitychange',onVisibility);
  };
 },[enabled,request]);
 const percent=Math.min(100,Math.round(elapsed/duration*100));
 return <>
 <span className="sr-only" role="status">{announcement}</span>
 {running&&<div className="build-sequence" data-testid="build-sequence" data-duration={duration} data-stage={stage}>
  <div ref={wireframeRef} className="build-wireframes" aria-hidden="true">{frames.map(frame=><div key={frame.id} className={'build-wireframe '+(elapsed>=frame.at+420?'assembled':elapsed>=frame.at?'drawing':'queued')} style={{left:frame.left,top:frame.top,width:frame.width,height:frame.height,'--builder-color':builders[frame.agent].color} as CSSProperties}>
   <span className="build-task-label">{frame.label}</span><i className="corner tl"/><i className="corner tr"/><i className="corner bl"/><i className="corner br"/>
  </div>)}</div>
  {builders.map((builder,i)=><div key={builder.name} ref={element=>{cursorRefs.current[i]=element}} className="build-demo-cursor" aria-hidden="true" style={{color:builder.color}}>
   <div className="build-click-ring"/><MousePointer2 size={25} fill={builder.color} stroke="#100d18" strokeWidth={1.4}/><span style={{background:builder.color}}>{builder.name}<small>demo</small></span>
  </div>)}
  <div className="build-controls"><div className="build-control-top"><Sparkles size={17}/><div><strong>{stage||'Building your first impression…'}</strong><span>Build demo · auto-scroll · scroll to take over</span></div><span className="build-percentage" aria-hidden="true">{percent}%</span><button onClick={()=>finishRef.current()} aria-label="Skip build intro">Skip intro <X size={14}/></button></div><div className="build-meter" aria-hidden="true"><i style={{width:percent+'%'}}/></div></div>
 </div>}
 </>;
}
