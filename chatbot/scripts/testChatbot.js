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
 * Script de test complet du chatbot
 * Vérifie tous les endpoints et fonctionnalités
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Test d'un endpoint
 * @param {string} endpoint - Endpoint à tester
 * @param {Object} options - Options de test
 */
async function testEndpoint(endpoint, options = {}) {
  const { method = 'GET', body, expectedStatus = 200 } = options;
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`🔍 Test ${method} ${endpoint}...`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const result = await response.json();
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${endpoint} - OK (${response.status})`);
      return { success: true, data: result };
    } else {
      console.log(`❌ ${endpoint} - Échec (${response.status})`);
      console.log(`   Réponse:`, result);
      return { success: false, error: result };
    }

  } catch (error) {
    console.log(`❌ ${endpoint} - Erreur: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test de l'endpoint principal de chat
 */
async function testChatEndpoint() {
  console.log('\n--- Test endpoint chat ---');
  
  const testMessage = {
    session_id: `test-chat-${Date.now()}`,
    user_name: 'Test User',
    user_email: 'test@example.com',
    conversation: [],
    current_message: 'Bonjour, je teste le chatbot'
  };

  return await testEndpoint('/chat/message', {
    method: 'POST',
    body: testMessage,
    expectedStatus: 200
  });
}

/**
 * Test de l'endpoint de santé
 */
async function testHealthEndpoint() {
  console.log('\n--- Test endpoint santé ---');
  
  const result = await testEndpoint('/health', {
    method: 'GET',
    expectedStatus: 200
  });

  if (result.success) {
    const health = result.data;
    console.log('📊 État des services:');
    Object.entries(health.services || {}).forEach(([service, status]) => {
      const icon = status.status === 'healthy' ? '✅' : '❌';
      console.log(`   ${icon} ${service}: ${status.status}`);
    });
  }

  return result;
}

/**
 * Test de l'endpoint de test
 */
async function testTestEndpoint() {
  console.log('\n--- Test endpoint test ---');
  
  return await testEndpoint('/chat/test', {
    method: 'POST',
    body: { message: 'Test automatique du chatbot' },
    expectedStatus: 200
  });
}

/**
 * Test de validation des données
 */
async function testValidation() {
  console.log('\n--- Test validation des données ---');
  
  // Test avec données invalides
  const invalidMessage = {
    session_id: '', // Vide
    user_name: 'Test',
    user_email: 'email-invalide', // Email invalide
    current_message: 'Test'
  };

  const result = await testEndpoint('/chat/message', {
    method: 'POST',
    body: invalidMessage,
    expectedStatus: 400
  });

  if (result.success) {
    console.log('❌ Validation échouée - données invalides acceptées');
    return { success: false };
  } else {
    console.log('✅ Validation OK - données invalides rejetées');
    return { success: true };
  }
}

/**
 * Test de performance
 */
async function testPerformance() {
  console.log('\n--- Test de performance ---');
  
  const startTime = Date.now();
  const promises = [];
  
  // Envoi de 5 messages en parallèle
  for (let i = 0; i < 5; i++) {
    const message = {
      session_id: `perf-test-${i}-${Date.now()}`,
      user_name: `User ${i}`,
      user_email: `user${i}@example.com`,
      conversation: [],
      current_message: `Message de test ${i}`
    };
    
    promises.push(
      testEndpoint('/chat/message', {
        method: 'POST',
        body: message,
        expectedStatus: 200
      })
    );
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const successCount = results.filter(r => r.success).length;
  
  console.log(`⏱️ Temps total: ${duration}ms`);
  console.log(`📊 Succès: ${successCount}/5`);
  console.log(`⚡ Moyenne: ${Math.round(duration / 5)}ms par requête`);
  
  return {
    success: successCount === 5,
    duration,
    successRate: successCount / 5
  };
}

/**
 * Exécution de tous les tests
 */
async function runAllTests() {
  console.log('🧪 === TEST COMPLET DU CHATBOT ===\n');
  
  const tests = [
    { name: 'Endpoint chat', fn: testChatEndpoint },
    { name: 'Endpoint santé', fn: testHealthEndpoint },
    { name: 'Endpoint test', fn: testTestEndpoint },
    { name: 'Validation données', fn: testValidation },
    { name: 'Performance', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, ...result });
    } catch (error) {
      console.error(`❌ Erreur test ${test.name}:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Résumé des tests
  console.log('\n📊 === RÉSUMÉ DES TESTS ===');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Résultat global: ${successCount}/${totalCount} tests réussis`);
  
  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés ! Le chatbot est prêt.');
    process.exit(0);
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Exécution
runAllTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
