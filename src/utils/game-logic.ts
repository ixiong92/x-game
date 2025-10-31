/**
 * 游戏逻辑工具函数
 * 包含题目生成、答案验证、敌机管理等核心逻辑
 */

import type { CalculationMode, BattleQuestion, EnemyPlane, MovePattern } from '../types/game'

/**
 * 飞机大战题目生成器
 */
export class BattleQuestionGenerator {
  // 用于追踪已生成的题目，避免重复
  private static generatedQuestions: Set<string> = new Set()

  /**
   * 生成题目
   */
  static generate(mode: CalculationMode, rangeMin: number, rangeMax: number): BattleQuestion {
    let question: BattleQuestion
    let attempts = 0
    const maxAttempts = 50

    // 尝试生成不重复的题目
    do {
      const { operand1, operand2, operator, correctAnswer } = this.generateCalculation(mode, rangeMin, rangeMax)
      const questionKey = `${operand1}${operator}${operand2}`

      if (!this.generatedQuestions.has(questionKey)) {
        this.generatedQuestions.add(questionKey)

        const wrongAnswers = this.generateWrongAnswers(correctAnswer, rangeMin, rangeMax)
        const allAnswers = this.shuffleAnswers([correctAnswer, ...wrongAnswers])

        question = {
          id: this.generateId(),
          operand1,
          operand2,
          operator,
          correctAnswer,
          displayText: `${operand1} ${operator} ${operand2} = ?`,
          wrongAnswers,
          allAnswers
        }
        break
      }

      attempts++
    } while (attempts < maxAttempts)

    // 如果超过最大尝试次数，清空缓存重新开始
    if (attempts >= maxAttempts) {
      this.generatedQuestions.clear()
      const { operand1, operand2, operator, correctAnswer } = this.generateCalculation(mode, rangeMin, rangeMax)
      const wrongAnswers = this.generateWrongAnswers(correctAnswer, rangeMin, rangeMax)
      const allAnswers = this.shuffleAnswers([correctAnswer, ...wrongAnswers])

      question = {
        id: this.generateId(),
        operand1,
        operand2,
        operator,
        correctAnswer,
        displayText: `${operand1} ${operator} ${operand2} = ?`,
        wrongAnswers,
        allAnswers
      }
    }

    return question
  }

  /**
   * 重置题目缓存（游戏结束时调用）
   */
  static resetQuestionCache() {
    this.generatedQuestions.clear()
  }

  /**
   * 生成计算题目
   * 根据数字范围调整参数，确保能整除、避免负数
   */
  private static generateCalculation(mode: CalculationMode, min: number, max: number) {
    let operand1: number
    let operand2: number
    let correctAnswer: number
    let operator: string

    // 确保最小值至少为1，避免0出现
    const safeMin = Math.max(1, min)

    switch (mode) {
      case 'add':
      case '+':
        // 加法：两个数都在范围内，结果可能超过范围
        operand1 = this.randomInt(safeMin, max)
        operand2 = this.randomInt(safeMin, Math.max(safeMin, max - operand1))
        correctAnswer = operand1 + operand2
        operator = '+'
        break

      case 'subtract':
      case '-':
        // 减法：确保结果为正数（operand1 > operand2）
        operand1 = this.randomInt(Math.ceil(max / 2), max)
        operand2 = this.randomInt(safeMin, operand1 - 1)
        correctAnswer = operand1 - operand2
        operator = '-'
        break

      case 'multiply':
      case '*':
        // 乘法：根据范围调整乘数
        let maxMultiplier: number
        if (max <= 10) {
          maxMultiplier = Math.min(10, max)
        } else if (max <= 20) {
          maxMultiplier = 10
        } else if (max <= 50) {
          maxMultiplier = 10
        } else {
          maxMultiplier = 10
        }
        operand1 = this.randomInt(safeMin, maxMultiplier)
        operand2 = this.randomInt(safeMin, maxMultiplier)
        correctAnswer = operand1 * operand2
        operator = '×'
        break

      case 'divide':
      case '/':
        // 除法：确保能整除，避免小数
        // 先生成除数和商，再计算被除数
        let divisor: number
        let quotient: number

        if (max <= 10) {
          divisor = this.randomInt(2, 5)
          quotient = this.randomInt(safeMin, Math.floor(max / divisor))
        } else if (max <= 20) {
          divisor = this.randomInt(2, 6)
          quotient = this.randomInt(safeMin, Math.floor(max / divisor))
        } else if (max <= 50) {
          divisor = this.randomInt(2, 8)
          quotient = this.randomInt(safeMin, Math.floor(max / divisor))
        } else {
          divisor = this.randomInt(2, 10)
          quotient = this.randomInt(safeMin, Math.floor(max / divisor))
        }

        operand2 = divisor
        correctAnswer = quotient
        operand1 = correctAnswer * operand2
        operator = '÷'
        break

      default:
        operand1 = this.randomInt(safeMin, max)
        operand2 = this.randomInt(safeMin, max)
        correctAnswer = operand1 + operand2
        operator = '+'
    }

    return {
      operand1,
      operand2,
      operator,
      correctAnswer
    }
  }
  
