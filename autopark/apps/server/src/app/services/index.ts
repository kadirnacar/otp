import { DataSource } from 'typeorm';
import * as Models from '@autopark/models';

export const AppDataSource = new DataSource({
  // type: 'sqlite',
  // database: 'data.sqlite',
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'otp',
  password: '123',
  database: 'otp',
  synchronize: true,
  logging: false,
  entities: Object.keys(Models).map((itm) => {
    return Models[itm];
  }),
});

AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
  })
  .catch((error) => {
    console.log('err', error);
  });
