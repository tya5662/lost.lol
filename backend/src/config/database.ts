import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

let mongoConnection: Promise<void> | undefined;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'link_platform',
  waitForConnections: true,
  connectionLimit: 10,
});


export const mongoDB = (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!mongoConnection) {
    const mongoUri = process.env.MONGO;
    if (!mongoUri) {
      return Promise.reject(new Error('MONGO environment variable is required'));
    }

    mongoConnection = mongoose.connect(mongoUri, { dbName: 'link_platform' })
      .then(() => {
        console.log('MongoDB connected');
      })
      .catch((error: unknown) => {
        mongoConnection = undefined;
        throw error;
      });
  }

  return mongoConnection;
}