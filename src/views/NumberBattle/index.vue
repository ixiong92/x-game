<template>
  <div class="number-battle-container">
    <StarBackground />
    
    <!-- 游戏界面 -->
    <div v-if="gameStore.gameState.status === 'playing'" class="game-screen">
      <!-- 顶部统计 -->
      <GameStats
        :score="gameStore.gameState.progress.score"
        :combo="gameStore.gameState.progress.combo"
        :correct-count="gameStore.gameState.progress.correctCount"
        :wrong-count="gameStore.gameState.progress.wrongCount"
        :time-left="timeLeft"
        :show-timer="gameStore.gameState.config.difficulty === 'hard'"
      />

      <!-- 题目显示 -->
      <QuestionDisplay
        :question-text="currentQuestion?.text || ''"
        :current-index="gameStore.gameState.progress.currentIndex"
        :total-questions="gameStore.gameState.config.totalQuestions"
      />

      <!-- 游戏区域 -->
      <div class="game-area">
        <!-- 敌机 -->
        <EnemyPlane
          v-for="enemy in enemies"
          :key="enemy.id"
          :id="enemy.id"
          :value="enemy.value"
          :is-correct="enemy.isCorrect"
          :position="enemy.position"
          :color="enemy.color"
          :is-hit="enemy.isHit"
          :is-destroyed="enemy.isDestroyed"
          :is-active="activeEnemyId === enemy.id"
          :move-pattern="enemy.movePattern"
          :move-speed="enemy.moveSpeed"
          :move-range="enemy.moveRange"
          :is-moving="gameStore.gameState.config.enemyMoving"
          @click="handleEnemyClick"
        />
      </div>

      <!-- 控制按钮 -->
      <div class="game-controls">
        <el-button
          circle
          size="large"
          @click="pauseGame"
        >
          <el-icon><VideoPause /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 暂停界面 -->
    <div v-if="gameStore.gameState.status === 'paused'" class="pause-screen">
      <div class="pause-content">
        <h2 class="pause-title">游戏暂停</h2>
        <div class="pause-buttons">
          <GameButton
            type="success"
            size="large"
            @click="resumeGame"
          >
            <el-icon><VideoPlay /></el-icon>
            <span>继续游戏</span>
          </GameButton>
          <GameButton
            type="warning"
            size="large"
            @click="restartGame"
          >
            <el-icon><RefreshRight /></el-icon>
            <span>重新开始</span>
          </GameButton>
          <GameButton
            type="danger"
            size="large"
            @click="exitGame"
          >
            <el-icon><CloseBold /></el-icon>
            <span>退出游戏</span>
          </GameButton>
        </div>
      </div>
    </div>

    <!-- 粒子特效 -->
    <ParticleEffect
      :type="particleType"
      :count="particleCount"
      :trigger="particleTrigger"
      :position="particlePosition"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/game'
import { useUserStore } from '../../stores/user'
import { VideoPause, VideoPlay, RefreshRight, CloseBold } from '@element-plus/icons-vue'
import {
  StarBackground,
  GameStats,
  QuestionDisplay,
  EnemyPlane,
  GameButton,
  ParticleEffect
} from '../../components'
import soundManager from '../../utils/sound-manager'
import { HapticFeedback } from '../../utils/touch-handler'
import { EnemyPlaneManager } from '../../utils/game-logic'
import type { EnemyPlane as EnemyPlaneType } from '../../types/game'

const router = useRouter()
const gameStore = useGameStore()
const userStore = useUserStore()

const enemies = ref<EnemyPlaneType[]>([])
const activeEnemyId = ref<string>('')
const timeLeft = ref(10)
const countdownTimer = ref<number | null>(null)
const particleType = ref<'explosion' | 'success' | 'combo' | 'star'>('explosion')
const particleCount = ref(12)
const particleTrigger = ref(0)
const particlePosition = ref({ x: 50, y: 50 })

const currentQuestion = computed(() => gameStore.gameState.currentQuestion)
const currentBattleQuestion = computed(() => gameStore.currentBattleQuestion)

// 生成敌机
const generateEnemies = () => {
  if (!currentBattleQuestion.value) return

  // 合并正确答案和错误答案，然后打乱顺序
  const allAnswers = [
    currentBattleQuestion.value.correctAnswer,
    ...currentBattleQuestion.value.wrongAnswers
  ]

  // 打乱答案顺序，确保正确答案随机分配到不同位置
  const shuffledAnswers = shuffleArray(allAnswers)

  enemies.value = EnemyPlaneManager.createEnemies(
    shuffledAnswers,
    currentBattleQuestion.value.correctAnswer
  )
}

