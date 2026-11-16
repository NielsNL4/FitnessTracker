import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await mkdir('dist/licenses',{recursive:true});
for(const name of ['react','react-dom','scheduler','idb','zod','lucide-react','@fontsource/inter','@fontsource/space-grotesk']) {
 await copyFile(`node_modules/${name}/LICENSE`,`dist/licenses/${name.replaceAll('/','-').replace('@','')}.txt`);
}
async function walk(path) { const out=[]; for(const e of await readdir(path,{withFileTypes:true})) {const p=path+'/'+e.name; if(e.isDirectory()) out.push(...await walk(p));else out.push(p);}return out; }
const files=(await walk('dist')).filter(p=>!p.endsWith('/sw.js'));
const hash=createHash('sha256');for(const f of files) hash.update(await readFile(f));
const version=hash.digest('hex').slice(0,12);
await writeFile('dist/sw.js', `const SHELL_PREFIX='workout-shell-v2-'+encodeURIComponent(self.registration.scope)+'::';
const SHELL=SHELL_PREFIX+'${version}',MEDIA='workout-media-v2-'+encodeURIComponent(new URL(self.registration.scope).pathname);
let mediaWrites=Promise.resolve();
const FILES=${JSON.stringify(files.map(p=>'./'+p.slice(5)))};
self.addEventListener('install',e=>e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(SHELL_PREFIX)&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 // Static shell responses are identical across Origin request headers. Preview
 // servers may send Vary: Origin; module requests and install-time precaching
 // otherwise fail to match each other when offline.
 if(u.origin===location.origin){e.respondWith(caches.open(SHELL).then(async c=>(await c.match(e.request,{ignoreVary:true}))||fetch(e.request).catch(()=>e.request.mode==='navigate'?c.match('./index.html',{ignoreVary:true}):Response.error())));return;}
 if(u.origin==='https://raw.githubusercontent.com'&&!u.search&&/^\\/hasaneyldrm\\/exercises-dataset\\/7455efae41b330c265e7cd4b78dfa848e7ce5ebd\\/(images\\/[A-Za-z0-9_-]+\\.jpg|videos\\/[A-Za-z0-9_-]+\\.gif)$/.test(u.pathname))e.respondWith(caches.open(MEDIA).then(async c=>{
  const hit=await c.match(e.request);if(hit)return hit;
  // UI requests anonymous CORS images; raw GitHub supplies ACAO: *.
  const r=await fetch(e.request);
  if(r.ok){const copy=r.clone();mediaWrites=mediaWrites.then(async()=>{await c.put(e.request,copy);const keys=await c.keys();for(const k of keys.slice(0,Math.max(0,keys.length-40)))await c.delete(k);}).catch(()=>{});await mediaWrites;}
  return r;
 }));
});`);
console.log(`Offline shell ${version}: ${files.length} local files; media cache bounded to 40 requested files.`);
