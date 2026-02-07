import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('Missing JWT_SECRET environment variable');
}

export const signToken = (payload) => jwt.sign(payload, secret, { expiresIn: '7d' });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
