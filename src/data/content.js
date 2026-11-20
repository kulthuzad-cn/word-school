/**
 * 学习内容：单词 & 句子（面向儿童，配 emoji 与中文释义）
 */

/* ---------------------------- 单词（游戏二） ---------------------------- */
export const WORD_CATEGORIES = [
  {
    id: 'animal',
    name: '动物',
    icon: '🐾',
    color: 'mint',
    words: [
      { w: 'cat', emoji: '🐱', cn: '猫' },
      { w: 'dog', emoji: '🐶', cn: '狗' },
      { w: 'pig', emoji: '🐷', cn: '猪' },
      { w: 'cow', emoji: '🐮', cn: '奶牛' },
      { w: 'duck', emoji: '🦆', cn: '鸭子' },
      { w: 'fish', emoji: '🐟', cn: '鱼' },
      { w: 'bird', emoji: '🐦', cn: '鸟' },
      { w: 'lion', emoji: '🦁', cn: '狮子' },
      { w: 'tiger', emoji: '🐯', cn: '老虎' },
      { w: 'bear', emoji: '🐻', cn: '熊' },
      { w: 'rabbit', emoji: '🐰', cn: '兔子' },
      { w: 'monkey', emoji: '🐵', cn: '猴子' },
      { w: 'horse', emoji: '🐴', cn: '马' },
      { w: 'sheep', emoji: '🐑', cn: '绵羊' },
      { w: 'mouse', emoji: '🐭', cn: '老鼠' },
      { w: 'elephant', emoji: '🐘', cn: '大象' },
    ],
  },
  {
    id: 'fruit',
    name: '水果',
    icon: '🍎',
    color: 'coral',
    words: [
      { w: 'apple', emoji: '🍎', cn: '苹果' },
      { w: 'banana', emoji: '🍌', cn: '香蕉' },
      { w: 'pear', emoji: '🍐', cn: '梨' },
      { w: 'peach', emoji: '🍑', cn: '桃子' },
      { w: 'grape', emoji: '🍇', cn: '葡萄' },
      { w: 'melon', emoji: '🍈', cn: '甜瓜' },
      { w: 'lemon', emoji: '🍋', cn: '柠檬' },
      { w: 'mango', emoji: '🥭', cn: '芒果' },
      { w: 'cherry', emoji: '🍒', cn: '樱桃' },
      { w: 'orange', emoji: '🍊', cn: '橙子' },
    ],
  },
  {
    id: 'color',
    name: '颜色',
    icon: '🎨',
    color: 'bubblegum',
    words: [
      { w: 'red', emoji: '🔴', cn: '红色' },
      { w: 'blue', emoji: '🔵', cn: '蓝色' },
      { w: 'green', emoji: '🟢', cn: '绿色' },
      { w: 'yellow', emoji: '🟡', cn: '黄色' },
      { w: 'pink', emoji: '🌸', cn: '粉色' },
      { w: 'black', emoji: '⚫', cn: '黑色' },
      { w: 'white', emoji: '⚪', cn: '白色' },
      { w: 'purple', emoji: '🟣', cn: '紫色' },
      { w: 'brown', emoji: '🟤', cn: '棕色' },
      { w: 'orange', emoji: '🟠', cn: '橙色' },
    ],
  },
  {
    id: 'nature',
    name: '自然',
    icon: '🌈',
    color: 'sky',
    words: [
      { w: 'sun', emoji: '☀️', cn: '太阳' },
      { w: 'moon', emoji: '🌙', cn: '月亮' },
      { w: 'star', emoji: '⭐', cn: '星星' },
      { w: 'sky', emoji: '🌌', cn: '天空' },
      { w: 'rain', emoji: '🌧️', cn: '雨' },
      { w: 'snow', emoji: '❄️', cn: '雪' },
      { w: 'wind', emoji: '🌬️', cn: '风' },
      { w: 'cloud', emoji: '☁️', cn: '云' },
      { w: 'tree', emoji: '🌳', cn: '树' },
      { w: 'flower', emoji: '🌸', cn: '花' },
    ],
  },
  {
    id: 'food',
    name: '食物',
    icon: '🍰',
    color: 'sunny',
    words: [
      { w: 'cake', emoji: '🍰', cn: '蛋糕' },
      { w: 'milk', emoji: '🥛', cn: '牛奶' },
      { w: 'egg', emoji: '🥚', cn: '鸡蛋' },
      { w: 'rice', emoji: '🍚', cn: '米饭' },
      { w: 'bread', emoji: '🍞', cn: '面包' },
      { w: 'candy', emoji: '🍬', cn: '糖果' },
      { w: 'cookie', emoji: '🍪', cn: '饼干' },
      { w: 'juice', emoji: '🧃', cn: '果汁' },
      { w: 'soup', emoji: '🍲', cn: '汤' },
      { w: 'pizza', emoji: '🍕', cn: '披萨' },
    ],
  },
  {
    id: 'body',
    name: '身体',
    icon: '🧒',
    color: 'grape',
    words: [
      { w: 'eye', emoji: '👁️', cn: '眼睛' },
      { w: 'ear', emoji: '👂', cn: '耳朵' },
      { w: 'nose', emoji: '👃', cn: '鼻子' },
      { w: 'mouth', emoji: '👄', cn: '嘴巴' },
      { w: 'hand', emoji: '✋', cn: '手' },
      { w: 'foot', emoji: '🦶', cn: '脚' },
      { w: 'head', emoji: '🧑', cn: '头' },
      { w: 'arm', emoji: '💪', cn: '手臂' },
      { w: 'leg', emoji: '🦵', cn: '腿' },
      { w: 'face', emoji: '🙂', cn: '脸' },
    ],
  },
]

