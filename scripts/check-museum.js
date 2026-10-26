#!/usr/bin/env node
// Offline smoke test: checks inline game scripts before a museum preview is deployed.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs]) => !/\bsrc\s*=/.test(attrs))
  .map(([, attrs, code]) => ({ id: attrs.match(/\bid="([^"]+)"/)?.[1] || 'inline', code }));
assert(scripts.length >= 7, 'Expected embedded game scripts');
for (const script of scripts) {
  try { new vm.Script(script.code, { filename: script.id + '.js' }); }
  catch (err) { throw new Error('Syntax error in '+ script.id + ': ' + err.message); }
}
const fund = scripts.find(s => s.id === 'fundlabor-v84-js');
assert(fund, 'Artifact Lab script missing');
const table = fund.code.indexOf('const enLab=');
assert(table >= 0, 'Artifact Lab English dictionary missing');
const premature = fund.code.slice(0, table).match(/\b(?:Object\.assign\(enLab|enLab\[|labText\()/);
assert(!premature, 'Artifact Lab uses its language dictionary before initialization');
assert(fund.code.includes('window.openFundlabor=open'), 'Artifact Lab open handler missing');
assert(html.includes('onclick="window.openFundlabor()"'), 'Artifact Lab launch button missing');
assert(html.includes('window.openBefundlabor=open'), 'Field Lab open handler missing');
assert(html.includes('window.openForschungsreise'), 'Research journey open handler missing');
assert(html.includes("lang:'de'"), 'Default German mode missing');
// Validate photograph touch markers and their numbering for every museum artifact.
const detailMatch=html.match(/window\.SKYTHEN_DETAILS\s*=\s*(\{[\s\S]*?\n\});/);
assert(detailMatch, 'Touch-feature coordinate dataset missing');
const details=vm.runInNewContext('('+detailMatch[1]+')');
const counts={hirsch:4,greif:4,eber:4,trense:5,scheide:4,rosette:4,reiter:5};
let total=0;
for(const [id,count] of Object.entries(counts)){
 const entry=details[id];assert(entry, 'Missing touch features for '+id);
 assert.equal(entry.spots.length,count,id+': incorrect feature count');
 const labels=new Set(),positions=new Set();
 for(const [i,spot] of entry.spots.entries()){
  assert(Number.isFinite(spot.x)&&Number.isFinite(spot.y),id+': point '+(i+1)+' is not numeric');
  assert(spot.x>=5&&spot.x<=95&&spot.y>=5&&spot.y<=95,id+': point '+(i+1)+' outside safe image region');
  assert(typeof spot.label==='string'&&spot.label.trim(),id+': point '+(i+1)+' missing label');
  assert(!labels.has(spot.label),id+': repeated feature label '+spot.label);
  labels.add(spot.label);
  const key=spot.x+','+spot.y;assert(!positions.has(key),id+': numbers overlap at '+key);
  positions.add(key);
 }
 total+=count;
}
assert.equal(total,30,'Total number of photo touch features changed unexpectedly');
assert(/d\.spots\.map\(\(sp,i\)=>`<button[^\n]+class="touch-hotspot/.test(html),'Photo marker loop missing');
assert(html.includes('data-index="${i}" aria-label="Detail ${i+1}:'),'Photo markers must have matching zero-based indices and visible one-based numbers');
assert(html.includes('class="lab-pill')&&html.includes('>${found.has(i)?\'✓\':i+1}<span class="visually-hidden">'),'Feature list must use the same numbering');
console.log('PASS: all 30 photo markers have valid, unique coordinates and matching 1-based index numbering.');
console.log('PASS: ' + scripts.length + ' JavaScript blocks parse; three game launchers and language initialization checked.');
