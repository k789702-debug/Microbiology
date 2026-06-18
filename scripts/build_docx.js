const fs=require("fs");
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,LevelFormat,
TableOfContents,HeadingLevel,BorderStyle,WidthType,ShadingType,PageNumber,Header,Footer,PageBreak}=require("docx");
const DATA=JSON.parse(fs.readFileSync("media/data/media.json","utf8"));
const CW=9026,bd={style:BorderStyle.SINGLE,size:1,color:"BBBBBB"},borders={top:bd,bottom:bd,left:bd,right:bd};
const CM={top:50,bottom:50,left:90,right:90};
const ROLECOLOR={"碳源":"FBE8C0","氮源":"CDEFE6","緩衝":"D7DBF6","滲透":"CFE6F6","選擇劑":"F8D3DA","指示劑":"F8D6EF","凝固劑":"E2E6EB","生長因子":"E6D9F8","鑑別基質":"FBE8C0"};
function roleShade(r){const k=String(r).split("／")[0].split("/")[0].trim();return ROLECOLOR[k]||"FFFFFF";}
function md(s,opt){opt=opt||{};const parts=String(s).split("**");return parts.map((t,i)=>new TextRun({text:t,bold:(i%2===1)||!!opt.bold,size:opt.size||18,color:opt.color}));}
function cell(runs,w,opt){opt=opt||{};return new TableCell({borders,width:{size:w,type:WidthType.DXA},margins:CM,shading:opt.fill?{fill:opt.fill,type:ShadingType.CLEAR}:undefined,children:[new Paragraph({children:runs})]});}
function txt(t,w,opt){opt=opt||{};return cell([new TextRun({text:t,bold:!!opt.bold,size:opt.size||18})],w,opt);}
function sec(t){return new Paragraph({spacing:{before:120,after:40},children:[new TextRun({text:t,bold:true,size:19,color:"0F766E"})]});}
const TYPECOLOR={base:"5B6B7A",blood:"D2453F",enteric:"0D9488",gpos:"7B3FA0",bio:"C77D11",myco:"8A5A32",diph:"4F46E5",fungi:"C0397B",mha:"0284C7"};

