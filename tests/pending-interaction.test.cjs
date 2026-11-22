const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const http = require('node:http')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const logs = []

class PlayerStub {
    constructor(options) {
        Object.assign(this, options)
    }
    createInstance() {}
    addHandCard() {}
    arrangeCards() {}
}

function loadModule(filename, imports = {}) {
    const source = fs.readFileSync(path.join(root, filename), 'utf8')
    const { outputText, diagnostics } = ts.transpileModule(source, {
        fileName: filename,
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
        },
        reportDiagnostics: true,
    })
    assert.equal(diagnostics.length, 0)
    const exports = {}
    vm.runInNewContext(
        outputText,
        {
            exports,
            console: { log() {}, warn() {} },
            Error,
            require(specifier) {
                if (Object.prototype.hasOwnProperty.call(imports, specifier)) {
                    return imports[specifier]
                }
                if (specifier === './index') {
                    return { Player: PlayerStub, MainPlayer: PlayerStub }
                }
                if (specifier.startsWith('~/assets/')) {
                    return JSON.parse(fs.readFileSync(path.join(root, specifier.slice(2)), 'utf8'))
                }
                if (specifier === '~/src/utils/domain') {
                    return {
                        roleMap: {},
                        suits: {
                            spade: { symbol: 'S', color: '#000' },
                            heart: { symbol: 'H', color: '#f00' },
                            diamond: { symbol: 'D', color: '#f00' },
                            club: { symbol: 'C', color: '#000' },
                        },
                        ranks: {},
                    }
                }
                if (specifier === '../utils/killDebug') {
                    return { killLog: (...args) => logs.push(args) }
                }
                if (specifier === '../utils/drawing') return { atkLine() {} }
                if (specifier === './Game') return { default: class {} }
                if (specifier === '../events/askSkillEffectEvent') {
                    return { handleAskSkillEffectEvent() {} }
                }
                throw new Error(`Unexpected import: ${specifier}`)
            },
        },
        { filename },
    )
    return exports
}

const MainPlayer = loadModule('src/classes/MainPlayer.ts').default
const Game = loadModule('src/classes/Game.ts').default

function modal() {
    return {
        alpha: 0,
        setAlpha(value) {
            this.alpha = value
            return this
        },
    }
}

function makePlayer(game = {}) {
    if (!game.clearStaleStateAfterResponse) game.clearStaleStateAfterResponse = () => {}
    const player = new MainPlayer({
        id: 'me',
        seats: [],
        game,
        hand: { size: 1, cardIds: ['SDA079'] },
        equipments: [],
    })
    player.mainInstanceMap = {
        confirmModal: modal(),
        selectCardModal: modal(),
        suitModal: modal(),
        checkModal: modal(),
    }
    player.useConfirmModal = (options) => {
        player.confirm = {
            handleConfirm() {},
            handleCancel() {},
            ...options,
        }
        player.mainInstanceMap.confirmModal.setAlpha(1)
    }
    player.useSelectCardModal = (options) => {
        player.selection = options
        player.mainInstanceMap.selectCardModal.setAlpha(1)
    }
    player.closeSelectCardModal = () => player.mainInstanceMap.selectCardModal.setAlpha(0)
    player.notices = []
    player.noticeTimers = []
    player.scene = {
        scale: { width: 1400 },
        add: {
            text: (x, y, message, style) => {
                const notice = {
                    x,
                    y,
                    message,
                    style,
                    destroyed: false,
                    setOrigin() {
                        return this
                    },
                    setDepth() {
                        return this
                    },
                    destroy() {
                        this.destroyed = true
                    },
                }
                player.notices.push(notice)
                return notice
            },
        },
        time: {
            delayedCall: (delay, callback) => player.noticeTimers.push({ delay, callback }),
        },
    }
    return player
}

function makeGame() {
    const text = { setOrigin() {} }
    const container = { setPosition() {}, setAlpha() {} }
    return new Game(
        { seats: [], me: { id: 'me', hand: { cardIds: [] } } },
        { add: { text: () => text, container: () => container } },
        {},
    )
}

