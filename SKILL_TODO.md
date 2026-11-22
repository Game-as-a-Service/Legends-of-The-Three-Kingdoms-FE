# 武將技前端實作檢點表

> 對照 [API_DOC.md](./API_DOC.md) §20–23 與前端程式碼整理，記錄後端已實作但前端尚未對應的武將技。
> 前端互動統一放在 [src/events/askSkillEffectEvent.ts](./src/events/askSkillEffectEvent.ts)（新增 handler 並註冊到 `skillEffectHandlers`）。
> API 包裝已存在：`Game.useSkillEffect(skillName, choice, cardIds?, targetPlayerId?)`。

## 已實作

- [x] 反饋（司馬懿）— `skillEffectHandlers`
- [x] 鬼才（司馬懿）— `skillEffectHandlers`
- [x] 護駕（曹操）詢問 — `skillEffectHandlers`
- [x] 護駕（魏將輪詢）— `MainPlayer` 的 `AskHuJiaEffectEvent`
- [x] 洛神（甄姬）— `skillEffectHandlers`
- [x] 裸衣（許褚）— `skillEffectHandlers`
- [x] 剛烈（夏侯惇）兩段 — `skillEffectHandlers`
- [x] 奸雄（曹操）— `MainPlayer` 的 `AskJianXiongEffectEvent`
- [x] 傾國（甄姬）— `canUseCardAsDodge`，問閃時黑牌直接 `playCard`
- [x] 流離（大喬）— `skillEffectHandlers`，選手牌後以 `MainPlayer.beginPlayerPick` 點座位選轉移目標
- [x] 國色（大喬）— `MainPlayer` 的國色按鈕（`guoSeMode`），選方塊手牌或裝備區的方塊牌（裝備欄藍框可點，需後端 PR #302）+ 目標後 `useSkillEffect('國色', 'CONTENTMENT', ...)`

- [x] 苦肉（黃蓋）— `MainPlayer` 的苦肉按鈕（`kuRouButton`），自己出牌階段（可扣到 0 滴，交由瀕死求桃流程），確認後 `useSkillEffect('苦肉', 'ACCEPT')`
- [x] 反間 第二段（周瑜的目標）— `skillEffectHandlers`，以 `MainPlayer.useSuitModal` 四花色按鈕選擇後 `useSkillEffect('反間', 'SPADE'|'HEART'|'DIAMOND'|'CLUB')`
- [x] 反間 第一段（周瑜）— `MainPlayer` 的反間按鈕（`fanJianButton`），自己出牌階段：確認 → 選 1 張手牌 → `beginPlayerPick` 點座位選目標 → `useSkillEffect('反間', 'ACCEPT', [cardId], targetId)`；每回合限一次由後端驗證，失敗時顯示錯誤訊息

- [x] 觀星（諸葛亮）— 回合開始（準備階段、判定之前）由後端 `AskSkillEffectEvent`（`options` = `ARRANGE`/`SKIP`，`dataCardIds` = 觀看的牌）詢問，`skillEffectHandlers` 以 `useSelectCardModal` 依點選順序（先點在最上）選出回牌堆頂的牌 → `useSkillEffect('觀星', 'ARRANGE', cardIds)`，未選者置牌堆底（不選 = 全置底）；「不發動」→ `useSkillEffect('觀星', 'SKIP')`。出牌階段的觀星按鈕已移除（後端不再接受主動發動）
- [x] 結姻（孫尚香）— `MainPlayer` 的結姻按鈕（`jieYinButton`），自己出牌階段：確認 → 選 2 張手牌 → `useSkillEffect('結姻', 'ACCEPT', cardIds)`；每回合限一次與回血對象由後端判定，失敗時顯示錯誤訊息。孫尚香 id 暫以 `WU008` 判斷（亦比對武將名稱）

- [x] 仁德（劉備）— `MainPlayer` 的仁德按鈕（`renDeButton`），自己出牌階段：確認 → 選 ≥1 張手牌 → `beginPlayerPick` 點座位選接收者 → `useSkillEffect('仁德', 'ACCEPT', cardIds, targetId)`；累積 2 張回血與每回合限一次由後端判定，失敗時顯示錯誤訊息。劉備 id 以 `SHU001` 判斷（亦比對武將名稱）


- [x] 遺計（郭嘉）— `skillEffectHandlers`，確認發動後二選一：`ACCEPT`（自摸 2）或 `beginPlayerPick` 點座位選其他存活角色 → `GIVE`（令其獲得 1 張）；跳過為 `SKIP`

## 不需實作（被動／鎖定技，後端自動套用）

- 馬術、咆哮、英姿、謙遜、連營、空城、集智、奇才、克己
- 天妒、鐵騎、梟姬、救援（僅廣播 `SkillEffectEvent`）

## 尚未實作

### A. 後端發 `AskSkillEffectEvent`，前端無 handler（會卡住，優先處理）

收到後只會 `console.warn('Unsupported skill effect')`。

- [ ] 激將（劉備主公技，詢問蜀將）— `ACCEPT`（cardIds 放 1 張殺）/ `DECLINE`

### B. 出牌階段主動技（前端無發動入口）

除 API 包裝外沒有任何按鈕／UI。topBehavior 為空時直接呼叫 `useSkillEffect` 發動。

- [ ] 制衡（孫權）— `ACCEPT`，cardIds 放要棄的牌（手牌 + 裝備，≥1），摸等量
- [x] 突襲（張遼）— 摸牌階段詢問（AskSkillEffectEvent），`ACCEPT` + cardIds 放目標玩家 id（1~2 名）或 `SKIP` 照常摸牌

### C. 轉化牌技（卡牌合法性判斷擋住）

目前 `canUseCardAsKill` / `canUseCardAsDodge` 只認殺、閃（傾國除外）。

- [ ] 武聖（關羽）— `KILL`，紅色牌（手牌或裝備區，後端 PR #302）當殺；可沿用 `showConversionEquipmentOptions`；主動出殺、`AskKillEvent`、決鬥回應（目前擋在 `card.name !== '殺'`）
- [x] 龍膽（趙雲）— `MainPlayer` 的龍膽按鈕（`longDanButton`，趙雲 id 暫以 `SHU005` 判斷），可切換：被問閃（`AskDodgeEvent`）時殺亮起可當閃 → `useSkillEffect('龍膽', 'DODGE', [殺 id])`；需要出殺（自己出牌階段主動出殺、`AskKillEvent`、`BorrowedSwordEvent`）時閃亮起可當殺 → `useSkillEffect('龍膽', 'KILL', [閃 id], targetId)`（主動與借刀殺人帶攻擊目標）
- [ ] 奇襲（甘寧）— `DISMANTLE`，黑牌（手牌或裝備區，後端 PR #302）當過河拆橋，可沿用 `showConversionEquipmentOptions`，目標必填，後續走 `useDismantleEffect`

### D. 前端有武將資料，但 API_DOC 未列技能（待向後端確認）

- [ ] 黃忠
- [ ] 魏延
- [ ] 華佗
- [ ] 呂布
- [ ] 貂蟬

## 建議順序

1. A 類（會卡住，且已有 handler 範式可循）
2. C 類中的龍膽、武聖（最常見）
3. B 類（需新增出牌階段的技能按鈕）