function mediumBlocks(m){
  const o=[];
  o.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun(`${m.en} (${m.abbr})　${m.zh}　${"★".repeat(m.stars)}${"☆".repeat(3-m.stars)}`)]}));
  o.push(sec("① 成分處方表（材料 ‧ 比例 ‧ 功能角色）"));
  const cr=[new TableRow({tableHeader:true,children:[txt("材料",4600,{bold:true,fill:"E8EDF2"}),txt("比例",1700,{bold:true,fill:"E8EDF2"}),txt("功能角色",2726,{bold:true,fill:"E8EDF2"})]})];
  m.comp.forEach(c=>cr.push(new TableRow({children:[txt(c[0],4600),txt(c[1],1700),txt(c[2],2726,{fill:roleShade(c[2])})]})));
  o.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[4600,1700,2726],rows:cr}));
  o.push(sec("② pH 與滅菌條件"));
  o.push(new Paragraph({children:[new TextRun({text:"pH：",bold:true}),...md(m.ph),new TextRun("　｜　"),new TextRun({text:"滅菌：",bold:true}),...md(m.steril)]}));
  o.push(sec("③ 選擇／鑑別原理"));o.push(new Paragraph({children:md(m.principle)}));
  o.push(sec("④ 接種後表現"));o.push(new Paragraph({children:md(m.appear)}));
  o.push(sec("⑤ 對應菌種與典型反應"));
  const sr=[new TableRow({tableHeader:true,children:[txt("菌種",3200,{bold:true,fill:"E8EDF2"}),txt("典型反應",5826,{bold:true,fill:"E8EDF2"})]})];
  m.species.forEach(s=>sr.push(new TableRow({children:[cell([new TextRun({text:s[0],italics:true,size:18})],3200),cell(md(s[1]),5826)]})));
  o.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[3200,5826],rows:sr}));
  o.push(sec("⭐ 高頻考點與易混淆對比"));
  m.hot.forEach(h=>o.push(new Paragraph({numbering:{reference:"hy",level:0},children:md(h)})));
  o.push(sec("📋 代表性考古題（醫檢師 308）"));
  m.qa.forEach(q=>o.push(new Paragraph({numbering:{reference:"ex",level:0},children:[new TextRun({text:q[0]+"　",bold:true,color:"0F766E"}),new TextRun(q[1])]})));
  o.push(new Paragraph({children:[new PageBreak()]}));
  return o;
}
function cmpBlocks(t){
  const o=[];o.push(new Paragraph({spacing:{before:80,after:40},children:[new TextRun({text:"📊 "+(t.title||""),bold:true,size:19,color:"0F766E"})]}));
  if(t.note)o.push(new Paragraph({children:md(t.note,{size:16,color:"666666"})}));
  const n=t.columns.length,w=Math.floor(CW/n),cw=t.columns.map((_,i)=>i===n-1?CW-w*(n-1):w);
  const rows=[new TableRow({tableHeader:true,children:t.columns.map((c,i)=>txt(c,cw[i],{bold:true,fill:"E3F6F1",size:16}))})];
  t.rows.forEach(r=>rows.push(new TableRow({children:r.map((c,i)=>cell(md(c,{size:16}),cw[i]))})));
  o.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:cw,rows}));
  if(t.footnote)o.push(new Paragraph({spacing:{after:120},children:md(t.footnote,{size:16,color:"666666"})}));
  return o;
}
const groups=[...new Set(DATA.media.map(m=>m.h1))];
const children=[
 new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:"培養基成分與適用菌種大綱",bold:true,size:40})]}),
 new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},children:[new TextRun({text:"醫事檢驗師國家考試 ‧ 微生物學與臨床微生物學（包括細菌與黴菌）",size:20,color:"666666"})]}),
 new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:240},children:[new TextRun({text:"全 9 功能群 ‧ 35 張培養基 ‧ v"+DATA.meta.version,size:18,color:"999999"})]}),
 new Paragraph({children:[new TextRun({text:"目錄",bold:true,size:26})]}),
 new TableOfContents("TOC",{hyperlink:true,headingStyleRange:"1-2"}),
 new Paragraph({children:[new PageBreak()]})
];
groups.forEach(h1=>{
  children.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun(h1)]}));
  if(DATA.flows&&DATA.flows[h1])DATA.flows[h1].forEach(l=>children.push(new Paragraph({children:md(l,{size:18,color:"555555"})})));
  children.push(new Paragraph({children:[new TextRun("")]}));
  DATA.media.filter(m=>m.h1===h1).forEach(m=>mediumBlocks(m).forEach(b=>children.push(b)));
  (DATA.tables||[]).filter(t=>t.scope===h1).forEach(t=>cmpBlocks(t).forEach(b=>children.push(b)));
  children.push(new Paragraph({children:[new PageBreak()]}));
});
children.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun("資料依據")]}));
["成分與比例：BD BBL/Difco Manual (2nd ed.)、Oxoid/Thermo Fisher Culture Media Manual。","鑑定原理：Mahon, Textbook of Diagnostic Microbiology；Murray, Medical Microbiology。","考古題：考選部國家考試（醫事檢驗師，科目代號 308），民國 102–115 年。","※ 比例依製造商手冊，廠牌/批號略有差異，配製以手冊與 IFU 為準。"].forEach(t=>children.push(new Paragraph({numbering:{reference:"ref",level:0},children:[new TextRun({text:t,size:18})]})));
const doc=new Document({
 styles:{default:{document:{run:{font:"Arial",size:20}}},paragraphStyles:[
  {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:30,bold:true,font:"Arial",color:"0B5A4A"},paragraph:{spacing:{before:240,after:140},outlineLevel:0}},
  {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:24,bold:true,font:"Arial",color:"0F766E"},paragraph:{spacing:{before:180,after:100},outlineLevel:1}}]},
 numbering:{config:[
  {reference:"hy",levels:[{level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:520,hanging:260}}}}]},
  {reference:"ex",levels:[{level:0,format:LevelFormat.BULLET,text:"–",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:520,hanging:260}}}}]},
  {reference:"ref",levels:[{level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:520,hanging:260}}}}]}]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
  headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:"培養基成分與適用菌種大綱",size:16,color:"999999"})]})]})},
  footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"第 ",size:16,color:"999999"}),new TextRun({children:[PageNumber.CURRENT],size:16,color:"999999"}),new TextRun({text:" 頁",size:16,color:"999999"})]})]})},
  children}]
});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync("media/print/培養基大綱_全9群.docx",b);console.log("docx bytes:",b.length);});
