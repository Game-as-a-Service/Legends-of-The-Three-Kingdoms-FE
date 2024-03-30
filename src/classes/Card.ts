import threeKingdomsCards from '~/assets/cards.json'
export default class Card {
    id: keyof typeof threeKingdomsCards
    name: string = ''
    instance!: Phaser.GameObjects.Container
    scene!: Phaser.Scene
    audio: Phaser.Sound.BaseSound | null = null
    x: number = 0
    y: number = 0
    played: boolean = false
    selected: boolean = false
    arrangeCards = () => {}
    // properties and methods go here
    constructor({
        cardId,
        x,
        y,
        scene,
        playCardHandler = () => {},
    }: {
        cardId: keyof typeof threeKingdomsCards
        x: number
        y: number
        scene: Phaser.Scene
        playCardHandler?: any
    }) {
        this.id = cardId
        this.x = x
        this.y = y
        this.scene = scene
        this.playCardHandler = playCardHandler
        this.createInstance({ baseX: x, baseY: y, scene })
    }
    playCardHandler = (card: Card) => {}
    private createInstance({
        baseX,
        baseY,
        scene,
    }: {
        baseX: number
        baseY: number
        scene: Phaser.Scene
    }) {
        // 創建一個白色的矩形
        const card = threeKingdomsCards[this.id]
        this.name = card.name
        if (card.audio) this.audio = scene.sound.add(card.audio)
        const rectangle = scene.add.rectangle(0, 0, 100, 150, 0xffffff)
        rectangle.setStrokeStyle(2, 0x000000)
        // 創建文字
        const text = scene.add.text(0, 0, card.name, {
            fontSize: '24px',
            color: '#000000',
        })
        // 設置文字位置在矩形中心
        text.setOrigin(0.5)

        // 將矩形和文字添加到容器中，以便一起操作
        const container = scene.add.container(0, 0, [rectangle, text])

        // 設置容器位置在遊戲場景中心
        container.setPosition(baseX, baseY)

        rectangle.setInteractive()
        rectangle.on('pointerdown', () => {
            this.playCardHandler(this)
            return
        })
        rectangle.on('pointerover', () => {
            if (this.instance === null || this.scene === null) return
            container.setDepth(100)
        })
        rectangle.on('pointerout', () => {
            if (this.instance === null || this.scene === null) return
            // container.setDepth(0)
            this.arrangeCards()
        })
        this.instance = container
        this.scene = scene
        return container
    }
    updateLocation({ x, y }: { x: number; y: number }) {
        if (this.instance === null || this.scene === null) return
        this.scene.tweens.add({
            targets: this.instance,
            x: x,
            y: y,
            duration: 500, // 持續時間（毫秒）
            ease: 'Power2',
        })
    }
    playCard({ x = 400, y = 300 }: { x?: number; y?: number } = { x: 400, y: 300 }) {
        const instance = this.instance
        if (this.audio) this.audio.play()
        if (instance === null || this.scene === null) return
        this.scene.tweens.add({
            targets: instance,
            x: x,
            y: y,
            // yoyo: true,
            duration: 1000, // 持續時間（毫秒）
            ease: 'Power2',
            onComplete: () => {
                if (this.scene === null) return
                this.scene.tweens.add({
                    targets: instance,
                    alpha: 0,
                    duration: 1000, // 持續時間（毫秒）
                    ease: 'Power2',
                    onComplete: () => {
                        instance.destroy()
                    },
                })
            },
        })
        this.played = true
        this.arrangeCards()
    }
    discardCard({ x = 400, y = 300 }: { x?: number; y?: number } = { x: 400, y: 300 }) {
        const instance = this.instance
        if (instance === null || this.scene === null) return
        this.scene.tweens.add({
            targets: instance,
            x: x,
            y: y,
            // yoyo: true,
            duration: 1000, // 持續時間（毫秒）
            ease: 'Power2',
            onComplete: () => {
                if (this.scene === null) return
                this.scene.tweens.add({
                    targets: instance,
                    alpha: 0,
                    duration: 1000, // 持續時間（毫秒）
                    ease: 'Power2',
                    onComplete: () => {
                        instance.destroy()
                    },
                })
            },
        })
        this.played = true
        this.arrangeCards()
    }
}
