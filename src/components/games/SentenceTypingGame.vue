<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import StatPill from '../StatPill.vue'
import CelebrationOverlay from '../CelebrationOverlay.vue'
import { useKeyboard } from '../../composables/useKeyboard'
import { useHints } from '../../composables/useHints'
import { eventToChar } from '../../data/keyboard'
import { pickSentences } from '../../data/content'
import * as sfx from '../../utils/sound'
import { sideCannons, starRain, fireworks } from '../../utils/celebrate'

/**
 * 游戏三：句子冒险 🐾
 * 输入整句，小宠物随完成进度沿赛道奔向终点的奖励。
 */
const emit = defineEmits(['exit'])

const { onKey } = useKeyboard()
const { setHints, clearHints } = useHints()

/* ----------------------------- 宠物 ----------------------------- */
const PETS = [
  { id: 'rabbit', emoji: '🐰', goal: '🥕', name: '小兔', flip: true },
  { id: 'cat', emoji: '🐱', goal: '🐟', name: '小猫', flip: true },
  { id: 'dog', emoji: '🐶', goal: '🦴', name: '小狗', flip: true },
  { id: 'panda', emoji: '🐼', goal: '🎋', name: '熊猫', flip: true },
  { id: 'rocket', emoji: '🚀', goal: '🌙', name: '火箭', flip: false },
]
const selectedPet = ref(PETS[0])
const sentCount = ref(4)
const COUNTS = [3, 4, 6]

/* ----------------------------- 状态 ----------------------------- */
const state = ref('setup') // setup | playing | over
const sents = ref([])
const index = ref(0)
const pos = ref(0)
const wrongFlash = ref(false)
const hopping = ref(false)

const score = ref(0)
const errors = ref(0)
const correctKeys = ref(0)
const sentErrors = ref(0)
const wpm = ref(0)
let startTime = 0
let timer = null

const celebrating = ref(false)
const celeb = ref({ emoji: '🎉', title: '到达终点!', subtitle: '' })

const PRAISE = ['太厉害了!', '句子达人!', '一路飞奔!', '完美通关!', '你太棒啦!']

/* ----------------------------- 派生 ----------------------------- */
const info = computed(() => sents.value[index.value] || { text: '', cn: '', emoji: '🏁' })
const progress = computed(() => (info.value.text ? pos.value / info.value.text.length : 0))
const petLeft = computed(() => `${6 + progress.value * 80}%`)

const chars = computed(() =>
  info.value.text.split('').map((ch, i) => ({
    ch,
    isSpace: ch === ' ',
    state: i < pos.value ? 'done' : i === pos.value ? (wrongFlash.value ? 'wrong' : 'current') : 'todo',
  })),
)
const accuracy = computed(() => {
  const total = correctKeys.value + errors.value
  return total === 0 ? 100 : Math.round((correctKeys.value / total) * 100)
})
const currentChar = computed(() =>
  state.value === 'playing' && !celebrating.value ? info.value.text[pos.value] || '' : '',
)
watch(currentChar, (c) => setHints(c ? [c] : []))

/* ----------------------------- 流程 ----------------------------- */
function startGame() {
  sents.value = pickSentences(sentCount.value)
  index.value = 0
  pos.value = 0
  score.value = 0
  errors.value = 0
  correctKeys.value = 0
  sentErrors.value = 0
  wpm.value = 0
  startTime = 0
  celebrating.value = false
  state.value = 'playing'
  sfx.click()
  clearInterval(timer)
  timer = setInterval(updateWpm, 500)
}

function updateWpm() {
  if (!startTime) return
  const mins = (Date.now() - startTime) / 60000
  if (mins > 0) wpm.value = Math.round(correctKeys.value / 5 / mins)
}

function petHop() {
  hopping.value = true
  sfx.hop()
  setTimeout(() => (hopping.value = false), 320)
}

function completeSentence() {
  const perfect = sentErrors.value === 0
  const gain = info.value.text.length * 5 + (perfect ? 30 : 0)
  score.value += gain

  celebrating.value = true
  celeb.value = {
    emoji: selectedPet.value.emoji,
    title: PRAISE[Math.floor(Math.random() * PRAISE.length)],
    subtitle: `${selectedPet.value.name}到达终点啦!  +${gain}分${perfect ? ' · 零失误!' : ''}`,
  }
  sideCannons()
  starRain()
  sfx.win()
  clearHints()

  setTimeout(() => {
    celebrating.value = false
    advance()
  }, 1900)
}

