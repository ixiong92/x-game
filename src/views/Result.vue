<template>
  <div class="result-container">
    <StarBackground />
    
    <div class="result-content">
      <!-- 评级显示 - 只显示分值和笑脸 -->
      <div class="grade-display">
        <div class="grade-emoji">{{ gradeEmoji }}</div>
        <div class="score-display">
          <span class="score-label">最终得分</span>
          <span class="score-value">{{ result.score }}</span>
        </div>
      </div>

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

      <!-- 错误题目按钮 -->
      <div v-if="uniqueWrongQuestions.length > 0" class="wrong-questions-button-section">
        <GameButton
          type="warning"
          size="large"
          block
          @click="showWrongQuestionsDialog = true"
        >
          <span>❌ 查看错误题目 ({{ uniqueWrongQuestions.length }})</span>
        </GameButton>
      </div>

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
          :disabled="!buttonsEnabled"
          @click="playAgain"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>再玩一次{{ !buttonsEnabled ? `(${countdownSeconds}s)` : '' }}</span>
        </GameButton>

        <GameButton
          type="primary"
          size="large"
          block
          :disabled="!buttonsEnabled"
          @click="goHome"
        >
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页{{ !buttonsEnabled ? `(${countdownSeconds}s)` : '' }}</span>
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

    <!-- 错误题目弹层 -->
    <el-dialog
      v-model="showWrongQuestionsDialog"
      title="❌ 错误题目详情"
      width="90%"
      :close-on-click-modal="false"
      class="wrong-questions-dialog"
    >
      <div class="dialog-content">
        <div
          v-for="(question, index) in uniqueWrongQuestions"
          :key="`${question.index}-${question.userAnswer}`"
          class="wrong-question-item"
        >
          <div class="question-header">
            <span class="question-number">第 {{ question.index }} 题</span>
            <span class="question-index">({{ index + 1 }}/{{ uniqueWrongQuestions.length }})</span>
          </div>
          <div class="question-content">
            <div class="question-text">{{ question.question }}</div>
            <div class="question-answer">
              <div class="answer-row">
                <span class="answer-label">你的答案:</span>
                <span class="user-answer">{{ question.userAnswer === 0 ? '超时' : question.userAnswer }}</span>
              </div>
              <div class="answer-row">
                <span class="answer-label">正确答案:</span>
                <span class="correct-answer">{{ question.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
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
const showWrongQuestionsDialog = ref(false)
const buttonsEnabled = ref(false)
const countdownSeconds = ref(5)

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

const gradeEmoji = computed(() => {
  // 满分显示笑脸，其余显示哭脸
  if (result.value.wrongCount === 0) {
    return '😄'  // 满分笑脸
  }
  return '😢'  // 其他分值哭脸
})

const uniqueWrongQuestions = computed(() => {
  if (!result.value.wrongQuestions || result.value.wrongQuestions.length === 0) {
    return []
  }

  // 去重：按题目索引和用户答案去重
  const seen = new Set<string>()
  const unique = []

  for (const question of result.value.wrongQuestions) {
    const key = `${question.index}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(question)
    }
  }

  return unique
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

  // 如果有错误题目，自动打开错误题目弹层
  if (uniqueWrongQuestions.value.length > 0) {
    setTimeout(() => {
      showWrongQuestionsDialog.value = true
    }, 500)
  }

  // 5秒后启用按钮，并显示倒计时
  let countdown = 5
  countdownSeconds.value = countdown

  const countdownInterval = setInterval(() => {
    countdown--
    countdownSeconds.value = countdown

    if (countdown <= 0) {
      clearInterval(countdownInterval)
      buttonsEnabled.value = true
    }
  }, 1000)
})
</script>

<style scoped lang="scss">
@use '../assets/styles/variables.scss' as *;

.result-container {
  width: 100%;
  min-height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
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
  -webkit-overflow-scrolling: touch;

  // iPad 横屏优化
  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-base;
    gap: $spacing-sm;
    max-height: 100vh;
    overflow-y: auto;
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

.grade-emoji {
  font-size: 80px;
  animation: bounce 1s ease-in-out infinite;
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 60px;
  }
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  animation: slideInUp 0.6s ease 0.2s both;

  @media (min-width: 1024px) and (orientation: landscape) {
    gap: $spacing-xs;
  }
}

.score-display .score-label {
  font-size: $font-size-base;
  color: rgba($white, 0.8);
  font-weight: $font-weight-medium;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-sm;
  }
}

.score-display .score-value {
  font-size: 48px;
  font-weight: $font-weight-bold;
  color: $white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 36px;
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

.wrong-questions-section {
  animation: slideInUp 0.6s ease 0.5s both;
  flex-shrink: 0;
  max-height: 150px;
  overflow-y: auto;

  @media (min-width: 1024px) and (orientation: landscape) {
    max-height: 100px;
  }
}

.wrong-questions-title {
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

.wrong-questions-card {
  animation: slideInUp 0.6s ease 0.5s both;
}

.wrong-questions-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.wrong-question-item {
  padding: $spacing-sm;
  background: rgba(255, 100, 100, 0.1);
  border-left: 3px solid #FF6464;
  border-radius: $border-radius-base;
  flex-shrink: 0;

  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-xs;
    gap: $spacing-xs;
  }
}

.question-number {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: #FF6464;
  margin-bottom: $spacing-xs;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-xs;
  }
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.question-text {
  font-size: $font-size-sm;
  color: $text-primary;
  word-break: break-word;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-xs;
  }
}

.question-answer {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  color: $text-secondary;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 10px;
  }
}

.user-answer {
  color: #FF6464;
}

.correct-answer {
  color: #00E676;
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

.wrong-questions-button-section {
  animation: slideInUp 0.6s ease 0.6s both;
  flex-shrink: 0;
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

// 错误题目弹层样式
:deep(.wrong-questions-dialog) {
  .el-overlay {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .el-dialog {
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .el-dialog__header {
    background: linear-gradient(135deg, #FF6B6B, #FF4757);
    border-radius: 20px 20px 0 0;
    padding: $spacing-lg;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (min-width: 1024px) and (orientation: landscape) {
      padding: $spacing-base;
    }

    .el-dialog__title {
      color: $white;
      font-weight: $font-weight-bold;
      font-size: 28px;
      flex: 1;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (min-width: 1024px) and (orientation: landscape) {
        font-size: 24px;
      }
    }

    .el-dialog__close {
      color: $white;
      font-size: 32px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      flex-shrink: 0;

      @media (min-width: 1024px) and (orientation: landscape) {
        font-size: 28px;
        width: 40px;
        height: 40px;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.4);
        transform: scale(1.1);
      }
    }
  }

  .el-dialog__body {
    padding: $spacing-lg;
    max-height: 65vh;
    overflow-y: auto;
    background: linear-gradient(135deg, #1a1a2e, #16213e);

    @media (min-width: 1024px) and (orientation: landscape) {
      padding: $spacing-base;
      max-height: 70vh;
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #FF6B6B, #FF4757);
      border-radius: 10px;

      &:hover {
        background: linear-gradient(135deg, #FF8E72, #FF6B6B);
      }
    }
  }

  .el-dialog__footer {
    padding: $spacing-lg;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 71, 87, 0.1));
    border-top: 2px solid rgba(255, 107, 107, 0.3);
    display: flex;
    justify-content: flex-end;
    gap: $spacing-base;

    @media (min-width: 1024px) and (orientation: landscape) {
      padding: $spacing-base;
    }

    button {
      padding: $spacing-sm $spacing-lg;
      border-radius: 10px;
      font-weight: $font-weight-bold;
      font-size: $font-size-base;
      cursor: pointer;
      transition: all 0.3s ease;

      @media (min-width: 1024px) and (orientation: landscape) {
        padding: $spacing-xs $spacing-sm;
        font-size: $font-size-sm;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @media (min-width: 1024px) and (orientation: landscape) {
    gap: $spacing-base;
  }
}

.wrong-question-item {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 71, 87, 0.15));
  border-radius: 16px;
  padding: $spacing-lg;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 107, 107, 0.4);
  border-left: 6px solid #FF6B6B;
  animation: slideInLeft 0.4s ease;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;

  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-base;
    border-radius: 12px;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(255, 71, 87, 0.25));
    border-color: rgba(255, 107, 107, 0.6);
    box-shadow: 0 12px 32px rgba(255, 107, 107, 0.3);
  }
}

.question-header {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  margin-bottom: $spacing-lg;
  font-weight: $font-weight-bold;
  color: $white;

  @media (min-width: 1024px) and (orientation: landscape) {
    margin-bottom: $spacing-base;
    gap: $spacing-sm;
  }
}

.question-number {
  font-size: 24px;
  color: #FF6B6B;
  font-weight: $font-weight-bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 18px;
  }
}

.question-index {
  font-size: $font-size-base;
  color: rgba($white, 0.7);
  background: rgba(255, 107, 107, 0.2);
  padding: 4px 12px;
  border-radius: 20px;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: $font-size-sm;
    padding: 2px 8px;
  }
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @media (min-width: 1024px) and (orientation: landscape) {
    gap: $spacing-base;
  }
}

.question-text {
  font-size: 22px;
  color: $white;
  font-weight: $font-weight-bold;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 18px;
  }
}

.question-answer {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 1024px) and (orientation: landscape) {
    padding: $spacing-base;
    gap: $spacing-base;
  }
}

.answer-row {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  font-size: 18px;
  font-weight: $font-weight-medium;

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 14px;
    gap: $spacing-base;
  }
}

.answer-label {
  color: rgba($white, 0.8);
  min-width: 80px;
  font-weight: $font-weight-bold;

  @media (min-width: 1024px) and (orientation: landscape) {
    min-width: 60px;
    font-size: $font-size-sm;
  }
}

.user-answer {
  color: #FF6B6B;
  font-weight: $font-weight-bold;
  font-size: 20px;
  background: rgba(255, 107, 107, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.4);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 16px;
    padding: 4px 12px;
  }
}

.correct-answer {
  color: #50C878;
  font-weight: $font-weight-bold;
  font-size: 20px;
  background: rgba(80, 200, 120, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(80, 200, 120, 0.4);

  @media (min-width: 1024px) and (orientation: landscape) {
    font-size: 16px;
    padding: 4px 12px;
  }
}

// 响应式适配已在各组件中定义
</style>

