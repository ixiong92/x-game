<template>
  <div class="user-center-container">
    <StarBackground />
    
    <div class="user-center-content">
      <!-- 头部 -->
      <div class="header">
        <el-button
          circle
          size="large"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">用户中心</h1>
        <div style="width: 40px;"></div>
      </div>

      <!-- 用户信息卡片 -->
      <GameCard class="user-info-card" shadow="always">
        <div class="user-profile">
          <div class="avatar-section">
            <div class="avatar">
              {{ userStore.profile.avatar }}
            </div>
            <GameButton
              type="primary"
              size="small"
              @click="editProfile"
            >
              编辑资料
            </GameButton>
          </div>
          
          <div class="profile-info">
            <div class="info-item">
              <span class="info-label">昵称</span>
              <span class="info-value">{{ userStore.profile.nickname }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">年龄</span>
              <span class="info-value">{{ userStore.profile.age }}岁</span>
            </div>
            <div class="info-item">
              <span class="info-label">等级</span>
              <span class="info-value">Lv.{{ userStore.profile.level }}</span>
            </div>
          </div>
          
          <div class="exp-bar">
            <div class="exp-info">
              <span>经验值</span>
              <span>{{ userStore.profile.exp }}/{{ nextLevelExp }}</span>
            </div>
            <el-progress
              :percentage="expPercentage"
              :stroke-width="12"
              :show-text="false"
            />
          </div>
        </div>
      </GameCard>

      <!-- 学习进度 -->
      <GameCard title="学习进度" shadow="always">
        <div class="progress-grid">
          <div class="progress-item">
            <div class="progress-icon">🎮</div>
            <div class="progress-info">
              <span class="progress-label">游戏次数</span>
              <span class="progress-value">{{ userStore.learningProgress.totalGames }}</span>
            </div>
          </div>
          
          <div class="progress-item">
            <div class="progress-icon">✓</div>
            <div class="progress-info">
              <span class="progress-label">正确题数</span>
              <span class="progress-value">{{ userStore.learningProgress.totalCorrect }}</span>
            </div>
          </div>
          
          <div class="progress-item">
            <div class="progress-icon">✗</div>
            <div class="progress-info">
              <span class="progress-label">错误题数</span>
              <span class="progress-value">{{ userStore.learningProgress.totalWrong }}</span>
            </div>
          </div>
          
          <div class="progress-item">
            <div class="progress-icon">📊</div>
            <div class="progress-info">
              <span class="progress-label">正确率</span>
              <span class="progress-value">{{ accuracy }}%</span>
            </div>
          </div>
          
          <div class="progress-item">
            <div class="progress-icon">⏱</div>
            <div class="progress-info">
              <span class="progress-label">学习时长</span>
              <span class="progress-value">{{ formatTime(userStore.learningProgress.totalTime) }}</span>
            </div>
          </div>
          
          <div class="progress-item">
            <div class="progress-icon">⭐</div>
            <div class="progress-info">
              <span class="progress-label">最高分</span>
              <span class="progress-value">{{ userStore.learningProgress.bestScore }}</span>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 成就系统 -->
      <GameCard title="我的成就" shadow="always">
        <div class="achievements-list">
          <div
            v-for="achievement in userStore.achievements"
            :key="achievement.id"
            class="achievement-item"
            :class="{ 'achievement-locked': !achievement.unlocked }"
          >
            <div class="achievement-icon">
              {{ achievement.icon }}
            </div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-desc">{{ achievement.description }}</div>
              <div v-if="achievement.unlocked" class="achievement-date">
                解锁于 {{ formatDate(achievement.unlockedAt) }}
              </div>
            </div>
            <div v-if="achievement.unlocked" class="achievement-badge">
              <el-icon color="#FFD700"><Check /></el-icon>
            </div>
            <div v-else class="achievement-lock">
              <el-icon><Lock /></el-icon>
            </div>
          </div>
        </div>
      </GameCard>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <GameButton
          type="warning"
          size="large"
          block
          @click="clearData"
        >
          <el-icon><Delete /></el-icon>
          <span>清除数据</span>
        </GameButton>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="90%"
      :style="{ maxWidth: '500px' }"
    >
      <el-form :model="editForm" label-position="top" size="large">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number
            v-model="editForm.age"
            :min="3"
            :max="18"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-selector">
            <div
              v-for="emoji in avatarOptions"
              :key="emoji"
              class="avatar-option"
              :class="{ 'avatar-selected': editForm.avatar === emoji }"
              @click="editForm.avatar = emoji"
            >
              {{ emoji }}
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <GameButton @click="showEditDialog = false">取消</GameButton>
        <GameButton type="primary" @click="saveProfile">保存</GameButton>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ArrowLeft, Check, Lock, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { StarBackground, GameCard, GameButton } from '../components'
import soundManager from '../utils/sound-manager'
import { HapticFeedback } from '../utils/touch-handler'

const router = useRouter()
const userStore = useUserStore()

const showEditDialog = ref(false)
const editForm = ref({
  nickname: '',
  age: 8,
  avatar: '👦'
})

const avatarOptions = ['👦', '👧', '🧒', '👶', '🐶', '🐱', '🐼', '🐨', '🦁', '🐯', '🦊', '🐻']

const nextLevelExp = computed(() => userStore.profile.level * 1000)
const expPercentage = computed(() => 
  Math.min(100, (userStore.profile.exp / nextLevelExp.value) * 100)
)

const accuracy = computed(() => {
  const total = userStore.learningProgress.totalCorrect + userStore.learningProgress.totalWrong
  if (total === 0) return 0
  return Math.round((userStore.learningProgress.totalCorrect / total) * 100)
})

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const goBack = () => {
  soundManager.play('select')
  HapticFeedback.light()
  router.back()
}

const editProfile = () => {
  editForm.value = {
    nickname: userStore.profile.nickname,
    age: userStore.profile.age,
    avatar: userStore.profile.avatar
  }
  showEditDialog.value = true
  soundManager.play('select')
  HapticFeedback.light()
}

const saveProfile = () => {
  userStore.updateProfile(editForm.value)
  showEditDialog.value = false
  soundManager.play('correct')
  HapticFeedback.success()
  ElMessage.success('资料保存成功！')
}

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    userStore.resetProgress()
    soundManager.play('correct')
    HapticFeedback.success()
    ElMessage.success('数据已清除！')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
@use '../assets/styles/variables.scss' as *;

.user-center-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  // iPad 横屏时允许滚动
  @media (min-width: 1024px) and (orientation: landscape) {
    overflow-y: auto;
  }
}

