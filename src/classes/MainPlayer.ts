import { Card, Player } from './index'
import threeKingdomsCards from '~/assets/cards.json'
import { atkLine } from '../utils/drawing'
import { roleMap } from '~/src/utils/domain'
export default class MainPlayer extends Player {
    handCards: Card[] = []
    selectedCard: Card | null = null
    seats: Player[] = []
    gamePlayCardHandler: any = () => {}
    discardMode: boolean = false
    reactionMode: boolean = false
    discardCount: number = 0
    discardCards: Card[] = []
    discardCardsAction: ([]) => void = ([]) => {}
    constructor({
        id,
        generral,
        generalId,
        roleId,
        hp,
        hand,
        equipments,
        delayScrolls,
        handleClickPlayer,
        gamePlayCardHandler,
        discardCardsAction,
        x,
        y,
        scene,
        seats,
    }: {
        id: string
        generral: string
        generalId: string
        roleId: keyof typeof roleMap
        hp: number
        hand: {
            size: number
            cards: string[]
        }
        equipments: string[]
        delayScrolls: string[]
        handleClickPlayer: any
        gamePlayCardHandler: any
        discardCardsAction: ([]) => void
        x: number
        y: number
        scene: Phaser.Scene
        seats: any
    }) {
        super({
            id,
            generral,
            generalId,
            roleId,
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
        this.gamePlayCardHandler = gamePlayCardHandler
        this.discardCardsAction = discardCardsAction
    }
    createInstance({ baseX, baseY, scene }: { baseX: number; baseY: number; scene: Phaser.Scene }) {
        // 創建一個白色的矩形
        const rectangle = scene.add.rectangle(0, 0, 200, 200, 0xffffff)
        // 創建文字
        const idText = scene.add.text(0, -80, this.id, {
            fontSize: '24px',
            color: '#000000',
        })
        const generralText = scene.add.text(0, -40, this.general.name, {
            fontSize: '20px',
            color: '#000',
        })
        const roleText = scene.add.text(0, 0, roleMap[this.roleId] || '?', {
            fontSize: '20px',
            color: '#000',
        })
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
        // 棄牌按鈕
        const checkbtn = scene.add.rectangle(0, 80, 100, 40, 0x00ff00)
        checkbtn.setInteractive()
        const checkText = scene.add.text(0, 80, '棄牌', {
            fontSize: '20px',
            color: '#000',
        })
        checkText.setOrigin(0.5)
        const checkContainer = scene.add.container(0, 0, [checkbtn, checkText])
        checkContainer.setPosition(baseX, baseY - 220)
        checkContainer.setAlpha(0)
        this.checkBtnInstance = checkContainer
        checkbtn.on('pointerdown', () => {
            if (this.discardMode) {
                this.discardMode = false
                this.discardCardsAction(this.discardCards.map((card) => card.id))
                this.handCards.forEach((card) => {
                    if (card.selected) {
                        card.discardCard()
                    }
                })
                this.arrangeCards()
                this.discardCards = []
                this.discardCount = 0
                if (this.checkBtnInstance) this.checkBtnInstance.setAlpha(0)
            }
        })
        // 不出牌按鈕
        // 橘色按鈕
        const skipbtn = scene.add.rectangle(0, 80, 100, 40, 0xffbf00)
        skipbtn.setInteractive()
        const skipText = scene.add.text(0, 80, '取消', {
            fontSize: '20px',
            color: '#000',
        })
        skipText.setOrigin(0.5)
        const skipContainer = scene.add.container(0, 0, [skipbtn, skipText])
        skipContainer.setPosition(baseX, baseY - 220)
        skipContainer.setAlpha(0)
        this.skipInstance = skipContainer
        skipbtn.on('pointerdown', () => {
            const params = {
                cardId: '',
                playerId: this.id,
                targetPlayerId: '',
                playType: 'skip',
            }
            this.gamePlayCardHandler({}, params)
            if (this.skipInstance) this.skipInstance.setAlpha(0)
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
        if (this.selectedCard || this.discardMode) return
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
        if (this.discardMode) {
            if (card.selected) {
                card.selected = false
                // card.instance.y = 515
                this.scene.tweens.add({
                    targets: card.instance,
                    x: card.instance.x,
                    y: card.instance.y + 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
                this.discardCards = this.discardCards.filter((discardCard) => discardCard !== card)
            } else {
                if (this.discardCards.length >= this.discardCount) return
                card.selected = true
                this.scene.tweens.add({
                    targets: card.instance,
                    x: card.instance.x,
                    y: card.instance.y - 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
                this.discardCards.push(card)
            }
            return
        }
        if (card.id === 'BS8008' || card.id === 'SHQ051') {
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
        this.gamePlayCardHandler(card)
        this.selectedCard = null
        if (this.reactionMode) {
            this.reactionMode = false
            this.skipInstance?.setAlpha(0)
        }
        // if (card.list[1].text === '殺') {
        //     this.seats[0].hpChange(-1)
        //     card.destroy()
        // }
    }
    askDiscardCards = (discardCount: number) => {
        this.discardMode = true
        this.discardCount = discardCount
        if (this.checkBtnInstance) {
            this.checkBtnInstance.setAlpha(1)
        }
        // this.handCards = this.handCards.filter((handCard) => handCard !== card)
        // card.destroy()
        // this.arrangeCards()
    }
    askReaction = (card: Card) => {
        this.reactionMode = true
        this.skipInstance?.setAlpha(1)
    }
}
