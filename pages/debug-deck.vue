<template>
    <div class="min-h-screen bg-gray-900 p-6 text-white">
        <h1 class="mb-4 text-2xl font-bold">Debug 牌庫管理</h1>

        <div class="mb-4 inline-flex border border-gray-600 bg-gray-800 p-1" role="tablist">
            <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.value"
                class="px-4 py-1.5 text-sm transition-colors"
                :class="
                    activeTab === tab.value
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                "
                @click="activeTab = tab.value"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- Game ID -->
        <div class="mb-4 flex items-center gap-3">
            <label class="text-sm text-gray-400">Game ID：</label>
            <input
                v-model="gameId"
                class="w-48 rounded border border-gray-600 bg-gray-800 px-3 py-1 text-sm"
            />
            <button
                @click="fetchActiveDeck"
                :disabled="loading"
                class="rounded bg-blue-600 px-4 py-1 text-sm hover:bg-blue-700"
            >
                {{ loading ? '載入中...' : `載入${activeTabLabel}` }}
            </button>
            <button
                @click="saveActiveDeck"
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
        <div v-if="activeTab === 'cards' && !loading && deckCards.length > 0">
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

        <!-- General Deck -->
        <div v-if="activeTab === 'generals' && !loading && generalIds.length > 0">
            <p class="mb-3 text-sm text-gray-400">武將牌庫總數：{{ generalIds.length }}</p>
            <div class="max-h-[75vh] overflow-auto">
                <table class="w-full text-sm">
                    <thead class="sticky top-0 bg-gray-800">
                        <tr class="border-b border-gray-700 text-left text-gray-400">
                            <th class="w-12 px-2 py-2">#</th>
                            <th class="w-28 px-2 py-2">General ID</th>
                            <th class="w-32 px-2 py-2">名稱</th>
                            <th class="w-20 px-2 py-2">勢力</th>
                            <th class="w-20 px-2 py-2">體力</th>
                            <th class="px-2 py-2">置換為</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(generalId, index) in generalIds"
                            :key="index"
                            class="border-b border-gray-800 hover:bg-gray-800/50"
                        >
                            <td class="px-2 py-1 text-gray-500">{{ index + 1 }}</td>
                            <td class="px-2 py-1 font-mono text-xs">{{ generalId }}</td>
                            <td class="px-2 py-1">
                                {{ getGeneralInfo(generalId)?.name || generalId }}
                            </td>
                            <td class="px-2 py-1">{{ getGeneralInfo(generalId)?.camp || '-' }}</td>
                            <td class="px-2 py-1">{{ getGeneralInfo(generalId)?.hp || '-' }}</td>
                            <td class="px-2 py-1">
                                <select
                                    v-model="generalIds[index]"
                                    class="w-full max-w-xs rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm"
                                >
                                    <optgroup
                                        v-for="group in generalGroups"
                                        :key="group.camp"
                                        :label="`${group.camp}勢力`"
                                    >
                                        <option
                                            v-for="general in group.generals"
                                            :key="general.id"
                                            :value="general.id"
                                        >
                                            {{ general.id }} - {{ general.name }}（{{
                                                general.hp
                                            }}
                                            體力、{{ genderLabels[general.gender] }}）
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
        <div v-if="showEmptyState" class="text-gray-400">{{ activeTabLabel }}為空或無法載入</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import cardsJson from '~/assets/cards.json'
import generalCardsJson from '~/assets/generalCards.json'
import { useApi } from '~/composables/useApi'
import { suits, ranks } from '~/src/utils/domain'

type DeckTab = 'cards' | 'generals'
type General = { id: string; name: string; hp: number; camp: string; gender: string }

const { getDeck, setDeck, getGeneralCardDeck, setGeneralCardDeck } = useApi()

const gameId = ref('my-id')
const activeTab = ref<DeckTab>('cards')
const deckCards = ref<string[]>([])
const generalIds = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const fetched = ref<Record<DeckTab, boolean>>({ cards: false, generals: false })
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const tabs: { value: DeckTab; label: string }[] = [
    { value: 'cards', label: '一般牌堆' },
    { value: 'generals', label: '武將牌堆' },
]
const genderLabels: Record<string, string> = { male: '男', female: '女' }
const activeTabLabel = computed(() => tabs.find((tab) => tab.value === activeTab.value)!.label)
const activeDeck = computed(() =>
    activeTab.value === 'cards' ? deckCards.value : generalIds.value,
)
const showEmptyState = computed(
    () => !loading.value && activeDeck.value.length === 0 && fetched.value[activeTab.value],
)

const messageClass = computed(() =>
    messageType.value === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200',
)

const allCards = cardsJson as Record<
    string,
    { id: string; name: string; rank: number; suit: string; type: string }
>
const allGenerals = generalCardsJson as Record<string, General>

const generalGroups = computed(() => {
    const grouped: Record<string, General[]> = {}
    for (const general of Object.values(allGenerals)) {
        if (!grouped[general.camp]) grouped[general.camp] = []
        grouped[general.camp].push(general)
    }
    return Object.entries(grouped).map(([camp, generals]) => ({ camp, generals }))
})

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
const getGeneralInfo = (generalId: string) => allGenerals[generalId]

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

const fetchActiveDeck = async () => {
    loading.value = true
    message.value = ''
    try {
        if (activeTab.value === 'cards') {
            const res = await getDeck(gameId.value)
            deckCards.value = res.data.cardIds || []
        } else {
            const res = await getGeneralCardDeck(gameId.value)
            generalIds.value = res.data.generalIds || []
        }
        fetched.value[activeTab.value] = true
        showMessage(`載入成功，共 ${activeDeck.value.length} 張牌`, 'success')
    } catch (e: any) {
        if (activeTab.value === 'cards') deckCards.value = []
        else generalIds.value = []
        fetched.value[activeTab.value] = true
        showMessage(`載入失敗：${e?.response?.data?.message || e.message}`, 'error')
    } finally {
        loading.value = false
    }
}

const saveActiveDeck = async () => {
    saving.value = true
    message.value = ''
    try {
        if (activeTab.value === 'cards') {
            await setDeck(gameId.value, { cardIds: deckCards.value })
        } else {
            await setGeneralCardDeck(gameId.value, { generalIds: generalIds.value })
        }
        showMessage('儲存成功', 'success')
    } catch (e: any) {
        showMessage(`儲存失敗：${e?.response?.data?.message || e.message}`, 'error')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    fetchActiveDeck()
})

watch(activeTab, () => {
    message.value = ''
    if (!fetched.value[activeTab.value]) fetchActiveDeck()
})
</script>
