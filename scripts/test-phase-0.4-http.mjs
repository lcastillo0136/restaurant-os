import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const port=4192;
const server=spawn(process.execPath,[resolve(root,'scripts','serve-phase-0.4-review.mjs')],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
const urls=['/','/assets/tokens.css','/assets/delivery-2.css','/assets/delivery-2.js','/assets/index-delivery-2.js','/admin/index.html','/admin/delivery-2.html','/tablet/index.html','/tablet/delivery-2.html','/kds/index.html','/kds/delivery-2.html','/pos/index.html','/pos/delivery-2.html','/waiter/index.html','/waiter/delivery-2.html','/captures/ADM-02.png','/captures/WAI-07.png'];

try{
  let ready=false;
  for(let i=0;i<30&&!ready;i+=1){try{ready=(await fetch(`http://127.0.0.1:${port}/`)).ok;}catch{} if(!ready) await new Promise(r=>setTimeout(r,100));}
  if(!ready) throw new Error('Servidor HTTP local no disponible.');
  for(const path of urls){const response=await fetch(`http://127.0.0.1:${port}${path}`); if(!response.ok) throw new Error(`${path}: HTTP ${response.status}`);}
  const missing=await fetch(`http://127.0.0.1:${port}/archivo-ausente`); if(missing.status!==404) throw new Error(`404 esperado, recibido ${missing.status}`);
  console.log(`HTTP local validado: ${urls.length} recursos en 200 y ruta ausente en 404.`);
}finally{server.kill('SIGINT');}
