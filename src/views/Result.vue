<template>
  <div class="result-container">
    <StarBackground />
    
    <div class="result-content">
      <!-- 评级显示 -->
      <div class="grade-display">
        <div class="grade-icon" :class="`grade-${result.grade.toLowerCase()}`">
          {{ result.grade }}
        </div>
        <h2 class="grade-text">{{ gradeText }}</h2>
      </div>

      <!-- 得分卡片 -->
      <GameCard class="score-card" shadow="always">
        <div class="score-main">
          <span class="score-label">最终得分</span>
          <span class="score-value">{{ result.score }}</span>
        </div>
      </GameCard>

      <!-- 统计数据 -->
      <GameCard class="stats-card" shadow="always">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">✓</span>
            <div class="stat-info">
              <span class="stat-label">正确</span>
              <span class="stat-value">{{ result.correctCount }}</span>
            </div>
          </div>
          
          <div class="stat-item">
            <span class="stat-icon">✗</span>
            <div class="stat-info">
              <span class="stat-label">错误</span>
              <span class="stat-value">{{ result.wrongCount }}</span>
            </div>
          </div>
          
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <div class="stat-info">
              <span class="stat-label">正确率</span>
              <span class="stat-value">{{ result.accuracy }}%</span>
            </div>
          </div>
          
          <div class="stat-item">
            <span class="stat-icon">⏱</span>
            <div class="stat-info">
              <span class="stat-label">用时</span>
              <span class="stat-value">{{ formatTime(result.totalTime) }}</span>
            </div>
          </div>
          
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <div class="stat-info">
              <span class="stat-label">最高连击</span>
              <span class="stat-value">{{ result.maxCombo }}x</span>
            </div>
          </div>
          
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <div class="stat-info">
              <span class="stat-label">平均分</span>
              <span class="stat-value">{{ result.averageScore }}</span>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 成就解锁 -->
      <div v-if="newAchievements.length > 0" class="achievements-section">
        <h3 class="achievements-title">🎉 解锁新成就</h3>
        <div class="achievements-list">
          <div
            v-for="achievement in newAchievements"
            :key="achievement.id"
            class="achievement-item"
          >
            <span class="achievement-icon">{{ achievement.icon }}</span>
            <div class="achievement-info">
              <span class="achievement-name">{{ achievement.name }}</span>
              <span class="achievement-desc">{{ achievement.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <GameButton
          type="success"
          size="large"
          block
          @click="playAgain"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>再玩一次</span>
        </GameButton>
        
        <GameButton
          type="primary"
          size="large"
          block
          @click="goHome"
        >
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </GameButton>
      </div>
    </div>

    <!-- 烟花特效 -->
    <ParticleEffect
      v-if="showFireworks"
      type="star"
      :count="20"
      :trigger="fireworksTrigger"
      :position="{ x: 50, y: 30 }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useUserStore } from '../stores/user'
import { RefreshRight, HomeFilled } from '@element-plus/icons-vue'
import { StarBackground, GameCard, GameButton, ParticleEffect } from '../components'
import soundManager from '../utils/sound-manager'
import { HapticFeedback } from '../utils/touch-handler'

const router = useRouter()
const gameStore = useGameStore()
const userStore = useUserStore()

const showFireworks = ref(false)
const fireworksTrigger = ref(0)

const result = computed(() => gameStore.gameState.result || {
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  accuracy: 0,
  totalTime: 0,
  maxCombo: 0,
  averageScore: 0,
  grade: 'C'
})

const gradeText = computed(() => {
  const texts: Record<string, string> = {
    'S': '完美！',
    'A': '优秀！',
    'B': '良好！',
    'C': '及格！',
    'D': '继续努力！'
  }
  return texts[result.value.grade] || '继续努力！'
})

const newAchievements = computed(() => {
  return userStore.achievements.filter(a => {
    // 这里可以检查是否是新解锁的成就
    return a.unlocked && a.unlockedAt > Date.now() - 5000
  })
})

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

const playAgain = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.push('/number-battle/settings')
}

const goHome = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.push('/')
}

