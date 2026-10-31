import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { verifyOfficialReferences } from './official-reference-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reviewPackage = process.argv.includes('--review-package');
const mockupRoot = resolve(root, 'design', 'mockups', 'phase-0.4');
const tokenRoot = resolve(root, 'design', 'tokens');
const read = path => { if (!existsSync(path)) throw new Error(`Ausente: ${path}`); return readFileSync(path, 'utf8'); };
const fail = message => { throw new Error(message); };
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');

const canonical = new Map();
for (const line of read(resolve(root,'docs','design','WIREFRAMES.md')).split(/\r?\n/)) {
  const cells=line.split('|').slice(1,-1).map(x=>x.trim());
  if(!/^(ADM|TAB|KDS|POS|WAI)-\d{2}$/.test(cells[0]||'')) continue;
  canonical.set(cells[0],{title:cells[1],route:cells[5].replaceAll('`','')});
}
if(canonical.size!==46) fail(`Catálogo canónico: ${canonical.size}/46`);

const approvedIds=['ADM-02','TAB-01','TAB-03','KDS-01','POS-03','WAI-02'];
const environments=[
  ['admin','admin-light',['ADM-01','ADM-03','ADM-04','ADM-05','ADM-06','ADM-07','ADM-08','ADM-09','ADM-10']],
  ['tablet','customer-warm',['TAB-02','TAB-04','TAB-05','TAB-06','TAB-07','TAB-08','TAB-09','TAB-10','TAB-11','TAB-12']],
  ['kds','kitchen-dark',['KDS-02','KDS-03','KDS-04','KDS-05','KDS-06','KDS-07']],
  ['pos','pos-light',['POS-01','POS-02','POS-04','POS-05','POS-06','POS-07','POS-08','POS-09','POS-10']],
  ['waiter','customer-warm',['WAI-01','WAI-03','WAI-04','WAI-05','WAI-06','WAI-07']],
];
const newIds=environments.flatMap(x=>x[2]);
if(new Set(newIds).size!==40) fail('Los IDs nuevos no son 40 únicos.');
if(new Set([...approvedIds,...newIds]).size!==46) fail('Cobertura total distinta de 46.');

const deliveryJs=read(resolve(mockupRoot,'assets','delivery-2.js'));
const indexJs=read(resolve(mockupRoot,'assets','index-delivery-2.js'));
const deliveryCss=read(resolve(mockupRoot,'assets','delivery-2.css'));
new Function(deliveryJs); new Function(indexJs);
const catalogRecords=new Map();
for(const match of deliveryJs.matchAll(/'(ADM|TAB|KDS|POS|WAI)-(\d{2})':\['([^']+)','([^']+)'\]/g)) catalogRecords.set(`${match[1]}-${match[2]}`,{title:match[3],route:match[4]});
if(catalogRecords.size!==46) fail(`Catálogo del visor: ${catalogRecords.size}/46`);
for(const [id,record] of canonical){
  const visual=catalogRecords.get(id);
  if(!visual) fail(`ID sin mockup: ${id}`);
  if(visual.title!==record.title) fail(`${id}: título contradictorio`);
  if(visual.route!==record.route) fail(`${id}: ruta contradictoria ${visual.route} != ${record.route}`);
  if(!indexJs.includes(`'${id}'`)) fail(`Índice dinámico sin ${id}`);
}

