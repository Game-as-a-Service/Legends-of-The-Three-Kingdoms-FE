<script setup>
import Phaser from 'phaser'
// 引入音效檔
import peachAudio from '~/assets/peach.mp3'
import killAudio from '~/assets/kill.mp3'
import dodgeAudio from '~/assets/dodge.mp3'
import dismantleAudio from '~/assets/dismantle.mp3'
import barbarianInvasionAudio from '~/assets/barbarianInvasion.mp3'
import somethingForNothingAudio from '~/assets/somethingForNothing.mp3'
import arrowBarrageAudio from '~/assets/arrowBarrage.mp3'
import qilinBowAudio from '~/assets/qilinBow.mp3'
import chuKoNuAudio from '~/assets/chuKoNu.mp3'
import eightDiagramFormationAudio from '~/assets/eightDiagramFormation.mp3'
import redHareAudio from '~/assets/redHare.mp3'
import shadowrunnerAudio from '~/assets/shadowrunner.mp3'
import { Card, Game, BattleScene } from '~/src/classes'
import threeKingdomsCards from '~/assets/cards.json'
import { atkLine } from '~/src/utils/drawing'
import { Client } from '@stomp/stompjs'
// import api from '~/src/utils/api'
import generalCards from '~/assets/generalCards.json'
// import BattleScene from '~/src/classes'
const api = useApi()
const runtimeConfig = useRuntimeConfig()
console.log(runtimeConfig, 'runtimeConfig')
const roleText = {
    MONARCH: '主公',
    REBEL: '反賊',
    MINISTER: '忠臣',
    TRAITOR: '內奸',
}
const game = ref(null)
const myCards = ref([
    'BHK039',
    'BH4030',
    'BS8008',
    'SHQ051',
    'SS7007',
    'SH7046',
    'SHA040',
    'SCQ064',
])
const myGameData = ref({})
const myGame = ref(null)
const myScene = ref(null)
const eventSelectedPlayer = ref('曹操')
const eventTargetPlayer = ref('曹操')
const eventSelectedCard = ref('閃')
const players = ref([])

