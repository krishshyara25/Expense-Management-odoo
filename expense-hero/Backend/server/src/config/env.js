import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://krishshyaracg_db_user:ZX5tiihIg2zDOrku@expensemanagement.ywg5tvb.mongodb.net/',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  ocrEnabled: (process.env.OCR_ENABLED || 'false').toLowerCase() === 'true',
};
