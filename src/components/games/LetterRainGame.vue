<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import StatPill from '../StatPill.vue'
import { useKeyboard, } from '../../composables/useKeyboard'
import { useHints } from '../../composables/useHints'
import { eventToChar } from '../../data/keyboard'
import * as sfx from '../../utils/sound'
import { popAt, fireworks } from '../../utils/celebrate'

/**
 * 游戏一：字母雨 🚀
 * 字母从天而降，敲对应键发射子弹将其击落；漏接会损失生命值。
 */
const emit = defineEmits(['exit'])

const { onKey } = useKeyboard()
const { setHints, clearHints } = useHints()

/* ----------------------------- 常量 ----------------------------- */
const COLORS = ['#ff6b6b', '#ff9f43', '#ffc93c', '#3ddc97', '#36c5f0', '#7c5cff', '#ff6ec7']
const START_LIVES = 3
const MAX_LETTERS = 9
const BULLET_SPEED = 1100 // px/s
const DESTROY_PER_LEVEL = 8

/* ----------------------------- 状态 ----------------------------- */
const area = ref(null)
const size = reactive({ w: 800, h: 500 })
const state = ref('ready') // ready | countdown | playing | over
const countdown = ref(3)

const score = ref(0)
const lives = ref(START_LIVES)
const level = ref(1)
const combo = ref(0)
const bestCombo = ref(0)
const destroyed = ref(0)
const best = ref(Number(localStorage.getItem('rain_best') || 0))

const letters = ref([])
const bullets = ref([])
const booms = ref([])
const cannonAngle = ref(0)
const shake = ref(false)
const levelUp = ref(false)

let uid = 0
let raf = null
let lastT = 0
let spawnTimer = 0
let countdownTimer = null

/* ----------------------------- 派生 ----------------------------- */
const spawnInterval = computed(() => Math.max(0.55, 1.5 - (level.value - 1) * 0.1))
const letterSpeed = computed(() => 52 + (level.value - 1) * 10)

// 键盘提示：最靠下（最紧急）的那个字母
const lowestChar = computed(() => {
  let bestL = null
  for (const l of letters.value) if (!bestL || l.y > bestL.y) bestL = l
  return bestL ? bestL.char : ''
})
watch(lowestChar, (c) => setHints(c ? [c] : []))

/* ----------------------------- 尺寸 ----------------------------- */
function measure() {
  if (!area.value) return
  size.w = area.value.clientWidth
  size.h = area.value.clientHeight
}
let ro = null

/* ----------------------------- 生成 ----------------------------- */
function spawnLetter() {
  if (letters.value.length >= MAX_LETTERS) return
  const margin = 40
  const char = String.fromCharCode(97 + Math.floor(Math.random() * 26))
  letters.value.push({
    id: ++uid,
    char,
    x: margin + Math.random() * Math.max(60, size.w - margin * 2),
    y: -30,
    speed: letterSpeed.value * (0.85 + Math.random() * 0.4),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: (Math.random() * 20 - 10).toFixed(1),
  })
}

/* ----------------------------- 游戏循环 ----------------------------- */
function loop(t) {
  const dt = Math.min((t - lastT) / 1000, 0.05)
  lastT = t
  if (state.value === 'playing') update(dt)
  raf = requestAnimationFrame(loop)
}

function update(dt) {
  // 生成
  spawnTimer -= dt
  if (spawnTimer <= 0) {
    spawnLetter()
    spawnTimer = spawnInterval.value * (0.8 + Math.random() * 0.5)
  }

  const dangerY = size.h - 78 // 到达炮台附近算漏接

  // 字母下落
  for (let i = letters.value.length - 1; i >= 0; i--) {
    const l = letters.value[i]
    l.y += l.speed * dt
    if (l.y >= dangerY) {
      letters.value.splice(i, 1)
      onMiss(l)
    }
  }

  // 子弹飞行（追踪目标）
  for (let i = bullets.value.length - 1; i >= 0; i--) {
    const b = bullets.value[i]
    const target = letters.value.find((l) => l.id === b.targetId)
    if (!target) {
      // 目标已消失，子弹继续向上飞出后移除
      b.y -= BULLET_SPEED * dt
      if (b.y < -40) bullets.value.splice(i, 1)
      continue
    }
    const dx = target.x - b.x
    const dy = target.y - b.y
    const dist = Math.hypot(dx, dy)
    const step = BULLET_SPEED * dt
    if (dist <= step || dist < 20) {
      onHit(target, b)
      bullets.value.splice(i, 1)
    } else {
      b.x += (dx / dist) * step
      b.y += (dy / dist) * step
      b.angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    }
  }
}

