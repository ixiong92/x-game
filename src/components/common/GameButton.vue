<template>
  <button
    class="game-button"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @touchstart="handleTouchStart"
  >
    <span v-if="loading" class="button-loading">
      <span class="loading-spinner"></span>
    </span>
    <span v-if="icon && !loading" class="button-icon">
      <component :is="icon" />
    </span>
    <span class="button-text">
      <slot>{{ text }}</slot>
    </span>
    <div v-if="showRipple" class="button-ripple" :style="rippleStyle"></div>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HapticFeedback } from '../../utils/touch-handler'
import soundManager from '../../utils/sound-manager'

interface Props {
  text?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: any
  round?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  round: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const showRipple = ref(false)
const rippleStyle = ref({})

const buttonClasses = computed(() => [
  `button-${props.type}`,
  `button-${props.size}`,
  {
    'button-round': props.round,
    'button-block': props.block,
    'button-disabled': props.disabled,
    'button-loading': props.loading
  }
])

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  
  soundManager.play('select')
  HapticFeedback.light()
  emit('click', event)
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled || props.loading) return
  
  const touch = event.touches[0]
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  rippleStyle.value = {
    left: `${x}px`,
    top: `${y}px`
  }
  
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 600)
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/variables.scss' as *;

.game-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-base $spacing-xl;
  border: none;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $white;
  background: $primary-color;
  cursor: pointer;
  transition: all $transition-base;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: $shadow-base;
  
  &:hover:not(.button-disabled):not(.button-loading) {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &:active:not(.button-disabled):not(.button-loading) {
    transform: translateY(0);
    box-shadow: $shadow-sm;
  }
}

// 按钮类型
.button-primary {
  background: linear-gradient(135deg, $primary-color, darken($primary-color, 10%));
  
  &:hover:not(.button-disabled) {
    background: linear-gradient(135deg, lighten($primary-color, 5%), $primary-color);
  }
}

.button-success {
  background: linear-gradient(135deg, $success-color, darken($success-color, 10%));
  
  &:hover:not(.button-disabled) {
    background: linear-gradient(135deg, lighten($success-color, 5%), $success-color);
  }
}

.button-warning {
  background: linear-gradient(135deg, $warning-color, darken($warning-color, 10%));
  
  &:hover:not(.button-disabled) {
    background: linear-gradient(135deg, lighten($warning-color, 5%), $warning-color);
  }
}

.button-danger {
  background: linear-gradient(135deg, $error-color, darken($error-color, 10%));
  
  &:hover:not(.button-disabled) {
    background: linear-gradient(135deg, lighten($error-color, 5%), $error-color);
  }
}

.button-info {
  background: linear-gradient(135deg, $info-color, darken($info-color, 10%));
  
  &:hover:not(.button-disabled) {
    background: linear-gradient(135deg, lighten($info-color, 5%), $info-color);
  }
}

// 按钮尺寸
.button-small {
  padding: $spacing-xs $spacing-base;
  font-size: $font-size-sm;
  border-radius: $border-radius-base;
}

.button-medium {
  padding: $spacing-base $spacing-xl;
  font-size: $font-size-base;
}

.button-large {
  padding: $spacing-lg $spacing-2xl;
  font-size: $font-size-lg;
  border-radius: $border-radius-xl;
}

// 圆角按钮
.button-round {
  border-radius: 999px;
}

// 块级按钮
.button-block {
  width: 100%;
  display: flex;
}

// 禁用状态
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  
  &:hover {
    transform: none;
    box-shadow: $shadow-base;
  }
}

// 加载状态
.button-loading {
  cursor: wait;
}

.button-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: $white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
}

.button-text {
  display: flex;
  align-items: center;
}

// 触摸波纹
.button-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: buttonRipple 0.6s ease-out;
  pointer-events: none;
}

@keyframes buttonRipple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}
</style>

