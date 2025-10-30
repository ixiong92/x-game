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
  moveSpeed: number  // 星星下落速度
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
    delay: Math.random() * 5,
    moveSpeed: 3 + Math.random() * 4  // 3-7秒下落一个屏幕高度
  }))
}

const getStarStyle = (star: Star) => {
  return {
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`
  }
}

onMounted(() => {
  initStars()
})
</script>

<style scoped lang="scss">
@use '../../assets/styles/variables.scss' as *;

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
  opacity: 0.8;
}
</style>