function localReferences(html,path){
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const reference=match[1];
    if(/^(?:https?:)?\/\//.test(reference)) fail(`Recurso externo en ${path}: ${reference}`);
    const part=reference.split(/[?#]/)[0]; if(!part) continue;
    if(!existsSync(resolve(dirname(path),part))) fail(`Referencia rota en ${path}: ${reference}`);
  }
}
for(const [folder,theme,ids] of environments){
  const page=resolve(mockupRoot,folder,'delivery-2.html'); const html=read(page); localReferences(html,page);
  const match=html.match(/window\.DELIVERY2_CONFIG\s*=\s*(\{[\s\S]*?\});/); if(!match) fail(`Config ausente: ${folder}`);
  const context={window:{}}; vm.runInNewContext(`window.DELIVERY2_CONFIG=${match[1]}`,context);
  const cfg=context.window.DELIVERY2_CONFIG;
  if(cfg.theme!==theme) fail(`${folder}: tema incorrecto`);
  if(JSON.stringify([...cfg.newIds])!==JSON.stringify(ids)) fail(`${folder}: IDs nuevos incorrectos`);
  for(const id of cfg.allIds) if(!canonical.has(id)) fail(`${folder}: ID no canónico ${id}`);
}
const indexPath=resolve(mockupRoot,'index.html'); localReferences(read(indexPath),indexPath);

for(const phrase of ['Pendiente ACK','ACK servidor','Sin conexión','Sin permiso','Validación','Conflicto','Cancelación','Muestra documental: se recibió un ACK válido','no está confirmada','mutaciones bloqueadas','Resumen del turno','Resumen de caja']) if(!deliveryJs.includes(phrase)) fail(`Salvaguarda ausente: ${phrase}`);
if(!deliveryJs.includes("'KDS-07'" )||!deliveryJs.includes('Sin conexión · no sincronizado')) fail('KDS-07 no documenta desconexión coherente.');
if(/\b(?:Restro|FoodCourt|Fascano)\b/.test(`${deliveryJs}\n${indexJs}\n${deliveryCss}`)) fail('Marca comercial copiada.');
if(/https?:\/\//.test(`${deliveryJs}\n${indexJs}\n${deliveryCss}`)) fail('Recursos externos en visor.');
if(/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage)\b/.test(deliveryJs)) fail('El visor contiene lógica de red o persistencia.');
for(const required of ['button, .d2-touch { min-height: var(--target-min); }','.d2-kds .d2-primary, .d2-kds .d2-secondary { min-height: 52px;','.d2-pos__rail span { display: grid; min-width: 66px; min-height: 58px;','.d2-waiter__bottom span { display: grid; min-height: 58px;']) if(!deliveryCss.includes(required)) fail(`Objetivo táctil no verificable: ${required}`);

const approvedHashes=new Map([
  ['assets/tokens.css','a7e0594b96ee18db926b58d0e3b34f35e3aee640b7ea36b6d86aca47def23c20'],['assets/mockups.css','861ee8ab3c9fd872f4726eefa3670f1572761ff0207b3bfe9eea52b74e9774b2'],['assets/mockups.js','bd6b5591802054a16e53ce6e8cf13f0849cd986574cdbacab8b551368781651f'],['admin/index.html','302d2ee0433ba024347c2d1ba8e502e2e5c19d1a87186c78ba052281e869c747'],['tablet/index.html','486634ff73cdc982f6bafa67501bcbfb641a167cd46231cbe47d85a5384f3fa2'],['kds/index.html','7d3f4e35492896b45c65aeb7edf718bdd850d2b70fcb6901edddd26f766c163f'],['pos/index.html','a07c8a82d22ef9505f9d221487d699189705064db4f0fc48792dc306ca89732c'],['waiter/index.html','35c3e51b830b77155f8552afb8693b793fe980a7d078559764cededf7217a24a'],
  ['captures/ADM-02.png','278fe92d6726ea89311c07dfb0dce51f551ac9895f6a909102d28a7b6d337846'],['captures/TAB-01.png','c54582af56bf5f988e210411dc6ee53294cab2924b70ca17aeabd914c5f704cf'],['captures/TAB-03.png','2fc3b97f525fbd159f6f43729efb90dee8baa22400dde7a14a960dae3f262395'],['captures/TAB-03-horizontal.png','89a354a769c0aed6e7c573fe151310a21068a9a3ddbab420de5680f3d6ce39ed'],['captures/KDS-01.png','9047cf57a3e65d7328651c9a1a6a66d6c7083a37b42fd62159513d7d34e10e19'],['captures/POS-03.png','4f383258f08603bb4be37e34f79064bcff6537f182d33cd8985d830b4ee9b1fc'],['captures/WAI-02.png','a43fa7edf0da09953fe2b8f2a62a2c3eaceb499bc71ba55974dd2d412917abba'],
]);
for(const [file,expected] of approvedHashes) if(sha(resolve(mockupRoot,file))!==expected) fail(`Mockup aprobado alterado: ${file}`);

const tokenFiles=['colors.json','components.json','elevation.json','motion.json','radius.json','spacing.json','typography.json'];
const actualTokens=readdirSync(tokenRoot).filter(x=>extname(x)==='.json').sort();
if(JSON.stringify(actualTokens)!==JSON.stringify([...tokenFiles].sort())) fail('Regresión de siete tokens fallida.');
for(const file of tokenFiles) JSON.parse(read(resolve(tokenRoot,file)));
const colors=JSON.parse(read(resolve(tokenRoot,'colors.json'))); const tokensCss=read(resolve(mockupRoot,'assets','tokens.css'));
for(const [theme,values] of Object.entries(colors.themes)) for(const [name,value] of Object.entries(values)) if(!tokensCss.includes(`--${name}: ${value};`)) fail(`${theme}.${name} no está traducido`);
if(!tokensCss.includes('--target-min: 48px;')) fail('Mínimo táctil distinto de 48 px.');

const referenceResult=verifyOfficialReferences(root,reviewPackage);

function pngDimensions(path){ const b=readFileSync(path); if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') fail(`PNG inválido: ${path}`); return [b.readUInt32BE(16),b.readUInt32BE(20)]; }
const approvedCaptureNames=[...approvedHashes.keys()].filter(x=>x.startsWith('captures/')).map(x=>x.slice(9));
const expectedCaptures=[...newIds.map(id=>`${id}.png`),...approvedCaptureNames].sort();
const actualCaptures=readdirSync(resolve(mockupRoot,'captures')).filter(x=>extname(x)==='.png').sort();
if(JSON.stringify(actualCaptures)!==JSON.stringify(expectedCaptures)) fail(`Capturas: ${actualCaptures.length}/${expectedCaptures.length}`);
for(const file of actualCaptures){ const path=resolve(mockupRoot,'captures',file); if(!statSync(path).isFile()) fail(`Captura no es archivo: ${file}`); const [w,h]=pngDimensions(path); if(w<1000||h<900) fail(`${file}: dimensión insuficiente ${w}×${h}`); }

console.log('Fase 0.4 · Entrega 2 validada técnicamente:');
console.log('- 46/46 IDs, títulos y rutas coinciden con WIREFRAMES.md.');
console.log('- 40 mockups nuevos y 6 aprobados disponibles en el índice.');
console.log('- 15 fuentes/capturas aprobadas conservan su SHA-256.');
console.log('- 47 PNG reales válidos (46 pantallas + variante horizontal TAB-03).');
console.log('- 4 temas, 7 tokens, objetivos táctiles y recursos locales verificados.');
console.log('- Estados UX/ACK, KDS desconectado y resúmenes POS contextuales verificados.');
console.log(`- ${referenceResult}`);
