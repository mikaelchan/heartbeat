import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl:
    process.env.DATABASE_URL ??
    'mysql://heartbeat:heartbeat@localhost:3306/heartbeat?connection_limit=5',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d'
};

export default env;
