# X游戏 H5 平台 - 设计文档

## 📋 项目概述

本项目是基于 x-game-tv (Android TV 版本) 重构的 iPad H5 游戏平台，主要目标是将遥控器交互改为触屏交互，使用现代化的 Web 技术栈实现。

## 🎯 设计目标

1. **触屏优化**：将遥控器操作改为直接触屏点击
2. **响应式设计**：适配不同尺寸的 iPad 设备（横屏/竖屏）
3. **现代化技术栈**：使用 Vue 3 + TypeScript + Element Plus
4. **保留核心玩法**：保持 x-game-tv 的游戏规则和收银系统
5. **优化用户体验**：添加触觉反馈、动画效果等

## 🏗️ 架构设计

### 技术栈对比

| 层级 | x-game-tv | x-game-h5 |
|------|-----------|-----------|
| 框架 | uni-app x | Vue 3 + Vite |
| 语言 | UTS/TypeScript | TypeScript |
| UI库 | 自定义组件 | Element Plus |
| 状态管理 | 自定义 | Pinia |
| 路由 | uni-app 路由 | Vue Router |
| 样式 | SCSS | SCSS |
| 存储 | uni.storage | LocalStorage |
| 平台 | Android TV | Web (iPad) |

### 核心模块

#### 1. 状态管理 (Pinia Stores)

**用户状态 (user.ts)**
- 用户资料管理
- 学习进度追踪
- 成就系统
- 数据持久化

**游戏状态 (game.ts)**
- 游戏配置管理
- 当前游戏状态
- 题目管理
- 得分计算

#### 2. 工具函数 (Utils)

**游戏逻辑 (game-logic.ts)**
- BattleQuestionGenerator - 题目生成器
- EnemyPlaneManager - 敌机管理器
- ScoreCalculator - 评分计算器

**音效管理 (sound-manager.ts)**
- Web Audio API 音效生成
- 背景音乐管理
- 音量控制

**触屏处理 (touch-handler.ts)**
- 触摸手势识别
- 触觉反馈
- 触摸波纹效果
- 防抖/节流

#### 3. 组件系统

**通用组件 (common/)**
- GameCard - 游戏卡片
- GameButton - 游戏按钮
- LoadingScreen - 加载屏幕

**游戏组件 (game/)**
- EnemyPlane - 敌机组件
- QuestionDisplay - 题目显示
- GameStats - 游戏统计
- StarBackground - 星空背景
- ParticleEffect - 粒子特效

#### 4. 页面视图

- Home - 首页（游戏选择）
- NumberBattle - 数字大战游戏
- Settings - 游戏设置
- Result - 结果展示
- UserCenter - 用户中心
- ParentPanel - 家长监控

## 🎮 交互设计

### 遥控器 → 触屏映射

| 原交互 | 新交互 | 实现方式 |
|--------|--------|----------|
| 方向键导航 | 直接点击 | @click 事件 |
| 确认键攻击 | 点击即攻击 | 合并选择和攻击 |
| 返回键 | 返回按钮 | UI 按钮 |
| 焦点高亮 | 点击高亮 | CSS active 状态 |

### 触屏优化

1. **大按钮设计**
   - 最小点击区域：44x44px
   - 按钮间距：16px+
   - 清晰的视觉反馈

2. **触觉反馈**
   - 点击：轻触反馈 (10ms)
   - 正确：成功反馈 (10-50-10ms)
   - 错误：错误反馈 (50-100-50ms)

3. **手势支持**
   - 点击：选择/攻击
   - 滑动：切换选项
   - 长按：显示详情

4. **防误触**
   - 按钮防抖 (300ms)
   - 确认对话框
   - 撤销功能

## 🎨 视觉设计

### 颜色系统

```scss
// 主题色
$primary-color: #4A90E2;
$success-color: #52C41A;
$warning-color: #FAAD14;
$error-color: #F5222D;

// 游戏背景
$game-bg: linear-gradient(135deg, #0F2027, #203A43, #2C5364);

// 敌机颜色
$enemy-blue: #4A90E2;
$enemy-red: #F5222D;
$enemy-green: #52C41A;
$enemy-yellow: #FAAD14;
```

