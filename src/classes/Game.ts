import { Player, MainPlayer, Card, BattleScene } from './index'
import { atkLine } from '../utils/drawing'
import type {
    ThreeKingdomsCardIds,
    GameData,
    ThreeKingdomsCard,
    PlayType,
    EquipmentPlayType,
    WeaponFeature,
} from '~/src/types'
import threeKingdomsCardsJson from '~/assets/cards.json'
import weaponFeaturesJson from '~/assets/weaponFeatures.json'
// import api from '~/src/utils/api'
const locations = [
    { x: 640, y: 160 },
    { x: 400, y: 120 },
    { x: 160, y: 160 },
]
const threeKingdomsCards: { [key in ThreeKingdomsCardIds]: ThreeKingdomsCard } =
    threeKingdomsCardsJson as { [key in ThreeKingdomsCardIds]: ThreeKingdomsCard }
const weaponFeatures: { [key: string]: WeaponFeature } = weaponFeaturesJson
// const playCard = async (
//     gameId: string,
//     params: {
//         cardId: ThreeKingdomsCardIds
//         playerId: string
//         targetPlayerId: string
//         playType: PlayType
//     },
// ) => {
//     const res = await api.post(`/api/games/${gameId}/player:playCard`, params)
//     console.log(res)
// }
// const finishAction = async (gameId: string, params: any) => {
//     const res = await api.post(`/api/games/${gameId}/player:finishAction`, params)
//     console.log(res)
// }
// const discardCards = async (gameId: string, params: any) => {
//     const res = await api.post(`/api/games/${gameId}/player:discardCards`, params)
//     console.log(res)
// }
export default class Game {
    seats: Player[] = []
    hand: { tableCenter: any; handCards: Card[] } = {
        tableCenter: {
            x: 400,
            y: 300,
        },
        handCards: [],
    }
    me!: MainPlayer
    scene!: BattleScene
    gameId: string = 'my-id'
    gameData: GameData = {
        gamePhase: 'Initial',
        seats: [],
        round: {
            roundPhase: 'Judgement',
            currentRoundPlayer: '',
            activePlayer: '',
            dyingPlayer: '',
            showKill: false,
        },
    }
    hintInstance!: Phaser.GameObjects.Container
    api: any
    selectTargetPlayers: Player[] = []
    constructor(gameData: any, scene: BattleScene, api: any) {
        this.scene = scene
        this.api = api
        this.seats = gameData.seats.map((player: any, index: number) => {
            const playerInstance = new Player({
                ...player,
                x: locations[index].x,
                y: locations[index].y,
                scene,
                handleClickPlayer: this.handleClickPlayer,
                game: this,
            })
            playerInstance.createInstance()
            return playerInstance
        })
        this.createMe({
            me: gameData.me,
            myCards: gameData.me.hand.cardIds,
        })
        // 提示文字
        const hintText = scene.add.text(0, 0, '誰贏了', {
            fontSize: '30px',
            color: '#FFF',
        })
        hintText.setOrigin(0.5)
        const hintContainer = scene.add.container(0, 0, [hintText])
        hintContainer.setPosition(400, 300)
        hintContainer.setAlpha(0)
        this.hintInstance = hintContainer
        this.gameData = gameData
    }
    gamePlayCardHandler = (card: Card, reactionType: string) => {
        console.log('gamePlayCardHandler', card, reactionType)
        if (reactionType === 'AskDodgeEvent') {
            const playType = card.id ? 'inactive' : 'skip'
            const params = {
                cardId: card.id || '',
                playerId: this.me.id,
                targetPlayerId: '',
                playType: playType,
            }
            this.api.playCard(this.gameId, params)
            return
        }
        if (reactionType === 'AskPeachEvent') {
            const playType = card.id ? 'inactive' : 'skip'
            const params = {
                cardId: card.id,
                playerId: this.me.id,
                targetPlayerId: this.gameData.round?.dyingPlayer,
                playType: playType,
            }
            this.api.playCard(this.gameId, params)
            return
        }
        if (reactionType === 'AskKillEvent') {
            const playType = card.id ? 'inactive' : 'skip'
            const params = {
                cardId: card.id || '',
                playerId: this.me.id,
                targetPlayerId: this.gameData.round?.dyingPlayer,
                playType: playType,
            }
            this.api.playCard(this.gameId, params)
            return
        }
        if (card.name === '借刀殺人') {
            const params = {
                playerId: this.me.id,
                targetPlayerId: this.selectTargetPlayers[0].id,
                cardId: card.id,
                playType: 'active',
            }
            this.api.playCard(this.gameId, params)
            this.seats.forEach((player) => player.setOutOfDistance(true))
            return
        }
        const params = {
            playerId: this.me.id,
            targetPlayerId: this.me.id,
            cardId: card.id,
            playType: 'active', //skip
        }
        this.api.playCard(this.gameId, params)
    }
    handleClickPlayer = (player: Player) => {
        if (!this.me.selectedCard || player.isOutofDistance) return
        if (this.me.selectedCard.name === '過河拆橋') {
            this.seats.forEach((player) => player.setOutOfDistance(false))
            if (this.me.selectedCard!.name === '過河拆橋') {
                // 開啟選擇面板
                const event = {
                    targetPlayer: player,
                }
                this.me.askReaction('useDismantleEffect', event)
            }
            return
        }
        if (
            this.me.selectedCard.name === '殺' ||
            this.me.selectedCard.name === '決鬥' ||
            this.me.selectedCard.name === '樂不思蜀'
        ) {
            const params = {
                playerId: this.me.id,
                targetPlayerId: player.id,
                cardId: this.me.selectedCard.id,
                playType: 'active', //skip
            }
            this.api.playCard(this.gameId, params)
            atkLine({
                endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                scene: this.scene,
            })
            const card = this.me.selectedCard
            card.playCard()
            console.log(player, this.me)
            this.seats.forEach((player) => player.setOutOfDistance(false))
            this.me.selectedCard = null
        }
        if (this.me.selectedCard?.name === '借刀殺人') {
            // 借刀殺人要依序選擇目標
            if (this.selectTargetPlayers.length === 0) {
                player.setPlayerSelected(true, 'from')
                this.selectTargetPlayers.push(player)
                // 把此玩家攻擊範圍內的玩家設定為可選擇
                this.seats.forEach((p) => {
                    if (p.id !== player.id && this.canAttack(player, p)) {
                        p.setOutOfDistance(false)
                    }
                })
            } else if (this.selectTargetPlayers.length === 1) {
                // 已有選擇攻擊玩家，選擇被攻擊玩家
                player.setPlayerSelected(true, 'to')
                this.selectTargetPlayers.push(player)
            }
        }
    }
    skipPlayCard = () => {
        const params = {
            playerId: this.me.id,
            targetPlayerId: '',
            cardId: '',
            playType: 'skip', //skip
        }
        this.api.playCard(this.gameId, params)
    }
    finishAction = () => {
        const params = {
            playerId: this.me.id,
        }
        this.api.finishAction(this.gameId, params)
    }
    discardCards = (cardIds: string[]) => {
        // const params = {
        //     playerId: this.me.id,
        //     cardIds,
        // }
        this.api.discardCards(this.gameId, cardIds)
    }
    useEquipmentEffect = (cardId: string, targetPlayerId: string, playType: EquipmentPlayType) => {
        const params = {
            playerId: this.me.id,
            targetPlayerId,
            cardId,
            playType: playType,
        }
        this.api.useEquipmentEffect(this.gameId, params)
    }
    chooseHorseCard = (cardId: string) => {
        const params = {
            playerId: this.me.id,
            cardId,
        }
        this.api.chooseHorseCard(this.gameId, params)
    }
    useDismantleEffect = async (
        targetPlayerId: string,
        cardId: ThreeKingdomsCardIds | undefined,
        targetCardIndex?: number,
    ) => {
        //先出過河拆橋
        const params = {
            playerId: this.me.id,
            targetPlayerId,
            cardId: this.me.selectedCard!.id,
            playType: 'active', //skip
        }
        await this.api.playCard(this.gameId, params)
        const player = this.seats.find((player) => player.id === targetPlayerId)
        if (player === undefined) return
        atkLine({
            endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
            scene: this.scene,
        })
        const card = this.me.selectedCard
        this.me.selectedCard = null // 避免影響牌重整先設為null
        card!.playCard()
        // 指定要拆哪張牌
        const params2 = {
            currentPlayerId: this.me.id,
            targetPlayerId,
            cardId,
            targetCardIndex,
        }
        this.api.useDismantleEffect(this.gameId, params2)
    }
    chooseCardFromBountifulHarvest = (cardId: ThreeKingdomsCardIds) => {
        const params = {
            playerId: this.me.id,
            cardId,
        }
        this.api.chooseCardFromBountifulHarvest(this.gameId, params)
    }
    async eventHandler(event: any) {
        console.log(event)
        const data = event.data
        switch (event.event) {
            case 'PlayCardEvent':
                if (data.playType === 'skip') {
                    return
                }
                // 借刀殺人特殊處理
                // 如果是自己出借刀殺人，收到event要再呼叫借刀殺人api
                const cardInfo = threeKingdomsCards[data.cardId as ThreeKingdomsCardIds]
                console.log(cardInfo, data.playerId, this.me.id)
                if (cardInfo.name === '借刀殺人' && data.playerId === this.me.id) {
                    const params = {
                        currentPlayerId: this.me.id,
                        borrowedPlayerId: this.selectTargetPlayers[0].id,
                        attackTargetPlayerId: this.selectTargetPlayers[1].id,
                    }
                    this.api.useBorrowedSwordEffect(this.gameId, params)
                    const player1 = this.seats.find(
                        (player) => player.id === this.selectTargetPlayers[0].id,
                    )
                    const player2 = this.seats.find(
                        (player) => player.id === this.selectTargetPlayers[1].id,
                    )
                    if (player1) player1.setPlayerSelected(false)
                    if (player2) player2.setPlayerSelected(false)
                    this.seats.forEach((p) => {
                        p.setOutOfDistance(false)
                    })
                    this.selectTargetPlayers = []
                    return
                }
                if (data.playerId === this.me.id) {
                    return
                }
                const player = this.seats.find((player) => player.id === data.playerId)
                if (player === undefined) return
                const playCard = new Card({
                    cardId: data.cardId,
                    x: player.instance.x,
                    y: player.instance.y,
                    scene: this.scene,
                })
                playCard.playCard()
                if (data.targetPlayerId === '') {
                    return
                }
                const startPoint = new Phaser.Math.Vector2(player.instance.x, player.instance.y)
                if (data.targetPlayerId == this.me.id) {
                    atkLine({
                        startPoint,
                        endPoint: new Phaser.Math.Vector2(400, 515),
                        scene: this.scene,
                    })
                    return
                }
                const targetPlayer = this.seats.find((player) => player.id === data.targetPlayerId)
                if (targetPlayer === undefined) return
                atkLine({
                    startPoint,
                    endPoint: new Phaser.Math.Vector2(
                        targetPlayer.instance.x,
                        targetPlayer.instance.y,
                    ),
                    scene: this.scene,
                })
                break
            case 'AskDodgeEvent':
                if (data.playerId === this.me.id) {
                    this.me.askReaction('AskDodgeEvent', event)
                }
                break
            case 'AskPlayEquipmentEffectEvent':
                // const data = {
                //     event: 'AskPlayEquipmentEffectEvent',
                //     data: {
                //         playerId: 'Tux',
                //         equipmentCardId: 'ES2015',
                //         equipmentCardName: '八卦陣',
                //     },
                //     message: '請問要否要發動裝備卡八卦陣的效果',
                // }
                // 詢問是否使用裝備牌的效果
                if (data.playerId === this.me.id) {
                    this.me.askReaction('askPlayEquipmentEffect', event)
                }
                break
            case 'AskChooseMountCardEvent':
                // const data = {
                //     chooseMountCardPlayerId: 'Scolley',
                //     targetPlayerId: 'YangJun',
                //     mountCardIds: ['ES5018', 'EH5044'],
                // }
                // 詢問是否使用裝備牌的效果
                if (data.chooseMountCardPlayerId === this.me.id) {
                    this.me.askReaction('AskChooseMountCardEvent', event)
                }
                break
            case 'SkipEquipmentEffectViewModel':
                // {
                //     "event": "SkipEquipmentEffectViewModel",
                //     "data": {
                //         "playerId": "Scolley",
                //         "cardId": "ES2015"
                //     },
                //     "message": "跳過裝備效果"
                // }
                if (data.cardId === 'EH5031') {
                    // 麒麟弓不用觸發要求出閃
                    break
                }
                if (data.playerId === this.me.id) {
                    this.me.reactionType = ''
                    this.me.reactionMode = false
                    console.log('askDodge', event)
                    this.me.askReaction('askDodge', event)
                }
                break
            case 'UseEquipmentEffectViewModel':
                // {
                //     "event": "UseEquipmentEffectViewModel",
                //     "data": {
                //         "drawCardId": "EH5044",
                //         "success": true
                //     },
                //     "message": "發動效果"
                // }
                // 不用自己要求出閃
                // if (!data.success && this.me.reactionType === 'askPlayEquipmentEffect') {
                //     // 效果發動失敗時重新要求出閃
                //     this.me.askReaction('askDodge')
                // }
                if (data.success && this.me.reactionType === 'askPlayEquipmentEffect') {
                    // 效果成功時清除反應狀態
                    this.me.reactionType = ''
                    this.me.reactionMode = false
                }
                break
            case 'BountifulHarvestEvent':
                // 五穀豐登選牌
                // {
                //     "event": "BountifulHarvestEvent",
                //     "data": {
                //         "nextChoosingPlayerId": "YangJun",
                //         "assignmentCardIds": [
                //             "SDA079",
                //             "EH5044",
                //             "SS6006",
                //             "SCA053"
                //         ]
                //     },
                //     "message": "輪到 諸葛亮 選牌"
                // }
                if (data.nextChoosingPlayerId === this.me.id) {
                    this.me.askReaction('BountifulHarvestEvent', event)
                }
                break
            case 'DrawCardEvent':
                // 由遊戲狀態中的手牌來判斷抽牌
                // if (data.drawCardPlayerId === this.me.id) {
                //     data.cards.forEach((cardId: ThreeKingdomsCardIds) => {
                //         this.me.addHandCard(cardId)
                //     })
                //     // this.me.addHandCard('EH5044')
                //     this.me.arrangeCards()
                //     return
                // }
                // this.addHandCardsToPlayer(data.drawCardPlayerId, data.size)
                break
            case 'NotifyDiscardEvent':
                if (data.discardPlayerId === this.me.id && data.discardCount > 0) {
                    this.me.askDiscardCards(data.discardCount)
                }
                break
            case 'PlayerDamagedEvent':
                // 血量直接從data更新
                // const damage = data.from - data.to
                // if (damage <= 0) return
                // const damagedPlayer =
                //     this.seats.find((player) => player.id === data.playerId) || this.me
                // damagedPlayer.hpChange(-damage)
                break
            case 'PeachEvent':
                // 血量直接從data更新
                // const healHp = data.to - data.from
                // const healedPlayer =
                //     this.seats.find((player) => player.id === data.playerId) || this.me
                // healedPlayer.hpChange(healHp)
                break
            case 'AskPeachEvent':
                if (data.playerId === this.me.id) {
                    this.me.askReaction('AskPeachEvent', event)
                }
                break
            case 'AskKillEvent':
                if (data.playerId === this.me.id) {
                    this.me.askReaction('AskKillEvent', event)
                }
                break
            case 'GameOverEvent':
                if (this.hintInstance) {
                    const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                    hintText?.setText(`遊戲結束！${data.winners.join(',')}獲得勝利！`)
                    this.hintInstance.setAlpha(1)
                }
                break
            default:
                break
        }
    }
    addHandCardsToPlayer = (playerId: string, number = 2) => {
        const player = this.seats.find((player) => player.id == playerId)
        if (player === null || player === undefined) return
        const rectangles = []
        for (let i = number - 1; i > 0; i--) {
            const rectangle = this.scene.add.rectangle(-20 * i - 40, 0, 20, 150, 0xdddddd)
            rectangle.setStrokeStyle(2, 0x000000)
            rectangles.push(rectangle)
        }
        const rectangle = this.scene.add.rectangle(0, 0, 100, 150, 0xdddddd)
        rectangle.setStrokeStyle(2, 0x000000)
        const text = this.scene.add.text(0, 0, '三國殺', {
            fontSize: '24px',
            color: '#000000',
        })
        text.setOrigin(0.5)
        const container = this.scene.add.container(0, 0, [...rectangles, rectangle, text])
        container.setPosition(400, 300)
        this.scene.tweens.add({
            targets: container,
            x: player.instance.x,
            y: player.instance.y,
            duration: 500, // 持續時間（毫秒）
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: 200, // 持續時間（毫秒）
                    ease: 'sine',
                    onComplete: () => {
                        container.destroy()
                    },
                })
            },
        })
    }
    makeTurn = (playerId: string) => {
        // this.me.endTurn()
        // this.me.startTurn()
        // const player = this.seats.find((player) => player.id == playerId) || this.me
        // player.startTurn()
        // this.seats.forEach((player) => {
        //     if (player.id !== playerId) player.endTurn()
        // })
        // if (this.me?.id == playerId) {
        //     this.me.startTurn()
        // }
        // const player = this.seats.find((player) => player.id == playerId)
        // if (player === null || player === undefined) return
        // player.startTurn()
        // this.seats.forEach((player) => {
        //     if (player.id !== playerId) {
        //         player.endTurn()
        //     }
        // })
    }
    createMe({ me, myCards }: { me: any; myCards: ThreeKingdomsCardIds[] }) {
        this.me = new MainPlayer({
            ...me,
            handleClickPlayer: this.handleClickPlayer,
            gamePlayCardHandler: this.gamePlayCardHandler,
            discardCardsAction: this.discardCards,
            x: 690,
            y: 490,
            scene: this.scene,
            seats: this.seats,
            game: this,
        })
        this.me.createInstance()
        myCards.forEach((cardId) => this.me.addHandCard(cardId))
        this.me.arrangeCards()
    }
    updatePlayerData = (players: any[]) => {
        players.forEach((player) => {
            const targetPlayer = this.seats.find((p) => p.id === player.id)
            if (targetPlayer === undefined) {
                if (player.id === this.me.id) {
                    this.me.updatePlayerData(player)
                }
                return
            }
            targetPlayer.updatePlayerData(player)
        })
    }
    updateGameData = (gameData: any) => {
        if (gameData.seats) {
            this.updatePlayerData(gameData.seats)
        }
        // if (gameData.round) {
        //     if (this.gameData.round?.currentRoundPlayer !== gameData.round?.currentRoundPlayer) {
        //         // 顯示誰的回合
        //         const player = [...this.seats, this.me].find(
        //             (player) => player.id == gameData.round.currentRoundPlayer,
        //         )
        //         if (player) player.startTurn()
        //         // 關閉其他玩家的回合
        //         // debugger
        //         const endTurnPlayer = [...this.seats, this.me].find(
        //             (player) => player.id == this.gameData.round?.currentRoundPlayer,
        //         )
        //         if (endTurnPlayer) endTurnPlayer.endTurn()
        //     }
        // }
        this.gameData = gameData
    }
    getActivePlayer = () => {
        return this.gameData.round?.activePlayer || this.gameData.round?.currentRoundPlayer
    }
    canAttack = (player: Player, targetPlayer: Player) => {
        // 計算兩者的距離
        const seats = [...this.seats, this.me]
        const index1 = seats.findIndex((p) => p.id === player.id)
        const index2 = seats.findIndex((p) => p.id === targetPlayer.id)
        let distance = Math.abs(index1 - index2)
        if (targetPlayer.equipments[3]) distance += 1
        if (player.equipments[2]) {
            distance -= 1
        }
        if (player.equipments[0]) {
            // 考慮武器攻擊距離
            const weaponCard = threeKingdomsCards[player.equipments[0]]
            const weaponFeature = weaponFeatures[weaponCard.name]
            if (weaponFeature?.attackDistance) {
                distance -= weaponFeature.attackDistance - 1
            }
        }
        return distance <= 1
    }
}
