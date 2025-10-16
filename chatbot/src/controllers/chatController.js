import { orchestrateChat, getSessionHistory, updateSessionMetadata, healthCheck } from '../services/chatOrchestrator.js';
import { z } from 'zod';

/**
 * Contrôleur pour les routes de chat
 * Gère la validation des données et les réponses HTTP
 */

// Schéma de validation pour les messages de chat
const ChatMessageSchema = z.object({
  session_id: z.string().min(1, 'Session ID requis'),
  user_name: z.string().min(1, 'Nom utilisateur requis'),
  user_email: z.string().email('Email invalide'),
  conversation: z.array(z.object({
    type: z.enum(['user', 'bot']),
    content: z.string(),
    timestamp: z.string()
  })).optional().default([]),
  current_message: z.string().min(1, 'Message requis')
});

/**
 * Traite un message de chat
 * POST /chat/message
 */
export async function handleChatMessage(req, res, next) {
  try {
    console.log('📨 [Controller] Nouveau message reçu:', req.body);

    // Validation des données d'entrée
    const validationResult = ChatMessageSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Données invalides',
        details: validationResult.error.errors
      });
    }

    const payload = validationResult.data;

    // Orchestration du traitement
    const result = await orchestrateChat(payload);

    // Réponse au format attendu par le frontend
    res.json({
      output: result.output,
      sessionId: result.sessionId,
      isNewSession: result.isNewSession,
      metadata: result.metadata,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('❌ [Controller] Erreur traitement message:', error);
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Récupère l'historique d'une session
 * GET /chat/history/:sessionId
 */
export async function handleGetHistory(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID requis'
      });
    }

    const history = await getSessionHistory(sessionId);

    if (!history.found) {
      return res.status(404).json({
        error: 'Session non trouvée',
        message: history.message
      });
    }

    res.json(history);

  } catch (error) {
    console.error('❌ [Controller] Erreur récupération historique:', error);
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: error.message
    });
  }
}

/**
 * Met à jour les métadonnées d'une session
 * PUT /chat/metadata/:sessionId
 */
export async function handleUpdateMetadata(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { metadata } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID requis'
      });
    }

    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({
        error: 'Métadonnées invalides'
      });
    }

    const result = await updateSessionMetadata(sessionId, metadata);

    if (!result.success) {
      return res.status(404).json({
        error: 'Session non trouvée',
        message: result.message
      });
    }

    res.json({
      success: true,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('❌ [Controller] Erreur mise à jour métadonnées:', error);
    
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: error.message
    });
  }
}

/**
 * Vérifie la santé des services
 * GET /chat/health
 */
export async function handleHealthCheck(req, res, next) {
  try {
    const health = await healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);

  } catch (error) {
    console.error('❌ [Controller] Erreur health check:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Endpoint de test pour valider le chatbot
 * POST /chat/test
 */
export async function handleTest(req, res, next) {
  try {
    const testPayload = {
      session_id: `test-${Date.now()}`,
      user_name: 'Test User',
      user_email: 'test@example.com',
      conversation: [],
      current_message: req.body.message || 'Bonjour, je teste le chatbot'
    };

    console.log('🧪 [Controller] Test du chatbot avec payload:', testPayload);

    const result = await orchestrateChat(testPayload);

    res.json({
      success: true,
      testPayload,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Controller] Erreur test:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error.message
    });
  }
}
