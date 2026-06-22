#!/usr/bin/env node
/* fungi/data/fungi.json 驗證器（零相依，供本機與 GitHub Actions 使用）
   執行： node scripts/validate_fungi.js  失敗時 exit 1。 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'fungi', 'data', 'fungi.json');
const REQUIRED = ['h1','h2','zh','en','stars','sys','morph','oxy','media','tests','vir','dis','resist','hot','qa'];
const STR_FIELDS = ['morph','oxy','media','tests','vir','dis','resist'];
const errors = [], warns = [];

let raw, data;
try { raw = fs.readFileSync(FILE, 'utf8'); } catch (e) { console.error('✗ 無法讀取 fungi/data/fungi.json'); process.exit(1); }
try { data = JSON.parse(raw); } catch (e) { console.error('✗ JSON 格式錯誤：' + e.message); process.exit(1); }

if (!data.meta || !Array.isArray(data.meta.clinical_systems)) errors.push('meta.clinical_systems 缺失或不是陣列');
if (!data.flows || typeof data.flows !== 'object') errors.push('flows 缺失');
if (!Array.isArray(data.species) || data.species.length === 0) errors.push('species 缺失或為空');

const systems = new Set((data.meta && data.meta.clinical_systems) || []);
const flowKeys = new Set(Object.keys(data.flows || {}));
const seenEn = new Map();
const evenStars = s => Number.isInteger(s) && s >= 1 && s <= 3;
const boldBalanced = s => (String(s).match(/\*\*/g) || []).length % 2 === 0;

(data.species || []).forEach((sp, i) => {
  const id = `species[${i}] ${sp.en || sp.zh || '(無名)'}`;
  REQUIRED.forEach(f => { if (!(f in sp)) errors.push(`${id}: 缺少欄位 "${f}"`); });
  if ('stars' in sp && !evenStars(sp.stars)) errors.push(`${id}: stars 必須 1–3，目前=${sp.stars}`);
  if (Array.isArray(sp.sys)) sp.sys.forEach(t => { if (!systems.has(t)) errors.push(`${id}: 臨床標籤 "${t}" 不在 meta.clinical_systems`); });
  else errors.push(`${id}: sys 必須為陣列`);
  if (sp.h1 && !flowKeys.has(sp.h1)) warns.push(`${id}: h1 "${sp.h1}" 沒有對應的 flows`);
  if (sp.en) { if (seenEn.has(sp.en)) errors.push(`${id}: 學名重複`); else seenEn.set(sp.en, i); }
  STR_FIELDS.concat(['zh']).forEach(f => {
    if (typeof sp[f] === 'string') {
      if (!boldBalanced(sp[f])) errors.push(`${id}: 欄位 "${f}" 的 ** 未成對`);
      if (/<[a-zA-Z/]/.test(sp[f])) warns.push(`${id}: 欄位 "${f}" 含疑似 HTML 標籤`);
    }
  });
  (sp.hot || []).forEach((h, j) => { if (!boldBalanced(h)) errors.push(`${id}: hot[${j}] 的 ** 未成對`); });
  if (Array.isArray(sp.qa)) sp.qa.forEach((q, j) => { if (!Array.isArray(q) || q.length !== 2) errors.push(`${id}: qa[${j}] 必須為 ["年度題號","說明"]`); });
  else errors.push(`${id}: qa 必須為陣列`);
});

const h2set = new Set((data.species || []).map(s => s.h2));
const h1set = new Set((data.species || []).map(s => s.h1));
(data.tables || []).forEach((t, i) => {
  const id = `tables[${i}] ${t.id || t.title || ''}`;
  if (!t.scope || !(h2set.has(t.scope) || h1set.has(t.scope))) errors.push(`${id}: scope "${t.scope}" 不對應任何 h1/h2`);
  if (t.sys){ if(!Array.isArray(t.sys)) errors.push(`${id}: sys 必須為陣列`); else t.sys.forEach(x=>{ if(!systems.has(x)) errors.push(`${id}: sys "${x}" 不在 clinical_systems`); }); }
  if (!Array.isArray(t.columns) || !t.columns.length) errors.push(`${id}: columns 缺失`);
  if (!Array.isArray(t.rows)) errors.push(`${id}: rows 必須為陣列`);
  else t.rows.forEach((r, j) => { if (!Array.isArray(r) || r.length !== (t.columns || []).length) errors.push(`${id}: rows[${j}] 欄數(${(r||[]).length}) 與 columns(${(t.columns||[]).length}) 不符`); });
});

console.log(`檢查 ${(data.species||[]).length} 菌種、${flowKeys.size} 分流圖、${systems.size} 臨床標籤、${(data.tables||[]).length} 比較表。`);
warns.forEach(w => console.log('⚠ ' + w));
if (errors.length) { console.error(`\n✗ 發現 ${errors.length} 個錯誤：`); errors.forEach(e => console.error('  - ' + e)); process.exit(1); }
console.log(`✓ 通過驗證${warns.length ? '（含 ' + warns.length + ' 項提醒）' : ''}。`);