function deferred() {
    let resolve
    let reject
    const promise = new Promise((yes, no) => {
        resolve = yes
        reject = no
    })
    return { promise, resolve, reject }
}

const flush = () => new Promise((resolve) => setImmediate(resolve))

const responseCases = [
    [
        'AskPlayEquipmentEffectEvent',
        'confirm',
        false,
        'useEquipmentEffect',
        ['a', 'other', 'equipmentActive'],
    ],
    [
        'AskPlayEquipmentEffectEvent',
        'cancel',
        false,
        'useEquipmentEffect',
        ['a', 'other', 'equipmentSkip'],
    ],
    ['AskActivateYinYangSwordsEvent', 'confirm', false, 'activateYinYangSwords', ['ACTIVATE']],
    ['AskActivateYinYangSwordsEvent', 'cancel', false, 'activateYinYangSwords', ['SKIP']],
    [
        'AskYinYangSwordsEffectEvent',
        'confirm',
        true,
        'useYinYangSwordsEffect',
        ['TARGET_DISCARDS', 'SDA079'],
    ],
    [
        'AskYinYangSwordsEffectEvent',
        'cancel',
        false,
        'useYinYangSwordsEffect',
        ['ATTACKER_DRAWS', ''],
    ],
    [
        'AskGreenDragonCrescentBladeEffectEvent',
        'confirm',
        true,
        'useGreenDragonCrescentBladeEffect',
        ['KILL', 'SDA079'],
    ],
    [
        'AskGreenDragonCrescentBladeEffectEvent',
        'cancel',
        false,
        'useGreenDragonCrescentBladeEffect',
        ['SKIP', ''],
    ],
    [
        'AskStonePiercingAxeEffectEvent',
        'confirm',
        true,
        'useStonePiercingAxeEffect',
        ['DISCARD_TWO', ['SDA079', 'a']],
    ],
    ['AskStonePiercingAxeEffectEvent', 'cancel', false, 'useStonePiercingAxeEffect', ['SKIP', []]],
    ['AskJianXiongEffectEvent', 'confirm', false, 'useJianXiongEffect', ['ACCEPT']],
    ['AskJianXiongEffectEvent', 'cancel', false, 'useJianXiongEffect', ['SKIP']],
]

for (const [eventName, choice, select, method, args] of responseCases) {
    test(`${eventName}/${choice}: retain pending state, block duplicates, clear on success`, async () => {
        const request = deferred()
        const calls = []
        const player = makePlayer({
            [method]: (...params) => {
                calls.push(params)
                return request.promise
            },
        })
        const event = {
            event: eventName,
            data: { equipmentCardId: 'a', targetPlayerIds: ['other'] },
        }
        player.processEvent(event)
        const initialHandler =
            player.confirm[choice === 'confirm' ? 'handleConfirm' : 'handleCancel']
        initialHandler()
        let submitHandler = initialHandler
        if (select) {
            submitHandler = player.selection.handleConfirm
            submitHandler(args[args.length - 1])
        }
        assert.equal(player.event, eventName)
        assert.equal(player.eventData, event.data)
        assert.ok(player.pendingEventResponse)
        assert.equal(player.mainInstanceMap.confirmModal.alpha, 1)
        player.confirm.handleCancel()
        submitHandler(args[args.length - 1])
        assert.equal(calls.length, 1)
        assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), args)
        player.clearStaleInteractionState()
        assert.equal(player.event, eventName)
        request.resolve({})
        await flush()
        assert.equal(player.event, '')
        assert.equal(player.eventData, null)
        assert.equal(player.pendingEventResponse, null)
        assert.equal(player.mainInstanceMap.confirmModal.alpha, 0)
    })
}

