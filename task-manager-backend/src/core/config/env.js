// Load env vars in one place
import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + "/.env" });

export const ENV = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};
