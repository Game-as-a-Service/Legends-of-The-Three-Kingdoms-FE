import type MainPlayer from '../classes/MainPlayer'
import type { ThreeKingdomsCardIds } from '../types'

export interface AskSkillEffectEvent {
    event: 'AskSkillEffectEvent'
    data?: {
        skillName?: string
        dataPlayerId?: string
        dataCardIds?: string[]
    }
}

type SkillEffectHandler = (mainPlayer: MainPlayer, event: AskSkillEffectEvent) => void

const handleFanKui: SkillEffectHandler = (mainPlayer, event) => {
    const allPlayers = [...mainPlayer.seats, mainPlayer]
    const sourcePlayer = allPlayers.find((player) => player.id === event.data?.dataPlayerId)
    const sourcePlayerName = sourcePlayer?.general?.name || event.data?.dataPlayerId || '傷害來源'
    const sourceHandCardCount = sourcePlayer?.hand.size || 0
    const sourceEquipmentCardIds = ((event.data?.dataCardIds || []) as string[])
        .filter(Boolean)
        .map((cardId) => cardId as ThreeKingdomsCardIds)
    let responseSubmitted = false
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.closeSelectCardModal()
    }
    const submitResponse = (choice: 'ACCEPT' | 'SKIP', cardIds: string[] = []) => {
        if (responseSubmitted) return
        responseSubmitted = true
        mainPlayer.game?.useSkillEffect('反饋', choice, cardIds)
        finishResponse()
    }
    const skip = () => submitResponse('SKIP')

    if (sourceHandCardCount === 0 && sourceEquipmentCardIds.length === 0) {
        mainPlayer.useConfirmModal({
            message: `${sourcePlayerName}沒有可獲得的牌，無法發動反饋。`,
            confirmText: '略過',
            cancelText: '略過',
            handleConfirm: skip,
            handleCancel: skip,
        })
        return
    }

    mainPlayer.useConfirmModal({
        message: `是否發動反饋，獲得${sourcePlayerName}的一張牌？`,
        confirmText: '發動反饋',
        cancelText: '跳過',
        handleConfirm: () => {
            mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
            mainPlayer.useSelectCardModal({
                type: 'small',
                message: `選擇${sourcePlayerName}的一張牌`,
                handCardCount: sourceHandCardCount,
                cardIds: sourceEquipmentCardIds,
                confirmText: '獲得',
                cancelText: '跳過',
                handleConfirm: (cardId) => {
                    const selectedCardId = String(cardId)
                    const responseCardId = selectedCardId.startsWith('handCard-')
                        ? selectedCardId.slice('handCard-'.length)
                        : selectedCardId
                    submitResponse('ACCEPT', [responseCardId])
                },
                handleCancel: skip,
            })
        },
        handleCancel: skip,
    })
}

const handleGuiCai: SkillEffectHandler = (mainPlayer, event) => {
    const originalCardId = event.data?.dataCardIds?.[0] as ThreeKingdomsCardIds | undefined
    const originalCardName = originalCardId
        ? mainPlayer.formatCardLabel(originalCardId)
        : originalCardId || '目前的判定牌'
    const allPlayers = [...mainPlayer.seats, mainPlayer]
    const judgedPlayer = allPlayers.find((player) => player.id === event.data?.dataPlayerId)
    const judgedPlayerName = judgedPlayer?.general?.name || event.data?.dataPlayerId || '該角色'
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.closeSelectCardModal()
    }
    const skip = () => {
        mainPlayer.game?.useSkillEffect('鬼才', 'SKIP', [])
        finishResponse()
    }
    const handCardIds = mainPlayer.hand.cardIds as ThreeKingdomsCardIds[]

    if (handCardIds.length === 0) {
        mainPlayer.useConfirmModal({
            message: `${judgedPlayerName}的判定牌為${originalCardName}，你沒有手牌可發動鬼才。`,
            confirmText: '略過',
            cancelText: '略過',
            handleConfirm: skip,
            handleCancel: skip,
        })
        return
    }

    mainPlayer.useConfirmModal({
        message: `${judgedPlayerName}的判定牌為${originalCardName}，是否發動鬼才？`,
        confirmText: '發動鬼才',
        cancelText: '跳過',
        handleConfirm: () => {
            mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
            mainPlayer.useSelectCardModal({
                type: 'small',
                message: '選擇一張手牌替換判定牌',
                cardIds: handCardIds,
                confirmText: '替換',
                cancelText: '跳過',
                handleConfirm: (cardId) => {
                    mainPlayer.game?.useSkillEffect('鬼才', 'ACCEPT', [cardId])
                    finishResponse()
                },
                handleCancel: skip,
            })
        },
        handleCancel: skip,
    })
}

