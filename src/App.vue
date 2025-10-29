<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { useGameStore } from './stores/game'

const userStore = useUserStore()
const gameStore = useGameStore()

onMounted(() => {
  // 初始化用户数据
  userStore.initUser()

  // 加载游戏配置
  gameStore.loadGameConfig()

  console.log('🎮 X游戏 H5 平台已启动')
})
</script>

<template>
  <div id="app" class="no-select">
    <router-view />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
