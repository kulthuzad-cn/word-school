<script setup>
import { computed } from 'vue'

/**
 * 庆祝遮罩层 —— 完成单词/句子时的“炫酷提示”
 * 由父组件用 visible 控制显隐；纯视觉，pointer-events:none 不阻挡操作。
 */
defineProps({
  visible: { type: Boolean, default: false },
  emoji: { type: String, default: '🎉' },
  title: { type: String, default: '太棒了!' },
  subtitle: { type: String, default: '' },
})

// 随机散布的小星星/闪光
const SPARKLE_CHARS = ['⭐', '✨', '🌟', '💫']
const sparkles = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i,
    char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
    style: {
      left: `${8 + Math.random() * 84}%`,
      top: `${10 + Math.random() * 80}%`,
      fontSize: `${18 + Math.random() * 26}px`,
      animationDelay: `${Math.random() * 0.6}s`,
      animationDuration: `${1.4 + Math.random() * 1.2}s`,
    },
  })),
)
</script>

<template>
  <Transition name="pop">
    <div v-if="visible" class="celebrate no-select">
      <div class="rays"></div>
      <span v-for="s in sparkles" :key="s.id" class="sparkle" :style="s.style">{{ s.char }}</span>
      <div class="burst-card">
        <div class="emoji">{{ emoji }}</div>
        <div class="title text-sticker">{{ title }}</div>
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.celebrate {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  pointer-events: none;
  z-index: 40;
  /* 半透明暗色幕布，压暗下层内容，让庆祝文字更突出 */
  background: radial-gradient(
    circle at 50% 50%,
    rgba(58, 46, 95, 0.58) 0%,
    rgba(58, 46, 95, 0.44) 55%,
    rgba(58, 46, 95, 0.3) 100%
  );
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

/* 旋转光芒 */
.rays {
  position: absolute;
  width: 180vmax;
  height: 180vmax;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0.5) 0deg 8deg,
    rgba(255, 255, 255, 0) 8deg 18deg
  );
  -webkit-mask-image: radial-gradient(circle, #000 0%, transparent 55%);
  mask-image: radial-gradient(circle, #000 0%, transparent 55%);
  animation: spin 14s linear infinite;
  opacity: 0.55;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.burst-card {
  position: relative;
  text-align: center;
  animation: card-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes card-in {
  0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.emoji {
  font-size: clamp(64px, 14vw, 130px);
  line-height: 1;
  filter: drop-shadow(0 8px 12px rgba(58, 46, 95, 0.35));
  animation: bob 1.2s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-12px) scale(1.06); }
}

.title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(34px, 7vw, 66px);
  margin-top: 6px;
  letter-spacing: 2px;
}

.subtitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(16px, 3vw, 24px);
  color: #fff;
  margin-top: 4px;
  text-shadow: 0 2px 6px rgba(58, 46, 95, 0.5);
}

.sparkle {
  position: absolute;
  animation: twinkle ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { transform: scale(0.4) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.1) rotate(25deg); opacity: 1; }
}

/* 进出场过渡 */
.pop-enter-active { transition: opacity 0.2s ease; }
.pop-leave-active { transition: opacity 0.35s ease; }
.pop-enter-from,
.pop-leave-to { opacity: 0; }
</style>
