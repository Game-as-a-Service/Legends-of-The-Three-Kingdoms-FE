# 三國殺前端事件處理 TODO

> 此文件記錄 API_DOC.md 中定義的 WebSocket 事件，哪些已處理、哪些尚未處理

## 狀態說明

-   ✅ 已完成：事件已在 Game.ts 和/或 MainPlayer.ts 中處理
-   ⚠️ 部分完成：事件已定義但可能需要優化
-   ❌ 未處理：尚未實作
-   📝 僅通知：不需要玩家互動，僅需顯示視覺效果

---

## 一、需要玩家回應的事件 (Ask 類)

### ✅ 已完成

| 事件名稱                                 | 說明                                   | 處理位置                | 對應 API                          |
| ---------------------------------------- | -------------------------------------- | ----------------------- | --------------------------------- |
| `AskPlayWardEvent`                       | 詢問是否出無懈可擊                     | Game.ts + MainPlayer.ts | playWardCard                      |
| `AskKillEvent`                           | 需要出殺（南蠻入侵/決鬥/借刀殺人）     | Game.ts + MainPlayer.ts | playCard                          |
| `AskDodgeEvent`                          | 需要出閃（萬箭齊發/被殺）              | Game.ts + MainPlayer.ts | playCard                          |
| `AskPeachEvent`                          | 瀕死需要出桃                           | Game.ts + MainPlayer.ts | playCard                          |
| `BountifulHarvestEvent`                  | 五穀豐登輪到你選牌                     | Game.ts + MainPlayer.ts | chooseCardFromBountifulHarvest    |
| `AskPlayEquipmentEffectEvent`            | 詢問是否使用裝備效果（如八卦陣）       | Game.ts + MainPlayer.ts | useEquipmentEffect                |
| `AskChooseMountCardEvent`                | 麒麟弓效果：選擇棄對方哪匹馬           | Game.ts + MainPlayer.ts | chooseHorseCard                   |
| `AskActivateYinYangSwordsEvent`          | 雌雄雙股劍發動詢問（攻擊者）           | Game.ts + MainPlayer.ts | activateYinYangSwords             |
| `AskYinYangSwordsEffectEvent`            | 雌雄雙股劍：目標選擇棄牌或讓攻擊者摸牌 | Game.ts + MainPlayer.ts | useYinYangSwordsEffect            |
| `AskGreenDragonCrescentBladeEffectEvent` | 青龍偃月刀效果詢問                     | Game.ts + MainPlayer.ts | useGreenDragonCrescentBladeEffect |

### ❌ 尚未處理

#### 1. WaitForWardEvent

**說明**：等待其他人出無懈可擊  
**觸發場景**：有錦囊牌被出，但自己沒有無懈可擊  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 的 `eventHandler` 新增 case 處理
-   [ ] 在 `src/classes/MainPlayer.ts` 或 Game UI 顯示「等待其他玩家出無懈可擊...」
    -   可以顯示倒數計時或等待動畫
    -   純 UI 提示，不需要玩家互動

---

## 二、效果/通知事件

### ✅ 已處理

| 事件名稱                      | 說明             | 處理位置 | 備註                                  |
| ----------------------------- | ---------------- | -------- | ------------------------------------- |
| `PlayCardEvent`               | 有人出牌         | Game.ts  | 包含特殊處理借刀殺人                  |
| `UseEquipmentEffectViewModel` | 裝備效果結果     | Game.ts  |                                       |
| `DrawCardEvent`               | 玩家摸牌         | Game.ts  | 目前註解掉，改由 GameStatusEvent 更新 |
| `NotifyDiscardEvent`          | 通知玩家需要棄牌 | Game.ts  | 觸發棄牌介面                          |
| `PlayerDamagedEvent`          | 玩家受傷         | Game.ts  | 目前註解掉，改由 GameStatusEvent 更新 |
| `PeachEvent`                  | 桃的回血效果     | Game.ts  | 目前註解掉，改由 GameStatusEvent 更新 |
| `GameOverEvent`               | 遊戲結束         | Game.ts  | 顯示勝利者                            |

### 📝 尚未處理（純通知事件，需要視覺效果）

#### 4. PlayWardCardEvent

**說明**：有人出無懈可擊  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示玩家出無懈可擊的動畫/提示

---

#### 5. GameStatusEvent

**說明**：遊戲狀態更新（每個操作都會發送）  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 更新所有玩家的狀態（HP、手牌數、裝備等）
-   [ ] 這個事件應該是最常用的，用來同步遊戲狀態

**優先級**：⭐⭐⭐ 高

---

#### 6. DiscardEvent

**說明**：玩家棄牌事件  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示玩家棄牌的動畫

---

#### 7. WardEvent

**說明**：無懈可擊結算結果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示 Ward 結算結果（幾張 Ward、效果是否生效）

---

#### 8. BarbarianInvasionEvent

**說明**：南蠻入侵效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示南蠻入侵的視覺效果
-   [ ] 顯示每個玩家是否出殺/受傷

---

#### 9. ArrowBarrageEvent

**說明**：萬箭齊發效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示萬箭齊發的視覺效果
-   [ ] 顯示每個玩家是否出閃/受傷

---

#### 10. DuelEvent

**說明**：決鬥效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示雙方交替出殺的過程
-   [ ] 顯示最終結果

---

#### 11. BountifulHarvestChooseCardEvent