/* ----------------------------- 命中 / 漏接 ----------------------------- */
function onHit(letter, bullet) {
  const idx = letters.value.findIndex((l) => l.id === letter.id)
  if (idx >= 0) letters.value.splice(idx, 1)

  combo.value++
  bestCombo.value = Math.max(bestCombo.value, combo.value)
  destroyed.value++
  const gain = 10 + Math.min(combo.value, 10) * 2
  score.value += gain

  addBoom(letter.x, letter.y, letter.color)
  sfx.explode()
  confettiAt(letter.x, letter.y)

  // 升级
  if (destroyed.value % DESTROY_PER_LEVEL === 0) {
    level.value++
    triggerLevelUp()
  }
}

function onMiss(letter) {
  combo.value = 0
  lives.value--
  sfx.miss()
  triggerShake()
  if (lives.value <= 0) endGame()
}

function addBoom(x, y, color) {
  const id = ++uid
  booms.value.push({ id, x, y, color })
  setTimeout(() => {
    const i = booms.value.findIndex((b) => b.id === id)
    if (i >= 0) booms.value.splice(i, 1)
  }, 520)
}

function confettiAt(x, y) {
  if (!area.value) return
  const rect = area.value.getBoundingClientRect()
  popAt(
    (rect.left + x) / window.innerWidth,
    (rect.top + y) / window.innerHeight,
    26,
  )
}

function triggerShake() {
  shake.value = true
  setTimeout(() => (shake.value = false), 380)
}
function triggerLevelUp() {
  levelUp.value = true
  sfx.win()
  setTimeout(() => (levelUp.value = false), 1200)
}

/* ----------------------------- 输入 ----------------------------- */
function fire(char) {
  // 找同字母中最靠下的作为目标
  let target = null
  for (const l of letters.value) {
    if (l.char === char && (!target || l.y > target.y)) target = l
  }
  const cx = size.w / 2
  const cy = size.h - 40
  if (!target) {
    // 空放：轻微反馈，不惩罚连击
    sfx.blip()
    cannonAngle.value = 0
    return
  }
  // 炮管朝向目标
  cannonAngle.value = (Math.atan2(target.x - cx, cy - target.y) * 180) / Math.PI
  bullets.value.push({
    id: ++uid,
    targetId: target.id,
    x: cx,
    y: cy - 30,
    angle: 0,
  })
  sfx.shoot()
}

let offKey = null
function handleKey(e) {
  if (e.repeat) return
  const char = eventToChar(e)
  if (state.value === 'playing') {
    if (char) fire(char)
    return
  }
  // ready / over：回车或空格开始
  if ((e.code === 'Enter' || e.code === 'Space') && state.value !== 'countdown') {
    startGame()
  }
}

/* ----------------------------- 流程 ----------------------------- */
function resetState() {
  score.value = 0
  lives.value = START_LIVES
  level.value = 1
  combo.value = 0
  bestCombo.value = 0
  destroyed.value = 0
  letters.value = []
  bullets.value = []
  booms.value = []
  spawnTimer = 0
  cannonAngle.value = 0
}

function startGame() {
  resetState()
  state.value = 'countdown'
  countdown.value = 3
  sfx.click()
  clearTimeout(countdownTimer)
  const tick = () => {
    countdown.value--
    sfx.blip()
    if (countdown.value > 0) {
      countdownTimer = setTimeout(tick, 750)
    } else {
      state.value = 'playing'
      lastT = performance.now()
      spawnLetter()
      if (!raf) raf = requestAnimationFrame(loop)
    }
  }
  countdownTimer = setTimeout(tick, 750)
}

function endGame() {
  state.value = 'over'
  if (score.value > best.value) {
    best.value = score.value
    localStorage.setItem('rain_best', String(best.value))
  }
  clearHints()
  if (score.value > 0) fireworks(1200)
  sfx.fanfare()
}

/* ----------------------------- 生命周期 ----------------------------- */
onMounted(async () => {
  await nextTick()
  measure()
  if (typeof ResizeObserver !== 'undefined' && area.value) {
    ro = new ResizeObserver(measure)
    ro.observe(area.value)
  }
  window.addEventListener('resize', measure)
  offKey = onKey(handleKey)
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(countdownTimer)
  window.removeEventListener('resize', measure)
  if (ro) ro.disconnect()
  if (offKey) offKey()
  clearHints()
})
</script>

