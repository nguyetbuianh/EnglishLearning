import { config } from 'dotenv';
import { env } from 'process';

config();

export const EnvConfig = {
  NODE_ENV: env.NODE_ENV || 'development',
  PORT: parseInt(env.PORT || '3000', 10),

  DB_HOST: env.DB_HOST || 'localhost',
  DB_PORT: parseInt(env.DB_PORT || '5432', 10),
  DB_USER: env.DB_USER || 'postgres',
  DB_PASSWORD: env.DB_PASSWORD || '',
  DB_NAME: env.DB_NAME || 'postgres',

  JWT_SECRET: env.JWT_SECRET || 'supersecretkey',
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET || 'superrefreshkey',

  MEZON_BOT_TOKEN: env.MEZON_BOT_TOKEN,
  MEZON_CHANNEL_ID: env.MEZON_CHANNEL_ID,
  MEZON_CLAN_ID: env.MEZON_CLAN_ID,
};
