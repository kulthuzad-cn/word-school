<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import StatPill from '../StatPill.vue'
import CelebrationOverlay from '../CelebrationOverlay.vue'
import { useKeyboard } from '../../composables/useKeyboard'
import { useHints } from '../../composables/useHints'
import { eventToChar } from '../../data/keyboard'
import { WORD_CATEGORIES, pickWords } from '../../data/content'
import * as sfx from '../../utils/sound'
import { popWord, fireworks } from '../../utils/celebrate'

/**
 * 游戏二：单词闯关 ✨
 * 拼写简单单词，每完成一个都有炫酷庆祝特效。
 */
const emit = defineEmits(['exit'])

const { onKey } = useKeyboard()
const { setHints, clearHints } = useHints()

/* ----------------------------- 设置 ----------------------------- */
const selectedCat = ref('all')
const wordCount = ref(8)
const COUNTS = [5, 8, 12]

/* ----------------------------- 状态 ----------------------------- */
const state = ref('setup') // setup | playing | over
const words = ref([])
const index = ref(0)
const pos = ref(0)
const wrongFlash = ref(false)

const score = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const errors = ref(0)
const correctKeys = ref(0)
const wordErrors = ref(0)

const wpm = ref(0)
let startTime = 0
let timer = null

const celebrating = ref(false)
const celeb = ref({ emoji: '🎉', title: '太棒了!', subtitle: '' })

const PRAISE = ['太棒了!', '真厉害!', '好样的!', '完美!', '继续保持!', '打字小达人!', 'Wow!']

/* ----------------------------- 派生 ----------------------------- */
const info = computed(() => words.value[index.value] || { w: '', emoji: '❓', cn: '' })
const lettersArr = computed(() =>
  info.value.w.split('').map((ch, i) => ({
    ch,
    state: i < pos.value ? 'done' : i === pos.value ? (wrongFlash.value ? 'wrong' : 'current') : 'todo',
  })),
)
const accuracy = computed(() => {
  const total = correctKeys.value + errors.value
  return total === 0 ? 100 : Math.round((correctKeys.value / total) * 100)
})
const currentChar = computed(() =>
  state.value === 'playing' && !celebrating.value ? info.value.w[pos.value] || '' : '',
)
watch(currentChar, (c) => setHints(c ? [c] : []))

