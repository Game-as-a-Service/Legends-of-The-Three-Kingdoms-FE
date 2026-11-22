import type MainPlayer from '../classes/MainPlayer'
import type { ThreeKingdomsCardIds } from '../types'

export interface AskSkillEffectEvent {
    event: 'AskSkillEffectEvent'
    data?: {
        skillName?: string
        dataPlayerId?: string
        dataCardIds?: string[]
        options?: string[]
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

const handleLiuLi: SkillEffectHandler = (mainPlayer, event) => {
    const attackerId = event.data?.dataPlayerId
    const attackerName =
        mainPlayer.seats.find((player) => player.id === attackerId)?.general?.name || '攻擊者'
    const handCardIds = (mainPlayer.hand.cardIds as ThreeKingdomsCardIds[]).filter(Boolean)
    const candidates = mainPlayer.seats.filter(
        (player) =>
            player.hp > 0 &&
            player.id !== attackerId &&
            (mainPlayer.game?.canSnatch(mainPlayer, player) ?? false),
    )
    let responseSubmitted = false
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.closeSelectCardModal()
        mainPlayer.clearPlayerPick()
    }
    const submitResponse = (
        choice: 'ACCEPT' | 'SKIP',
        cardIds: string[] = [],
        targetPlayerId?: string,
    ) => {
        if (responseSubmitted) return
        responseSubmitted = true
        mainPlayer.game?.useSkillEffect('流離', choice, cardIds, targetPlayerId)
        finishResponse()
    }
    const skip = () => submitResponse('SKIP')

    if (handCardIds.length === 0 || candidates.length === 0) {
        mainPlayer.useConfirmModal({
            message: `${attackerName}對你使用殺，但你無法發動流離。`,
            confirmText: '略過',
            cancelText: '略過',
            handleConfirm: skip,
            handleCancel: skip,
        })
        return
    }

    mainPlayer.useConfirmModal({
        message: `${attackerName}對你使用殺，是否發動流離，棄一張手牌將殺轉移給距離 1 內的其他角色？`,
        confirmText: '發動流離',
        cancelText: '跳過',
        handleConfirm: () => {
            mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
            mainPlayer.useSelectCardModal({
                type: 'small',
                message: '選擇一張手牌棄置',
                cardIds: handCardIds,
                confirmText: '棄置',
                cancelText: '跳過',
                handleConfirm: (discardCardId) => {
                    mainPlayer.beginPlayerPick({
                        message: '流離：請選擇殺的轉移目標',
                        candidates,
                        onConfirm: (target) =>
                            submitResponse('ACCEPT', [String(discardCardId)], target.id),
                        onCancel: skip,
                    })
                },
                handleCancel: skip,
            })
        },
        handleCancel: skip,
    })
}

const handleYiJi: SkillEffectHandler = (mainPlayer) => {
    const candidates = mainPlayer.seats.filter((player) => player.hp > 0)
    let responseSubmitted = false
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.clearPlayerPick()
    }
    const submitResponse = (choice: 'ACCEPT' | 'GIVE' | 'SKIP', targetPlayerId?: string) => {
        if (responseSubmitted) return
        responseSubmitted = true
        mainPlayer.game?.useSkillEffect('遺計', choice, [], targetPlayerId)
        finishResponse()
    }
    const skip = () => submitResponse('SKIP')

    mainPlayer.useConfirmModal({
        message: '是否發動遺計？',
        confirmText: '發動遺計',
        cancelText: '跳過',
        handleConfirm: () => {
            mainPlayer.useConfirmModal({
                message: '遺計：請選擇效果',
                confirmText: '自己摸 2 張牌',
                cancelText: candidates.length > 0 ? '令他人獲得 1 張牌' : '跳過',
                handleConfirm: () => submitResponse('ACCEPT'),
                handleCancel: () => {
                    if (candidates.length === 0) {
                        skip()
                        return
                    }
                    mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
                    mainPlayer.beginPlayerPick({
                        message: '遺計：請選擇獲得 1 張牌的角色',
                        candidates,
                        onConfirm: (target) => submitResponse('GIVE', target.id),
                        onCancel: skip,
                    })
                },
            })
        },
        handleCancel: skip,
    })
}

