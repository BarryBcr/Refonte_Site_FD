#!/usr/bin/env node

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement des variables d'environnement
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Script de test pour envoyer des messages au chatbot
 * Usage: node scripts/sendMessage.js "Votre message"
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Envoie un message au chatbot
 * @param {string} message - Message à envoyer
 * @param {Object} options - Options supplémentaires
 */
async function sendMessage(message, options = {}) {
  const {
    sessionId = `test-${Date.now()}`,
    userName = 'Test User',
    userEmail = 'test@example.com',
    conversation = []
  } = options;

  const payload = {
    session_id: sessionId,
    user_name: userName,
    user_email: userEmail,
    conversation,
    current_message: message
  };

  try {
    console.log('📤 Envoi du message:', message);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    
    console.log('✅ Réponse reçue:');
    console.log('🤖 Message:', result.output);
    console.log('🆔 Session ID:', result.sessionId);
    console.log('🆕 Nouvelle session:', result.isNewSession);
    console.log('📊 Métadonnées:', JSON.stringify(result.metadata, null, 2));
    console.log('⏰ Timestamp:', result.timestamp);

    return result;

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

/**
 * Test de santé des services
 */
async function testHealth() {
  try {
    console.log('🏥 Test de santé des services...');
    
    const response = await fetch(`${API_BASE_URL}/health`);
    const health = await response.json();
    
    console.log('📊 État des services:');
    console.log('🔧 Statut global:', health.status);
    
    Object.entries(health.services).forEach(([service, status]) => {
      const icon = status.status === 'healthy' ? '✅' : '❌';
      console.log(`${icon} ${service}:`, status.status);
      if (status.error) {
        console.log(`   Erreur: ${status.error}`);
      }
    });

    return health.status === 'healthy';

  } catch (error) {
    console.error('❌ Erreur test de santé:', error.message);
    return false;
  }
}

/**
 * Test complet du chatbot
 */
async function runFullTest() {
  console.log('🧪 === TEST COMPLET DU CHATBOT ===\n');

  // 1. Test de santé
  const isHealthy = await testHealth();
  if (!isHealthy) {
    console.log('⚠️ Services non disponibles, test limité\n');
  }

  console.log('\n--- Test de conversation ---\n');

  // 2. Premier message
  const result1 = await sendMessage('Bonjour, je cherche à automatiser mon entreprise');
  
  // 3. Deuxième message (même session)
  const result2 = await sendMessage('Je veux surtout automatiser mes emails de prospection', {
    sessionId: result1.sessionId,
    conversation: [
      {
        type: 'user',
        content: 'Bonjour, je cherche à automatiser mon entreprise',
        timestamp: new Date().toISOString()
      },
      {
        type: 'bot',
        content: result1.output,
        timestamp: new Date().toISOString()
      }
    ]
  });

  // 4. Troisième message (demande de rendez-vous)
  const result3 = await sendMessage('Oui, je suis intéressé par un rendez-vous', {
    sessionId: result1.sessionId,
    conversation: [
      {
        type: 'user',
        content: 'Bonjour, je cherche à automatiser mon entreprise',
        timestamp: new Date().toISOString()
      },
      {
        type: 'bot',
        content: result1.output,
        timestamp: new Date().toISOString()
      },
      {
        type: 'user',
        content: 'Je veux surtout automatiser mes emails de prospection',
        timestamp: new Date().toISOString()
      },
      {
        type: 'bot',
        content: result2.output,
        timestamp: new Date().toISOString()
      }
    ]
  });

  console.log('\n🎉 Test terminé avec succès !');
  console.log(`📈 Session finale: ${result3.sessionId}`);
  console.log(`📊 Qualification: ${result3.metadata?.qualification_level || 'non définie'}`);
}

// Exécution du script
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node scripts/sendMessage.js "Votre message"');
  console.log('  node scripts/sendMessage.js --test');
  console.log('  node scripts/sendMessage.js --health');
  process.exit(0);
}

if (args[0] === '--test') {
  runFullTest();
} else if (args[0] === '--health') {
  testHealth();
} else {
  const message = args.join(' ');
  sendMessage(message);
}
