import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';

// Chargement des variables d'environnement
dotenv.config();

/**
 * Serveur Express pour le chatbot FlairDigital
 * Remplace le workflow n8n par une API REST
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS sécurisée
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8000',
    'https://flairdigital.fr',
    'https://www.flairdigital.fr',
    'https://boubacarbarry.github.io'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/chat', chatRouter);

// Route racine
app.get('/', (req, res) => {
  res.json({
    service: 'FlairDigital Chatbot API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: '/chat/message',
      health: '/chat/health',
      test: '/chat/test',
      history: '/chat/history/:sessionId'
    }
  });
});

// Route de santé globale
app.get('/health', async (req, res) => {
  try {
    const { healthCheck } = await import('./services/chatOrchestrator.js');
    const health = await healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('🚀 Serveur Chatbot FlairDigital démarré');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/chat/test`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});

export default app;
