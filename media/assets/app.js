/* 培養基成分與適用菌種大綱 — 前端渲染
   資料來源：data/media.json（共編者只需編輯該檔）
   ** 文字 ** → 粗體；菌種若存在於細菌大綱才連到 ../bacteria/index.html?q=屬名 */
(function(){
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
  const ROLES=["碳源","氮源","緩衝","滲透","選擇劑","指示劑","凝固劑","生長因子"];
  const roleKey={"碳源":"碳源","氮源":"氮源","緩衝":"緩衝","滲透":"滲透","選擇劑":"選擇劑","指示劑":"指示劑","凝固劑":"凝固劑","生長因子":"生長因子","鑑別基質":"碳源","H₂S 受質":"碳源","H₂S 受質／選擇":"選擇劑","H₂S 指示劑":"指示劑"};
  function roleClass(role){
    const first=String(role).split('／')[0].split('/')[0].trim();
    return roleKey[first]||'x';
  }
  function spKey(name){return String(name).split('（')[0].split('(')[0].replace(/\s+(spp\.|sp\.)$/,'').trim();}
  function genusOf(name){const m=String(name).match(/^([A-Z][a-z]+)/);return m?m[1]:null;}
  // 細菌大綱已收錄的屬（xref 白名單；只連得到的才做超連結）
  const BACT_GENERA=new Set(["Acinetobacter","Actinomyces","Bacillus","Bacteroides","Bartonella","Bordetella","Borrelia","Brucella","Burkholderia","Campylobacter","Chlamydia","Citrobacter","Clostridioides","Clostridium","Corynebacterium","Coxiella","Ehrlichia","Enterobacter","Enterococcus","Erysipelothrix","Escherichia","Francisella","Fusobacterium","Haemophilus","Helicobacter","Klebsiella","Lactobacillus","Legionella","Leptospira","Listeria","Moraxella","Mycobacterium","Mycoplasma","Neisseria","Nocardia","Pasteurella","Prevotella","Proteus","Pseudomonas","Rickettsia","Salmonella","Serratia","Shigella","Staphylococcus","Stenotrophomonas","Streptococcus","Treponema","Ureaplasma","Vibrio","Yersinia"]);
  // 真菌大綱已收錄的屬（連到 ../fungi）
  const FUNGI_GENERA=new Set(["Aspergillus", "Blastomyces", "Candida", "Cladophialophora", "Coccidioides", "Cryptococcus", "Epidermophyton", "Fonsecaea", "Fusarium", "Histoplasma", "Malassezia", "Microsporum", "Mucor", "Paracoccidioides", "Pneumocystis", "Rhizopus", "Sporothrix", "Talaromyces", "Trichophyton", "Trichosporon"]);

  let DATA=null, activeTags=new Set();

  const boot = window.__EMBED__
    ? Promise.resolve(window.__EMBED__)
    : fetch('data/media.json').then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); });
  boot.then(d=>{ DATA=d; render(); })
    .catch(e=>{
      $('#cards').innerHTML='<div class="err">無法載入 <b>data/media.json</b>（'+esc(e.message)+'）。<br>'+
      '若以 file:// 直接開啟，瀏覽器會擋住載入；請用 GitHub Pages 網址，或本機伺服器（<code>python -m http.server</code>），'+
      '或改用單檔離線版 <b>培養基大綱_全9群_離線版.html</b>。</div>';
    });

  function rolesLegend(){
    return '<div class="legend-roles">'+ROLES.map(r=>{
      return '<span><span class="dot r-'+r+'"></span>'+r+'</span>';
    }).join('')+'</div>';
  }

  function compTable(comp){
    const rows=comp.map(c=>{
      const rc=roleClass(c[2]);
      return '<tr><td>'+esc(c[0])+'</td><td class="num">'+esc(c[1])+'</td>'+
             '<td><span class="role r-'+rc+'">'+esc(c[2])+'</span></td></tr>';
    }).join('');
    return '<table class="comp"><thead><tr><th>材料</th><th>比例</th><th>功能角色</th></tr></thead><tbody>'+rows+'</tbody></table>'+rolesLegend();
  }

  function spTable(species){
    const rows=species.map(s=>{
      const g=genusOf(s[0]);
      let nameCell=esc(s[0]);
      if(g && BACT_GENERA.has(g)) nameCell='<a class="xref" href="../bacteria/index.html?q='+encodeURIComponent(g)+'" title="到細菌大綱查 '+esc(g)+'">'+esc(s[0])+'</a>';
      else if(g && FUNGI_GENERA.has(g)) nameCell='<a class="xref" href="../fungi/index.html?q='+encodeURIComponent(g)+'" title="到真菌大綱查 '+esc(g)+'">'+esc(s[0])+'</a>';
      return '<tr><td class="nm">'+nameCell+'</td><td>'+md(s[1])+'</td></tr>';
    }).join('');
    return '<table class="sp"><tbody>'+rows+'</tbody></table>';
  }

  function cmpTable(t){
    const wrap=document.createElement('div');
    wrap.className='cmp'; wrap.dataset.scope=t.scope||'';
    const head=t.title?'<div class="cmp-title">📊 '+esc(t.title)+'</div>':'';
    const note=t.note?'<div class="cmp-note">'+md(t.note)+'</div>':'';
    const thead='<tr>'+(t.columns||[]).map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr>';
    const body=(t.rows||[]).map(r=>'<tr>'+r.map((cell,ci)=>
      '<td class="'+(ci===0?'name':'')+'">'+(ci===0?md(cell):esc(cell))+'</td>').join('')+'</tr>').join('');
    const foot=t.footnote?'<div class="cmp-foot">'+md(t.footnote)+'</div>':'';
    wrap.innerHTML=head+note+'<div class="cmp-scroll"><table><thead>'+thead+'</thead><tbody>'+body+'</tbody></table></div>'+foot;
    return wrap;
  }

  function mediaCard(d){
    const card=document.createElement('article');
    card.className='card'; card.id=d.abbr;
    card.dataset.genus=[...new Set(d.species.map(s=>genusOf(s[0])).filter(Boolean))].join('|');
    const fields=
      '<div class="field"><div class="k">① 成分處方表</div><div class="v">'+compTable(d.comp)+'</div></div>'+
      '<div class="field"><div class="k">② pH／滅菌</div><div class="v"><div class="pills">'+
        '<span class="pill"><b>pH：</b>'+md(d.ph)+'</span><span class="pill"><b>滅菌：</b>'+md(d.steril)+'</span></div></div></div>'+
      '<div class="field"><div class="k">③ 選擇／鑑別原理</div><div class="v">'+md(d.principle)+'</div></div>'+
      '<div class="field"><div class="k">④ 接種後表現</div><div class="v">'+md(d.appear)+'</div></div>'+
      '<div class="field"><div class="k">⑤ 對應菌種與典型反應</div><div class="v">'+spTable(d.species)+'</div></div>';
    const hot=(d.hot||[]).map(h=>'<li>'+md(h)+'</li>').join('');
    const qa=(d.qa||[]).map(q=>'<tr><td class="yr">'+esc(q[0])+'</td><td>'+esc(q[1])+'</td></tr>').join('');
    card.innerHTML=
      '<div class="card-head"><span class="en">'+esc(d.en)+'</span>'+
      '<span class="abbr">'+esc(d.abbr)+'</span>'+
      '<span class="zh">'+esc(d.zh)+'</span>'+
      '<span class="stars">'+'★'.repeat(d.stars||0)+'</span>'+
      '<span class="arrow">▼</span></div>'+
      '<div class="card-body">'+fields+
      '<div class="hot"><div class="k">⭐ 高頻考點與易混淆對比</div><ol>'+hot+'</ol>'+
      '<table class="qa"><tbody>'+qa+'</tbody></table></div></div>';
    card.querySelector('.card-head').onclick=()=>card.classList.toggle('collapsed');
    return card;
  }

  function buildTags(){
    const bar=$('#tagbar'); bar.innerHTML='';
    const set=new Set();
    DATA.media.forEach(m=>m.species.forEach(s=>{const g=genusOf(s[0]); if(g)set.add(g);}));
    const genera=[...set].sort();
    const toggle=document.createElement('button');
    toggle.type='button'; toggle.className='tag-toggle';
    toggle.textContent='🔖 菌種反查（'+genera.length+' 屬）▾';
    toggle.onclick=()=>{ bar.classList.toggle('open');
      toggle.textContent='🔖 菌種反查（'+genera.length+' 屬）'+(bar.classList.contains('open')?'▴':'▾'); };
    bar.appendChild(toggle);
    genera.forEach(g=>{
      const b=document.createElement('span');
      b.className='tagfilter'; b.textContent=g;
      b.onclick=()=>{ b.classList.toggle('active');
        activeTags.has(g)?activeTags.delete(g):activeTags.add(g); applyFilter(); };
      bar.appendChild(b);
    });
  }

  function render(){
    $('#sub').textContent='科目：'+DATA.meta.subject.split('—')[0].trim()+'｜共 '+DATA.media.length+' 張培養基';
    buildTags();
    const wrap=$('#cards'); wrap.innerHTML='';
    const tables=DATA.tables||[];
    const h1order=[...new Set(DATA.media.map(m=>m.h1))];
    h1order.forEach(h1=>{
      const first=DATA.media.find(m=>m.h1===h1);
      const g=document.createElement('section');
      g.className='group'; g.dataset.group=h1; g.dataset.type=(first&&first.type)||'enteric';
      const flow=(DATA.flows&&DATA.flows[h1]||[]).map(l=>'<div class="ln">'+md(l)+'</div>').join('');
      g.innerHTML='<div class="group-head"><span class="arrow">▼</span><span>'+esc(h1)+'</span></div>'+
        '<div class="group-body">'+(flow?'<div class="flow"><h3>🧭 採檢與分流</h3>'+flow+'</div>':'')+'</div>';
      const body=g.querySelector('.group-body');
      g.querySelector('.group-head').onclick=()=>g.classList.toggle('collapsed');
      const cc=document.createElement('div'); cc.className='cards';
      DATA.media.filter(m=>m.h1===h1).forEach(m=>cc.appendChild(mediaCard(m)));
      body.appendChild(cc);
      tables.filter(t=>t.scope===h1).forEach(t=>body.appendChild(cmpTable(t)));
      wrap.appendChild(g);
    });
    $('#search').addEventListener('input',applyFilter);
    $('#expandAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.remove('collapsed'));
    $('#collapseAll').onclick=()=>document.querySelectorAll('.card,.group').forEach(e=>e.classList.add('collapsed'));
    const q=new URLSearchParams(location.search).get('q');
    if(q){ $('#search').value=q; }
    applyFilter();
  }

  function applyFilter(){
    const q=$('#search').value.trim().toLowerCase();
    let any=false;
    document.querySelectorAll('.group').forEach(g=>{
      let gHas=false;
      g.querySelectorAll('.card').forEach(card=>{
        const txt=card.textContent.toLowerCase();
        const genusArr=(card.dataset.genus||'').toLowerCase().split('|');
        const okText=!q||txt.includes(q);
        const okTag=activeTags.size===0||[...activeTags].some(t=>genusArr.includes(t.toLowerCase()));
        const show=okText&&okTag;
        card.style.display=show?'':'none';
        if(show){gHas=true;any=true;}
      });
      let cmpAny=false;
      g.querySelectorAll('.cmp').forEach(t=>{
        const show=(!q||t.textContent.toLowerCase().includes(q))&&activeTags.size===0;
        t.style.display=show?'':'none';
        if(show)cmpAny=true;
      });
      if(cmpAny&&q) any=true;
      g.style.display=(gHas||cmpAny)?'':'none';
    });
    $('#nohit').style.display=any||(!q&&activeTags.size===0)?'none':'block';
  }
})();
