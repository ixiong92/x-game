<template>
  <div class="home-container">
    <!-- 用户信息头部 -->
    <div class="home-header">
      <div class="user-info">
        <el-avatar :size="60" :src="userAvatar">
          {{ userStore.nickname.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <h2 class="user-nickname">{{ userStore.nickname }}</h2>
          <div class="user-level">
            <el-tag type="success" size="large">等级 {{ userStore.level }}</el-tag>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          circle
          size="large"
          @click="goToSettings"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 游戏选择区域 -->
    <div class="game-section">
      <h1 class="section-title">选择游戏</h1>
      <div class="game-cards">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-card touch-feedback"
          :class="{ 'game-card-disabled': !game.available }"
          @click="handleGameClick(game)"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <h3 class="game-title">{{ game.title }}</h3>
          <p class="game-desc">{{ game.description }}</p>
          <div v-if="!game.available" class="game-lock">
            <el-icon><Lock /></el-icon>
            <span>即将推出</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能区 -->
    <div class="quick-actions">
      <el-button
        class="action-btn"
        size="large"
        @click="goToUserCenter"
      >
        <el-icon><User /></el-icon>
        <span>用户中心</span>
      </el-button>
      <el-button
        class="action-btn"
        size="large"
        @click="goToParentPanel"
      >
        <el-icon><Monitor /></el-icon>
        <span>家长监控</span>
      </el-button>
    </div>

    <!-- 版本信息 -->
    <div class="footer">
      <p class="version-text">X游戏 H5 v1.0.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Setting, Lock, User, Monitor } from '@element-plus/icons-vue'
import soundManager from '../utils/sound-manager'
import { HapticFeedback } from '../utils/touch-handler'

const router = useRouter()
const userStore = useUserStore()

const userAvatar = ref('/vite.svg')

interface Game {
  id: string
  title: string
  description: string
  icon: string
  available: boolean
  path: string
}

const games = ref<Game[]>([
  {
    id: 'number-battle',
    title: '数字大战',
    description: '飞机大战主题的数学计算游戏',
    icon: '✈️',
    available: true,
    path: '/number-battle/settings'
  },
  {
    id: 'pinyin-battle',
    title: '拼音大战',
    description: '学习拼音的趣味游戏',
    icon: '🔤',
    available: false,
    path: ''
  },
  {
    id: 'word-battle',
    title: '文字大战',
    description: '汉字学习游戏',
    icon: '📝',
    available: false,
    path: ''
  },
  {
    id: 'english-battle',
    title: '英语大战',
    description: '英语单词学习游戏',
    icon: '🔤',
    available: false,
    path: ''
  }
])

const handleGameClick = (game: Game) => {
  soundManager.play('select')
  HapticFeedback.light()
  
  if (!game.available) {
    ElMessage.info('该游戏即将推出，敬请期待！')
    return
  }
  
  router.push(game.path)
}

const goToSettings = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.push('/settings')
}

const goToUserCenter = () => {
  soundManager.play('select')
  HapticFeedback.light()
  ElMessage.info('用户中心正在建设中，敬请期待！')
}

const goToParentPanel = () => {
  soundManager.play('select')
  HapticFeedback.light()
  ElMessage.info('家长监控正在建设中，敬请期待！')
}
</script>

<style scoped lang="scss">
@use '../assets/styles/variables.scss' as *;

.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: $spacing-xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-2xl;
  padding: $spacing-lg;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.user-nickname {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;
}

.user-level {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: $spacing-base;
}

.game-section {
  flex: 1;
  margin-bottom: $spacing-xl;
}

.section-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $white;
  text-align: center;
  margin-bottom: $spacing-xl;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-xl;
  padding: $spacing-base;
}

.game-card {
  position: relative;
  background: $white;
  border-radius: $border-radius-xl;
  padding: $spacing-2xl;
  box-shadow: $shadow-lg;
  transition: all $transition-base;
  cursor: pointer;
  
  &:hover:not(.game-card-disabled) {
    transform: translateY(-8px) scale(1.02);
    box-shadow: $shadow-xl, $glow-primary;
  }
  
  &.game-card-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.game-icon {
  font-size: 64px;
  text-align: center;
  margin-bottom: $spacing-lg;
}

.game-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-align: center;
  margin-bottom: $spacing-sm;
}

.game-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  text-align: center;
  margin: 0;
}

.game-lock {
  position: absolute;
  top: $spacing-base;
  right: $spacing-base;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  background: rgba(0, 0, 0, 0.1);
  border-radius: $border-radius-base;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-base $spacing-xl;
  font-size: $font-size-lg;
}

.footer {
  text-align: center;
  padding: $spacing-base;
}

.version-text {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

// 响应式适配
@include respond-to('md') {
  .game-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include respond-to('lg') {
  .game-cards {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

