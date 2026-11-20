<script setup>
import { computed } from 'vue'
import { KEYBOARD_ROWS, HOME_BUMP_CODES, FINGER_COLORS } from '../data/keyboard'
import { useKeyboard } from '../composables/useKeyboard'
import { click as clickSound } from '../utils/sound'

/**
 * 虚拟键盘
 * --------------------------------------------------------
 * - 与物理键盘实时同步高亮（通过共享的 pressed 状态）
 * - 按指法分区着色（触摸打字教学）
 * - hints：需要提示的字符数组，对应键会发光；仅一个提示时显示 👆 指引
 * - 支持点击/触摸触发（走与物理按键相同的处理链）
 */
const props = defineProps({
  hints: { type: Array, default: () => [] },
})

const { pressed, emitSynthetic } = useKeyboard()

// char -> code 反查表（静态）
const CHAR_TO_CODE = (() => {
  const m = {}
  for (const row of KEYBOARD_ROWS) for (const k of row) if (k.char) m[k.char] = k.code
  return m
})()

const validHints = computed(() => props.hints.filter(Boolean))
const hintCodes = computed(() => new Set(validHints.value.map((c) => CHAR_TO_CODE[c]).filter(Boolean)))
const singleHintCode = computed(() => (validHints.value.length === 1 ? CHAR_TO_CODE[validHints.value[0]] : ''))

function capClass(key) {
  const finger = FINGER_COLORS[key.finger] || FINGER_COLORS.li
  const isDown = pressed.has(key.code)
  const cls = [isDown ? finger.active : finger.bg]
  if (isDown) cls.push('is-down')
  else if (hintCodes.value.has(key.code)) cls.push('is-hint')
  if (key.kind === 'fn' || key.kind === 'back') cls.push('is-fn')
  return cls
}

function onPress(key) {
  if (!key.char) {
    // 功能键给个视觉/听觉反馈即可
    clickSound()
    return
  }
  clickSound()
  emitSynthetic(key.code, key.char)
}
</script>

<template>
  <div class="vkb no-select">
    <div class="kb-row" v-for="(row, ri) in KEYBOARD_ROWS" :key="ri">
      <button
        v-for="key in row"
        :key="key.code"
        type="button"
        class="kb-key"
        :style="{ '--w': key.w }"
        tabindex="-1"
        @pointerdown.prevent="onPress(key)"
      >
        <span class="kb-cap" :class="capClass(key)">
          <span v-if="key.sub" class="kb-sub">{{ key.sub }}</span>
          <span class="kb-label">{{ key.label }}</span>
          <span v-if="HOME_BUMP_CODES.has(key.code)" class="kb-bump"></span>
          <span v-if="key.code === singleHintCode" class="kb-point">👆</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.vkb {
  --ku: clamp(17px, min(6.2vw, 6.4vh), 54px);
  --kh: calc(var(--ku) * 0.96);
  display: flex;
  flex-direction: column;
  gap: calc(var(--ku) * 0.14);
  padding: calc(var(--ku) * 0.28);
  align-items: center;
}

.kb-row {
  display: flex;
  gap: 0;
  justify-content: center;
}

.kb-key {
  width: calc(var(--ku) * var(--w));
  padding: calc(var(--ku) * 0.05);
  background: transparent;
  border: none;
  flex: none;
  position: relative;
}

.kb-cap {
  position: relative;
  height: var(--kh);
  border-radius: calc(var(--ku) * 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: calc(var(--ku) * 0.4);
  color: var(--color-ink);
  cursor: pointer;
  box-shadow:
    0 calc(var(--ku) * 0.09) 0 rgba(58, 46, 95, 0.22),
    inset 0 calc(var(--ku) * 0.04) 0 rgba(255, 255, 255, 0.75),
    inset 0 calc(var(--ku) * -0.04) 0 rgba(58, 46, 95, 0.08);
  transition:
    transform 0.06s ease,
    box-shadow 0.06s ease,
    filter 0.12s ease;
}

.kb-cap.is-fn {
  font-size: calc(var(--ku) * 0.3);
  opacity: 0.95;
}

.kb-label {
  line-height: 1;
  margin-top: calc(var(--ku) * 0.04);
}

.kb-sub {
  position: absolute;
  top: calc(var(--ku) * 0.1);
  font-size: calc(var(--ku) * 0.24);
  opacity: 0.5;
  line-height: 1;
}

/* home row F/J 定位凸起 */
.kb-bump {
  position: absolute;
  bottom: calc(var(--ku) * 0.14);
  width: calc(var(--ku) * 0.28);
  height: calc(var(--ku) * 0.05);
  border-radius: 99px;
  background: rgba(58, 46, 95, 0.35);
}

/* 按下态 */
.kb-cap.is-down {
  transform: translateY(calc(var(--ku) * 0.09));
  box-shadow:
    0 0 0 rgba(0, 0, 0, 0),
    inset 0 calc(var(--ku) * 0.06) calc(var(--ku) * 0.1) rgba(58, 46, 95, 0.35);
  color: #fff;
}

/* 提示态：粉色光环 + 轻微跳动 */
.kb-cap.is-hint {
  animation: kbhint 0.85s ease-in-out infinite;
  box-shadow:
    0 0 0 calc(var(--ku) * 0.06) #fff,
    0 0 0 calc(var(--ku) * 0.13) var(--color-bubblegum),
    0 calc(var(--ku) * 0.1) calc(var(--ku) * 0.22) rgba(255, 110, 199, 0.55);
}
@keyframes kbhint {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-7%) scale(1.05); }
}

/* 👆 指引 */
.kb-point {
  position: absolute;
  top: calc(var(--ku) * -0.72);
  left: 50%;
  font-size: calc(var(--ku) * 0.52);
  z-index: 6;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
  animation: pointy 0.85s ease-in-out infinite;
}
@keyframes pointy {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 30%); }
}
</style>
