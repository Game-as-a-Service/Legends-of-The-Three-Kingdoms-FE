<script setup>
import Phaser from 'phaser'
import peachAudio from '~/assets/peach.mp3'
import killAudio from '~/assets/kill.mp3'
import dodgeAudio from '~/assets/dodge.mp3'
import dismantleAudio from '~/assets/dismantle.mp3'
import barbarianInvasionAudio from '~/assets/barbarianInvasion.mp3'
import somethingForNothingAudio from '~/assets/somethingForNothing.mp3'
import arrowBarrageAudio from '~/assets/arrowBarrage.mp3'
import { Player, MainPlayer, Card, Game } from '~/src/classes'
import threeKingdomsCards from '~/assets/cards.json'
import { atkLine } from '~/src/utils/drawing'
class BattleTable extends Phaser.Scene {
    constructor() {
        super('BattleTable')
    }
    preload() {
        // 預加載
        this.load.audio('peach', peachAudio)
        this.load.audio('kill', killAudio)
        this.load.audio('dodge', dodgeAudio)
        this.load.audio('dismantle', dismantleAudio)
        this.load.audio('barbarianInvasion', barbarianInvasionAudio)
        this.load.audio('somethingForNothing', somethingForNothingAudio)
        this.load.audio('arrowBarrage', arrowBarrageAudio)
    }
    create() {
        myScene.value = this
        myGame.value = new Game(gameData.value, this)
    }
}
const game = ref(null)
const myCards = ref(['BH2028', 'BH3029', 'BHO036', 'SHQ051', 'SS7007', 'SH7046', 'SHA040'])
const gameData = ref({})
const myGame = ref(null)
const myScene = ref(null)
const eventSelectedPlayer = ref('曹操')
const eventTargetPlayer = ref('曹操')
const eventSelectedCard = ref('閃')
const players = ['曹操', '劉備', '孫權', '張角']
onMounted(() => {
    gameData.value = {
        seats: [
            {
                id: 'Scolley',
                generral: '曹操',
                role: '主公',
                hp: 5,
                hand: {
                    size: 4,
                    cards: [],
                },
                equipments: [],
                delayScrolls: [],
            },
            {
                id: 'Happypola',
                generral: '劉備',
                role: '?',
                hp: 4,
                hand: {
                    size: 4,
                    cards: [],
                },
                equipments: [],
                delayScrolls: [],
            },
            {
                id: 'YangJun',
                generral: '孫權',
                role: '?',
                hp: 4,
                hand: {
                    size: 4,
                    cards: [],
                },
                equipments: [],
                delayScrolls: [],
            },
        ],
        me: {
            id: 'Tux',
            generral: '張角',
            role: '反賊',
            hp: 3,
            hand: {
                size: 4,
                cards: [],
            },
            equipments: [],
            delayScrolls: [],
        },
    }
    if (process.client) {
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: 800,
            height: 600,
            scene: BattleTable,
        }
        game.value = new Phaser.Game(config)
    }
})
const hpMinus = (playerName) => {
    const player =
        myGame.value.seats.find((player) => player.generral == playerName) || myGame.value.me
    player.hpChange(-1)
}
const getCards = () => {
    // 隨機從myCards中取出兩個
    if (eventSelectedPlayer.value !== '張角') {
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
    console.log('eventTrigger', eventSelectedPlayer.value, eventSelectedCard.value)
    const player =
        myGame.value.seats.find((player) => player.generral === eventSelectedPlayer.value) ||
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
    } else if (eventSelectedCard.value === '殺' || eventSelectedCard.value === '過河拆橋') {
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
        if (eventTargetPlayer.value === '張角') {
            atkLine({
                startPoint,
                endPoint: new Phaser.Math.Vector2(400, 515),
                scene: myScene.value,
            })
            return
        }
        const targetPlayer = myGame.value.seats.find(
            (player) => player.generral === eventTargetPlayer.value,
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
    }
    // const player = myGame.value.seats.find((player) => player.id === selectedPlayer.value)
    // console.log(player)
    // player.hpChange(-1)
}
const startTurn = () => {
    myGame.value.makeTurn(eventSelectedPlayer.value)
    return
}
</script>
<template>
    <div>
        <div id="phaser-game" ref="phaser-game"></div>
        <div class="flex flex-col p-2">
            <div class="flex items-center">
                <template v-for="player in players">
                    <button
                        v-if="player === eventSelectedPlayer"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ player }}
                    </button>
                    <button
                        v-else
                        @click="eventSelectedPlayer = player"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ player }}
                    </button>
                </template>
            </div>
            <div class="flex">
                <template v-for="card in threeKingdomsCards">
                    <button
                        v-if="card.name === eventSelectedCard"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ card.name }}
                    </button>
                    <button
                        v-else
                        @click="eventSelectedCard = card.name"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ card.name }}
                    </button>
                </template>
            </div>
            <div class="flex items-center">
                <template v-for="player in players">
                    <button
                        v-if="player === eventTargetPlayer"
                        type="button"
                        class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        {{ player }}
                    </button>
                    <button
                        v-else
                        @click="eventTargetPlayer = player"
                        type="button"
                        class="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900"
                    >
                        {{ player }}
                    </button>
                </template>
            </div>
            <div class="flex">
                <button
                    @click="startTurn"
                    type="button"
                    class="mb-2 me-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    回合開始
                </button>
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
            </div>
        </div>
    </div>
</template>
