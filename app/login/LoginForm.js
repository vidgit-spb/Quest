'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (mode) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Что-то пошло не так');
        return;
      }
      setMessage(mode === 'register' ? 'Аккаунт создан. Входим...' : 'Вход выполнен');
      window.location.href = '/';
    } catch (error) {
      setMessage('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-title">Вход по почте</div>
      <p className="login-subtitle">Введите почту и пароль, чтобы сохранить прогресс.</p>
      <label className="login-label">
        Email
        <input
          className="login-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
        />
      </label>
      <label className="login-label">
        Пароль
        <input
          className="login-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Минимум 6 символов"
        />
      </label>
      {message && <div className="login-message">{message}</div>}
      <div className="login-actions">
        <button className="primary" onClick={() => submit('login')} disabled={loading}>
          Войти
        </button>
        <button className="ghost" onClick={() => submit('register')} disabled={loading}>
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
}