test('failure is logged and keeps context; returning to the question allows a successful retry', async () => {
    const first = deferred()
    let calls = 0
    const player = makePlayer({
        useJianXiongEffect: () => (++calls === 1 ? first.promise : Promise.resolve({})),
    })
    const event = { event: 'AskJianXiongEffectEvent', data: { sourceCardIds: ['a'] } }
    player.processEvent(event)
    player.confirm.handleConfirm()
    first.reject(new Error('Request failed with status code 500'))
    await flush()
    assert.equal(player.event, event.event)
    assert.equal(player.eventData, event.data)
    assert.equal(player.pendingEventResponse, null)
    assert.equal(player.mainInstanceMap.confirmModal.alpha, 1)
    assert.match(player.confirm.message, /500/)
    assert.ok(logs.some(([level, tag]) => level === 'error' && tag === '詢問回應送出失敗'))
    player.clearStaleInteractionState()
    assert.equal(player.event, event.event)
    player.confirm.handleConfirm()
    assert.equal(calls, 1)
    player.confirm.handleConfirm()
    await flush()
    assert.equal(calls, 2)
    assert.equal(player.event, '')
})

for (const outcome of ['resolve', 'reject']) {
    test(`late HTTP ${outcome} cannot overwrite a newer question or unlock its request`, async () => {
        const first = deferred()
        const second = deferred()
        let calls = 0
        const player = makePlayer({
            useJianXiongEffect: () => (++calls === 1 ? first.promise : second.promise),
        })
        const oldEvent = { event: 'AskJianXiongEffectEvent', data: { sourceCardIds: ['a'] } }
        const newEvent = { event: 'AskJianXiongEffectEvent', data: { sourceCardIds: ['b'] } }
        player.processEvent(oldEvent)
        const oldHandler = player.confirm.handleConfirm
        oldHandler()
        player.processEvent(newEvent)
        const newQuestion = player.confirm
        oldHandler()
        assert.equal(calls, 1)
        assert.equal(player.eventData, newEvent.data)
        assert.equal(player.pendingEventResponse, null)
        assert.equal(player.confirm, newQuestion)
        player.confirm.handleConfirm()
        const newResponse = player.pendingEventResponse
        first[outcome](outcome === 'reject' ? new Error('old failure') : {})
        await flush()
        assert.equal(player.eventData, newEvent.data)
        assert.equal(player.pendingEventResponse, newResponse)
        assert.equal(player.mainInstanceMap.confirmModal.alpha, 1)
        assert.equal(player.confirm.message, '正在送出回應，請稍候。')
        assert.equal(player.notices.length, outcome === 'reject' ? 1 : 0)
        if (outcome === 'reject') {
            assert.match(player.notices[0].message, /old failure/)
            assert.equal(player.noticeTimers[0].delay, 10_000)
            player.noticeTimers[0].callback()
            assert.equal(player.notices[0].destroyed, true)
        }
        second.resolve({})
        await flush()
        assert.equal(player.event, '')
        assert.equal(player.pendingEventResponse, null)
    })
}

test('synchronous submission errors also preserve and reopen the question', async () => {
    const player = makePlayer()
    const event = { event: 'AskJianXiongEffectEvent', data: {} }
    player.processEvent(event)
    await player.submitPendingEventResponse(event, () => {
        throw new Error('synchronous failure')
    })
    assert.equal(player.event, event.event)
    assert.match(player.confirm.message, /synchronous failure/)
    assert.equal(player.pendingEventResponse, null)
})

test('a new reactive question replaces the sending dialog before the old HTTP response', async () => {
    const request = deferred()
    const player = makePlayer({ useJianXiongEffect: () => request.promise })
    player.hintInstance = {
        setAlpha() {},
        getAt: () => ({ setText() {} }),
    }
    const event = { event: 'AskJianXiongEffectEvent', data: {} }
    player.processEvent(event)
    player.confirm.handleConfirm()
    const nextEvent = { event: 'AskDodgeEvent', data: { playerId: 'me' } }
    player.processEvent(nextEvent)
    assert.equal(player.mainInstanceMap.confirmModal.alpha, 0)
    assert.equal(player.mainInstanceMap.checkModal.alpha, 1)
    request.resolve({})
    await flush()
    assert.equal(player.event, 'AskDodgeEvent')
    assert.equal(player.eventData, nextEvent.data)
    assert.equal(player.mainInstanceMap.checkModal.alpha, 1)
})

