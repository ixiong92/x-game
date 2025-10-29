<template>
  <div class="settings-container">
    <StarBackground />

    <div class="settings-content">
      <!-- 标题 -->
      <div class="settings-header">
        <el-button
          circle
          size="large"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="settings-title">数字大战 - 游戏设置</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 横屏布局：左右分栏 -->
      <div class="settings-layout">
        <!-- 左侧：游戏配置 -->
        <div class="settings-left">
          <GameCard title="游戏配置" shadow="always">
            <div class="config-section">
              <!-- 运算模式 -->
              <div class="config-item">
                <label class="config-label">运算模式</label>
                <div class="mode-selector">
                  <div
                    v-for="mode in modes"
                    :key="mode.value"
                    class="mode-item touch-feedback"
                    :class="{ 'mode-active': config.mode === mode.value }"
                    @click="selectMode(mode.value)"
                  >
                    <span class="mode-icon">{{ mode.icon }}</span>
                    <span class="mode-label">{{ mode.label }}</span>
                  </div>
                </div>
              </div>

              <!-- 数字范围 -->
              <div class="config-item">
                <label class="config-label">数字范围</label>
                <div class="range-selector">
                  <div
                    v-for="range in numberRanges"
                    :key="range.value"
                    class="range-item touch-feedback"
                    :class="{ 'range-active': config.numberRange === range.value }"
                    @click="selectRange(range.value)"
                  >
                    <span class="range-label">{{ range.label }}</span>
                  </div>
                </div>
              </div>

              <!-- 难度等级 -->
              <div class="config-item">
                <label class="config-label">难度等级</label>
                <div class="difficulty-selector">
                  <div
                    v-for="diff in difficulties"
                    :key="diff.value"
                    class="difficulty-item touch-feedback"
                    :class="{ 'difficulty-active': config.difficulty === diff.value }"
                    @click="selectDifficulty(diff.value)"
                  >
                    <span class="difficulty-icon">{{ diff.icon }}</span>
                    <div class="difficulty-info">
                      <span class="difficulty-label">{{ diff.label }}</span>
                      <span class="difficulty-desc">{{ diff.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GameCard>
        </div>

        <!-- 右侧：其他设置和开始按钮 -->
        <div class="settings-right">
          <GameCard title="其他设置" shadow="always">
            <div class="other-settings">
              <!-- 题目数量 -->
              <div class="setting-item">
                <label class="setting-label">题目数量</label>
                <div class="slider-wrapper">
                  <el-slider
                    v-model="config.questionCount"
                    :min="5"
                    :max="30"
                    :step="5"
                    :marks="questionMarks"
                    show-stops
                  />
                </div>
              </div>

              <!-- 敌机移动 -->
              <div class="setting-item">
                <label class="setting-label">敌机移动</label>
                <el-switch
                  v-model="config.enemyMoving"
                  active-text="开启"
                  inactive-text="关闭"
                  size="large"
                />
              </div>
            </div>
          </GameCard>

          <!-- 开始游戏按钮 -->
          <div class="start-button-wrapper">
            <GameButton
              type="success"
              size="large"
              block
              @click="startGame"
            >
              <el-icon><VideoPlay /></el-icon>
              <span>开始游戏</span>
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/game'
import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
import { GameCard, GameButton, StarBackground } from '../../components'
import soundManager from '../../utils/sound-manager'
import { HapticFeedback } from '../../utils/touch-handler'
import type { CalculationMode, DifficultyLevel } from '../../types/game'

const router = useRouter()
const gameStore = useGameStore()

const config = ref({
  mode: 'add' as CalculationMode,
  numberRange: 10,
  difficulty: 'easy' as DifficultyLevel,
  questionCount: 10,
  enemyMoving: false  // 默认敌机不移动
})

const modes = [
  { value: 'add' as CalculationMode, label: '加法', icon: '➕' },
  { value: 'subtract' as CalculationMode, label: '减法', icon: '➖' },
  { value: 'multiply' as CalculationMode, label: '乘法', icon: '✖️' },
  { value: 'divide' as CalculationMode, label: '除法', icon: '➗' }
]

const numberRanges = [
  { value: 10, label: '1-10' },
  { value: 20, label: '1-20' },
  { value: 50, label: '1-50' },
  { value: 100, label: '1-100' }
]

const difficulties = [
  {
    value: 'easy' as DifficultyLevel,
    label: '简单',
    icon: '😊',
    desc: '无时间限制，轻松学习'
  },
  {
    value: 'hard' as DifficultyLevel,
    label: '困难',
    icon: '😤',
    desc: '10秒倒计时，挑战极限'
  }
]

const questionMarks = {
  5: '5题',
  10: '10题',
  15: '15题',
  20: '20题',
  25: '25题',
  30: '30题'
}

const selectMode = (mode: CalculationMode) => {
  config.value.mode = mode
  soundManager.play('select')
  HapticFeedback.light()
}

const selectRange = (range: number) => {
  config.value.numberRange = range
  soundManager.play('select')
  HapticFeedback.light()
}

const selectDifficulty = (difficulty: DifficultyLevel) => {
  config.value.difficulty = difficulty
  soundManager.play('select')
  HapticFeedback.light()
}

const startGame = () => {
  soundManager.play('gameStart')
  HapticFeedback.medium()

  // 保存配置并开始游戏
  gameStore.startGame({
    mode: config.value.mode,
    numberRange: config.value.numberRange,
    difficulty: config.value.difficulty,
    questionCount: config.value.questionCount,
    enemyMoving: config.value.enemyMoving
  })

  router.push('/number-battle')
}

const goBack = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.back()
}
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.settings-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
}

