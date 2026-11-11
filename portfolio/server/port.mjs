import {createConnection} from 'node:net';

// Probe before listening: on Windows an older listener can otherwise keep serving
// a more specific loopback address while a wildcard listener starts successfully.
export function isPortInUse(port, host='127.0.0.1') {
 return new Promise(resolve=>{
  const socket=createConnection({port,host:host==='0.0.0.0'?'127.0.0.1':host});
  let done=false;
  const finish=value=>{if(done)return;done=true;socket.destroy();resolve(value)};
  socket.once('connect',()=>finish(true));
  socket.once('error',error=>finish(error.code!=='ECONNREFUSED'));
  socket.setTimeout(700,()=>finish(true));
 });
}
export async function chooseDevPort(preferred=5173,host='127.0.0.1'){
 for(let port=preferred;port<Math.min(preferred+20,65536);port++){
  if(!await isPortInUse(port,host))return port;
 }
 throw new Error('No free development port found. Stop an old dev server or set PORT to a free port.');
}
