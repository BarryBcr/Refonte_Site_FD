import nodemailer from 'nodemailer';

/**
 * Service de notification Gmail - Replique la logique du workflow n8n
 * Envoie des emails de notification pour les nouvelles sessions
 */

let transporter = null;

/**
 * Initialise le transporteur Gmail
 * @returns {Object} Transporteur Nodemailer configuré
 */
function initializeTransporter() {
  if (transporter) {
    return transporter;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    console.log('✅ Gmail transporter initialisé');
    return transporter;
  } catch (error) {
    console.error('❌ Erreur initialisation Gmail:', error.message);
    throw error;
  }
}

/**
 * Envoie une notification de nouvelle session
 * @param {Object} sessionData - Données de la session
 * @returns {Object} Résultat de l'envoi
 */
export async function notifyNewSession(sessionData) {
  const {
    sessionId,
    userName = 'inconnu',
    userEmail = 'non communiqué',
    currentMessage
  } = sessionData;

  if (process.env.GMAIL_MOCK === 'true') {
    console.log('🔧 [MOCK] Notification nouvelle session:', sessionData);
    return {
      success: true,
      messageId: 'mock-' + Date.now(),
      to: process.env.GMAIL_USER
    };
  }

  try {
    await initializeTransporter();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Notification interne
      subject: `Nouvelle session Chatbot FD – ${sessionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🤖 Nouvelle session Chatbot FlairDigital</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Informations de la session</h3>
            <p><strong>Session ID :</strong> <code>${sessionId}</code></p>
            <p><strong>Nom :</strong> ${userName}</p>
            <p><strong>Email :</strong> ${userEmail}</p>
            <p><strong>Message initial :</strong> "${currentMessage}"</p>
          </div>
          
          <div style="margin: 20px 0;">
            <a href="${process.env.NOCODB_URL}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              📊 Ouvrir la base NocoDB
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Notification automatique du système Chatbot FlairDigital</p>
            <p>Timestamp: ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Notification envoyée:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      to: mailOptions.to
    };

  } catch (error) {
    console.error('❌ Erreur envoi notification:', error.message);
    
    // Fallback : log en console si l'envoi échoue
    console.log('📧 [FALLBACK] Nouvelle session détectée:', {
      sessionId,
      userName,
      userEmail,
      currentMessage,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Envoie un résumé personnalisé par email au prospect
 * @param {Object} summaryData - Données du résumé
 * @returns {Object} Résultat de l'envoi
 */
export async function sendPersonalizedSummary(summaryData) {
  const {
    userEmail,
    userName,
    summary,
    recommendations
  } = summaryData;

  if (process.env.GMAIL_MOCK === 'true') {
    console.log('🔧 [MOCK] Résumé personnalisé:', summaryData);
    return {
      success: true,
      messageId: 'mock-summary-' + Date.now(),
      to: userEmail
    };
  }

  try {
    await initializeTransporter();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: `Résumé personnalisé FlairDigital - ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bonjour ${userName} ! 👋</h2>
          
          <p>Merci pour votre intérêt pour nos services d'automatisation et de croissance digitale.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Résumé de nos échanges</h3>
            <p>${summary}</p>
          </div>
          
          ${recommendations ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Nos recommandations</h3>
            <p>${recommendations}</p>
          </div>
          ` : ''}
          
          <div style="margin: 20px 0;">
            <a href="https://flairdigital.fr" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              🌐 Découvrir FlairDigital
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Cordialement,<br>L'équipe FlairDigital</p>
            <p>📧 boubacar@flairdigital.fr | 🌐 flairdigital.fr</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Résumé envoyé à:', userEmail);
    return {
      success: true,
      messageId: result.messageId,
      to: userEmail
    };

  } catch (error) {
    console.error('❌ Erreur envoi résumé:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test de connectivité avec Gmail
 * @returns {boolean} True si l'API est accessible
 */
export async function testGmailConnectivity() {
  try {
    await initializeTransporter();
    
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Test connectivité Gmail échoué:', error.message);
    return false;
  }
}