<template>
  <div class="rain-game" :class="{ shaking: shake }">
    <!-- 背景 -->
    <div class="sky"></div>
    <div class="cloud c1">☁️</div>
    <div class="cloud c2">☁️</div>
    <div class="cloud c3">⛅</div>
    <div class="ground"></div>

    <!-- 游戏区域 -->
    <div class="play-area" ref="area">
      <!-- 字母 -->
      <div
        v-for="l in letters"
        :key="l.id"
        class="letter"
        :style="{
          left: l.x + 'px',
          top: l.y + 'px',
          background: l.color,
          transform: `translate(-50%,-50%) rotate(${l.rot}deg)`,
        }"
      >
        {{ l.char.toUpperCase() }}
      </div>

      <!-- 子弹 -->
      <div
        v-for="b in bullets"
        :key="b.id"
        class="bullet"
        :style="{ left: b.x + 'px', top: b.y + 'px', transform: `translate(-50%,-50%) rotate(${b.angle}deg)` }"
      ></div>

      <!-- 爆炸光环 -->
      <div
        v-for="b in booms"
        :key="b.id"
        class="boom"
        :style="{ left: b.x + 'px', top: b.y + 'px', borderColor: b.color }"
      ></div>

      <!-- 炮台 -->
      <div class="turret">
        <div class="barrel" :style="{ transform: `rotate(${cannonAngle}deg)` }"></div>
        <div class="dome">🛡️</div>
      </div>
    </div>

    <!-- HUD -->
    <div class="hud">
      <StatPill icon="⭐" :value="score" label="得分" tone="sunny" />
      <StatPill icon="🚀" :value="'Lv.' + level" label="关卡" tone="sky" />
      <StatPill icon="🔥" :value="'x' + combo" label="连击" tone="coral" />
      <div class="hearts">
        <span v-for="n in START_LIVES" :key="n" :class="n <= lives ? 'heart-on' : 'heart-off'">❤️</span>
      </div>
    </div>

    <!-- 连击提示 -->
    <Transition name="fade">
      <div v-if="combo >= 3 && state === 'playing'" class="combo-toast">连击 x{{ combo }}! 🔥</div>
    </Transition>

    <!-- 升级提示 -->
    <Transition name="fade">
      <div v-if="levelUp" class="levelup">LEVEL {{ level }}! 🎉</div>
    </Transition>

    <!-- 开始界面 -->
    <div v-if="state === 'ready'" class="overlay">
      <div class="panel dialog">
        <div class="dialog-emoji">🚀</div>
        <h2>字母雨大作战</h2>
        <p>字母从天上掉下来，<br />敲下键盘上对应的字母，发射子弹击落它！<br />漏掉 {{ START_LIVES }} 个就输啦～</p>
        <button class="btn-3d bg-grape start-btn" @click="startGame">开始游戏</button>
        <div class="hint-tip">最高分：{{ best }}</div>
      </div>
    </div>

    <!-- 倒计时 -->
    <div v-else-if="state === 'countdown'" class="overlay transparent">
      <div class="count-num" :key="countdown">{{ countdown }}</div>
    </div>

    <!-- 结束界面 -->
    <div v-else-if="state === 'over'" class="overlay">
      <div class="panel dialog">
        <div class="dialog-emoji">🏆</div>
        <h2>游戏结束</h2>
        <div class="result-grid">
          <div class="result"><span class="rv">{{ score }}</span><span class="rl">得分</span></div>
          <div class="result"><span class="rv">{{ destroyed }}</span><span class="rl">击落</span></div>
          <div class="result"><span class="rv">x{{ bestCombo }}</span><span class="rl">最高连击</span></div>
        </div>
        <div class="hint-tip" v-if="score >= best && score > 0">🎉 新纪录！</div>
        <div class="btn-row">
          <button class="btn-3d bg-mint" @click="startGame">再玩一次</button>
          <button class="btn-3d bg-grape" @click="emit('exit')">返回菜单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rain-game {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.rain-game.shaking {
  animation: shake 0.38s ease-in-out;
}

/* 背景 */
.sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #bfe9ff 0%, #dff3ff 55%, #eafbf1 100%);
}
.cloud {
  position: absolute;
  font-size: 60px;
  opacity: 0.85;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.06));
  animation: drift linear infinite;
}
.c1 { top: 8%; left: -15%; font-size: 70px; animation-duration: 34s; }
.c2 { top: 26%; left: -25%; font-size: 48px; animation-duration: 46s; animation-delay: -12s; }
.c3 { top: 46%; left: -20%; font-size: 56px; animation-duration: 40s; animation-delay: -24s; }
@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(140vw); }
}
.ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 44px;
  background: linear-gradient(180deg, #7ee08a, #4cc96a);
  border-top: 4px solid rgba(255, 255, 255, 0.5);
}