**說明**：玩家選了五穀豐登的牌  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示玩家選了哪張牌
-   [ ] 從牌池中移除該牌

---

#### 12. ContentmentEvent

**說明**：樂不思蜀判定結果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示判定結果（紅心跳過/其他跳過出牌階段）

---

#### 13. LightningEvent

**說明**：閃電判定結果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示判定結果（黑桃2-9受3點傷害）

---

#### 14. LightningTransferredEvent

**說明**：閃電轉移到下家  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示閃電轉移的動畫

---

#### 15. SomethingForNothingEvent

**說明**：無中生有效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示玩家摸2張牌的動畫

---

#### 16. PeachGardenEvent

**說明**：桃園結義效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示全體回血的效果

---

#### 17. BorrowedSwordEvent

**說明**：借刀殺人效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示借刀殺人的流程

---

#### 18. EquipmentEvent

**說明**：裝備卡效果  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示玩家裝備卡的動畫

---

#### 19. JudgementEvent

**說明**：判定結果（八卦陣/樂不思蜀/閃電）  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示判定牌和結果

---

#### 20. YinYangSwordsEffectEvent

**說明**：雌雄雙股劍效果結算  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示效果結果（目標棄牌或攻擊者摸牌）

---

#### 21. BlackPommelEffectEvent

**說明**：青釭劍發動  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示「殺無視防具」的提示

---

#### 22. GreenDragonCrescentBladeTriggerEvent

**說明**：青龍偃月刀發動  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示追加的殺

---

#### 23. ViperSpearKillTriggerEvent

**說明**：丈八蛇矛發動  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示棄兩張牌當殺使用的效果
-   [ ] 需要額外實作 `useViperSpearKill` API 讓玩家主動使用

---

#### 25. HeavenlyDoubleHalberdKillTriggerEvent

**說明**：方天畫戟發動（多目標殺）  
**需要做的事**：

-   [ ] 在 `src/classes/Game.ts` 新增 case 處理
-   [ ] 顯示多目標殺的攻擊線

---

## 三、額外需要實作的 API

### ❌ 尚未實作

#### 1. useViperSpearKill

**說明**：丈八蛇矛主動出殺  
**API 格式**：

```typescript
POST /api/games/{gameId}/player:useViperSpearKill
{
  playerId: string,
  targetPlayerId: string,
  discardCardIds: string[]  // 必須是 2 張手牌
}
```

**需要做的事**：

-   [ ] 在 `composables/useApi.ts` 新增 API
-   [ ] 在 `src/classes/Game.ts` 新增調用方法
-   [ ] 在 UI 中新增使用丈八蛇矛的按鈕/觸發方式

---

## 四、開發建議

### 優先級排序

#### P0 - 核心功能（必須）

1. `GameStatusEvent` - 遊戲狀態同步（影響所有功能）
2. `WaitForWardEvent` - Ward 等待提示

#### P1 - 武器效果（重要）

3. `GreenDragonCrescentBladeTriggerEvent`
4. `BlackPommelEffectEvent`

#### P2 - 視覺效果（次要）

7. `PlayWardCardEvent`
8. `WardEvent`
9. `YinYangSwordsEffectEvent`
10. 各種錦囊效果事件（BarbarianInvasionEvent, ArrowBarrageEvent, DuelEvent 等）

#### P3 - 特殊功能（可選）

11. `useViperSpearKill` API
12. `ViperSpearKillTriggerEvent`
13. `HeavenlyDoubleHalberdKillTriggerEvent`
14. 判定相關事件（JudgementEvent, ContentmentEvent, LightningEvent 等）

---

## 五、實作模板

### 新增 Ask 事件處理範例

參考 `AskActivateYinYangSwordsEvent` 的實作：

1. **useApi.ts**：

```typescript
const useXxxEffect = (
    gameId: string,
    params: {
        playerId: string
        choice: 'OPTION_A' | 'OPTION_B'
        // 其他參數...
    },
) => {
    return api.post(`/api/games/${gameId}/player:useXxxEffect`, params)
}
```

2. **Game.ts eventHandler**：

```typescript
case 'AskXxxEvent':
    if (data.playerId === this.me.id) {
        this.me.processEvent(event)
    }
    break
```

3. **Game.ts 調用方法**：

```typescript
useXxxEffect = (choice: string, ...params) => {
    const params = {
        playerId: this.me.id,
        choice,
        ...params,
    }
    this.api.useXxxEffect(this.gameId, params)
}
```

4. **MainPlayer.ts processEvent**：

```typescript
case 'AskXxxEvent': {
    this.useConfirmModal({
        message: '詢問訊息',
        confirmText: '選項A',
        cancelText: '選項B',
        handleConfirm: () => {
            this.game?.useXxxEffect('OPTION_A', ...)
            this.mainInstanceMap.confirmModal?.setAlpha(0)
        },
        handleCancel: () => {
            this.game?.useXxxEffect('OPTION_B', ...)
            this.mainInstanceMap.confirmModal?.setAlpha(0)
        },
    })
    break
}
```

---

## 六、測試建議

-   每實作一個事件，建議搭配 Debug API 設定牌堆進行測試
-   優先測試完整流程（如：出殺 → 出閃 → 武器效果 → 扣血）
-   注意邊界情況（如：手牌不足、體力為0等）

---

**最後更新**：2026/04/19  
**維護者**：待補充
