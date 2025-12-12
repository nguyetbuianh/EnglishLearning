import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import { appConfig } from '../appConfig';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: appConfig.db.host,
  port: appConfig.db.port,
  username: appConfig.db.user,
  password: appConfig.db.password,
  database: appConfig.db.name,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  ssl: false,
};

export const AppDataSource = new DataSource(typeOrmConfig);