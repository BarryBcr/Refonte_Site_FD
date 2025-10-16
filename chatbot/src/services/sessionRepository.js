import { pool } from './postgresService.js';

/**
 * Repository pour la gestion des sessions de chat
 * Replique la logique de la table fd_chat_memory du workflow n8n
 */

const UPSERT_SESSION = `
INSERT INTO public.fd_chat_memory (
    session_id, 
    user_name, 
    user_email, 
    conversation, 
    metadata, 
    status, 
    created_at, 
    last_activity
) VALUES (
    $1, $2, $3, $4::jsonb, $5::jsonb, $6, NOW(), NOW()
)
ON CONFLICT (session_id) 
DO UPDATE SET
    user_name = EXCLUDED.user_name,
    user_email = EXCLUDED.user_email,
    conversation = EXCLUDED.conversation,
    metadata = EXCLUDED.metadata,
    status = EXCLUDED.status,
    last_activity = NOW()
RETURNING *;
`;

const GET_SESSION = `
SELECT * FROM public.fd_chat_memory 
WHERE session_id = $1;
`;

/**
 * Récupère une session par son ID
 * @param {string} sessionId - ID de la session
 * @returns {Object|null} Session ou null si non trouvée
 */
export async function getSession(sessionId) {
  try {
    const { rows } = await pool.query(GET_SESSION, [sessionId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de session:', error);
    throw error;
  }
}

/**
 * Crée ou met à jour une session
 * @param {Object} sessionData - Données de la session
 * @returns {Object} Session créée/mise à jour
 */
export async function upsertSession(sessionData) {
  const {
    sessionId,
    userName,
    userEmail,
    conversation,
    metadata,
    status = 'active'
  } = sessionData;

  try {
    const { rows } = await pool.query(UPSERT_SESSION, [
      sessionId,
      userName,
      userEmail,
      JSON.stringify(conversation),
      JSON.stringify(metadata),
      status
    ]);
    
    return rows[0];
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de session:', error);
    throw error;
  }
}

/**
 * Compte le nombre de messages utilisateur dans une conversation
 * @param {Array} conversation - Historique de conversation
 * @returns {number} Nombre de messages utilisateur
 */
export function countUserMessages(conversation) {
  if (!Array.isArray(conversation)) return 0;
  return conversation.filter(item => item.type === 'user').length;
}

/**
 * Vérifie si c'est une nouvelle session (premier message utilisateur)
 * @param {Array} conversation - Historique de conversation
 * @returns {boolean} True si nouvelle session
 */
export function isNewSession(conversation) {
  return countUserMessages(conversation) === 1;
}