// 打乱数组顺序
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 处理敌机点击
const handleEnemyClick = (enemyId: string) => {
  const enemy = enemies.value.find(e => e.id === enemyId)
  if (!enemy || enemy.isHit || enemy.isDestroyed) return
  
  activeEnemyId.value = enemyId
  
  // 标记为已击中
  enemy.isHit = true
  
  if (enemy.isCorrect) {
    // 答对
    soundManager.play('correct')
    HapticFeedback.success()
    
    // 显示成功粒子
    particleType.value = 'success'
    particleCount.value = 16
    particleTrigger.value++
    
    // 延迟后摧毁敌机
    setTimeout(() => {
      enemy.isDestroyed = true
      soundManager.play('explosion')
      
      // 处理正确答案
      gameStore.handleCorrectAnswer()
      
      // 检查是否有连击
      if (gameStore.gameState.progress.combo > 1) {
        soundManager.play('combo')
        particleType.value = 'combo'
        particleTrigger.value++
      }
      
      // 下一题
      setTimeout(() => {
        nextQuestion()
      }, 800)
    }, 300)
  } else {
    // 答错
    soundManager.play('wrong')
    HapticFeedback.error()
    
    // 处理错误答案
    gameStore.handleWrongAnswer()
    
    // 恢复状态
    setTimeout(() => {
      enemy.isHit = false
      activeEnemyId.value = ''
    }, 1000)
  }
}

// 下一题
const nextQuestion = () => {
  if (gameStore.gameState.progress.currentIndex >= gameStore.gameState.config.totalQuestions - 1) {
    // 游戏结束
    endGame()
  } else {
    // 生成新题目
    gameStore.updateCurrentQuestion()
    generateEnemies()
    activeEnemyId.value = ''

    // 重置倒计时
    if (gameStore.gameState.config.difficulty === 'hard') {
      resetCountdown()
    }
  }
}

// 倒计时
const startCountdown = () => {
  if (gameStore.gameState.config.difficulty !== 'hard') return
  
  timeLeft.value = 10
  countdownTimer.value = window.setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 3 && timeLeft.value > 0) {
      soundManager.play('countdown')
    }
    
    if (timeLeft.value <= 0) {
      // 超时，算错误
      gameStore.handleWrongAnswer()
      nextQuestion()
    }
  }, 1000)
}

const resetCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  startCountdown()
}

const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 暂停游戏
const pauseGame = () => {
  soundManager.play('select')
  HapticFeedback.light()
  gameStore.pauseGame()
  stopCountdown()
}

// 继续游戏
const resumeGame = () => {
  soundManager.play('select')
  HapticFeedback.light()
  gameStore.resumeGame()
  if (gameStore.gameState.config.difficulty === 'hard') {
    startCountdown()
  }
}

// 重新开始
const restartGame = () => {
  soundManager.play('select')
  HapticFeedback.light()
  gameStore.resetGame()
  router.push('/number-battle/settings')
}

// 退出游戏
const exitGame = () => {
  soundManager.play('select')
  HapticFeedback.light()
  gameStore.endGame()
  router.push('/')
}

// 结束游戏
const endGame = () => {
  stopCountdown()
  soundManager.play('gameOver')
  
  const result = gameStore.endGame()
  
  // 更新用户进度
  userStore.updateLearningProgress({
    totalGames: 1,
    totalCorrect: result.correctCount,
    totalWrong: result.wrongCount,
    totalTime: result.totalTime,
    bestScore: result.score
  })
  
  // 检查成就
  userStore.checkAchievements()
  
  // 跳转到结果页面
  router.push('/result')
}

watch(() => gameStore.gameState.status, (newStatus) => {
  if (newStatus === 'playing') {
    if (gameStore.gameState.config.difficulty === 'hard') {
      startCountdown()
    }
  }
})

onMounted(() => {
  // 检查游戏状态
  if (gameStore.gameState.status !== 'playing') {
    router.push('/number-battle/settings')
    return
  }
  
  // 生成敌机
  generateEnemies()
  
  // 开始倒计时
  if (gameStore.gameState.config.difficulty === 'hard') {
    startCountdown()
  }
})

onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.number-battle-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.game-screen {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-area {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl;

  /* 驾驶舱效果 */
  border: 3px solid rgba(255, 215, 0, 0.4);
  border-radius: 20px;
  background:
    radial-gradient(ellipse at top left, rgba(255, 215, 0, 0.05), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(74, 144, 226, 0.05), transparent 50%);
  box-shadow:
    inset 0 0 30px rgba(255, 215, 0, 0.1),
    inset 0 0 60px rgba(74, 144, 226, 0.05),
    0 0 20px rgba(0, 0, 0, 0.3);

  /* 添加玻璃效果 */
  backdrop-filter: blur(2px);

  /* 边框发光效果 */
  animation: cockpitGlow 3s ease-in-out infinite;
}

@keyframes cockpitGlow {
  0%, 100% {
    box-shadow:
      inset 0 0 30px rgba(255, 215, 0, 0.1),
      inset 0 0 60px rgba(74, 144, 226, 0.05),
      0 0 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow:
      inset 0 0 40px rgba(255, 215, 0, 0.15),
      inset 0 0 80px rgba(74, 144, 226, 0.08),
      0 0 30px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.6);
  }
}

.game-controls {
  position: absolute;
  top: $spacing-xl;
  right: $spacing-xl;
  z-index: 100;
}

.pause-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.pause-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2xl;
  padding: $spacing-2xl;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-xl;
  backdrop-filter: blur(20px);
  box-shadow: $shadow-xl;
}

.pause-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
  width: 300px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 响应式适配
@include respond-to('sm') {
  .game-area {
    padding: $spacing-base;
  }

  .pause-buttons {
    width: 250px;
  }
}
</style>

