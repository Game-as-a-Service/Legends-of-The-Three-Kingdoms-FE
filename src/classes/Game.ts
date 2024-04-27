import { Player, MainPlayer, Card } from './index'
import { atkLine } from '../utils/drawing'
import type { ThreeKingdomsCardIds, GameData, PlayType } from '~/src/types'
// import api from '~/src/utils/api'
const locations = [
    { x: 640, y: 160 },
    { x: 400, y: 120 },
    { x: 160, y: 160 },
]
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
    scene!: Phaser.Scene
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
    constructor(gameData: any, scene: Phaser.Scene, api: any) {
        this.scene = scene
        this.api = api
        this.seats = gameData.seats.map(
            (player: any, index: number) =>
                new Player({
                    ...player,
                    x: locations[index].x,
                    y: locations[index].y,
                    scene,
                    handleClickPlayer: this.handleClickPlayer,
                }),
        )
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
    }
    gamePlayCardHandler = (card: Card, reactionType: string) => {
        if (reactionType === 'askDodge') {
            const params = {
                cardId: '',
                playerId: this.me.id,
                targetPlayerId: '',
                playType: 'skip',
            }
            this.api.playCard(this.gameId, params)
            return
        }
        if (reactionType === 'askPeach') {
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
        if (this.me.selectedCard.name === '殺' || this.me.selectedCard.name === '過河拆橋') {
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
            this.me.selectedCard = null
            card.playCard()
            console.log(player, this.me)
            this.seats.forEach((player) => player.setOutofDistance(false))
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
    async eventHandler(event: any) {
        // console.log(event)
        const data = event.data
        switch (event.event) {
            case 'PlayCardEvent':
                if (data.playType === 'skip') {
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
                    if (data.cardId === 'BS8008') {
                        this.me.askReaction('askDodge')
                    }
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
            case 'DrawCardEvent':
                if (data.drawCardPlayerId === this.me.id) {
                    data.cards.forEach((cardId: ThreeKingdomsCardIds) => {
                        this.me.addHandCard(cardId)
                    })
                    // this.me.addHandCard('EH5044')
                    this.me.arrangeCards()
                    return
                }
                this.addHandCardsToPlayer(data.drawCardPlayerId, data.size)
                break
            case 'NotifyDiscardEvent':
                if (data.discardPlayerId === this.me.id && data.discardCount > 0) {
                    this.me.askDiscardCards(data.discardCount)
                }
                break
            case 'PlayerDamagedEvent':
                const damage = data.from - data.to
                if (damage <= 0) return
                const damagedPlayer =
                    this.seats.find((player) => player.id === data.playerId) || this.me
                damagedPlayer.hpChange(-damage)
                break
            case 'PeachEvent':
                const healHp = data.to - data.from
                const healedPlayer =
                    this.seats.find((player) => player.id === data.playerId) || this.me
                healedPlayer.hpChange(healHp)
                break
            case 'AskPeachEvent':
                if (data.playerId === this.me.id) {
                    this.me.askReaction('askPeach')
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
    createMe = ({ me, myCards }: { me: any; myCards: ThreeKingdomsCardIds[] }) => {
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
}
