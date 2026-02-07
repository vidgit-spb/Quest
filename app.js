import {
  TIMER_SECONDS,
  calculateTimePoints,
  getFiftyCost,
  getPlacementReward,
  applyPlacementBonus
} from './game-logic.js';

const MATCH_QUESTIONS = 10;
const DAILY_POOL_SIZE = 50;

const LS_KEYS = {
  points: 'kq_points',
  stars: 'kq_stars',
  dailyFree: 'kq_daily_free_5050',
  dailyPool: 'kq_daily_pool',
  stats: 'kq_question_stats'
};

const botNames = ['Луна', 'Марс', 'Соня', 'Тимур', 'Вика', 'Ян', 'Ника', 'Миша'];

const state = {
  questions: [],
  dailyPool: [],
  matchQuestions: [],
  currentIndex: 0,
  timerId: null,
  timerStart: null,
  players: [],
  paidFiftyUses: 0,
  usedFiftyThisQuestion: false,
  usedPopularThisQuestion: false,
  isMatchActive: false
};

const dom = {
  views: document.querySelectorAll('[data-view]'),
  navButtons: document.querySelectorAll('[data-nav]'),
  startGame: document.getElementById('start-game'),
  openStars: document.getElementById('open-stars'),
  closeStars: document.getElementById('close-stars'),
  starsModal: document.getElementById('stars-modal'),
  totalPoints: document.getElementById('total-points'),
  starsBalance: document.getElementById('stars-balance'),
  starsInline: document.getElementById('stars-inline'),
  dailyFree: document.getElementById('daily-free'),
  leaderboardList: document.getElementById('leaderboard-list'),
  questionCounter: document.getElementById('question-counter'),
  timer: document.getElementById('timer'),
  scoreboard: document.getElementById('scoreboard'),
  podium: document.getElementById('podium'),
  podiumSide: document.getElementById('podium-side'),
  questionWord: document.getElementById('question-word'),
  options: document.getElementById('options'),
  hint5050: document.getElementById('hint-5050'),
  hintPopular: document.getElementById('hint-popular'),
  quitGame: document.getElementById('quit-game'),
  roundResult: document.getElementById('round-result'),
  toast: document.getElementById('toast')
};

const hideStarsModal = () => {
  dom.starsModal.classList.add('is-hidden');
  dom.starsModal.hidden = true;
  dom.starsModal.style.display = 'none';
  dom.starsModal.setAttribute('aria-hidden', 'true');
};

const showStarsModal = () => {
  dom.starsModal.classList.remove('is-hidden');
  dom.starsModal.hidden = false;
  dom.starsModal.style.display = 'grid';
  dom.starsModal.setAttribute('aria-hidden', 'false');
};

const getTodayKey = () => new Date().toLocaleDateString('en-CA');

const loadNumber = (key, fallback = 0) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
};

const saveNumber = (key, value) => {
  localStorage.setItem(key, String(value));
};

const getStats = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.stats)) || {};
  } catch (error) {
    return {};
  }
};

const saveStats = (stats) => {
  localStorage.setItem(LS_KEYS.stats, JSON.stringify(stats));
};

const showToast = (message) => {
  dom.toast.textContent = message;
  dom.toast.hidden = false;
  setTimeout(() => {
    dom.toast.hidden = true;
  }, 2200);
};

const initTelegram = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
};

const showView = (viewId) => {
  dom.views.forEach((view) => {
    view.hidden = view.id !== viewId;
  });
  dom.navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === viewId);
  });
};

const updateBalances = () => {
  const points = loadNumber(LS_KEYS.points, 0);
  const stars = loadNumber(LS_KEYS.stars, 0);
  dom.totalPoints.textContent = points;
  dom.starsBalance.textContent = `${stars} ⭐`;
  dom.starsInline.textContent = `${stars} ⭐`;

  const today = getTodayKey();
  const dailyFreeUsed = localStorage.getItem(LS_KEYS.dailyFree) === today;
  dom.dailyFree.textContent = dailyFreeUsed ? '50/50 · использовано' : '50/50 · доступно';
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickSample = (array, count) => shuffle(array).slice(0, count);

const getDailyPool = () => {
  const stored = localStorage.getItem(LS_KEYS.dailyPool);
  const today = getTodayKey();
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today && Array.isArray(data.ids)) {
        return data.ids;
      }
    } catch (error) {
      // ignore and regenerate
    }
  }

  const ids = pickSample(state.questions, DAILY_POOL_SIZE).map((q) => q.id);
  localStorage.setItem(LS_KEYS.dailyPool, JSON.stringify({ date: today, ids }));
  return ids;
};

