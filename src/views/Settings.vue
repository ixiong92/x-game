<template>
  <div class="settings-container">
    <StarBackground />
    
    <div class="settings-content">
      <!-- 头部 -->
      <div class="header">
        <el-button
          circle
          size="large"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">设置</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 音效设置 -->
      <GameCard title="音效设置" shadow="always">
        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">音效开关</span>
              <span class="setting-desc">控制游戏音效的开启和关闭</span>
            </div>
            <el-switch
              v-model="settings.soundEnabled"
              size="large"
              @change="handleSoundToggle"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">音效音量</span>
              <span class="setting-desc">调节游戏音效的音量大小</span>
            </div>
            <div class="volume-control">
              <el-icon><Mute /></el-icon>
              <el-slider
                v-model="settings.soundVolume"
                :min="0"
                :max="100"
                :disabled="!settings.soundEnabled"
                @change="handleVolumeChange"
              />
              <el-icon><Microphone /></el-icon>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">背景音乐</span>
              <span class="setting-desc">控制背景音乐的开启和关闭</span>
            </div>
            <el-switch
              v-model="settings.musicEnabled"
              size="large"
              @change="handleMusicToggle"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">音乐音量</span>
              <span class="setting-desc">调节背景音乐的音量大小</span>
            </div>
            <div class="volume-control">
              <el-icon><Mute /></el-icon>
              <el-slider
                v-model="settings.musicVolume"
                :min="0"
                :max="100"
                :disabled="!settings.musicEnabled"
                @change="handleMusicVolumeChange"
              />
              <el-icon><Microphone /></el-icon>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 交互设置 -->
      <GameCard title="交互设置" shadow="always">
        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">触觉反馈</span>
              <span class="setting-desc">点击时的震动反馈</span>
            </div>
            <el-switch
              v-model="settings.hapticEnabled"
              size="large"
              @change="handleHapticToggle"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">动画效果</span>
              <span class="setting-desc">控制界面动画的开启和关闭</span>
            </div>
            <el-switch
              v-model="settings.animationEnabled"
              size="large"
              @change="saveSettings"
            />
          </div>
        </div>
      </GameCard>

      <!-- 显示设置 -->
      <GameCard title="显示设置" shadow="always">
        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">星空背景</span>
              <span class="setting-desc">显示动态星空背景效果</span>
            </div>
            <el-switch
              v-model="settings.starBackgroundEnabled"
              size="large"
              @change="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">粒子特效</span>
              <span class="setting-desc">显示爆炸、成功等粒子特效</span>
            </div>
            <el-switch
              v-model="settings.particleEnabled"
              size="large"
              @change="saveSettings"
            />
          </div>
        </div>
      </GameCard>

      <!-- 关于 -->
      <GameCard title="关于" shadow="always">
        <div class="about-section">
          <div class="about-item">
            <span class="about-label">应用名称</span>
            <span class="about-value">X游戏 H5</span>
          </div>
          <div class="about-item">
            <span class="about-label">版本号</span>
            <span class="about-value">v1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">开发者</span>
            <span class="about-value">X Game Team</span>
          </div>
          <div class="about-item">
            <span class="about-label">技术栈</span>
            <span class="about-value">Vue 3 + TypeScript + Element Plus</span>
          </div>
        </div>
      </GameCard>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <GameButton
          type="primary"
          size="large"
          block
          @click="testSound"
        >
          <el-icon><Microphone /></el-icon>
          <span>测试音效</span>
        </GameButton>

        <GameButton
          type="warning"
          size="large"
          block
          @click="resetSettings"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>恢复默认设置</span>
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mute, Microphone, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { StarBackground, GameCard, GameButton } from '../components'
import soundManager from '../utils/sound-manager'
import { HapticFeedback } from '../utils/touch-handler'

const router = useRouter()

const settings = ref({
  soundEnabled: true,
  soundVolume: 70,
  musicEnabled: false,
  musicVolume: 50,
  hapticEnabled: true,
  animationEnabled: true,
  starBackgroundEnabled: true,
  particleEnabled: true
})

const loadSettings = () => {
  const saved = localStorage.getItem('appSettings')
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) }
  }
  
  // 应用音效设置
  soundManager.setEnabled(settings.value.soundEnabled)
  soundManager.setVolume(settings.value.soundVolume / 100)
  soundManager.setMusicEnabled(settings.value.musicEnabled)
  soundManager.setMusicVolume(settings.value.musicVolume / 100)
}

const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value))
  soundManager.play('select')
  HapticFeedback.light()
}

const handleSoundToggle = (value: boolean) => {
  soundManager.setEnabled(value)
  saveSettings()
  if (value) {
    soundManager.play('correct')
  }
}

const handleVolumeChange = (value: number) => {
  soundManager.setVolume(value / 100)
  saveSettings()
  soundManager.play('select')
}

const handleMusicToggle = (value: boolean) => {
  soundManager.setMusicEnabled(value)
  saveSettings()
  if (value) {
    soundManager.playMusic()
  } else {
    soundManager.stopMusic()
  }
}

const handleMusicVolumeChange = (value: number) => {
  soundManager.setMusicVolume(value / 100)
  saveSettings()
}

const handleHapticToggle = (value: boolean) => {
  saveSettings()
  if (value) {
    HapticFeedback.success()
  }
}

const testSound = () => {
  soundManager.play('gameStart')
  HapticFeedback.medium()
  ElMessage.success('音效测试成功！')
}

const resetSettings = () => {
  settings.value = {
    soundEnabled: true,
    soundVolume: 70,
    musicEnabled: false,
    musicVolume: 50,
    hapticEnabled: true,
    animationEnabled: true,
    starBackgroundEnabled: true,
    particleEnabled: true
  }
  saveSettings()
  soundManager.setEnabled(true)
  soundManager.setVolume(0.7)
  soundManager.setMusicEnabled(false)
  soundManager.setMusicVolume(0.5)
  ElMessage.success('已恢复默认设置！')
}

const goBack = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.back()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
@import '../assets/styles/variables.scss';

.settings-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
}

.settings-content {
  position: relative;
  z-index: 1;
  padding: $spacing-xl;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-base;
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-base;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
}

.setting-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.setting-label {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.setting-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  min-width: 200px;
}

.about-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.about-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
}

.about-label {
  font-size: $font-size-base;
  color: $text-secondary;
}

.about-value {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

// 响应式适配
@include respond-to('sm') {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .volume-control {
    width: 100%;
  }
}
</style>

