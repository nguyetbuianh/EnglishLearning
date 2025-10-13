import { z } from "zod";

const BotEnvSchema = z.object({
  token: z.string(),
});

export const appConfig = {
  bot: BotEnvSchema.parse({
    token: process.env.MEZON_BOT_TOKEN,
  }),
};