const buildLeaderboard = () => {
  const points = loadNumber(LS_KEYS.points, 0);
  const base = [
    { name: 'Арина', points: 780 },
    { name: 'Камиль', points: 690 },
    { name: 'Милана', points: 640 },
    { name: 'Егор', points: 610 },
    { name: 'Лиза', points: 590 },
    { name: 'Саша', points: 560 },
    { name: 'Даниил', points: 520 },
    { name: 'Рома', points: 510 },
    { name: 'Катя', points: 480 },
    { name: 'Юля', points: 450 }
  ];

  base.push({ name: 'Ты', points, me: true });
  const sorted = base.sort((a, b) => b.points - a.points).slice(0, 10);
  return sorted;
};

const renderLeaderboard = () => {
  const list = buildLeaderboard();
  dom.leaderboardList.innerHTML = '';
  list.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `leaderboard-row${item.me ? ' me' : ''}`;
    row.innerHTML = `
      <div>#${index + 1}</div>
      <div>${item.name}</div>
      <div>${item.points} очков</div>
    `;
    dom.leaderboardList.appendChild(row);
  });
};

const createPlayers = () => {
  const shuffledBots = shuffle(botNames).slice(0, 3);
  const bots = shuffledBots.map((name) => ({
    id: name,
    name,
    score: 0,
    accuracy: 0.5 + Math.random() * 0.35,
    isUser: false
  }));
  return [
    { id: 'you', name: 'Ты', score: 0, accuracy: 1, isUser: true },
    ...bots
  ];
};

const renderScoreboard = () => {
  dom.scoreboard.innerHTML = '';
  state.players.forEach((player) => {
    const card = document.createElement('div');
    card.className = `player-card${player.isUser ? ' me' : ''}`;
    card.innerHTML = `
      <div class="player-name">${player.name}</div>
      <div>Очки: <strong>${player.score}</strong></div>
    `;
    dom.scoreboard.appendChild(card);
  });
  renderPodium();
};

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');

const renderPodium = () => {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const topThree = sorted.slice(0, 3);
  const fourth = sorted[3];

  dom.podium.innerHTML = '';
  dom.podiumSide.innerHTML = '';

  const rankLabels = ['1 место', '2 место', '3 место'];
  const rankClasses = ['first', 'second', 'third'];

  topThree.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = `podium-card ${rankClasses[index]}`;
    card.innerHTML = `
      <div class="podium-rank">${rankLabels[index]}</div>
      <div class="podium-avatar">${getInitials(player.name)}</div>
      <div class="podium-name">${player.name}</div>
      <div class="podium-score">${player.score} очков</div>
    `;
    dom.podium.appendChild(card);
  });

  if (fourth) {
    dom.podiumSide.innerHTML = `
      <div class="side-title">4 место</div>
      <div class="side-card">
        <div class="podium-avatar">${getInitials(fourth.name)}</div>
        <div>
          <div class="podium-name">${fourth.name}</div>
          <div class="podium-score">${fourth.score} очков</div>
        </div>
      </div>
    `;
  }
};

const resetQuestionState = () => {
  state.usedFiftyThisQuestion = false;
  state.usedPopularThisQuestion = false;
  dom.hint5050.disabled = false;
  dom.hintPopular.disabled = false;
  dom.roundResult.textContent = '';
};

const setOptionsDisabled = (disabled) => {
  const buttons = dom.options.querySelectorAll('button');
  buttons.forEach((btn) => {
    btn.disabled = disabled;
  });
};

const clearTimer = () => {
  if (state.timerId) {
    clearInterval(state.timerId);
  }
  state.timerId = null;
  state.timerStart = null;
  state.timerEnd = null;
  dom.timer.classList.remove('danger');
};

