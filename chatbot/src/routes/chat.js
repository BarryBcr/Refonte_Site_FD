import { Router } from 'express';
import {
  handleChatMessage,
  handleGetHistory,
  handleUpdateMetadata,
  handleHealthCheck,
  handleTest
} from '../controllers/chatController.js';

/**
 * Routes pour l'API de chat
 * Replique les endpoints du workflow n8n
 */

const router = Router();

// Route principale pour les messages de chat
// POST /chat/message - Endpoint principal du chatbot
router.post('/message', handleChatMessage);

// Route pour récupérer l'historique d'une session
// GET /chat/history/:sessionId
router.get('/history/:sessionId', handleGetHistory);

// Route pour mettre à jour les métadonnées d'une session
// PUT /chat/metadata/:sessionId
router.put('/metadata/:sessionId', handleUpdateMetadata);

// Route de santé des services
// GET /chat/health
router.get('/health', handleHealthCheck);

// Route de test pour valider le chatbot
// POST /chat/test
router.post('/test', handleTest);

export default router;
