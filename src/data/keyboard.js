/**
 * 虚拟键盘布局定义
 * --------------------------------------------------------
 * 每个按键：
 *  code   —— 与物理键盘 KeyboardEvent.code 对应（布局无关，最可靠）
 *  label  —— 主显示字符
 *  sub    —— 次显示字符（如数字行的 shift 符号）
 *  char   —— 该键产出的小写字符（游戏匹配用）
 *  w      —— 相对宽度（单位 = 一个字母键）
 *  finger —— 指法分区（用于颜色教学）
 */

// 指法分区 -> 颜色（Tailwind 类名），供虚拟键盘上色
export const FINGER_COLORS = {
  lp: { bg: 'bg-rose-200', active: 'bg-rose-400', label: '左小指' },
  lr: { bg: 'bg-orange-200', active: 'bg-orange-400', label: '左无名指' },
  lm: { bg: 'bg-amber-200', active: 'bg-amber-400', label: '左中指' },
  li: { bg: 'bg-lime-200', active: 'bg-lime-400', label: '左食指' },
  ri: { bg: 'bg-sky-200', active: 'bg-sky-400', label: '右食指' },
  rm: { bg: 'bg-cyan-200', active: 'bg-cyan-400', label: '右中指' },
  rr: { bg: 'bg-violet-200', active: 'bg-violet-400', label: '右无名指' },
  rp: { bg: 'bg-fuchsia-200', active: 'bg-fuchsia-400', label: '右小指' },
  th: { bg: 'bg-slate-200', active: 'bg-slate-400', label: '拇指' },
}

const K = (code, label, char, w = 1, finger = 'li', sub = '') => ({
  code,
  label,
  char,
  w,
  finger,
  sub,
})

export const KEYBOARD_ROWS = [
  // 数字行
  [
    K('Backquote', '`', '`', 1, 'lp', '~'),
    K('Digit1', '1', '1', 1, 'lp', '!'),
    K('Digit2', '2', '2', 1, 'lr', '@'),
    K('Digit3', '3', '3', 1, 'lm', '#'),
    K('Digit4', '4', '4', 1, 'li', '$'),
    K('Digit5', '5', '5', 1, 'li', '%'),
    K('Digit6', '6', '6', 1, 'ri', '^'),
    K('Digit7', '7', '7', 1, 'ri', '&'),
    K('Digit8', '8', '8', 1, 'rm', '*'),
    K('Digit9', '9', '9', 1, 'rr', '('),
    K('Digit0', '0', '0', 1, 'rp', ')'),
    K('Minus', '-', '-', 1, 'rp', '_'),
    K('Equal', '=', '=', 1, 'rp', '+'),
    { code: 'Backspace', label: '⌫', char: '', w: 2, finger: 'rp', kind: 'back' },
  ],
  // 第一行
  [
    { code: 'Tab', label: 'Tab', char: '', w: 1.6, finger: 'lp', kind: 'fn' },
    K('KeyQ', 'Q', 'q', 1, 'lp'),
    K('KeyW', 'W', 'w', 1, 'lr'),
    K('KeyE', 'E', 'e', 1, 'lm'),
    K('KeyR', 'R', 'r', 1, 'li'),
    K('KeyT', 'T', 't', 1, 'li'),
    K('KeyY', 'Y', 'y', 1, 'ri'),
    K('KeyU', 'U', 'u', 1, 'ri'),
    K('KeyI', 'I', 'i', 1, 'rm'),
    K('KeyO', 'O', 'o', 1, 'rr'),
    K('KeyP', 'P', 'p', 1, 'rp'),
    K('BracketLeft', '[', '[', 1, 'rp', '{'),
    K('BracketRight', ']', ']', 1, 'rp', '}'),
    K('Backslash', '\\', '\\', 1.4, 'rp', '|'),
  ],
  // 第二行（home row）
  [
    { code: 'CapsLock', label: '⇪', char: '', w: 1.9, finger: 'lp', kind: 'fn' },
    K('KeyA', 'A', 'a', 1, 'lp'),
    K('KeyS', 'S', 's', 1, 'lr'),
    K('KeyD', 'D', 'd', 1, 'lm'),
    K('KeyF', 'F', 'f', 1, 'li'),
    K('KeyG', 'G', 'g', 1, 'li'),
    K('KeyH', 'H', 'h', 1, 'ri'),
    K('KeyJ', 'J', 'j', 1, 'ri'),
    K('KeyK', 'K', 'k', 1, 'rm'),
    K('KeyL', 'L', 'l', 1, 'rr'),
    K('Semicolon', ';', ';', 1, 'rp', ':'),
    K('Quote', "'", "'", 1, 'rp', '"'),
    { code: 'Enter', label: '↵ Enter', char: '\n', w: 2.1, finger: 'rp', kind: 'fn' },
  ],
  // 第三行
  [
    { code: 'ShiftLeft', label: '⇧ Shift', char: '', w: 2.4, finger: 'lp', kind: 'fn' },
    K('KeyZ', 'Z', 'z', 1, 'lp'),
    K('KeyX', 'X', 'x', 1, 'lr'),
    K('KeyC', 'C', 'c', 1, 'lm'),
    K('KeyV', 'V', 'v', 1, 'li'),
    K('KeyB', 'B', 'b', 1, 'li'),
    K('KeyN', 'N', 'n', 1, 'ri'),
    K('KeyM', 'M', 'm', 1, 'ri'),
    K('Comma', ',', ',', 1, 'rm', '<'),
    K('Period', '.', '.', 1, 'rr', '>'),
    K('Slash', '/', '/', 1, 'rp', '?'),
    { code: 'ShiftRight', label: '⇧ Shift', char: '', w: 2.6, finger: 'rp', kind: 'fn' },
  ],
  // 空格行
  [
    { code: 'Space', label: '空格 Space', char: ' ', w: 8.4, finger: 'th', kind: 'space' },
  ],
]

/** home row 上有凸起的两个键（F / J），用于盲打定位 */
export const HOME_BUMP_CODES = new Set(['KeyF', 'KeyJ'])

/** code -> char 快速查表 */
export const CODE_TO_CHAR = (() => {
  const map = {}
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.char) map[key.code] = key.char
    }
  }
  return map
})()

/** 把物理按键事件的 key 归一化成小写单字符（用于游戏匹配） */
export function eventToChar(e) {
  if (e.key === ' ') return ' '
  if (e.key.length === 1) return e.key.toLowerCase()
  return ''
}