  /**
   * 生成错误答案
   * 确保错误答案不重复、不等于正确答案、不为负数
   */
  private static generateWrongAnswers(correctAnswer: number, min: number, max: number): number[] {
    const wrongAnswers: number[] = []
    const usedAnswers = new Set<number>([correctAnswer])
    const attempts = 100 // 防止无限循环
    let count = 0

    while (wrongAnswers.length < 3 && count < attempts) {
      count++

      // 生成接近正确答案的错误答案
      const offset = Math.max(1, Math.floor(max / 5))
      let wrongAnswer: number

      // 随机选择生成策略
      const strategy = Math.random()
      if (strategy < 0.33) {
        // 策略1：比正确答案小
        wrongAnswer = Math.max(0, correctAnswer - this.randomInt(1, offset))
      } else if (strategy < 0.66) {
        // 策略2：比正确答案大
        wrongAnswer = correctAnswer + this.randomInt(1, offset)
      } else {
        // 策略3：在范围内随机
        wrongAnswer = this.randomInt(Math.max(0, min), Math.max(min, max * 2))
      }

      // 确保不重复且不等于正确答案且不为负数
      if (wrongAnswer >= 0 && !usedAnswers.has(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer)
        usedAnswers.add(wrongAnswer)
      }
    }

    // 如果生成失败，使用备用方案
    while (wrongAnswers.length < 3) {
      let backup = correctAnswer + (wrongAnswers.length + 1) * (Math.random() > 0.5 ? 1 : -1)
      backup = Math.max(0, backup) // 确保不为负数

      if (!usedAnswers.has(backup)) {
        wrongAnswers.push(backup)
        usedAnswers.add(backup)
      }
    }

    return wrongAnswers
  }

