/* Yang service worker: always tries the network first so players get new versions,
   and falls back to the saved copy when there is no internet (so the installed app works offline). */
const CACHE='yang-offline';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!ok)return;
  e.respondWith(
    fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{})}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html')||caches.match('./')))
  );
});