const playerIds = ['Scolley', 'Happypola', 'YangJun', 'Tux']
const playerId = ref(null)
const gameId = ref('my-id')
const chooseGeneralCards = ref([])
const chooseGeneralCard = ref(null)
let socketClient = null
const isConnected = ref(false)
const seats = ref([])
const messages = ref([])
const gameProcess = ref('')
const me = computed(() => {
    return seats.value.find((seat) => seat.id === playerId.value)
})
const playerIdToGeneralName = (playerId) => {
    return generalCards[players.value.find((seat) => seat.id === playerId).generalId].name
}
const demo = ref(false)
const startGameFlag = ref(false)
const round = ref({})
const cardNames = Object.values(threeKingdomsCards).map((card) => card.name)
const uniqeCardNames = [...new Set(cardNames)]
const initDemo = () => {
    const defaultCards = Object.entries(threeKingdomsCards)
        .filter(
            ([key, value], index) =>
                Object.entries(threeKingdomsCards).findIndex(
                    ([key2, value2]) => value2.name === value.name,
                ) === index,
        )
        .map(([key, value]) => key)
    // .splice(0, 4)
    const gameData = {
        seats: [
            {
                id: 'Scolley',
                generalId: 'WU001',
                general: {
                    name: '孫權',
                },
                roleId: 'Monarch',
                hp: 5,
                hand: {
                    size: 4,
                    cardIds: [],
                },
                equipments: [],
                delayScrolls: [],
            },
            {
                id: 'Happypola',
                generalId: 'WEI001',
                general: {
                    name: '曹操',
                },
                roleId: '',
                hp: 4,
                hand: {
                    size: 4,
                    cardIds: [],
                },
                equipments: [],
                delayScrolls: [],
            },
            {
                id: 'YangJun',
                generalId: 'SHU001',
                general: {
                    name: '劉備',
                },
                roleId: '',
                hp: 4,
                hand: {
                    size: 4,
                    cardIds: [],
                },
                equipments: [],
                delayScrolls: [],
            },
        ],
        me: {
            id: 'Tux',
            generalId: 'WEI002',
            general: {
                name: '司馬懿',
            },
            roleId: 'Rebel',
            hp: 3,
            hand: {
                size: 4,
                cardIds: defaultCards,
            },
            equipments: [],
            delayScrolls: [],
        },
        round: {
            roundPhase: '',
            currentRoundPlayer: 'Tux',
            activePlayer: 'Tux',
            dyingPlayer: '',
            showKill: false,
        },
    }
    demo.value = true
    myGame.value = new Game(gameData, myScene.value, api)
    players.value = [...gameData.seats, gameData.me]
}
onMounted(() => {
    if (process.client) {
        const audios = {
            peach: peachAudio,
            kill: killAudio,
            dodge: dodgeAudio,
            dismantle: dismantleAudio,
            barbarianInvasion: barbarianInvasionAudio,
            somethingForNothing: somethingForNothingAudio,
            arrowBarrage: arrowBarrageAudio,
            qilinBow: qilinBowAudio,
            chuKoNu: chuKoNuAudio,
            eightDiagramFormation: eightDiagramFormationAudio,
            shadowrunner: shadowrunnerAudio,
            redHare: redHareAudio,
        }
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-game',
            audio: {
                disableWebAudio: true,
            },
            width: 800,
            height: 600,
            // scene: BattleScene,
            scene: [],
        }
        game.value = new Phaser.Game(config)
        game.value.scene.add('battleScene', BattleScene)
        game.value.scene.start('battleScene', { audios })
        game.value.events.on('ready', () => {
            // ready後把scene傳給myScene
            myScene.value = game.value.scene.scenes[0]
        })
        socketClient = new Client({
            // brokerURL: 'ws://localhost:8080/legendsOfTheThreeKingdoms',
            brokerURL:
                runtimeConfig.public.brokerUrl || 'wss://scolley31.com/legendsOfTheThreeKingdoms',
            // brokerURL: 'wss://scolley31.com/legendsOfTheThreeKingdoms',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        })
        socketClient.onConnect = (frame) => {
            isConnected.value = true
            console.log('Connected: ' + frame)
            socketClient.subscribe(
                `/websocket/legendsOfTheThreeKingdoms/${gameId.value}/${playerId.value}`,
                async (greeting) => {
                    const res = JSON.parse(greeting.body)
                    console.log('Get socket message: ', res)
                    // 大包的message不印出來
                    // messages.value.push(`${getTimeString()}: ${res.message}`)
                    if (messages.value.length > 10) {
                        messages.value.shift()
                    }
                    // showGreeting(greeting.body)
                    if (res.data && res.data.round) {
                        round.value = res.data.round
                    }

                    if (res.events) {
                        if (res.data) {
                            myGame.value.updateGameData(res.data)
                            ////**********/
                            const gameData = res.data
                            if (gameData.round) {
                                if (
                                    myGameData.value.round?.currentRoundPlayer !==
                                    gameData.round?.currentRoundPlayer
                                ) {
                                    // 顯示誰的回合
                                    const player = [...myGame.value.seats, myGame.value.me].find(
                                        (player) => player.id == gameData.round.currentRoundPlayer,
                                    )
                                    if (player) player.startTurn()
                                    // 關閉其他玩家的回合
                                    // debugger
                                    const endTurnPlayer = [
                                        ...myGame.value.seats,
                                        myGame.value.me,
                                    ].find(
                                        (player) =>
                                            player.id == myGameData.value.round?.currentRoundPlayer,
                                    )
                                    if (endTurnPlayer) endTurnPlayer.endTurn()
                                }
                            }
                            myGameData.value = gameData

                            // myGame.value.updatePlayerData(res.data.seats)
                        }
                        for (let i = 0; i < res.events.length; i++) {
                            const event = res.events[i]
                            let eventMessage = event.message
                            switch (event.event) {
                                case 'PlayCardEvent':
                                    const generalName = playerIdToGeneralName(event.data.playerId)
                                    // 處理不出牌的情況
                                    if (event.data.playType === 'skip') {
                                        eventMessage = `${generalName} 不出牌`
                                        break
                                    }
                                    const cardName = threeKingdomsCards[event.data.cardId].name
                                    // 有指定對象
                                    if (
                                        event.data.targetPlayerId &&
                                        event.data.targetPlayerId !== event.data.playerId
                                    ) {
                                        const targetGeneralName = playerIdToGeneralName(
                                            event.data.targetPlayerId,
                                        )
                                        eventMessage = `${generalName} 對 ${targetGeneralName} 使用 ${cardName}`
                                        break
                                    }
                                    // 自己使用
                                    eventMessage = `${generalName} 使出 ${cardName}`
                                    break
                                case 'GetGeneralCardEvent':
                                    break
                                case 'GetGeneralCardEventByOthers':
                                    break
                                case 'InitialEndViewModel':
                                    break
                                default:
                                    break
                            }
                            messages.value.push(`${getTimeString()}: ${eventMessage}`)
                            if (messages.value.length > 10) {
                                messages.value.shift()
                            }
                            await myGame.value.eventHandler(event)
                        }
                        return
                    }
                    if (res.event === 'createGameEvent') {
                        seats.value = res.data.seats
                        gameProcess.value = 'initial'
                        startGameFlag.value = true
                    } else if (
                        res.event === 'getGeneralCardEvent' ||
                        res.event === 'getGeneralCardEventByOthers'
                    ) {
                        chooseGeneralCards.value = res.data
                    } else if (res.event === 'initialEndViewModel') {
                        const findMeIndex = res.data.seats.findIndex(
                            (seat) => seat.id === playerId.value,
                        )
                        const mainPlayer = res.data.seats[findMeIndex]
                        const otherPlayers = [
                            ...res.data.seats.slice(findMeIndex + 1),
                            ...res.data.seats.slice(0, findMeIndex),
                        ]
                        myGame.value = new Game(
                            {
                                seats: otherPlayers,
                                me: mainPlayer,
                            },
                            myScene.value,
                            api,
                        )
                        // const generalIds = seats.value.map((seat) => seat.generalId)
                        // const generalNames = generalIds.map((id) => {
                        //     const card = Object.values(generalCards).find(
                        //         (value) => value.id === id,
                        //     )
                        //     return card.name
                        // })
                        // players.value = generalNames
                        players.value = res.data.seats
                        // console.log(players.value, 'seats')
                        const me = seats.value.find((seat) => seat.id === playerId.value)
                        // console.log(me, 'me')
                        // me.hand.cardIds.forEach((cardId) => {
                        //     console.log(cardId)
                        //     myGame.value.me.addHandCard(cardId)
                        // })
                        // myGame.value.me.arrangeCards()
                    } else {
                        if (myGame.value) {
                            myGame.value.eventHandler(res.event)
                        }
                    }
                },
            )
        }
    }
})
const hpMinus = (playerId) => {
    const player = myGame.value.seats.find((player) => player.id == playerId) || myGame.value.me
    player.hpChange(-1)
}
const getCards = () => {
    // 隨機從myCards中取出兩個
    if (eventSelectedPlayer.value !== 'Tux') {
        myGame.value.addHandCardsToPlayer(eventSelectedPlayer.value)
        return
    }
    const newCards = getRandomElements(myCards.value, 2)
    newCards.forEach((cardId) => {
        myGame.value.me.addHandCard(cardId)
    })
    myGame.value.me.arrangeCards()
}
function getRandomElements(array, count) {
    const shuffledArray = array.slice().sort(() => Math.random() - 0.5)
    return shuffledArray.slice(0, count)
}
const eventTrigger = () => {
    // console.log('eventTrigger', eventSelectedPlayer.value, eventSelectedCard.value)
    const player =
        myGame.value.seats.find((player) => player.id === eventSelectedPlayer.value) ||
        myGame.value.me
    if (
        eventSelectedCard.value === '閃' ||
        eventSelectedCard.value === '桃' ||
        eventSelectedCard.value === '無中生有'
    ) {
        const card = Object.values(threeKingdomsCards).find(
            (value) => value.name === eventSelectedCard.value,
        )
        const dodgeCard = new Card({
            cardId: card.id,
            x: player.instance.x,
            y: player.instance.y,
            scene: myScene.value,
            playCardHandler: myGame.value.playCardHandler,
        })
        dodgeCard.playCard()
        if (eventSelectedCard.value === '桃') {
            player.hpChange(1)
        }
        if (eventSelectedCard.value === '無中生有') {
            getCards()
        }
    } else if (
        eventSelectedCard.value === '殺' ||
        eventSelectedCard.value === '過河拆橋' ||
        eventSelectedCard.value === '決鬥'
    ) {
        const card = Object.values(threeKingdomsCards).find(
            (value) => value.name === eventSelectedCard.value,
        )
        const peachCard = new Card({
            cardId: card.id,
            x: player.instance.x,
            y: player.instance.y,
            scene: myScene.value,
            playCardHandler: myGame.value.playCardHandler,
        })
        peachCard.playCard()
        const startPoint = new Phaser.Math.Vector2(player.instance.x, player.instance.y)
        if (eventTargetPlayer.value === 'Tux') {
            atkLine({
                startPoint,
                endPoint: new Phaser.Math.Vector2(400, 515),
                scene: myScene.value,
            })
            return
        }
        const targetPlayer = myGame.value.seats.find(
            (player) => player.id === eventTargetPlayer.value,
        )
        atkLine({
            startPoint,
            endPoint: new Phaser.Math.Vector2(targetPlayer.instance.x, targetPlayer.instance.y),
            scene: myScene.value,
        })
    } else if (eventSelectedCard.value === '南蠻入侵') {
        const barbarianInvasionCard = new Card({
            cardId: 'SS7007',
            x: player.instance.x,
            y: player.instance.y,
            scene: myScene.value,
            playCardHandler: myGame.value.playCardHandler,
        })
        barbarianInvasionCard.playCard()
        const startPoint = new Phaser.Math.Vector2(player.instance.x, player.instance.y)
        myGame.value.seats
            .filter((p) => p !== player)
            .forEach((player) => {
                atkLine({
                    startPoint,
                    endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                    scene: myScene.value,
                })
            })
        atkLine({
            startPoint,
            endPoint: new Phaser.Math.Vector2(400, 515),
            scene: myScene.value,
        })
    } else if (eventSelectedCard.value === '萬箭齊發') {
        const arrowBarrageCard = new Card({
            cardId: 'SHA040',
            x: player.instance.x,
            y: player.instance.y,
            scene: myScene.value,
            playCardHandler: myGame.value.playCardHandler,
        })
        arrowBarrageCard.playCard()
        const startPoint = new Phaser.Math.Vector2(player.instance.x, player.instance.y)
        myGame.value.seats
            .filter((p) => p !== player)
            .forEach((player) => {
                atkLine({
                    startPoint,
                    endPoint: new Phaser.Math.Vector2(player.instance.x, player.instance.y),
                    scene: myScene.value,
                })
            })
        atkLine({
            startPoint,
            endPoint: new Phaser.Math.Vector2(400, 515),
            scene: myScene.value,
        })
    } else if (
        eventSelectedCard.value === '赤兔馬' ||
        eventSelectedCard.value === '絕影' ||
        eventSelectedCard.value === '八卦陣' ||
        eventSelectedCard.value === '麒麟弓' ||
        eventSelectedCard.value === '諸葛連弩'
    ) {
        const card = Object.values(threeKingdomsCards).find(
            (value) => value.name === eventSelectedCard.value,
        )
        const dodgeCard = new Card({
            cardId: card.id,
            x: player.instance.x,
            y: player.instance.y,
            scene: myScene.value,
            playCardHandler: myGame.value.playCardHandler,
        })
        dodgeCard.playCard()
        const equipments = [...player.equipments]
        if (card.name === '赤兔馬') {
            equipments[3] = card.id
        } else if (card.name === '絕影') {
            equipments[2] = card.id
        } else if (card.name === '八卦陣') {
            equipments[1] = card.id
        } else if (card.name === '諸葛連弩' || card.name === '麒麟弓') {
            equipments[0] = card.id
        }
        player.updatePlayerData({ hand: player.hand, equipments })
    }
    // const player = myGame.value.seats.find((player) => player.id === selectedPlayer.value)
    // console.log(player)
    // player.hpChange(-1)
}
const startTurn = () => {
    // myGame.value.makeTurn(eventSelectedPlayer.value)
    const player =
        myGame.value.seats.find((player) => player.id === eventSelectedPlayer.value) ||
        myGame.value.me
    player.startTurn()
    return
}
const endTurn = () => {
    // myGame.value.makeTurn(eventSelectedPlayer.value)
    const player =
        myGame.value.seats.find((player) => player.id === eventSelectedPlayer.value) ||
        myGame.value.me
    player.endTurn()
    return
}
const socketConnect = () => {
    socketClient.activate()
}
const playerConnect = (id) => {
    playerId.value = id
    socketClient.activate()
}
const createGame = async () => {
    const params = { gameId: gameId.value, players: playerIds }
    // const res = await api.post('/api/games', params)
    const res = await api.createGame(params)
    // console.log(res)
    startGameFlag.value = true
}
const monarchChooseGeneral = async (generalId) => {
    const params = { playerId: playerId.value, generalId }
    // const res = await api.post(`/api/games/${gameId.value}/player:monarchChooseGeneral`, params)
    const res = await api.monarchChooseGeneral(gameId.value, params)
    // console.log(res)
}
const selectGeneral = async (generalId) => {
    gameProcess.value = 'selectGeneralEnd'
    if (me.value.roleId === 'MONARCH') {
        monarchChooseGeneral(generalId)
        return
    }
    const params = { playerId: playerId.value, generalId }
    const res = await api.selectGeneral(gameId.value, params)
    // const res = await api.post(`/api/games/${gameId.value}/player:otherChooseGeneral`, params)
    // console.log(res)
}
const chooseGeneralCardsMap = computed(() => {
    return chooseGeneralCards.value.map((cardId) => {
        // const card = Object.values(generalCards).find((value) => value.id === cardId)
        const card = generalCards[cardId]
        return card
    })
})
const skipPlayCard = () => {
    myGame.value.skipPlayCard()
}
const finishAction = () => {
    myGame.value.finishAction()
}
const getTimeString = () => {
    const date = new Date()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    return `${hours}:${minutes}:${seconds}`
}
const discardCard = () => {
    myGame.value.me.askDiscardCards(2)
}
const handleShowSelectCardModal = () => {
    myGame.value.me.useSelectCardModal({
        message: '請選擇一匹馬',
        cardIds: ['ES5018', 'EH5044'],
        confirmText: '確定',
        cancelText: '取消',
        handleConfirm: (cardId) => {
            console.log('確定', cardId)
        },
        handleCancel: () => {
            console.log('取消')
        },
    })
}
</script>
<template>
    <div class="bg-black text-2xl">
        <div v-if="!demo">
            <div v-if="playerId" class="p-2 text-white">您好：{{ playerId }}</div>
            <div v-else>
                <label
                    for="countries"
                    class="mb-2 block text-2xl font-medium text-gray-900 dark:text-white"
                    >你是誰？</label
                >
                <div class="flex gap-2">
                    <button
                        v-for="id in playerIds"
                        @click="playerConnect(id)"
                        type="button"
                        class="rounded-lg bg-green-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                        {{ id }}
                    </button>
                    <button
                        @click="initDemo"
                        type="button"
                        class="rounded-lg bg-green-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                        ChenQQ(demo)
                    </button>
                </div>
            </div>
        </div>
        <div class="text-white">
            <div v-if="gameProcess === 'initial'">
                你的身份是：{{ roleText[me.roleId] }}，請選擇武將：
                <button
                    v-for="general in chooseGeneralCardsMap"
                    @click="selectGeneral(general.id)"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-blue-800"
                >
                    {{ general.name }}
                </button>
            </div>
        </div>
        <div class="flex">
            <div id="phaser-game" ref="phaser-game"></div>
            <div class="text-white">
                <div class="text-white" v-if="isConnected">已連線</div>
                <div class="text-white" v-else>未連線</div>
                <div class="p-2">
                    <div class="flex">
                        <button
                            v-if="isConnected && !startGameFlag"
                            @click="createGame"
                            type="button"
                            class="mb-2 me-2 rounded-lg bg-orange-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-900"
                        >
                            開始遊戲
                        </button>
                        <!-- <button
                            v-if="isConnected && startGameFlag"
                            @click="skipPlayCard"
                            type="button"
                            class="mb-2 me-2 rounded-lg bg-orange-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-900"
                        >
                            不出牌
                        </button> -->
                        <button
                            v-if="
                                isConnected &&
                                startGameFlag &&
                                round.currentRoundPlayer === playerId &&
                                round.activePlayer === playerId
                            "
                            @click="finishAction"
                            type="button"
                            class="mb-2 me-2 rounded-lg bg-orange-700 px-5 py-2.5 text-2xl font-medium text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-900"
                        >
                            結束回合
                        </button>
                    </div>
                </div>
                <div v-for="message in messages">
                    {{ message }}
                </div>
            </div>
        </div>

        <div v-if="demo" class="flex flex-col p-2">
            <div class="flex items-center">
                <template v-for="player in players">
                    <button
                        v-if="player.id === eventSelectedPlayer"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ player.general.name }}
                    </button>
                    <button
                        v-else
                        @click="eventSelectedPlayer = player.id"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ player.general.name }}
                    </button>
                </template>
            </div>
            <div class="flex">
                <template v-for="cardName in uniqeCardNames">
                    <button
                        v-if="cardName === eventSelectedCard"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ cardName }}
                    </button>
                    <button
                        v-else
                        @click="eventSelectedCard = cardName"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ cardName }}
                    </button>
                </template>
            </div>
            <div class="flex items-center">
                <template v-for="player in players">
                    <button
                        v-if="player.id === eventTargetPlayer"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ player.general.name }}
                    </button>
                    <button
                        v-else
                        @click="eventTargetPlayer = player.id"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ player.general.name }}
                    </button>
                </template>
            </div>
            <div class="flex">
                <button
                    @click="eventTrigger"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    出牌
                </button>
                <button
                    @click="hpMinus(eventSelectedPlayer)"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    扣血
                </button>
                <button
                    @click="getCards(eventSelectedPlayer)"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    抽牌
                </button>
                <button
                    @click="discardCard(eventSelectedPlayer)"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    棄牌
                </button>
                <button
                    @click="handleShowSelectCardModal"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    打開選馬彈窗
                </button>
                <button
                    @click="startTurn"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    回合開始
                </button>
                <button
                    @click="endTurn"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    回合結束
                </button>
            </div>
        </div>
    </div>
</template>