const startTimer = () => {
  clearTimer();
  state.timerStart = Date.now();
  state.timerEnd = state.timerStart + TIMER_SECONDS * 1000;

  const tick = () => {
    const remainingMs = state.timerEnd - Date.now();
    const remaining = Math.max(0, remainingMs / 1000);
    dom.timer.textContent = Math.ceil(remaining);
    dom.timer.classList.toggle('danger', remaining <= 5 && remaining > 0);

    if (remaining <= 0) {
      clearTimer();
      handleAnswer(null);
    }
  };

  tick();

  state.timerId = setInterval(tick, 100);
};

const getCurrentQuestion = () => state.matchQuestions[state.currentIndex];

const updateStats = (questionId, selectedIndex) => {
  if (selectedIndex === null || selectedIndex === undefined) return;
  const stats = getStats();
  const entry = stats[questionId] || { total: 0, picks: [0, 0, 0, 0] };
  entry.total += 1;
  entry.picks[selectedIndex] = (entry.picks[selectedIndex] || 0) + 1;
  stats[questionId] = entry;
  saveStats(stats);
};

const simulateBots = (question) => {
  const results = [];
  state.players.forEach((player) => {
    if (player.isUser) return;
    const correct = Math.random() < player.accuracy;
    const time = 2 + Math.random() * 12;
    const points = correct ? Math.max(0, Math.floor(TIMER_SECONDS - time)) : 0;
    player.score += points;

    if (correct) {
      updateStats(question.id, question.answerIndex);
    } else {
      const wrongIndex = pickRandomIndexExcluding(question.options.length, question.answerIndex);
      updateStats(question.id, wrongIndex);
    }

    results.push({ player: player.name, correct, time: Math.round(time), points });
  });
  return results;
};

const pickRandomIndexExcluding = (length, excluded) => {
  const indices = [];
  for (let i = 0; i < length; i += 1) {
    if (i !== excluded) indices.push(i);
  }
  return indices[Math.floor(Math.random() * indices.length)];
};

const renderQuestion = () => {
  const question = getCurrentQuestion();
  if (!question) return;

  dom.questionCounter.textContent = `Вопрос ${state.currentIndex + 1} / ${state.matchQuestions.length}`;
  dom.questionWord.textContent = question.word;
  dom.options.innerHTML = '';

  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(index));
    dom.options.appendChild(btn);
  });

  resetQuestionState();
  startTimer();
};

const finishMatch = () => {
  state.isMatchActive = false;
  clearTimer();

  const ranking = [...state.players].sort((a, b) => b.score - a.score);
  const position = ranking.findIndex((p) => p.isUser) + 1;
  const reward = getPlacementReward(position);

  const currentPoints = loadNumber(LS_KEYS.points, 0);
  const updated = applyPlacementBonus(currentPoints, position);
  saveNumber(LS_KEYS.points, updated);

  renderScoreboard();
  updateBalances();
  renderLeaderboard();

  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🎯';
  showToast(`Матч завершён! Место #${position} ${medal}, бонус ${reward > 0 ? '+' : ''}${reward}`);
  dom.roundResult.textContent = `Итог: место #${position}, бонус ${reward > 0 ? '+' : ''}${reward}`;
};

const nextQuestion = () => {
  state.currentIndex += 1;
  if (state.currentIndex >= state.matchQuestions.length) {
    finishMatch();
    return;
  }
  renderQuestion();
};

const handleAnswer = (selectedIndex) => {
  if (!state.isMatchActive) return;
  clearTimer();
  setOptionsDisabled(true);

  const question = getCurrentQuestion();
  const elapsed = state.timerStart ? (Date.now() - state.timerStart) / 1000 : TIMER_SECONDS;
  const timePoints = calculateTimePoints(elapsed, TIMER_SECONDS);
  const correct = selectedIndex === question.answerIndex;

  const user = state.players.find((p) => p.isUser);
  if (correct) {
    user.score += timePoints;
  }

  updateStats(question.id, selectedIndex);

  const optionButtons = dom.options.querySelectorAll('button');
  optionButtons.forEach((btn, index) => {
    if (index === question.answerIndex) btn.classList.add('correct');
    if (selectedIndex !== null && index === selectedIndex && !correct) btn.classList.add('wrong');
  });

  const bots = simulateBots(question);
  renderScoreboard();

  const resultText = selectedIndex === null
    ? 'Время вышло!'
    : correct
    ? `Верно! +${timePoints} очков`
    : 'Неверно. 0 очков';
  dom.roundResult.textContent = resultText;

  setTimeout(() => {
    setOptionsDisabled(false);
    nextQuestion();
  }, 1200);
};

