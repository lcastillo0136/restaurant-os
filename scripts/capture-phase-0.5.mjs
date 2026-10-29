import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const edge='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port=4197;
const output=resolve(root,'design','prototypes','phase-0.5','captures');
const shots=[
  ['INDEX.png','',1600,1000],
  ['ADM-03.png','admin/index.html?capture=1&screen=ADM-03#ADM-03',1600,1000],
  ['TAB-08.png','tablet/index.html?capture=1&screen=TAB-08#TAB-08',1600,1000],
  ['KDS-04.png','kds/index.html?capture=1&screen=KDS-04#KDS-04',1600,1000],
  ['POS-06.png','pos/index.html?capture=1&screen=POS-06#POS-06',1600,1000],
  ['WAI-04.png','waiter/index.html?capture=1&screen=WAI-04#WAI-04',1600,1000],
  ['ACK-SIMULADO.png','tablet/index.html?capture=1&screen=TAB-09&state=confirmed#TAB-09',1600,1000],
  ['TICKET-DEMO.png','pos/index.html?capture=1&screen=POS-07&ticket=1#POS-07',1600,1000]
];
if(!existsSync(edge))throw new Error(`Microsoft Edge no encontrado: ${edge}`);
const server=spawn(process.execPath,[resolve(root,'scripts','serve-phase-0.5-review.mjs')],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
try{
  let ready=false;for(let i=0;i<40&&!ready;i+=1){try{ready=(await fetch(`http://127.0.0.1:${port}/`)).ok;}catch{}if(!ready)await new Promise(r=>setTimeout(r,150));}if(!ready)throw new Error('Servidor local no disponible');
  for(const [file,path,width,height] of shots){const profile=mkdtempSync(join(tmpdir(),'restaurant-os-prototype-edge-'));const target=resolve(output,file);const url=`http://127.0.0.1:${port}/${path}`;const result=spawnSync(edge,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--disable-features=msEdgeFirstRunExperience',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1',`--screenshot=${target}`,url],{cwd:root,encoding:'utf8',timeout:45000});rmSync(profile,{recursive:true,force:true});if(result.status!==0||!existsSync(target))throw new Error(`${file}: captura fallida ${result.status} ${result.stderr||result.stdout}`);console.log(`Captura real: ${file}`);}
}finally{server.kill('SIGINT');}
