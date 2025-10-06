import { config } from 'dotenv';

config();

export const EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'postgres',

  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'superrefreshkey',

  MEZON_BOT_TOKEN: process.env.MEZON_BOT_TOKEN,
  MEZON_CHANNEL_ID: process.env.MEZON_CHANNEL_ID,
  MEZON_CLAN_ID: process.env.MEZON_CLAN_ID,
};
