<script setup>
import { click as clickSound } from '../utils/sound'

/**
 * 主菜单 —— 选择游戏
 */
const emit = defineEmits(['select'])

const GAMES = [
  {
    id: 'rain',
    icon: '🚀',
    title: '字母雨',
    en: 'Letter Rain',
    desc: '字母从天而降，敲下对应按键发射子弹，把它们全部击落！',
    stars: 2,
    grad: 'from-sky to-grape',
    tag: '反应力',
  },
  {
    id: 'word',
    icon: '✨',
    title: '单词闯关',
    en: 'Word Power',
    desc: '拼写简单单词，每完成一个都有超炫酷的庆祝特效！',
    stars: 1,
    grad: 'from-mint to-sky',
    tag: '拼写',
  },
  {
    id: 'sentence',
    icon: '🐾',
    title: '句子冒险',
    en: 'Pet Journey',
    desc: '输入整个句子，带着你的小宠物一路奔向终点领奖！',
    stars: 3,
    grad: 'from-bubblegum to-tangerine',
    tag: '流畅度',
  },
]

function pick(id) {
  clickSound()
  emit('select', id)
}
</script>

<template>
  <div class="menu">
    <header class="head">
      <div class="mascot">🦊</div>
      <h1 class="title text-sticker">打字乐园</h1>
      <p class="tagline">选一个游戏，和小伙伴一起快乐学打字吧！</p>
    </header>

    <div class="cards">
      <button
        v-for="g in GAMES"
        :key="g.id"
        class="card no-select"
        @click="pick(g.id)"
      >
        <div class="card-glow" :class="`bg-gradient-to-br ${g.grad}`"></div>
        <div class="card-inner">
          <div class="card-top">
            <span class="card-icon">{{ g.icon }}</span>
            <span class="card-tag">{{ g.tag }}</span>
          </div>
          <div class="card-title">{{ g.title }}</div>
          <div class="card-en">{{ g.en }}</div>
          <div class="card-desc">{{ g.desc }}</div>
          <div class="card-foot">
            <span class="stars">
              <span v-for="n in 3" :key="n" :class="n <= g.stars ? 'on' : 'off'">★</span>
            </span>
            <span class="play">开始 ▶</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu {
  height: 100%;
  overflow-y: auto;
  padding: 18px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.head {
  text-align: center;
}
.mascot {
  font-size: clamp(46px, 9vw, 76px);
  line-height: 1;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 10px rgba(58, 46, 95, 0.3));
}
.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(38px, 8vw, 66px);
  letter-spacing: 4px;
  margin: 2px 0 4px;
}
.tagline {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(14px, 2.6vw, 19px);
  text-shadow: 0 2px 6px rgba(58, 46, 95, 0.4);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  max-width: 940px;
}
@media (max-width: 820px) {
  .cards { grid-template-columns: 1fr; max-width: 460px; }
}

.card {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 26px;
  transition: transform 0.16s ease;
  text-align: left;
}
.card:hover { transform: translateY(-8px) scale(1.02); }
.card:active { transform: translateY(-2px) scale(0.99); }

.card-glow {
  position: absolute;
  inset: 0;
  border-radius: 26px;
  box-shadow: 0 18px 30px -14px rgba(58, 46, 95, 0.75);
}

.card-inner {
  position: relative;
  margin: 0;
  border-radius: 26px;
  padding: 18px 18px 16px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(4px);
  border: 3px solid rgba(255, 255, 255, 0.55);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  /* 让内层透出底部渐变 */
  transform: translateY(-6px);
  border-radius: 26px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.5);
  transition: transform 0.16s ease;
}
.card:hover .card-inner { transform: translateY(-9px); }

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-icon {
  font-size: 42px;
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(58, 46, 95, 0.3));
}
.card-tag {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 12px;
  color: var(--color-ink);
  background: rgba(255, 255, 255, 0.75);
  padding: 4px 12px;
  border-radius: 999px;
}
.card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  color: #fff;
  -webkit-text-stroke: 2px var(--color-ink);
  paint-order: stroke fill;
  letter-spacing: 2px;
  margin-top: 4px;
}
.card-en {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.card-desc {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 1px 4px rgba(58, 46, 95, 0.45);
  flex: 1;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.stars { font-size: 16px; letter-spacing: 2px; }
.stars .on { color: var(--color-sunny); text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
.stars .off { color: rgba(255, 255, 255, 0.4); }
.play {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: var(--color-ink);
  background: var(--color-sunny);
  padding: 6px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 0 var(--color-sunny-dark);
}
</style>
