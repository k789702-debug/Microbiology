#!/usr/bin/env node
/* data/bacteria.json 驗證器（零相依，供本機與 GitHub Actions 使用）
   檢查：JSON 格式、必填欄位、stars 1–3、sys 必須在 meta.clinical_systems、
        h1 必須有對應 flow、學名(en)不重複、**粗體**標記成對、qa 為 [年度,題幹] 兩元素。
   執行： node scripts/validate.js
   失敗時 exit code = 1 並列出所有問題。 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'bacteria.json');
const REQUIRED = ['h1','h2','zh','en','stars','sys','morph','oxy','media','tests','vir','dis','resist','hot','qa'];
const STR_FIELDS = ['morph','oxy','media','tests','vir','dis','resist'];
const errors = [];
const warns = [];

let raw, data;
try { raw = fs.readFileSync(FILE, 'utf8'); }
catch (e) { console.error('✗ 找不到或無法讀取 data/bacteria.json'); process.exit(1); }
try { data = JSON.parse(raw); }
catch (e) { console.error('✗ JSON 格式錯誤：' + e.message); process.exit(1); }

if (!data.meta || !Array.isArray(data.meta.clinical_systems))
  errors.push('meta.clinical_systems 缺失或不是陣列');
if (!data.flows || typeof data.flows !== 'object')
  errors.push('flows 缺失');
if (!Array.isArray(data.species) || data.species.length === 0)
  errors.push('species 缺失或為空');

const systems = new Set((data.meta && data.meta.clinical_systems) || []);
const flowKeys = new Set(Object.keys(data.flows || {}));
const seenEn = new Map();

function evenStars(s){ return Number.isInteger(s) && s >= 1 && s <= 3; }
function boldBalanced(s){ return (String(s).match(/\*\*/g) || []).length % 2 === 0; }

(data.species || []).forEach((sp, i) => {
  const id = `species[${i}] ${sp.en || sp.zh || '(無名)'}`;
  REQUIRED.forEach(f => { if (!(f in sp)) errors.push(`${id}: 缺少欄位 "${f}"`); });

  if ('stars' in sp && !evenStars(sp.stars)) errors.push(`${id}: stars 必須為 1–3，目前=${sp.stars}`);

  if (Array.isArray(sp.sys)) {
    sp.sys.forEach(t => { if (!systems.has(t)) errors.push(`${id}: 臨床標籤 "${t}" 不在 meta.clinical_systems`); });
  } else errors.push(`${id}: sys 必須為陣列（如 ["腸道","泌尿"]）`);

  if (sp.h1 && !flowKeys.has(sp.h1)) warns.push(`${id}: h1 "${sp.h1}" 沒有對應的 flows 分流圖`);

  if (sp.en) {
    if (seenEn.has(sp.en)) errors.push(`${id}: 學名重複（與 species[${seenEn.get(sp.en)}] 相同）`);
    else seenEn.set(sp.en, i);
  }

  // 粗體標記成對 + 不可內嵌 HTML 標籤
  STR_FIELDS.concat(['zh']).forEach(f => {
    if (typeof sp[f] === 'string') {
      if (!boldBalanced(sp[f])) errors.push(`${id}: 欄位 "${f}" 的 ** 粗體標記未成對`);
      if (/<[a-zA-Z/]/.test(sp[f])) warns.push(`${id}: 欄位 "${f}" 含疑似 HTML 標籤（請改用純文字 + **粗體**）`);
    }
  });
  (sp.hot || []).forEach((h, j) => { if (!boldBalanced(h)) errors.push(`${id}: hot[${j}] 的 ** 粗體標記未成對`); });

  if (Array.isArray(sp.qa)) {
    sp.qa.forEach((q, j) => {
      if (!Array.isArray(q) || q.length !== 2) errors.push(`${id}: qa[${j}] 必須為 ["年度題號","題幹說明"] 兩元素`);
    });
  } else errors.push(`${id}: qa 必須為陣列`);
});

console.log(`檢查 ${(data.species||[]).length} 菌種、${flowKeys.size} 個分流圖、${systems.size} 個臨床標籤。`);
warns.forEach(w => console.log('⚠ ' + w));
if (errors.length) {
  console.error(`\n✗ 發現 ${errors.length} 個錯誤：`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ 通過驗證${warns.length ? '（含 ' + warns.length + ' 項提醒）' : ''}。`);
