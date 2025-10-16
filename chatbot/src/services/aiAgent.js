import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { format } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service de l'agent IA - Replique la logique du workflow n8n
 * Utilise OpenRouter pour accéder à Gemini 2.5 Flash
 */

// Chargement du prompt système
const SYSTEM_PROMPT_PATH = join(__dirname, '../prompts/systemPrompt.txt');
const SYSTEM_PROMPT = readFileSync(SYSTEM_PROMPT_PATH, 'utf-8');

/**
 * Construit le prompt utilisateur avec le contexte de la session
 * @param {Object} context - Contexte de la conversation
 * @returns {string} Prompt formaté
 */
function buildUserPrompt(context) {
  const { sessionId, userName, userEmail, conversation, currentMessage } = context;
  
  return `session_id : ${sessionId}

user_name : ${userName}

user_email : ${userEmail}

conversation : ${JSON.stringify(conversation)}

current_message : ${currentMessage}`;
}

/**
 * Analyse la réponse de l'IA pour extraire les informations structurées
 * @param {string} response - Réponse brute de l'IA
 * @param {Object} context - Contexte de la conversation
 * @returns {Object} Données structurées
 */
function parseAIResponse(response, context) {
  const { conversation = [], currentMessage } = context;
  
  // Nettoyer la réponse (supprimer les éventuels JSON ou code)
  const cleanResponse = response
    .replace(/```json[\s\S]*?```/g, '') // Supprimer les blocs JSON
    .replace(/```[\s\S]*?```/g, '') // Supprimer les autres blocs de code
    .replace(/\{[^}]*\}/g, '') // Supprimer les objets JSON simples
    .trim();
  
  // Ajouter le message utilisateur à l'historique
  const updatedConversation = [
    ...conversation,
    {
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    },
    {
      type: 'bot',
      content: cleanResponse,
      timestamp: new Date().toISOString()
    }
  ];

  // Générer les métadonnées basiques
  const metadata = {
    last_message: currentMessage,
    last_response: cleanResponse,
    qualification_level: detectQualificationLevel(currentMessage, cleanResponse),
    objections: [],
    request_type: detectRequestType(currentMessage, cleanResponse),
    interest: detectInterest(currentMessage, cleanResponse),
    budget: 'non précisé',
    last_question: cleanResponse.includes('?') ? cleanResponse : '',
    timestamp: new Date().toISOString()
  };

  return {
    reply: cleanResponse,
    updatedConversation,
    metadata
  };
}

/**
 * Détecte le niveau de qualification
 */
function detectQualificationLevel(userMessage, botResponse) {
  const message = (userMessage + ' ' + botResponse).toLowerCase();
  
  if (message.includes('rendez-vous') || message.includes('disponible') || message.includes('appeler')) {
    return 'chaud';
  }
  if (message.includes('prix') || message.includes('devis') || message.includes('budget')) {
    return 'tiède';
  }
  return 'froid';
}

/**
 * Détecte le type de demande
 */
function detectRequestType(userMessage, botResponse) {
  const message = (userMessage + ' ' + botResponse).toLowerCase();
  
  if (message.includes('rendez-vous') || message.includes('rencontrer')) {
    return 'prise de rendez-vous';
  }
  if (message.includes('devis') || message.includes('prix')) {
    return 'demande de devis';
  }
  return '';
}

/**
 * Détecte les intérêts
 */
function detectInterest(userMessage, botResponse) {
  const message = (userMessage + ' ' + botResponse).toLowerCase();
  const interests = [];
  
  if (message.includes('automatiser') || message.includes('automatisation')) {
    interests.push('automatisation');
  }
  if (message.includes('email') || message.includes('emailing') || message.includes('prospection')) {
    interests.push('emailing');
  }
  if (message.includes('meta') || message.includes('facebook') || message.includes('instagram') || message.includes('publicité')) {
    interests.push('publicité meta');
  }
  
  return interests.join(', ') || '';
}

/**
 * Exécute l'agent IA avec le contexte fourni
 * @param {Object} context - Contexte de la conversation
 * @returns {Object} Réponse structurée de l'agent
 */
export async function runAgent(context) {
  const { sessionId, userName, userEmail, conversation = [], currentMessage } = context;

  try {
    console.log(`🤖 [AI Agent] Traitement session ${sessionId} - Message: "${currentMessage}"`);

    // Construction des messages pour l'API
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: buildUserPrompt(context)
      }
    ];

    // Appel à l'API OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://flairdigital.fr',
        'X-Title': 'FlairDigital Chatbot'
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Format de réponse OpenRouter invalide');
    }

    const aiResponse = data.choices[0].message.content;
    console.log(`✅ [AI Agent] Réponse générée: "${aiResponse.substring(0, 100)}..."`);

    // Parse et structuration de la réponse
    const result = parseAIResponse(aiResponse, context);

    return {
      message: result.reply,
      conversation: result.updatedConversation,
      metadata: result.metadata,
      sessionId,
      userName,
      userEmail
    };

  } catch (error) {
    console.error('❌ [AI Agent] Erreur:', error.message);
    
    // Réponse de fallback en cas d'erreur
    const fallbackResponse = `Désolé ${userName}, je rencontre un problème technique. Pouvez-vous reformuler votre demande ?`;
    
    return {
      message: fallbackResponse,
      conversation: [
        ...conversation,
        {
          type: 'user',
          content: currentMessage,
          timestamp: new Date().toISOString()
        },
        {
          type: 'bot',
          content: fallbackResponse,
          timestamp: new Date().toISOString()
        }
      ],
      metadata: {
        last_message: currentMessage,
        last_response: fallbackResponse,
        qualification_level: 'froid',
        objections: ['problème technique'],
        request_type: '',
        interest: '',
        budget: 'non précisé',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      sessionId,
      userName,
      userEmail
    };
  }
}

/**
 * Test de connectivité avec l'API OpenRouter
 * @returns {boolean} True si l'API est accessible
 */
export async function testAIConnectivity() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Test connectivité IA échoué:', error.message);
    return false;
  }
}