.user-center-content {
  position: relative;
  z-index: 1;
  padding: $spacing-xl;
  max-width: 900px;
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

.user-info-card {
  animation: slideInUp 0.6s ease;
}

.user-profile {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.avatar {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  background: linear-gradient(135deg, $primary-color, $success-color);
  border-radius: 50%;
  box-shadow: $shadow-lg;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-base;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
}

.info-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.info-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.exp-bar {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.exp-info {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-base;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
}

.progress-icon {
  font-size: 32px;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.progress-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.progress-value {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: $spacing-base;
  padding: $spacing-base;
  background: $bg-secondary;
  border-radius: $border-radius-base;
  transition: all $transition-base;
  
  &.achievement-locked {
    opacity: 0.5;
  }
}

.achievement-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-color, $success-color);
  border-radius: 50%;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.achievement-name {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.achievement-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.achievement-date {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.achievement-badge {
  font-size: 24px;
}

.achievement-lock {
  font-size: 24px;
  color: $text-tertiary;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-base;
}

.avatar-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-base;
}

.avatar-option {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: $bg-secondary;
  border: 2px solid $border-color;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.avatar-selected {
    border-color: $primary-color;
    box-shadow: $shadow-base, $glow-primary;
  }
}

// 响应式适配
@include respond-to('sm') {
  .profile-info {
    grid-template-columns: 1fr;
  }
  
  .progress-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .avatar-selector {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