const useFiftyHint = () => {
  if (!state.isMatchActive || state.usedFiftyThisQuestion) return;

  const today = getTodayKey();
  const dailyFreeUsed = localStorage.getItem(LS_KEYS.dailyFree) === today;
  const cost = getFiftyCost({ dailyFreeUsed, paidUses: state.paidFiftyUses });

  const stars = loadNumber(LS_KEYS.stars, 0);
  if (cost > 0 && stars < cost) {
    showToast('Недостаточно звёзд для подсказки 50/50');
    return;
  }

  if (!dailyFreeUsed) {
    localStorage.setItem(LS_KEYS.dailyFree, today);
  } else {
    saveNumber(LS_KEYS.stars, stars - cost);
    state.paidFiftyUses += 1;
  }

  const question = getCurrentQuestion();
  const incorrectIndices = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.answerIndex);
  shuffle(incorrectIndices);
  const toHide = incorrectIndices.slice(0, 2);

  dom.options.querySelectorAll('button').forEach((btn, index) => {
    if (toHide.includes(index)) {
      btn.classList.add('hidden');
      btn.disabled = true;
    }
  });

  state.usedFiftyThisQuestion = true;
  dom.hint5050.disabled = true;
  updateBalances();
  showToast(cost > 0 ? `Подсказка использована за ${cost} ⭐` : 'Подсказка 50/50 использована бесплатно');
};

const usePopularHint = () => {
  if (!state.isMatchActive || state.usedPopularThisQuestion) return;

  const question = getCurrentQuestion();
  const stats = getStats()[question.id];
  let picks = stats?.picks ? [...stats.picks] : null;

  if (!picks) {
    picks = question.options.map(() => 1 + Math.floor(Math.random() * 4));
    picks[question.answerIndex] += 4;
  }

  const total = picks.reduce((sum, value) => sum + value, 0);
  const percentages = picks.map((value) => Math.round((value / total) * 100));
  const maxIndex = percentages.indexOf(Math.max(...percentages));

  showToast(`Чаще выбирают: ${question.options[maxIndex]} (${percentages[maxIndex]}%)`);
  state.usedPopularThisQuestion = true;
  dom.hintPopular.disabled = true;
};

const startMatch = () => {
  state.isMatchActive = true;
  state.players = createPlayers();
  state.currentIndex = 0;
  state.paidFiftyUses = 0;
  state.matchQuestions = pickSample(state.dailyPool, MATCH_QUESTIONS).map((id) =>
    state.questions.find((q) => q.id === id)
  );

  renderScoreboard();
  renderQuestion();
};

const bindEvents = () => {
  dom.navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.nav);
      if (btn.dataset.nav === 'game' && !state.isMatchActive) startMatch();
    });
  });

  dom.startGame.addEventListener('click', () => {
    showView('game');
    startMatch();
  });

  dom.quitGame.addEventListener('click', () => {
    state.isMatchActive = false;
    clearTimer();
    showView('home');
  });

  dom.openStars.addEventListener('click', () => {
    showStarsModal();
  });

  dom.closeStars.addEventListener('click', () => {
    hideStarsModal();
  });

  dom.starsModal.addEventListener('click', (event) => {
    if (event.target === dom.starsModal) {
      hideStarsModal();
    }
  });

  dom.hint5050.addEventListener('click', useFiftyHint);
  dom.hintPopular.addEventListener('click', usePopularHint);
};

const init = async () => {
  initTelegram();
  hideStarsModal();

  const response = await fetch('./data/questions.json');
  state.questions = await response.json();
  state.dailyPool = getDailyPool();

  updateBalances();
  renderLeaderboard();
  bindEvents();
  showView('home');
};

init();
