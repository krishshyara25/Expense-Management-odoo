import mongoose from 'mongoose';
import { config } from '../config/env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  return mongoose.connection;
}