for (const eventName of [
    'AskYinYangSwordsEffectEvent',
    'AskGreenDragonCrescentBladeEffectEvent',
    'AskStonePiercingAxeEffectEvent',
]) {
    test(`${eventName}: nested card-selection cancel returns to the question without submitting`, () => {
        const player = makePlayer()
        const event = { event: eventName, data: {} }
        player.processEvent(event)
        player.confirm.handleConfirm()
        player.selection.handleCancel()
        assert.equal(player.event, eventName)
        assert.equal(player.eventData, event.data)
        assert.equal(player.mainInstanceMap.selectCardModal.alpha, 0)
        assert.equal(player.mainInstanceMap.confirmModal.alpha, 1)
        assert.equal(player.pendingEventResponse, null)
    })
}

const receiverCases = [
    ['AskPlayEquipmentEffectEvent', 'playerId'],
    ['AskChooseMountCardEvent', 'chooseMountCardPlayerId'],
    ['AskActivateYinYangSwordsEvent', 'attackerPlayerId'],
    ['AskGreenDragonCrescentBladeEffectEvent', 'attackerPlayerId'],
    ['AskStonePiercingAxeEffectEvent', 'attackerPlayerId'],
    ['AskYinYangSwordsEffectEvent', 'targetPlayerId'],
    ['AskJianXiongEffectEvent', 'playerId'],
    ['AskSkillEffectEvent', 'playerId'],
    ['AskHuJiaEffectEvent', 'playerId'],
    ['AskPeachEvent', 'playerId'],
    ['AskKillEvent', 'playerId'],
    ['AskDodgeEvent', 'playerId'],
    ['BorrowedSwordEvent', 'borrowedPlayerId'],
    ['BountifulHarvestEvent', 'nextChoosingPlayerId'],
    ['NotifyDiscardEvent', 'discardPlayerId'],
]

for (const [eventName, receiverField] of receiverCases) {
    test(`${eventName}: dispatch and cleanup agree on the exact receiver`, async () => {
        const game = makeGame()
        const dispatched = []
        let discarded = 0
        let cleared = 0
        game.me.processEvent = (event) => dispatched.push(event)
        game.me.askDiscardCards = (count) => (discarded += count)
        game.me.clearStaleInteractionState = () => cleared++
        game.gameData.round = {
            roundPhase: 'Action',
            currentRoundPlayer: 'me',
            activePlayer: 'me',
        }
        const othersQuestion = {
            event: eventName,
            data: {
                [receiverField]: 'other',
                dataPlayerId: 'me',
                targetPlayerIds: ['me'],
                discardCount: 2,
            },
        }
        assert.equal(game.isEventAskingMe(othersQuestion), false)
        await game.eventHandler(othersQuestion)
        game.clearStaleStateOnMyActionPhase([othersQuestion])
        assert.equal(dispatched.length, 0)
        assert.equal(discarded, 0)
        assert.equal(cleared, 1)
        const myQuestion = {
            event: eventName,
            data: { [receiverField]: 'me', discardCount: 2 },
        }
        assert.equal(game.isEventAskingMe(myQuestion), true)
        await game.eventHandler(myQuestion)
        game.clearStaleStateOnMyActionPhase([myQuestion])
        assert.equal(cleared, 1)
        assert.equal(dispatched.length, eventName === 'NotifyDiscardEvent' ? 0 : 1)
        assert.equal(discarded, eventName === 'NotifyDiscardEvent' ? 2 : 0)
    })
}

test('ward is broadcast to all; unknown events and non-positive discards are not asks', async () => {
    const game = makeGame()
    let calls = 0
    game.me.processEvent = () => calls++
    const ward = { event: 'AskPlayWardEvent', data: {} }
    assert.equal(game.isEventAskingMe(ward), true)
    await game.eventHandler(ward)
    assert.equal(calls, 1)
    assert.equal(game.isEventAskingMe(null), false)
    assert.equal(
        game.isEventAskingMe({ event: 'AskUnknownEvent', data: { playerId: 'me' } }),
        false,
    )
    for (const discardCount of [0, -1, undefined, '2']) {
        assert.equal(
            game.isEventAskingMe({
                event: 'NotifyDiscardEvent',
                data: { discardPlayerId: 'me', discardCount },
            }),
            false,
        )
    }
})

