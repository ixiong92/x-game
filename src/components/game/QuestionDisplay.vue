<template>
  <div class="question-display">
    <div class="question-container">
      <span class="question-text">{{ questionText }}</span>
    </div>
    <div class="progress-info">
      <span class="progress-text">第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  questionText: string
  currentIndex: number
  totalQuestions: number
}

withDefaults(defineProps<Props>(), {
  questionText: '',
  currentIndex: 0,
  totalQuestions: 10
})
</script>

<style scoped lang="scss">
@use '../../assets/styles/variables.scss' as *;

.question-display {
  width: 100%;
  padding: $spacing-base $spacing-xl;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  position: relative;
  z-index: 10;
}

.question-container {
  background: rgba(255, 255, 255, 0.98);
  border-radius: $border-radius-lg;
  padding: $spacing-lg $spacing-2xl;
  box-shadow: $shadow-xl;
  max-width: 400px;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 215, 0, 0.5);
  animation: questionPulse 2s ease-in-out infinite;
}

@keyframes questionPulse {
  0%, 100% {
    box-shadow: $shadow-xl;
  }
  50% {
    box-shadow: $shadow-xl, $glow-primary;
  }
}

.question-text {
  font-size: $game-font-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-align: center;
  letter-spacing: 4px;
  line-height: 1.2;
}

.progress-info {
  padding: $spacing-sm $spacing-lg;
  background: rgba(255, 215, 0, 0.95);
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  box-shadow: $shadow-lg;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.progress-text {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

// 响应式适配
@include respond-to('sm') {
  .question-text {
    font-size: $game-font-lg;
  }
}

@include respond-to('md') {
  .question-text {
    font-size: $game-font-xl;
  }
}
</style>

