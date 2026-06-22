/* P1 閱讀性增強（三個模組共用，疊加於各模組 app.js 之後執行）
   功能：搜尋高亮、只看極高頻(⭐⭐⭐)、記住展開/收合(localStorage)、Enter 捲到命中。
   以泛用方式操作已渲染的 DOM（.card / #search / .controls），不改動各 app.js 邏輯。 */
(function(){
  function ready(cb,n){n=n||0;var c=document.getElementById('cards');
    if(c&&c.querySelector('.card'))return cb();
    if(n>60)return;setTimeout(function(){ready(cb,n+1);},100);}
  function starCount(card){var s=card.querySelector('.stars');return s?(s.textContent.match(/★/g)||[]).length:0;}
  function esc(q){return q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  var KEY='card-state-v2:'+location.pathname;

  ready(function(){
    var search=document.getElementById('search');
    var controls=document.querySelector('.controls');
    var hf=false,beforeHigh=null;

    // 1) 記住展開/收合（localStorage）
    var saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
    var savedCards=saved.cards||{},savedGroups=saved.groups||{};
    document.querySelectorAll('#cards .card').forEach(function(c){
      var collapsed=c.id&&Object.prototype.hasOwnProperty.call(savedCards,c.id)?savedCards[c.id]:true;
      c.classList.toggle('collapsed',collapsed);
    });
    document.querySelectorAll('#cards .group').forEach(function(g){
      var collapsed=g.dataset.group&&Object.prototype.hasOwnProperty.call(savedGroups,g.dataset.group)?savedGroups[g.dataset.group]:false;
      g.classList.toggle('collapsed',collapsed);
    });
    function saveCollapsed(){
      var cards={},groups={};
      document.querySelectorAll('#cards .card').forEach(function(c){if(c.id)cards[c.id]=c.classList.contains('collapsed');});
      document.querySelectorAll('#cards .group').forEach(function(g){if(g.dataset.group)groups[g.dataset.group]=g.classList.contains('collapsed');});
      try{localStorage.setItem(KEY,JSON.stringify({cards:cards,groups:groups}));}catch(e){}
    }
    function captureView(){
      return {cards:[].map.call(document.querySelectorAll('#cards .card'),function(c){return [c,c.classList.contains('collapsed')];}),
        groups:[].map.call(document.querySelectorAll('#cards .group'),function(g){return [g,g.classList.contains('collapsed')];})};
    }
    function restoreView(state){if(!state)return;
      state.cards.forEach(function(x){x[0].classList.toggle('collapsed',x[1]);});
      state.groups.forEach(function(x){x[0].classList.toggle('collapsed',x[1]);});}

    // 2) 只看極高頻：只顯示並展開 ⭐⭐⭐ 卡片
    if(controls){var btn=document.createElement('button');btn.type='button';btn.className='hf-btn';btn.textContent='⭐⭐⭐ 只看極高頻';
      btn.setAttribute('aria-pressed','false');
      controls.appendChild(btn);
      btn.onclick=function(){if(!hf)beforeHigh=captureView();hf=!hf;btn.classList.toggle('on',hf);btn.setAttribute('aria-pressed',hf?'true':'false');
        btn.textContent=hf?'⭐⭐⭐ 極高頻 ON':'⭐⭐⭐ 只看極高頻';
        if(hf&&search)search.value='';
        if(!hf){restoreView(beforeHigh);beforeHigh=null;}
        if(search)search.dispatchEvent(new Event('input'));else post();};}

    // 2b) 手機標籤抽屜（bacteria/fungi 臨床標籤；media 已自帶 toggle 故略過）
    var tb=document.getElementById('tagbar');
    if(tb && tb.querySelector('.tagfilter') && !tb.querySelector('.tag-toggle')){
      tb.classList.add('has-drawer');
      var cnt=tb.querySelectorAll('.tagfilter').length;
      var tgl=document.createElement('button');tgl.type='button';tgl.className='tag-drawer-btn';
      tgl.textContent='🔬 篩選（'+cnt+'）▾';
      tb.insertBefore(tgl, tb.firstChild);
      tgl.onclick=function(){var o=tb.classList.toggle('open');tgl.textContent='🔬 篩選（'+cnt+'）'+(o?'▴':'▾');};
    }
    if(tb)tb.querySelectorAll('.tagfilter').forEach(function(tag){
      tag.setAttribute('role','button');tag.tabIndex=0;
      tag.setAttribute('aria-pressed',tag.classList.contains('active')?'true':'false');
      tag.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tag.click();}});
    });

    // 3) 搜尋高亮
    function clearMarks(card){var ms=card.querySelectorAll('mark.hl');if(!ms.length)return;
      ms.forEach(function(m){var t=document.createTextNode(m.textContent);m.parentNode.replaceChild(t,m);});card.normalize();}
    function highlight(card,q){var ql=q.toLowerCase();
      var walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
        if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
        if(n.parentNode&&n.parentNode.closest('mark'))return NodeFilter.FILTER_REJECT;
        return n.nodeValue.toLowerCase().indexOf(ql)>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
      var nodes=[],x;while((x=walker.nextNode()))nodes.push(x);
      var rx=new RegExp(esc(q),'ig');
      nodes.forEach(function(n){var s=n.nodeValue,frag=document.createDocumentFragment(),last=0,m;rx.lastIndex=0;
        while((m=rx.exec(s))){if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
          var mk=document.createElement('mark');mk.className='hl';mk.textContent=m[0];frag.appendChild(mk);
          last=m.index+m[0].length;if(m.index===rx.lastIndex)rx.lastIndex++;}
        if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n);});}

    function refreshSections(){
      document.querySelectorAll('#cards .subhead').forEach(function(sh){
        var el=sh.nextElementSibling,cards=null;
        while(el&&!el.classList.contains('subhead')){if(el.classList.contains('cards'))cards=el;el=el.nextElementSibling;}
        if(!cards)return;
        var hasVisible=[].some.call(cards.querySelectorAll('.card'),function(c){return c.style.display!=='none';});
        sh.style.display=hasVisible?'':'none';cards.style.display=hasVisible?'':'none';
      });
      document.querySelectorAll('#cards .group').forEach(function(g){
        var hasCard=[].some.call(g.querySelectorAll('.card'),function(c){return c.style.display!=='none';});
        var hasTable=[].some.call(g.querySelectorAll('.cmp'),function(t){return t.style.display!=='none';});
        g.style.display=(hasCard||hasTable)?'':'none';
      });
    }

    var raf;
    function post(){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){
      var q=search?search.value.trim():'';
      document.querySelectorAll('#cards .card').forEach(function(card){
        clearMarks(card);
        if(hf){
          if(starCount(card)!==3){card.style.display='none';return;}
          card.style.display='';
          card.classList.remove('collapsed');
          var cardGroup=card.closest('.group');if(cardGroup)cardGroup.classList.remove('collapsed');
        }else if(card.style.display==='none')return;
        if(q)highlight(card,q);});
      document.querySelectorAll('#cards .cmp').forEach(function(table){if(hf)table.style.display='none';});
      refreshSections();
    });}

    if(search){search.addEventListener('input',post);
      search.addEventListener('keydown',function(e){if(e.key==='Enter'){
        var cs=document.querySelectorAll('#cards .card'),hit=null;
        for(var i=0;i<cs.length;i++){if(cs[i].style.display!=='none'){hit=cs[i];break;}}
        if(hit){
          hit.classList.remove('collapsed');
          var group=hit.closest('.group');if(group)group.classList.remove('collapsed');
          saveCollapsed();
          requestAnimationFrame(function(){if(hit.scrollIntoView)hit.scrollIntoView({behavior:'smooth',block:'start'});});
        }}});}
    document.addEventListener('click',function(e){
      if(!e.target||!e.target.closest)return;
      if(!hf&&(e.target.closest('.card-head,.group-head')||e.target.closest('#expandAll')||e.target.closest('#collapseAll')))setTimeout(saveCollapsed,0);
      var tag=e.target.closest('.tagfilter');if(tag)setTimeout(function(){tag.setAttribute('aria-pressed',tag.classList.contains('active')?'true':'false');},0);
      if(e.target.closest('.tagfilter,.tag-toggle,#expandAll,#collapseAll'))post();});
    post();
  });
})();
