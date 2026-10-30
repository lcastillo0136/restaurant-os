import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SCREENS, SCREEN_GROUPS } from '../design/prototypes/phase-0.5/assets/screen-catalog.js';
import { INITIAL_DEMO_DATA } from '../design/prototypes/phase-0.5/assets/demo-data.js';
import { UX_STATES } from '../design/prototypes/phase-0.5/assets/engine.js';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const reviewPackage=process.argv.includes('--review-package');
const proto=resolve(root,'design','prototypes','phase-0.5');
const mockups=resolve(root,'design','mockups','phase-0.4');
const read=path=>{if(!existsSync(path))throw new Error(`Ausente: ${path}`);return readFileSync(path,'utf8');};
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const fail=message=>{throw new Error(message);};

const canonical=new Map();
for(const line of read(resolve(root,'docs','design','WIREFRAMES.md')).split(/\r?\n/)){const cells=line.split('|').slice(1,-1).map(x=>x.trim());if(/^(ADM|TAB|KDS|POS|WAI)-\d{2}$/.test(cells[0]||''))canonical.set(cells[0],{title:cells[1],route:cells[5].replaceAll('`','')});}
if(canonical.size!==46)fail(`Catálogo canónico: ${canonical.size}/46`);
if(ALL_SCREENS.length!==46||new Set(ALL_SCREENS.map(x=>x.id)).size!==46)fail('Inventario de prototipo distinto de 46 IDs únicos.');
for(const screen of ALL_SCREENS){const record=canonical.get(screen.id);if(!record)fail(`ID no canónico: ${screen.id}`);if(screen.title!==record.title)fail(`${screen.id}: título contradictorio`);if(screen.route!==record.route)fail(`${screen.id}: ruta contradictoria`);if(!screen.actions.length)fail(`${screen.id}: sin respuesta interactiva`);const copy=resolve(proto,'assets','screens',screen.image);const source=resolve(mockups,'captures',screen.image);if(!existsSync(copy)||!existsSync(source))fail(`${screen.id}: imagen ausente`);if(sha(copy)!==sha(source))fail(`${screen.id}: captura copiada no coincide con mockup aprobado`);}
const screenPngs=readdirSync(resolve(proto,'assets','screens')).filter(x=>extname(x)==='.png').sort();
const approvedPngs=readdirSync(resolve(mockups,'captures')).filter(x=>extname(x)==='.png').sort();
if(JSON.stringify(screenPngs)!==JSON.stringify(approvedPngs)||screenPngs.length!==47)fail('Las 47 superficies visuales no coinciden con Fase 0.4.');
if(sha(resolve(proto,'assets','tokens.css'))!==sha(resolve(mockups,'assets','tokens.css')))fail('tokens.css del prototipo no coincide con la traducción aprobada.');

if(UX_STATES.length!==11||new Set(UX_STATES.map(x=>x[0])).size!==11)fail('Estados UX incompletos.');
const expectedGroups={admin:10,tablet:12,kds:7,pos:10,waiter:7};for(const [kind,count] of Object.entries(expectedGroups))if(SCREEN_GROUPS[kind].screens.length!==count)fail(`${kind}: ${SCREEN_GROUPS[kind].screens.length}/${count}`);
const ackActions=ALL_SCREENS.flatMap(x=>x.actions).filter(x=>x.type==='ack');if(ackActions.length<15)fail('Cobertura de ACK simulado insuficiente.');

const assets=['prototype.css','demo-data.js','engine.js','screen-catalog.js','prototype.js'];
const content=assets.map(file=>read(resolve(proto,'assets',file))).join('\n');
for(const phrase of ['ACK SIMULADO CONFIRMADO','NO CONFIRMADO','DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL','Función futura no operativa','Restablecer demo'])if(!content.includes(phrase))fail(`Salvaguarda ausente: ${phrase}`);
if(/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\b/.test(content))fail('La capa interactiva contiene red o persistencia.');
if(/https?:\/\//.test(content))fail('La capa interactiva contiene recursos externos.');
if(!content.includes('button,a{min-height:var(--target-min)}'))fail('Objetivo táctil mínimo no verificable.');
if(!INITIAL_DEMO_DATA.meta.simulated||!INITIAL_DEMO_DATA.meta.organizationId||!INITIAL_DEMO_DATA.meta.branchId)fail('Datos demo sin organización/sucursal explícitas.');
if(INITIAL_DEMO_DATA.products.some(x=>typeof x.price!=='number'))fail('Importes demo no numéricos.');

function localRefs(html,path){for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const ref=match[1];if(/^(?:https?:)?\/\//.test(ref))fail(`Recurso externo: ${path} -> ${ref}`);const part=ref.split(/[?#]/)[0];if(part&&!existsSync(resolve(dirname(path),part)))fail(`Referencia rota: ${path} -> ${ref}`);}}
for(const page of ['index.html','admin/index.html','tablet/index.html','kds/index.html','pos/index.html','waiter/index.html']){const path=resolve(proto,page);localRefs(read(path),path);}

const referenceResult=verifyOfficialReferences(root,reviewPackage);
const captures=['INDEX.png','ADM-03.png','TAB-08.png','KDS-04.png','POS-06.png','WAI-04.png','ACK-SIMULADO.png','TICKET-DEMO.png'];
function png(path){const buffer=readFileSync(path);return buffer.subarray(0,8).toString('hex')==='89504e470d0a1a0a'&&buffer.readUInt32BE(16)>=1200&&buffer.readUInt32BE(20)>=800;}
for(const file of captures){const path=resolve(proto,'captures',file);if(!existsSync(path)||!statSync(path).isFile()||!png(path))fail(`Captura real inválida o ausente: ${file}`);}

console.log('Fase 0.5 validada técnicamente:');
console.log('- 46/46 destinos, títulos, rutas e imágenes coinciden con los mockups aprobados.');
console.log('- 5 entornos, 11 estados UX y acciones con ACK simulado verificados.');
console.log('- Datos ficticios centralizados, MXN, reinicio y bloqueo offline verificados.');
console.log('- Sin backend, persistencia, recursos externos ni operaciones financieras reales.');
console.log(`- 47 superficies visuales aprobadas. ${referenceResult}`);
console.log('- 8 capturas reales del prototipo verificadas.');
