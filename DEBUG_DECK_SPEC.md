# Debug 牌庫管理頁面規格書

## 需求概述

新增一個測試用頁面，讓開發/測試人員可以查看當前牌庫狀態，並將牌庫中的牌直接置換為指定的牌，以方便測試特定情境。

## 路由

-   **路徑**：`/debug-deck`
-   **進入方式**：直接在瀏覽器網址列輸入路由進入，首頁不設連結

## 功能需求

### 1. Game ID 自動判斷

-   預設使用 `my-id` 作為 gameId（與現有 `Game.ts`、`PhaserGame.vue` 一致）
-   頁面上提供輸入欄位，允許使用者手動更改 gameId

### 2. 查看牌庫

-   呼叫 `GET /api/debug/games/{gameId}/deck` 取得當前牌庫
-   顯示牌庫總數 (`deckSize`)
-   從最頂端（index 0，即下一張會被抽到的牌）到最後，依序列出所有牌
-   每張牌顯示：
    -   序號（從 1 開始）
    -   Card ID
    -   中文名稱（從 `assets/cards.json` 查對應名稱）
    -   花色符號與點數

### 3. 置換牌

-   每張牌旁邊提供下拉選單，可選擇要置換成的牌
-   下拉選單列出 `assets/cards.json` 中所有可用的牌（含 cardId + 中文名稱 + 花色 + 點數）
-   選擇後該位置的牌即時更新為選定的牌（前端先更新顯示）
-   不需要維持牌庫牌數量的一致性（允許重複的 cardId）

### 4. 儲存變更

-   提供「儲存」按鈕
-   點擊後呼叫 `PUT /api/debug/games/{gameId}/deck`，將修改後的完整牌庫送出
-   儲存成功/失敗顯示對應提示

### 5. 重新載入

-   提供「重新載入」按鈕，重新從 API 取得最新牌庫

## 使用的 API

| 動作     | Method | Endpoint                         |
| -------- | ------ | -------------------------------- |
| 查看牌庫 | GET    | `/api/debug/games/{gameId}/deck` |
| 設定牌庫 | PUT    | `/api/debug/games/{gameId}/deck` |

## 技術實作

-   頁面檔案：`pages/debug-deck.vue`
-   使用 `composables/useApi.ts` 中的 axios instance 發送請求
-   卡牌資料來源：`assets/cards.json`
-   花色/點數對應：`src/utils/domain.ts` 中的 `suits` 與 `ranks`
-   樣式使用 TailwindCSS
