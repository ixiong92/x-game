<template>
  <div class="parent-panel-container">
    <StarBackground />
    
    <div class="parent-panel-content">
      <!-- 头部 -->
      <div class="header">
        <el-button
          circle
          size="large"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">家长监控</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 概览卡片 -->
      <div class="overview-cards">
        <GameCard class="overview-card" shadow="always">
          <div class="card-content">
            <div class="card-icon">🎮</div>
            <div class="card-info">
              <span class="card-label">总游戏次数</span>
              <span class="card-value">{{ userStore.learningProgress.totalGames }}</span>
            </div>
          </div>
        </GameCard>

        <GameCard class="overview-card" shadow="always">
          <div class="card-content">
            <div class="card-icon">📊</div>
            <div class="card-info">
              <span class="card-label">平均正确率</span>
              <span class="card-value">{{ accuracy }}%</span>
            </div>
          </div>
        </GameCard>

        <GameCard class="overview-card" shadow="always">
          <div class="card-content">
            <div class="card-icon">⏱</div>
            <div class="card-info">
              <span class="card-label">总学习时长</span>
              <span class="card-value">{{ formatTime(userStore.learningProgress.totalTime) }}</span>
            </div>
          </div>
        </GameCard>

        <GameCard class="overview-card" shadow="always">
          <div class="card-content">
            <div class="card-icon">⭐</div>
            <div class="card-info">
              <span class="card-label">最高分数</span>
              <span class="card-value">{{ userStore.learningProgress.bestScore }}</span>
            </div>
          </div>
        </GameCard>
      </div>

      <!-- 学习统计 -->
      <GameCard title="学习统计" shadow="always">
        <div class="stats-section">
          <div class="stat-row">
            <span class="stat-label">正确题数</span>
            <div class="stat-bar-wrapper">
              <el-progress
                :percentage="correctPercentage"
                :stroke-width="20"
                color="#50C878"
              >
                <span class="stat-text">{{ userStore.learningProgress.totalCorrect }}</span>
              </el-progress>
            </div>
          </div>

          <div class="stat-row">
            <span class="stat-label">错误题数</span>
            <div class="stat-bar-wrapper">
              <el-progress
                :percentage="wrongPercentage"
                :stroke-width="20"
                color="#E74C3C"
              >
                <span class="stat-text">{{ userStore.learningProgress.totalWrong }}</span>
              </el-progress>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 成就进度 -->
      <GameCard title="成就进度" shadow="always">
        <div class="achievement-progress">
          <div class="progress-header">
            <span>已解锁 {{ unlockedCount }}/{{ totalAchievements }} 个成就</span>
            <span>{{ achievementPercentage }}%</span>
          </div>
          <el-progress
            :percentage="achievementPercentage"
            :stroke-width="12"
            color="#FFD700"
          />
          
          <div class="achievement-list">
            <div
              v-for="achievement in userStore.achievements"
              :key="achievement.id"
              class="achievement-item"
              :class="{ 'unlocked': achievement.unlocked }"
            >
              <span class="achievement-icon">{{ achievement.icon }}</span>
              <span class="achievement-name">{{ achievement.name }}</span>
              <el-icon v-if="achievement.unlocked" color="#50C878"><Check /></el-icon>
              <el-icon v-else color="#999"><Lock /></el-icon>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 学习建议 -->
      <GameCard title="学习建议" shadow="always">
        <div class="suggestions">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
          >
            <div class="suggestion-icon">{{ suggestion.icon }}</div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-desc">{{ suggestion.description }}</div>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 时间控制 -->
      <GameCard title="时间控制" shadow="always">
        <div class="time-control">
          <div class="control-item">
            <span class="control-label">每日学习时长限制</span>
            <el-switch
              v-model="timeControl.enabled"
              active-text="开启"
              inactive-text="关闭"
              size="large"
              @change="saveTimeControl"
            />
          </div>
          
          <div v-if="timeControl.enabled" class="control-item">
            <span class="control-label">每日最长时长（分钟）</span>
            <el-slider
              v-model="timeControl.maxMinutes"
              :min="10"
              :max="120"
              :step="10"
              :marks="timeMarks"
              show-stops
              @change="saveTimeControl"
            />
          </div>

          <div class="control-info">
            <el-icon><InfoFilled /></el-icon>
            <span>今日已学习 {{ todayMinutes }} 分钟</span>
          </div>
        </div>
      </GameCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ArrowLeft, Check, Lock, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { StarBackground, GameCard } from '../components'
