/* 醫檢師細菌分類大綱 — 前端渲染邏輯
   資料來源：data/bacteria.json（共編者只需編輯該檔）
   ** 文字 ** 會被轉為粗體；不需要寫 HTML 標籤。 */
(function(){
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');

  // Gram 類別判定（決定色塊：陽性紫 / 陰性粉 / 其他中性）
  function gramOf(h1){
    if(h1.includes('陽性')) return 'pos';
    if(h1.includes('陰性')) return 'neg';
    return 'other'; // 抗酸菌 / 螺旋體 / 非典型胞內
  }

  let DATA=null, activeTags=new Set();

  // 若為單檔離線版會預先注入 window.__EMBED__；否則向 data/bacteria.json 取資料
  const boot = window.__EMBED__
    ? Promise.resolve(window.__EMBED__)
    : fetch('data/bacteria.json').then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); });
  boot
    .then(d=>{ DATA=d; render(); })
    .catch(e=>{
      $('#cards').innerHTML =
        '<div class="err">無法載入 <b>data/bacteria.json</b>（'+esc(e.message)+'）。<br>'+
        '若是直接用瀏覽器開啟本機檔案（file://），瀏覽器會擋住載入；請改用 GitHub Pages 網址開啟，'+
        '或用本機伺服器（如 <code>python -m http.server</code>）。<br>'+
        '個人離線檢視可改用單檔版 <b>細菌分類大綱_完整版.html</b>。</div>';
    });

  function buildTags(){
    const bar=$('#tagbar');
    (DATA.meta.clinical_systems||[]).forEach(s=>{
      const b=document.createElement('span');
      b.className='tagfilter'; b.textContent=s;
      b.onclick=()=>{ b.classList.toggle('active');
        activeTags.has(s)?activeTags.delete(s):activeTags.add(s); applyFilter(); };
      bar.appendChild(b);
    });
  }

  function speciesCard(d){
    const sys=Array.isArray(d.sys)?d.sys:String(d.sys).split(/\s*\/\s*/);
    const fields=[
      ['② 形態',d.morph],['③ 氧氣/基礎反應',d.oxy],['④ 選擇/鑑別培養基',d.media],
      ['⑤ 關鍵鑑定試驗',d.tests],['⑥ 致病因子/毒素',d.vir],['⑦ 代表疾病',d.dis],
      ['⑧ 血清分型/抗藥性',d.resist]
    ].map(([k,v])=>`<div class="field"><div class="k">${k}</div><div class="v">${md(v)}</div></div>`).join('');
    const hot=(d.hot||[]).map(h=>`<li>${md(h)}</li>`).join('');
    const qa=(d.qa||[]).map(q=>`<tr><td class="yr">${esc(q[0])}</td><td>${esc(q[1])}</td></tr>`).join('');
    const card=document.createElement('article');
    card.className='card'; card.dataset.sys=sys.join(',');
    card.innerHTML=
      `<div class="card-head"><span class="zh">${esc(d.zh)}</span>`+
      `<span class="en">${esc(d.en)}</span>`+
      `<span class="stars">${'★'.repeat(d.stars||0)}</span>`+
      `<div class="chips">${sys.map(s=>`<span class="chip sys">${esc(s.trim())}</span>`).join('')}</div>`+
      `<span class="arrow">▼</span></div>`+
      `<div class="card-body">`+
      `<div class="field"><div class="k">① 菌名</div><div class="v"><b>${esc(d.zh)}</b>　<i>${esc(d.en)}</i></div></div>`+
      fields+
      `<div class="hot"><div class="k">⑨ ⭐ 高頻考點與易混淆</div><ol>${hot}</ol>`+
      `<table class="qa"><tbody>${qa}</tbody></table></div></div>`;
    card.querySelector('.card-head').onclick=()=>card.classList.toggle('collapsed');
    return card;
  }

  function render(){
    $('#sub').textContent='科目：'+DATA.meta.subject+'｜共 '+DATA.species.length+' 菌種';
    buildTags();
    const wrap=$('#cards'); wrap.innerHTML='';
    const h1order=[...new Set(DATA.species.map(s=>s.h1))];
    h1order.forEach(h1=>{
      const g=document.createElement('section');
      g.className='group'; g.dataset.group=h1; g.dataset.gram=gramOf(h1);
      const flow=(DATA.flows[h1]||[]).map(l=>`<div class="ln">${md(l)}</div>`).join('');
      g.innerHTML=`<div class="group-head"><span class="arrow">▼</span><span>${esc(h1)}</span></div>`+
        `<div class="group-body">${flow?`<div class="flow"><h3>🧭 鑑定流程分流圖</h3>${flow}</div>`:''}</div>`;
      const body=g.querySelector('.group-body');
      g.querySelector('.group-head').onclick=()=>g.classList.toggle('collapsed');
      const h2order=[...new Set(DATA.species.filter(s=>s.h1===h1).map(s=>s.h2))];
      h2order.forEach(h2=>{
        const sh=document.createElement('div'); sh.className='subhead'; sh.textContent=h2; body.appendChild(sh);
        const cc=document.createElement('div'); cc.className='cards';
        DATA.species.filter(s=>s.h1===h1&&s.h2===h2).forEach(s=>cc.appendChild(speciesCard(s)));
        body.appendChild(cc);
      });
      wrap.appendChild(g);
    });
    $('#search').addEventListener('input',applyFilter);
    $('#expandAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.remove('collapsed'));
    $('#collapseAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.add('collapsed'));
  }

  function applyFilter(){
    const q=$('#search').value.trim().toLowerCase();
    let any=false;
    document.querySelectorAll('.group').forEach(g=>{
      let gHas=false;
      g.querySelectorAll('.subhead').forEach(sh=>{
        const cc=sh.nextElementSibling; let sHas=false;
        cc.querySelectorAll('.card').forEach(card=>{
          const txt=card.textContent.toLowerCase();
          const sysArr=card.dataset.sys.split(',');
          const okText=!q||txt.includes(q);
          const okTag=activeTags.size===0||[...activeTags].every(t=>sysArr.includes(t));
          const show=okText&&okTag;
          card.style.display=show?'':'none';
          if(show){sHas=true;gHas=true;any=true;}
        });
        sh.style.display=sHas?'':'none'; cc.style.display=sHas?'':'none';
      });
      g.style.display=gHas?'':'none';
    });
    $('#nohit').style.display=any?'none':'block';
  }})();