// 突襲（張遼，摸牌階段）：可放棄摸牌，改為獲得至多兩名其他角色的各一張手牌
const handleTuXi: SkillEffectHandler = (mainPlayer) => {
    const candidates = mainPlayer.seats.filter((player) => player.hp > 0 && player.hand.size > 0)
    let responseSubmitted = false
    const finishResponse = () => {
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.clearPlayerPick()
    }
    const submitResponse = (choice: 'ACCEPT' | 'SKIP', targetPlayerIds: string[] = []) => {
        if (responseSubmitted) return
        responseSubmitted = true
        mainPlayer.game?.useSkillEffect('突襲', choice, targetPlayerIds)
        finishResponse()
    }
    const skip = () => submitResponse('SKIP')

    mainPlayer.useConfirmModal({
        message: '是否發動突襲？放棄摸牌，改為獲得至多兩名其他角色的各一張手牌。',
        confirmText: '發動突襲',
        cancelText: '照常摸牌',
        handleConfirm: () => {
            if (candidates.length === 0) {
                skip()
                return
            }
            mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
            mainPlayer.beginPlayerPick({
                message: '突襲：請選擇 1～2 名有手牌的角色，再按確定',
                candidates,
                maxSelections: 2,
                onConfirmMany: (targets) => submitResponse('ACCEPT', targets.map((target) => target.id)),
                onCancel: skip,
            })
        },
        handleCancel: skip,
    })
}

const handleFanJian: SkillEffectHandler = (mainPlayer, event) => {
    const zhouYu = [...mainPlayer.seats, mainPlayer].find(
        (player) => player.id === event.data?.dataPlayerId,
    )
    const zhouYuName = zhouYu?.general?.name || event.data?.dataPlayerId || '周瑜'
    let responseSubmitted = false
    mainPlayer.useSuitModal({
        message: `${zhouYuName}發動反間，請選擇一個花色。\n猜錯將受到 1 點傷害。`,
        handleConfirm: (suit) => {
            if (responseSubmitted) return
            responseSubmitted = true
            mainPlayer.game?.useSkillEffect('反間', suit)
            mainPlayer.event = ''
            mainPlayer.eventData = null
            mainPlayer.mainInstanceMap.suitModal?.setAlpha(0)
        },
    })
}

// 觀星：諸葛亮回合開始（準備階段、判定之前）由後端詢問，dataCardIds = 所觀看的牌（第一張 = 牌堆頂），
// options = ['ARRANGE', 'SKIP']。ARRANGE 帶回堆頂順序（先點者在最上，未選者置牌堆底；不選任何牌 = 全置底），
// SKIP = 不發動（牌堆不變）。回應後後端接續判定 → 摸牌。
const handleGuanXing: SkillEffectHandler = (mainPlayer, event) => {
    const viewedCardIds = (event.data?.dataCardIds || [])
        .filter(Boolean)
        .map((cardId) => cardId as ThreeKingdomsCardIds)
    const canSkip = (event.data?.options || ['ARRANGE', 'SKIP']).includes('SKIP')
    let responseSubmitted = false
    const submit = (choice: 'ARRANGE' | 'SKIP', cardIds: string[] = []) => {
        if (responseSubmitted) return
        responseSubmitted = true
        mainPlayer.game?.useSkillEffect('觀星', choice, cardIds)
        mainPlayer.event = ''
        mainPlayer.eventData = null
        mainPlayer.mainInstanceMap.confirmModal?.setAlpha(0)
        mainPlayer.closeSelectCardModal()
    }

    if (viewedCardIds.length === 0) {
        submit(canSkip ? 'SKIP' : 'ARRANGE')
        return
    }

    mainPlayer.useSelectCardModal({
        type: 'small',
        message:
            '觀星（回合開始）：依序點選放回牌堆頂的牌（先點者在最上方），未選的牌將置於牌堆底；不選任何牌即全置牌堆底',
        cardIds: viewedCardIds,
        confirmText: '確認排列',
        cancelText: canSkip ? '不發動' : '全置牌堆底',
        maxSelectionCount: viewedCardIds.length,
        minSelectionCount: 0,
        handleConfirm: (selectedCardIds) => {
            const cardIds = Array.isArray(selectedCardIds)
                ? selectedCardIds.filter(Boolean).map(String)
                : [String(selectedCardIds)]
            submit('ARRANGE', cardIds)
        },
        handleCancel: () => (canSkip ? submit('SKIP') : submit('ARRANGE', [])),
    })
}

const skillEffectHandlers: Record<string, SkillEffectHandler> = {
    反饋: handleFanKui,
    鬼才: handleGuiCai,
    護駕: handleHuJia,
    洛神: handleLuoShen,
    裸衣: handleLuoYi,
    剛烈: handleGangLie,
    遺計: handleYiJi,
    流離: handleLiuLi,
    反間: handleFanJian,
    突襲: handleTuXi,
    觀星: handleGuanXing,
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
