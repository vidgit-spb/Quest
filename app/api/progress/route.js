import { NextResponse } from 'next/server';
import { query } from '@/lib/db.js';
import { verifyToken } from '@/lib/auth.js';

const getUserId = (request) => {
  const token = request.cookies.get('kq_session')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.id || null;
};

export async function GET(request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const result = await query('SELECT points, stars FROM user_stats WHERE user_id = $1', [userId]);
  const stats = result.rows[0] || { points: 0, stars: 0 };
  return NextResponse.json(stats);
}

export async function POST(request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { points, stars } = await request.json();
  const safePoints = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
  const safeStars = Number.isFinite(stars) ? Math.max(0, Math.floor(stars)) : 0;

  await query(
    'UPDATE user_stats SET points = $1, stars = $2, updated_at = NOW() WHERE user_id = $3',
    [safePoints, safeStars, userId]
  );

  return NextResponse.json({ ok: true });
}
