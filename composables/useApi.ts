import { useRuntimeConfig } from '#app'
import type {
    ThreeKingdomsCardIds,
    ThreeKingdomsGeneralIds,
    PlayType,
    EquipmentPlayType,
} from '~/src/types'
import axios from 'axios'
export function useApi() {
    const runtimeConfig = useRuntimeConfig()
    const api = axios.create({
        baseURL: (runtimeConfig.public.apiBaseUrl as string) || 'https://3k-api.parsons125.in/',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const createGame = (params: { gameId: string; players: string[] }) => {
        return api.post('/api/games', params)
    }
    const monarchChooseGeneral = async (
        gameId: string,
        params: { playerId: string; generalId: ThreeKingdomsGeneralIds },
    ) => {
        return api.post(`/api/games/${gameId}/player:monarchChooseGeneral`, params)
    }
    const selectGeneral = async (
        gameId: string,
        params: { playerId: string; generalId: ThreeKingdomsGeneralIds },
    ) => {
        return api.post(`/api/games/${gameId}/player:otherChooseGeneral`, params)
        // console.log(res)
    }
    const playCard = (
        gameId: string,
        params: {
            cardId: ThreeKingdomsCardIds
            playerId: string
            targetPlayerId: string
            playType: PlayType
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:playCard`, params)
    }
    const finishAction = (gameId: string, params: any) => {
        return api.post(`/api/games/${gameId}/player:finishAction`, params)
    }
    const discardCards = (gameId: string, params: any) => {
        return api.post(`/api/games/${gameId}/player:discardCards`, params)
    }
    const useEquipmentEffect = (
        gameId: string,
        params: {
            cardId: ThreeKingdomsCardIds
            playerId: string
            targetPlayerId: string
            playType: EquipmentPlayType
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useEquipmentEffect`, params)
    }
    const chooseHorseCard = (
        gameId: string,
        params: {
            cardId: ThreeKingdomsCardIds
            playerId: string // 自己的id
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:chooseHorseCard`, params)
    }
    const useBorrowedSwordEffect = (
        gameId: string,
        params: {
            currentPlayerId: string
            borrowedPlayerId: string
            attackTargetPlayerId: string
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useBorrowedSwordEffect`, params)
    }
    /// 過河拆橋
    /**
     *
     * @param gameId
     * @param params {
     * currentPlayerId: string
     * targetPlayerId: string
     * cardId?: ThreeKingdomsCardIds //要拆的卡(裝備)
     * targetCardIndex?: number //要拆的卡在手牌的位置(手牌)
     * }
     * @returns
     */
    const useDismantleEffect = (
        gameId: string,
        params: {
            currentPlayerId: string
            targetPlayerId: string
            cardId?: ThreeKingdomsCardIds
            targetCardIndex?: number
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useDismantleEffect`, params)
    }
    /// 順手牽羊
    /**
     *
     * @param gameId
     * @param params {
     * currentPlayerId: string
     * targetPlayerId: string
     * cardId?: ThreeKingdomsCardIds //要牽的卡(裝備)
     * targetCardIndex?: number //要牽的卡在手牌的位置(手牌)
     * }
     * @returns
     */
    const useSnatchEffect = (
        gameId: string,
        params: {
            currentPlayerId: string
            targetPlayerId: string
            cardId?: ThreeKingdomsCardIds
            targetCardIndex?: number
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useSnatchEffect`, params)
    }
    /// 五穀豐登
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string
     * cardId: string
     * }
     * @returns
     */ const chooseCardFromBountifulHarvest = (
        gameId: string,
        params: {
            playerId: string
            cardId: string
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:chooseCardFromBountifulHarvest`, params)
    }
    /// 是否出無懈可擊
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string
     * cardId: string
     * playType: PlayType // 'skip' | 'active' | 'inactive'
     * }
     * @returns
     */ const playWardCard = (
        gameId: string,
        params: {
            playerId: string
            cardId: string
            playType: PlayType
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:playWardCard`, params)
    }
    const getDeck = (gameId: string) => {
        return api.get(`/api/debug/games/${gameId}/deck`)
    }
    const setDeck = (gameId: string, params: { cardIds: string[] }) => {
        return api.put(`/api/debug/games/${gameId}/deck`, params)
    }
    /// 雌雄雙股劍發動詢問（攻擊者）
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string // 攻擊者玩家 ID（裝備雌雄雙股劍的 A）
     * choice: string // ACTIVATE（發動效果）或 SKIP（不發動，直接進入出閃流程）
     * }
     * @returns
     */
    const activateYinYangSwords = (
        gameId: string,
        params: {
            playerId: string
            choice: 'ACTIVATE' | 'SKIP'
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:activateYinYangSwords`, params)
    }
    /// 雌雄雙股劍效果
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string // 做選擇的玩家 ID（被殺的目標 B）
     * choice: string // TARGET_DISCARDS（目標棄一張手牌）或 ATTACKER_DRAWS（讓攻擊者摸牌）
     * cardId: string // 要棄的手牌 cardId（choice=TARGET_DISCARDS 時必填；ATTACKER_DRAWS 時傳空字串）
     * }
     * @returns
     */
    const useYinYangSwordsEffect = (
        gameId: string,
        params: {
            playerId: string
            choice: 'TARGET_DISCARDS' | 'ATTACKER_DRAWS'
            cardId: string
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useYinYangSwordsEffect`, params)
    }
    /// 青龍偃月刀效果
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string // 裝備青龍偃月刀的玩家 ID
     * choice: string // KILL（再出一張殺）或 SKIP（不出殺）
     * killCardId: string // 要出的殺的 cardId（choice=KILL 時必填；SKIP 時傳空字串）
     * }
     * @returns
     */
    const useGreenDragonCrescentBladeEffect = (
        gameId: string,
        params: {
            playerId: string
            choice: 'KILL' | 'SKIP'
            killCardId: string
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useGreenDragonCrescentBladeEffect`, params)
    }
    /// 貫石斧效果
    /**
     *
     * @param gameId
     * @param params {
     * playerId: string // 裝備貫石斧的玩家 ID
     * choice: string // DISCARD_TWO（棄兩張牌強制命中）或 SKIP（不發動）
     * discardCardIds: string[] // 要棄的兩張 cardId（SKIP 時傳空陣列）
     * }
     * @returns
     */
    const useStonePiercingAxeEffect = (
        gameId: string,
        params: {
            playerId: string
            choice: 'DISCARD_TWO' | 'SKIP'
            discardCardIds: string[]
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useStonePiercingAxeEffect`, params)
    }
    const useViperSpearKill = (
        gameId: string,
        params: {
            playerId: string
            targetPlayerId: string
            discardCardIds: string[]
        },
    ) => {
        return api.post(`/api/games/${gameId}/player:useViperSpearKill`, params)
    }
    return {
        api,
        createGame,
        monarchChooseGeneral,
        selectGeneral,
        playCard,
        finishAction,
        discardCards,
        useEquipmentEffect,
        chooseHorseCard,
        useBorrowedSwordEffect,
        useDismantleEffect,
        useSnatchEffect,
        chooseCardFromBountifulHarvest,
        playWardCard,
        activateYinYangSwords,
        useYinYangSwordsEffect,
        useGreenDragonCrescentBladeEffect,
        useStonePiercingAxeEffect,
        useViperSpearKill,
        getDeck,
        setDeck,
    }
}
