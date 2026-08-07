import app from './app';
import { connectWithRetry } from '../config/database';

const PORT = parseInt(process.env.API_PORT || process.env.PORT || '5001', 10);

async function startServer() {
  try {
    console.log('[Server Init] Connecting to PostgreSQL database...');
    await connectWithRetry(10, 1000);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 Livestock Management API Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`📡 API Base:     http://0.0.0.0:${PORT}/api/v1`);
      console.log(`=======================================================`);
    });
  } catch (error: any) {
    console.error('[Server Init Fatal Error] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
