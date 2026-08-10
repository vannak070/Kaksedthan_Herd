import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../routes';
import { errorHandler } from '../middleware/error.middleware';

import path from 'path';

const app = express();

// Serve static image upload files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/public/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Security headers with Helmet
app.use(helmet());

// CORS configuration
const corsOriginEnv = process.env.CORS_ORIGIN || '*';
const allowedOrigins = corsOriginEnv === '*' 
  ? '*' 
  : corsOriginEnv.includes(',') 
    ? corsOriginEnv.split(',').map(o => o.trim()) 
    : corsOriginEnv;

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parser
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Request logger middleware
app.use((req: Request, res: Response, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'livestock-backend-api'
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
