/**
 * 游戏状态管理
 * 管理游戏配置、当前游戏状态、题目等
 */

import { defineStore } from 'pinia'
import type {
  GameConfig,
  CurrentQuestion,
  GameProgress,
  GameState,
  GameStatus,
  GameResult,
  BattleQuestion
} from '../types/game'
import { BattleQuestionGenerator } from '../utils/game-logic'

// 默认游戏配置
const defaultConfig: GameConfig = {
  mode: 'add',
  rangeMin: 1,
  rangeMax: 10,
  totalQuestions: 10,
  difficulty: 'easy',
  enableBonus: true,
  enemyMoving: false  // 默认敌机移动关闭
}

// 默认题目
const defaultQuestion: CurrentQuestion = {
  text: '',
  correctAnswer: 0,
  enemies: []
}

// 默认进度
const defaultProgress: GameProgress = {
  currentIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  score: 0,
  combo: 0,
  timeLeft: 0,
  wrongQuestions: []
}

export const useGameStore = defineStore('game', {
  state: (): GameState & { gameState: GameState; currentBattleQuestion: BattleQuestion | null; result: GameResult | null } => ({
    config: { ...defaultConfig },
    currentQuestion: { ...defaultQuestion },
    progress: { ...defaultProgress },
    status: 'config',
    startTime: 0,
    endTime: 0,
    currentBattleQuestion: null,
    result: null,
    // 添加 gameState 属性以兼容组件访问
    gameState: {
      config: { ...defaultConfig },
      currentQuestion: { ...defaultQuestion },
      progress: { ...defaultProgress },
      status: 'config',
      startTime: 0,
      endTime: 0,
      result: null
    }
  }),

  getters: {
    // 是否正在游戏中
    isPlaying: (state) => state.status === 'playing',
    
    // 是否已暂停
    isPaused: (state) => state.status === 'paused',
    
    // 是否已结束
    isFinished: (state) => state.status === 'finished',
    
    // 当前进度百分比
    progressPercent: (state) => {
      return state.config.totalQuestions > 0
        ? (state.progress.currentIndex / state.config.totalQuestions) * 100
        : 0
    },
    
    // 正确率
    accuracy: (state) => {
      const total = state.progress.correctCount + state.progress.wrongCount
      return total > 0 ? (state.progress.correctCount / total * 100).toFixed(1) : '0.0'
    }
  },

  actions: {
    /**
     * 更新游戏配置
     */
    updateGameConfig(config: Partial<GameConfig>) {
      this.config = { ...this.config, ...config }
      this.saveGameConfig()
    },

    /**
     * 开始游戏
     */
    startGame(config?: Partial<GameConfig>) {
      if (config) {
        // 处理数字范围
        if (config.numberRange) {
          config.rangeMin = 1
          config.rangeMax = config.numberRange
        }

        // 处理题目数量
        if (config.questionCount) {
          config.totalQuestions = config.questionCount
        }

        this.config = { ...this.config, ...config } as GameConfig
      }

      this.status = 'playing'
      this.startTime = Date.now()
      this.progress = {
        currentIndex: 0,
        correctCount: 0,
        wrongCount: 0,
        score: 0,
        combo: 0,
        timeLeft: this.config.difficulty === 'hard' ? 10 : 0
      }

      // 同步 gameState
      this.syncGameState()

      // 生成第一道题目
      this.generateQuestion()
    },

    /**
     * 同步 gameState
     */
    syncGameState() {
      this.gameState = {
        config: this.config,
        currentQuestion: this.currentQuestion,
        progress: this.progress,
        status: this.status,
        startTime: this.startTime,
        endTime: this.endTime,
        result: this.result
      }
    },

    /**
     * 生成题目
     */
    generateQuestion() {
      const question = BattleQuestionGenerator.generate(
        this.config.mode,
        this.config.rangeMin,
        this.config.rangeMax
      )

      this.currentBattleQuestion = question

      this.currentQuestion = {
        text: question.displayText,
        correctAnswer: question.correctAnswer,
        enemies: []
      }

      this.syncGameState()
    },

    /**
     * 暂停游戏
     */
    pauseGame() {
      if (this.status === 'playing') {
        this.status = 'paused'
        this.syncGameState()
      }
    },

    /**
     * 恢复游戏
     */
    resumeGame() {
      if (this.status === 'paused') {
        this.status = 'playing'
        this.syncGameState()
      }
    },

    /**
     * 结束游戏
     */
    endGame() {
      this.status = 'finished'
      this.endTime = Date.now()

      // 获取游戏结果
      const result = this.getGameResult()
      this.result = result

      // 更新 gameState
      this.gameState = {
        config: this.config,
        currentQuestion: this.currentQuestion,
        progress: this.progress,
        status: this.status,
        startTime: this.startTime,
        endTime: this.endTime,
        result: result
      }

      this.saveGameHistory()

      // 重置题目缓存，为下一局游戏做准备
      BattleQuestionGenerator.resetQuestionCache()

      return result
    },

    /**
     * 重置游戏
     */
    resetGame() {
      this.status = 'config'
      this.currentQuestion = { ...defaultQuestion }
      this.progress = { ...defaultProgress }
      this.startTime = 0
      this.endTime = 0

      // 重置题目缓存
      BattleQuestionGenerator.resetQuestionCache()

      this.syncGameState()
    },

    /**
     * 更新当前题目
     */
    updateCurrentQuestion() {
      this.progress.currentIndex++

      if (this.config.difficulty === 'hard') {
        this.progress.timeLeft = 10
      }

      // 生成新题目
      this.generateQuestion()
    },

    /**
     * 处理正确答案
     */
    handleCorrectAnswer() {
      this.progress.correctCount++
      this.progress.combo++

      // 分数计算：每题10分
      this.progress.score += 10

      this.syncGameState()
    },

    /**
     * 处理错误答案
     */
    handleWrongAnswer(userAnswer?: number) {
      this.progress.wrongCount++
      this.progress.combo = 0

      // 分数计算：错误不减分
      // this.progress.score 保持不变

      // 记录错误的题目
      if (!this.progress.wrongQuestions) {
        this.progress.wrongQuestions = []
      }

      if (userAnswer !== undefined && this.currentBattleQuestion) {
        this.progress.wrongQuestions.push({
          index: this.progress.currentIndex + 1,
          question: this.currentBattleQuestion.displayText,
          correctAnswer: this.currentBattleQuestion.correctAnswer,
          userAnswer: userAnswer
        })
      }

      this.syncGameState()
    },

    /**
     * 更新剩余时间
     */
    updateTimeLeft(time: number) {
      this.progress.timeLeft = time
    },

    /**
     * 计算时间奖励
     */
    calculateTimeBonus(): number {
      if (this.config.difficulty !== 'hard') {
        return 0
      }
      
      const timeLeft = this.progress.timeLeft
      if (timeLeft >= 7) {
        return 10 // 3秒内答对
      } else if (timeLeft >= 5) {
        return 5 // 5秒内答对
      }
      return 0
    },

    /**
     * 计算游戏评级
     */
    calculateGrade(): string {
      const accuracy = (this.progress.correctCount / this.config.totalQuestions) * 100
      
      if (accuracy >= 90) return 'S'
      if (accuracy >= 80) return 'A'
      if (accuracy >= 70) return 'B'
      if (accuracy >= 60) return 'C'
      return 'D'
    },

    /**
     * 获取游戏结果
     */
    getGameResult(): GameResult {
      const totalTime = this.endTime - this.startTime
      const totalQuestions = this.config.totalQuestions
      const accuracy = totalQuestions > 0
        ? ((this.progress.correctCount / totalQuestions) * 100).toFixed(1)
        : '0'

      // 计算最高连击（这里简化处理，实际应该在游戏过程中记录）
      const maxCombo = Math.max(
        this.progress.combo,
        Math.floor(this.progress.correctCount / 2)
      )

      // 计算平均分
      const averageScore = totalQuestions > 0
        ? Math.floor(this.progress.score / totalQuestions)
        : 0

      return {
        config: this.config,
        progress: this.progress,
        grade: this.calculateGrade(),
        totalTime: Math.floor(totalTime / 1000),
        accuracy: parseFloat(accuracy as string),
        score: this.progress.score,
        correctCount: this.progress.correctCount,
        wrongCount: this.progress.wrongCount,
        maxCombo,
        averageScore,
        wrongQuestions: this.progress.wrongQuestions || []
      }
    },

    /**
     * 保存游戏配置
     */
    saveGameConfig() {
      localStorage.setItem('game_config', JSON.stringify(this.config))
    },

    /**
     * 加载游戏配置
     */
    loadGameConfig() {
      try {
        const saved = localStorage.getItem('game_config')
        if (saved) {
          this.config = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载游戏配置失败:', e)
      }
    },

    /**
     * 保存游戏历史
     */
    saveGameHistory() {
      try {
        const history = localStorage.getItem('game_history') || '[]'
        const historyArray = JSON.parse(history) as any[]
        
        historyArray.push({
          timestamp: Date.now(),
          result: this.getGameResult()
        })
        
        // 只保留最近50条记录
        if (historyArray.length > 50) {
          historyArray.shift()
        }
        
        localStorage.setItem('game_history', JSON.stringify(historyArray))
      } catch (e) {
        console.error('保存游戏历史失败:', e)
      }
    },

    /**
     * 获取游戏历史
     */
    getGameHistory(): any[] {
      try {
        const history = localStorage.getItem('game_history') || '[]'
        return JSON.parse(history)
      } catch (e) {
        console.error('获取游戏历史失败:', e)
        return []
      }
    }
  }
})

