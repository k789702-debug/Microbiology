# 共編指南

歡迎一起完善這份細菌分類大綱！

## 你只需要改一個檔案
所有內容都在 **`data/bacteria.json`**。欄位定義與規則見 `README.md` 與 `schema.json`，不需要改程式。

## 流程
1. Fork 或在本 repo 開分支。
2. 編輯 `data/bacteria.json`（新增/修正菌種、考題、高頻點）。
3. 本機跑驗證：`node scripts/validate.js`（或交給 GitHub Actions 自動檢查）。
4. 開 Pull Request，說明依據的教科書／指引／考題出處。

## 撰寫規範
- 粗體用 `**文字**`，**不要**寫 HTML 標籤。
- `sys` 用陣列，且每個標籤須先存在於 `meta.clinical_systems`。
- `stars` 僅 1–3；學名（`en`）不可重複。
- 涉及醫學事實的修改，請附上**可查證來源**（教科書章節、CLSI/CDC、PubMed 連結等）。
- 修正考題資訊時，請標明試卷年度與題號，以利他人核對。

## 審稿原則
維護者會就「正確性、可追溯性、與既有風格一致」進行審閱；有爭議的醫學內容以權威來源為準。
