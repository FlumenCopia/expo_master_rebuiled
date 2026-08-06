import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes';

const app = express();

// Security & Reverse Proxy Settings
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CORS_ORIGIN, // e.g. https://expo26.netlify.app
      ].filter(Boolean);
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Mount Centralized API Routes
app.use('/api', apiRouter);

// Global Security Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`🚨 [API Error] ${req.method} ${req.path}:`, err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'Internal Server Error',
    ...(isDev && { details: err.message || String(err) }),
  });
});

export default app;