test('all six response API wrappers return the original request promise', () => {
    const game = makeGame()
    const promise = Promise.resolve({})
    for (const [, , , method, args] of responseCases) {
        game.api[method] = () => promise
        assert.equal(game[method](...args), promise)
    }
})

test('cleanup preserves reactive asks, local selection modes, and visible modals', () => {
    for (const event of [
        'AskKillEvent',
        'BorrowedSwordEvent',
        'AskDodgeEvent',
        'AskPeachEvent',
        'AskPlayWardEvent',
        'BountifulHarvestEvent',
    ]) {
        const player = makePlayer()
        player.event = event
        player.clearStaleInteractionState()
        assert.equal(player.event, event)
    }
    for (const field of [
        'selectedCard',
        'guoSeMode',
        'longDanMode',
        'viperSpearMode',
        'heavenlyDoubleHalberdMode',
        'playerPick',
    ]) {
        const player = makePlayer()
        player.event = 'old'
        player[field] = true
        player.clearStaleInteractionState()
        assert.equal(player.event, 'old')
    }
    for (const key of ['confirmModal', 'selectCardModal', 'suitModal']) {
        const player = makePlayer()
        player.event = 'old'
        player.mainInstanceMap[key].setAlpha(1)
        player.clearStaleInteractionState()
        assert.equal(player.event, 'old')
    }
})

test('cleanup never runs on another turn, phase, or active responder', () => {
    const game = makeGame()
    let cleared = 0
    game.me.clearStaleInteractionState = () => cleared++
    const round = {
        roundPhase: 'Action',
        currentRoundPlayer: 'me',
        activePlayer: 'me',
    }
    for (const [key, value] of [
        ['roundPhase', 'Discard'],
        ['currentRoundPlayer', 'other'],
        ['activePlayer', 'other'],
    ]) {
        game.gameData.round = { ...round, [key]: value }
        game.clearStaleStateOnMyActionPhase([])
    }
    assert.equal(cleared, 0)
})

test('closed stale interactions clear event, reaction, and discard selections', () => {
    const player = makePlayer()
    player.getDebugSnapshot = () => ({})
    player.event = 'AskPlayEquipmentEffectEvent'
    player.eventData = {}
    player.reactionType = 'old'
    player.reactionMode = true
    player.clearStaleInteractionState()
    assert.equal(player.event, '')
    assert.equal(player.eventData, null)
    assert.equal(player.reactionType, '')
    assert.equal(player.reactionMode, false)

    player.discardMode = true
    player.discardCount = 2
    player.discardCards = ['a', 'b']
    const card = { selected: true, instance: { x: 0, y: 0 } }
    player.handCards = [card]
    const movements = []
    player.scene = { tweens: { add: (movement) => movements.push(movement) } }
    player.checkBtnInstance = modal()
    player.checkBtnInstance.setAlpha(1)
    player.hintInstance = modal()
    player.hintInstance.setAlpha(1)
    player.clearStaleInteractionState()
    assert.equal(player.discardMode, false)
    assert.equal(player.discardCount, 0)
    assert.equal(player.discardCards.length, 0)
    assert.equal(card.selected, false)
    assert.equal(movements[0].y, 20)
    assert.equal(player.checkBtnInstance.alpha, 0)
    assert.equal(player.hintInstance.alpha, 0)
})