function advance() {
  index.value++
  pos.value = 0
  sentErrors.value = 0
  if (index.value >= sents.value.length) endGame()
}

function endGame() {
  state.value = 'over'
  clearInterval(timer)
  updateWpm()
  clearHints()
  fireworks(1600)
  sfx.fanfare()
}

/* ----------------------------- 输入 ----------------------------- */
let offKey = null
function handleKey(e) {
  if (e.repeat) return
  if (state.value === 'setup') {
    if (e.code === 'Enter' || e.code === 'Space') startGame()
    return
  }
  if (state.value !== 'playing' || celebrating.value) return

  if (!startTime) startTime = Date.now()
  const char = eventToChar(e)
  if (!char) return

  const text = info.value.text
  const expected = text[pos.value]
  if (char === expected) {
    correctKeys.value++
    pos.value++
    // 完成一个单词（下一个是空格或结尾）→ 宠物跳跃
    const nextCh = text[pos.value]
    if (nextCh === ' ' || pos.value >= text.length) petHop()
    else sfx.correct()

    if (pos.value >= text.length) completeSentence()
  } else {
    errors.value++
    sentErrors.value++
    sfx.wrong()
    wrongFlash.value = true
    setTimeout(() => (wrongFlash.value = false), 320)
  }
}
offKey = onKey(handleKey)

onUnmounted(() => {
  if (offKey) offKey()
  clearInterval(timer)
  clearHints()
})

function pickPet(p) {
  selectedPet.value = p
  sfx.blip()
}
</script>

