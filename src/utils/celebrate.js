import confetti from 'canvas-confetti'

/**
 * 庆祝特效封装（基于 canvas-confetti）
 * 统一配色，提供几种儿童友好的“炫酷”预设。
 */

const COLORS = ['#7c5cff', '#ff6ec7', '#ffc93c', '#3ddc97', '#36c5f0', '#ff6b6b', '#ff9f43']

const base = {
  colors: COLORS,
  disableForReducedMotion: true,
  zIndex: 9999,
}

/** 完成一个单词 —— 中心小爆发 */
export function popWord() {
  confetti({
    ...base,
    particleCount: 90,
    spread: 70,
    origin: { x: 0.5, y: 0.55 },
    startVelocity: 32,
    scalar: 1,
    ticks: 160,
  })
}

/** 从屏幕某一点（0~1 比例坐标）爆发，用于字母爆炸 */
export function popAt(x, y, count = 40) {
  confetti({
    ...base,
    particleCount: count,
    spread: 90,
    origin: { x, y },
    startVelocity: 22,
    scalar: 0.8,
    ticks: 120,
  })
}

/** 两侧礼花筒 —— 完成整句/关卡 */
export function sideCannons() {
  const shot = (origin, angle) =>
    confetti({ ...base, particleCount: 70, angle, spread: 60, origin, startVelocity: 45, ticks: 200 })
  shot({ x: 0, y: 0.7 }, 60)
  shot({ x: 1, y: 0.7 }, 120)
}

/** 大型庆祝 —— 连续烟花，用于全部通关 */
export function fireworks(durationMs = 1600) {
  const end = Date.now() + durationMs
  const frame = () => {
    confetti({
      ...base,
      particleCount: 5,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
    })
    confetti({
      ...base,
      particleCount: 5,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  // 中间来一发大的
  setTimeout(
    () =>
      confetti({
        ...base,
        particleCount: 160,
        spread: 110,
        origin: { x: 0.5, y: 0.4 },
        startVelocity: 45,
        shapes: ['star'],
        scalar: 1.3,
      }),
    120,
  )
}

/** 飘落星星（宠物到达终点等） */
export function starRain() {
  confetti({
    ...base,
    particleCount: 60,
    spread: 120,
    origin: { x: 0.5, y: -0.05 },
    startVelocity: 8,
    shapes: ['star'],
    gravity: 0.6,
    scalar: 1.1,
    ticks: 240,
  })
}
