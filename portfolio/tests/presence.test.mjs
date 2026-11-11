import {createServer as createHttpServer} from 'node:http';
import {chooseDevPort,isPortInUse} from '../server/port.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {io} from 'socket.io-client';
import {createPortfolioServer} from '../server/index.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const once=(socket,event)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>{socket.off(event,handler);reject(Error('Timed out waiting for '+event))},5000);const handler=value=>{clearTimeout(timer);resolve(value)};socket.once(event,handler)});
test('real presence: isolation, movement, sanitization, throttling, leave and reconnect',async()=>{
 const server=await createPortfolioServer({port:0});
 const url='http://127.0.0.1:'+server.port;const clients=[];
 const connect=async(options={})=>{const client=io(url,{transports:['websocket'],autoConnect:false,reconnection:false,...options});clients.push(client);const welcome=once(client,'welcome');client.connect();return [client,await welcome]};
 try{
  const [a,wa]=await connect({auth:{name:'Tasmin'}});
  const [b,wb]=await connect({auth:{name:'Designer'}});
  assert.notEqual(wa.id,wb.id);assert.equal(wb.peers.length,2);assert.equal(wb.peers.every(p=>p.position===null),true);
  assert.equal(a.io.engine.transport.name,'websocket');
  let ownMoves=0;a.on('cursor',()=>ownMoves++);
  const moved=once(b,'cursor');a.emit('cursor',{section:'home',x:.35,y:.45,privateValue:'must not leak'});
  const payload=await moved;assert.deepEqual(payload,{id:wa.id,position:{section:'home',x:.35,y:.45}});assert.equal(ownMoves,0);
  await delay(70);let updates=0;b.on('cursor',()=>updates++);
  a.emit('cursor',{section:'malicious-section',x:1,y:1});await delay(70);
  assert.equal(updates,0);
  a.emit('cursor',{section:'home',x:999,y:.5});await delay(70);
  assert.equal(updates,0);
  for(let i=0;i<100;i++)a.emit('cursor',{section:'work',x:.2,y:i/100});
  await delay(150);assert.ok(updates<=4,'Server limits a burst of pointer traffic');
  const rename=once(b,'roster');a.emit('rename','<script>alert(1)</script>');
  const renamed=await rename;assert.ok(!renamed.find(p=>p.id===wa.id).name.includes('<'));
  const left=once(a,'roster');b.disconnect();assert.equal((await left).length,1);
  const returning=once(b,'welcome');b.connect();const wr=await returning;assert.equal(wr.peers.length,2);assert.notEqual(wr.id,wb.id);
  const [poll,pollWelcome]=await connect({transports:['polling']});assert.equal(pollWelcome.peers.length,3);assert.equal(poll.io.engine.transport.name,'polling');
  const blocked=io(url,{autoConnect:false,reconnection:false,transports:['websocket'],extraHeaders:{Origin:'https://untrusted.example'}});clients.push(blocked);const denied=once(blocked,'connect_error');blocked.connect();await denied;
  assert.equal((await (await fetch(url+'/health')).json()).visitors,3);
 }finally{for(const c of clients)c.disconnect();await server.close()}
});

test('development startup skips an already-running frontend server',async()=>{
 const old=createHttpServer((_req,res)=>res.end('old frontend'));
 await new Promise(resolve=>old.listen(0,'127.0.0.1',resolve));
 const occupied=old.address().port;
 let fresh;
 try{
  assert.equal(await isPortInUse(occupied),true);
  const next=await chooseDevPort(occupied);
  assert.notEqual(next,occupied);
  fresh=await createPortfolioServer({port:next});
  assert.equal(await (await fetch('http://127.0.0.1:'+occupied)).text(),'old frontend');
  assert.equal((await (await fetch('http://127.0.0.1:'+next+'/api/presence-config')).json()).enabled,true);
 }finally{
  await fresh?.close();old.closeAllConnections();await new Promise(resolve=>old.close(resolve));
 }
});
