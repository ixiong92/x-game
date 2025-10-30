<template>
  <div class="particle-effect">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :class="`particle-${type}`"
      :style="getParticleStyle(particle)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  angle: number
  speed: number
  duration: number
  delay: number
}

interface Props {
  type?: 'explosion' | 'success' | 'combo' | 'star'
  count?: number
  trigger?: number
  position?: { x: number; y: number }
}

const props = withDefaults(defineProps<Props>(), {
  type: 'explosion',
  count: 12,
  trigger: 0,
  position: () => ({ x: 50, y: 50 })
})

const particles = ref<Particle[]>([])

const createParticles = () => {
  particles.value = Array.from({ length: props.count }, (_, i) => ({
    id: Date.now() + i,
    x: props.position.x,
    y: props.position.y,
    size: 4 + Math.random() * 8,
    angle: (360 / props.count) * i,
    speed: 50 + Math.random() * 50,
    duration: 0.6 + Math.random() * 0.4,
    delay: Math.random() * 0.1
  }))
  
  // 清除粒子
  setTimeout(() => {
    particles.value = []
  }, 1200)
}

const getParticleStyle = (particle: Particle) => {
  const rad = (particle.angle * Math.PI) / 180
  const endX = particle.x + Math.cos(rad) * particle.speed
  const endY = particle.y + Math.sin(rad) * particle.speed
  
  return {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    '--end-x': `${endX}%`,
    '--end-y': `${endY}%`,
    animationDuration: `${particle.duration}s`,
    animationDelay: `${particle.delay}s`
  }
}

watch(() => props.trigger, (newVal) => {
  if (newVal > 0) {
    createParticles()
  }
})

onMounted(() => {
  if (props.trigger > 0) {
    createParticles()
  }
})
</script>

<style scoped lang="scss">
@use '../../assets/styles/variables.scss' as *;

.particle-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: particleMove 1s ease-out forwards;
  pointer-events: none;
}

@keyframes particleMove {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    left: var(--end-x);
    top: var(--end-y);
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

.particle-explosion {
  background: radial-gradient(circle, #FF6B35, #F7931E);
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.8);
}

.particle-success {
  background: radial-gradient(circle, #50C878, #27AE60);
  box-shadow: 0 0 10px rgba(80, 200, 120, 0.8);
}

.particle-combo {
  background: radial-gradient(circle, #9B59B6, #8E44AD);
  box-shadow: 0 0 10px rgba(155, 89, 182, 0.8);
}

.particle-star {
  background: radial-gradient(circle, #FFD700, #FFA500);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}
</style>

