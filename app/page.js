export default function HomePage() {
  return (
    <>
      <div className="bg-shape shape-one"></div>
      <div className="bg-shape shape-two"></div>
      <div className="bg-shape shape-three"></div>

      <header className="topbar">
        <div className="brand">
          <div className="brand-badge">KQ</div>
          <div>
            <div className="brand-title">KiddoQuest</div>
            <div className="brand-subtitle">Гонка слов для Telegram</div>
          </div>
        </div>
        <nav className="nav">
          <button className="nav-btn" data-nav="home">Главная</button>
          <button className="nav-btn" data-nav="leaderboard">Лидерборд</button>
          <button className="nav-btn" data-nav="game">Играть</button>
          <a className="nav-btn login-btn" id="login-link" href="/login">Войти</a>
          <button className="nav-btn logout-btn" id="logout-btn" hidden>Выйти</button>
          <span className="nav-user" id="auth-status"></span>
        </nav>
      </header>

      <main className="container">
        <section id="home" data-view>
          <div className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Ежедневные 50 слов · 4 игрока · 15 секунд</p>
              <h1>Учимся английскому в формате дружеской битвы.</h1>
              <p className="lead">
                Каждый день — новая подборка слов. Отвечай быстрее, зарабатывай очки и
                поднимайся в лидерборде.
              </p>
              <div className="hero-actions">
                <button className="primary" id="start-game">Начать игру</button>
                <button className="ghost" id="open-stars">Купить звёздочки</button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span>Твои очки</span>
                  <strong id="total-points">0</strong>
                </div>
                <div className="stat">
                  <span>Звёздочки</span>
                  <strong id="stars-balance">0 ⭐</strong>
                </div>
                <div className="stat">
                  <span>Сегодня бесплатно</span>
                  <strong id="daily-free">50/50 · 1 раз</strong>
                </div>
              </div>
            </div>
            <div className="hero-art">
              <div className="mascot-placeholder">
                <div className="mascot-title">Место для маскота</div>
                <div className="mascot-note">Добавим позже</div>
              </div>
              <div className="hero-card">
                <h3>Правила матча</h3>
                <ul>
                  <li>4 игрока, 10 вопросов</li>
                  <li>Очки за скорость: 15 − время ответа</li>
                  <li>1 место: +100, 2: +50, 3: −50, 4: −100</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="panel-row">
            <div className="panel">
              <h3>Как начисляем очки</h3>
              <p>
                За каждый правильный ответ начисляем <strong>15 − время ответа</strong>.
                Ошибки дают 0. Итоговое место в матче добавляет бонус/штраф, но общий счёт не
                падает ниже нуля.
              </p>
            </div>
            <div className="panel">
              <h3>Подсказки</h3>
              <p>
                Раз в день — бесплатная 50/50. Повторное использование в матче стоит
                10⭐, затем 20⭐, 40⭐ и так далее. Подсказка «что чаще выбирают» показывает
                статистику игроков.
              </p>
            </div>
            <div className="panel">
              <h3>Покупка звёзд</h3>
              <p>
                В главном меню есть быстрый доступ к витрине звёзд. Логику оплаты добавим
                позже — сейчас это визуальная плашка.
              </p>
            </div>
          </div>
        </section>

        <section id="leaderboard" data-view hidden>
          <div className="section-head">
            <h2>Лидерборд недели</h2>
            <p>Топ-10 игроков по сумме очков.</p>
          </div>
          <div className="leaderboard" id="leaderboard-list"></div>
        </section>

        <section id="game" data-view hidden>
          <div className="game-header">
            <div>
              <div className="game-title">Словесная битва</div>
              <div className="game-subtitle" id="question-counter">Вопрос 1 / 10</div>
            </div>
            <div className="timer" id="timer">15</div>
          </div>

          <div className="scoreboard" id="scoreboard"></div>
          <div className="podium-wrap">
            <div className="podium" id="podium"></div>
            <div className="podium-side" id="podium-side"></div>
          </div>

          <div className="question-card">
            <div className="question-label">Переведи слово:</div>
            <div className="question-word" id="question-word">loading…</div>
            <div className="options" id="options"></div>
          </div>

          <div className="hints">
            <button className="hint-btn" id="hint-5050">50/50</button>
            <button className="hint-btn" id="hint-popular">Что выбирают чаще?</button>
            <div className="hint-balance">Баланс: <span id="stars-inline">0 ⭐</span></div>
          </div>

          <div className="game-footer">
            <button className="ghost" id="quit-game">Выйти в меню</button>
            <div className="round-result" id="round-result"></div>
          </div>
        </section>
      </main>

      <div className="modal is-hidden" id="stars-modal" aria-hidden="true" hidden>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Купить звёздочки</h3>
            <button className="close" id="close-stars" aria-label="Закрыть окно">
              <span className="close-icon">×</span>
            </button>
          </div>
          <div className="stars-grid">
            <div className="stars-card">
              <div className="stars-amount">100 ⭐</div>
              <div className="stars-price">$0.99</div>
              <button className="primary" disabled>Скоро</button>
            </div>
            <div className="stars-card">
              <div className="stars-amount">250 ⭐</div>
              <div className="stars-price">$1.99</div>
              <button className="primary" disabled>Скоро</button>
            </div>
            <div className="stars-card">
              <div className="stars-amount">600 ⭐</div>
              <div className="stars-price">$3.99</div>
              <button className="primary" disabled>Скоро</button>
            </div>
            <div className="stars-card">
              <div className="stars-amount">1500 ⭐</div>
              <div className="stars-price">$7.99</div>
              <button className="primary" disabled>Скоро</button>
            </div>
          </div>
          <p className="modal-note">
            В будущем подключим оплату через Telegram Stars. Пока это только интерфейс.
          </p>
        </div>
      </div>

      <div className="toast" id="toast" hidden></div>
    </>
  );
}
