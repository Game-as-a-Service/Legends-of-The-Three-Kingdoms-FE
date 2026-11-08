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
- [x] 國色（大喬）— `MainPlayer` 的國色按鈕（`guoSeMode`），選方塊手牌 + 目標後 `useSkillEffect('國色', 'CONTENTMENT', ...)`

- [x] 苦肉（黃蓋）— `MainPlayer` 的苦肉按鈕（`kuRouButton`），自己出牌階段（可扣到 0 滴，交由瀕死求桃流程），確認後 `useSkillEffect('苦肉', 'ACCEPT')`

## 不需實作（被動／鎖定技，後端自動套用）

- 馬術、咆哮、英姿、謙遜、連營、空城、集智、奇才、克己
- 天妒、鐵騎、梟姬、救援（僅廣播 `SkillEffectEvent`）

## 尚未實作

### A. 後端發 `AskSkillEffectEvent`，前端無 handler（會卡住，優先處理）

收到後只會 `console.warn('Unsupported skill effect')`。

- [ ] 遺計（郭嘉）— `ACCEPT`（自摸 2）/ `GIVE`（選目標給 1 張）/ `SKIP`
- [ ] 激將（劉備主公技，詢問蜀將）— `ACCEPT`（cardIds 放 1 張殺）/ `DECLINE`
- [ ] 反間 第二段（周瑜的目標）— 猜花色 `SPADE` / `HEART` / `DIAMOND` / `CLUB`
- [ ] 觀星 第二段（諸葛亮）— `ARRANGE`，依 `dataCardIds` 排列回牌堆頂的順序（未列出者置牌堆底）

> 反間第二段、觀星第二段的事件格式依 API_DOC 推測，實作前需與後端確認。

### B. 出牌階段主動技（前端無發動入口）

除 API 包裝外沒有任何按鈕／UI。topBehavior 為空時直接呼叫 `useSkillEffect` 發動。

- [ ] 制衡（孫權）— `ACCEPT`，cardIds 放要棄的牌（手牌 + 裝備，≥1），摸等量
- [ ] 突襲（張遼）— 每回合 1 次，`ACCEPT`，cardIds 放目標玩家 id（1~2 名）
- [ ] 反間 第一段（周瑜）— 每回合 1 次，`ACCEPT`，cardIds 放 1 張手牌 + targetPlayerId
- [ ] 結姻（孫尚香）— 每回合 1 次，`ACCEPT`，cardIds 放 2 張手牌
- [ ] 仁德（劉備）— `ACCEPT`，cardIds 放手牌（≥1）+ targetPlayerId，累積 2 張回 1 體力（回血每回合 1 次）
- [ ] 觀星 第一段（諸葛亮）— 每回合 1 次，`ACCEPT`，之後接 A 類第二段

### C. 轉化牌技（卡牌合法性判斷擋住）

目前 `canUseCardAsKill` / `canUseCardAsDodge` 只認殺、閃（傾國除外）。

- [ ] 武聖（關羽）— `KILL`，紅色手牌當殺；主動出殺、`AskKillEvent`、決鬥回應（目前擋在 `card.name !== '殺'`）
- [ ] 龍膽（趙雲）— `KILL` / `DODGE`，殺當閃（`AskDodgeEvent`）、閃當殺（主動與 `AskKillEvent`）
- [ ] 奇襲（甘寧）— `DISMANTLE`，黑牌當過河拆橋，目標必填，後續走 `useDismantleEffect`

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