onMounted(() => {
  // 检查是否有结果
  if (!result.value || result.value.score === 0) {
    router.push('/')
    return
  }
  
  // 根据评级播放音效和特效
  if (result.value.grade === 'S' || result.value.grade === 'A') {
    showFireworks.value = true
    setTimeout(() => {
      fireworksTrigger.value++
    }, 500)
    setTimeout(() => {
      fireworksTrigger.value++
    }, 1500)
  }
})
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.result-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content {
  position: relative;
  z-index: 1;
  padding: $spacing-lg;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
  overflow-y: auto;
  overflow-x: hidden;

  // iPad 横屏优化
  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-base;
    gap: $spacing-sm;
    max-height: 100vh;
  }
}

.grade-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-base;
  margin-bottom: $spacing-base;
  animation: zoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }
}

.grade-icon {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: $font-weight-bold;
  color: $white;
  border-radius: 50%;
  box-shadow: $shadow-xl;
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    width: 100px;
    height: 100px;
    font-size: 52px;
  }
  
  &.grade-s {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    box-shadow: $shadow-xl, 0 0 40px rgba(255, 215, 0, 0.6);
  }
  
  &.grade-a {
    background: linear-gradient(135deg, #50C878, #27AE60);
    box-shadow: $shadow-xl, 0 0 40px rgba(80, 200, 120, 0.6);
  }
  
  &.grade-b {
    background: linear-gradient(135deg, #4A90E2, #357ABD);
    box-shadow: $shadow-xl, 0 0 40px rgba(74, 144, 226, 0.6);
  }
  
  &.grade-c {
    background: linear-gradient(135deg, #F39C12, #E67E22);
  }
  
  &.grade-d {
    background: linear-gradient(135deg, #E74C3C, #C0392B);
  }
}

.grade-text {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-xl;
  }
}

.score-card {
  animation: slideInUp 0.6s ease 0.2s both;
  flex-shrink: 0;
}

.score-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-base 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    gap: $spacing-xs;
    padding: $spacing-sm 0;
  }
}

.score-label {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-secondary;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-sm;
  }
}

.score-value {
  font-size: 48px;
  font-weight: $font-weight-bold;
  color: $primary-color;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 40px;
  }
}

.stats-card {
  animation: slideInUp 0.6s ease 0.4s both;
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-base;

  @media (min-width: 1024px) and (orientation: landscape) {
    grid-template-columns: repeat(6, 1fr);
    gap: $spacing-sm;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: $bg-secondary;
  border-radius: $border-radius-base;
  text-align: center;

  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-xs;
    gap: $spacing-xs;
  }
}

.stat-icon {
  font-size: 24px;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 20px;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  width: 100%;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-secondary;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 10px;
  }
}

.stat-value {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-sm;
  }
}

.achievements-section {
  animation: slideInUp 0.6s ease 0.6s both;
  flex-shrink: 0;
  max-height: 120px;
  overflow-y: auto;

  @media (min-width: 1024px) and (orientation: landscape) {
    max-height: 80px;
  }
}

.achievements-title {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $white;
  text-align: center;
  margin-bottom: $spacing-xs;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-sm;
    margin-bottom: $spacing-xs;
  }
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-base;
  backdrop-filter: blur(10px);
  animation: bounceIn 0.6s ease;
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-xs;
    gap: $spacing-xs;
  }
}

.achievement-icon {
  font-size: 24px;
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 18px;
  }
}

.achievement-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  min-width: 0;
}

.achievement-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $white;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-xs;
  }
}

.achievement-desc {
  font-size: $font-size-xs;
  color: rgba(255, 255, 255, 0.8);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 10px;
  }
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
  animation: slideInUp 0.6s ease 0.8s both;
  flex-shrink: 0;

  @media (max-width: 1023px) {
    flex-direction: column;
    gap: $spacing-base;
  }
}

// 响应式适配已在各组件中定义
</style>

