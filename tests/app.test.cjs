const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
class Element {
  constructor(tag = 'div') {
    this.tagName=tag; this.children=[]; this.className=''; this.textContent=''; this.style={}; this.value=''; this.dataset={}; this.attrs={}; this.paused=true;
    this.classList={toggle(){},remove(){}};
  }
  append(...xs){this.children.push(...xs)}
  replaceChildren(...xs){this.children=xs}
  setAttribute(k,v){this.attrs[k]=v}
  showModal(){this.open=true}
  close(){this.open=false}
  focus(){}
  scrollIntoView(){}
  setCustomValidity(v){this.validityMessage=v}
  reportValidity(){}
  querySelector(){return this.children[0] ?? new Element()}
  async play(){this.paused=false; this.onplay?.()}
  pause(){this.paused=true;this.onpause?.()}
}
const ids={}, listeners={}, storage={};
const nav=['home','search','library','liked'].map(p=>{const b=new Element('button');b.dataset.page=p;return b});
const ctx={document:{head:new Element('head'),hidden:false,getElementById:id=>ids[id]??(ids[id]=new Element()),createElement:t=>new Element(t),querySelectorAll:()=>nav,addEventListener:(event,fn)=>listeners[event]=fn},localStorage:{getItem:key=>storage[key]??null,setItem:(key,value)=>storage[key]=value},crypto:require('node:crypto').webcrypto,URL,URLSearchParams,AbortController,location:{origin:'https://example.test'},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1};
ctx.window=ctx;
vm.createContext(ctx);
const code=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
vm.runInContext(code,ctx);
function run(code){return vm.runInContext(code,ctx)}
assert.equal(run('tracks.length'),11);
assert.equal(run('visibleTracks().length'),5);
assert.equal(ids.main.children.length>5,true);
run("language='Telugu'");assert.equal(run('visibleTracks()[0].id'),6);
run("language='Independent'");assert.equal(run('visibleTracks()[0].id'),8);
for(const link of ['https://youtu.be/JGwWNGJdvx8','https://www.youtube.com/watch?v=JGwWNGJdvx8','https://music.youtube.com/watch?v=JGwWNGJdvx8']) {
  assert.equal(run(`parseYouTubeLink(${JSON.stringify(link)}).videoId`),'JGwWNGJdvx8');
}
assert.equal(run("parseYouTubeLink('https://www.youtube.com/playlist?list=PLabcdefghijk').source"),'youtube-playlist');
for(const link of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=JGwWNGJdvx8','https://user:pass@youtube.com/watch?v=JGwWNGJdvx8','http://youtube.com/watch?v=JGwWNGJdvx8','https://www.youtube.com/watch?v=bad','https://www.youtube.com:444/watch?v=JGwWNGJdvx8','https://evil.test/video.mp3']) {
  assert.equal(run(`parseYouTubeLink(${JSON.stringify(link)})`),null,link);
}
run('toggleLike(6)');assert.equal(run('state.likes.includes(6)'),true);
run('toggleLike(6)');assert.equal(run('state.likes.includes(6)'),false);
run("state.playlists.push({id:'test',name:'<script>unsafe</script>',tracks:[6,7]});navigate('test')");
assert.equal(ids.main.children[0].children[1].textContent,'<script>unsafe</script>');
run('removeTrack(state.playlists[0],6)');assert.equal(run('state.playlists[0].tracks.length'),1);
run("navigate('search')");const input=ids.main.children.find(x=>x.tagName==='form').children.find(x=>x.tagName==='input');input.value='Telugu';input.oninput();
const result=ids.main.children.find(x=>x.children[0]?.className==='section-heading');assert.equal(result.children[1].children.length,1);
// YouTube does not connect until a user opts in.
run('playTrack(6)');assert.equal(run('current'),null);assert.equal(ctx.document.head.children.length,0);assert.equal(ids.modal.open,true);
let events,loaded,pauseCount=0;
ctx.YT={Player:function(id,options){events=options.events;this.loadVideoById=id=>loaded=id;this.loadPlaylist=p=>loaded=p.list;this.setVolume=()=>{};this.setLoop=()=>{};this.setShuffle=()=>{};this.getPlayerState=()=>1;this.pauseVideo=()=>pauseCount++;this.stopVideo=()=>{};this.destroy=()=>{};this.getCurrentTime=()=>12;this.getDuration=()=>200;this.playVideo=()=>{};this.seekTo=()=>{};this.nextVideo=()=>{};this.previousVideo=()=>{};}};
const consentContent=ids.modalContent.children[0];consentContent.children.at(-1).onclick();events.onReady();
assert.equal(loaded,'79IEesucPo8');assert.equal(ids.watchZone.hidden,false);assert.equal(ids.youtubeLink.href,'https://www.youtube.com/watch?v=79IEesucPo8');
run('next()');assert.equal(loaded,'g6fnFALEseI');
ctx.document.hidden=true;listeners.visibilitychange();assert.equal(pauseCount>0,true);ctx.document.hidden=false;
events.onError({data:101});assert.match(ids.videoStatus.textContent,/does not allow embedded/);
run('stopYouTube()');assert.equal(ids.watchZone.hidden,true);assert.equal(run('current'),null);
// Demo playback remains available and uses only same-origin media.
run('playTrack(0,[0,1])');assert.equal(ids.audio.src,'assets/track-0.wav');run('next()');assert.equal(ids.audio.src,'assets/track-1.wav');
// User-added sources survive storage reload and can be liked and queued.
run("state.imports.push({id:'custom-12345678-1234-1234-1234-123456789abc',title:'Album',artist:'Saved from YouTube',language:'English',category:'Album',source:'youtube-playlist',listId:'PLabcdefghijk'});save()");
const reload={...ctx,window:null};reload.window=reload;vm.createContext(reload);vm.runInContext(code,reload);
assert.equal(vm.runInContext('tracks.length',reload),12);
assert.equal(vm.runInContext("track('custom-12345678-1234-1234-1234-123456789abc').source",reload),'youtube-playlist');
console.log('PASS: filters, URL validation, search, safe text, playlists, consent gating, YouTube controls/errors, hidden-page pause, demo playback and saved-source restoration');

(async()=>{
ctx.fetch=async()=>Response.json({code:'SEARCH_SETUP_REQUIRED',message:'Setup required'},{status:503});
run("navigate('search')");let form=ids.main.children.find(x=>x.tagName==='form');form.children[0].value='Naatu';await form.onsubmit({preventDefault(){}});
assert.match(ids.main.children.find(x=>x.className==='muted search-status').textContent,/awaiting connection/);
ctx.fetch=async()=>Response.json({items:[{videoId:'123456789ab',title:'Music &amp; <script>safe</script>',channelTitle:'Artist'}],nextPageToken:null});
run("navigate('search')");form=ids.main.children.find(x=>x.tagName==='form');form.children[0].value='Artist';await form.onsubmit({preventDefault(){}});
const result=ids.main.children.find(x=>x.className==='global-results');const row=result.children.find(x=>x.className==='discovery-row');
assert.equal(row.children[0].children[0].textContent,'Music & <script>safe</script>');row.children.at(-1).onclick();
assert.equal(run("state.imports.at(-1).videoId"),'123456789ab');assert.equal(run("state.imports.at(-1).category"),'Music');
console.log('PASS: global search setup state, safe result rendering and persistent result saving');
})().catch(error=>{console.error(error);process.exitCode=1;});
