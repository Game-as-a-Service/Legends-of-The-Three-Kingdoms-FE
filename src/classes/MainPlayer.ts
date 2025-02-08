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
    seats: Player[] = []
    gamePlayCardHandler: any = () => {}
    discardMode: boolean = false
    reactionMode: boolean = false
    reactionType: string = ''
    discardCount: number = 0
    discardCards: Card[] = []
    discardCardsAction: ([]) => void = ([]) => {}
    mainInstanceMap: { [key: string]: Phaser.GameObjects.Container } = {}
    event: string = ''
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
        // // 創建一個白色的矩形
        // const rectangle = scene.add.rectangle(0, 0, 200, 200, 0xffffff)
        // // 創建文字
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
            this.gamePlayCardHandler({}, this.reactionType)
            this.reactionType = ''
            if (this.skipInstance) this.skipInstance.setAlpha(0)
            if (this.hintInstance) this.hintInstance.setAlpha(0)
            if (this.event === 'AskKillEvent') {
                this.handCards.forEach((card) => {
                    card.instance.setAlpha(1)
                })
                this.event = ''
            }
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
        // 非自己回合不能出牌
        if (this.game!.getActivePlayer() !== this.id) {
            return
        }
        /// event check
        if (this.event === 'AskKillEvent') {
            if (card.name !== '殺') {
                return
            } else {
                this.handCards.forEach((card) => {
                    card.instance.setAlpha(1)
                })
                // 出玩牌後清空event
                this.event = ''
            }
        }
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
        if (this.reactionType) {
            // 對應出桃
            this.gamePlayCardHandler(card, this.reactionType)
            this.reactionType = ''
            this.reactionMode = false
            this.skipInstance?.setAlpha(0)
            this.hintInstance?.setAlpha(0)
            card.playCard()
            return
        }
        if (
            card.name === '殺' ||
            card.name === '過河拆橋' ||
            card.name === '決鬥' ||
            card.name === '樂不思蜀'
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
            if (cardInfo.type === 'scroll') {
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
    askReaction = (reactionType: string, event?: any) => {
        console.log('askReaction', reactionType)
        // 八卦陣與出閃的處理
        if (this.reactionType === 'askDodge' && reactionType === 'askPlayEquipmentEffect') {
            // 先隱藏出閃的提示
            this.hintInstance?.setAlpha(0)
            this.skipInstance?.setAlpha(0)
        }
        this.reactionType = reactionType
        this.reactionMode = true

        if (reactionType === 'askDodge') {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText('請出一張閃')
            this.hintInstance?.setAlpha(1)
            this.skipInstance?.setAlpha(1)
        } else if (reactionType === 'askPeach') {
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText('請出一張桃')
            this.hintInstance?.setAlpha(1)
            this.skipInstance?.setAlpha(1)
        } else if (reactionType === 'askPlayEquipmentEffect') {
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
        } else if (reactionType === 'AskChooseMountCardEvent') {
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
        } else if (reactionType === 'askKill') {
            this.event = 'AskKillEvent'
            const hintText: Phaser.GameObjects.Text = this.hintInstance.getAt(0)
            hintText?.setText('請出一張殺')
            this.hintInstance?.setAlpha(1)
            this.skipInstance?.setAlpha(1)
            // 只能出殺 其他不能出
            this.handCards.forEach((card) => {
                if (card.name !== '殺') {
                    card.instance.setAlpha(0.3)
                }
            })
        } else if (reactionType === 'useDismantleEffect') {
            const player: Player = event.targetPlayer
            console.log('useDismantleEffect', player)
            this.useSelectCardModal({
                type: 'small',
                message: '請選擇要拆的卡',
                handCardCount: player.hand.size,
                cardIds: player.equipments.filter((cardId) => cardId),
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
                },
                handleCancel: () => {
                    console.log('取消')
                    this.reactionType = ''
                },
            })
        }
    }
    updatePlayerData(data: any): void {
        super.updatePlayerData(data)
        if (data.hand.cardIds.join() !== this.hand.cardIds.join()) {
            // 保留相同的卡片 只處理不同的卡片
            console.log('updatePlayerData', data.hand.cardIds.join(), this.hand.cardIds.join())
            this.hand.size = data.hand.size
            this.hand.cardIds = data.hand.cardIds
            // 從第一張開始檢查手牌與當前手牌是否相同，找到不同處之後 刪除後面的卡片 並新增新的卡片
            const diffIndex = this.handCards.findIndex(
                (card, i) => card.id !== data.hand.cardIds[i],
            )
            console.log('diffIndex', diffIndex)
            if (diffIndex === -1) {
                // 沒有要刪除的卡片
                for (let i = this.handCards.length; i < data.hand.cardIds.length; i++) {
                    this.addHandCard(data.hand.cardIds[i])
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
        yesButton.setInteractive().on('pointerdown', handleConfirm)
        noButton.setInteractive().on('pointerdown', handleCancel)
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
        console.log('是 按鈕被按下')
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
                this.handleCheckClick()
            })
        yesButton.setOrigin(0.5)
        // 添加 "否" 按鈕
        const noButton = scene.add
            .text(150, 30, '取消', { fontSize: '32px', color: '#f00' })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('否 按鈕被按下')
                // 添加更多處理邏輯
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
        this.mainInstanceMap.selectCardModal = popupContainer
        this.mainInstanceMap.selectCardModal?.setData('cardInstance', [])
        return
    }
    useSelectCardModal = ({
        type = 'big',
        message = '提示訊息',
        handCardCount = 0,
        cardIds = [],
        confirmText = '是',
        cancelText = '否',
        handleConfirm = (cardId) => {},
        handleCancel = () => {},
    }: {
        type?: 'big' | 'small'
        message?: string
        handCardCount?: number
        cardIds?: ThreeKingdomsCardIds[]
        confirmText?: string
        cancelText?: string
        handleConfirm?: (cardId: ThreeKingdomsCardIds) => void
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
        const modelText: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(1)
        modelText.setText(message)
        const yesButton: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(2)
        yesButton.setText(confirmText)
        const noButton: Phaser.GameObjects.Text = this.mainInstanceMap.selectCardModal?.getAt(3)
        noButton.setText(cancelText)
        yesButton.setInteractive().on('pointerdown', () => {
            const card = this.mainInstanceMap.selectCardModal?.getData('selectedCard')
            const selectedCardId = this.mainInstanceMap.selectCardModal?.getData('selectedCardId')
            if (!card) {
                console.log('請選擇一張卡牌')
                return
            }
            handleConfirm(selectedCardId)
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
        })
        noButton.setInteractive().on('pointerdown', handleCancel)
        this.mainInstanceMap.selectCardModal?.setAlpha(1)
    }
}
