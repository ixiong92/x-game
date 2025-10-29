/**
 * 游戏逻辑工具函数
 * 包含题目生成、答案验证、敌机管理等核心逻辑
 */

import type { CalculationMode, BattleQuestion, EnemyPlane, MovePattern } from '../types/game'

/**
 * 飞机大战题目生成器
 */
export class BattleQuestionGenerator {
  /**
   * 生成题目
   */
  static generate(mode: CalculationMode, rangeMin: number, rangeMax: number): BattleQuestion {
    const { operand1, operand2, operator, correctAnswer } = this.generateCalculation(mode, rangeMin, rangeMax)
    const wrongAnswers = this.generateWrongAnswers(correctAnswer, rangeMin, rangeMax)
    const allAnswers = this.shuffleAnswers([correctAnswer, ...wrongAnswers])

    return {
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

  /**
   * 生成计算题目
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
        operand1 = this.randomInt(safeMin, max)
        operand2 = this.randomInt(safeMin, Math.max(safeMin, max - operand1))
        correctAnswer = operand1 + operand2
        operator = '+'
        break

      case 'subtract':
      case '-':
        operand1 = this.randomInt(safeMin, max)
        operand2 = this.randomInt(safeMin, Math.max(safeMin, operand1 - 1))
        correctAnswer = operand1 - operand2
        operator = '-'
        break

      case 'multiply':
      case '*':
        const maxMultiplier = Math.min(10, max)
        operand1 = this.randomInt(safeMin, maxMultiplier)
        operand2 = this.randomInt(safeMin, maxMultiplier)
        correctAnswer = operand1 * operand2
        operator = '×'
        break

      case 'divide':
      case '/':
        operand2 = this.randomInt(Math.max(2, safeMin), Math.min(10, max))
        correctAnswer = this.randomInt(safeMin, Math.floor(max / operand2))
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
   */
  private static generateWrongAnswers(correctAnswer: number, min: number, max: number): number[] {
    const wrongAnswers: number[] = []
    const attempts = 100 // 防止无限循环
    let count = 0

    while (wrongAnswers.length < 3 && count < attempts) {
      count++
      
      // 生成接近正确答案的错误答案
      const offset = this.randomInt(1, Math.max(5, Math.floor(max / 5)))
      const wrongAnswer = this.randomInt(
        Math.max(min, correctAnswer - offset),
        Math.min(max * 2, correctAnswer + offset)
      )

      // 确保不重复且不等于正确答案
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer) && wrongAnswer >= 0) {
        wrongAnswers.push(wrongAnswer)
      }
    }

    // 如果生成失败，使用备用方案
    while (wrongAnswers.length < 3) {
      const backup = correctAnswer + (wrongAnswers.length + 1) * (Math.random() > 0.5 ? 1 : -1)
      if (backup >= 0 && !wrongAnswers.includes(backup)) {
        wrongAnswers.push(backup)
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
      position: this.getInitialPosition(index),
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
   * 4个敌机分别位于4个象限，每个象限有独立的活动范围
   * 游戏区域大小约为 1200x655，中心为 (0, 0)
   */
  private static getInitialPosition(index: number): { x: number; y: number } {
    // 游戏区域中心为 (0, 0)，相对位置
    // 4个象限的中心位置，确保敌机不会相互交叉
    // 象限范围：X轴 ±600, Y轴 ±327
    const positions = [
      { x: -300, y: -200 },   // 左上象限
      { x: 300, y: -200 },    // 右上象限
      { x: -300, y: 200 },    // 左下象限
      { x: 300, y: 200 }      // 右下象限
    ]
    return positions[index % positions.length]
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

