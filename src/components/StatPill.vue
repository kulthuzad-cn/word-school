<script setup>
/**
 * 统计小药丸 —— 游戏 HUD 通用元素
 */
defineProps({
  icon: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  tone: { type: String, default: 'grape' }, // grape|mint|coral|sunny|sky|bubblegum
})

const TONES = {
  grape: 'bg-grape text-white',
  mint: 'bg-mint text-white',
  coral: 'bg-coral text-white',
  sunny: 'bg-sunny text-ink',
  sky: 'bg-sky text-white',
  bubblegum: 'bg-bubblegum text-white',
  tangerine: 'bg-tangerine text-white',
}
</script>

<template>
  <div class="stat-pill">
    <span class="stat-icon" :class="TONES[tone] || TONES.grape">{{ icon }}</span>
    <span class="stat-text">
      <span class="stat-value">{{ value }}</span>
      <span v-if="label" class="stat-label">{{ label }}</span>
    </span>
  </div>
</template>

<style scoped>
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 14px -8px rgba(58, 46, 95, 0.6);
  backdrop-filter: blur(6px);
}
.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex: none;
}
.stat-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  text-align: left;
}
.stat-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-ink);
}
.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(58, 46, 95, 0.55);
  letter-spacing: 0.5px;
}
</style>
