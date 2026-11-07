/* ResenhaFlix v70 — cache do app (PWA).
   - Página: rede primeiro, cache como reserva (sempre pega a versão nova).
   - Scripts, estilos e ícones versionados (?v=): cache primeiro. Como cada
     atualização muda o ?v=, o arquivo novo é baixado só uma vez, e as visitas
     seguintes abrem instantaneamente, sem baixar ~250 KB de JS de novo. */
const CACHE="resenhaflix-shell-v72";
const SHELL=["./","./index.html","./resenhaflix.css?v=72","./catalog-ptbr.js?v=72","./app.js?v=72","./watch-party.js?v=72","./download-menu.js?v=72","./manifest.webmanifest","./icons/resenhaflix-logo.png?v=70","./icons/icon-192.png?v=70","./icons/icon-512.png?v=70","./icons/icon-maskable-512.png?v=70"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("resenhaflix-shell-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function store(request,response){
 if(response&&response.ok)caches.open(CACHE).then(c=>c.put(request,response.clone()));
 return response;
}
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==self.location.origin)return;
 if(e.request.mode==="navigate"){
  e.respondWith(fetch(e.request).then(r=>{
   if(r.ok)caches.open(CACHE).then(c=>c.put("./index.html",r.clone()));
   return r;
  }).catch(()=>caches.match("./index.html")));
  return;
 }
 if(u.searchParams.has("v")){
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>store(e.request,r))));
  return;
 }
 e.respondWith(caches.match(e.request).then(hit=>{
  const fresh=fetch(e.request).then(r=>store(e.request,r)).catch(()=>hit);
  return hit||fresh;
 }));
});
