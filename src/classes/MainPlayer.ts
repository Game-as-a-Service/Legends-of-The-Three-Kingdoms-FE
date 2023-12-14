import { Card, Player } from './index'
import threeKingdomsCards from '~/assets/cards.json'
import { atkLine } from '../utils/drawing'
export default class MainPlayer extends Player {
    handCards: Card[] = []
    selectedCard: Card | null = null
    seats: Player[] = []
    // playCardHandler: any = () => {}
    constructor({
        id,
        generral,
        role,
        hp,
        hand,
        equipments,
        delayScrolls,
        handleClickPlayer,
        x,
        y,
        scene,
        seats,
    }: {
        id: string
        generral: string
        role: string
        hp: number
        hand: {
            size: number
            cards: string[]
        }
        equipments: string[]
        delayScrolls: string[]
        handleClickPlayer: any
        x: number
        y: number
        scene: Phaser.Scene
        seats: any
    }) {
        super({
            id,
            generral,
            role,
            hp,
            hand,
            equipments,
            delayScrolls,
            handleClickPlayer,
            x,
            y,
            scene,
        })
        this.seats = seats
        // this.playCardHandler = playCardHandler
    }
    createInstance({ baseX, baseY, scene }: { baseX: number; baseY: number; scene: Phaser.Scene }) {
        // 創建一個白色的矩形
        const rectangle = scene.add.rectangle(0, 0, 200, 200, 0xffffff)
        // 創建文字
        const idText = scene.add.text(0, -80, this.id, {
            fontSize: '24px',
            color: '#000000',
        })
        const generralText = scene.add.text(0, -40, this.generral, {
            fontSize: '20px',
            color: '#000',
        })
        const roleText = scene.add.text(0, 0, this.role, { fontSize: '20px', color: '#000' })
        const hpText = scene.add.text(0, 40, `血量: ${this.hp}`, {
            fontSize: '20px',
            color: '#000',
        })
        // 設置文字位置在矩形中心
        const texts = [idText, generralText, roleText, hpText]
        texts.forEach((text) => {
            text.setOrigin(0.5)
        })
        // 將矩形和文字添加到容器中，以便一起操作
        const container = scene.add.container(0, 0, [
            rectangle,
            idText,
            roleText,
            generralText,
            hpText,
        ])

        // 設置容器位置在遊戲場景中心
        container.setPosition(baseX, baseY)
        this.instance = container
        this.scene = scene
        // return container
        rectangle.setInteractive()
        rectangle.on('pointerdown', () => {
            this.handleClickPlayer(this)
        })
    }
    addHandCard = (cardId: keyof typeof threeKingdomsCards) => {
        const card = new Card({
            cardId,
            x: 1000,
            y: 515,
            scene: this.scene,
            playCardHandler: this.playCardHandler,
        })
        this.handCards.push(card)
        // card.createInstance({ baseX: 1000, baseY: 515, scene: this.scene })
        card.arrangeCards = this.arrangeCards
    }
    arrangeCards = () => {
        if (this.selectedCard) return
        this.handCards = this.handCards.filter((card) => card.played === false)
        if (this.handCards.length < 6) {
            this.handCards.forEach((card, index) => {
                const x = 60 + index * 101
                card.updateLocation({ x, y: 515 })
            })
        } else {
            const totalWidth = 800 - 330
            const cardCount = this.handCards.length
            const cardWidth = totalWidth / (cardCount - 1)
            this.handCards.forEach((card, index) => {
                const x = 60 + index * cardWidth
                card.updateLocation({ x, y: 515 })
                card.instance.setDepth(index)
            })
        }
    }
    playCardHandler = (card: Card) => {
        if (card.id === 'BHO036' || card.id === 'SHQ051') {
            if (this.selectedCard == card) {
                this.scene.tweens.add({
                    targets: card.instance,
                    x: card.instance.x,
                    y: card.instance.y + 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                    onComplete: () => {
                        this.selectedCard = null
                    },
                })
                return
            }
            if (this.selectedCard !== null && this.selectedCard !== card) {
                this.scene.tweens.add({
                    targets: this.selectedCard.instance,
                    x: this.selectedCard.instance.x,
                    y: this.selectedCard.instance.y + 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
            }
            this.selectedCard = card
            let x = card.instance.x
            let y = card.instance.y
            this.scene.tweens.add({
                targets: card.instance,
                x: x,
                y: y - 20,
                // yoyo: true,
                duration: 500, // 持續時間（毫秒）
                ease: 'Power2',
            })
            return
        }
        if (card.name === '南蠻入侵' || card.name === '萬箭齊發') {
            this.seats.forEach((player) => {
                atkLine({
                    endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                    scene: this.scene,
                })
            })
            // atkLine({ endPoint: new Phaser.Math.Vector2(400, 120) })
            // this.seats[0].hpChange(-1)
            // card.destroy()
            // this.selectedCard = null
        }
        card.playCard()
        this.selectedCard = null
        // if (card.list[1].text === '殺') {
        //     this.seats[0].hpChange(-1)
        //     card.destroy()
        // }
    }
}