/** 打平后的全部单词（附分类信息） */
export const ALL_WORDS = WORD_CATEGORIES.flatMap((c) =>
  c.words.map((item) => ({ ...item, catId: c.id, catName: c.name, catIcon: c.icon })),
)

/** 按分类 id 取单词；不传或 'all' 则取全部 */
export function wordsByCategory(catId) {
  if (!catId || catId === 'all') return [...ALL_WORDS]
  return ALL_WORDS.filter((x) => x.catId === catId)
}

/* ---------------------------- 句子（游戏三） ---------------------------- */
export const SENTENCES = [
  { text: 'the cat sat on the mat', cn: '猫坐在垫子上', emoji: '🐱' },
  { text: 'i like to play with my dog', cn: '我喜欢和我的狗玩', emoji: '🐶' },
  { text: 'the sun is big and warm', cn: '太阳又大又暖', emoji: '☀️' },
  { text: 'a little bird can sing a song', cn: '一只小鸟会唱歌', emoji: '🐦' },
  { text: 'i can see the blue sky', cn: '我能看见蓝色的天空', emoji: '🌌' },
  { text: 'we eat apples and bananas', cn: '我们吃苹果和香蕉', emoji: '🍎' },
  { text: 'the fish swims in the water', cn: '鱼在水里游', emoji: '🐟' },
  { text: 'my mom makes a big cake', cn: '我妈妈做了一个大蛋糕', emoji: '🍰' },
  { text: 'look at the bright yellow star', cn: '看那颗明亮的黄星星', emoji: '⭐' },
  { text: 'the rabbit hops on the green grass', cn: '兔子在绿草上跳', emoji: '🐰' },
  { text: 'i read a book every night', cn: '我每晚都读一本书', emoji: '📖' },
  { text: 'the duck says quack quack', cn: '鸭子嘎嘎叫', emoji: '🦆' },
  { text: 'red and yellow make orange', cn: '红色和黄色变成橙色', emoji: '🟠' },
  { text: 'a happy child loves to run', cn: '快乐的孩子爱跑步', emoji: '🧒' },
  { text: 'the moon shines at night', cn: '月亮在夜里发光', emoji: '🌙' },
  { text: 'i have two hands and ten fingers', cn: '我有两只手十个手指', emoji: '✋' },
  { text: 'the little bee likes flowers', cn: '小蜜蜂喜欢花', emoji: '🐝' },
  { text: 'we play games at school', cn: '我们在学校玩游戏', emoji: '🏫' },
]

/* ---------------------------- 工具函数 ---------------------------- */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 随机取 n 个单词（可按分类），并按字母数从易到难排序 */
export function pickWords(n, catId = 'all') {
  const pool = shuffle(wordsByCategory(catId))
  return pool.slice(0, Math.min(n, pool.length)).sort((a, b) => a.w.length - b.w.length)
}

/** 随机取 n 个句子 */
export function pickSentences(n) {
  return shuffle(SENTENCES).slice(0, Math.min(n, SENTENCES.length))
}

/** 随机取 n 个字母（用于游戏一字母雨） */
export function randomLetter() {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  return letters[Math.floor(Math.random() * letters.length)]
}
