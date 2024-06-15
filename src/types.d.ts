import threeKingdomsCards from '~/assets/cards.json'
import threeKingdomsGenerals from '~/assets/generalCards.json'
import { roleMap } from './utils/domain'
export type ThreeKingdomsCardIds = keyof typeof threeKingdomsCards
export type ThreeKingdomsGeneralIds = keyof typeof threeKingdomsGenerals
export type GamePhase = 'Initial' | 'Normal' | 'GeneralDying' | 'GameOver'
export type RoundPhase = 'Judgement' | 'Drawing' | 'Action' | 'Discard'
export type Role = keyof typeof roleMap
export type PlayType = 'skip' | 'active' | 'inactive'
export type EquipmentPlayType = 'equipmentSkip' | 'equipmentActive'
export interface PlayerData {
    id: string
    generalId: string // 要改成對應的generalId
    roleId: Role
    hp: number
    hand: {
        size: number
        cardIds: ThreeKingdomsCardIds[]
    }
    equipments: ThreeKingdomsCardIds[]
    delayScrolls: ThreeKingdomsCardIds[]
}
export interface GameData {
    seats: PlayerData[]
    round: {
        roundPhase: RoundPhase
        currentRoundPlayer: string
        activePlayer: string
        dyingPlayer: string
        showKill: boolean
    }
    gamePhase: GamePhase
}

export interface Audios {
    peach: string
    kill: string
    dodge: string
    dismantle: string
    barbarianInvasion: string
    somethingForNothing: string
    arrowBarrage: string
    qilinBow: string
    chuKoNu: string
    eightDiagramFormation: string
    shadowrunner: string
    redHare: string
}
