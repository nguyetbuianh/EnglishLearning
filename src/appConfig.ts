import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  PORT: z.coerce.number().default(3000),

  MEZON_BOT_TOKEN: z.string().min(1, "MEZON_BOT_TOKEN is required"),
  MEZON_BOT_ID: z.string().min(1, "MEZON_BOT_ID is required"),

  CLOUD_NAME: z.string().min(1, "CLOUD_NAME is required"),
  CLOUD_API_KEY: z.string().min(1, "CLOUD_API_KEY is required"),
  CLOUD_API_SECRET: z.string().min(1, "CLOUD_API_SECRET is required"),

  PEXELS_API_KEY: z.string().min(1, "PEXELS_API_KEY is required")
});


const env = EnvSchema.parse(process.env);

export const appConfig = {
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
  },
  server: {
    port: env.PORT,
  },
  bot: {
    token: env.MEZON_BOT_TOKEN,
    id: env.MEZON_BOT_ID,
  },
  cloudinary: {
    cloudName: env.CLOUD_NAME,
    apiKey: env.CLOUD_API_KEY,
    apiSecret: env.CLOUD_API_SECRET,
  },
  pexels: {
    apiKey: env.PEXELS_API_KEY
  }
};
