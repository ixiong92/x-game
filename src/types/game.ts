/**
 * 游戏相关类型定义
 */

export type CalculationMode = 'add' | 'subtract' | 'multiply' | 'divide'
export type DifficultyLevel = 'easy' | 'hard'
export type GameStatus = 'config' | 'playing' | 'paused' | 'finished'
export type MovePattern = 'static' | 'horizontal' | 'vertical' | 'circular' | 'zigzag'

export interface NumberRange {
  min: number
  max: number
}

export interface GameConfig {
  mode: CalculationMode
  numberRange?: number  // 简化的数字范围：10, 20, 50, 100
  rangeMin: number
  rangeMax: number
  totalQuestions: number
  questionCount?: number  // 题目数量别名
  difficulty: DifficultyLevel
  enableBonus: boolean
  enemyMoving?: boolean  // 敌机是否移动
}

export interface EnemyPlane {
  id: string
  value: number
  isCorrect: boolean
  position: { x: number; y: number }
  speed: number
  color: string
  isHit: boolean
  isDestroyed: boolean
  movePattern?: MovePattern
  moveSpeed?: number
  moveRange?: number
}

export interface CurrentQuestion {
  text: string
  correctAnswer: number
  enemies: EnemyPlane[]
}

export interface GameProgress {
  currentIndex: number
  correctCount: number
  wrongCount: number
  score: number
  combo: number
  timeLeft: number
}

export interface GameState {
  config: GameConfig
  currentQuestion: CurrentQuestion
  progress: GameProgress
  status: GameStatus
  startTime: number
  endTime: number
  result?: GameResult
}

export interface BattleQuestion {
  id: string
  operand1: number
  operand2: number
  operator: string
  correctAnswer: number
  displayText: string
  wrongAnswers: number[]
  allAnswers: number[]
}

export interface GameResult {
  config: GameConfig
  progress: GameProgress
  grade: string
  totalTime: number
  accuracy: string | number
  score: number
  correctCount: number
  wrongCount: number
  maxCombo: number
  averageScore: number
}