.settings-content {
  position: relative;
  z-index: 1;
  padding: $spacing-xl;
  max-width: 1400px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
}

.settings-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

// 横屏布局：左右分栏
.settings-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $spacing-xl;
  align-items: start;
}

.settings-left {
  animation: slideInLeft 0.6s ease;
}

.settings-right {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  animation: slideInRight 0.6s ease;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.config-label {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

// 运算模式选择器
.mode-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-base;
}

.mode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-lg;
  background: $bg-secondary;
  border: 3px solid $border-color;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  min-height: 100px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }

  &.mode-active {
    background: $primary-color;
    border-color: $primary-color;
    color: $white;
    box-shadow: $shadow-lg, $glow-primary;
    transform: scale(1.05);
  }
}

.mode-icon {
  font-size: 40px;
}

.mode-label {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
}

// 数字范围选择器
.range-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-base;
}

.range-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background: $bg-secondary;
  border: 3px solid $border-color;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  min-height: 80px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }

  &.range-active {
    background: $info-color;
    border-color: $info-color;
    color: $white;
    box-shadow: $shadow-lg, 0 0 20px rgba(24, 144, 255, 0.6);
    transform: scale(1.05);
  }
}

.range-label {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
}

// 难度选择器
.difficulty-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-base;
}

.difficulty-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-lg;
  background: $bg-secondary;
  border: 3px solid $border-color;
  border-radius: $border-radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  min-height: 100px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }

  &.difficulty-active {
    background: $success-color;
    border-color: $success-color;
    color: $white;
    box-shadow: $shadow-lg, $glow-success;
    transform: scale(1.05);
  }
}

.difficulty-icon {
  font-size: 40px;
}

.difficulty-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.difficulty-label {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
}

.difficulty-desc {
  font-size: $font-size-base;
  opacity: 0.9;
}

// 其他设置
.other-settings {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  padding: $spacing-base 0;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.setting-label {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.slider-wrapper {
  padding: $spacing-base 0;
}

// 开始按钮
.start-button-wrapper {
  margin-top: auto;

  :deep(.game-button) {
    font-size: $font-size-xl;
    padding: $spacing-xl;
    height: auto;
  }
}

// 触摸反馈
.touch-feedback {
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.95) !important;
    opacity: 0.9;
  }
}

// 响应式适配 - 竖屏时改为单栏
@media (max-width: 1024px) or (orientation: portrait) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .mode-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .range-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .difficulty-selector {
    grid-template-columns: 1fr;
  }
}
</style>

