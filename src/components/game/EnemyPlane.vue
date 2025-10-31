<template>
  <div
    class="enemy-plane"
    :class="planeClasses"
    :style="planeStyle"
    @click="handleClick"
    @touchstart="handleTouchStart"
  >
    <!-- 点击高亮指示器 -->
    <div v-if="isActive" class="active-indicator">
      <div class="active-ring active-ring-outer"></div>
      <div class="active-ring active-ring-inner"></div>
      <div class="active-crosshair">
        <div class="crosshair-line crosshair-h"></div>
        <div class="crosshair-line crosshair-v"></div>
      </div>
      <div class="target-corners">
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
      </div>
    </div>

    <!-- 引擎尾焰 -->
    <div class="engine-flame">
      <div class="flame flame-1"></div>
      <div class="flame flame-2"></div>
      <div class="flame flame-3"></div>
    </div>

    <div class="plane-body">
      <!-- 机翼 -->
      <div class="plane-wing plane-wing-top"></div>
      <div class="plane-wing plane-wing-bottom"></div>

      <!-- 驾驶舱 -->
      <div class="plane-cockpit">
        <div class="cockpit-glass"></div>
        <span class="answer-text">{{ value }}</span>
        <div class="cockpit-detail"></div>
      </div>

      <!-- 尾翼 -->
      <div class="plane-tail">
        <div class="tail-fin"></div>
      </div>
    </div>

    <!-- 爆炸效果 -->
    <div v-if="isDestroyed" class="explosion">
      <div class="explosion-core"></div>
      <div v-for="i in 12" :key="i" class="explosion-particle"></div>
      <div class="explosion-ring"></div>
      <div class="explosion-flash"></div>
    </div>

    <!-- 错误提示 -->
    <div v-if="isHit && !isCorrect" class="wrong-indicator">
      <div class="wrong-icon">
        <span class="wrong-text">✗</span>
      </div>
      <div class="wrong-wave"></div>
    </div>

    <!-- 触摸波纹 -->
    <div v-if="showRipple" class="touch-ripple" :style="rippleStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { HapticFeedback } from '../../utils/touch-handler'

interface Props {
  id: string
  value: number
  isCorrect?: boolean
  position?: { x: number; y: number }
  color?: string  // 支持十六进制颜色或颜色名称
  isHit?: boolean
  isDestroyed?: boolean
  isActive?: boolean
  movePattern?: string
  moveSpeed?: number
  moveRange?: number
  isMoving?: boolean
  isClickDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCorrect: false,
  position: () => ({ x: 0, y: 0 }),
  color: 'blue',
  isHit: false,
  isDestroyed: false,
  isActive: false,
  movePattern: 'horizontal',
  moveSpeed: 2,
  moveRange: 150,
  isMoving: true,
  isClickDisabled: false
})

const emit = defineEmits<{
  click: [id: string]
}>()

const currentX = ref(0)
const currentY = ref(0)
const baseX = ref(0)  // 初始位置基准点
const baseY = ref(0)  // 初始位置基准点
const moveDirection = ref(1)
const moveAngle = ref(0)
const animationTimer = ref<number | null>(null)
const showRipple = ref(false)
const rippleStyle = ref({})
const frozenX = ref<number | null>(null)  // 冻结的X位置
const frozenY = ref<number | null>(null)  // 冻结的Y位置

const planeClasses = computed(() => [
  `plane-${props.color}`,
  { 'plane-hit': props.isHit },
  { 'plane-destroyed': props.isDestroyed },
  { 'plane-active': props.isActive }
])

const planeStyle = computed(() => {
  const scale = props.isActive ? 1.15 : 1
  // 如果位置被冻结，使用冻结的位置；否则使用当前位置
  const xPx = frozenX.value !== null ? frozenX.value : currentX.value
  const yPx = frozenY.value !== null ? frozenY.value : currentY.value
  const style: any = {
    left: `calc(50% + ${xPx}px)`,
    top: `calc(50% + ${yPx}px)`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    // 如果飞机被点击或销毁，禁用 transition；否则使用平滑过渡
    transition: (props.isHit || props.isDestroyed) ? 'none' : 'all 0.05s linear'
  }

  // 如果是十六进制颜色，设置 CSS 变量
  if (props.color && props.color.startsWith('#')) {
    style['--plane-color'] = props.color
  }

  return style
})

const handleClick = () => {
  if (props.isDestroyed || props.isHit || props.isClickDisabled) return

  HapticFeedback.light()
  emit('click', props.id)
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.isDestroyed || props.isHit || props.isClickDisabled) return

  // 显示触摸波纹
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

