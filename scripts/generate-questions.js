import fs from 'fs';
import path from 'path';

const baseWords = [
  { en: 'apple', ru: 'яблоко' },
  { en: 'banana', ru: 'банан' },
  { en: 'orange', ru: 'апельсин' },
  { en: 'pear', ru: 'груша' },
  { en: 'grape', ru: 'виноград' },
  { en: 'lemon', ru: 'лимон' },
  { en: 'peach', ru: 'персик' },
  { en: 'cherry', ru: 'вишня' },
  { en: 'strawberry', ru: 'клубника' },
  { en: 'watermelon', ru: 'арбуз' },
  { en: 'bread', ru: 'хлеб' },
  { en: 'milk', ru: 'молоко' },
  { en: 'cheese', ru: 'сыр' },
  { en: 'egg', ru: 'яйцо' },
  { en: 'fish', ru: 'рыба' },
  { en: 'meat', ru: 'мясо' },
  { en: 'rice', ru: 'рис' },
  { en: 'soup', ru: 'суп' },
  { en: 'cake', ru: 'торт' },
  { en: 'candy', ru: 'конфета' },
  { en: 'cat', ru: 'кот' },
  { en: 'dog', ru: 'собака' },
  { en: 'bird', ru: 'птица' },
  { en: 'horse', ru: 'лошадь' },
  { en: 'cow', ru: 'корова' },
  { en: 'pig', ru: 'свинья' },
  { en: 'sheep', ru: 'овца' },
  { en: 'goat', ru: 'коза' },
  { en: 'duck', ru: 'утка' },
  { en: 'chicken', ru: 'курица' },
  { en: 'rabbit', ru: 'кролик' },
  { en: 'bear', ru: 'медведь' },
  { en: 'fox', ru: 'лиса' },
  { en: 'wolf', ru: 'волк' },
  { en: 'mouse', ru: 'мышь' },
  { en: 'frog', ru: 'лягушка' },
  { en: 'snake', ru: 'змея' },
  { en: 'turtle', ru: 'черепаха' },
  { en: 'elephant', ru: 'слон' },
  { en: 'tiger', ru: 'тигр' },
  { en: 'lion', ru: 'лев' },
  { en: 'monkey', ru: 'обезьяна' },
  { en: 'giraffe', ru: 'жираф' },
  { en: 'zebra', ru: 'зебра' },
  { en: 'kangaroo', ru: 'кенгуру' },
  { en: 'dolphin', ru: 'дельфин' },
  { en: 'whale', ru: 'кит' },
  { en: 'shark', ru: 'акула' },
  { en: 'octopus', ru: 'осьминог' },
  { en: 'starfish', ru: 'морская звезда' },
  { en: 'sun', ru: 'солнце' },
  { en: 'moon', ru: 'луна' },
  { en: 'star', ru: 'звезда' },
  { en: 'sky', ru: 'небо' },
  { en: 'cloud', ru: 'облако' },
  { en: 'rain', ru: 'дождь' },
  { en: 'snow', ru: 'снег' },
  { en: 'wind', ru: 'ветер' },
  { en: 'fire', ru: 'огонь' },
  { en: 'water', ru: 'вода' },
  { en: 'earth', ru: 'земля' },
  { en: 'tree', ru: 'дерево' },
  { en: 'flower', ru: 'цветок' },
  { en: 'leaf', ru: 'лист' },
  { en: 'grass', ru: 'трава' },
  { en: 'mountain', ru: 'гора' },
  { en: 'river', ru: 'река' },
  { en: 'lake', ru: 'озеро' },
  { en: 'sea', ru: 'море' },
  { en: 'road', ru: 'дорога' },
  { en: 'house', ru: 'дом' },
  { en: 'room', ru: 'комната' },
  { en: 'bed', ru: 'кровать' },
  { en: 'chair', ru: 'стул' },
  { en: 'table', ru: 'стол' },
  { en: 'door', ru: 'дверь' },
  { en: 'window', ru: 'окно' },
  { en: 'book', ru: 'книга' },
  { en: 'pencil', ru: 'карандаш' },
  { en: 'pen', ru: 'ручка' },
  { en: 'notebook', ru: 'тетрадь' },
  { en: 'school', ru: 'школа' },
  { en: 'teacher', ru: 'учитель' },
  { en: 'student', ru: 'ученик' },
  { en: 'friend', ru: 'друг' },
  { en: 'family', ru: 'семья' },
  { en: 'mother', ru: 'мама' },
  { en: 'father', ru: 'папа' },
  { en: 'sister', ru: 'сестра' },
  { en: 'brother', ru: 'брат' },
  { en: 'baby', ru: 'малыш' },
  { en: 'boy', ru: 'мальчик' },
  { en: 'girl', ru: 'девочка' },
  { en: 'head', ru: 'голова' },
  { en: 'hand', ru: 'рука' },
  { en: 'foot', ru: 'нога' },
  { en: 'eye', ru: 'глаз' },
  { en: 'ear', ru: 'ухо' },
  { en: 'nose', ru: 'нос' },
  { en: 'mouth', ru: 'рот' },
  { en: 'heart', ru: 'сердце' },
  { en: 'tooth', ru: 'зуб' },
  { en: 'hair', ru: 'волосы' },
  { en: 'face', ru: 'лицо' },
  { en: 'neck', ru: 'шея' },
  { en: 'shoulder', ru: 'плечо' },
  { en: 'sock', ru: 'носок' },
  { en: 'shoe', ru: 'обувь' }
];

const totalQuestions = 1000;
const variantsPerWord = Math.ceil(totalQuestions / baseWords.length);

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildOptions = (correctRu, ruPool) => {
  const options = new Set([correctRu]);
  while (options.size < 4) {
    options.add(pickRandom(ruPool));
  }
  return Array.from(options);
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const ruPool = baseWords.map((item) => item.ru);

const questions = [];
let idCounter = 1;

for (const word of baseWords) {
  for (let variant = 0; variant < variantsPerWord; variant += 1) {
    if (questions.length >= totalQuestions) break;

    const options = shuffle(buildOptions(word.ru, ruPool));
    const answerIndex = options.indexOf(word.ru);

    questions.push({
      id: `q${String(idCounter).padStart(4, '0')}`,
      word: word.en,
      options,
      answerIndex,
      stats: { total: 0, picks: [0, 0, 0, 0] }
    });

    idCounter += 1;
  }
  if (questions.length >= totalQuestions) break;
}

const outputPath = path.join(process.cwd(), 'data', 'questions.json');
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf8');

console.log(`Generated ${questions.length} questions at ${outputPath}`);