for (const websocketFirst of [true, false]) {
    test(`HTTP success rechecks stale reactions when WebSocket arrives ${
        websocketFirst ? 'first' : 'later'
    }`, async () => {
        const game = makeGame()
        const request = deferred()
        game.useJianXiongEffect = () => request.promise
        const player = makePlayer(game)
        player.getDebugSnapshot = () => ({})
        game.me = player
        game.gameData.round = {
            roundPhase: 'Action',
            currentRoundPlayer: 'me',
            activePlayer: 'me',
        }
        const question = { event: 'AskJianXiongEffectEvent', data: { playerId: 'me' } }
        player.processEvent(question)
        game.clearStaleStateOnMyActionPhase([question])
        player.reactionType = 'old'
        player.reactionMode = true
        player.confirm.handleConfirm()
        const completedEvents = [{ event: 'JianXiongEffectEvent', data: {} }]
        if (websocketFirst) {
            game.clearStaleStateOnMyActionPhase(completedEvents)
            assert.equal(player.reactionMode, true)
        }
        request.resolve({})
        await flush()
        if (!websocketFirst) game.clearStaleStateOnMyActionPhase(completedEvents)
        assert.equal(player.event, '')
        assert.equal(player.pendingEventResponse, null)
        assert.equal(player.reactionType, '')
        assert.equal(player.reactionMode, false)
    })
}

test('successful HTTP response does not clear a new forced discard request in the latest batch', async () => {
    const game = makeGame()
    const request = deferred()
    game.useJianXiongEffect = () => request.promise
    const player = makePlayer(game)
    game.me = player
    game.gameData.round = {
        roundPhase: 'Action',
        currentRoundPlayer: 'me',
        activePlayer: 'me',
    }
    player.processEvent({ event: 'AskJianXiongEffectEvent', data: { playerId: 'me' } })
    player.confirm.handleConfirm()
    player.discardMode = true
    player.discardCount = 2
    game.clearStaleStateOnMyActionPhase([
        { event: 'NotifyDiscardEvent', data: { discardPlayerId: 'me', discardCount: 2 } },
    ])
    request.resolve({})
    await flush()
    assert.equal(player.discardMode, true)
    assert.equal(player.discardCount, 2)
})

test('unknown Ask events block cleanup without guessed routing; known unrelated asks still allow cleanup', async () => {
    const game = makeGame()
    let cleared = 0
    let dispatched = 0
    game.me.clearStaleInteractionState = () => cleared++
    game.me.processEvent = () => dispatched++
    game.gameData.round = {
        roundPhase: 'Action',
        currentRoundPlayer: 'me',
        activePlayer: 'me',
    }
    const unknown = { event: 'AskNewEffectEvent', data: { sourcePlayerId: 'me' } }
    assert.equal(game.isEventAskingMe(unknown), false)
    await game.eventHandler(unknown)
    game.clearStaleStateOnMyActionPhase([unknown])
    assert.equal(dispatched, 0)
    assert.equal(cleared, 0)
    assert.ok(
        logs.some(
            ([level, message]) => level === 'warn' && message === '未知詢問事件，暫停清理互動狀態',
        ),
    )
    game.clearStaleStateOnMyActionPhase([
        { event: 'AskSkillEffectEvent', data: { playerId: 'other', dataPlayerId: 'me' } },
    ])
    assert.equal(cleared, 1)
})

test('a superseded equipment response failure is visible without replacing the broadcast ward question', async () => {
    const request = deferred()
    const player = makePlayer({ useJianXiongEffect: () => request.promise })
    player.hintInstance = {
        setAlpha() {},
        getAt: () => ({ setText() {} }),
    }
    player.processEvent({ event: 'AskJianXiongEffectEvent', data: {} })
    player.confirm.handleConfirm()
    const ward = { event: 'AskPlayWardEvent', data: {} }
    player.processEvent(ward)
    request.reject(new Error('prior request failed'))
    await flush()
    assert.equal(player.event, ward.event)
    assert.equal(player.eventData, ward.data)
    assert.equal(player.mainInstanceMap.checkModal.alpha, 1)
    assert.equal(player.mainInstanceMap.confirmModal.alpha, 0)
    assert.match(player.notices[0].message, /prior request failed/)
})

