import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import { uploadsPath } from './config/uploads.js';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Heartbeat API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