/* ----------------------------- 流程 ----------------------------- */
function startGame() {
  words.value = pickWords(wordCount.value, selectedCat.value)
  index.value = 0
  pos.value = 0
  score.value = 0
  streak.value = 0
  bestStreak.value = 0
  errors.value = 0
  correctKeys.value = 0
  wordErrors.value = 0
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

function completeWord() {
  const perfect = wordErrors.value === 0
  const gain = info.value.w.length * 10 + (perfect ? 20 : 0) + streak.value * 5
  score.value += gain

  celebrating.value = true
  celeb.value = {
    emoji: info.value.emoji,
    title: PRAISE[Math.floor(Math.random() * PRAISE.length)],
    subtitle: `${info.value.w} · ${info.value.cn}  +${gain}分${perfect ? ' · 零失误!' : ''}`,
  }
  popWord()
  sfx.win()
  clearHints()

  setTimeout(() => {
    celebrating.value = false
    advance()
  }, 1600)
}

function advance() {
  index.value++
  pos.value = 0
  wordErrors.value = 0
  if (index.value >= words.value.length) {
    endGame()
  }
}

function endGame() {
  state.value = 'over'
  clearInterval(timer)
  updateWpm()
  clearHints()
  fireworks(1500)
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

  const expected = info.value.w[pos.value]
  if (char === expected) {
    correctKeys.value++
    pos.value++
    sfx.correct()
    if (pos.value >= info.value.w.length) {
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
      completeWord()
    }
  } else {
    errors.value++
    wordErrors.value++
    streak.value = 0
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

function pickCat(id) {
  selectedCat.value = id
  sfx.blip()
}
</script>

<template>
  <div class="word-game">
    <div class="bg-blobs">
      <span class="blob b1">🔤</span>
      <span class="blob b2">📖</span>
      <span class="blob b3">✏️</span>
      <span class="blob b4">🅰️</span>
    </div>

    <!-- 设置界面 -->
    <div v-if="state === 'setup'" class="setup">
      <div class="panel setup-card">
        <div class="setup-emoji">✨</div>
        <h2>单词闯关</h2>
        <p class="setup-sub">选择一个主题，开始拼写单词吧！</p>

        <div class="field">
          <div class="field-label">🎯 主题</div>
          <div class="chips">
            <button
              class="chip"
              :class="{ active: selectedCat === 'all' }"
              @click="pickCat('all')"
            >
              🌈 全部
            </button>
            <button
              v-for="c in WORD_CATEGORIES"
              :key="c.id"
              class="chip"
              :class="{ active: selectedCat === c.id }"
              @click="pickCat(c.id)"
            >
              {{ c.icon }} {{ c.name }}
            </button>
          </div>
        </div>

        <div class="field">
          <div class="field-label">🔢 单词数量</div>
          <div class="chips">
            <button
              v-for="n in COUNTS"
              :key="n"
              class="chip num"
              :class="{ active: wordCount === n }"
              @click="((wordCount = n), sfx.blip())"
            >
              {{ n }} 个
            </button>
          </div>
        </div>

        <button class="btn-3d bg-mint start-btn" @click="startGame">开始 ▶</button>
      </div>
    </div>

    <!-- 游戏界面 -->
    <template v-else-if="state === 'playing'">
      <div class="hud">
        <StatPill icon="📝" :value="index + 1 + '/' + words.length" label="进度" tone="sky" />
        <StatPill icon="⭐" :value="score" label="得分" tone="sunny" />
        <StatPill icon="🎯" :value="accuracy + '%'" label="正确率" tone="mint" />
        <StatPill icon="⚡" :value="wpm" label="WPM" tone="grape" />
        <StatPill icon="🔥" :value="'x' + streak" label="连对" tone="coral" />
      </div>

      <div class="stage">
        <div class="word-card panel">
          <div class="word-emoji">{{ info.emoji }}</div>
          <div class="word-letters">
            <span
              v-for="(l, i) in lettersArr"
              :key="i"
              class="letter-box"
              :class="l.state"
            >{{ l.ch }}</span>
          </div>
          <div class="word-cn">{{ info.cn }}</div>
          <div class="word-cat">{{ info.catIcon }} {{ info.catName }}</div>
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
        <div class="dialog-emoji">🏅</div>
        <h2>全部完成！</h2>
        <div class="result-grid">
          <div class="result"><span class="rv">{{ score }}</span><span class="rl">总得分</span></div>
          <div class="result"><span class="rv">{{ accuracy }}%</span><span class="rl">正确率</span></div>
          <div class="result"><span class="rv">{{ wpm }}</span><span class="rl">速度 WPM</span></div>
          <div class="result"><span class="rv">x{{ bestStreak }}</span><span class="rl">最长连对</span></div>
        </div>
        <div class="medal">{{ score >= words.length * 40 ? '🥇 金牌打字员!' : score >= words.length * 25 ? '🥈 银牌选手!' : '🥉 继续加油!' }}</div>
        <div class="btn-row">
          <button class="btn-3d bg-mint" @click="startGame">再来一局</button>
          <button class="btn-3d bg-sky" @click="state = 'setup'">重选主题</button>
          <button class="btn-3d bg-grape" @click="emit('exit')">返回菜单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-game {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(160deg, #d7fbe8 0%, #d6f0ff 100%);
}

/* 背景漂浮装饰 */
.bg-blobs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.blob { position: absolute; font-size: 54px; opacity: 0.16; animation: float 6s ease-in-out infinite; }
.b1 { top: 12%; left: 8%; }
.b2 { top: 62%; left: 14%; animation-delay: -2s; }
.b3 { top: 20%; right: 10%; animation-delay: -1s; }
.b4 { top: 68%; right: 12%; animation-delay: -3s; }

/* HUD */
.hud {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  z-index: 10;
}

/* 舞台 */
.stage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 70px 20px 20px;
}
.word-card {
  border-radius: 32px;
  padding: 28px 40px 24px;
  text-align: center;
  max-width: 92%;
}
.word-emoji {
  font-size: clamp(56px, 12vw, 92px);
  line-height: 1;
  animation: bob 2.2s ease-in-out infinite;
}
.word-letters {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 18px 0 12px;
}
.letter-box {
  width: clamp(44px, 9vw, 68px);
  height: clamp(52px, 10vw, 78px);
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(30px, 6vw, 46px);
  text-transform: uppercase;
  transition: transform 0.12s ease, background 0.2s ease;
}
.letter-box.todo {
  background: rgba(124, 92, 255, 0.08);
  color: rgba(58, 46, 95, 0.4);
  box-shadow: inset 0 0 0 3px rgba(124, 92, 255, 0.15);
}
.letter-box.done {
  background: var(--color-mint);
  color: #fff;
  box-shadow: 0 5px 0 var(--color-mint-dark);
  animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.letter-box.current {
  background: var(--color-sunny);
  color: var(--color-ink);
  box-shadow: 0 5px 0 var(--color-sunny-dark), 0 0 0 4px rgba(255, 201, 60, 0.4);
  transform: translateY(-6px) scale(1.06);
  animation: glow 1.4s ease-in-out infinite;
}
.letter-box.wrong {
  background: var(--color-coral);
  color: #fff;
  box-shadow: 0 5px 0 var(--color-coral-dark);
  animation: shake 0.32s ease-in-out;
}
.word-cn {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(18px, 3.4vw, 24px);
  color: var(--color-ink);
}
.word-cat {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(58, 46, 95, 0.5);
}

/* 设置界面 */
.setup { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; overflow-y: auto; }
.setup-card { border-radius: 30px; padding: 26px 30px; text-align: center; max-width: 560px; width: 100%; }
.setup-emoji { font-size: 54px; animation: bob 2s ease-in-out infinite; }
.setup-card h2 { font-family: var(--font-display); font-weight: 700; font-size: 32px; color: var(--color-ink); margin: 4px 0 2px; }
.setup-sub { font-weight: 600; color: rgba(58, 46, 95, 0.65); margin-bottom: 14px; }
.field { margin: 14px 0; text-align: left; }
.field-label { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--color-ink); margin-bottom: 8px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  border: 2px solid rgba(124, 92, 255, 0.2);
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-ink);
  font-weight: 700;
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip:hover { transform: translateY(-2px); }
.chip.active { background: var(--color-grape); color: #fff; border-color: var(--color-grape-dark); box-shadow: 0 4px 0 var(--color-grape-dark); }
.chip.num.active { background: var(--color-mint); border-color: var(--color-mint-dark); box-shadow: 0 4px 0 var(--color-mint-dark); }
.start-btn { margin-top: 18px; padding: 13px 40px; font-size: 22px; }

/* 结束对话框 */
.overlay { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(58, 46, 95, 0.3); backdrop-filter: blur(3px); z-index: 30; padding: 20px; }
.dialog { border-radius: 28px; padding: 26px 34px; text-align: center; animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; max-width: 94%; }
.dialog-emoji { font-size: 62px; }
.dialog h2 { font-family: var(--font-display); font-weight: 700; font-size: 30px; color: var(--color-ink); margin: 6px 0 12px; }
.result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 520px) { .result-grid { grid-template-columns: repeat(4, 1fr); } }
.result { background: rgba(61, 220, 151, 0.12); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; }
.rv { font-family: var(--font-display); font-weight: 700; font-size: 28px; color: var(--color-mint-dark); }
.rl { font-size: 12px; font-weight: 700; color: rgba(58, 46, 95, 0.6); }
.medal { margin-top: 14px; font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--color-grape-dark); }
.btn-row { display: flex; gap: 10px; justify-content: center; margin-top: 18px; flex-wrap: wrap; }
.btn-row .btn-3d { padding: 11px 20px; font-size: 16px; }
</style>