test('all six guarded response endpoints explicitly configure a 15000ms timeout without changing other API calls', async () => {
    const calls = []
    const { useApi } = loadModule('composables/useApi.ts', {
        '#app': { useRuntimeConfig: () => ({ public: { apiBaseUrl: 'http://localhost' } }) },
        axios: {
            create: () => ({
                post: (...args) => {
                    calls.push(args)
                    return Promise.resolve({})
                },
            }),
        },
    })
    const api = useApi()
    const names = [...new Set(responseCases.map(([, , , method]) => method))]
    assert.equal(names.length, 6)
    for (const method of names) {
        await api[method]('game', {})
        assert.equal(calls[calls.length - 1][2].timeout, 15_000)
    }
    await api.playCard('game', {})
    assert.equal(calls[calls.length - 1][2], undefined)
})

test(
    'a non-responsive HTTP endpoint times out and restores the question instead of freezing indefinitely',
    { timeout: 30_000 },
    async () => {
        const sockets = new Set()
        const server = http.createServer(() => {})
        server.on('connection', (socket) => {
            sockets.add(socket)
            socket.on('close', () => sockets.delete(socket))
        })
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
        try {
            const { port } = server.address()
            const { useApi } = loadModule('composables/useApi.ts', {
                '#app': {
                    useRuntimeConfig: () => ({
                        public: { apiBaseUrl: `http://127.0.0.1:${port}` },
                    }),
                },
                axios: require('axios'),
            })
            const api = useApi()
            const player = makePlayer({
                useJianXiongEffect: () =>
                    api.useJianXiongEffect('game', { playerId: 'me', choice: 'ACCEPT' }),
            })
            const event = { event: 'AskJianXiongEffectEvent', data: {} }
            player.processEvent(event)
            const started = Date.now()
            await player.submitPendingEventResponse(event, (game) => game.useJianXiongEffect())
            assert.ok(Date.now() - started >= 14_500)
            assert.equal(player.event, event.event)
            assert.equal(player.eventData, event.data)
            assert.equal(player.pendingEventResponse, null)
            assert.equal(player.mainInstanceMap.confirmModal.alpha, 1)
            assert.match(player.confirm.message, /15000/)
        } finally {
            for (const socket of sockets) socket.destroy()
            await new Promise((resolve) => server.close(resolve))
        }
    },
)

const { playedCardLabel } = loadModule('src/utils/conversionCard.ts')

const conversionEvent = (skillName, playerId, cardId) => ({
    event: 'SkillEffectEvent',
    data: { skillName, playerId, accepted: true, dataCardIds: [cardId], dataPlayerId: null },
})

test('轉化技出牌 log 顯示轉化後的牌與來源（龍膽雙向、武聖、奇襲、國色、傾國）', () => {
    const cases = [
        ['龍膽', '閃', '殺（龍膽：閃）'],
        ['龍膽', '殺', '閃（龍膽：殺）'],
        ['武聖', '桃', '殺（武聖：桃）'],
        ['奇襲', '殺', '過河拆橋（奇襲：殺）'],
        ['國色', '閃', '樂不思蜀（國色：閃）'],
        ['傾國', '殺', '閃（傾國：殺）'],
    ]
    for (const [skillName, sourceName, expected] of cases) {
        const events = [conversionEvent(skillName, 'zhao', 'BH2028'), { event: 'PlayCardEvent' }]
        assert.equal(playedCardLabel(events, 'zhao', 'BH2028', sourceName), expected)
    }
})

test('沒有對應轉化技事件時照原牌名顯示', () => {
    assert.equal(playedCardLabel([{ event: 'PlayCardEvent' }], 'zhao', 'BH2028', '閃'), '閃')
    // 別張牌、別的玩家、非轉化技都不套用
    assert.equal(
        playedCardLabel([conversionEvent('龍膽', 'zhao', 'BS8008')], 'zhao', 'BH2028', '閃'),
        '閃',
    )
    assert.equal(
        playedCardLabel([conversionEvent('龍膽', 'other', 'BH2028')], 'zhao', 'BH2028', '閃'),
        '閃',
    )
    assert.equal(
        playedCardLabel([conversionEvent('制衡', 'zhao', 'BH2028')], 'zhao', 'BH2028', '閃'),
        '閃',
    )
})