.play-area {
  position: absolute;
  inset: 0;
}

/* 字母泡泡 */
.letter {
  position: absolute;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  color: #fff;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.25);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.14), inset 0 3px 0 rgba(255, 255, 255, 0.5);
  will-change: transform, top;
}

/* 子弹 */
.bullet {
  position: absolute;
  width: 10px;
  height: 22px;
  border-radius: 99px;
  background: linear-gradient(180deg, #fff6c9, #ffc93c);
  box-shadow: 0 0 12px 3px rgba(255, 201, 60, 0.8);
  will-change: transform, left, top;
}

/* 爆炸光环 */
.boom {
  position: absolute;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 5px solid #fff;
  border-radius: 999px;
  animation: boom 0.5s ease-out forwards;
  pointer-events: none;
}
@keyframes boom {
  0% { transform: scale(0.4); opacity: 1; }
  100% { transform: scale(4.5); opacity: 0; }
}

/* 炮台 */
.turret {
  position: absolute;
  left: 50%;
  bottom: 20px;
  width: 70px;
  height: 70px;
  transform: translateX(-50%);
}
.barrel {
  position: absolute;
  left: 50%;
  bottom: 22px;
  width: 16px;
  height: 46px;
  margin-left: -8px;
  background: linear-gradient(180deg, #8b93ff, #5b3fd6);
  border-radius: 8px;
  transform-origin: bottom center;
  transition: transform 0.12s ease-out;
  box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.4);
}
.dome {
  position: absolute;
  left: 50%;
  bottom: 4px;
  transform: translateX(-50%);
  font-size: 40px;
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.25));
}

/* HUD */
.hud {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  z-index: 10;
}
.hearts {
  margin-left: auto;
  font-size: 26px;
  display: flex;
  gap: 4px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}
.heart-off { opacity: 0.25; filter: grayscale(1); }

/* 提示气泡 */
.combo-toast,
.levelup {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-display);
  font-weight: 700;
  z-index: 20;
  pointer-events: none;
}
.combo-toast {
  top: 74px;
  font-size: 26px;
  color: #fff;
  -webkit-text-stroke: 2px var(--color-coral-dark);
  paint-order: stroke fill;
}
.levelup {
  top: 40%;
  font-size: clamp(34px, 8vw, 60px);
  color: #fff;
  -webkit-text-stroke: 3px var(--color-grape-dark);
  paint-order: stroke fill;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 遮罩/对话框 */
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(58, 46, 95, 0.35);
  backdrop-filter: blur(3px);
  z-index: 30;
}
.overlay.transparent { background: transparent; backdrop-filter: none; }
.dialog {
  border-radius: 28px;
  padding: 26px 34px;
  text-align: center;
  max-width: 90%;
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.dialog-emoji { font-size: 60px; line-height: 1; }
.dialog h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  color: var(--color-ink);
  margin: 6px 0 10px;
}
.dialog p {
  font-weight: 600;
  line-height: 1.7;
  color: rgba(58, 46, 95, 0.8);
  font-size: 15px;
}
.start-btn { margin-top: 16px; padding: 12px 34px; font-size: 20px; }
.hint-tip {
  margin-top: 12px;
  font-weight: 700;
  font-size: 14px;
  color: rgba(58, 46, 95, 0.55);
}

.count-num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 120px;
  color: #fff;
  -webkit-text-stroke: 5px var(--color-grape);
  paint-order: stroke fill;
  animation: pop-in 0.6s ease-out both;
}

.result-grid {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin: 8px 0 4px;
}
.result {
  background: rgba(124, 92, 255, 0.1);
  border-radius: 18px;
  padding: 10px 18px;
  display: flex;
  flex-direction: column;
}
.rv { font-family: var(--font-display); font-weight: 700; font-size: 30px; color: var(--color-grape-dark); }
.rl { font-size: 12px; font-weight: 700; color: rgba(58, 46, 95, 0.6); }
.btn-row { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.btn-row .btn-3d { padding: 11px 22px; font-size: 17px; }
</style>