const startMoving = () => {
  stopMoving()

  // 保存初始位置作为基准点
  baseX.value = currentX.value
  baseY.value = currentY.value

  // 根据移动模式初始化位置
  // 飞机在初始位置周边移动，而不是从边缘开始
  // 使用字符串模式而不是数字
  switch (props.movePattern) {
    case 'horizontal': // 水平移动：在初始位置左右移动
      currentX.value = baseX.value
      currentY.value = baseY.value
      moveDirection.value = 1
      break
    case 'vertical': // 垂直移动：在初始位置上下移动
      currentX.value = baseX.value
      currentY.value = baseY.value
      moveDirection.value = 1
      break
    case 'circular': // 椭圆移动：围绕初始位置旋转
      moveAngle.value = 0
      currentX.value = baseX.value + props.moveRange * 0.6
      currentY.value = baseY.value
      break
    case 'zigzag': // 之字形移动：在初始位置周边之字形移动
      currentX.value = baseX.value
      currentY.value = baseY.value
      moveDirection.value = 1
      break
    default:
      currentX.value = baseX.value
      currentY.value = baseY.value
  }

  animationTimer.value = window.setInterval(() => {
    if (!props.isDestroyed && !props.isHit) {
      switch (props.movePattern) {
        case 'horizontal':
          moveHorizontal()
          break
        case 'vertical':
          moveVertical()
          break
        case 'circular':
          moveCircular()
          break
        case 'zigzag':
          moveZigzag()
          break
        default:
          moveHorizontal()
      }
    }
  }, 33) // 约30fps
}

const moveHorizontal = () => {
  // 在初始位置周边左右移动
  currentX.value += props.moveSpeed * moveDirection.value

  // 移动范围是相对于初始位置的
  const leftBound = baseX.value - props.moveRange
  const rightBound = baseX.value + props.moveRange

  if (currentX.value <= leftBound) {
    currentX.value = leftBound
    moveDirection.value = 1
  } else if (currentX.value >= rightBound) {
    currentX.value = rightBound
    moveDirection.value = -1
  }

  // 轻微的上下浮动效果
  const floatOffset = Math.sin(Date.now() / 800) * 2
  currentY.value = baseY.value + floatOffset
}

const moveVertical = () => {
  // 在初始位置周边上下移动
  currentY.value += props.moveSpeed * moveDirection.value

  // 移动范围是相对于初始位置的
  const topBound = baseY.value - props.moveRange
  const bottomBound = baseY.value + props.moveRange

  if (currentY.value <= topBound) {
    currentY.value = topBound
    moveDirection.value = 1
  } else if (currentY.value >= bottomBound) {
    currentY.value = bottomBound
    moveDirection.value = -1
  }

  // 轻微的左右浮动效果
  const floatOffset = Math.sin(Date.now() / 800) * 2
  currentX.value = baseX.value + floatOffset
}

const moveCircular = () => {
  moveAngle.value += 0.02 * props.moveSpeed

  const radiusX = props.moveRange * 0.5
  const radiusY = props.moveRange * 0.3

  currentX.value = baseX.value + Math.cos(moveAngle.value) * radiusX
  currentY.value = baseY.value + Math.sin(moveAngle.value) * radiusY
}

const moveZigzag = () => {
  // 之字形移动：在初始位置周边水平和垂直交替移动
  currentX.value += props.moveSpeed * moveDirection.value

  // 移动范围是相对于初始位置的
  if (currentX.value <= baseX.value - props.moveRange) {
    currentX.value = baseX.value - props.moveRange
    moveDirection.value = 1
    // 改变垂直位置
    currentY.value = currentY.value > baseY.value ? baseY.value - props.moveRange * 0.2 : baseY.value + props.moveRange * 0.2
  } else if (currentX.value >= baseX.value + props.moveRange) {
    currentX.value = baseX.value + props.moveRange
    moveDirection.value = -1
    // 改变垂直位置
    currentY.value = currentY.value > baseY.value ? baseY.value - props.moveRange * 0.3 : baseY.value + props.moveRange * 0.3
  }
}

const stopMoving = () => {
  if (animationTimer.value) {
    clearInterval(animationTimer.value)
    animationTimer.value = null
  }
}

watch(() => props.isMoving, (newVal) => {
  if (newVal) {
    startMoving()
  } else {
    stopMoving()
  }
})

watch(() => props.isHit, (newVal) => {
  if (newVal) {
    // 飞机被点击时立即停止移动，并冻结当前位置
    stopMoving()
    // 保存当前位置，防止后续任何位置变化
    frozenX.value = currentX.value
    frozenY.value = currentY.value
  }
})

watch(() => props.isDestroyed, (newVal) => {
  if (newVal) {
    stopMoving()
  }
})

