import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing env var: ${key}. Copy .env.example → .env and fill in values.`);
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  REDIS_URL: process.env.REDIS_URL || '',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
