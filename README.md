# 醫檢師微生物學複習大綱（Microbiology）

醫事檢驗師國家考試「**微生物學與臨床微生物學（包括細菌與黴菌）**」複習網站。
兩套**互相連結**的資料驅動大綱，共用同一套設計與編輯方式：

| 模組 | 內容 | 入口 |
|------|------|------|
| 🦠 **bacteria** 細菌分類大綱 | 依革蘭氏分類→屬科→菌種，含形態、鑑定試驗、毒素、疾病、抗藥性、高頻考點、鑑定流程圖、比較表 | `bacteria/index.html` |
| 🧫 **media** 培養基大綱 | 依功能類型分群，含成分處方表、功能角色、pH/滅菌、選擇/鑑別原理、接種後表現、適用菌種、判讀對照表 | `media/index.html` |
| 🍄 **fungi** 真菌大綱 | 依真菌「門」（子囊/擔子/接合）→ 形態/臨床次分群 → 物種，含形態、培養特徵、關鍵鑑定、疾病、抗真菌藥、高頻考點 | `fungi/index.html` |

兩者互連：細菌卡片的「④選擇/鑑別培養基」可點進對應培養基；培養基卡片的菌種可點回對應細菌。

## 資料夾結構

```
Microbiology/
├── index.html                  總入口（細菌 / 培養基 / 真菌）
├── README.md
├── .gitignore
├── bacteria/                   細菌模組
│   ├── index.html
│   ├── assets/{style.css, app.js}
│   └── data/bacteria.json      ← 編這個
├── media/                      培養基模組
│   ├── index.html
│   ├── assets/{style.css, app.js}
│   ├── data/media.json         ← 編這個
│   ├── print/培養基大綱_全9群.docx        A4 可列印 Word（全 9 群，內容與網頁一致）
│   └── 培養基大綱_全9群_離線版.html         單檔離線版（file:// 可直接開）
├── fungi/                      真菌模組
│   ├── index.html
│   ├── assets/{style.css, app.js}
│   └── data/fungi.json         ← 編這個
├── schema/{bacteria, media, fungi}.schema.json
├── scripts/{validate_bacteria, validate_media, validate_fungi}.js、build_offline.js、build_docx.js
└── .github/workflows/validate.yml         push/PR 自動驗證
```

## 如何新增 / 修改內容

只需編輯 `*/data/*.json`，不必寫 HTML。

- 文字中的 `**重點**` 會自動變粗體；不要自己寫 HTML 標籤。
- `qa` 格式為 `["115年 第27題", "題目說明"]`。
- `stars`：1–3（⭐常見 / ⭐⭐高頻 / ⭐⭐⭐極高頻）。

培養基一張卡的資料形狀（media.json → `media[]`）：

```jsonc
{
  "h1": "選擇兼鑑別（腸道）",      // 功能群（同群會收在一起）
  "type": "enteric",            // 主題色：base/blood/enteric/gpos/bio/myco/diph/fungi/mha
  "abbr": "XLD", "en": "...", "zh": "...", "stars": 3,
  "comp": [["材料","比例","功能角色"], ...],  // 角色：碳源/氮源/緩衝/滲透/選擇劑/指示劑/凝固劑/生長因子
  "ph": "...", "steril": "...",
  "principle": "**選擇**：…**鑑別**：…",
  "appear": "...",
  "species": [["Salmonella","紅色菌落、**黑心**"], ...],  // 菌名會自動連到細菌大綱
  "hot": ["...", "..."],
  "qa": [["108年 第36題","..."]]
}
```

## 驗證（零相依，純 Node）

```bash
node scripts/validate_bacteria.js
node scripts/validate_media.js
```

每次 push / PR 會由 GitHub Action 自動執行。

## 重新產生單檔離線版

```bash
node scripts/build_offline.js     # 產生 media/培養基大綱_全9群_離線版.html
node scripts/build_docx.js        # 產生 media/print/培養基大綱_全9群.docx
```

## 本機預覽

資料驅動版需經 HTTP（瀏覽器禁止 file:// 載入 JSON）：

```bash
python -m http.server      # 然後開 http://localhost:8000/
```

離線單檔版（`*_離線版.html`）可直接雙擊開啟。

## GitHub Pages

repo Settings → Pages → 來源選 `main` 分支根目錄即可，入口為根目錄 `index.html`。

## 進度

- ✅ 細菌：63 菌種（民國 101–115 考題）
- ✅ 真菌：**3 門、28 種**（子囊/擔子/接合；含 3 張比較矩陣）
- ✅ 培養基：**全 9 群、35 張**（含 5 張跨培養基比較矩陣）
  - 基礎/增菌：NA、TSA、BHI、Thioglycollate、Selenite F、APW
  - 含血/苛養：BAP、Chocolate、Thayer-Martin、Bordet-Gengou、BCYE
  - 選擇兼鑑別(腸道)：MAC、EMB、XLD、HE、SS、TCBS、CIN
  - G+選擇：MSA、CNA、PEA、Bile Esculin
  - 鑑別生化管：TSI、KIA、Urea、SIM、Simmons Citrate
  - 分枝桿菌：Löwenstein-Jensen、Middlebrook 7H10/7H11
  - 特殊/類白喉：Loeffler、Cystine-Tellurite/Tinsdale
  - 黴菌：Sabouraud(SDA)、PDA、CHROMagar Candida
  - 藥敏：Mueller-Hinton(MHA)

## 依據

- 成分與比例：BD BBL/Difco Manual（2nd ed.）、Oxoid/Thermo Fisher Culture Media Manual
- 鑑定原理：Mahon CR, Lehman DC. *Textbook of Diagnostic Microbiology*；Murray PR, et al. *Medical Microbiology*
- 考題：考選部「醫事檢驗師」國家考試（科目代號 308），民國 103–115 年，經 twinkle-hub 國考資料庫檢索

> ⚠️ 培養基成分比例依製造商手冊；不同廠牌／批號略有差異，實際配製以手冊與 IFU 為準。
