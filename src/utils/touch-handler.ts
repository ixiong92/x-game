/**
 * 触屏交互处理工具
 * 优化 iPad 触屏体验
 */

export interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right' | null
  distance: number
  duration: number
}

/**
 * 触屏手势管理器
 */
export class TouchGestureManager {
  private startPoint: TouchPoint | null = null
  private endPoint: TouchPoint | null = null
  private minSwipeDistance: number = 50
  private maxSwipeDuration: number = 500

  /**
   * 处理触摸开始
   */
  handleTouchStart(event: TouchEvent): TouchPoint {
    const touch = event.touches[0]
    this.startPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }
    return this.startPoint
  }

  /**
   * 处理触摸结束
   */
  handleTouchEnd(event: TouchEvent): SwipeDirection | null {
    if (!this.startPoint) return null

    const touch = event.changedTouches[0]
    this.endPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    return this.detectSwipe()
  }

  /**
   * 检测滑动方向
   */
  private detectSwipe(): SwipeDirection | null {
    if (!this.startPoint || !this.endPoint) return null

    const deltaX = this.endPoint.x - this.startPoint.x
    const deltaY = this.endPoint.y - this.startPoint.y
    const duration = this.endPoint.timestamp - this.startPoint.timestamp

    // 检查是否满足滑动条件
    if (duration > this.maxSwipeDuration) return null

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance < this.minSwipeDistance) return null

    // 判断主要方向
    let direction: 'up' | 'down' | 'left' | 'right' | null = null

    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    return {
      direction,
      distance,
      duration
    }
  }

  /**
   * 重置状态
   */
  reset() {
    this.startPoint = null
    this.endPoint = null
  }
}

/**
 * 触觉反馈
 */
export class HapticFeedback {
  /**
   * 轻触反馈
   */
  static light() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  /**
   * 中等反馈
   */
  static medium() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }

  /**
   * 重度反馈
   */
  static heavy() {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  /**
   * 成功反馈
   */
  static success() {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  }

  /**
   * 错误反馈
   */
  static error() {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  }

  /**
   * 警告反馈
   */
  static warning() {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30])
    }
  }
}

/**
 * 触摸波纹效果
 */
export class TouchRipple {
  /**
   * 创建波纹效果
   */
  static create(event: MouseEvent | TouchEvent, element: HTMLElement) {
    const ripple = document.createElement('span')
    ripple.classList.add('touch-ripple')

    const rect = element.getBoundingClientRect()
    let x: number, y: number

    if (event instanceof TouchEvent) {
      const touch = event.touches[0] || event.changedTouches[0]
      x = touch.clientX - rect.left
      y = touch.clientY - rect.top
    } else {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    }

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    element.appendChild(ripple)

    // 动画结束后移除
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()

    if (!previous) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

/**
 * 检测是否为 iPad
 */
export function isIPad(): boolean {
  const ua = navigator.userAgent
  return /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

/**
 * 获取设备方向
 */
export function getOrientation(): 'portrait' | 'landscape' {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
}

/**
 * 监听方向变化
 */
export function onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void) {
  const handler = () => {
    callback(getOrientation())
  }

  window.addEventListener('resize', handler)
  window.addEventListener('orientationchange', handler)

  return () => {
    window.removeEventListener('resize', handler)
    window.removeEventListener('orientationchange', handler)
  }
}