onMounted(() => {
  currentX.value = props.position.x || 0
  currentY.value = props.position.y || 0
  // 重置冻结状态
  frozenX.value = null
  frozenY.value = null

  if (props.isMoving && !props.isDestroyed) {
    startMoving()
  }
})

onBeforeUnmount(() => {
  stopMoving()
})
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.enemy-plane {
  position: absolute;
  width: 140px;
  height: 115px;
  animation: flyIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

@keyframes flyIn {
  0% {
    opacity: 0;
    transform: translate(calc(-50% + 150px), calc(-50% - 25px)) scale(0.3) rotate(15deg);
  }
  60% {
    opacity: 1;
    transform: translate(calc(-50% - 10px), calc(-50% + 5px)) scale(1.1) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

.plane-active {
  filter: brightness(1.4) drop-shadow(0 0 15px rgba(255, 215, 0, 0.9));
  z-index: 100;
}

/* 点击高亮指示器 */
.active-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 120px;
  pointer-events: none;
  z-index: 0;
}

.active-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.active-ring-outer {
  width: 100%;
  height: 100%;
  border: 3px solid #FFD700;
  box-shadow:
    0 0 15px rgba(255, 215, 0, 1),
    inset 0 0 10px rgba(255, 215, 0, 0.4);
  animation: ringPulse 1.5s ease-in-out infinite;
}

.active-ring-inner {
  width: 80%;
  height: 80%;
  border: 2px solid rgba(255, 215, 0, 0.6);
  animation: ringPulse 1.5s ease-in-out infinite reverse;
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 0.6;
  }
}

/* 十字准星 */
.active-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.crosshair-line {
  position: absolute;
  background: #FFD700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
}

.crosshair-h {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

.crosshair-v {
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

/* 瞄准角 */
.target-corners {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #FFD700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
}

.corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 4px 0 0 0;
}

.corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 4px 0 0;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 4px;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 4px 0;
}

/* 引擎尾焰 */
.engine-flame {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 20px;
  z-index: 0;
}

.flame {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 10px;
  border-radius: 50% 0 0 50%;
  animation: flameFlicker 0.3s ease-in-out infinite;
}

.flame-1 {
  background: radial-gradient(ellipse at left, #FF6B35, transparent);
  animation-delay: 0s;
}

.flame-2 {
  background: radial-gradient(ellipse at left, #FFA500, transparent);
  width: 15px;
  height: 8px;
  animation-delay: 0.1s;
}

.flame-3 {
  background: radial-gradient(ellipse at left, #FFD700, transparent);
  width: 10px;
  height: 5px;
  animation-delay: 0.2s;
}

@keyframes flameFlicker {
  0%, 100% {
    opacity: 1;
    transform: translateY(-50%) scaleX(1);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-50%) scaleX(0.8);
  }
}

/* 飞机主体 */
.plane-body {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.plane-wing {
  width: 90px;
  height: 20px;
  background: linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  border-radius: 10px;
  position: absolute;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.plane-wing-top {
  top: 18px;
}

.plane-wing-bottom {
  top: 25px;
  width: 80px;
  height: 18px;
  opacity: 0.8;
}

.plane-cockpit {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, var(--plane-color, #4A90E2), color-mix(in srgb, var(--plane-color, #4A90E2) 70%, black));
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    0 0 12px rgba(0, 0, 0, 0.3);
  border: 4px solid rgba(255, 255, 255, 0.6);
  z-index: 2;
  position: relative;
  overflow: hidden;
}

.cockpit-glass {
  position: absolute;
  top: 5px;
  left: 10px;
  right: 10px;
  height: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  border-radius: 15px 15px 0 0;
  animation: glassShine 3s ease-in-out infinite;
}

@keyframes glassShine {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}

.cockpit-detail {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

/* 颜色由 CSS 变量 --plane-color 动态控制 */

.answer-text {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
  line-height: 1;
  z-index: 3;
}

.plane-tail {
  width: 30px;
  height: 40px;
  background: linear-gradient(180deg, rgba(255,255,255,0.2), transparent);
  border-radius: 15px 15px 0 0;
  position: absolute;
  bottom: -20px;
}

/* 击中效果 - 禁用所有动画，防止位置改变 */
.plane-hit {
  animation: none !important;
  transform: translate(-50%, -50%) !important;
}

/* 摧毁效果 - 禁用所有动画，防止位置改变 */
.plane-destroyed {
  animation: none !important;
}

/* 爆炸效果 */
.explosion {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  pointer-events: none;
}

.explosion-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #FFFFFF, #FFD700, #FF6B35);
  border-radius: 50%;
  animation: explosionCore 0.6s ease-out forwards;
  box-shadow:
    0 0 20px rgba(255, 215, 0, 1),
    0 0 40px rgba(255, 107, 53, 0.8);
}

@keyframes explosionCore {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
}

.explosion-particle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #FF6B35, #F7931E);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  box-shadow: 0 0 5px rgba(255, 107, 53, 0.8);
  animation: particleExplode 0.8s ease-out forwards;
}

/* 12个方向的爆炸粒子 */
.explosion-particle:nth-child(2) { animation: particleExplode0 0.8s ease-out forwards; }
.explosion-particle:nth-child(3) { animation: particleExplode30 0.8s ease-out forwards; }
.explosion-particle:nth-child(4) { animation: particleExplode60 0.8s ease-out forwards; }
.explosion-particle:nth-child(5) { animation: particleExplode90 0.8s ease-out forwards; }
.explosion-particle:nth-child(6) { animation: particleExplode120 0.8s ease-out forwards; }
.explosion-particle:nth-child(7) { animation: particleExplode150 0.8s ease-out forwards; }
.explosion-particle:nth-child(8) { animation: particleExplode180 0.8s ease-out forwards; }
.explosion-particle:nth-child(9) { animation: particleExplode210 0.8s ease-out forwards; }
.explosion-particle:nth-child(10) { animation: particleExplode240 0.8s ease-out forwards; }
.explosion-particle:nth-child(11) { animation: particleExplode270 0.8s ease-out forwards; }
.explosion-particle:nth-child(12) { animation: particleExplode300 0.8s ease-out forwards; }
.explosion-particle:nth-child(13) { animation: particleExplode330 0.8s ease-out forwards; }

/* 0度 - 右 */
@keyframes particleExplode0 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 60px), -50%) scale(0);
    opacity: 0;
  }
}

/* 30度 - 右上 */
@keyframes particleExplode30 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 52px), calc(-50% - 30px)) scale(0);
    opacity: 0;
  }
}

