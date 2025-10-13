import { config } from 'dotenv';
import { env } from 'process';

config();

export const EnvConfig = {

  MEZON_BOT_TOKEN: env.MEZON_BOT_TOKEN,
  MEZON_CHANNEL_ID: env.MEZON_CHANNEL_ID,
  MEZON_CLAN_ID: env.MEZON_CLAN_ID,
};
