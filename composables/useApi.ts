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
        useYinYangSwordsEffect,
        getDeck,
        setDeck,
    }
}
