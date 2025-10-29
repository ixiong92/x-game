/**
 * 音效管理器
 * 使用 Web Audio API 生成音效，无需 MP3 文件
 */

// 音效类型
export type SoundType = 
  | 'correct'      // 答对
  | 'wrong'        // 答错
  | 'attack'       // 攻击
  | 'explosion'    // 爆炸
  | 'select'       // 选择
  | 'combo'        // 连击
  | 'countdown'    // 倒计时
  | 'appear'       // 敌机出现
  | 'gameStart'    // 游戏开始
  | 'gameOver'     // 游戏结束

export interface SoundSettings {
  enabled: boolean        // 是否启用音效
  volume: number          // 音量 0-1
  musicEnabled: boolean   // 是否启用背景音乐
  musicVolume: number     // 背景音乐音量 0-1
}

class SoundManager {
  private enabled: boolean = true
  private volume: number = 0.5
  private musicEnabled: boolean = true
  private musicVolume: number = 0.3
  private audioContext: AudioContext | null = null
  private bgmAudio: HTMLAudioElement | null = null

  constructor() {
    this.initAudioContext()
    this.loadSettings()
  }

  /**
   * 初始化 Audio Context
   */
  private initAudioContext() {
    try {
      if (typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    } catch (error) {
      console.error('初始化 AudioContext 失败:', error)
    }
  }

  /**
   * 播放音效
   */
  play(soundType: SoundType) {
    if (!this.enabled || !this.audioContext) return

    try {
      switch (soundType) {
        case 'correct':
          this.playCorrect()
          break
        case 'wrong':
          this.playWrong()
          break
        case 'attack':
          this.playAttack()
          break
        case 'explosion':
          this.playExplosion()
          break
        case 'select':
          this.playSelect()
          break
        case 'combo':
          this.playCombo()
          break
        case 'countdown':
          this.playCountdown()
          break
        case 'appear':
          this.playAppear()
          break
        case 'gameStart':
          this.playGameStart()
          break
        case 'gameOver':
          this.playGameOver()
          break
      }
    } catch (error) {
      console.error('播放音效失败:', error)
    }
  }

  /**
   * 播放正确音效
   */
  private playCorrect() {
    this.playTone([523.25, 659.25, 783.99], 0.1, 'sine')
  }

  /**
   * 播放错误音效
   */
  private playWrong() {
    this.playTone([200, 150], 0.2, 'sawtooth')
  }

  /**
   * 播放攻击音效
   */
  private playAttack() {
    this.playTone([800, 400], 0.05, 'square')
  }

  /**
   * 播放爆炸音效
   */
  private playExplosion() {
    if (!this.audioContext) return
    
    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3)
    
    gainNode.gain.setValueAtTime(this.volume, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    
    oscillator.start(now)
    oscillator.stop(now + 0.3)
  }

  /**
   * 播放选择音效
   */
  private playSelect() {
    this.playTone([400], 0.05, 'sine')
  }

  /**
   * 播放连击音效
   */
  private playCombo() {
    this.playTone([659.25, 783.99, 987.77], 0.08, 'sine')
  }

  /**
   * 播放倒计时音效
   */
  private playCountdown() {
    this.playTone([440], 0.1, 'sine')
  }

  /**
   * 播放敌机出现音效
   */
  private playAppear() {
    this.playTone([300, 400, 500], 0.1, 'triangle')
  }

  /**
   * 播放游戏开始音效
   */
  private playGameStart() {
    this.playTone([523.25, 659.25, 783.99, 1046.50], 0.15, 'sine')
  }

  /**
   * 播放游戏结束音效
   */
  private playGameOver() {
    this.playTone([783.99, 659.25, 523.25, 392.00], 0.2, 'sine')
  }

  /**
   * 播放音调序列
   */
  private playTone(
    frequencies: number[],
    duration: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)
      
      oscillator.type = type
      oscillator.frequency.value = freq
      
      const startTime = now + index * duration
      const endTime = startTime + duration
      
      gainNode.gain.setValueAtTime(this.volume, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)
      
      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  }

  /**
   * 播放背景音乐
   */
  playBGM(src: string) {
    if (!this.musicEnabled) return

    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(src)
        this.bgmAudio.loop = true
        this.bgmAudio.volume = this.musicVolume
        // iOS 兼容性设置
        this.bgmAudio.setAttribute('playsinline', 'true')
        this.bgmAudio.setAttribute('webkit-playsinline', 'true')
        this.bgmAudio.crossOrigin = 'anonymous'
      }

      const playPromise = this.bgmAudio.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('播放背景音乐失败:', error)
          // 如果自动播放失败，尝试通过用户交互重新播放
          this.setupAudioPlayOnUserInteraction()
        })
      }
    } catch (error) {
      console.error('创建背景音乐失败:', error)
    }
  }

  /**
   * 设置用户交互时播放音乐
   */
  private setupAudioPlayOnUserInteraction() {
    const playAudio = () => {
      if (this.bgmAudio && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(err => {
          console.error('用户交互播放失败:', err)
        })
      }
      // 移除事件监听
      document.removeEventListener('click', playAudio)
      document.removeEventListener('touchstart', playAudio)
    }

    document.addEventListener('click', playAudio, { once: true })
    document.addEventListener('touchstart', playAudio, { once: true })
  }

  /**
   * 停止背景音乐
   */
  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.currentTime = 0
    }
  }

  /**
   * 设置音效开关
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    this.saveSettings()
  }

  /**
   * 设置音量
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * 设置背景音乐开关
   */
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (!enabled) {
      this.stopBGM()
    }
    this.saveSettings()
  }

  /**
   * 设置背景音乐音量
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.musicVolume
    }
    this.saveSettings()
  }

  /**
   * 获取设置
   */
  getSettings(): SoundSettings {
    return {
      enabled: this.enabled,
      volume: this.volume,
      musicEnabled: this.musicEnabled,
      musicVolume: this.musicVolume
    }
  }

  /**
   * 保存设置
   */
  private saveSettings() {
    const settings = this.getSettings()
    localStorage.setItem('sound_settings', JSON.stringify(settings))
  }

  /**
   * 加载设置
   */
  private loadSettings() {
    try {
      const saved = localStorage.getItem('sound_settings')
      if (saved) {
        const settings = JSON.parse(saved) as SoundSettings
        this.enabled = settings.enabled
        this.volume = settings.volume
        this.musicEnabled = settings.musicEnabled
        this.musicVolume = settings.musicVolume
      }
    } catch (error) {
      console.error('加载音效设置失败:', error)
    }
  }
}

// 导出单例
export default new SoundManager()

