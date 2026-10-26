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
console.log('PASS: ' + scripts.length + ' JavaScript blocks parse; three game launchers and language initialization checked.');
