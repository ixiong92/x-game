<template>
  <div class="game-stats">
    <div class="stats-row">
      <!-- 得分 -->
      <div class="stat-item stat-score">
        <span class="stat-icon">⭐</span>
        <span class="stat-value">{{ score }}</span>
      </div>
      
      <!-- 连击 -->
      <div v-if="combo > 1" class="stat-item stat-combo">
        <span class="stat-label">连击</span>
        <span class="stat-value combo-value">{{ combo }}x</span>
      </div>
      
      <!-- 正确数 -->
      <div class="stat-item stat-correct">
        <span class="stat-icon">✓</span>
        <span class="stat-value">{{ correctCount }}</span>
      </div>
      
      <!-- 错误数 -->
      <div class="stat-item stat-wrong">
        <span class="stat-icon">✗</span>
        <span class="stat-value">{{ wrongCount }}</span>
      </div>
      
      <!-- 倒计时 -->
      <div v-if="showTimer" class="stat-item stat-timer">
        <span class="stat-icon">⏱</span>
        <span class="stat-value" :class="{ 'timer-warning': timeLeft <= 3 }">{{ timeLeft }}s</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  score: number
  combo: number
  correctCount: number
  wrongCount: number
  timeLeft: number
  showTimer: boolean
}

withDefaults(defineProps<Props>(), {
  score: 0,
  combo: 0,
  correctCount: 0,
  wrongCount: 0,
  timeLeft: 0,
  showTimer: false
})
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.game-stats {
  width: 100%;
  padding: $spacing-base $spacing-xl;
  background: transparent;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $border-radius-xl;
  min-width: 70px;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all $transition-base;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.stat-score {
  background: linear-gradient(135deg, #F39C12, #E67E22);
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.4);
}

.stat-combo {
  background: linear-gradient(135deg, #9B59B6, #8E44AD);
  box-shadow: 0 2px 8px rgba(155, 89, 182, 0.4);
  animation: comboPulse 0.5s ease infinite;
}

@keyframes comboPulse {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
}

.stat-correct {
  background: linear-gradient(135deg, #50C878, #27AE60);
  box-shadow: 0 2px 8px rgba(80, 200, 120, 0.4);
}

.stat-wrong {
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
}

.stat-timer {
  background: linear-gradient(135deg, #4A90E2, #357ABD);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4);
}

.stat-icon {
  font-size: $font-size-xl;
}

.stat-label {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $white;
}

.stat-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.combo-value {
  font-size: $font-size-2xl;
}

.timer-warning {
  color: #FF6B35;
  animation: timerBlink 0.5s ease infinite;
}

@keyframes timerBlink {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.5; 
  }
}

// 响应式适配
@include respond-to('sm') {
  .stats-row {
    gap: $spacing-base;
  }
  
  .stat-item {
    padding: $spacing-xs $spacing-base;
    min-width: 60px;
  }
  
  .stat-icon {
    font-size: $font-size-lg;
  }
  
  .stat-value {
    font-size: $font-size-lg;
  }
}
</style>

