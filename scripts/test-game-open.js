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
 for(const id of ids){try{w.eval(source(id));}catch(e){throw Error(lang+' '+id+' initialization: '+e.message);}}
 const games=[['openFundlabor','fundlabor-modal'],['openBefundlabor','bf-modal'],['openForschungsreise','journey87']];
 for(const [fn,id] of games){
  assert.equal(typeof w[fn],'function',lang+': '+fn+' is not a function');
  try{w[fn]();}catch(e){throw Error(lang+' '+fn+' failed to open: '+e.stack);}
  const panel=w.document.getElementById(id);
  assert(panel,lang+': missing '+id+' after opening');
  assert(panel.textContent.trim().length>40,lang+': '+id+' has no meaningful content');
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
  panel.remove();
 }
 // Keep the short-lived DOM alive until Node exits: localization uses queued observers.
 console.log('PASS '+lang+': all three games open and render content');
}
(async()=>{await run('de');await run('en');})().catch(err=>{console.error(err);process.exitCode=1;});
