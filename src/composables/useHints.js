import { ref } from 'vue'

/**
 * 键盘提示共享状态（单例）
 * --------------------------------------------------------
 * 各游戏把“下一个/需要按的字符”写入 hints，
 * App 将其传给 VirtualKeyboard 做发光提示。
 */
const hints = ref([])

export function useHints() {
  return {
    hints,
    setHints(arr) {
      hints.value = arr
    },
    clearHints() {
      hints.value = []
    },
  }
}
