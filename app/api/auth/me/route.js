import { NextResponse } from 'next/server';
import { query } from '@/lib/db.js';
import { verifyToken } from '@/lib/auth.js';

export async function GET(request) {
  const token = request.cookies.get('kq_session')?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userResult = await query('SELECT id, email FROM users WHERE id = $1', [payload.id]);
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const statsResult = await query('SELECT points, stars FROM user_stats WHERE user_id = $1', [user.id]);
  const stats = statsResult.rows[0] || { points: 0, stars: 0 };

  return NextResponse.json({ user, stats });
}
