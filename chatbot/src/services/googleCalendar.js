import { google } from 'googleapis';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Service Google Calendar - Replique les outils du workflow n8n
 * Gère l'authentification OAuth2 et les opérations calendrier
 */

let calendar = null;
let auth = null;

/**
 * Initialise l'authentification Google Calendar
 * @returns {Object} Client Google Calendar authentifié
 */
async function initializeCalendar() {
  if (calendar && auth) {
    return calendar;
  }

  try {
    // Configuration OAuth2
    auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // En mode développement, utiliser les credentials de service
    // En production, il faudra implémenter le flow OAuth2 complet
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });
    }

    calendar = google.calendar({ version: 'v3', auth });
    
    console.log('✅ Google Calendar initialisé');
    return calendar;
  } catch (error) {
    console.error('❌ Erreur initialisation Google Calendar:', error.message);
    throw error;
  }
}

/**
 * Vérifie la disponibilité dans le calendrier pour une plage horaire
 * @param {string} startTime - Heure de début (ISO string)
 * @param {string} endTime - Heure de fin (ISO string)
 * @returns {Object} Informations de disponibilité
 */
export async function checkAvailability(startTime, endTime) {
  if (process.env.GOOGLE_CALENDAR_MOCK === 'true') {
    console.log('🔧 [MOCK] Vérification disponibilité:', { startTime, endTime });
    return {
      available: true,
      events: [],
      freeSlots: [
        { start: startTime, end: endTime }
      ]
    };
  }

  try {
    await initializeCalendar();
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: calendarId }]
      }
    });

    const busyTimes = response.data.calendars[calendarId]?.busy || [];
    
    return {
      available: busyTimes.length === 0,
      events: busyTimes,
      freeSlots: busyTimes.length === 0 ? [{ start: startTime, end: endTime }] : []
    };

  } catch (error) {
    console.error('❌ Erreur vérification disponibilité:', error.message);
    
    // Fallback en cas d'erreur
    return {
      available: false,
      events: [],
      freeSlots: [],
      error: error.message
    };
  }
}

/**
 * Crée un rendez-vous dans le calendrier
 * @param {Object} appointmentData - Données du rendez-vous
 * @returns {Object} Événement créé
 */
export async function createAppointment(appointmentData) {
  const {
    start,
    end,
    summary = 'Rendez-vous FlairDigital',
    description = 'Rendez-vous commercial FlairDigital',
    attendeeEmail,
    attendeeName
  } = appointmentData;

  if (process.env.GOOGLE_CALENDAR_MOCK === 'true') {
    console.log('🔧 [MOCK] Création rendez-vous:', appointmentData);
    return {
      id: 'mock-event-' + Date.now(),
      start: { dateTime: start },
      end: { dateTime: end },
      summary,
      description,
      attendees: attendeeEmail ? [{ email: attendeeEmail, displayName: attendeeName }] : []
    };
  }

  try {
    await initializeCalendar();
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: 'Europe/Paris'
      },
      end: {
        dateTime: end,
        timeZone: 'Europe/Paris'
      },
      attendees: attendeeEmail ? [
        { email: attendeeEmail, displayName: attendeeName }
      ] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24h avant
          { method: 'popup', minutes: 30 } // 30min avant
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all'
    });

    console.log('✅ Rendez-vous créé:', response.data.id);
    return response.data;

  } catch (error) {
    console.error('❌ Erreur création rendez-vous:', error.message);
    throw error;
  }
}

/**
 * Génère des créneaux disponibles pour les prochains jours
 * @param {number} daysAhead - Nombre de jours à prospecter
 * @returns {Array} Liste des créneaux disponibles
 */
export async function getAvailableSlots(daysAhead = 7) {
  try {
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= daysAhead; i++) {
      const day = addDays(now, i);
      
      // Créneaux matin (9h-12h)
      const morningStart = startOfDay(day);
      morningStart.setHours(9, 0, 0, 0);
      
      const morningEnd = startOfDay(day);
      morningEnd.setHours(12, 0, 0, 0);
      
      const morningAvailable = await checkAvailability(
        morningStart.toISOString(),
        morningEnd.toISOString()
      );
      
      if (morningAvailable.available) {
        slots.push({
          start: morningStart.toISOString(),
          end: morningEnd.toISOString(),
          label: `Matin ${format(day, 'dd/MM')} (9h-12h)`
        });
      }
      
      // Créneaux après-midi (14h-17h)
      const afternoonStart = startOfDay(day);
      afternoonStart.setHours(14, 0, 0, 0);
      
      const afternoonEnd = startOfDay(day);
      afternoonEnd.setHours(17, 0, 0, 0);
      
      const afternoonAvailable = await checkAvailability(
        afternoonStart.toISOString(),
        afternoonEnd.toISOString()
      );
      
      if (afternoonAvailable.available) {
        slots.push({
          start: afternoonStart.toISOString(),
          end: afternoonEnd.toISOString(),
          label: `Après-midi ${format(day, 'dd/MM')} (14h-17h)`
        });
      }
    }
    
    return slots;
    
  } catch (error) {
    console.error('❌ Erreur génération créneaux:', error.message);
    return [];
  }
}

/**
 * Test de connectivité avec Google Calendar
 * @returns {boolean} True si l'API est accessible
 */
export async function testCalendarConnectivity() {
  try {
    await initializeCalendar();
    
    const response = await calendar.calendarList.list({
      maxResults: 1
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Test connectivité Calendar échoué:', error.message);
    return false;
  }
}
