import { getSession, upsertSession, isNewSession } from './sessionRepository.js';
import { runAgent } from './aiAgent.js';
import { notifyNewSession } from './gmailNotifier.js';
import { getAvailableSlots } from './googleCalendar.js';

/**
 * Orchestrateur principal du chatbot - Replique la logique du workflow n8n
 * Coordonne tous les services : IA, base de données, notifications, calendrier
 */

/**
 * Traite un message de chat et orchestre toute la logique
 * @param {Object} payload - Données du message reçu
 * @returns {Object} Réponse structurée
 */
export async function orchestrateChat(payload) {
  const {
    session_id,
    user_name,
    user_email,
    conversation = [],
    current_message
  } = payload;

  console.log(`🚀 [Orchestrator] Traitement session ${session_id} - Message: "${current_message}"`);

  try {
    // 1. Récupération/création de la session
    const existingSession = await getSession(session_id);
    const isNewUserSession = !existingSession;
    
    // 2. Préparation du contexte pour l'agent IA
    const context = {
      sessionId: session_id,
      userName: user_name,
      userEmail: user_email,
      conversation: existingSession?.conversation || conversation,
      currentMessage: current_message
    };

    // 3. Exécution de l'agent IA
    console.log(`🤖 [Orchestrator] Appel agent IA...`);
    const agentResult = await runAgent(context);

    // 4. Sauvegarde de la session mise à jour
    console.log(`💾 [Orchestrator] Sauvegarde session...`);
    await upsertSession({
      sessionId: session_id,
      userName: user_name,
      userEmail: user_email,
      conversation: agentResult.conversation,
      metadata: agentResult.metadata
    });

    // 5. Notification pour nouvelle session
    if (isNewUserSession) {
      console.log(`📧 [Orchestrator] Nouvelle session détectée - Envoi notification...`);
      try {
        await notifyNewSession({
          sessionId: session_id,
          userName: user_name,
          userEmail: user_email,
          currentMessage: current_message
        });
      } catch (notifyError) {
        console.warn('⚠️ [Orchestrator] Erreur notification (non bloquante):', notifyError.message);
      }
    }

    // 6. Enrichissement avec données calendrier si nécessaire
    let enrichedResponse = agentResult.message;
    
    // Si l'agent mentionne un rendez-vous, ajouter des créneaux disponibles
    if (agentResult.message.toLowerCase().includes('rendez-vous') || 
        agentResult.message.toLowerCase().includes('disponible')) {
      try {
        console.log(`📅 [Orchestrator] Recherche créneaux disponibles...`);
        const availableSlots = await getAvailableSlots(7);
        
        if (availableSlots.length > 0) {
          const slotsText = availableSlots
            .slice(0, 3) // Limiter à 3 créneaux
            .map(slot => `• ${slot.label}`)
            .join('\n');
          
          enrichedResponse += `\n\n📅 Créneaux disponibles cette semaine :\n${slotsText}`;
        }
      } catch (calendarError) {
        console.warn('⚠️ [Orchestrator] Erreur calendrier (non bloquante):', calendarError.message);
      }
    }

    // 7. Préparation de la réponse finale
    const response = {
      output: enrichedResponse,
      sessionId: session_id,
      isNewSession: isNewUserSession,
      metadata: agentResult.metadata,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [Orchestrator] Traitement terminé pour session ${session_id}`);
    return response;

  } catch (error) {
    console.error(`❌ [Orchestrator] Erreur session ${session_id}:`, error.message);
    
    // Réponse d'erreur gracieuse
    const errorResponse = {
      output: `Désolé ${user_name}, je rencontre un problème technique. Pouvez-vous reformuler votre demande ?`,
      sessionId: session_id,
      isNewSession: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    return errorResponse;
  }
}

/**
 * Récupère l'historique d'une session
 * @param {string} sessionId - ID de la session
 * @returns {Object} Historique de la session
 */
export async function getSessionHistory(sessionId) {
  try {
    const session = await getSession(sessionId);
    
    if (!session) {
      return {
        found: false,
        message: 'Session non trouvée'
      };
    }

    return {
      found: true,
      sessionId: session.session_id,
      userName: session.user_name,
      userEmail: session.user_email,
      conversation: session.conversation,
      metadata: session.metadata,
      status: session.status,
      createdAt: session.created_at,
      lastActivity: session.last_activity
    };

  } catch (error) {
    console.error('Erreur récupération historique:', error.message);
    return {
      found: false,
      error: error.message
    };
  }
}

/**
 * Met à jour les métadonnées d'une session
 * @param {string} sessionId - ID de la session
 * @param {Object} metadata - Nouvelles métadonnées
 * @returns {Object} Résultat de la mise à jour
 */
export async function updateSessionMetadata(sessionId, metadata) {
  try {
    const session = await getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session non trouvée'
      };
    }

    const updatedMetadata = {
      ...session.metadata,
      ...metadata,
      lastUpdate: new Date().toISOString()
    };

    await upsertSession({
      sessionId: sessionId,
      userName: session.user_name,
      userEmail: session.user_email,
      conversation: session.conversation,
      metadata: updatedMetadata
    });

    return {
      success: true,
      metadata: updatedMetadata
    };

  } catch (error) {
    console.error('Erreur mise à jour métadonnées:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test de santé de tous les services
 * @returns {Object} État de santé des services
 */
export async function healthCheck() {
  const health = {
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // Test Postgres
    const { pool } = await import('./postgresService.js');
    await pool.query('SELECT 1');
    health.services.postgres = { status: 'healthy', message: 'Connexion OK' };
  } catch (error) {
    health.services.postgres = { status: 'unhealthy', error: error.message };
  }

  try {
    // Test IA
    const { testAIConnectivity } = await import('./aiAgent.js');
    const aiHealthy = await testAIConnectivity();
    health.services.ai = { 
      status: aiHealthy ? 'healthy' : 'unhealthy',
      message: aiHealthy ? 'API accessible' : 'API inaccessible'
    };
  } catch (error) {
    health.services.ai = { status: 'unhealthy', error: error.message };
  }

  try {
    // Test Gmail
    const { testGmailConnectivity } = await import('./gmailNotifier.js');
    const gmailHealthy = await testGmailConnectivity();
    health.services.gmail = { 
      status: gmailHealthy ? 'healthy' : 'unhealthy',
      message: gmailHealthy ? 'SMTP accessible' : 'SMTP inaccessible'
    };
  } catch (error) {
    health.services.gmail = { status: 'unhealthy', error: error.message };
  }

  try {
    // Test Google Calendar
    const { testCalendarConnectivity } = await import('./googleCalendar.js');
    const calendarHealthy = await testCalendarConnectivity();
    health.services.calendar = { 
      status: calendarHealthy ? 'healthy' : 'unhealthy',
      message: calendarHealthy ? 'API accessible' : 'API inaccessible'
    };
  } catch (error) {
    health.services.calendar = { status: 'unhealthy', error: error.message };
  }

  // Statut global
  const allHealthy = Object.values(health.services).every(s => s.status === 'healthy');
  health.status = allHealthy ? 'healthy' : 'degraded';

  return health;
}
