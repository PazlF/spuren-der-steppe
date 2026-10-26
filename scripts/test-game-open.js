#!/usr/bin/env node
// Browser-like game smoke test. Run: npm install --no-save jsdom@26 && node scripts/test-game-open.js
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const ids=['fundlabor-v84-js','befundlabor-86-js','journey87-script','museum-overlay-english-v1'];
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
function source(id){const found=scripts.find(([,attrs])=>attrs.includes('id="'+id+'"'));assert(found,'Missing script '+id);return found[2];}
async function run(lang){
 const dom=new JSDOM('<!doctype html><html lang="'+lang+'"><body><div id="app"></div></body></html>',{url:'https://museum.example/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 const gradient={addColorStop(){}};
 const context=new Proxy({createLinearGradient(){return gradient},createRadialGradient(){return gradient},getImageData(){return {data:new Uint8ClampedArray(4)}}},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 w.HTMLCanvasElement.prototype.getContext=function(){return context;};
 w.SKYTHEN_RESIDUE_103=()=>({mask:new Uint8Array(24*18).fill(1),total:24*18});
 for(const id of ids){try{w.eval(source(id));}catch(e){throw Error(lang+' '+id+' initialization: '+e.message);}}
 const games=[['openFundlabor','fundlabor-modal'],['openBefundlabor','bf-modal'],['openForschungsreise','journey87']];
 for(const [fn,id] of games){
  assert.equal(typeof w[fn],'function',lang+': '+fn+' is not a function');
  try{w[fn]();}catch(e){throw Error(lang+' '+fn+' failed to open: '+e.stack);}
  const panel=w.document.getElementById(id);
  assert(panel,lang+': missing '+id+' after opening');
  assert(panel.textContent.trim().length>40,lang+': '+id+' has no meaningful content');
  // Language regression guard: visible game headings must follow the selected language.
  // This is deliberately focused on stable headings, not untranslated archaeological data.
  const headings={
   'fundlabor-modal':{de:'Wohin gehört der Fund?',en:'Where does this artifact belong?'},
   'bf-modal':{de:'Fundstelle sichern',en:'Record the findspot'},
   'journey87':{de:'Welchen Fund möchtest du erforschen?',en:'Which artifact would you like to explore?'}
  };
  // The journey overlay localizes via MutationObserver on the next microtask.
  await new Promise(resolve=>setImmediate(resolve));
  const expected=headings[id][lang];
  const heading=panel.querySelector('h1')?.textContent.trim()||'';
  assert.equal(heading,expected,lang+': untranslated or unexpected '+id+' heading');
  const interfaceChecks={
   'fundlabor-modal':[['.fl-close','Spiel verlassen','Exit activity'],['.fl-again','Noch einmal spielen','Play again']],
   'bf-modal':[['#bf-save','Dokumentation sichern','Record observation'],['#bf-restart','Neu starten','Restart']],
   'journey87':[['#j87-close','Beenden','Exit']]
  };
  for(const [selector,german,english] of interfaceChecks[id]){
   const element=panel.querySelector(selector);
   assert(element,lang+': missing '+selector+' in '+id);
   const visible=element.textContent.trim();
   assert(visible.includes(lang==='en'?english:german),lang+': language mismatch in '+id+' '+selector+': '+visible);
  }
  if(id==='fundlabor-modal'){
   const picks=[['hirsch','kleidung'],['eber','pferd'],['greif','kleidung'],['trense','pferd'],['rosette','kleidung']];
   const byItem=item=>panel.querySelector('.fl-card[data-item="'+item+'"]');
   const byGroup=group=>panel.querySelector('.fl-target[data-group="'+group+'"]');
   assert.equal(panel.querySelector('#fl-finish').hidden,true,lang+': completion appears too early');
   byItem('hirsch').click();
   byGroup('pferd').click(); // intentionally incorrect
   assert.equal(byItem('hirsch').disabled,false,lang+': incorrect match disabled the artifact');
   assert.equal(panel.querySelector('#fl-progress-text').textContent.includes('0'),true,lang+': wrong match changed progress');
   for(let i=0;i<picks.length;i++){
    const [item,group]=picks[i];
    byItem(item).click();byGroup(group).click();
    assert.equal(byItem(item).disabled,true,lang+': correct match did not finish '+item);
    assert.equal(panel.querySelector('#fl-progress').style.width,(i+1)*20+'%',lang+': progress bar mismatch');
   }
   assert.equal(panel.querySelector('#fl-finish').hidden,false,lang+': completion remains hidden');
   panel.querySelector('.fl-again').click();
   assert.equal(panel.querySelector('#fl-finish').hidden,true,lang+': replay did not reset completion');
   assert.equal(byItem('hirsch').disabled,false,lang+': replay did not reactivate cards');
   console.log('PASS '+lang+': Artifact Lab rejects wrong matches, completes all five and replays');
  }
  if(id==='bf-modal'){
   const q=sel=>panel.querySelector(sel);
   assert.equal(q('#bf-save').disabled,true,lang+': save should start disabled');
   assert.equal(q('#bf-observe').hidden,true,lang+': observation should be locked');
   q('[data-place="left"]').click();
   assert.equal(q('#bf-save').disabled,false,lang+': placing marker did not enable save');
   q('#bf-save').click();
   assert.equal(q('#bf-observe').hidden,false,lang+': observation did not unlock');
   assert.equal(q('#bf-question').hidden,true,lang+': interpretation unlocked too soon');
   q('[data-clue="soil"] button').click();
   assert.equal(q('#bf-question').hidden,true,lang+': one clue unlocked final question');
   q('[data-clue="stones"] button').click();
   assert.equal(q('#bf-question').hidden,false,lang+': second clue did not unlock final question');
   q('[data-answer="no"]').click();
   assert.equal(q('#bf-summary').hidden,true,lang+': unsupported answer completed report');
   q('[data-answer="yes"]').click();
   assert.equal(q('#bf-summary').hidden,false,lang+': correct answer did not reveal report');
   q('#bf-restart').click();
   const fresh=w.document.getElementById('bf-modal');
   assert(fresh&&fresh!==panel,lang+': restart did not rebuild laboratory');
   assert.equal(fresh.querySelector('#bf-save').disabled,true,lang+': restart did not reset marker');
   assert.equal(fresh.querySelector('#bf-summary').hidden,true,lang+': restart did not reset report');
   fresh.remove();
   console.log('PASS '+lang+': Field Lab documentation, both clues, feedback and restart');
  }
  if(id==='journey87'){
   const cards=[...panel.querySelectorAll('[data-choose]')];
   assert.equal(cards.length,7,lang+': research journey must offer seven artifacts');
   for(const card of cards){
    const item=card.dataset.choose;
    card.click();
    const next=w.document.getElementById('j87-next');
    assert(next,lang+': excavation stage did not render for '+item);
    assert.equal(next.disabled,true,lang+': excavation bypasses uncovering for '+item);
    assert(w.document.getElementById('j87-canvas'),lang+': excavation canvas missing for '+item);
    w.openForschungsreise();
   }
   // Exercise stage 2 without bypassing the excavation: advance the internal
   // state through the stage-one completion event used by the journey controller.
   const journeyScript=source('journey87-script');
   // Re-evaluate only a test accessor in the same closure by injecting a hook.
   // The hook is installed before user interactions in a separate isolated DOM.
   const testSource=journeyScript.replace('window.openForschungsreise=open;', 'window.__journeyTest={chooseObject,drawDocument,drawStudy,drawReport,next,getStep:()=>step};window.openForschungsreise=open;');
   const isolated=new JSDOM('<!doctype html><html lang="'+lang+'"><body></body></html>',{url:'https://museum.example/',runScripts:'outside-only',pretendToBeVisual:true});
   const iw=isolated.window;
   iw.HTMLElement.prototype.scrollIntoView=function(){};
   iw.HTMLCanvasElement.prototype.getContext=function(){return context;};
   iw.SKYTHEN_RESIDUE_103=()=>({mask:new Uint8Array(24*18).fill(1),total:24*18});
   iw.eval(testSource);
   iw.openForschungsreise();
   iw.__journeyTest.chooseObject({id:'hirsch',name:'Goldhirsch',inv:'24.97.55',image:'assets/photos/hirsch.jpg'});
   iw.__journeyTest.next(); // test harness: simulate successful completion of excavation
   assert.equal(iw.__journeyTest.getStep(),1,lang+': did not advance to documentation');
   const doc=iw.document;
   assert.equal(doc.getElementById('j87-next').disabled,true,lang+': undocumented position allowed progression');
   doc.getElementById('j87-plan').dispatchEvent(new iw.MouseEvent('click',{bubbles:true,clientX:0,clientY:0}));
   assert.equal(doc.getElementById('j87-next').disabled,true,lang+': position selection bypassed documentation');
   doc.getElementById('j87-save').click();
   assert.equal(doc.getElementById('j87-next').disabled,false,lang+': saved position did not unlock study');
   assert(doc.getElementById('j87-coord').textContent.includes('✓'),lang+': position save not confirmed');
   doc.getElementById('j87-next').click();
   assert.equal(iw.__journeyTest.getStep(),2,lang+': study stage not reached after documentation');
   const frame=doc.getElementById('j88-photo-frame');
   assert(frame,lang+': investigation photo missing');
   iw.Element.prototype.setPointerCapture=function(){};
   frame.getBoundingClientRect=()=>({left:0,top:0,width:400,height:300,right:400,bottom:300});
   Object.defineProperty(frame,'clientWidth',{configurable:true,value:400});
   Object.defineProperty(frame,'clientHeight',{configurable:true,value:300});
   const good=doc.getElementById('j87-good'),bad=doc.getElementById('j87-bad');
   assert.equal(good.disabled,true,lang+': answer enabled without identifying a detail');
   assert.equal(doc.getElementById('j87-next').disabled,true,lang+': report available before evidence');
   const pointer=(type,x,y,id=1)=>{
    const ev=new iw.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0});
    Object.defineProperty(ev,'pointerId',{value:id});
    Object.defineProperty(ev,'pointerType',{value:'touch'});
    frame.dispatchEvent(ev);
   };
   pointer('pointerdown',200,150);pointer('pointerup',200,150);
   assert.equal(good.disabled,false,lang+': identifying the photograph detail did not unlock answers');
   bad.click();
   assert.equal(doc.getElementById('j87-next').disabled,true,lang+': incorrect interpretation unlocked report');
   good.click();
   assert.equal(doc.getElementById('j87-next').disabled,false,lang+': correct answer did not unlock report');
   doc.getElementById('j87-next').click();
   assert.equal(iw.__journeyTest.getStep(),3,lang+': research report not reached');
   assert(doc.querySelector('.j87-paper')?.textContent.includes('Goldhirsch'),lang+': report missing artifact');
   assert(doc.querySelector('.j87-paper')?.textContent.includes('Übungsraster'),lang+': report missing documented grid');
   console.log('PASS '+lang+': study requires photo evidence and correct answer before report');
   console.log('PASS '+lang+': research journey documentation gates the investigation stage');
   console.log('PASS '+lang+': all seven journey choices open the excavation stage');
  }
  panel.remove();
 }
 // Keep the short-lived DOM alive until Node exits: localization uses queued observers.
 console.log('PASS '+lang+': all three games open and render content');
}
(async()=>{await run('de');await run('en');})().catch(err=>{console.error(err);process.exitCode=1;});
