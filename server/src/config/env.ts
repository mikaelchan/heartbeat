import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl:
    process.env.DATABASE_URL ??
    'mysql://heartbeat:heartbeat@localhost:3306/heartbeat?connection_limit=5',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  maxUploadSize: parseNumber(process.env.MAX_UPLOAD_SIZE, 5 * 1024 * 1024)
};

export default env;