import soundManager from '../utils/sound-manager'
import { HapticFeedback } from '../utils/touch-handler'

const router = useRouter()
const userStore = useUserStore()

const timeControl = ref({
  enabled: false,
  maxMinutes: 60
})

const timeMarks = {
  10: '10分',
  30: '30分',
  60: '60分',
  90: '90分',
  120: '120分'
}

const todayMinutes = computed(() => {
  // 这里可以实现真实的今日学习时长统计
  return Math.floor(userStore.learningProgress.totalTime / 60)
})

const accuracy = computed(() => {
  const total = userStore.learningProgress.totalCorrect + userStore.learningProgress.totalWrong
  if (total === 0) return 0
  return Math.round((userStore.learningProgress.totalCorrect / total) * 100)
})

const totalQuestions = computed(() => 
  userStore.learningProgress.totalCorrect + userStore.learningProgress.totalWrong
)

const correctPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((userStore.learningProgress.totalCorrect / totalQuestions.value) * 100)
})

const wrongPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((userStore.learningProgress.totalWrong / totalQuestions.value) * 100)
})

const totalAchievements = computed(() => userStore.achievements.length)
const unlockedCount = computed(() => 
  userStore.achievements.filter(a => a.unlocked).length
)
const achievementPercentage = computed(() => 
  Math.round((unlockedCount.value / totalAchievements.value) * 100)
)

const suggestions = computed(() => {
  const result = []
  
  if (accuracy.value < 60) {
    result.push({
      icon: '💡',
      title: '加强基础练习',
      description: '当前正确率较低，建议从简单模式开始，巩固基础知识。'
    })
  } else if (accuracy.value >= 90) {
    result.push({
      icon: '🎉',
      title: '表现优秀',
      description: '正确率很高！可以尝试困难模式挑战自己。'
    })
  }
  
  if (userStore.learningProgress.totalGames < 10) {
    result.push({
      icon: '🎮',
      title: '保持练习',
      description: '建议每天坚持练习，养成良好的学习习惯。'
    })
  }
  
  if (todayMinutes.value > 60) {
    result.push({
      icon: '⏰',
      title: '注意休息',
      description: '今日学习时间较长，建议适当休息，保护视力。'
    })
  }
  
  if (result.length === 0) {
    result.push({
      icon: '👍',
      title: '学习状态良好',
      description: '继续保持当前的学习节奏，稳步提升。'
    })
  }
  
  return result
})

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

const goBack = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.back()
}

const saveTimeControl = () => {
  // 保存时间控制设置到 localStorage
  localStorage.setItem('timeControl', JSON.stringify(timeControl.value))
  soundManager.play('correct')
  HapticFeedback.light()
  ElMessage.success('设置已保存')
}

// 加载时间控制设置
const loadTimeControl = () => {
  const saved = localStorage.getItem('timeControl')
  if (saved) {
    timeControl.value = JSON.parse(saved)
  }
}

loadTimeControl()
</script>

<style scoped lang="scss">
@use '../assets/styles/variables.scss' as *;

.parent-panel-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.parent-panel-content {
  position: relative;
  z-index: 1;
  padding: $spacing-xl;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-base;
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-base;
}

.overview-card {
  animation: slideInUp 0.6s ease;
}

.card-content {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-base 0;
}

.card-icon {
  font-size: 40px;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.card-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.card-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.stat-label {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.stat-bar-wrapper {
  width: 100%;
}

.stat-text {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
}

.achievement-progress {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-top: $spacing-base;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-sm $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
  
  &.unlocked {
    background: linear-gradient(90deg, rgba(80, 200, 120, 0.1), transparent);
  }
}

.achievement-icon {
  font-size: 24px;
}

.achievement-name {
  flex: 1;
  font-size: $font-size-base;
  color: $text-primary;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.suggestion-item {
  display: flex;
  gap: $spacing-base;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
}

.suggestion-icon {
  font-size: 32px;
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.suggestion-title {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.suggestion-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.time-control {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.control-label {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.control-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-base;
  background: rgba(74, 144, 226, 0.1);
  border-radius: $border-radius-base;
  color: $primary-color;
  font-size: $font-size-sm;
}

// 响应式适配
@include respond-to('md') {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include respond-to('sm') {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>

