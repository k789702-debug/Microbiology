/* 醫檢師細菌分類大綱 — 前端渲染邏輯
   資料來源：data/bacteria.json（共編者只需編輯該檔）
   ** 文字 ** 會被轉為粗體；不需要寫 HTML 標籤。 */
(function(){
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  // 已建立的培養基 → 連到 media 模組（僅連已收錄者，隨各群上線擴充）
  const MEDIA_MAP=[['MacConkey','MAC'],['EMB','EMB'],['XLD','XLD'],['TCBS','TCBS'],['Hektoen','HE'],['CIN','CIN']];
  function linkifyMedia(html){
    MEDIA_MAP.forEach(function(p){
      const re=new RegExp('(?<![A-Za-z])'+p[0]+'(?![A-Za-z])','g');
      html=html.replace(re,'<a class="medlink" href="../media/index.html?q='+p[1]+'" title="到培養基大綱看 '+p[0]+'">'+p[0]+'</a>');
    });
    return html;
  }

  function gramOf(h1){
    if(h1.includes('陽性')) return 'pos';
    if(h1.includes('陰性')) return 'neg';
    return 'other';
  }
  function symClass(v){
    v=String(v).trim();
    if(v==='＋'||v==='+'||v==='需') return 'pos';
    if(v==='－'||v==='-'||v==='−'||v==='不需') return 'neg';
    return '';
  }

  let DATA=null, activeTags=new Set();

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

  function cmpTable(t){
    const wrap=document.createElement('div');
    wrap.className='cmp'; wrap.dataset.scope=t.scope||''; wrap.dataset.sys=(t.sys||[]).join(',');
    const head=t.title?`<div class="cmp-title">📊 ${esc(t.title)}</div>`:'';
    const note=t.note?`<div class="cmp-note">${md(t.note)}</div>`:'';
    const thead='<tr>'+(t.columns||[]).map(c=>`<th>${esc(c)}</th>`).join('')+'</tr>';
    const body=(t.rows||[]).map(r=>'<tr>'+r.map((cell,ci)=>{
      const cls=ci===0?'name':symClass(cell);
      return `<td class="${cls}">${ci===0?md(cell):esc(cell)}</td>`;
    }).join('')+'</tr>').join('');
    const foot=t.footnote?`<div class="cmp-foot">${md(t.footnote)}</div>`:'';
    wrap.innerHTML=head+note+`<div class="cmp-scroll"><table>`+
      `<thead>${thead}</thead><tbody>${body}</tbody></table></div>`+foot;
    return wrap;
  }

  function speciesCard(d){
    const sys=Array.isArray(d.sys)?d.sys:String(d.sys).split(/\s*\/\s*/);
    const fields=[
      ['② 形態',d.morph],['③ 氧氣/基礎反應',d.oxy],['④ 選擇/鑑別培養基',d.media],
      ['⑤ 關鍵鑑定試驗',d.tests],['⑥ 致病因子/毒素',d.vir],['⑦ 代表疾病',d.dis],
      ['⑧ 血清分型/抗藥性',d.resist]
    ].map(([k,v])=>{
      let html=md(v);
      if(k.indexOf('培養基')>=0) html=linkifyMedia(html);
      return `<div class="field"><div class="k">${k}</div><div class="v">${html}</div></div>`;
    }).join('');
    const hot=(d.hot||[]).map(h=>`<li>${md(h)}</li>`).join('');
    const qa=(d.qa||[]).map(q=>`<tr><td class="yr">${esc(q[0])}</td><td>${esc(q[1])}</td></tr>`).join('');
    const card=document.createElement('article');
    card.className='card'; card.dataset.sys=sys.join(',');
    card.id=String(d.en||'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'');
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
    const tables=DATA.tables||[];
    const h1order=[...new Set(DATA.species.map(s=>s.h1))];
    h1order.forEach(h1=>{
      const g=document.createElement('section');
      g.className='group'; g.dataset.group=h1; g.dataset.gram=gramOf(h1);
      const flow=(DATA.flows[h1]||[]).map(l=>`<div class="ln">${md(l)}</div>`).join('');
      g.innerHTML=`<div class="group-head"><span class="arrow">▼</span><span>${esc(h1)}</span></div>`+
        `<div class="group-body">${flow?`<div class="flow"><h3>🧭 鑑定流程分流圖</h3>${flow}</div>`:''}</div>`;
      const body=g.querySelector('.group-body');
      g.querySelector('.group-head').onclick=()=>g.classList.toggle('collapsed');
      tables.filter(t=>t.scope===h1).forEach(t=>body.appendChild(cmpTable(t)));
      const h2order=[...new Set(DATA.species.filter(s=>s.h1===h1).map(s=>s.h2))];
      h2order.forEach(h2=>{
        const sh=document.createElement('div'); sh.className='subhead'; sh.textContent=h2; body.appendChild(sh);
        tables.filter(t=>t.scope===h2).forEach(t=>body.appendChild(cmpTable(t)));
        const cc=document.createElement('div'); cc.className='cards';
        DATA.species.filter(s=>s.h1===h1&&s.h2===h2).forEach(s=>cc.appendChild(speciesCard(s)));
        body.appendChild(cc);
      });
      wrap.appendChild(g);
    });
    $('#search').addEventListener('input',applyFilter);
    $('#expandAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.remove('collapsed'));
    $('#collapseAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.add('collapsed'));
    // 深連結 ?q=（由培養基大綱點菌名跳入時自動帶入搜尋）
    const q=new URLSearchParams(location.search).get('q');
    if(q){ $('#search').value=q; applyFilter(); }
  }

  function applyFilter(){
    const q=$('#search').value.trim().toLowerCase();
    let any=false;
    document.querySelectorAll('.group').forEach(g=>{
      let gHas=false;
      g.querySelectorAll('.subhead').forEach(sh=>{
        const cc=sh.nextElementSibling && sh.nextElementSibling.classList.contains('cmp')
          ? null : sh.nextElementSibling;
        // 找到此 subhead 之後的 .cards 容器
        let el=sh.nextElementSibling, cards=null;
        while(el && !el.classList.contains('subhead')){ if(el.classList.contains('cards')) cards=el; el=el.nextElementSibling; }
        let sHas=false;
        if(cards) cards.querySelectorAll('.card').forEach(card=>{
          const txt=card.textContent.toLowerCase();
          const sysArr=card.dataset.sys.split(',');
          const okText=!q||txt.includes(q);
          const okTag=activeTags.size===0||[...activeTags].every(t=>sysArr.includes(t));
          const show=okText&&okTag;
          card.style.display=show?'':'none';
          if(show){sHas=true;gHas=true;any=true;}
        });
        sh.style.display=sHas?'':'none'; if(cards) cards.style.display=sHas?'':'none';
      });
      // 比較表：無臨床標籤可篩，故僅依文字搜尋顯示（有 tag 篩選時隱藏）
      g.querySelectorAll('.cmp').forEach(t=>{
        const okText=!q||t.textContent.toLowerCase().includes(q);
        const tsys=(t.dataset.sys||'').split(',').filter(Boolean);
        const okTag=activeTags.size===0||tsys.some(s=>activeTags.has(s));
        const show=okText&&okTag;
        t.style.display=show?'':'none';
        if(show){ gHas=true; any=true; }
      });
      g.style.display=gHas?'':'none';
    });
    $('#nohit').style.display=any||(!q&&activeTags.size===0)?'none':'block';
  }
})();