  /**
   * 打乱答案顺序
   */
  private static shuffleAnswers(answers: number[]): number[] {
    const shuffled = [...answers]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 生成随机整数
   */
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

/**
 * 敌机管理器
 */
export class EnemyPlaneManager {
  /**
   * 创建敌机
   */
  static createEnemies(answers: number[], correctAnswer: number): EnemyPlane[] {
    // 使用更鲜明的颜色，便于区分
    const colors = ['#1E90FF', '#FF1744', '#00E676', '#FFD600', '#FF6D00', '#D500F9', '#00BCD4', '#FF5252']
    const movePatterns: MovePattern[] = ['horizontal', 'vertical', 'circular', 'zigzag']

    // 为每个敌机分配不同的移动范围，避免聚集
    const moveRanges = this.generateDistributedRanges(answers.length)

    const enemies = answers.map((answer, index) => ({
      id: `enemy_${Date.now()}_${index}`,
      value: answer,
      isCorrect: answer === correctAnswer,  // 检查答案值是否等于正确答案
      position: this.getInitialPosition(index, answers.length),
      speed: this.randomFloat(1, 2),
      color: colors[index % colors.length],
      isHit: false,
      isDestroyed: false,
      movePattern: movePatterns[index % movePatterns.length],
      moveSpeed: this.randomFloat(0.5, 1.5),
      moveRange: moveRanges[index]  // 使用分散的移动范围
    }))

    return enemies
  }

  /**
   * 生成分散的移动范围
   * 每个敌机有独立的移动范围，不会相互交叉
   */
  private static generateDistributedRanges(count: number): number[] {
    // 为每个敌机分配固定的、不重叠的移动范围
    // 基于敌机的初始位置，确保移动不会超出其区域
    const ranges: number[] = []

    if (count <= 4) {
      // 4个敌机的情况：分别在4个象限
      // 每个敌机在其象限内移动，范围为50px
      ranges.push(50, 50, 50, 50)
    } else if (count <= 8) {
      // 8个敌机的情况
      ranges.push(40, 40, 40, 40, 40, 40, 40, 40)
    } else {
      // 更多敌机
      for (let i = 0; i < count; i++) {
        ranges.push(40)
      }
    }

    return ranges.slice(0, count)
  }

  /**
   * 获取初始位置
   * 根据敌机数量动态分配位置，确保每架敌机有独立的活动区域
   * 游戏区域大小约为 1200x655，中心为 (0, 0)
   * 驾驶舱被分成多个象限：
   * - 左上象限：X轴 -600~0, Y轴 -327~0
   * - 右上象限：X轴 0~600, Y轴 -327~0
   * - 左下象限：X轴 -600~0, Y轴 0~327
   * - 右下象限：X轴 0~600, Y轴 0~327
   */
  private static getInitialPosition(index: number, totalCount?: number): { x: number; y: number } {
    // 游戏区域中心为 (0, 0)，相对位置
    // 根据敌机总数动态分配位置

    if (!totalCount || totalCount <= 4) {
      // 4个或更少敌机：分别在4个象限
      const positions = [
        { x: -250, y: -130 },    // 左上象限
        { x: 250, y: -130 },     // 右上象限
        { x: -250, y: 130 },     // 左下象限
        { x: 250, y: 130 }       // 右下象限
      ]
      return positions[index % positions.length]
    } else if (totalCount <= 8) {
      // 8个敌机：分别在8个方向
      const positions = [
        { x: -280, y: -150 },    // 左上
        { x: 0, y: -180 },       // 上
        { x: 280, y: -150 },     // 右上
        { x: 320, y: 0 },        // 右
        { x: 280, y: 150 },      // 右下
        { x: 0, y: 180 },        // 下
        { x: -280, y: 150 },     // 左下
        { x: -320, y: 0 }        // 左
      ]
      return positions[index % positions.length]
    } else {
      // 更多敌机：使用圆形分布
      const angle = (index / totalCount) * Math.PI * 2
      const radius = 300
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      }
    }
  }

  /**
   * 生成随机浮点数
   */
  private static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  /**
   * 生成随机整数
   */
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

/**
 * 评分计算器
 */
export class ScoreCalculator {
  /**
   * 计算基础分数
   */
  static calculateBaseScore(difficulty: string): number {
    return difficulty === 'hard' ? 15 : 10
  }

  /**
   * 计算连击奖励
   */
  static calculateComboBonus(combo: number): number {
    if (combo < 3) return 0
    if (combo < 5) return 5
    if (combo < 10) return 10
    return 20
  }

  /**
   * 计算时间奖励
   */
  static calculateTimeBonus(timeLeft: number, difficulty: string): number {
    if (difficulty !== 'hard') return 0
    
    if (timeLeft >= 7) return 10
    if (timeLeft >= 5) return 5
    return 0
  }

  /**
   * 计算总分
   */
  static calculateTotalScore(
    baseScore: number,
    comboBonus: number,
    timeBonus: number
  ): number {
    return baseScore + comboBonus + timeBonus
  }
}

