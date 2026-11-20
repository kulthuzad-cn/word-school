import { reactive } from 'vue'

/**
 * 全局键盘状态（单例）
 * --------------------------------------------------------
 * - pressed：当前按下的物理键 code 集合（响应式），供虚拟键盘同步高亮
 * - onKey：订阅 keydown 事件，供各游戏处理打字逻辑
 * 只在首次调用时挂载一次 window 监听。
 */

// 需要屏蔽默认行为的键（防止空格滚动页面等）
const PREVENT_CODES = new Set([
  'Space',
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

const pressed = reactive(new Set())
const downHandlers = new Set()
let started = false
// 是否屏蔽默认行为（游戏运行时开启）
let preventDefault = true

function onKeyDown(e) {
  const code = e.code
  if (preventDefault && PREVENT_CODES.has(code)) e.preventDefault()
  if (!pressed.has(code)) pressed.add(code)
  // 通知所有订阅者（把原生事件透传）
  for (const h of downHandlers) h(e)
}

function onKeyUp(e) {
  pressed.delete(e.code)
}

function onBlur() {
  // 失焦时清空，避免按键卡在按下状态
  pressed.clear()
}

/**
 * 触发一次“合成按键”——用于点击/触摸虚拟键盘。
 * 走与物理按键完全相同的处理链，游戏无需区分。
 */
function emitSynthetic(code, char) {
  pressed.add(code)
  setTimeout(() => pressed.delete(code), 130)
  const fake = {
    code,
    key: char,
    repeat: false,
    synthetic: true,
    shiftKey: false,
    preventDefault() {},
  }
  for (const h of downHandlers) h(fake)
}

function start() {
  if (started) return
  started = true
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
}

export function useKeyboard() {
  start()
  return {
    /** 响应式的按下键 code 集合 */
    pressed,
    /** 订阅 keydown，返回取消订阅函数 */
    onKey(handler) {
      downHandlers.add(handler)
      return () => downHandlers.delete(handler)
    },
    /** 某个 code 是否正被按下 */
    isDown: (code) => pressed.has(code),
    /** 设置是否屏蔽空格/方向键等默认行为 */
    setPreventDefault: (v) => (preventDefault = v),
    /** 由点击/触摸虚拟键触发一次按键（走同一处理链） */
    emitSynthetic,
  }
}
