/* Yang offline support: use the newest copy when online, the saved copy when offline */
const CACHE='yang-v1';
const CORE=['./','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('yang-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
const own=u.origin===location.origin,font=/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(!own&&!font)return;
e.respondWith((async()=>{const c=await caches.open(CACHE),key=r.mode==='navigate'?'./':r,saved=await c.match(key,{ignoreVary:true});
if(font&&saved)return saved;
const net=fetch(r).then(async res=>{if(res.ok||res.type==='opaque')await c.put(key,res.clone());return res});
if(!saved)return net;
const slow=new Promise(ok=>setTimeout(()=>ok(saved),3000));
return Promise.race([net.then(res=>res.ok?res:saved,()=>saved),slow])})())});
