import * as Models from '@autopark/models';
import { DataSource } from 'typeorm';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import serviceAccount from '../gservice.json';
import { CameraService } from './CameraService';

export const AppDataSource = new DataSource({
  // type: 'sqlite',
  // database: 'data.sqlite',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
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
  .then(async () => {
    // here you can start to work with your database
    const cameras = await Models.Camera.find();
    cameras.forEach(async (camItem, index) => {
      // await CameraService.connect(camItem);
    });
    console.log('start');
  })
  .catch((error) => {
    console.log('err', error);
  });

initializeApp({
  credential: cert(serviceAccount as any),
});

export const firebaseDb = getFirestore();
firebaseDb
  .collection('cars')
  .get()
  .then((data) => {
    data.forEach((i) => console.log(i.id, i.data()));
  });
