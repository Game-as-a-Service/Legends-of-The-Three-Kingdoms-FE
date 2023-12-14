import { Player, MainPlayer, Card } from './index'
import { atkLine } from '../utils/drawing'
import threeKingdomsCards from '~/assets/cards.json'
const locations = [
    { x: 160, y: 160 },
    { x: 400, y: 120 },
    { x: 640, y: 160 },
]
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
    constructor(gameData: any, scene: Phaser.Scene) {
        this.scene = scene
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
            myCards: Object.keys(threeKingdomsCards) as (keyof typeof threeKingdomsCards)[],
        })
    }
    handleClickPlayer = (player: Player) => {
        console.log('click')
        if (!this.me.selectedCard) return
        if (this.me.selectedCard.name === '殺' || this.me.selectedCard.name === '過河拆橋') {
            atkLine({
                endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                scene: this.scene,
            })
            const card = this.me.selectedCard
            this.me.selectedCard = null
            card.playCard()
        }
    }
    addHandCardsToPlayer = (playerName: string, number = 2) => {
        const player = this.seats.find((player) => player.generral == playerName)
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
    makeTurn = (generralName: string) => {
        if (this.me?.generral == generralName) {
            this.me.startTurn()
        }
        const player = this.seats.find((player) => player.generral == generralName)
        if (player === null || player === undefined) return
        player.startTurn()
        this.seats.forEach((player) => {
            if (player.generral !== generralName) {
                player.endTurn()
            }
        })
    }
    createMe = ({ me, myCards }: { me: any; myCards: (keyof typeof threeKingdomsCards)[] }) => {
        this.me = new MainPlayer({
            ...me,
            handleClickPlayer: this.handleClickPlayer,
            x: 690,
            y: 490,
            scene: this.scene,
            seats: this.seats,
        })
        myCards.forEach((cardId) => this.me.addHandCard(cardId))
        this.me.arrangeCards()
    }
}
