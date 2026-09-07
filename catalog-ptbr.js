/* ResenhaFlix v62 — catálogos e metadados em português do Brasil. */
const CINEMETA_MANIFEST='https://v3-cinemeta.strem.io/manifest.json';
const TMDB_ORIGIN='https://94c8cb9f702d-tmdb-addon.baby-beamup.club';
// O addon aceita JSON na configuração (parseConfig), além do formato comprimido.
const TMDB_CONFIG={language:'pt-BR',provideImdbId:'true',returnImdbId:'true',catalogs:[
 {id:'tmdb.top',type:'movie',showInHome:true},{id:'tmdb.top',type:'series',showInHome:true},
 {id:'tmdb.trending',type:'movie',showInHome:true},{id:'tmdb.trending',type:'series',showInHome:true}
]};
const TMDB_PTBR_MANIFEST=TMDB_ORIGIN+'/'+encodeURIComponent(JSON.stringify(TMDB_CONFIG))+'/manifest.json';
const NETFLIX_MANIFEST='https://7a82163c306e-stremio-netflix-catalog-addon.baby-beamup.club/manifest.json';
const GENRES_PT={Action:'Ação',Adventure:'Aventura',Comedy:'Comédia',Drama:'Drama',Fantasy:'Fantasia',Romance:'Romance',Horror:'Terror','Sci-Fi':'Ficção científica','Science Fiction':'Ficção científica',Thriller:'Suspense',Crime:'Crime',Mystery:'Mistério',Biography:'Biografia',Documentary:'Documentário',Family:'Família',Animation:'Animação',Sport:'Esportes',Western:'Faroeste',War:'Guerra',History:'História',Music:'Música','TV Movie':'Filme para TV','Action & Adventure':'Ação e aventura','Sci-Fi & Fantasy':'Ficção científica e fantasia',Kids:'Infantil',News:'Notícias',Reality:'Reality',Soap:'Novela',Talk:'Entrevistas','War & Politics':'Guerra e política'};
function isTmdbManifest(url){try{return new URL(url).origin===TMDB_ORIGIN}catch{return false}}
function normalizeCatalogManifest(url){return isTmdbManifest(url)?TMDB_PTBR_MANIFEST:url}
function portugueseGenre(g){return GENRES_PT[g]||g}
function catalogParamsPT(type,params){
 const out=typeof params==='string'?Object.fromEntries(new URLSearchParams(params)): {...(params||{})};
 if(out.genre){
  const series={Action:'Action & Adventure',Adventure:'Action & Adventure',Fantasy:'Sci-Fi & Fantasy','Sci-Fi':'Sci-Fi & Fantasy',War:'War & Politics'};
  out.genre=type==='series'&&series[out.genre]?series[out.genre]:portugueseGenre(out.genre);
 }
 return out;
}
function mediaImdbId(m){
 const direct=[m?.imdb_id,m?.imdbId,m?.id].find(x=>/^tt\d+$/.test(String(x||'')));
 if(direct)return direct;
 for(const link of m?.links||[]){try{const u=new URL(link.url);if(/(^|\.)imdb\.com$/.test(u.hostname)){const id=u.pathname.match(/\/title\/(tt\d+)/)?.[1];if(id)return id}}catch{}}
 return '';
}
function normalizeVideoMeta(raw,type,manifest=''){
 if(!raw?.id||!raw?.name||raw.id==='tmdb:no-content')return null;
 const imdb=mediaImdbId(raw),fromTmdb=isTmdbManifest(manifest);
 return {...raw,id:imdb||raw.id,type:type||raw.type||'movie',imdb_id:imdb||raw.imdb_id,
  year:raw.year||String(raw.releaseInfo||'').slice(0,4),
  genres:(Array.isArray(raw.genres)?raw.genres:Array.isArray(raw.genre)?raw.genre:[]).map(portugueseGenre),
  _metadataLanguage:fromTmdb?'pt-BR':raw._metadataLanguage,
  _catalogManifest:manifest||raw._catalogManifest||''};
}
const PT_META_CACHE=new Map(),PT_META_PENDING=new Map();
const PT_TEXT_CACHE=new Map(),PT_FAILURES=new Map();
let ptSaveTimer=null;
try{for(const [key,value]of JSON.parse(localStorage.getItem('rf62_ptbr_text')||'[]'))if(value?.at>Date.now()-7*86400000)PT_TEXT_CACHE.set(key,value)}catch{}
function rememberPortuguese(m,key=`${m.type}|${m.id}`){
 if(m._metadataLanguage!=='pt-BR')return;
 const value={at:Date.now(),name:m.name,description:m.description||'',genres:m.genres||[],_metadataLanguage:'pt-BR'};
 PT_TEXT_CACHE.delete(key);PT_TEXT_CACHE.set(key,value);
 while(PT_TEXT_CACHE.size>250)PT_TEXT_CACHE.delete(PT_TEXT_CACHE.keys().next().value);
 clearTimeout(ptSaveTimer);ptSaveTimer=setTimeout(()=>{try{localStorage.setItem('rf62_ptbr_text',JSON.stringify([...PT_TEXT_CACHE]))}catch{}},800);
}
function cachedPortuguese(m){
 const cached=PT_TEXT_CACHE.get(`${m.type||'movie'}|${m.id}`);
 return cached?{...m,...cached,description:cached.description||m.description}:m;
}
async function getMetadata(type,id){
 const key=`${type}|${id}`;
 if(PT_META_CACHE.has(key))return {meta:PT_META_CACHE.get(key)};
 if(PT_META_PENDING.has(key))return PT_META_PENDING.get(key);
 const pending=(async()=>{
  const known=S.itemCache.get(key)||{};
  const sources=[...new Set([TMDB_PTBR_MANIFEST,known._catalogManifest,cfg.meta,CINEMETA_MANIFEST].filter(Boolean))];
  let lastError;
  for(const source of sources){
   if(source===TMDB_PTBR_MANIFEST&&PT_FAILURES.get(key)>Date.now())continue;
   try{
    const payload=await getJSONTimeout(api(source,`meta/${type}/${encodeURIComponent(id)}.json`),source===TMDB_PTBR_MANIFEST?6500:4500);
    const raw=payload?.meta||payload,m=normalizeVideoMeta(raw,type,source);
    if(!m)throw Error('Metadados indisponíveis');
    if(type==='series'&&!m.videos?.length&&source!==CINEMETA_MANIFEST){
     const imdb=mediaImdbId(m)||(/^tt\d+$/.test(id)?id:'');
     if(imdb){try{
      const fallback=await getJSONTimeout(api(CINEMETA_MANIFEST,`meta/series/${imdb}.json`),4500);
      if(fallback.meta?.videos?.length)m.videos=fallback.meta.videos;
     }catch{}}
    }
    // Mantém o identificador usado por cartões, Minha Lista e histórico.
    m.id=id;
    const result={...known,...m,poster:m.poster||known.poster,background:m.background||known.background};
    if(isTmdbManifest(source)){rememberPortuguese(result,key);PT_META_CACHE.set(key,result);if(PT_META_CACHE.size>50)PT_META_CACHE.delete(PT_META_CACHE.keys().next().value)}
    S.itemCache.set(key,result);
    return {meta:result};
   }catch(error){lastError=error;if(source===TMDB_PTBR_MANIFEST)PT_FAILURES.set(key,Date.now()+60000)}
  }
  throw lastError||Error('Metadados indisponíveis');
 })().finally(()=>PT_META_PENDING.delete(key));
 PT_META_PENDING.set(key,pending);return pending;
}
function clearPortugueseRequests(){PT_META_CACHE.clear();PT_FAILURES.clear();PT_DEFINITIONS=null;FRESH_PAGE_CACHE.clear()}
let PT_DEFINITIONS=null,PT_DEFINITION_KEY='';
function localizedCatalogLabel(def){
 const type=def.catalog.type==='movie'?'Filmes':'Séries',id=def.catalog.id;
 if(def.manifestUrl===NETFLIX_MANIFEST)return `Netflix · ${type}`;
 const labels={'tmdb.top':'Populares','tmdb.trending':'Em alta','tmdb.year':'Por ano','tmdb.language':'Por idioma','tmdb.latest':'Novidades',top:'Populares',year:'Por ano',imdbRating:'Melhores avaliações'};
 return labels[id]?`${labels[id]} · ${type}`:(def.catalog.name||def.sourceName).replace(/Movies/gi,'Filmes').replace(/TV Shows|Series/gi,'Séries').replace(/Popular/gi,'Populares').replace(/Trending/gi,'Em alta').replace(/Latest|New releases/gi,'Novidades');
}
// Somente cartões visíveis de fontes sem tradução geram consultas extras.
const PT_CARD_QUEUE=[];let ptActive=0,ptObserver=null;
function resetPortugueseCards(){ptObserver?.disconnect();PT_CARD_QUEUE.length=0;}
async function localizeCardElement(el){
 if(!el.isConnected)return;
 const key=`${el.dataset.type||'movie'}|${el.dataset.id}`,original=S.itemCache.get(key);
 if(!original||original._metadataLanguage==='pt-BR')return;
 try{
  const cached=cachedPortuguese(original),m=cached._metadataLanguage==='pt-BR'?cached:(await getMetadata(el.dataset.type||'movie',el.dataset.id)).meta;
  if(!el.isConnected||m._metadataLanguage!=='pt-BR')return;
  S.itemCache.set(key,{...original,...m,id:original.id});
  for(const title of el.querySelectorAll('.title,.top10Title'))title.textContent=m.name;
  for(const img of el.querySelectorAll('img'))img.alt=m.name;
 }catch{}
}
function drainPortugueseCards(){
 while(ptActive<3&&PT_CARD_QUEUE.length){
  const el=PT_CARD_QUEUE.shift();if(!el.isConnected)continue;
  ptActive++;localizeCardElement(el).finally(()=>{ptActive--;drainPortugueseCards()});
 }
}
function observePortugueseCards(root){
 if(typeof IntersectionObserver!=='function')return;
 if(!ptObserver)ptObserver=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){ptObserver.unobserve(e.target);PT_CARD_QUEUE.push(e.target)}
  drainPortugueseCards();
 },{rootMargin:'80px'});
 root.querySelectorAll('.card[data-id],.top10Card[data-id]').forEach(el=>{
  const m=S.itemCache.get(`${el.dataset.type}|${el.dataset.id}`);
  if(m?._metadataLanguage!=='pt-BR')ptObserver.observe(el);
 });
}
