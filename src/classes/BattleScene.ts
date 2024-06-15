import type { Audios } from '~/src/types'
export default class BattleScene extends Phaser.Scene {
    audioMute: boolean
    audios?: Audios
    constructor() {
        super({ key: 'battleScene' })
        // 添加自己的變數
        this.audioMute = true
        // this.audios = audios
    }
    init(data: { audios: Audios }) {
        // 初始化
        this.audios = data.audios
    }
    preload() {
        // 預加載
        if (!this.audios) return
        // 預加載音樂
        Object.entries(this.audios).forEach(([key, value]) => {
            this.load.audio(key, value)
        })
    }
    create() {
        console.log('BattleScene created', this)
    }
}
