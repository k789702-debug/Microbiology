#!/usr/bin/env node
/* 產生單檔離線版：把 media.json + style.css + app.js 內嵌成一個 HTML
   執行： node scripts/build_offline.js
   輸出： media/培養基大綱_全9群_離線版.html （可 file:// 直接開啟） */
const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'media');
const css = fs.readFileSync(path.join(base, 'assets', 'style.css'), 'utf8');
const js  = fs.readFileSync(path.join(base, 'assets', 'app.js'), 'utf8');
const data = fs.readFileSync(path.join(base, 'data', 'media.json'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>培養基成分與適用菌種大綱（全9群）｜單檔離線版</title>
<style>
${css}
</style>
</head>
<body>
<header class="top">
  <div class="title-row">
    <span class="th-badge">培養基</span>
    <div>
      <h1>培養基成分與適用菌種大綱（全9群）</h1>
      <div class="sub" id="sub">科目：微生物學與臨床微生物學（包括細菌與黴菌）</div>
    </div>
  </div>
  <div class="controls">
    <input id="search" type="text" placeholder="🔍 即時搜尋：培養基、成分、菌名、原理、考點…">
    <button type="button" class="btn-mini" id="expandAll">全部展開</button>
    <button type="button" class="btn-mini" id="collapseAll">全部收合</button>
  </div>
  <div class="tagbar" id="tagbar"></div>
  <div class="legend">單檔離線版（無外部連結）。色塊＝功能角色；⭐⭐⭐ 極高頻 ⭐⭐ 高頻 ⭐ 常見（醫檢師考古題，民國 103–115）。線上互連版見 GitHub Pages。</div>
</header>
<main>
  <div id="cards"></div>
  <div class="nohit" id="nohit">查無符合條件的培養基。</div>
  <div class="ref">成分：BD Difco/BBL、Oxoid 手冊；原理：Mahon、Murray；考題：考選部醫檢師（科目 308），民國 102–115。⚠️ 比例依製造商手冊，廠牌批號略有差異。</div>
</main>
<script>window.__EMBED__ = ${data};</script>
<script>
${js}
</script>
</body>
</html>
`;
const out = path.join(base, '培養基大綱_全9群_離線版.html');
fs.writeFileSync(out, html);
console.log('已輸出：' + out + '（' + html.length + ' bytes）');
