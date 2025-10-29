/**
 * 用户相关类型定义
 */

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  age: number
  level: number
  exp: number
  createdAt: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: number
}

export interface LearningProgress {
  totalGames: number
  totalCorrect: number
  totalWrong: number
  totalTime: number
  bestScore: number
  averageAccuracy: number
}

export interface UserState {
  profile: UserProfile | null
  achievements: Achievement[]
  progress: LearningProgress
  isLoggedIn: boolean
}

