import { ENV } from '../config/env.js';
import jwt from 'jsonwebtoken';

export function signAccessToken(payload) {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
}
