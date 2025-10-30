<template>
  <div
    class="game-card"
    :class="cardClasses"
    @click="handleClick"
    @touchstart="handleTouchStart"
  >
    <div v-if="showRipple" class="card-ripple" :style="rippleStyle"></div>
    
    <div class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
    
    <div v-if="badge" class="card-badge">
      {{ badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HapticFeedback } from '../../utils/touch-handler'
import soundManager from '../../utils/sound-manager'

interface Props {
  title?: string
  badge?: string
  hoverable?: boolean
  clickable?: boolean
  shadow?: 'never' | 'hover' | 'always'
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  badge: '',
  hoverable: true,
  clickable: false,
  shadow: 'hover',
  bordered: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const showRipple = ref(false)
const rippleStyle = ref({})

const cardClasses = computed(() => [
  {
    'card-hoverable': props.hoverable,
    'card-clickable': props.clickable,
    'card-bordered': props.bordered,
    [`card-shadow-${props.shadow}`]: true
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.clickable) return
  
  soundManager.play('select')
  HapticFeedback.light()
  emit('click', event)
}

const handleTouchStart = (event: TouchEvent) => {
  if (!props.clickable) return
  
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

.game-card {
  position: relative;
  background: $white;
  border-radius: $border-radius-xl;
  overflow: hidden;
  transition: all $transition-base;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.card-hoverable {
  &:hover {
    transform: translateY(-4px);
  }
}

.card-clickable {
  cursor: pointer;
  
  &:active {
    transform: translateY(0);
  }
}

.card-bordered {
  border: 2px solid $border-color;
}

.card-shadow-never {
  box-shadow: none;
}

.card-shadow-hover {
  box-shadow: $shadow-base;
  
  &:hover {
    box-shadow: $shadow-xl;
  }
}

.card-shadow-always {
  box-shadow: $shadow-xl;
}

.card-header {
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-color;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), transparent);
}

.card-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.card-body {
  padding: $spacing-xl;
}

.card-footer {
  padding: $spacing-lg $spacing-xl;
  border-top: 1px solid $border-color;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.02));
}

.card-badge {
  position: absolute;
  top: $spacing-base;
  right: $spacing-base;
  padding: $spacing-xs $spacing-base;
  background: $error-color;
  color: $white;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  border-radius: $border-radius-base;
  box-shadow: $shadow-base;
  z-index: 10;
}

.card-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  animation: cardRipple 0.6s ease-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes cardRipple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}
</style>

