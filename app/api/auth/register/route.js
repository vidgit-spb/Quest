import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db.js';
import { signToken } from '@/lib/auth.js';

const isValidEmail = (email) => typeof email === 'string' && email.includes('@');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!isValidEmail(email) || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    await query(
      'INSERT INTO user_stats (user_id, points, stars) VALUES ($1, $2, $3)',
      [created.rows[0].id, 0, 0]
    );

    const token = signToken({ id: created.rows[0].id, email: created.rows[0].email });
    const response = NextResponse.json({ user: created.rows[0] });

    response.cookies.set('kq_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось создать аккаунт' }, { status: 500 });
  }
}