<template>
  <div class="sent-game">
    <!-- 背景 -->
    <div class="sky-bg"></div>
    <div class="sun">☀️</div>
    <div class="cloud sc1">☁️</div>
    <div class="cloud sc2">⛅</div>

    <!-- 设置界面 -->
    <div v-if="state === 'setup'" class="setup">
      <div class="panel setup-card">
        <div class="setup-emoji">🐾</div>
        <h2>句子冒险</h2>
        <p class="setup-sub">选一只小伙伴，带它跑到终点领奖！</p>

        <div class="field">
          <div class="field-label">🐾 选择宠物</div>
          <div class="pets">
            <button
              v-for="p in PETS"
              :key="p.id"
              class="pet-opt"
              :class="{ active: selectedPet.id === p.id }"
              @click="pickPet(p)"
            >
              <span class="pet-emoji">{{ p.emoji }}</span>
              <span class="pet-name">{{ p.name }}</span>
              <span class="pet-goal">→ {{ p.goal }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <div class="field-label">🔢 句子数量</div>
          <div class="chips">
            <button
              v-for="n in COUNTS"
              :key="n"
              class="chip"
              :class="{ active: sentCount === n }"
              @click="((sentCount = n), sfx.blip())"
            >
              {{ n }} 句
            </button>
          </div>
        </div>

        <button class="btn-3d bg-bubblegum start-btn" @click="startGame">出发 ▶</button>
      </div>
    </div>

    <!-- 游戏界面 -->
    <template v-else-if="state === 'playing'">
      <div class="hud">
        <StatPill icon="📜" :value="index + 1 + '/' + sents.length" label="句子" tone="bubblegum" />
        <StatPill icon="⭐" :value="score" label="得分" tone="sunny" />
        <StatPill icon="🎯" :value="accuracy + '%'" label="正确率" tone="mint" />
        <StatPill icon="⚡" :value="wpm" label="WPM" tone="grape" />
      </div>

      <div class="stage">
        <div class="sentence-card panel">
          <div class="sent-emoji">{{ info.emoji }}</div>
          <div class="sentence">
            <span
              v-for="(c, i) in chars"
              :key="i"
              class="ch"
              :class="[c.state, { space: c.isSpace }]"
            >{{ c.isSpace ? (c.state === 'current' ? '␣' : '\u00A0') : c.ch }}</span>
          </div>
          <div class="sent-cn">💬 {{ info.cn }}</div>
        </div>
      </div>

      <!-- 赛道 & 宠物 -->
      <div class="track">
        <div class="goal" :class="{ reached: celebrating }">{{ selectedPet.goal }}</div>
        <div class="pet" :style="{ left: petLeft }">
          <span class="pet-flip" :class="{ flip: selectedPet.flip }">
            <span class="pet-emoji" :class="{ hop: hopping }">
              {{ selectedPet.emoji }}
            </span>
          </span>
        </div>
        <div class="grass"></div>
        <div class="track-bar">
          <div class="track-fill" :style="{ width: (progress * 100).toFixed(1) + '%' }"></div>
        </div>
      </div>

      <CelebrationOverlay
        :visible="celebrating"
        :emoji="celeb.emoji"
        :title="celeb.title"
        :subtitle="celeb.subtitle"
      />
    </template>

    <!-- 结束界面 -->
    <div v-else class="overlay">
      <div class="panel dialog">
        <div class="dialog-emoji">{{ selectedPet.emoji }}🏆</div>
        <h2>冒险成功！</h2>
        <div class="result-grid">
          <div class="result"><span class="rv">{{ score }}</span><span class="rl">总得分</span></div>
          <div class="result"><span class="rv">{{ accuracy }}%</span><span class="rl">正确率</span></div>
          <div class="result"><span class="rv">{{ wpm }}</span><span class="rl">速度 WPM</span></div>
          <div class="result"><span class="rv">{{ sents.length }}</span><span class="rl">完成句子</span></div>
        </div>
        <div class="btn-row">
          <button class="btn-3d bg-bubblegum" @click="startGame">再来一局</button>
          <button class="btn-3d bg-sky" @click="state = 'setup'">重选宠物</button>
          <button class="btn-3d bg-grape" @click="emit('exit')">返回菜单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sent-game { position: relative; width: 100%; height: 100%; overflow: hidden; }
.sky-bg { position: absolute; inset: 0; background: linear-gradient(180deg, #cdefff 0%, #eaf7ff 60%, #f6ffe9 100%); }
.sun { position: absolute; top: 14px; right: 24px; font-size: 56px; animation: spin-slow 18s linear infinite; filter: drop-shadow(0 0 12px rgba(255,201,60,0.7)); }
.cloud { position: absolute; font-size: 54px; opacity: 0.9; animation: drift linear infinite; }
.sc1 { top: 10%; left: -15%; animation-duration: 40s; }
.sc2 { top: 26%; left: -25%; font-size: 42px; animation-duration: 55s; animation-delay: -18s; }
@keyframes drift { from { transform: translateX(0); } to { transform: translateX(140vw); } }

/* HUD */
.hud { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; gap: 10px; flex-wrap: wrap; z-index: 10; }

/* 句子卡片 */
.stage { position: absolute; top: 64px; left: 0; right: 0; bottom: 150px; display: grid; place-items: center; padding: 10px 20px; }
.sentence-card { border-radius: 28px; padding: 22px 30px; text-align: center; max-width: 900px; width: 100%; }
.sent-emoji { font-size: 40px; line-height: 1; margin-bottom: 6px; }
.sentence {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(22px, 4.2vw, 38px);
  line-height: 1.7;
  letter-spacing: 1px;
  word-break: break-word;
}
.ch { border-radius: 8px; padding: 0 1px; transition: background 0.15s, color 0.15s; }
.ch.space { display: inline-block; min-width: 0.5em; }
.ch.todo { color: rgba(58, 46, 95, 0.35); }
.ch.done { color: var(--color-mint-dark); }
.ch.current {
  background: var(--color-sunny);
  color: var(--color-ink);
  box-shadow: 0 0 0 3px rgba(255, 201, 60, 0.4);
  animation: glow 1.3s ease-in-out infinite;
}
.ch.wrong { background: var(--color-coral); color: #fff; animation: shake 0.32s ease-in-out; }
.sent-cn { margin-top: 12px; font-weight: 700; font-size: 15px; color: rgba(58, 46, 95, 0.55); }

/* 赛道 */
.track { position: absolute; left: 0; right: 0; bottom: 0; height: 140px; }
.grass { position: absolute; left: 0; right: 0; bottom: 0; height: 54px; background: linear-gradient(180deg, #7ee08a, #46c265); border-top: 4px solid rgba(255,255,255,0.5); }
.goal { position: absolute; bottom: 44px; right: 5%; font-size: 46px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2)); animation: bob 1.6s ease-in-out infinite; z-index: 3; }
.goal.reached { animation: pop-in 0.4s ease-out; }
.pet { position: absolute; bottom: 40px; transform: translateX(-50%); transition: left 0.28s cubic-bezier(0.34, 1.2, 0.64, 1); z-index: 4; }
.pet-flip { display: block; }
.pet-flip.flip { transform: scaleX(-1); }
.pet-emoji { display: block; font-size: 52px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.22)); animation: petidle 1.4s ease-in-out infinite; }
.pet-emoji.hop { animation: pethop 0.32s ease-out; }
@keyframes petidle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes pethop { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-26px) scale(1.12); } 100% { transform: translateY(0) scale(1); } }
.track-bar { position: absolute; left: 6%; right: 6%; bottom: 16px; height: 12px; border-radius: 99px; background: rgba(255,255,255,0.6); overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
.track-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--color-mint), var(--color-sunny)); transition: width 0.28s ease; }

