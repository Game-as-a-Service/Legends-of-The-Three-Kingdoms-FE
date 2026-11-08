// 出牌流程除錯：環形緩衝記錄最近的狀態，出問題時可在 console 執行 __killDebug.dump()
type KillLogLevel = 'info' | 'warn' | 'error'

interface KillLogEntry {
    time: string
    level: KillLogLevel
    tag: string
    data?: any
}

const MAX_ENTRIES = 100
const history: KillLogEntry[] = []

export const killLog = (level: KillLogLevel, tag: string, data?: any) => {
    const entry: KillLogEntry = { time: new Date().toISOString(), level, tag, data }
    history.push(entry)
    if (history.length > MAX_ENTRIES) history.shift()
    const logger = level === 'info' ? console.log : console[level]
    logger(`[KillDebug] ${tag}`, data ?? '')
}

if (typeof window !== 'undefined') {
    ;(window as any).__killDebug = {
        history,
        dump: () => {
            console.table(
                history.map((entry) => ({
                    time: entry.time,
                    level: entry.level,
                    tag: entry.tag,
                    data: JSON.stringify(entry.data),
                })),
            )
            return history
        },
    }
}