const handleHuJia: SkillEffectHandler = (mainPlayer) => {
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
    }
    mainPlayer.useConfirmModal({
        message: '是否發動護駕，請其他魏勢力武將代為出閃？',
        confirmText: '發動護駕',
        cancelText: '自己出閃',
        handleConfirm: () => {
            mainPlayer.game?.useSkillEffect('護駕', 'ACCEPT')
            finishResponse()
        },
        handleCancel: () => {
            mainPlayer.game?.useSkillEffect('護駕', 'SKIP')
            finishResponse()
        },
    })
}

const handleLuoShen: SkillEffectHandler = (mainPlayer) => {
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
    }
    mainPlayer.useConfirmModal({
        message: '是否發動洛神？（黑色牌將被收入手牌，紅色牌則停止判定）',
        confirmText: '發動洛神',
        cancelText: '不發動',
        handleConfirm: () => {
            mainPlayer.game?.useSkillEffect('洛神', 'ACCEPT')
            finishResponse()
        },
        handleCancel: () => {
            mainPlayer.game?.useSkillEffect('洛神', 'SKIP')
            finishResponse()
        },
    })
}

const handleLuoYi: SkillEffectHandler = (mainPlayer) => {
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
    }
    mainPlayer.useConfirmModal({
        message: '是否發動裸衣？少摸一張，本回合殺/決鬥傷害 +1。',
        confirmText: '發動裸衣',
        cancelText: '不發動',
        handleConfirm: () => {
            mainPlayer.game?.useSkillEffect('裸衣', 'ACCEPT')
            finishResponse()
        },
        handleCancel: () => {
            mainPlayer.game?.useSkillEffect('裸衣', 'SKIP')
            finishResponse()
        },
    })
}

const handleGangLie: SkillEffectHandler = (mainPlayer, event) => {
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.closeSelectCardModal()
    }
    const submitResponse = (
        choice: 'ACCEPT' | 'SKIP' | 'DISCARD' | 'DAMAGE',
        cardIds: string[] = [],
    ) => {
        mainPlayer.game?.useSkillEffect('剛烈', choice, cardIds)
        finishResponse()
    }

    const isSecondStage =
        Array.isArray(event.data?.dataCardIds) && event.data.dataCardIds.length > 0
    if (isSecondStage) {
        const handCardIds = (mainPlayer.hand.cardIds as string[]).filter(Boolean)
        const chooseDamageOnly = handCardIds.length < 2

        if (chooseDamageOnly) {
            mainPlayer.useConfirmModal({
                message: '判定結果非紅心，請選擇受 1 點傷害。',
                confirmText: '受 1 點傷害',
                cancelText: '取消',
                handleConfirm: () => submitResponse('DAMAGE', []),
                handleCancel: () => submitResponse('DAMAGE', []),
            })
            return
        }

        mainPlayer.useConfirmModal({
            message: '判定結果非紅心，請選擇：棄兩張手牌，或受到你造成的 1 點傷害。',
            confirmText: '棄兩張手牌',
            cancelText: '受 1 點傷害',
            handleConfirm: () => {
                mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
                mainPlayer.useSelectCardModal({
                    type: 'small',
                    message: '選擇兩張手牌棄置',
                    cardIds: handCardIds as any,
                    confirmText: '棄置',
                    cancelText: '取消',
                    maxSelectionCount: 2,
                    handleConfirm: (selectedCardIds) => {
                        const cardIdList = Array.isArray(selectedCardIds)
                            ? selectedCardIds.filter(Boolean)
                            : []
                        submitResponse('DISCARD', cardIdList)
                    },
                    handleCancel: () => {
                        submitResponse('DAMAGE', [])
                    },
                })
            },
            handleCancel: () => submitResponse('DAMAGE', []),
        })
        return
    }

    mainPlayer.useConfirmModal({
        message: '是否發動剛烈？抽牌判定，若非紅心則由攻擊方選擇棄兩張手牌或受 1 點傷害。',
        confirmText: '發動剛烈',
        cancelText: '不發動',
        handleConfirm: () => submitResponse('ACCEPT'),
        handleCancel: () => submitResponse('SKIP'),
    })
}

const skillEffectHandlers: Record<string, SkillEffectHandler> = {
    反饋: handleFanKui,
    鬼才: handleGuiCai,
    護駕: handleHuJia,
    洛神: handleLuoShen,
    裸衣: handleLuoYi,
    剛烈: handleGangLie,
}

export const handleAskSkillEffectEvent = (mainPlayer: MainPlayer, event: AskSkillEffectEvent) => {
    const skillName = event.data?.skillName
    const handler = skillName ? skillEffectHandlers[skillName] : undefined
    if (!handler) {
        console.warn('Unsupported skill effect:', skillName)
        return
    }
    handler(mainPlayer, event)
}
