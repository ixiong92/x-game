/**
 * 用户状态管理
 * 管理用户信息、学习进度、成就等数据
 */

import { defineStore } from 'pinia'
import type { UserProfile, Achievement, LearningProgress, UserState } from '../types/user'

// 默认用户配置
const defaultProfile: UserProfile = {
  id: '',
  nickname: '小朋友',
  avatar: 'avatar_1',
  age: 6,
  level: 1,
  exp: 0,
  createdAt: Date.now()
}

const defaultProgress: LearningProgress = {
  totalGames: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalTime: 0,
  bestScore: 0,
  averageAccuracy: 0
}

// 初始化成就列表
const initAchievements = (): Achievement[] => {
  return [
    {
      id: 'first_game',
      name: '初次尝试',
      description: '完成第一场游戏',
      icon: '🎮',
      unlocked: false,
      unlockedAt: 0
    },
    {
      id: 'perfect_10',
      name: '完美十题',
      description: '连续答对10题',
      icon: '💯',
      unlocked: false,
      unlockedAt: 0
    },
    {
      id: 'speed_master',
      name: '速度大师',
      description: '在困难模式下获得S级评价',
      icon: '⚡',
      unlocked: false,
      unlockedAt: 0
    },
    {
      id: 'persistent',
      name: '坚持不懈',
      description: '累计完成50场游戏',
      icon: '🏆',
      unlocked: false,
      unlockedAt: 0
    },
    {
      id: 'accuracy_king',
      name: '精准王者',
      description: '达到95%以上的正确率',
      icon: '👑',
      unlocked: false,
      unlockedAt: 0
    }
  ]
}

// 生成用户ID
const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    profile: null,
    achievements: [],
    progress: { ...defaultProgress },
    isLoggedIn: false
  }),

  getters: {
    // 获取用户昵称
    nickname: (state) => state.profile?.nickname || '小朋友',
    
    // 获取用户等级
    level: (state) => state.profile?.level || 1,
    
    // 获取已解锁成就数量
    unlockedAchievementsCount: (state) => 
      state.achievements.filter(a => a.unlocked).length,
    
    // 获取总成就数量
    totalAchievementsCount: (state) => state.achievements.length,
    
    // 获取正确率
    accuracy: (state) => {
      const total = state.progress.totalCorrect + state.progress.totalWrong
      return total > 0 ? (state.progress.totalCorrect / total * 100).toFixed(1) : '0.0'
    }
  },

  actions: {
    /**
     * 初始化用户数据
     */
    initUser() {
      try {
        const savedProfile = localStorage.getItem('user_profile')
        const savedProgress = localStorage.getItem('user_progress')
        const savedAchievements = localStorage.getItem('user_achievements')
        
        if (savedProfile) {
          this.profile = JSON.parse(savedProfile)
          this.isLoggedIn = true
        } else {
          this.profile = { ...defaultProfile, id: generateUserId() }
          this.saveUserProfile()
        }
        
        if (savedProgress) {
          this.progress = JSON.parse(savedProgress)
        }
        
        if (savedAchievements) {
          this.achievements = JSON.parse(savedAchievements)
        } else {
          this.achievements = initAchievements()
          this.saveAchievements()
        }
      } catch (e) {
        console.error('初始化用户数据失败:', e)
        this.profile = { ...defaultProfile, id: generateUserId() }
        this.achievements = initAchievements()
      }
    },

    /**
     * 更新用户资料
     */
    updateUserProfile(updates: Partial<UserProfile>) {
      if (this.profile) {
        this.profile = { ...this.profile, ...updates }
        this.saveUserProfile()
      }
    },

    /**
     * 更新用户资料（别名方法）
     */
    updateProfile(updates: Partial<UserProfile>) {
      this.updateUserProfile(updates)
    },

    /**
     * 更新学习进度
     */
    updateLearningProgress(gameResult: {
      totalGames?: number
      totalCorrect?: number
      totalWrong?: number
      totalTime?: number
      bestScore?: number
    }) {
      if (gameResult.totalGames !== undefined) {
        this.progress.totalGames += gameResult.totalGames
      }
      if (gameResult.totalCorrect !== undefined) {
        this.progress.totalCorrect += gameResult.totalCorrect
      }
      if (gameResult.totalWrong !== undefined) {
        this.progress.totalWrong += gameResult.totalWrong
      }
      if (gameResult.totalTime !== undefined) {
        this.progress.totalTime += gameResult.totalTime
      }

      if (gameResult.bestScore !== undefined && gameResult.bestScore > this.progress.bestScore) {
        this.progress.bestScore = gameResult.bestScore
      }

      const totalAnswers = this.progress.totalCorrect + this.progress.totalWrong
      this.progress.averageAccuracy = totalAnswers > 0
        ? (this.progress.totalCorrect / totalAnswers) * 100
        : 0

      this.saveLearningProgress()
      this.checkAchievements()
    },

    /**
     * 解锁成就
     */
    unlockAchievement(achievementId: string): boolean {
      const achievement = this.achievements.find(a => a.id === achievementId)
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = Date.now()
        this.saveAchievements()
        return true
      }
      return false
    },

    /**
     * 检查并解锁成就
     */
    checkAchievements() {
      const progress = this.progress
      
      // 初次尝试
      if (progress.totalGames >= 1) {
        this.unlockAchievement('first_game')
      }
      
      // 坚持不懈
      if (progress.totalGames >= 50) {
        this.unlockAchievement('persistent')
      }
      
      // 精准王者
      if (progress.averageAccuracy >= 95) {
        this.unlockAchievement('accuracy_king')
      }
    },

    /**
     * 保存用户资料
     */
    saveUserProfile() {
      if (this.profile) {
        localStorage.setItem('user_profile', JSON.stringify(this.profile))
      }
    },

    /**
     * 保存学习进度
     */
    saveLearningProgress() {
      localStorage.setItem('user_progress', JSON.stringify(this.progress))
    },

    /**
     * 保存成就数据
     */
    saveAchievements() {
      localStorage.setItem('user_achievements', JSON.stringify(this.achievements))
    },

    /**
     * 重置学习进度
     */
    resetProgress() {
      this.progress = { ...defaultProgress }
      this.achievements = initAchievements()

      localStorage.removeItem('user_progress')
      localStorage.removeItem('user_achievements')

      this.saveLearningProgress()
      this.saveAchievements()
    },

    /**
     * 重置用户数据
     */
    resetUserData() {
      this.profile = { ...defaultProfile, id: generateUserId() }
      this.progress = { ...defaultProgress }
      this.achievements = initAchievements()
      this.isLoggedIn = false

      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_progress')
      localStorage.removeItem('user_achievements')
    }
  }
})