/* 60度 - 上偏右 */
@keyframes particleExplode60 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 30px), calc(-50% - 52px)) scale(0);
    opacity: 0;
  }
}

/* 90度 - 上 */
@keyframes particleExplode90 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, calc(-50% - 60px)) scale(0);
    opacity: 0;
  }
}

/* 120度 - 上偏左 */
@keyframes particleExplode120 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% - 30px), calc(-50% - 52px)) scale(0);
    opacity: 0;
  }
}

/* 150度 - 左上 */
@keyframes particleExplode150 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% - 52px), calc(-50% - 30px)) scale(0);
    opacity: 0;
  }
}

/* 180度 - 左 */
@keyframes particleExplode180 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% - 60px), -50%) scale(0);
    opacity: 0;
  }
}

/* 210度 - 左下 */
@keyframes particleExplode210 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% - 52px), calc(-50% + 30px)) scale(0);
    opacity: 0;
  }
}

/* 240度 - 下偏左 */
@keyframes particleExplode240 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% - 30px), calc(-50% + 52px)) scale(0);
    opacity: 0;
  }
}

/* 270度 - 下 */
@keyframes particleExplode270 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, calc(-50% + 60px)) scale(0);
    opacity: 0;
  }
}

/* 300度 - 下偏右 */
@keyframes particleExplode300 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 30px), calc(-50% + 52px)) scale(0);
    opacity: 0;
  }
}

/* 330度 - 右下 */
@keyframes particleExplode330 {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 52px), calc(-50% + 30px)) scale(0);
    opacity: 0;
  }
}

.explosion-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 3px solid #FFD700;
  border-radius: 50%;
  animation: explosionRing 0.6s ease-out forwards;
}

@keyframes explosionRing {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.explosion-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: explosionFlash 0.3s ease-out forwards;
}

@keyframes explosionFlash {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 错误提示 */
.wrong-indicator {
  position: absolute;
  top: -25px;
  right: -25px;
  width: 50px;
  height: 50px;
  z-index: 100;
  pointer-events: none;
}

.wrong-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #E74C3C, #C0392B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: wrongPulse 0.5s ease;
  box-shadow:
    0 3px 10px rgba(231, 76, 60, 0.6),
    0 0 15px rgba(231, 76, 60, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.wrong-text {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

@keyframes wrongPulse {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
}

.wrong-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 2px solid #E74C3C;
  border-radius: 50%;
  animation: wrongWave 1s ease-out infinite;
}

@keyframes wrongWave {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 触摸波纹 */
.touch-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%);
  animation: rippleEffect 0.6s ease-out;
  pointer-events: none;
}

@keyframes rippleEffect {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}
</style>

