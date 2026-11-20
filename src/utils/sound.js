import { ref } from 'vue'

/**
 * 轻量音效引擎（Web Audio API，无需外部音频文件）
 * --------------------------------------------------------
 * 首次播放时懒加载 AudioContext（需用户手势触发）。
 */

let ctx = null
export const muted = ref(false)

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function toggleMute() {
  muted.value = !muted.value
  if (!muted.value) blip() // 取消静音时给个小反馈
}

/** 基础音调 */
function tone({
  freq = 440,
  sweepTo = null,
  dur = 0.15,
  type = 'sine',
  vol = 0.18,
  delay = 0,
}) {
  if (muted.value) return
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.03)
}

/** 白噪声爆破（爆炸/沙沙声） */
function noise({ dur = 0.22, vol = 0.2, delay = 0, freq = 800 }) {
  if (muted.value) return
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const frames = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(freq, t0)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(vol, t0)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start(t0)
  src.stop(t0 + dur)
}

/* ----------------------------- 具体音效 ----------------------------- */

// 通用按键轻响
export function blip() {
  tone({ freq: 680, dur: 0.05, type: 'triangle', vol: 0.08 })
}

// 打对字母
export function correct() {
  tone({ freq: 720, sweepTo: 1080, dur: 0.1, type: 'triangle', vol: 0.16 })
}

// 打错字母
export function wrong() {
  tone({ freq: 180, sweepTo: 110, dur: 0.2, type: 'sawtooth', vol: 0.14 })
}

// 发射子弹（游戏一）
export function shoot() {
  tone({ freq: 1000, sweepTo: 240, dur: 0.12, type: 'square', vol: 0.12 })
}

// 命中爆炸（游戏一）
export function explode() {
  noise({ dur: 0.25, vol: 0.22, freq: 1200 })
  tone({ freq: 320, sweepTo: 80, dur: 0.22, type: 'sawtooth', vol: 0.12 })
}

// 字母落到底部（失误）
export function miss() {
  tone({ freq: 220, sweepTo: 90, dur: 0.28, type: 'sine', vol: 0.16 })
}

// 完成一个单词/句子的欢快琶音
export function win() {
  const notes = [523, 659, 784, 1046]
  notes.forEach((f, i) =>
    tone({ freq: f, dur: 0.18, type: 'triangle', vol: 0.16, delay: i * 0.09 }),
  )
}

// 升级 / 全部完成的更长旋律
export function fanfare() {
  const notes = [523, 659, 784, 1046, 1318, 1046, 1318]
  notes.forEach((f, i) =>
    tone({ freq: f, dur: 0.2, type: 'square', vol: 0.12, delay: i * 0.1 }),
  )
}

// 宠物前进的小跳音
export function hop() {
  tone({ freq: 500, sweepTo: 760, dur: 0.08, type: 'sine', vol: 0.12 })
}

// UI 点击
export function click() {
  tone({ freq: 440, sweepTo: 620, dur: 0.07, type: 'triangle', vol: 0.12 })
}
