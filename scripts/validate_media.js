#!/usr/bin/env node
/* media/data/media.json 驗證器（零相依，供本機與 GitHub Actions 使用）
   執行： node scripts/validate_media.js  失敗時 exit 1。 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'media', 'data', 'media.json');
const REQUIRED = ['h1','type','abbr','en','zh','stars','comp','ph','steril','principle','appear','species','hot','qa'];
const STR_FIELDS = ['ph','steril','principle','appear'];
const ROLES_OK = new Set(['碳源','氮源','緩衝','滲透','選擇劑','指示劑','凝固劑','生長因子','鑑別基質','H₂S 受質','H₂S 受質／選擇','H₂S 指示劑','選擇劑（抗生素）','選擇劑(抗生素)','選擇劑／指示劑','氮源／生長因子','滲透(嗜鹽選擇)']);
const errors = [], warns = [];

let raw, data;
try { raw = fs.readFileSync(FILE, 'utf8'); } catch (e) { console.error('✗ 無法讀取 media/data/media.json'); process.exit(1); }
try { data = JSON.parse(raw); } catch (e) { console.error('✗ JSON 格式錯誤：' + e.message); process.exit(1); }

if (!data.meta || !Array.isArray(data.meta.media_types)) errors.push('meta.media_types 缺失或不是陣列');
if (!Array.isArray(data.media) || data.media.length === 0) errors.push('media 缺失或為空');

const flowKeys = new Set(Object.keys(data.flows || {}));
const seenAbbr = new Map();
const okStars = s => Number.isInteger(s) && s >= 1 && s <= 3;
const boldBalanced = s => (String(s).match(/\*\*/g) || []).length % 2 === 0;

(data.media || []).forEach((m, i) => {
  const id = `media[${i}] ${m.abbr || m.en || '(無名)'}`;
  REQUIRED.forEach(f => { if (!(f in m)) errors.push(`${id}: 缺少欄位 "${f}"`); });
  if ('stars' in m && !okStars(m.stars)) errors.push(`${id}: stars 必須 1–3，目前=${m.stars}`);
  if (m.abbr) { if (seenAbbr.has(m.abbr)) errors.push(`${id}: 縮寫重複`); else seenAbbr.set(m.abbr, i); }
  if (m.h1 && flowKeys.size && !flowKeys.has(m.h1)) warns.push(`${id}: h1 "${m.h1}" 沒有對應 flows`);
  if (Array.isArray(m.comp)) m.comp.forEach((c, j) => {
    if (!Array.isArray(c) || c.length !== 3) errors.push(`${id}: comp[${j}] 必須為 ["材料","比例","角色"]`);
    else if (!ROLES_OK.has(c[2])) warns.push(`${id}: comp[${j}] 角色 "${c[2]}" 非標準角色詞`);
  });
  else errors.push(`${id}: comp 必須為陣列`);
  if (Array.isArray(m.species)) m.species.forEach((s, j) => {
    if (!Array.isArray(s) || s.length !== 2) errors.push(`${id}: species[${j}] 必須為 ["菌名","反應"]`);
    else if (!boldBalanced(s[1])) errors.push(`${id}: species[${j}] 反應的 ** 未成對`);
  });
  else errors.push(`${id}: species 必須為陣列`);
  STR_FIELDS.forEach(f => {
    if (typeof m[f] === 'string') {
      if (!boldBalanced(m[f])) errors.push(`${id}: 欄位 "${f}" 的 ** 未成對`);
      if (/<[a-zA-Z/]/.test(m[f])) warns.push(`${id}: 欄位 "${f}" 含疑似 HTML 標籤`);
    }
  });
  (m.hot || []).forEach((h, j) => { if (!boldBalanced(h)) errors.push(`${id}: hot[${j}] 的 ** 未成對`); });
  if (Array.isArray(m.qa)) m.qa.forEach((q, j) => { if (!Array.isArray(q) || q.length !== 2) errors.push(`${id}: qa[${j}] 必須為 ["年度題號","說明"]`); });
  else errors.push(`${id}: qa 必須為陣列`);
});

const h1set = new Set((data.media || []).map(m => m.h1));
(data.tables || []).forEach((t, i) => {
  const id = `tables[${i}] ${t.id || t.title || ''}`;
  if (!t.scope || !h1set.has(t.scope)) errors.push(`${id}: scope "${t.scope}" 不對應任何 h1`);
  if (!Array.isArray(t.columns) || !t.columns.length) errors.push(`${id}: columns 缺失`);
  if (!Array.isArray(t.rows)) errors.push(`${id}: rows 必須為陣列`);
  else t.rows.forEach((r, j) => { if (!Array.isArray(r) || r.length !== (t.columns || []).length) errors.push(`${id}: rows[${j}] 欄數(${(r||[]).length}) 與 columns(${(t.columns||[]).length}) 不符`); });
});

console.log(`檢查 ${(data.media||[]).length} 張培養基、${flowKeys.size} 分流、${(data.tables||[]).length} 比較表。`);
warns.forEach(w => console.log('⚠ ' + w));
if (errors.length) { console.error(`\n✗ 發現 ${errors.length} 個錯誤：`); errors.forEach(e => console.error('  - ' + e)); process.exit(1); }
console.log(`✓ 通過驗證${warns.length ? '（含 ' + warns.length + ' 項提醒）' : ''}。`);
