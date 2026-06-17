# 醫事檢驗師 細菌分類大綱

科目：**微生物學與臨床微生物學（包括細菌與黴菌）**

互動式細菌分類複習網站：依 Gram 染色＋形態學分群、內嵌鑑定流程分流圖、可即時搜尋、依臨床系統標籤篩選，每菌附固定 9 欄位與歷年醫檢師考古題年度題號。

## 線上瀏覽（GitHub Pages）

啟用 Pages 後即可開啟：

```
https://k789702-debug.github.io/Microbiology/
```

## 專案結構（資料與程式分離）

```
Microbiology/
├── index.html          前端入口（一般不需修改）
├── assets/
│   ├── style.css       樣式（色塊、版面）
│   └── app.js          程式邏輯（搜尋／篩選／渲染）
├── data/
│   └── bacteria.json   ★ 資料庫——共編者只需改這裡 ★
└── README.md
```

## 共編者如何編輯內容（重點）

**所有菌種內容都在 `data/bacteria.json`，不需要碰程式。**

每個菌種是一筆物件，欄位如下：

| 欄位 | 說明 |
|------|------|
| `h1` | 第一層分群（Gram＋形態，如「革蘭氏陰性桿菌（G⁻ Bacilli）」） |
| `h2` | 第二層屬科（如「腸桿菌目 Enterobacterales」） |
| `zh` / `en` | 菌名（中文／學名） |
| `stars` | 高頻程度 1–3（⭐ 顆數） |
| `sys` | 臨床系統標籤（字串，以 `/` 分隔，如 `"腸道 / 泌尿 / 血流"`） |
| `morph` `oxy` `media` `tests` `vir` `dis` `resist` | ②–⑧ 各欄位內容 |
| `hot` | ⑨ 高頻考點（字串陣列，每項一條） |
| `qa` | 代表考古題，陣列，每筆為 `["年度 題號","題幹說明"]` |

### 粗體寫法
在任何文字欄位用 `**文字**` 包起來即為**粗體**（不需寫 HTML 標籤）。例如：
```json
"tests": "**Coagulase(+)**；thermostable DNase(+)"
```

### 新增一個菌種
複製一筆現有物件、貼到 `species` 陣列中、修改內容即可。`h1`／`h2` 文字相同者會自動歸到同一群、同一屬科。

### 鑑定流程分流圖
位於 `flows` 物件，key 為 `h1` 名稱，value 為字串陣列（每行一條，可用 `**粗體**`）。

### 編輯方式
- 直接在 GitHub 網頁點 `data/bacteria.json` → 鉛筆圖示編輯 → Commit；或
- 開 Pull Request 供審閱後合併。
- 建議改完用 <https://jsonlint.com> 檢查 JSON 格式無誤（少逗號、引號未閉合會導致無法載入）。

## 離線單檔版
專案根目錄外另有 `細菌分類大綱_完整版.html`（資料已內嵌），可雙擊離線開啟，適合個人攜帶；但**它不會隨 `bacteria.json` 自動更新**，內容變更後需重新產生。

## 資料依據
- Mahon CR, Lehman DC. *Textbook of Diagnostic Microbiology*
- Murray PR, et al. *Medical Microbiology*
- 考選部歷年「醫事檢驗師」國家考試試卷（民國 101–115 年），經 twinkle-hub 國考資料庫檢索；原卷可於考選部考畢試題查詢系統（wwwq.moex.gov.tw）以年度與題號調閱。
