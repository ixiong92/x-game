<template>
  <transition name="fade">
    <div v-if="visible" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner-wrapper">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
        </div>
        <p class="loading-text">{{ text }}</p>
        <div v-if="showProgress" class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
  progress?: number
  showProgress?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...',
  progress: 0,
  showProgress: false
})
</script>

<style scoped lang="scss">
@use '../../assets/styles/variables.scss' as *;

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xl;
}

.loading-spinner-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.loading-spinner {
  position: relative;
  width: 100%;
  height: 100%;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  
  &:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: $success-color;
    animation-duration: 1.2s;
    animation-direction: reverse;
  }
  
  &:nth-child(3) {
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border-top-color: $warning-color;
    animation-duration: 0.9s;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-progress {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $border-radius-base;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $success-color);
  border-radius: $border-radius-base;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.6);
}

.progress-text {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $white;
}

// 淡入淡出过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

