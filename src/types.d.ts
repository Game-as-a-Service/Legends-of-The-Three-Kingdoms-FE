import threeKingdomsCards from '~/assets/cards.json'
import threeKingdomsGenerals from '~/assets/generalCards.json'
import weaponFeatures from '~/assets/weaponFeatures.json'
import { roleMap } from './utils/domain'
export type ThreeKingdomsCardIds = keyof typeof threeKingdomsCards
export type ThreeKingdomsGeneralIds = keyof typeof threeKingdomsGenerals
export type GamePhase = 'Initial' | 'Normal' | 'GeneralDying' | 'GameOver'
export type RoundPhase = 'Judgement' | 'Drawing' | 'Action' | 'Discard'
export type Role = keyof typeof roleMap
export type PlayType = 'skip' | 'active' | 'inactive'
export type EquipmentPlayType = 'equipmentSkip' | 'equipmentActive'
/**
 * 判定區的一張牌。cardId 是實際的牌（畫牌面用），effect 是它在判定區的效果。
 * 國色（大喬）會把方塊的任意牌當樂不思蜀放進判定區，此時兩者不同：
 * 例 { cardId: 'SD3081'（方塊3 順手牽羊）, effect: 'CONTENTMENT', effectName: '樂不思蜀' }。
 * 判斷效果請看 effect，不要用 cardId 推牌名。
 */
export interface DelayScroll {
    cardId: ThreeKingdomsCardIds
    effect: 'CONTENTMENT' | 'LIGHTNING'
    effectName: string
}
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
    delayScrolls: DelayScroll[]
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
export interface ThreeKingdomsCard {
    id: ThreeKingdomsCardIds
    name: string
    rank: number
    suit: string
    audio: string
    type: string
}

export interface WeaponFeature {
    attackDistance: number
}
