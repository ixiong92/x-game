<template>
  <div class="star-background">
    <!-- 渐变背景 -->
    <div class="gradient-bg"></div>
    
    <!-- 星空效果 -->
    <div class="stars-layer">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="star"
        :style="getStarStyle(star)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Star {
  id: string
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

const stars = ref<Star[]>([])

const initStars = () => {
  // 生成50个星星
  stars.value = Array.from({ length: 50 }, (_, i) => ({
    id: `star-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5
  }))
}

const getStarStyle = (star: Star) => {
  return {
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    animationDuration: `${star.duration}s`,
    animationDelay: `${star.delay}s`
  }
}

onMounted(() => {
  initStars()
})
</script>

<style scoped lang="scss">
@import '../../assets/styles/variables.scss';

.star-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0F2027, #203A43, #2C5364);
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(20deg);
  }
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  background: $white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: starTwinkle 3s ease-in-out infinite;
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>

