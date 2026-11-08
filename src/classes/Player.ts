import generalCards from '~/assets/generalCards.json'
import threeKingdomsCards from '~/assets/cards.json'
import { roleMap, suits } from '~/src/utils/domain'
import type { ThreeKingdomsCardIds, ThreeKingdomsGeneralIds, WeaponFeature } from '~/src/types'
import { BattleScene } from './index'
import Game from './Game'
import weaponFeaturesJson from '~/assets/weaponFeatures.json'
const weaponFeatures: { [key: string]: WeaponFeature } = weaponFeaturesJson
export default class Player {
    id: string
    generral: string
    generalId: ThreeKingdomsGeneralIds
    general: any
    roleId: keyof typeof roleMap
    hp: number
    hand: {
        size: number
        cardIds: string[]
    }
    equipments: ThreeKingdomsCardIds[]
    delayScrolls: ThreeKingdomsCardIds[]
    instance!: Phaser.GameObjects.Container
    scene!: BattleScene
    handleClickPlayer!: (player: Player) => void
    x: number = 0
    y: number = 0
    checkBtnInstance?: Phaser.GameObjects.Container
    skipInstance?: Phaser.GameObjects.Container
    hintInstance!: Phaser.GameObjects.Container
    isOutofDistance: boolean = false
    instanceMap: { [key: string]: Phaser.GameObjects.Container } = {}
    handText!: Phaser.GameObjects.Text
    game: Game | null = null
    readonly cardLeftX: number = -96
    readonly contentLeftX: number = -66
    readonly equipmentX: number = -90
    readonly equipmentKeys = ['weapon', 'armor', 'horsePlus', 'horseMinus']
    readonly campColors: { [key: string]: number } = {
        魏: 0x2563eb,
        蜀: 0xc0392b,
        吳: 0x2e8b57,
        群: 0x6b7280,
    }
    private glowFx: Phaser.FX.Glow | null = null
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
        game,
    }: {
        id: string
        generral: string
        generalId: ThreeKingdomsGeneralIds
        roleId: keyof typeof roleMap
        hp: number
        hand: {
            size: number
            cardIds: string[]
        }
        equipments: ThreeKingdomsCardIds[]
        delayScrolls: ThreeKingdomsCardIds[]
        handleClickPlayer: any
        x: number
        y: number
        scene: BattleScene
        game: Game
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
        this.game = game
    }
    createInstance() {
        const baseX = this.x
        const baseY = this.y
        const scene = this.scene
        // 卡片版面（以卡片中心為原點，200x200）：
        // 左側欄 x -100~-72：延遲錦囊（上）、血量（下）
        // 標題列 y -82：ID、身分；武將列 y -44：陣營、武將名；資訊列 y -14：手牌數、技能鈕；下方 y 4~100：裝備
        const rectangle = scene.add.rectangle(0, 0, 200, 200, 0xffffff)
        const idText = scene.add.text(this.contentLeftX, -82, this.id, {
            fontSize: '18px',
            color: '#000000',
        })
        idText.setOrigin(0, 0.5)
        if (idText.width > 96) idText.setScale(96 / idText.width)
        const roleBadge = scene.add.rectangle(64, -82, 56, 24, 0x1f2937)
        const roleText = scene.add.text(64, -82, roleMap[this.roleId] || '?', {
            fontSize: '16px',
            color: '#fff',
        })
        roleText.setOrigin(0.5)
        const campBadge = scene.add.rectangle(
            this.contentLeftX + 14,
            -44,
            28,
            28,
            this.campColors[this.general.camp] ?? 0x6b7280,
        )
        const campText = scene.add.text(this.contentLeftX + 14, -44, this.general.camp, {
            fontSize: '20px',
            color: '#fff',
        })
        campText.setOrigin(0.5)
        const generralText = scene.add.text(this.contentLeftX + 36, -44, this.general.name, {
            fontSize: '30px',
            color: '#000',
        })
        generralText.setOrigin(0, 0.5)
        const hpContainer = this.initHpInstance(this.hp, this.general.hp)
        this.instanceMap.hp = hpContainer

        const delayScrollsContainer = this.initDelayScrollsInstance()
        this.instanceMap.delayScrolls = delayScrollsContainer
        const handText = scene.add.text(this.contentLeftX, -14, `手牌: ${this.hand.size}`, {
            fontSize: '18px',
            color: '#000',
        })
        handText.setOrigin(0, 0.5)
        this.handText = handText
        // 將矩形和文字添加到容器中，以便一起操作
        const container = scene.add.container(0, 0, [
            rectangle,
            idText,
            roleBadge,
            roleText,
            campBadge,
            campText,
            generralText,
            handText,
            hpContainer,
            delayScrollsContainer,
        ])
        for (let i = 0; i < 4; i++) {
            const equipmentId = this.equipments[i]
            if (!equipmentId) continue
            const equipmentContainer = this.initEquipmentInstance(threeKingdomsCards[equipmentId])
            equipmentContainer.setPosition(this.equipmentX, 100 - 24 * (4 - i))
            container.add(equipmentContainer)
            this.instanceMap[this.equipmentKeys[i]] = equipmentContainer
        }
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
        // const hpText: Phaser.GameObjects.Text = this.instance.getAt(4)
        // hpText.setText(`血量: ${this.hp}`)
        // if (hp <= 0) {
        //     this.scene.tweens.add({
        //         targets: this.instance,
        //         alpha: 0, // 将透明度从 1（不透明）变为 0（透明）
        //         duration: 100, // 动画持续时间 1000 毫秒（1 秒）
        //         yoyo: true, // 设置 yoyo 为 true，使动画来回循环
        //         repeat: 1, // 设置 repeat 为 1，使动画重复 1 次
        //     })
        // } else {
        //     this.scene.tweens.add({
        //         targets: hpText,
        //         scale: 1.5,
        //         duration: 150, // 持續時間（毫秒）
        //         ease: 'Power2',
        //         yoyo: true,
        //         repeat: 1,
        //     })
        // }
        if (this.instanceMap.hp) {
            this.instanceMap.hp.destroy()
        }
        const hpContainer = this.initHpInstance(this.hp, this.general.hp)
        this.instanceMap.hp = hpContainer
        this.instance.add(hpContainer)
        // hpContainer.setPosition(-100, 100 - 24 * 4)
    }
    startTurn() {
        if (this.instance === null) return
        if (this.scene === null) return
        this.endTurn()
        const rectangle: Phaser.GameObjects.Rectangle = this.instance.getAt(0)
        const fx = rectangle.postFX.addGlow(0x00ff00, 20, 0.5)
        this.glowFx = fx
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
        if (this.glowFx) {
            this.scene.tweens.killTweensOf(this.glowFx)
            this.glowFx = null
        }
        const rectangle: Phaser.GameObjects.Rectangle = this.instance.getAt(0)
        rectangle.postFX.clear()
    }
    updatePlayerData(data: any) {
        // 手牌數確認
        if (data.hand.size !== this.hand.size) {
            this.hand.size = data.hand.size
            this.handText.setText(`手牌: ${this.hand.size}`)
            this.scene.tweens.add({
                targets: this.handText,
                scale: 1.25,
                duration: 150, // 持續時間（毫秒）
                ease: 'Power2',
                yoyo: true,
                repeat: 1,
            })
        }
        // 裝備數確認
        if (data.equipments.join() !== this.equipments.join()) {
            for (let i = 0; i < 4; i++) {
                if (data.equipments[i] !== this.equipments[i]) {
                    this.equipments[i] = data.equipments[i]
                    this.updateEquipments(i)
                }
            }
            this.equipments = data.equipments
        }
        // 延遲錦囊卡確認
        if (data.delayScrolls.join() !== this.delayScrolls.join()) {
            this.delayScrolls = data.delayScrolls
            this.instanceMap.delayScrolls.destroy()
            const delayScrollsContainer = this.initDelayScrollsInstance()
            this.instanceMap.delayScrolls = delayScrollsContainer
            this.instance.add(delayScrollsContainer)
        }
        // 血量確認
        if (data.hp !== this.hp) {
            this.hpChange(data.hp - this.hp)
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
    setPlayerSelected(isSelected: boolean, type?: 'from' | 'to') {
        const rectangle: Phaser.GameObjects.Rectangle = this.instance.getAt(0)
        if (isSelected) {
            const color = type === 'from' ? 0x00ff00 : 0xff0000
            rectangle.setStrokeStyle(4, color)
        } else {
            rectangle.setStrokeStyle()
        }
    }
    updateEquipments(index: number) {
        const equipments = ['weapon', 'armor', 'horsePlus', 'horseMinus']
        const equipment = this.equipments[index]
        if (equipment) {
            if (this.instanceMap[equipments[index]]) {
                this.instanceMap[equipments[index]].destroy()
            }
            const equipmentContainer = this.initEquipmentInstance(threeKingdomsCards[equipment])
            this.instanceMap[equipments[index]] = equipmentContainer
            this.instance.add(equipmentContainer)
            equipmentContainer.setPosition(this.equipmentX, 100 - 24 * (4 - index))
            this.scene.tweens.add({
                targets: equipmentContainer,
                scale: 1.5,
                x: equipmentContainer.x - 50,
                y: equipmentContainer.y - 6,
                duration: 150, // 持續時間（毫秒）
                ease: 'Power2',
                yoyo: true,
                repeat: 1,
            })
        } else {
            if (this.instanceMap[equipments[index]]) {
                this.instanceMap[equipments[index]].destroy()
            }
        }
    }
    initEquipmentInstance(weapon: any) {
        const equipmentContainer1 = this.scene.add.container(0, 0)
        const weaponRankText = this.scene.add.text(24, 4, `${weapon.rank}`, {
            fontSize: '16px',
            color: suits[weapon.suit].color,
        })
        const weaponSuitText = this.scene.add.text(24 + 20, 4, `${suits[weapon.suit].symbol}`, {
            fontSize: '16px',
            color: suits[weapon.suit].color,
        })
        const weaponText = this.scene.add.text(100 - 32, 6, `${weapon.name}`, {
            fontSize: '14px',
            color: '#000',
        })
        const border = this.scene.add.graphics()
        border.lineStyle(1, 0x000000, 1)
        border.strokeRect(20, 0, 160, 24)
        const actionBorder = this.scene.add.graphics()
        if (weapon.name === '丈八蛇矛') {
            actionBorder.lineStyle(2, 0xd4a017, 1)
            actionBorder.strokeRoundedRect(18, -2, 164, 28, 6)
        }
        equipmentContainer1.add([weaponRankText, weaponSuitText, weaponText, border, actionBorder])
        return equipmentContainer1
    }
    initHpInstance(nowHp: number = 5, maxHp: number = 5) {
        var healthContainer = this.scene.add.container(0, 0)

        // 血量文字的間距
        var spacing = 10

        // 血量的最大值
        var maxHealth = maxHp + (this.roleId === 'Monarch' ? 1 : 0)

        // 血量的當前值（假設為3）
        var currentHealth = nowHp

        // 文字的寬度和高度
        var textWidth = 50
        var textHeight = 12

        // 文字樣式
        var textStyle = {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
        }

        // 從下往上添加血量文字
        for (var i = maxHealth - 1; i >= 0; i--) {
            var xPos = 0 // 文字的 x 位置
            var yPos = (maxHealth - i - 1) * (textHeight + spacing) // 文字的 y 位置

            // 創建一個血量文字
            var healthText = this.scene.add.text(xPos, yPos, '♥', textStyle)

            // 將文字添加到容器中
            healthContainer.add(healthText)

            // 根據血量值設置文字顏色
            if (i >= currentHealth) {
                healthText.setColor('#cccccc') // 灰色
            } else if (i === 0) {
                healthText.setColor('#ff0000') // 紅色
            } else if (i === 1) {
                healthText.setColor('#FFA500') // 橙色
            } else {
                healthText.setColor('#00CC00') // 綠色
            }

            // 設置文字的原點為左上角
            healthText.setOrigin(0, 0)
        }

        // 將容器垂直居中
        // healthContainer.setY(0 - (maxHealth * (textHeight + spacing)) / 2)
        healthContainer.setY(100 - maxHealth * (textHeight + spacing) - 4)
        healthContainer.setX(this.cardLeftX)
        return healthContainer
    }
    initDelayScrollsInstance() {
        const delayScrollsContainer = this.scene.add.container(0, 0)
        const delayScrolls = this.delayScrolls
        for (let i = 0; i < delayScrolls.length; i++) {
            const delayScroll = threeKingdomsCards[delayScrolls[i]]
            const delayScrollText = this.scene.add.text(
                -100 + 12, // 左邊界+位移
                -100 + 12 + 22 * i, // 上邊界+位移
                `${delayScroll.name[0]}`,
                {
                    fontSize: '20px',
                    color: '#FFFFFF',
                    backgroundColor: '#FF0000',
                },
            )
            delayScrollText.setOrigin(0.5)
            delayScrollsContainer.add(delayScrollText)
        }
        return delayScrollsContainer
    }
}
