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
 for(const id of ids){try{w.eval(source(id));}catch(e){throw Error(lang+' '+id+' initialization: '+e.message);}}
 const games=[['openFundlabor','fundlabor-modal'],['openBefundlabor','bf-modal'],['openForschungsreise','journey87']];
 for(const [fn,id] of games){
  assert.equal(typeof w[fn],'function',lang+': '+fn+' is not a function');
  try{w[fn]();}catch(e){throw Error(lang+' '+fn+' failed to open: '+e.stack);}
  const panel=w.document.getElementById(id);
  assert(panel,lang+': missing '+id+' after opening');
  assert(panel.textContent.trim().length>40,lang+': '+id+' has no meaningful content');
  panel.remove();
 }
 // Keep the short-lived DOM alive until Node exits: localization uses queued observers.
 console.log('PASS '+lang+': all three games open and render content');
}
(async()=>{await run('de');await run('en');})().catch(err=>{console.error(err);process.exitCode=1;});
