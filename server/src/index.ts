import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import componentRoutes from './routes/component.routes';
import quoteRoutes from './routes/quote.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - Required for Render.com and other cloud platforms
// This allows Express to properly detect HTTPS connections behind a reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'LM TEK Server Configurator API',
    version: '1.1.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Health check endpoint (for monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:5173'}`);
  console.log(`✅ Server is ready to accept connections`);
});
