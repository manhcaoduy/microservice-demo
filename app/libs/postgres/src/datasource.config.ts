import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config(); // Load .env file

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT!),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['libs/postgres/src/entities/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  synchronize: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
