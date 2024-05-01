import generalCards from '~/assets/generalCards.json'
import threeKingdomsCards from '~/assets/cards.json'
import { roleMap } from '~/src/utils/domain'
import type { ThreeKingdomsCardIds, ThreeKingdomsGeneralIds } from '~/src/types'
export default class Player {
    id: string
    generral: string
    generalId: ThreeKingdomsGeneralIds
    general: any
    roleId: keyof typeof roleMap
    hp: number
    hand: {
        size: number
        cards: string[]
    }
    equipments: ThreeKingdomsCardIds[]
    delayScrolls: string[]
    instance!: Phaser.GameObjects.Container
    scene!: Phaser.Scene
    handleClickPlayer!: (player: Player) => void
    x: number = 0
    y: number = 0
    checkBtnInstance?: Phaser.GameObjects.Container
    skipInstance?: Phaser.GameObjects.Container
    hintInstance!: Phaser.GameObjects.Container
    isOutofDistance: boolean = false
    // properties and methods go here
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
        x,
        y,
        scene,
    }: {
        id: string
        generral: string
        generalId: ThreeKingdomsGeneralIds
        roleId: keyof typeof roleMap
        hp: number
        hand: {
            size: number
            cards: string[]
        }
        equipments: ThreeKingdomsCardIds[]
        delayScrolls: string[]
        handleClickPlayer: any
        x: number
        y: number
        scene: Phaser.Scene
    }) {
        this.id = id
        this.generral = generral
        this.generalId = generalId
        this.general = generalCards[generalId]
        this.roleId = roleId
        this.hp = hp
        this.hand = hand
        this.equipments = equipments
        this.delayScrolls = delayScrolls
        this.handleClickPlayer = handleClickPlayer
        this.x = x
        this.y = y
        this.scene = scene
        this.createInstance({ baseX: x, baseY: y, scene })
    }
    createInstance({ baseX, baseY, scene }: { baseX: number; baseY: number; scene: Phaser.Scene }) {
        // 創建一個白色的矩形
        const rectangle = scene.add.rectangle(0, 0, 200, 200, 0xffffff)
        // 創建文字
        const idText = scene.add.text(0, -80, this.id, {
            fontSize: '24px',
            color: '#000000',
        })
        const generralText = scene.add.text(0, -50, this.general.name, {
            fontSize: '20px',
            color: '#000',
        })
        const roleText = scene.add.text(0, -20, roleMap[this.roleId] || '?', {
            fontSize: '20px',
            color: '#000',
        })
        const hpText = scene.add.text(0, 10, `血量: ${this.hp}`, {
            fontSize: '20px',
            color: '#000',
        })
        const handText = scene.add.text(0, 40, `手牌: ${this.hand.size}`, {
            fontSize: '20px',
            color: '#000',
        })
        // const equipmentNames = this.equipments
        //     .filter((equipmentId) => equipmentId)
        //     .map((equipmentId) => {
        //         const equipment = threeKingdomsCards[equipmentId]
        //         return equipment.name
        //     })
        //     .join(', ')
        const weapon = this.equipments[0] ? threeKingdomsCards[this.equipments[0]].name : ''
        const armor = this.equipments[1] ? threeKingdomsCards[this.equipments[1]].name : ''
        const horsePlus = this.equipments[2] ? threeKingdomsCards[this.equipments[2]].name : ''
        const horseMinus = this.equipments[3] ? threeKingdomsCards[this.equipments[3]].name : ''

        const weaponText = scene.add.text(0, 60, `${weapon}`, {
            fontSize: '10px',
            color: '#000',
        })
        const armorText = scene.add.text(0, 70, `${armor}`, {
            fontSize: '10px',
            color: '#000',
        })
        const horsePlusText = scene.add.text(0, 80, `${horsePlus}`, {
            fontSize: '10px',
            color: '#000',
        })
        const horseMinusText = scene.add.text(0, 90, `${horseMinus}`, {
            fontSize: '10px',
            color: '#000',
        })
        // const equipmentText = scene.add.text(0, 70, `裝備: ${equipmentNames}`, {
        //     fontSize: '20px',
        //     color: '#000',
        // })
        // 設置文字位置在矩形中心
        const texts = [
            idText,
            generralText,
            roleText,
            hpText,
            handText,
            weaponText,
            armorText,
            horsePlusText,
            horseMinusText,
        ]
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
            handText,
            weaponText,
            armorText,
            horsePlusText,
            horseMinusText,
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
    hpChange(hp: number) {
        this.hp += hp
        if (this.instance === null) return
        if (this.scene === null) return
        // this.instance.getAt(4).setText(`血量: ${this.hp}`)
        const hpText: Phaser.GameObjects.Text = this.instance.getAt(4)
        hpText.setText(`血量: ${this.hp}`)
        if (hp <= 0) {
            this.scene.tweens.add({
                targets: this.instance,
                alpha: 0, // 将透明度从 1（不透明）变为 0（透明）
                duration: 100, // 动画持续时间 1000 毫秒（1 秒）
                yoyo: true, // 设置 yoyo 为 true，使动画来回循环
                repeat: 1, // 设置 repeat 为 1，使动画重复 1 次
            })
        } else {
            this.scene.tweens.add({
                targets: hpText,
                scale: 1.5,
                duration: 150, // 持續時間（毫秒）
                ease: 'Power2',
                yoyo: true,
                repeat: 1,
            })
        }
    }
    startTurn() {
        if (this.instance === null) return
        if (this.scene === null) return
        const rectangle: Phaser.GameObjects.Rectangle = this.instance.getAt(0)
        const fx = rectangle.postFX.addGlow(0x00ff00, 20, 0.5)
        // rectangle.postFX.remove(fx)
        this.scene.tweens.add({
            targets: fx,
            outerStrength: 4,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1,
        })
    }
    endTurn() {
        if (this.instance === null) return
        if (this.scene === null) return
        const rectangle: Phaser.GameObjects.Rectangle = this.instance.getAt(0)
        rectangle.postFX.clear()
    }
    updatePlayerData(data: any) {
        // 手牌數確認
        if (data.hand.size !== this.hand.size) {
            this.hand.size = data.hand.size
            const handText: Phaser.GameObjects.Text = this.instance.getAt(5)
            handText.setText(`手牌: ${this.hand.size}`)
            this.scene.tweens.add({
                targets: handText,
                scale: 1.5,
                duration: 150, // 持續時間（毫秒）
                ease: 'Power2',
                yoyo: true,
                repeat: 1,
            })
        }
        // 裝備數確認
        if (data.equipments.join() !== this.equipments.join()) {
            if (data.equipments[0] !== this.equipments[0]) {
                this.equipments[0] = data.equipments[0]
                const weaponText: Phaser.GameObjects.Text = this.instance.getAt(6)
                weaponText.setText(`${threeKingdomsCards[this.equipments[0]].name}`)
                this.scene.tweens.add({
                    targets: weaponText,
                    scale: 1.5,
                    duration: 150, // 持續時間（毫秒）
                    ease: 'Power2',
                    yoyo: true,
                    repeat: 1,
                })
            }
            if (data.equipments[1] !== this.equipments[1]) {
                this.equipments[1] = data.equipments[1]
                const armorText: Phaser.GameObjects.Text = this.instance.getAt(7)
                armorText.setText(`${threeKingdomsCards[this.equipments[1]].name}`)
                this.scene.tweens.add({
                    targets: armorText,
                    scale: 1.5,
                    duration: 150, // 持續時間（毫秒）
                    ease: 'Power2',
                    yoyo: true,
                    repeat: 1,
                })
            }
            if (data.equipments[2] !== this.equipments[2]) {
                this.equipments[2] = data.equipments[2]
                const horsePlusText: Phaser.GameObjects.Text = this.instance.getAt(8)
                horsePlusText.setText(`${threeKingdomsCards[this.equipments[2]].name}`)
                this.scene.tweens.add({
                    targets: horsePlusText,
                    scale: 1.5,
                    duration: 150, // 持續時間（毫秒）
                    ease: 'Power2',
                    yoyo: true,
                    repeat: 1,
                })
            }
            if (data.equipments[3] !== this.equipments[3]) {
                this.equipments[3] = data.equipments[3]
                const horseMinusText: Phaser.GameObjects.Text = this.instance.getAt(9)
                horseMinusText.setText(`${threeKingdomsCards[this.equipments[3]].name}`)
                this.scene.tweens.add({
                    targets: horseMinusText,
                    scale: 1.5,
                    duration: 150, // 持續時間（毫秒）
                    ease: 'Power2',
                    yoyo: true,
                    repeat: 1,
                })
            }
            this.equipments = data.equipments
            // const equipmentNames = this.equipments
            //     .filter((equipmentId) => equipmentId)
            //     .map((equipmentId) => {
            //         const equipment = threeKingdomsCards[equipmentId]
            //         return equipment.name
            //     })
            //     .join(', ')
            // const equipmentText: Phaser.GameObjects.Text = this.instance.getAt(6)
            // equipmentText.setText(`裝備: ${equipmentNames}`)
            // this.scene.tweens.add({
            //     targets: equipmentText,
            //     scale: 1.5,
            //     duration: 150, // 持續時間（毫秒）
            //     ease: 'Power2',
            //     yoyo: true,
            //     repeat: 1,
            // })
        }
    }
    setOutOfDistance(isOutofDistance: boolean) {
        this.isOutofDistance = isOutofDistance
        if (isOutofDistance) {
            this.instance.setAlpha(0.5)
        } else {
            this.instance.setAlpha(1)
        }
    }
}
