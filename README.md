# 醫事檢驗師 細菌分類大綱

科目：**微生物學與臨床微生物學（包括細菌與黴菌）**

互動式細菌分類複習網站：依 Gram 染色＋形態學分群、內嵌鑑定流程分流圖、可即時搜尋、依臨床系統標籤篩選，每菌附固定 9 欄位與歷年醫檢師考古題年度題號。

## 線上瀏覽（GitHub Pages）

```
https://<帳號>.github.io/Microbiology/
```

## 專案結構（資料與程式分離）

```
Microbiology/
├── index.html               前端入口（一般不需修改）
├── assets/
│   ├── style.css            樣式（色塊、版面）
│   └── app.js               程式邏輯（搜尋／篩選／渲染）
├── data/
│   └── bacteria.json        ★ 資料庫——共編者只需改這裡 ★
├── schema.json              資料結構定義（JSON Schema）
├── scripts/
│   └── validate.js          資料驗證器（零相依）
├── .github/workflows/
│   └── validate.yml         GitHub Actions：push/PR 時自動驗證
└── README.md
```

## 共編者如何編輯內容

**所有菌種內容都在 `data/bacteria.json`，不需要碰程式。**

每個菌種是 `species` 陣列中的一筆物件：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `h1` | string | 第一層分群（Gram＋形態，須與 `flows` 的 key 對應） |
| `h2` | string | 第二層屬科 |
| `zh` / `en` | string | 菌名（中文／學名，學名不可重複） |
| `stars` | number | 高頻程度，限 1–3 |
| `sys` | **陣列** | 臨床系統標籤，如 `["腸道","泌尿"]`；每個值必須出現在 `meta.clinical_systems` |
| `morph` `oxy` `media` `tests` `vir` `dis` `resist` | string | ②–⑧ 各欄位內容 |
| `hot` | 陣列 | ⑨ 高頻考點，每項一條 |
| `qa` | 陣列 | 代表考題，每筆為 `["年度 題號","題幹說明"]` |

### 粗體
任何文字欄位用 `**文字**` 即為粗體，不要寫 HTML 標籤。

### 新增菌種
複製一筆現有物件貼到 `species`，改內容即可。`h1`／`h2` 文字相同者自動歸到同群、同屬科。新分群請同步在 `flows` 加上該 `h1` 的分流圖。

### 臨床標籤
若要新增臨床系統（如「周邊神經」），須先加到 `meta.clinical_systems`，菌種的 `sys` 才能使用——否則自動驗證會擋下。

## 提交前自動驗證

本機檢查：

```
node scripts/validate.js
```

會檢查：JSON 格式、必填欄位、`stars` 限 1–3、`sys` 標籤是否都在 `clinical_systems`、`h1` 是否有對應分流圖、學名是否重複、`**粗體**` 是否成對、`qa` 結構、以及是否誤植 HTML 標籤。

GitHub 端：每次 push 或開 PR 變動 `data/`、`schema.json`、`scripts/` 時，`.github/workflows/validate.yml` 會自動跑同一支驗證；未通過會在 PR 顯示紅叉，避免壞資料上線。

## 離線單檔版
專案外另有 `細菌分類大綱_完整版.html`（資料已內嵌），可雙擊離線開啟；但**不會隨 `bacteria.json` 自動更新**，內容變更後需重新產生。

## 資料依據
- Mahon CR, Lehman DC. *Textbook of Diagnostic Microbiology*
- Murray PR, et al. *Medical Microbiology*
- 考選部「醫事檢驗師」國家考試試卷（已收錄民國 101–114 年完整年度，及 115 年第一次試卷），經 twinkle-hub 國考資料庫檢索；原卷可於考選部考畢試題查詢系統（wwwq.moex.gov.tw）以年度與題號調閱。

> 資料版本見 `data/bacteria.json` 的 `meta.version` 與 `meta.updated`。