/* 设置界面 */
.setup { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; overflow-y: auto; z-index: 5; }
.setup-card { border-radius: 30px; padding: 26px 30px; text-align: center; max-width: 600px; width: 100%; }
.setup-emoji { font-size: 54px; animation: bob 2s ease-in-out infinite; }
.setup-card h2 { font-family: var(--font-display); font-weight: 700; font-size: 32px; color: var(--color-ink); margin: 4px 0 2px; }
.setup-sub { font-weight: 600; color: rgba(58, 46, 95, 0.65); margin-bottom: 14px; }
.field { margin: 14px 0; text-align: left; }
.field-label { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--color-ink); margin-bottom: 8px; }
.pets { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 10px; }
.pet-opt { border: 3px solid rgba(255,110,199,0.2); background: rgba(255,255,255,0.7); border-radius: 18px; padding: 10px 6px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: all 0.15s ease; }
.pet-opt:hover { transform: translateY(-3px); }
.pet-opt.active { border-color: var(--color-bubblegum); background: rgba(255,110,199,0.15); box-shadow: 0 5px 0 rgba(224,70,159,0.5); }
.pet-opt .pet-emoji { font-size: 34px; }
.pet-name { font-family: var(--font-display); font-weight: 600; font-size: 14px; color: var(--color-ink); }
.pet-goal { font-size: 12px; color: rgba(58,46,95,0.5); font-weight: 700; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { border: 2px solid rgba(255,110,199,0.25); background: rgba(255,255,255,0.7); color: var(--color-ink); font-weight: 700; font-size: 14px; padding: 8px 16px; border-radius: 999px; cursor: pointer; transition: all 0.15s; }
.chip.active { background: var(--color-bubblegum); color: #fff; border-color: var(--color-bubblegum-dark); box-shadow: 0 4px 0 var(--color-bubblegum-dark); }
.start-btn { margin-top: 18px; padding: 13px 40px; font-size: 22px; }

/* 结束 */
.overlay { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(58,46,95,0.3); backdrop-filter: blur(3px); z-index: 30; padding: 20px; }
.dialog { border-radius: 28px; padding: 26px 34px; text-align: center; animation: pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both; max-width: 94%; }
.dialog-emoji { font-size: 56px; }
.dialog h2 { font-family: var(--font-display); font-weight: 700; font-size: 30px; color: var(--color-ink); margin: 6px 0 12px; }
.result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 520px) { .result-grid { grid-template-columns: repeat(4, 1fr); } }
.result { background: rgba(255,110,199,0.12); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; }
.rv { font-family: var(--font-display); font-weight: 700; font-size: 28px; color: var(--color-bubblegum-dark); }
.rl { font-size: 12px; font-weight: 700; color: rgba(58,46,95,0.6); }
.btn-row { display: flex; gap: 10px; justify-content: center; margin-top: 18px; flex-wrap: wrap; }
.btn-row .btn-3d { padding: 11px 20px; font-size: 16px; }
</style>
