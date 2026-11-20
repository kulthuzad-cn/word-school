<script setup>
import { ref, computed, watch } from 'vue'
import GameMenu from './components/GameMenu.vue'
import VirtualKeyboard from './components/VirtualKeyboard.vue'
import LetterRainGame from './components/games/LetterRainGame.vue'
import WordTypingGame from './components/games/WordTypingGame.vue'
import SentenceTypingGame from './components/games/SentenceTypingGame.vue'
import { useHints } from './composables/useHints'
import { muted, toggleMute, click as clickSound } from './utils/sound'

/**
 * 应用外壳
 * --------------------------------------------------------
 * 顶部：返回 / 标题 / 静音
 * 中部：主菜单 或 当前游戏
 * 底部：常驻虚拟键盘（与物理键盘同步）
 */
const GAMES = {
  rain: LetterRainGame,
  word: WordTypingGame,
  sentence: SentenceTypingGame,
}
const TITLES = { rain: '🚀 字母雨', word: '✨ 单词闯关', sentence: '🐾 句子冒险' }

const current = ref(null)
const { hints, clearHints } = useHints()
const gameComp = computed(() => (current.value ? GAMES[current.value] : null))

function start(id) {
  clickSound()
  current.value = id
}
function exit() {
  clickSound()
  current.value = null
  clearHints()
}
watch(current, (v) => {
  if (!v) clearHints()
})
</script>

<template>
  <div class="app-shell">
    <!-- 顶部栏 -->
    <header class="topbar">
      <div class="left">
        <button v-if="current" class="icon-btn" @click="exit">← 菜单</button>
        <span v-else class="brand">🎹 打字乐园</span>
      </div>
      <div class="center">
        <span v-if="current" class="game-title">{{ TITLES[current] }}</span>
      </div>
      <div class="right">
        <button class="icon-btn round" :title="muted ? '开启声音' : '静音'" @click="toggleMute">
          {{ muted ? '🔇' : '🔊' }}
        </button>
      </div>
    </header>

    <!-- 主区域 -->
    <main class="main">
      <component :is="gameComp" v-if="current" @exit="exit" />
      <GameMenu v-else @select="start" />
    </main>

    <!-- 底部常驻虚拟键盘 -->
    <footer class="dock">
      <VirtualKeyboard :hints="hints" />
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部栏 */
.topbar {
  flex: none;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  gap: 10px;
  z-index: 50;
}
.topbar .left,
.topbar .right {
  display: flex;
  align-items: center;
  min-width: 92px;
}
.topbar .right { justify-content: flex-end; }
.topbar .center { flex: 1; text-align: center; }

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: #fff;
  -webkit-text-stroke: 1.5px var(--color-ink);
  paint-order: stroke fill;
  letter-spacing: 1px;
}
.game-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: #fff;
  -webkit-text-stroke: 2px var(--color-ink);
  paint-order: stroke fill;
  letter-spacing: 1px;
}

.icon-btn {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.75);
  border: 2px solid rgba(255, 255, 255, 0.9);
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(58, 46, 95, 0.18);
  transition: transform 0.08s ease, filter 0.15s ease;
}
.icon-btn:hover { filter: brightness(1.05); }
.icon-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(58, 46, 95, 0.18); }
.icon-btn.round { padding: 7px 12px; font-size: 18px; }

/* 主区域 */
.main {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

/* 键盘托盘 */
.dock {
  flex: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.6));
  border-top: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 -10px 30px -12px rgba(58, 46, 95, 0.4);
  display: flex;
  justify-content: center;
  z-index: 50;
}
</style>
