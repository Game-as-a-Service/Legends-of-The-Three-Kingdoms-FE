// 轉化技（武聖 / 龍膽 / 奇襲 / 國色 / 傾國）：後端的 PlayCardEvent 帶的是真實來源牌 id，
// 直接顯示會變成「趙雲 對 甘寧 使用 閃」。同一批事件裡若有對應的轉化技 SkillEffectEvent，
// 改顯示成轉化後的牌並註明來源，例「殺（龍膽：閃）」。

const CONVERSION_SKILLS: Record<string, (sourceName: string) => string> = {
    武聖: () => '殺',
    龍膽: (sourceName) => (sourceName === '閃' ? '殺' : '閃'),
    奇襲: () => '過河拆橋',
    國色: () => '樂不思蜀',
    傾國: () => '閃',
}

interface BatchEvent {
    event?: string
    data?: any
}

/**
 * 回傳 PlayCardEvent 要顯示的牌名：有對應的轉化技事件 →「轉化後牌名（技能：來源牌名）」，否則原牌名。
 */
export const playedCardLabel = (
    events: BatchEvent[],
    playerId: string,
    cardId: string,
    sourceName: string,
): string => {
    const conversion = events.find(
        (e) =>
            e?.event === 'SkillEffectEvent' &&
            CONVERSION_SKILLS[e.data?.skillName] &&
            e.data?.accepted !== false &&
            e.data?.playerId === playerId &&
            Array.isArray(e.data?.dataCardIds) &&
            e.data.dataCardIds.includes(cardId),
    )
    if (!conversion) return sourceName
    const skillName = conversion.data.skillName
    return `${CONVERSION_SKILLS[skillName](sourceName)}（${skillName}：${sourceName}）`
}
