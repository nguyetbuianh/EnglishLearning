import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { EnvConfig } from './env.config';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: EnvConfig.DB_HOST,
  port: EnvConfig.DB_PORT,
  username: EnvConfig.DB_USER,
  password: EnvConfig.DB_PASSWORD,
  database: EnvConfig.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  ssl: {
    rejectUnauthorized: false,
  },
};
