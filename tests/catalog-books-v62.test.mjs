import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const helper=await readFile(new URL('../catalog-ptbr.js',import.meta.url),'utf8');
function section(start,end){const a=app.indexOf(start),b=app.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,start);return app.slice(a,b)}
function context(handler){
 const calls=[],data=new Map();
 const c={URL,URLSearchParams,AbortController,console,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},setTimeout:()=>0,clearTimeout(){},window:{open:url=>calls.push(url)},S:{itemCache:new Map(),catalogCache:new Map()},getJSONTimeout:async url=>{calls.push(url);return handler(url)},FRESH_PAGE_CACHE:new Map()};
 vm.createContext(c);
 vm.runInContext(helper+'\nconst cfg={meta:TMDB_PTBR_MANIFEST};\nconst base=u=>u.replace(/\\/manifest\\.json.*$/, ""); const api=(u,p)=>base(u)+"/"+p;\n'+
  section('function normText','function searchScore')+section('function safeHttpUrl','function mediaImported')+
  section('function normalizeExtra','function catalogURL(type')+section('async function getCatalog','let listMemory')+
  section('const RF_ID_CACHE','function normTitleText')+
  section('function dlivrosSearchUrl','function bookCardHtml')+
  section('function bookFormatChoices','function archiveFileUrl')+
  section('function metaHasGenre','function categoryLabel')+
  '\nthis.config=TMDB_CONFIG;this.manifest=TMDB_PTBR_MANIFEST;',c);
 return {c,calls};
}
const {c,calls}=context(async url=>{
 const type=url.includes('/series/')?'series':'movie';
 if(url.includes('/catalog/'))return {metas:[{id:'tmdb:157',type,name:'Nome em português',genre:['Action'],links:[{url:'https://www.imdb.com/title/tt0000157/'}]}]};
 return {meta:{id:'tmdb:157',type,name:'Nome em português',imdb_id:type==='series'?'tt1000157':'tt0000157',genre:['Action'],description:'Sinopse em português.',videos:[{id:'tt1000157:2:3',season:2,episode:3,name:'Episódio três'}]}};
});
assert.equal(c.config.language,'pt-BR');assert.equal(c.config.returnImdbId,'true');assert.equal(new URL(c.manifest).origin,'https://94c8cb9f702d-tmdb-addon.baby-beamup.club');
const [a,b]=await Promise.all([c.getMetadata('series','tmdb:157'),c.getMetadata('series','tmdb:157')]);
assert.equal(calls.length,1,'deduplicate simultaneous metadata requests');assert.equal(a.meta.id,'tmdb:157');assert.equal(b.meta.videos[0].id,'tt1000157:2:3');
assert.equal(await c.resolveStreamId('series','tmdb:157:2:3',{}),'tt1000157:2:3');
assert.equal(await c.resolveStreamId('movie','tmdb:157',{}),'tt0000157','movie and series TMDB IDs have separate caches');
assert.equal(await c.resolveStreamId('series','tt1000157:2:3',{}),'tt1000157:2:3');
const catalog=await c.getCatalog(c.manifest,'movie','top',{genre:'Action'});
assert.ok(calls.at(-1).includes('/catalog/movie/tmdb.top/genre=A%C3%A7%C3%A3o.json'));
assert.equal(catalog[0].id,'tt0000157');assert.equal(catalog[0].genres[0],'Ação');assert.equal(c.metaHasGenre(catalog[0],'Action'),true);
assert.equal(c.normalizeVideoMeta({id:'tmdb:no-content',name:'API key needed'},'movie',c.manifest),null);
const failure=context(async url=>{if(url.includes('tmdb-addon'))throw Error('504');if(url.includes('/catalog/'))return{metas:[{id:'tt9',name:'Fallback'}]};return{meta:{id:'tt9',name:'Fallback',videos:[{id:'tt9:1:1'}]}}});
assert.equal((await failure.c.getMetadata('series','tt9')).meta.id,'tt9');
assert.equal((await failure.c.getCatalog(failure.c.manifest,'movie','tmdb.top'))[0].name,'Fallback');
assert.ok(failure.calls.at(-1).includes('/catalog/movie/top.json'),'fallback uses the Cinemeta catalog ID');
assert.equal(c.dlivrosBookUrl({title:'Phantastes',authors:'MacDonald, George'}),'https://dlivros.com/livro/phantastes-george-macdonald');
assert.equal(c.dlivrosBookUrl({title:'Livro & Autor / edição'}),'https://dlivros.com/Buscar?q=Livro%20%26%20Autor%20%2F%20edi%C3%A7%C3%A3o');
assert.equal(c.verifiedDlivrosUrl('https://dlivros.com.evil.test/livro/teste'),'');assert.equal(c.verifiedDlivrosUrl('javascript:alert(1)'),'');
assert.equal(c.dlivrosBookUrl({title:'Qualquer',dlivrosUrl:'https://dlivros.com/livro/phantastes-george-macdonald'}),'https://dlivros.com/livro/phantastes-george-macdonald');
const book={publicDomain:true,formats:{'application/epub+zip':'https://example.test/a.epub','application/pdf':'https://example.test/a.pdf','application/x-mobipocket-ebook':'https://example.test/a.mobi'}};
assert.equal(c.bestBookRead(book).kind,'pdf');assert.equal(c.bestBookDownload(book).kind,'pdf');assert.equal(c.bestBookDownload({...book,publicDomain:false}),null);

const partial=context(async url=>url.includes('tmdb-addon')?{meta:{id:'tmdb:9',imdb_id:'tt9',name:'Série em português'}}:{meta:{id:'tt9',name:'Show',videos:[{id:'tt9:1:1',season:1,episode:1}]}});
assert.equal((await partial.c.getMetadata('series','tt9')).meta.videos[0].id,'tt9:1:1','missing TMDB episodes fall back to Cinemeta');

console.log('v62: PT-BR, catalog fallback, IMDb episode IDs, dLivros links and book formats OK');
