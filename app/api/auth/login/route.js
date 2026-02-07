import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db.js';
import { signToken } from '@/lib/auth.js';

const isValidEmail = (email) => typeof email === 'string' && email.includes('@');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!isValidEmail(email) || typeof password !== 'string') {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }

    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email });
    const response = NextResponse.json({ user: { id: user.id, email: user.email } });
    response.cookies.set('kq_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось войти' }, { status: 500 });
  }
}
