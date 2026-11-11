import {publicPath} from '../paths';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {io,type Socket} from 'socket.io-client';
import {motion,useMotionValue,useSpring} from 'framer-motion';
import {MousePointer2,Users,WifiOff,X,Radio} from 'lucide-react';
import type {Peer,Position} from '../types';

type Status = 'connecting' | 'live' | 'offline' | 'unavailable' | 'paused';
type PresenceValue = {status:Status;peers:Peer[];selfId:string;enabled:boolean;setEnabled:(v:boolean)=>void;rename:(v:string)=>void};
const PresenceContext=createContext<PresenceValue>({status:'connecting',peers:[],selfId:'',enabled:true,setEnabled:()=>{},rename:()=>{}});
export const usePresence=()=>useContext(PresenceContext);
function stored(key:string){try{return localStorage.getItem(key)||''}catch{return ''}}
function save(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* private browsing */}}

export function PresenceProvider({children}:{children:ReactNode}){
 const [status,setStatus]=useState<Status>('connecting');
 const [peers,setPeers]=useState<Peer[]>([]),[selfId,setSelfId]=useState('');
 const [enabled,setEnabled]=useState(()=>stored('tasmin-presence-enabled')!=='off');
 const socketRef=useRef<Socket|null>(null);
 useEffect(()=>{
  save('tasmin-presence-enabled',enabled?'on':'off');
  if(!enabled){setStatus('paused');setPeers([]);setSelfId('');return}
  let disposed=false; let socket:Socket|undefined;
  const controller=new AbortController();
  const configTimeout=setTimeout(()=>controller.abort(),5000);
  setStatus('connecting');
  const connect=async()=>{
   const endpoint=import.meta.env.VITE_PRESENCE_URL?.trim();
   if(!endpoint){
    try{
     const response=await fetch(publicPath('api/presence-config'),{signal:controller.signal,cache:'no-store'});
     if(!response.ok || !(await response.json()).enabled){if(!disposed)setStatus('unavailable');return}
    }catch{if(!disposed)setStatus('unavailable');return}
    finally{clearTimeout(configTimeout)}
   }
   if(disposed)return;
   socket=io(endpoint || window.location.origin,{
    transports:['websocket','polling'],tryAllTransports:true,
    reconnection:true,reconnectionDelay:1000,reconnectionDelayMax:8000,
    timeout:8000,auth:{name:stored('tasmin-presence-name')}
   });
   socketRef.current=socket;
   socket.on('welcome',({id,peers}:{id:string;peers:Peer[]})=>{setSelfId(id);setPeers(peers);setStatus('live')});
   socket.on('roster',(next:Peer[])=>setPeers(next));
   socket.on('cursor',({id,position}:{id:string;position:Position|null})=>setPeers(prev=>prev.map(p=>p.id===id?{...p,position}:p)));
   const offline=()=>{setStatus('offline');setPeers([]);setSelfId('')};
   socket.on('disconnect',offline);socket.on('connect_error',offline);
  };
  void connect();
  let pointer:{x:number;y:number}|null=null;
  let lastEmit=0, timer:ReturnType<typeof setTimeout>|undefined;
  let lastPosition:string|undefined;
  const emit=()=>{
   timer=undefined;
   if(!socket?.connected)return;
   const target=pointer?document.elementFromPoint(pointer.x,pointer.y):null;
   const section=target?.closest('section[id]');
   let position:Position|null=null;
   if(pointer && section && !document.hidden && !document.querySelector('dialog[open]') && !target?.closest('input,textarea,select,form,[data-private],.presence-panel')){
    const box=section.getBoundingClientRect();
    position={section:section.id,x:Math.max(0,Math.min(1,(pointer.x-box.left)/box.width)),y:Math.max(0,Math.min(1,(pointer.y-box.top)/box.height))};
   }
   const key=JSON.stringify(position);
   if(key!==lastPosition){socket.volatile.emit('cursor',position);lastPosition=key}
   lastEmit=performance.now();
  };
  const schedule=()=>{if(timer)return;timer=setTimeout(emit,Math.max(0,50-(performance.now()-lastEmit)))};
  const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};schedule()};
  const hide=()=>{pointer=null;schedule()};
  const visibility=()=>{if(document.hidden)hide()};
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('blur',hide);
  document.documentElement.addEventListener('pointerleave',hide);
  document.addEventListener('visibilitychange',visibility);
  return()=>{
   disposed=true;controller.abort();clearTimeout(configTimeout);clearTimeout(timer);
   socket?.disconnect();socketRef.current=null;
   window.removeEventListener('pointermove',move);window.removeEventListener('scroll',schedule);window.removeEventListener('blur',hide);
   document.documentElement.removeEventListener('pointerleave',hide);document.removeEventListener('visibilitychange',visibility);
  };
 },[enabled]);
 const rename=(value:string)=>{const name=value.trim().slice(0,24);if(name){save('tasmin-presence-name',name);if(socketRef.current){socketRef.current.auth={name};socketRef.current.emit('rename',name)}}};
 return <PresenceContext.Provider value={{status,peers,selfId,enabled,setEnabled,rename}}>{children}</PresenceContext.Provider>;
}
export function PresenceBadge(){
 const {status,peers}=usePresence();
 return <span className={'live-badge '+(status==='live'?'is-live':'')} data-testid="live-status"><span className="status-dot"/>{status==='live'?peers.length+' online':status==='connecting'?'Connecting…':status==='paused'?'Live room paused':'Live room offline'}</span>;
}
function RemoteCursor({peer,animate}:{peer:Peer;animate:boolean}){
 const mx=useMotionValue(0),my=useMotionValue(0);
 const sx=useSpring(mx,{stiffness:600,damping:45}),sy=useSpring(my,{stiffness:600,damping:45});
 const [visible,setVisible]=useState(false);
 const initialized=useRef(false);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   const pos=peer.position;
   const element=pos && document.getElementById(pos.section);
   if(!pos||!element){setVisible(false);return}
   const rect=element.getBoundingClientRect();
   const x=rect.left+pos.x*rect.width,y=rect.top+pos.y*rect.height;
   const inView=y>=80 && y<window.innerHeight-20 && x>=0 && x<window.innerWidth-12;
   setVisible(inView);
   mx.set(x);my.set(y);
   if(!initialized.current){sx.jump(x);sy.jump(y);initialized.current=true}
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  update();
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  const observer=new ResizeObserver(schedule);observer.observe(document.body);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[peer.position,mx,my,sx,sy]);
 return <motion.div data-peer-id={peer.id} className="remote-cursor" aria-hidden="true" style={{x:animate?sx:mx,y:animate?sy:my,opacity:visible?1:0,color:peer.color}}>
 <MousePointer2 size={23} fill={peer.color} stroke="#101018" strokeWidth={1.5}/><span style={{background:peer.color}}>{peer.name}</span></motion.div>;
}
export function PresenceLayer({animate}:{animate:boolean}){
 const {peers,selfId,status,enabled,setEnabled,rename}=usePresence();
 const [open,setOpen]=useState(false);
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};
  const outside=(e:PointerEvent)=>{if(panel.current&&!panel.current.contains(e.target as Node))setOpen(false)};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside)};
 },[open]);
 const self=peers.find(p=>p.id===selfId);
 return <>
  <div className="cursor-layer">{peers.filter(p=>p.id!==selfId).map(peer=><RemoteCursor key={peer.id} peer={peer} animate={animate}/>)}</div>
  <div className="presence-dock" ref={panel} data-private>
   {open&&<div className="presence-panel" id="presence-panel">
    <div className="flex items-center justify-between"><h2>Here, together.</h2><button className="icon-button" aria-label="Close live room" onClick={()=>setOpen(false)}><X size={18}/></button></div>
    <p className="presence-explainer">{status==='live'?'These are real visitors exploring this portfolio. Move your pointer to say hello.':status==='paused'?'You’ve left the live room. You can keep exploring privately.':status==='unavailable'?'Live presence isn’t available on this host yet. You can still explore the portfolio.':status==='offline'?'Connection lost. We’ll reconnect automatically.':'Joining the live room…'}</p>
    {status==='live'&&<><ul className="peer-list">{peers.map(p=><li key={p.id}><span style={{background:p.color}} className="peer-avatar">{p.name.charAt(0)}</span><span>{p.name}{p.id===selfId&&<small> (you)</small>}</span><span className="peer-section">{p.position?.section||'Exploring'}</span></li>)}</ul>
    <form className="rename-form" onSubmit={e=>{e.preventDefault();rename(String(new FormData(e.currentTarget).get('displayName')||''))}}><label htmlFor="display-name">Your display name</label><div className="flex gap-2"><input id="display-name" name="displayName" placeholder={self?.name} maxLength={24} required autoComplete="off"/><button type="submit">Save</button></div></form>
    <p className="privacy-note">Only your display name and pointer location are shared. Form contents are never sent.</p></>}
    <button className="presence-action" onClick={()=>setEnabled(!enabled)}>{enabled?'Leave live room':'Join live room'}</button>
   </div>}
   <button aria-expanded={open} aria-controls="presence-panel" className="presence-trigger" onClick={()=>setOpen(!open)}>{status==='live'?<Radio size={17}/>:<WifiOff size={17}/>}<PresenceBadge/><Users size={16}/></button>
  </div>
 </>;
}
