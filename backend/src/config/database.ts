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

const removeLegacyGoogleIdIndex = async (): Promise<void> => {
  const users = mongoose.connection.collection('users');
  const indexes = await users.indexes();
  const legacyGoogleIdIndex = indexes.find((index) =>
    index.unique === true &&
    Object.keys(index.key).length === 1 &&
    index.key.googleId === 1
  );

  if (legacyGoogleIdIndex?.name) {
    await users.dropIndex(legacyGoogleIdIndex.name);
    console.warn(`Removed obsolete unique MongoDB index "${legacyGoogleIdIndex.name}" from users.`);
  }
};

export const mongoDB = (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return mongoConnection ?? Promise.resolve();
  }

  if (!mongoConnection) {
    const mongoUri = process.env.MONGO;
    if (!mongoUri) {
      return Promise.reject(new Error('MONGO environment variable is required'));
    }

    mongoConnection = mongoose.connect(mongoUri, { dbName: 'link_platform' })
      .then(async () => {
        console.log('MongoDB connected');
        await removeLegacyGoogleIdIndex();
      })
      .catch((error: unknown) => {
        mongoConnection = undefined;
        throw error;
      });
  }

  return mongoConnection;
}