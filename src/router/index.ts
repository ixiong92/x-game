/**
 * 路由配置
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'X游戏 - 首页'
    }
  },
  {
    path: '/number-battle',
    name: 'NumberBattle',
    component: () => import('../views/NumberBattle/index.vue'),
    meta: {
      title: '数字大战'
    }
  },
  {
    path: '/number-battle/settings',
    name: 'NumberBattleSettings',
    component: () => import('../views/NumberBattle/Settings.vue'),
    meta: {
      title: '游戏设置'
    }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/Result.vue'),
    meta: {
      title: '游戏结果'
    }
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: {
      title: '用户中心'
    }
  },
  {
    path: '/parent-panel',
    name: 'ParentPanel',
    component: () => import('../views/ParentPanel.vue'),
    meta: {
      title: '家长监控'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '设置'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router