### 字体系统

```scss
// 基础字体
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;

// 游戏字体（更大）
$game-font-base: 24px;
$game-font-lg: 32px;
$game-font-xl: 40px;
```

### 动画效果

1. **基础动画**
   - 淡入淡出
   - 滑动进入
   - 缩放效果
   - 弹跳效果

2. **游戏动画**
   - 敌机飞行
   - 爆炸特效
   - 星空背景
   - 连击文字

## 📱 响应式设计

### 断点设置

```scss
$breakpoint-sm: 768px;   // iPad 竖屏
$breakpoint-md: 1024px;  // iPad 横屏
$breakpoint-lg: 1366px;  // iPad Pro
```

### 布局适配

**iPad 竖屏 (768px)**
- 单列布局
- 游戏区域占满屏幕
- 底部统计栏

**iPad 横屏 (1024px)**
- 2x2 网格布局
- 左右分栏
- 侧边统计栏

**iPad Pro (1366px)**
- 更大的游戏区域
- 更多信息展示
- 优化间距

## 🔊 音效设计

### 音效类型

- correct - 答对音效
- wrong - 答错音效
- attack - 攻击音效
- explosion - 爆炸音效
- select - 选择音效
- combo - 连击音效
- countdown - 倒计时音效
- gameStart - 游戏开始
- gameOver - 游戏结束

### 实现方式

使用 Web Audio API 动态生成音效，无需音频文件：

```typescript
// 示例：播放正确音效
playTone([523.25, 659.25, 783.99], 0.1, 'sine')
```

## 💾 数据存储

### LocalStorage 结构

```typescript
// 用户数据
user_profile: UserProfile
user_progress: LearningProgress
user_achievements: Achievement[]

// 游戏数据
game_config: GameConfig
game_history: GameHistory[]

// 设置数据
sound_settings: SoundSettings
```

## 🚀 性能优化

1. **代码分割**
   - 路由懒加载
   - 组件按需加载

2. **资源优化**
   - 图片懒加载
   - 音效预加载
   - CSS 动画硬件加速

3. **渲染优化**
   - 虚拟滚动
   - 防抖节流
   - requestAnimationFrame

## 📝 开发规范

### 命名规范

- 组件：PascalCase (GameCard.vue)
- 文件：kebab-case (game-logic.ts)
- 变量：camelCase (userProfile)
- 常量：UPPER_CASE (MAX_SCORE)

### 代码规范

- 使用 TypeScript 严格模式
- 使用 Composition API
- 使用 `<script setup>` 语法
- 添加类型注解

### 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

## 🔄 迁移策略

### 第一阶段：基础框架
- ✅ 项目初始化
- ✅ 状态管理
- ✅ 工具函数
- ✅ 样式系统

### 第二阶段：核心功能
- ✅ 首页实现
- ⏳ 数字大战游戏
- ⏳ 游戏设置
- ⏳ 结果展示

### 第三阶段：完善功能
- ⏳ 用户中心
- ⏳ 家长监控
- ⏳ 全局设置

### 第四阶段：测试优化
- ⏳ iPad 真机测试
- ⏳ 性能优化
- ⏳ 兼容性测试

## 📊 测试计划

### 功能测试
- 用户系统
- 游戏逻辑
- 数据存储
- 音效系统

### 兼容性测试
- Safari (iOS 12+)
- Chrome (最新版)
- 不同 iPad 型号

### 性能测试
- 加载速度
- 动画流畅度
- 内存占用
- 电池消耗

## 🎯 未来规划

1. **更多游戏**
   - 拼音大战
   - 文字大战
   - 英语大战

2. **社交功能**
   - 排行榜
   - 好友对战
   - 成就分享

3. **AI 功能**
   - 智能出题
   - 学习分析
   - 个性化推荐

---

**设计文档版本**: v1.0.0  
**最后更新**: 2025-10-29

