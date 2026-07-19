import { Card, Player, BattleScene } from './index'
import threeKingdomsCardsJson from '~/assets/cards.json'
import { atkLine } from '../utils/drawing'
import { roleMap } from '~/src/utils/domain'
import weaponFeaturesJson from '~/assets/weaponFeatures.json'
import type {
    ThreeKingdomsCardIds,
    ThreeKingdomsGeneralIds,
    ThreeKingdomsCard,
    WeaponFeature,
} from '~/src/types'
import Game from './Game'

const threeKingdomsCards: { [key in ThreeKingdomsCardIds]: ThreeKingdomsCard } =
    threeKingdomsCardsJson as { [key in ThreeKingdomsCardIds]: ThreeKingdomsCard }
const weaponFeatures: { [key: string]: WeaponFeature } = weaponFeaturesJson
export default class MainPlayer extends Player {
    handCards: Card[] = []
    selectedCard: Card | null = null
    selectedWeapon: ThreeKingdomsCardIds | null = null
    seats: Player[] = []
    gamePlayCardHandler: any = () => {}
    discardMode: boolean = false
    reactionMode: boolean = false
    reactionType: string = ''
    discardCount: number = 0
    discardCards: Card[] = []
    discardCardsAction: ([]) => void = ([]) => {}
    viperSpearMode: boolean = false
    viperSpearTarget: Player | null = null
    heavenlyDoubleHalberdMode: boolean = false
    weaponActionBorder?: Phaser.GameObjects.Graphics
    weaponHitArea?: Phaser.GameObjects.Rectangle
    mainInstanceMap: { [key: string]: Phaser.GameObjects.Container } = {}
    event: string = ''
    eventData: any = null
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
        gamePlayCardHandler: any
        discardCardsAction: ([]) => void
        x: number
        y: number
        scene: BattleScene
        seats: any
        game: Game
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
            game,
        })
        this.seats = seats
        this.gamePlayCardHandler = gamePlayCardHandler
        this.discardCardsAction = discardCardsAction
        this.mainInstanceMap = {}
        // this.createMainPlayerInstance({ baseX: x, baseY: y, scene })
    }
    createInstance() {
        super.createInstance()
        const baseX = this.x
        const baseY = this.y
        const scene = this.scene
        // const idText = scene.add.text(0, -80, this.id, {
        //     fontSize: '24px',
        //     color: '#000000',
        // })
        // const generralText = scene.add.text(0, -40, this.general.name, {
        //     fontSize: '20px',
        //     color: '#000',
        // })
        // const roleText = scene.add.text(0, 0, roleMap[this.roleId] || '?', {
        //     fontSize: '20px',
        //     color: '#000',
        // })
        // // const hpText = scene.add.text(0, 40, `血量: ${this.hp}`, {
        // //     fontSize: '20px',
        // //     color: '#000',
        // // })
        // const equipmentNames = this.equipments
        //     .filter((equipmentId) => equipmentId)
        //     .map((equipmentId) => {
        //         const equipment = threeKingdomsCards[equipmentId]
        //         return equipment.name
        //     })
        //     .join(', ')
        // const equipmentText = scene.add.text(0, 70, `裝備: ${equipmentNames}`, {
        //     fontSize: '20px',
        //     color: '#000',
        // })
        // // 設置文字位置在矩形中心
        // const texts = [idText, generralText, roleText, equipmentText]
        // texts.forEach((text) => {
        //     text.setOrigin(0.5)
        // })
        // // 將矩形和文字添加到容器中，以便一起操作
        // const container = scene.add.container(0, 0, [
        //     rectangle,
        //     idText,
        //     roleText,
        //     generralText,
        //     // hpText,
        //     equipmentText,
        // ])

        // // 設置容器位置在遊戲場景中心
        // container.setPosition(baseX, baseY)
        // this.instance = container
        // this.scene = scene
        // // return container
        // rectangle.setInteractive()
        // rectangle.on('pointerdown', () => {
        //     this.handleClickPlayer(this)
        // })
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
                if (this.discardCards.length < this.discardCount) return
                if (this.viperSpearMode) {
                    this.submitViperSpearKill()
                    return
                }
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
                if (this.hintInstance) this.hintInstance.setAlpha(0)
            }
        })
        // 不出牌按鈕
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
            if (this.event === 'AskDodgeEvent' || this.event === 'AskPeachEvent') {
                this.gamePlayCardHandler({}, this.event)
                this.event = ''
            } else {
                this.gamePlayCardHandler({}, this.reactionType)
            }
            this.reactionType = ''
            if (this.skipInstance) this.skipInstance.setAlpha(0)
            if (this.hintInstance) this.hintInstance.setAlpha(0)
            if (this.event === 'AskKillEvent') {
                this.handCards.forEach((card) => {
                    card.instance.setAlpha(1)
                })
                this.event = ''
            }
            this.handCards.forEach((card) => {
                card.instance.setAlpha(1)
            })
        })
        // 提示文字
        const hintText = scene.add.text(0, 0, '請選擇要棄的牌', {
            fontSize: '20px',
            color: '#FFF',
        })
        hintText.setOrigin(0.5)
        const hintContainer = scene.add.container(0, 0, [hintText])
        hintContainer.setPosition(baseX - 300, baseY - 220)
        hintContainer.setAlpha(0)
        this.hintInstance = hintContainer

        this.createConfirmModal(scene)
        this.createCheckModal(scene)
        this.createSelectCardModal(scene)
        this.bindWeaponInteraction()
    }
    test() {
        console.log('test')
    }
    addHandCard = (cardId: ThreeKingdomsCardIds) => {
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
        console.log('addHandCard', cardId, this.handCards.length)
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
        // console.log(
        //     'playCardHandler',
        //     card,
        //     'event: ',
        //     this.event,
        //     'discardMode: ',
        //     this.discardMode,
        //     'reactionType: ',
        //     this.reactionType,
        // )
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
        // 非自己回合僅允許反應事件出牌（殺/閃/桃/無懈）
        const isReactiveEvent =
            this.event === 'AskKillEvent' ||
            this.event === 'AskDodgeEvent' ||
            this.event === 'AskPeachEvent' ||
            this.event === 'AskPlayWardEvent'
        if (this.game!.getActivePlayer() !== this.id && !isReactiveEvent) {
            return
        }
        // 自己的主動狀態不能出無懈可擊
        if (this.event !== 'AskPlayWardEvent' && card.name === '無懈可擊' && !this.discardMode) {
            return
        }
        /// event check
        if (this.event === 'AskKillEvent') {
            if (card.name !== '殺') {
                return
            }
            this.handleSelectCard(card)
            this.mainInstanceMap.checkModal?.setAlpha(1)
            return
        }
        if (this.event === 'AskDodgeEvent') {
            if (card.name !== '閃') {
                return
            }
            this.handleSelectCard(card)
            return
        }
        if (this.event === 'AskPeachEvent') {
            if (card.name !== '桃') {
                return
            }
            this.handleSelectCard(card)
            return
        }
        if (this.event === 'AskPlayWardEvent') {
            console.log('AskPlayWardEvent', card.name)
            if (card.name !== '無懈可擊') {
                return
            }
            this.handleSelectCard(card)
            return
        }
        if (this.viperSpearMode) {
            return
        }
        if (
            card.name === '殺' ||
            card.name === '過河拆橋' ||
            card.name === '順手牽羊' ||
            card.name === '決鬥' ||
            card.name === '樂不思蜀' ||
            card.name === '桃' ||
            card.name === '閃' ||
            card.name === '南蠻入侵' ||
            card.name === '萬箭齊發'
        ) {
            if (this.selectedCard == card) {
                // 卡片下移
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
                this.clearHeavenlyDoubleHalberdMode()
                this.resetOutofDistance()
                return
            }
            if (this.selectedCard !== null && this.selectedCard !== card) {
                // 換牌
                this.scene.tweens.add({
                    targets: this.selectedCard.instance,
                    x: this.selectedCard.instance.x,
                    y: this.selectedCard.instance.y + 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
                this.clearHeavenlyDoubleHalberdMode()
                this.resetOutofDistance()
            }
            // 卡片上移
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
            // 計算每個人的距離
            // 錦囊卡不用看距離
            const cardInfo = threeKingdomsCards[card.id]
            if (
                card.name === '南蠻入侵' ||
                card.name === '萬箭齊發' ||
                card.name === '決鬥' ||
                card.name === '樂不思蜀'
            ) {
                this.mainInstanceMap.checkModal?.setAlpha(1)
            }
            if (cardInfo.type === 'scroll') {
                return
            }
            if (card.name === '閃') return
            if (card.name === '桃') {
                // 顯示確認
                this.mainInstanceMap.checkModal?.setAlpha(1)
                return
            }
            const distances = this.seats.forEach((player, index) => {
                // index 就是距離
                // 考慮裝備
                let distance = Math.min(index + 1, this.seats.length - index)
                if (player.equipments[2]) {
                    distance += 1
                }
                if (this.equipments[3]) {
                    distance -= 1
                }
                if (this.equipments[0]) {
                    // 考慮武器攻擊距離
                    const weaponCard = threeKingdomsCards[this.equipments[0]]
                    const weaponFeature = weaponFeatures[weaponCard.name]
                    if (weaponFeature?.attackDistance) {
                        distance -= weaponFeature.attackDistance - 1
                    }
                }
                if (distance > 1) player.setOutOfDistance(true)
            })
            if (this.canTriggerHeavenlyDoubleHalberd(card)) {
                this.enableHeavenlyDoubleHalberdMode()
            } else {
                this.heavenlyDoubleHalberdMode = false
            }
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
        if (card.name === '借刀殺人') {
            if (this.selectedCard == card) {
                // 卡片下移
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
                this.resetOutofDistance()
                return
            }
            // 判斷是否有可以施放的對象
            // 該玩家身上有武器
            const targetPlayers = this.seats.filter((player) => !player.equipments[0])
            console.log('targetPlayers', targetPlayers)
            targetPlayers.forEach((player) => {
                player.setOutOfDistance(true)
            })
            // 卡片上移
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
            this.mainInstanceMap.checkModal?.setAlpha(1)
            return
        }
        card.playCard()
        this.gamePlayCardHandler(card)
        this.selectedCard = null
        if (this.reactionMode) {
            this.reactionMode = false
            this.skipInstance?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
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
        if (this.hintInstance) {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText(`請選擇要棄的牌(${discardCount}張)`)
            this.hintInstance.setAlpha(1)
        }
        // this.handCards = this.handCards.filter((handCard) => handCard !== card)
        // card.destroy()
        // this.arrangeCards()
    }
    bindWeaponInteraction = () => {
        if (this.weaponHitArea) {
            this.weaponHitArea.destroy()
            this.weaponHitArea = undefined
        }
        if (this.weaponActionBorder) {
            this.weaponActionBorder.destroy()
            this.weaponActionBorder = undefined
        }
        const weaponInstance = this.instanceMap.weapon
        const weaponCardId = this.equipments[0]
        if (!weaponInstance || !weaponCardId) return
        const weaponCard = threeKingdomsCards[weaponCardId]
        if (weaponCard.name !== '丈八蛇矛') return

        const actionBorder = this.scene.add.graphics()
        actionBorder.lineStyle(2, 0xf0c419, 1)
        actionBorder.strokeRoundedRect(16, -4, 168, 32, 8)
        actionBorder.setAlpha(this.viperSpearMode ? 1 : 0.45)

        const hitArea = this.scene.add.rectangle(100, 12, 160, 24, 0xffffff, 0.001)
        hitArea.setInteractive({ useHandCursor: true })
        hitArea.on('pointerover', () => {
            if (this.canTriggerViperSpear() || this.viperSpearMode) {
                actionBorder.setAlpha(1)
            }
        })
        hitArea.on('pointerout', () => {
            if (!this.viperSpearMode) {
                actionBorder.setAlpha(0.45)
            }
        })
        hitArea.on('pointerdown', () => {
            this.handleWeaponClick()
        })

        weaponInstance.add([actionBorder, hitArea])
        this.weaponActionBorder = actionBorder
        this.weaponHitArea = hitArea
    }
    canTriggerViperSpear = () => {
        const weaponCardId = this.equipments[0]
        if (!weaponCardId) return false
        const weaponCard = threeKingdomsCards[weaponCardId]
        if (weaponCard.name !== '丈八蛇矛') return false
        const canUseDuringTurn = this.game?.getActivePlayer() === this.id && !this.event
        const canUseForAskKill = this.event === 'AskKillEvent'
        if (!canUseDuringTurn && !canUseForAskKill) return false
        if (this.discardMode || this.reactionMode || this.selectedCard) return false
        return this.handCards.filter((card) => !card.played).length >= 2
    }
    handleWeaponClick = () => {
        if (!this.canTriggerViperSpear()) return
        this.selectedWeapon = this.equipments[0]
        this.viperSpearMode = true
        this.weaponActionBorder?.setAlpha(1)
        if (this.event === 'AskKillEvent') {
            this.handCards.forEach((card) => card.instance.setAlpha(1))
            if (this.hintInstance) {
                const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                hintText?.setText('丈八蛇矛：按確定後棄兩張牌，當作出殺')
                this.hintInstance.setAlpha(1)
            }
            this.mainInstanceMap.checkModal?.setAlpha(1)
            return
        }
        if (this.hintInstance) {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText('丈八蛇矛：請選擇攻擊目標')
            this.hintInstance.setAlpha(1)
        }
        this.mainInstanceMap.checkModal?.setAlpha(1)
        this.seats.forEach((player) => {
            player.setOutOfDistance(!this.game?.canAttack(this, player))
        })
    }
    handleViperSpearTarget = (player: Player) => {
        if (!this.viperSpearMode || player.isOutofDistance) return
        if (this.viperSpearTarget?.id === player.id) {
            player.setPlayerSelected(false)
            this.viperSpearTarget = null
            return
        }
        if (this.viperSpearTarget) {
            this.viperSpearTarget.setPlayerSelected(false)
        }
        player.setPlayerSelected(true, 'to')
        this.viperSpearTarget = player
    }
    startViperSpearDiscard = () => {
        if (this.event !== 'AskKillEvent' && !this.viperSpearTarget) return
        this.mainInstanceMap.checkModal?.setAlpha(0)
        this.askDiscardCards(2)
        if (this.hintInstance) {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            if (this.event === 'AskKillEvent') {
                hintText?.setText('丈八蛇矛：請棄兩張牌，當作出殺')
            } else {
                hintText?.setText(
                    `丈八蛇矛：請棄兩張牌，對${this.viperSpearTarget!.general.name}出殺`,
                )
            }
            this.hintInstance.setAlpha(1)
        }
    }
    resolveViperSpearTargetId = () => {
        if (this.viperSpearTarget) return this.viperSpearTarget.id
        return this.eventData?.targetPlayerId || this.game?.getActivePlayer() || ''
    }
    submitViperSpearKill = () => {
        if (this.discardCards.length !== 2) return
        const targetPlayerId = this.resolveViperSpearTargetId()
        if (!targetPlayerId) return
        this.game?.useViperSpearKill(
            targetPlayerId,
            this.discardCards.map((card) => card.id),
        )
        this.handCards.forEach((card) => {
            if (card.selected) {
                card.discardCard()
            }
        })
        if (this.viperSpearTarget) {
            atkLine({
                endPoint: new Phaser.Math.Vector2(
                    this.viperSpearTarget.instance.x,
                    this.viperSpearTarget.instance.y,
                ),
                scene: this.scene,
            })
        }
        this.arrangeCards()
        this.clearViperSpearState()
        this.handCards.forEach((card) => {
            card.instance.setAlpha(1)
        })
        if (this.event === 'AskKillEvent') {
            this.event = ''
            this.eventData = null
            this.reactionType = ''
            this.reactionMode = false
            this.weaponActionBorder?.setAlpha(this.canTriggerViperSpear() ? 0.45 : 0)
        }
    }
    clearViperSpearState = (restoreAskKillPrompt: boolean = false) => {
        this.viperSpearTarget?.setPlayerSelected(false)
        this.viperSpearTarget = null
        this.viperSpearMode = false
        this.selectedWeapon = null
        this.discardMode = false
        this.handCards.forEach((card) => {
            if (!card.selected) return
            card.selected = false
            this.scene.tweens.add({
                targets: card.instance,
                x: card.instance.x,
                y: card.instance.y + 20,
                duration: 300,
                ease: 'Power2',
            })
        })
        this.discardCards = []
        this.discardCount = 0
        this.resetOutofDistance()
        this.weaponActionBorder?.setAlpha(this.canTriggerViperSpear() ? 0.45 : 0)
        if (this.checkBtnInstance) this.checkBtnInstance.setAlpha(0)
        if (restoreAskKillPrompt && this.event === 'AskKillEvent') {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText('請出一張殺')
            this.hintInstance?.setAlpha(1)
            this.mainInstanceMap.checkModal?.setAlpha(1)
            return
        }
        this.mainInstanceMap.checkModal?.setAlpha(0)
        this.hintInstance?.setAlpha(0)
    }
    canTriggerHeavenlyDoubleHalberd = (card: Card) => {
        const weaponCardId = this.equipments[0]
        if (!weaponCardId) return false
        const weaponCard = threeKingdomsCards[weaponCardId]
        if (weaponCard.name !== '方天畫戟') return false
        if (card.name !== '殺') return false
        if (this.game?.getActivePlayer() !== this.id) return false
        if (this.event || this.discardMode || this.reactionMode || this.viperSpearMode) return false
        return this.handCards.filter((handCard) => !handCard.played).length === 1
    }
    enableHeavenlyDoubleHalberdMode = () => {
        this.heavenlyDoubleHalberdMode = true
        if (this.game) {
            this.game.selectTargetPlayers.forEach((player) => player.setPlayerSelected(false))
            this.game.selectTargetPlayers = []
        }
        this.updateKillTargetSelectionHint(0, 3, true)
        this.mainInstanceMap.checkModal?.setAlpha(1)
    }
    updateKillTargetSelectionHint = (
        selectedCount: number,
        maxCount: 1 | 3,
        isHeavenlyDoubleHalberd: boolean,
    ) => {
        if (!this.hintInstance) return
        const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
        if (isHeavenlyDoubleHalberd) {
            hintText?.setText(
                `已觸發方天畫戟效果，可選擇三個玩家為目標（已選 ${selectedCount}/${maxCount}）`,
            )
        } else {
            hintText?.setText(`請選擇要出殺的目標（已選 ${selectedCount}/${maxCount}）`)
        }
        this.hintInstance.setAlpha(1)
    }
    clearHeavenlyDoubleHalberdMode = (hidePrompt: boolean = true) => {
        this.heavenlyDoubleHalberdMode = false
        if (this.game) {
            this.game.selectTargetPlayers.forEach((player) => player.setPlayerSelected(false))
            this.game.selectTargetPlayers = []
        }
        if (!hidePrompt) return
        this.mainInstanceMap.checkModal?.setAlpha(0)
        this.hintInstance?.setAlpha(0)
    }
    askReaction = (reactionType: string, event: any = {}) => {
        console.log('askReaction', reactionType, event)
        this.reactionType = reactionType
        this.reactionMode = true

        if (reactionType === 'useDismantleEffect') {
            const player: Player = event.targetPlayer
            console.log('useDismantleEffect', player)
            this.useSelectCardModal({
                type: 'small',
                message: '請選擇要拆的卡',
                handCardCount: player.hand.size,
                cardIds: player.equipments.filter((cardId) => cardId),
                delayScrolls: player.delayScrolls,
                confirmText: '選擇',
                cancelText: '取消',
                handleConfirm: (cardId) => {
                    console.log('選擇', cardId)
                    if (cardId.includes('handCard')) {
                        const cardIndex = Number(cardId.split('-')[1])
                        this.game?.useDismantleEffect(player.id, undefined, cardIndex)
                    } else {
                        this.game?.useDismantleEffect(player.id, cardId)
                    }
                    this.reactionType = ''
                    this.closeSelectCardModal()
                },
                handleCancel: () => {
                    console.log('取消')
                    this.reactionType = ''
                    this.closeSelectCardModal()
                    this.selectedCard = null
                },
            })
        }
        if (reactionType === 'useSnatchEffect') {
            const player: Player = event.targetPlayer
            console.log('useSnatchEffect', player)
            this.useSelectCardModal({
                type: 'small',
                message: '請選擇要牽的卡',
                handCardCount: player.hand.size,
                cardIds: player.equipments.filter((cardId) => cardId),
                delayScrolls: player.delayScrolls,
                confirmText: '選擇',
                cancelText: '取消',
                handleConfirm: (cardId) => {
                    console.log('選擇', cardId)
                    if (cardId.includes('handCard')) {
                        const cardIndex = Number(cardId.split('-')[1])
                        this.game?.useSnatchEffect(player.id, undefined, cardIndex)
                    } else {
                        this.game?.useSnatchEffect(player.id, cardId)
                    }
                    this.reactionType = ''
                    this.closeSelectCardModal()
                },
                handleCancel: () => {
                    console.log('取消')
                    this.reactionType = ''
                    this.closeSelectCardModal()
                    this.selectedCard = null
                },
            })
        }
    }
    processEvent = (event: any) => {
        console.log('processEvent', event)
        this.event = event.event
        this.eventData = event.data
        switch (this.event) {
            case 'AskKillEvent': {
                const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                hintText?.setText('請出一張殺')
                this.hintInstance?.setAlpha(1)
                // this.skipInstance?.setAlpha(1)
                // 只能出殺 其他不能出
                this.handCards.forEach((card) => {
                    if (card.name !== '殺') {
                        card.instance.setAlpha(0.3)
                    }
                })
                this.weaponActionBorder?.setAlpha(this.canTriggerViperSpear() ? 0.45 : 0)
                this.mainInstanceMap.checkModal?.setAlpha(1)
                break
            }
            case 'AskDodgeEvent': {
                const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                hintText?.setText('請出一張閃')
                this.hintInstance?.setAlpha(1)
                // 只能出閃 其他不能出
                this.handCards.forEach((card) => {
                    if (card.name !== '閃') {
                        card.instance.setAlpha(0.3)
                    }
                })
                // 打開確認 取消按鈕
                this.mainInstanceMap.checkModal?.setAlpha(1)
                break
            }
            case 'AskPeachEvent': {
                const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                hintText?.setText('請出一張桃')
                this.hintInstance?.setAlpha(1)
                this.mainInstanceMap.checkModal?.setAlpha(1)
                break
            }
            case 'AskPlayWardEvent': {
                const allPlayers = [...this.seats, this]
                const triggerPlayer = allPlayers.find(
                    (p) => p.id === event.data.wardTriggerPlayerId,
                )
                const triggerName = triggerPlayer?.general?.name || event.data.wardTriggerPlayerId
                const targetIds: string[] = event.data.targetPlayerIds || []
                let targetName = '全體'
                if (targetIds.length === 1) {
                    const targetPlayer = allPlayers.find((p) => p.id === targetIds[0])
                    targetName = targetPlayer?.general?.name || targetIds[0]
                }
                const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
                hintText?.setText(`是否要出無懈可擊？(${triggerName}對${targetName})`)
                this.hintInstance?.setAlpha(1)
                this.mainInstanceMap.checkModal?.setAlpha(1)
                break
            }
            case 'BountifulHarvestEvent':
                this.useSelectCardModal({
                    type: 'small',
                    message: '請選擇一張卡',
                    cardIds: event.data.assignmentCardIds,
                    confirmText: '選擇',
                    cancelText: '取消',
                    handleConfirm: (cardId) => {
                        console.log('選擇', cardId)
                        this.game?.chooseCardFromBountifulHarvest(cardId)
                        this.reactionType = ''
                    },
                    handleCancel: () => {
                        console.log('取消')
                        this.reactionType = ''
                    },
                })
                break
            case 'AskPlayEquipmentEffectEvent':
                this.useConfirmModal({
                    message: event.message,
                    handleConfirm: () => {
                        this.game?.useEquipmentEffect(
                            event.data.equipmentCardId,
                            event.data.targetPlayerIds[0],
                            'equipmentActive',
                        )
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                    handleCancel: () => {
                        this.game?.useEquipmentEffect(
                            event.data.equipmentCardId,
                            event.data.targetPlayerIds[0],
                            'equipmentSkip',
                        )
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            case 'AskChooseMountCardEvent':
                console.log('AskChooseMountCardEvent')
                this.useSelectCardModal({
                    message: event.message,
                    cardIds: event.data.mountCardIds,
                    confirmText: '選擇',
                    cancelText: '取消',
                    handleConfirm: (cardId) => {
                        console.log('選擇', cardId)
                        this.game?.chooseHorseCard(cardId)
                    },
                    handleCancel: () => {
                        console.log('取消')
                    },
                })
                break
            case 'AskActivateYinYangSwordsEvent':
                console.log('AskActivateYinYangSwordsEvent')
                this.useConfirmModal({
                    message: '是否發動雌雄雙股劍效果？',
                    confirmText: '發動',
                    cancelText: '跳過',
                    handleConfirm: () => {
                        console.log('發動雌雄雙股劍效果')
                        this.game?.activateYinYangSwords('ACTIVATE')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                    handleCancel: () => {
                        console.log('跳過雌雄雙股劍效果')
                        this.game?.activateYinYangSwords('SKIP')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            case 'AskYinYangSwordsEffectEvent': {
                const allPlayers = [...this.seats, this]
                const attacker = allPlayers.find((p) => p.id === event.data.attackerPlayerId)
                const attackerName = attacker?.general?.name || event.data.attackerPlayerId
                this.useConfirmModal({
                    message: `雌雄雙股劍效果：請選擇`,
                    confirmText: '棄一張手牌',
                    cancelText: '讓攻擊者摸牌',
                    handleConfirm: () => {
                        // TARGET_DISCARDS：選擇要棄哪張手牌
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                        this.useSelectCardModal({
                            type: 'small',
                            message: '選擇要棄的手牌',
                            cardIds: this.hand.cardIds as ThreeKingdomsCardIds[],
                            confirmText: '確認',
                            cancelText: '取消',
                            handleConfirm: (cardId) => {
                                console.log('棄牌', cardId)
                                this.game?.useYinYangSwordsEffect('TARGET_DISCARDS', cardId)
                                this.closeSelectCardModal()
                            },
                            handleCancel: () => {
                                console.log('取消棄牌')
                                this.closeSelectCardModal()
                            },
                        })
                    },
                    handleCancel: () => {
                        // ATTACKER_DRAWS：讓攻擊者摸牌
                        console.log('讓攻擊者摸牌')
                        this.game?.useYinYangSwordsEffect('ATTACKER_DRAWS', '')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            }
            case 'AskGreenDragonCrescentBladeEffectEvent': {
                console.log('AskGreenDragonCrescentBladeEffectEvent')
                this.useConfirmModal({
                    message: '是否再出一張殺？',
                    confirmText: '出殺',
                    cancelText: '跳過',
                    handleConfirm: () => {
                        // KILL：選擇要出哪張殺
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                        const killCards = this.handCards.filter((card) => card.name === '殺')
                        const killCardIds = killCards.map(
                            (card) => card.id,
                        ) as ThreeKingdomsCardIds[]
                        this.useSelectCardModal({
                            type: 'small',
                            message: '選擇要出的殺',
                            cardIds: killCardIds,
                            confirmText: '確認',
                            cancelText: '取消',
                            handleConfirm: (cardId) => {
                                console.log('出殺', cardId)
                                this.game?.useGreenDragonCrescentBladeEffect('KILL', cardId)
                                this.closeSelectCardModal()
                            },
                            handleCancel: () => {
                                console.log('取消出殺')
                                this.closeSelectCardModal()
                            },
                        })
                    },
                    handleCancel: () => {
                        // SKIP：跳過
                        console.log('跳過青龍偃月刀效果')
                        this.game?.useGreenDragonCrescentBladeEffect('SKIP', '')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            }
            case 'AskStonePiercingAxeEffectEvent': {
                // 貫石斧發動時不可把武器欄本身當作棄牌目標，因此排除 equipments[0]。
                const discardableCardIds = [
                    ...(this.hand.cardIds as ThreeKingdomsCardIds[]),
                    ...(this.equipments.filter(
                        (cardId, index) => index !== 0 && cardId,
                    ) as ThreeKingdomsCardIds[]),
                ]
                this.useConfirmModal({
                    message: '是否棄兩張牌強制命中？',
                    confirmText: '棄兩張',
                    cancelText: '跳過',
                    handleConfirm: () => {
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                        this.useSelectCardModal({
                            type: 'small',
                            message: '選擇兩張要棄的牌',
                            cardIds: discardableCardIds,
                            confirmText: '確認',
                            cancelText: '取消',
                            maxSelectionCount: 2,
                            handleConfirm: (selectedCardIds) => {
                                if (!Array.isArray(selectedCardIds)) return
                                this.game?.useStonePiercingAxeEffect('DISCARD_TWO', selectedCardIds)
                                this.closeSelectCardModal()
                            },
                            handleCancel: () => {
                                this.closeSelectCardModal()
                            },
                        })
                    },
                    handleCancel: () => {
                        this.game?.useStonePiercingAxeEffect('SKIP', [])
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            }
            case 'AskJianXiongEffectEvent': {
                const sourceCardCount = (event.data?.sourceCardIds || []).length
                const message =
                    sourceCardCount > 0
                        ? `是否發動奸雄，獲得造成傷害的${sourceCardCount}張牌？`
                        : '是否發動奸雄，獲得造成傷害的牌？'
                this.useConfirmModal({
                    message,
                    confirmText: '發動',
                    cancelText: '跳過',
                    handleConfirm: () => {
                        this.game?.useJianXiongEffect('ACCEPT')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                    handleCancel: () => {
                        this.game?.useJianXiongEffect('SKIP')
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                    },
                })
                break
            }
            case 'AskHuJiaEffectEvent': {
                const finishHuJiaResponse = () => {
                    this.event = ''
                    this.eventData = null
                    this.reactionType = ''
                    this.reactionMode = false
                    this.mainInstanceMap.checkModal?.setAlpha(0)
                    this.mainInstanceMap.confirmModal?.setAlpha(0)
                    this.hintInstance?.setAlpha(0)
                    this.handCards.forEach((card) => {
                        card.instance.setAlpha(1)
                    })
                }
                const dodgeCardIdsInHand = ((event.data?.dodgeCardIdsInHand || []) as string[])
                    .filter(Boolean)
                    .map((cardId) => cardId as ThreeKingdomsCardIds)
                const fallbackDodgeCardIds = (this.hand.cardIds as ThreeKingdomsCardIds[]).filter(
                    (cardId) => threeKingdomsCards[cardId]?.name === '閃',
                )
                const selectableDodgeCardIds =
                    dodgeCardIdsInHand.length > 0 ? dodgeCardIdsInHand : fallbackDodgeCardIds

                if (selectableDodgeCardIds.length === 0) {
                    this.useConfirmModal({
                        message: '護駕：你手上沒有閃，僅能拒絕。',
                        confirmText: '確定',
                        cancelText: '拒絕',
                        handleConfirm: () => {
                            this.game?.useHuJiaEffect('DECLINE', null)
                            finishHuJiaResponse()
                        },
                        handleCancel: () => {
                            this.game?.useHuJiaEffect('DECLINE', null)
                            finishHuJiaResponse()
                        },
                    })
                    break
                }

                this.useConfirmModal({
                    message: '是否發動護駕，代替主公打出一張閃？',
                    confirmText: '出閃',
                    cancelText: '拒絕',
                    handleConfirm: () => {
                        this.mainInstanceMap.confirmModal?.setAlpha(0)
                        this.useSelectCardModal({
                            type: 'small',
                            message: '選擇要代打的閃',
                            cardIds: selectableDodgeCardIds,
                            confirmText: '確認出閃',
                            cancelText: '拒絕護駕',
                            handleConfirm: (cardId) => {
                                if (!cardId || Array.isArray(cardId)) return
                                this.game?.useHuJiaEffect('ACCEPT', cardId)
                                this.closeSelectCardModal()
                                finishHuJiaResponse()
                            },
                            handleCancel: () => {
                                this.game?.useHuJiaEffect('DECLINE', null)
                                this.closeSelectCardModal()
                                finishHuJiaResponse()
                            },
                        })
                    },
                    handleCancel: () => {
                        this.game?.useHuJiaEffect('DECLINE', null)
                        finishHuJiaResponse()
                    },
                })
                break
            }
        }
    }
    updatePlayerData(data: any): void {
        super.updatePlayerData(data)
        this.bindWeaponInteraction()
        if (data.hand.cardIds.join() !== this.hand.cardIds.join()) {
            // 保留相同的卡片 只處理不同的卡片
            console.log(
                'updatePlayerData',
                data.hand.cardIds.join(),
                this.hand.cardIds.join(),
                this.handCards.length,
            )
            this.hand.size = data.hand.size
            this.hand.cardIds = data.hand.cardIds
            // 從第一張開始檢查手牌與當前手牌是否相同，找到不同處之後 刪除後面的卡片 並新增新的卡片
            const diffIndex = this.handCards.findIndex(
                (card, i) => card.id !== data.hand.cardIds[i],
            )
            console.log('diffIndex', diffIndex)
            if (diffIndex === -1) {
                // 沒有要刪除的卡片
                console.log(this.handCards.length, data.hand.cardIds.length)
                for (let i = this.handCards.length; i < data.hand.cardIds.length; i++) {
                    this.addHandCard(data.hand.cardIds[i])
                    console.log('addHandCard', data.hand.cardIds[i])
                }
            } else {
                for (let i = diffIndex; i < this.handCards.length; i++) {
                    this.handCards[i].instance.destroy()
                }
                this.handCards = this.handCards.slice(0, diffIndex)
                for (let i = diffIndex; i < data.hand.cardIds.length; i++) {
                    this.addHandCard(data.hand.cardIds[i])
                }
            }
            this.arrangeCards()
            // this.handCards.forEach((card) => {
            //     card.instance.destroy()
            // })
            // this.handCards = []
            // data.hand.cardIds.forEach((cardId: ThreeKingdomsCardIds) => {
            //     this.addHandCard(cardId)
            // })
            // this.arrangeCards()
        }
    }
    // updatePlayerData(data: any) {
    //     // 手牌數確認
    //     // if (data.hand.size !== this.hand.size) {
    //     //     this.hand.size = data.hand.size
    //     //     const handText: Phaser.GameObjects.Text = this.instance.getAt(5)
    //     //     handText.setText(`手牌: ${this.hand.size}`)
    //     //     this.scene.tweens.add({
    //     //         targets: handText,
    //     //         scale: 1.5,
    //     //         duration: 150, // 持續時間（毫秒）
    //     //         ease: 'Power2',
    //     //         yoyo: true,
    //     //         repeat: 1,
    //     //     })
    //     // }
    //     // 裝備數確認
    //     if (data.equipments.join() !== this.equipments.join()) {
    //         this.equipments = data.equipments
    //         const equipmentNames = this.equipments
    //             .filter((equipmentId) => equipmentId)
    //             .map((equipmentId) => {
    //                 const equipment = threeKingdomsCards[equipmentId]
    //                 return equipment.name
    //             })
    //             .join(', ')
    //         const equipmentText: Phaser.GameObjects.Text = this.instance.getAt(5)
    //         equipmentText.setText(`裝備: ${equipmentNames}`)
    //         this.scene.tweens.add({
    //             targets: equipmentText,
    //             scale: 1.5,
    //             duration: 150, // 持續時間（毫秒）
    //             ease: 'Power2',
    //             yoyo: true,
    //             repeat: 1,
    //         })
    //     }
    // }
    resetOutofDistance = () => {
        this.seats.forEach((player) => {
            player.setOutOfDistance(false)
        })
    }
    useConfirmModal = ({
        message = '提示訊息',
        confirmText = '是',
        cancelText = '否',
        handleConfirm = () => {},
        handleCancel = () => {},
    }: {
        message?: string
        confirmText?: string
        cancelText?: string
        handleConfirm?: () => void
        handleCancel?: () => void
    }) => {
        const modelText: Phaser.GameObjects.Text = this.mainInstanceMap.confirmModal?.getAt(1)
        modelText.setText(message)
        const yesButton: Phaser.GameObjects.Text = this.mainInstanceMap.confirmModal?.getAt(2)
        yesButton.setText(confirmText)
        const noButton: Phaser.GameObjects.Text = this.mainInstanceMap.confirmModal?.getAt(3)
        noButton.setText(cancelText)
        yesButton.setInteractive().off('pointerdown').on('pointerdown', handleConfirm)
        noButton.setInteractive().off('pointerdown').on('pointerdown', handleCancel)
        this.mainInstanceMap.confirmModal?.setAlpha(1)
        // 創建一個容器來包含彈窗的所有組件
        // const popupContainer = this.scene.add.container(100, 100, [background, yesButton, noButton])
        // popupContainer.setSize(600, 400)
        // popupContainer.setDepth(1000)
    }
    createConfirmModal(scene: Phaser.Scene) {
        // 確認視窗
        const background = scene.add.graphics()
        background.fillStyle(0x000000, 0.5) // 黑色，50% 透明度
        background.fillRect(0, 0, 600, 400) // 矩形位置和大小

        // 添加 "訊息提示"
        const messageText = scene.add.text(300, 100, '你要使用八卦陣嗎？', {
            fontSize: '32px',
            color: '#fff',
        })
        messageText.setOrigin(0.5)
        // 添加 "是" 按鈕
        const yesButton = scene.add
            .text(200, 250, '是', { fontSize: '32px', color: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('是 按鈕被按下')
                // 添加更多處理邏輯
            })
        yesButton.setOrigin(0.5)
        // 添加 "否" 按鈕
        const noButton = scene.add
            .text(400, 250, '否', { fontSize: '32px', color: '#f00' })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('否 按鈕被按下')
                // 添加更多處理邏輯
            })
        noButton.setOrigin(0.5)
        // 創建一個容器來包含彈窗的所有組件
        const popupContainer = scene.add.container(100, 100, [
            background,
            messageText,
            yesButton,
            noButton,
        ])
        popupContainer.setSize(600, 400)
        popupContainer.setDepth(1000)
        popupContainer.setAlpha(0)
        this.mainInstanceMap.confirmModal = popupContainer
        return
    }
    handleCheckClick = () => {
        console.log('確認 按鈕被按下', this.selectedCard, this.event)
        if (this.viperSpearMode && !this.discardMode) {
            this.startViperSpearDiscard()
            return
        }
        if (this.heavenlyDoubleHalberdMode && this.selectedCard?.name === '殺') {
            const targets = this.game?.selectTargetPlayers || []
            if (targets.length === 0) {
                console.log('方天畫戟至少需要選擇一名目標')
                return
            }
            const card = this.selectedCard
            this.game?.useHeavenlyDoubleHalberdKill(
                card.id,
                targets.map((target) => target.id),
            )
            targets.forEach((target) => {
                atkLine({
                    endPoint: new Phaser.Math.Vector2(target.instance.x, target.instance.y),
                    scene: this.scene,
                })
            })
            this.selectedCard = null
            card.playCard()
            this.clearHeavenlyDoubleHalberdMode(false)
            this.resetOutofDistance()
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
            return
        }
        if (!this.event && this.selectedCard?.name === '殺') {
            const targetPlayer = this.game?.selectTargetPlayers[0]
            if (!targetPlayer) {
                this.updateKillTargetSelectionHint(0, 1, false)
                return
            }
            const card = this.selectedCard
            this.game?.playActiveKill(card.id, targetPlayer.id)
            atkLine({
                endPoint: new Phaser.Math.Vector2(targetPlayer.instance.x, targetPlayer.instance.y),
                scene: this.scene,
            })
            this.selectedCard = null
            card.playCard()
            targetPlayer.setPlayerSelected(false)
            if (this.game) {
                this.game.selectTargetPlayers = []
            }
            this.resetOutofDistance()
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
            return
        }
        if (this.selectedCard?.name === '借刀殺人') {
            if (this.game?.selectTargetPlayers.length !== 2) {
                console.log('請選擇兩名玩家')
                return
            } else {
                this.gamePlayCardHandler(this.selectedCard)
                this.selectedCard.playCard()
                this.selectedCard = null
                this.mainInstanceMap.checkModal?.setAlpha(0)
                console.log('選擇完成')
            }
        }
        if (this.event === 'AskDodgeEvent' || this.event === 'AskPeachEvent') {
            if (this.selectedCard === null) {
                return
            }
            if (this.event === 'AskDodgeEvent' && this.selectedCard.name !== '閃') {
                return
            }
            if (this.event === 'AskPeachEvent' && this.selectedCard.name !== '桃') {
                return
            }
            this.gamePlayCardHandler(this.selectedCard, this.event)
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.reactionType = ''
            this.reactionMode = false
            this.hintInstance?.setAlpha(0)
            this.handCards.forEach((card) => {
                card.instance.setAlpha(1)
            })
            this.event = ''
        }
        if (this.selectedCard?.name === '桃') {
            // 主動出桃
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.gamePlayCardHandler(card)
            this.mainInstanceMap.checkModal?.setAlpha(0)
            return
        }
        if (this.selectedCard?.name === '南蠻入侵' || this.selectedCard?.name === '萬箭齊發') {
            this.seats.forEach((player) => {
                atkLine({
                    endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                    scene: this.scene,
                })
            })
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.gamePlayCardHandler(card)
            this.mainInstanceMap.checkModal?.setAlpha(0)
        }
        if (this.selectedCard?.name === '決鬥' || this.selectedCard?.name === '樂不思蜀') {
            if (!this.game?.selectTargetPlayers.length) {
                // 第一次確認：隱藏 checkModal，讓玩家選擇目標
                this.mainInstanceMap.checkModal?.setAlpha(0)
                return
            }
            // 第二次確認：出牌
            const targetPlayer = this.game?.selectTargetPlayers[0]
            if (targetPlayer) {
                atkLine({
                    endPoint: new Phaser.Math.Vector2(
                        targetPlayer.instance.x,
                        targetPlayer.instance.y,
                    ),
                    scene: this.scene,
                })
            }
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.gamePlayCardHandler(card)
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.resetOutofDistance()
            return
        }
        if (this.event === 'AskKillEvent') {
            if (this.selectedCard?.name !== '殺') {
                return
            }
            this.gamePlayCardHandler(this.selectedCard, this.event)
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
            this.handCards.forEach((card) => {
                card.instance.setAlpha(1)
            })
            this.event = ''
            this.reactionType = ''
            this.reactionMode = false
        }
        if (this.event === 'AskPlayWardEvent') {
            if (this.selectedCard?.name !== '無懈可擊') {
                return
            }
            this.gamePlayCardHandler(this.selectedCard, this.event)
            const card = this.selectedCard
            this.selectedCard = null
            card.playCard()
            this.mainInstanceMap.checkModal?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
            this.handCards.forEach((card) => {
                card.instance.setAlpha(1)
            })
            this.event = ''
        }
    }
    handleCancelClick = () => {
        console.log('否 按鈕被按下')
        if (this.viperSpearMode) {
            this.clearViperSpearState(this.event === 'AskKillEvent')
            return
        }
        if (this.heavenlyDoubleHalberdMode) {
            this.clearHeavenlyDoubleHalberdMode(false)
        }
        if (
            this.event === 'AskDodgeEvent' ||
            this.event === 'AskPeachEvent' ||
            this.event === 'AskKillEvent' ||
            this.event === 'AskPlayWardEvent'
        ) {
            this.gamePlayCardHandler({}, this.event)
            this.event = ''
        }
        this.reactionType = ''
        if (this.hintInstance) this.hintInstance.setAlpha(0)
        // if (this.event === 'AskKillEvent') {
        //     this.handCards.forEach((card) => {
        //         card.instance.setAlpha(1)
        //     })
        //     this.event = ''
        // }
        this.handCards.forEach((card) => {
            card.instance.setAlpha(1)
        })
        this.mainInstanceMap.checkModal?.setAlpha(0)
        if (this.game) {
            this.game.selectTargetPlayers.forEach((p) => p.setPlayerSelected(false))
            this.game.selectTargetPlayers = []
        }
        if (this.selectedCard) {
            this.selectedCard.instance.setAlpha(1)
            this.scene.tweens.add({
                targets: this.selectedCard.instance,
                x: this.selectedCard.instance.x,
                y: this.selectedCard.instance.y + 20,
                duration: 500, // 持續時間（毫秒）
                ease: 'Power2',
                onComplete: () => {
                    this.selectedCard = null
                },
            })
        }
    }
    createCheckModal(scene: Phaser.Scene) {
        // 出牌確認視窗
        const background = scene.add.graphics()
        background.fillStyle(0x000000, 0.5) // 黑色，50% 透明度
        background.fillRect(0, 0, 200, 60) // 矩形位置和大小
        // 添加 "是" 按鈕
        const yesButton = scene.add
            .text(50, 30, '確定', { fontSize: '32px', color: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                if ((this.mainInstanceMap.checkModal?.alpha ?? 0) <= 0) return
                this.handleCheckClick()
            })
        yesButton.setOrigin(0.5)
        // 添加 "否" 按鈕
        const noButton = scene.add
            .text(150, 30, '取消', { fontSize: '32px', color: '#f00' })
            .setInteractive()
            .on('pointerdown', () => {
                if ((this.mainInstanceMap.checkModal?.alpha ?? 0) <= 0) return
                console.log('否 按鈕被按下')
                this.handleCancelClick()
            })
        noButton.setOrigin(0.5)
        // 創建一個容器來包含彈窗的所有組件
        const popupContainer = scene.add.container(600, 320, [background, yesButton, noButton])
        popupContainer.setSize(200, 80)
        popupContainer.setDepth(1000)
        popupContainer.setAlpha(0)
        this.mainInstanceMap.checkModal = popupContainer
        return
    }
    createSelectCardModal(scene: Phaser.Scene) {
        // 確認視窗
        const background = scene.add.graphics()
        background.fillStyle(0x000000, 0.5) // 黑色，50% 透明度
        background.fillRect(0, 0, 600, 400) // 矩形位置和大小

        // 添加 "訊息提示"
        const messageText = scene.add.text(300, 75, '請選擇卡牌？', {
            fontSize: '32px',
            color: '#fff',
        })
        messageText.setOrigin(0.5)
        // 添加 "是" 按鈕
        const yesButton = scene.add
            .text(200, 350, '是', { fontSize: '32px', color: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('是 按鈕被按下')
                // 添加更多處理邏輯
            })
        yesButton.setOrigin(0.5)
        // 添加 "否" 按鈕
        const noButton = scene.add
            .text(400, 350, '否', { fontSize: '32px', color: '#f00' })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('否 按鈕被按下')
                // 添加更多處理邏輯
            })
        noButton.setOrigin(0.5)
        // 創建一個容器來包含彈窗的所有組件
        const popupContainer = scene.add.container(100, 100, [
            background,
            messageText,
            yesButton,
            noButton,
        ])
        popupContainer.setSize(600, 400)
        popupContainer.setDepth(1000)
        popupContainer.setAlpha(0)
        popupContainer.setData('selectedCard', null)
        popupContainer.setData('cards', [])
        popupContainer.setData('selectedCards', [])
        popupContainer.setData('selectedCardIds', [])
        this.mainInstanceMap.selectCardModal = popupContainer
        this.mainInstanceMap.selectCardModal?.setData('cardInstance', [])
        return
    }
    useSelectCardModal = ({
        type = 'big',
        message = '提示訊息',
        handCardCount = 0,
        cardIds = [],
        delayScrolls = [],
        confirmText = '是',
        cancelText = '否',
        maxSelectionCount = 1,
        handleConfirm = (cardId: any) => {},
        handleCancel = () => {},
    }: {
        type?: 'big' | 'small'
        message?: string
        handCardCount?: number
        cardIds?: ThreeKingdomsCardIds[]
        delayScrolls?: ThreeKingdomsCardIds[]
        confirmText?: string
        cancelText?: string
        maxSelectionCount?: number
        handleConfirm?: (cardId: any) => void
        handleCancel?: () => void
    }) => {
        // 如果有handCardCount 產生同樣數量的手牌卡片 卡片小小的可以點就行
        for (let i = 0; i < handCardCount; i++) {
            const leftBase = 300 - (handCardCount - 1) * 60
            const r = this.scene.add.rectangle(leftBase + i * 120, 120, 100, 40, 0xffffff)
            const t = this.scene.add.text(leftBase + i * 120, 120, `手牌${i + 1}`, {
                fontSize: '20px',
                color: '#000',
            })
            t.setOrigin(0.5)
            const container = this.scene.add.container(0, 0, [r, t])
            container.setSize(100, 40)
            r.setInteractive().on('pointerdown', () => {
                console.log('選擇手牌', i)
                const preCard = this.mainInstanceMap.selectCardModal?.getData('selectedCard')
                const preCardId = this.mainInstanceMap.selectCardModal?.getData('selectedCardId')
                if (preCardId === `handCard-${i}`) {
                    this.scene.tweens.add({
                        targets: preCard,
                        x: preCard.x,
                        y: preCard.y + 20,
                        duration: 500, // 持續時間（毫秒）
                        ease: 'Power2',
                    })
                    this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
                    this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
                    return
                }
                //點擊後向上移動10px
                this.scene.tweens.add({
                    targets: container,
                    x: container.x,
                    y: container.y - 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
                // 判斷是裝備卡還是手牌卡
                if (preCard) {
                    if (preCardId?.includes('handCard')) {
                        this.scene.tweens.add({
                            targets: preCard,
                            x: preCard.x,
                            y: preCard.y + 20,
                            duration: 500, // 持續時間（毫秒）
                            ease: 'Power2',
                        })
                    } else {
                        this.scene.tweens.add({
                            targets: preCard.instance,
                            x: preCard.instance.x,
                            y: preCard.instance.y + 20,
                            duration: 500, // 持續時間（毫秒）
                            ease: 'Power2',
                        })
                        preCard.selected = false
                    }
                }
                this.mainInstanceMap.selectCardModal?.setData('selectedCard', container)
                this.mainInstanceMap.selectCardModal?.setData('selectedCardId', `handCard-${i}`)
            })
            this.mainInstanceMap.selectCardModal?.add(container)
            this.mainInstanceMap.selectCardModal?.getData('cardInstance').push(container)
        }
        if (type === 'small') {
            for (let i = 0; i < cardIds.length; i++) {
                const leftBase = 300 - (cardIds.length - 1) * 60
                const r = this.scene.add.rectangle(leftBase + i * 120, 200, 100, 40, 0xffffff)
                const name = threeKingdomsCards[cardIds[i]].name
                const t = this.scene.add.text(leftBase + i * 120, 200, `${name}`, {
                    fontSize: '20px',
                    color: '#000',
                })
                t.setOrigin(0.5)
                const container = this.scene.add.container(0, 0, [r, t])
                container.setSize(100, 40)
                r.setInteractive().on('pointerdown', () => {
                    const selectedCards = [
                        ...(this.mainInstanceMap.selectCardModal?.getData('selectedCards') || []),
                    ]
                    const selectedCardIds = [
                        ...(this.mainInstanceMap.selectCardModal?.getData('selectedCardIds') || []),
                    ] as ThreeKingdomsCardIds[]
                    const selectedIndex = selectedCardIds.indexOf(cardIds[i])
                    if (maxSelectionCount > 1) {
                        if (selectedIndex >= 0) {
                            this.scene.tweens.add({
                                targets: selectedCards[selectedIndex],
                                x: selectedCards[selectedIndex].x,
                                y: selectedCards[selectedIndex].y + 20,
                                duration: 500,
                                ease: 'Power2',
                            })
                            selectedCards.splice(selectedIndex, 1)
                            selectedCardIds.splice(selectedIndex, 1)
                        } else {
                            if (selectedCardIds.length >= maxSelectionCount) return
                            this.scene.tweens.add({
                                targets: container,
                                x: container.x,
                                y: container.y - 20,
                                duration: 500,
                                ease: 'Power2',
                            })
                            selectedCards.push(container)
                            selectedCardIds.push(cardIds[i])
                        }
                        this.mainInstanceMap.selectCardModal?.setData(
                            'selectedCards',
                            selectedCards,
                        )
                        this.mainInstanceMap.selectCardModal?.setData(
                            'selectedCardIds',
                            selectedCardIds,
                        )
                        this.mainInstanceMap.selectCardModal?.setData(
                            'selectedCard',
                            selectedCards[0] || null,
                        )
                        this.mainInstanceMap.selectCardModal?.setData(
                            'selectedCardId',
                            selectedCardIds[0] || null,
                        )
                        return
                    }
                    const preCard = this.mainInstanceMap.selectCardModal?.getData('selectedCard')
                    const preCardId =
                        this.mainInstanceMap.selectCardModal?.getData('selectedCardId')
                    if (preCardId === cardIds[i]) {
                        this.scene.tweens.add({
                            targets: preCard,
                            x: preCard.x,
                            y: preCard.y + 20,
                            duration: 500, // 持續時間（毫秒）
                            ease: 'Power2',
                        })
                        this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
                        this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
                        return
                    }
                    //點擊後向上移動10px
                    this.scene.tweens.add({
                        targets: container,
                        x: container.x,
                        y: container.y - 20,
                        duration: 500, // 持續時間（毫秒）
                        ease: 'Power2',
                    })
                    // 判斷是裝備卡還是手牌卡
                    if (preCard) {
                        if (preCardId?.includes('handCard')) {
                            this.scene.tweens.add({
                                targets: preCard,
                                x: preCard.x,
                                y: preCard.y + 20,
                                duration: 500, // 持續時間（毫秒）
                                ease: 'Power2',
                            })
                        } else {
                            this.scene.tweens.add({
                                targets: preCard.instance,
                                x: preCard.instance.x,
                                y: preCard.instance.y + 20,
                                duration: 500, // 持續時間（毫秒）
                                ease: 'Power2',
                            })
                            preCard.selected = false
                        }
                    }
                    this.mainInstanceMap.selectCardModal?.setData('selectedCard', container)
                    this.mainInstanceMap.selectCardModal?.setData('selectedCardId', cardIds[i])
                    this.mainInstanceMap.selectCardModal?.setData('selectedCards', [container])
                    this.mainInstanceMap.selectCardModal?.setData('selectedCardIds', [cardIds[i]])
                })
                this.mainInstanceMap.selectCardModal?.add(container)
                this.mainInstanceMap.selectCardModal?.getData('cardInstance').push(container)
            }
        } else {
            cardIds.forEach((cardId, index) => {
                const card = new Card({
                    cardId,
                    x: 240 + index * 120,
                    y: 200,
                    scene: this.scene,
                    playCardHandler: (card: Card) => {
                        // 卡片向上移動 10 px
                        if (card.selected) {
                            this.scene.tweens.add({
                                targets: card.instance,
                                x: card.instance.x,
                                y: card.instance.y + 20,
                                duration: 500, // 持續時間（毫秒）
                                ease: 'Power2',
                            })
                            card.selected = false
                            this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
                            this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
                        } else {
                            this.scene.tweens.add({
                                targets: card.instance,
                                x: card.instance.x,
                                y: card.instance.y - 20,
                                duration: 500, // 持續時間（毫秒）
                                ease: 'Power2',
                            })
                            card.selected = true
                            const preCard =
                                this.mainInstanceMap.selectCardModal?.getData('selectedCard')
                            if (preCard) {
                                this.scene.tweens.add({
                                    targets: preCard.instance,
                                    x: preCard.instance.x,
                                    y: preCard.instance.y + 20,
                                    duration: 500, // 持續時間（毫秒）
                                    ease: 'Power2',
                                })
                                preCard.selected = false
                            }
                            this.mainInstanceMap.selectCardModal?.setData('selectedCard', card)
                            this.mainInstanceMap.selectCardModal?.setData('selectedCardId', card.id)
                        }
                    },
                })
                this.mainInstanceMap.selectCardModal?.add(card.instance)
                this.mainInstanceMap.selectCardModal?.getData('cards').push(card)
            })
        }
        for (let i = 0; i < delayScrolls.length; i++) {
            const leftBase = 300 - (delayScrolls.length - 1) * 60
            const r = this.scene.add.rectangle(leftBase + i * 120, 280, 100, 40, 0xffffff)
            const name = threeKingdomsCards[delayScrolls[i]].name
            const t = this.scene.add.text(leftBase + i * 120, 280, `${name}`, {
                fontSize: '20px',
                color: '#000',
            })
            t.setOrigin(0.5)
            const container = this.scene.add.container(0, 0, [r, t])
            container.setSize(100, 40)
            r.setInteractive().on('pointerdown', () => {
                const preCard = this.mainInstanceMap.selectCardModal?.getData('selectedCard')
                const preCardId = this.mainInstanceMap.selectCardModal?.getData('selectedCardId')
                if (preCardId === delayScrolls[i]) {
                    this.scene.tweens.add({
                        targets: preCard,
                        x: preCard.x,
                        y: preCard.y + 20,
                        duration: 500, // 持續時間（毫秒）
                        ease: 'Power2',
                    })
                    this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
                    this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
                    return
                }
                //點擊後向上移動10px
                this.scene.tweens.add({
                    targets: container,
                    x: container.x,
                    y: container.y - 20,
                    duration: 500, // 持續時間（毫秒）
                    ease: 'Power2',
                })
                // 判斷是裝備卡還是手牌卡
                if (preCard) {
                    if (preCardId?.includes('handCard')) {
                        this.scene.tweens.add({
                            targets: preCard,
                            x: preCard.x,
                            y: preCard.y + 20,
                            duration: 500, // 持續時間（毫秒）
                            ease: 'Power2',
                        })
                    } else {
                        this.scene.tweens.add({
                            targets: preCard.instance,
                            x: preCard.instance.x,
                            y: preCard.instance.y + 20,
                            duration: 500, // 持續時間（毫秒）
                            ease: 'Power2',
                        })
                        preCard.selected = false
                    }
                }
                this.mainInstanceMap.selectCardModal?.setData('selectedCard', container)
                this.mainInstanceMap.selectCardModal?.setData('selectedCardId', delayScrolls[i])
            })
            this.mainInstanceMap.selectCardModal?.add(container)
            this.mainInstanceMap.selectCardModal?.getData('cardInstance').push(container)
        }
        const modelText: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(1)
        modelText.setText(message)
        const yesButton: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(2)
        yesButton.setText(confirmText)
        const noButton: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(3)
        noButton.setText(cancelText)
        yesButton
            .setInteractive()
            .off('pointerdown')
            .on('pointerdown', () => {
                const card = this.mainInstanceMap.selectCardModal?.getData('selectedCard')
                const selectedCardId =
                    this.mainInstanceMap.selectCardModal?.getData('selectedCardId')
                if (maxSelectionCount > 1) {
                    const selectedCardIds =
                        this.mainInstanceMap.selectCardModal?.getData('selectedCardIds') || []
                    if (selectedCardIds.length !== maxSelectionCount) {
                        console.log(`請選擇 ${maxSelectionCount} 張卡牌`)
                        return
                    }
                    handleConfirm(selectedCardIds)
                } else {
                    if (!card) {
                        console.log('請選擇一張卡牌')
                        return
                    }
                    console.log(handleConfirm, 'handleConfirm')
                    handleConfirm(selectedCardId)
                }
                this.mainInstanceMap.selectCardModal?.setAlpha(0)
                this.mainInstanceMap.selectCardModal?.getData('cards').forEach((c: Card) => {
                    this.mainInstanceMap.selectCardModal?.remove(c.instance)
                    c.instance?.destroy()
                })
                this.mainInstanceMap.selectCardModal?.setData('cards', [])
                this.mainInstanceMap.selectCardModal
                    ?.getData('cardInstance')
                    .forEach((c: Phaser.GameObjects.Container) => {
                        this.mainInstanceMap.selectCardModal?.remove(c)
                        c.destroy()
                    })
                this.mainInstanceMap.selectCardModal?.setData('cardInstance', [])
                this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
                this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
                this.mainInstanceMap.selectCardModal?.setData('selectedCards', [])
                this.mainInstanceMap.selectCardModal?.setData('selectedCardIds', [])
            })
        noButton.setInteractive().off('pointerdown').on('pointerdown', handleCancel)
        this.mainInstanceMap.selectCardModal?.setAlpha(1)
    }
    closeSelectCardModal = () => {
        this.mainInstanceMap.selectCardModal?.setAlpha(0)
        this.mainInstanceMap.selectCardModal?.getData('cards').forEach((c: Card) => {
            this.mainInstanceMap.selectCardModal?.remove(c.instance)
            c.instance?.destroy()
        })
        this.mainInstanceMap.selectCardModal?.setData('cards', [])
        this.mainInstanceMap.selectCardModal
            ?.getData('cardInstance')
            .forEach((c: Phaser.GameObjects.Container) => {
                this.mainInstanceMap.selectCardModal?.remove(c)
                c.destroy()
            })
        this.mainInstanceMap.selectCardModal?.setData('cardInstance', [])
        this.mainInstanceMap.selectCardModal?.setData('selectedCard', null)
        this.mainInstanceMap.selectCardModal?.setData('selectedCardId', null)
        this.mainInstanceMap.selectCardModal?.setData('selectedCards', [])
        this.mainInstanceMap.selectCardModal?.setData('selectedCardIds', [])
    }
    handleSelectCard = (card: Card) => {
        if (this.selectedCard == card) {
            this.selectedCard = null
            // 卡片下移
            this.scene.tweens.add({
                targets: card.instance,
                x: card.instance.x,
                y: card.instance.y + 20,
                duration: 500, // 持續時間（毫秒）
                ease: 'Power2',
            })
            return
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
}
