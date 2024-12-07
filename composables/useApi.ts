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
        baseURL: (runtimeConfig.public.apiBaseUrl as string) || 'https://scolley31.com/',
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
    }
}
