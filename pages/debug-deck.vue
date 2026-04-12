<template>
    <div class="min-h-screen bg-gray-900 p-6 text-white">
        <h1 class="mb-4 text-2xl font-bold">Debug 牌庫管理</h1>

        <!-- Game ID -->
        <div class="mb-4 flex items-center gap-3">
            <label class="text-sm text-gray-400">Game ID：</label>
            <input
                v-model="gameId"
                class="w-48 rounded border border-gray-600 bg-gray-800 px-3 py-1 text-sm"
            />
            <button
                @click="fetchDeck"
                class="rounded bg-blue-600 px-4 py-1 text-sm hover:bg-blue-700"
            >
                載入牌庫
            </button>
            <button
                @click="saveDeck"
                :disabled="saving"
                class="rounded bg-green-600 px-4 py-1 text-sm hover:bg-green-700 disabled:opacity-50"
            >
                {{ saving ? '儲存中...' : '儲存變更' }}
            </button>
        </div>

        <!-- Status -->
        <div v-if="message" class="mb-4 rounded px-3 py-2 text-sm" :class="messageClass">
            {{ message }}
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-gray-400">載入中...</div>

        <!-- Deck -->
        <div v-if="!loading && deckCards.length > 0">
            <p class="mb-3 text-sm text-gray-400">牌庫總數：{{ deckCards.length }}</p>
            <div class="max-h-[75vh] overflow-auto">
                <table class="w-full text-sm">
                    <thead class="sticky top-0 bg-gray-800">
                        <tr class="border-b border-gray-700 text-left text-gray-400">
                            <th class="w-12 px-2 py-2">#</th>
                            <th class="w-28 px-2 py-2">Card ID</th>
                            <th class="w-32 px-2 py-2">名稱</th>
                            <th class="w-20 px-2 py-2">花色點數</th>
                            <th class="px-2 py-2">置換為</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(cardId, index) in deckCards"
                            :key="index"
                            class="border-b border-gray-800 hover:bg-gray-800/50"
                        >
                            <td class="px-2 py-1 text-gray-500">{{ index + 1 }}</td>
                            <td class="px-2 py-1 font-mono text-xs">{{ cardId }}</td>
                            <td class="px-2 py-1">{{ getCardName(cardId) }}</td>
                            <td class="px-2 py-1" :style="{ color: getSuitColor(cardId) }">
                                {{ getCardSuitRank(cardId) }}
                            </td>
                            <td class="px-2 py-1">
                                <select
                                    :value="cardId"
                                    @change="
                                        replaceCard(
                                            index,
                                            ($event.target as HTMLSelectElement).value,
                                        )
                                    "
                                    class="w-full max-w-xs rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm"
                                >
                                    <optgroup
                                        v-for="group in cardGroups"
                                        :key="group.type"
                                        :label="group.label"
                                    >
                                        <option
                                            v-for="card in group.cards"
                                            :key="card.id"
                                            :value="card.id"
                                        >
                                            {{ card.id }} - {{ card.name }}
                                            {{ getSuitSymbol(card.suit)
                                            }}{{ getRankStr(card.rank) }}
                                        </option>
                                    </optgroup>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Empty -->
        <div v-if="!loading && deckCards.length === 0 && fetched" class="text-gray-400">
            牌庫為空或無法載入
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import cardsJson from '~/assets/cards.json'
import { suits, ranks } from '~/src/utils/domain'

const { getDeck, setDeck } = useApi()

const gameId = ref('my-id')
const deckCards = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const fetched = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const messageClass = computed(() =>
    messageType.value === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200',
)

const allCards = cardsJson as Record<
    string,
    { id: string; name: string; rank: number; suit: string; type: string }
>

const cardGroups = computed(() => {
    const typeLabels: Record<string, string> = {
        basic: '基本牌',
        scroll: '錦囊牌',
        equipment: '裝備牌',
    }
    const grouped: Record<string, { id: string; name: string; rank: number; suit: string }[]> = {}
    for (const card of Object.values(allCards)) {
        if (!grouped[card.type]) grouped[card.type] = []
        grouped[card.type].push(card)
    }
    return Object.entries(grouped).map(([type, cards]) => ({
        type,
        label: typeLabels[type] || type,
        cards,
    }))
})

const getCardInfo = (cardId: string) => allCards[cardId]

const getCardName = (cardId: string) => {
    const card = getCardInfo(cardId)
    return card ? card.name : cardId
}

const getSuitSymbol = (suit: string) => {
    return suits[suit]?.symbol || ''
}

const getSuitColor = (cardId: string) => {
    const card = getCardInfo(cardId)
    if (!card) return 'white'
    return suits[card.suit]?.color || 'white'
}

const getRankStr = (rank: number) => {
    return ranks[rank] || String(rank)
}

const getCardSuitRank = (cardId: string) => {
    const card = getCardInfo(cardId)
    if (!card) return ''
    return `${getSuitSymbol(card.suit)}${getRankStr(card.rank)}`
}

const replaceCard = (index: number, newCardId: string) => {
    deckCards.value[index] = newCardId
}

const showMessage = (msg: string, type: 'success' | 'error') => {
    message.value = msg
    messageType.value = type
    setTimeout(() => {
        message.value = ''
    }, 3000)
}

const fetchDeck = async () => {
    loading.value = true
    message.value = ''
    try {
        const res = await getDeck(gameId.value)
        deckCards.value = res.data.cardIds || []
        fetched.value = true
        showMessage(`載入成功，共 ${deckCards.value.length} 張牌`, 'success')
    } catch (e: any) {
        deckCards.value = []
        fetched.value = true
        showMessage(`載入失敗：${e?.response?.data?.message || e.message}`, 'error')
    } finally {
        loading.value = false
    }
}

const saveDeck = async () => {
    saving.value = true
    message.value = ''
    try {
        await setDeck(gameId.value, { cardIds: deckCards.value })
        showMessage('儲存成功', 'success')
    } catch (e: any) {
        showMessage(`儲存失敗：${e?.response?.data?.message || e.message}`, 'error')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    fetchDeck()
})
</script>
