# Chatbot FlairDigital - Backend

Backend Node.js pour le chatbot FlairDigital, migration depuis le workflow n8n.

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp env.example .env
# Éditez .env avec vos credentials
```

## ⚙️ Configuration

### Variables d'environnement requises

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données Postgres (Hostinger VPS)
PGHOST=your-postgres-host
PGPORT=5432
PGDATABASE=your-database-name
PGUSER=your-username
PGPASSWORD=your-password
PGSSL=true

# API OpenRouter pour Gemini
OPENROUTER_API_KEY=your-openrouter-api-key
AI_MODEL=google/gemini-2.5-flash

# Google Calendar OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_ID=c_04b8923b8c0e4ed532c39a999f2406281585d0a87b571f90e8eb1f208c74feab@group.calendar.google.com

# Gmail SMTP
GMAIL_USER=boubacar@flairdigital.fr
GMAIL_APP_PASSWORD=your-gmail-app-password

# Mode développement
GOOGLE_CALENDAR_MOCK=false
GMAIL_MOCK=false
```

## 🏃‍♂️ Démarrage

```bash
# Mode développement (avec reload automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### POST /chat/message
Endpoint principal pour envoyer des messages au chatbot.

**Payload:**
```json
{
  "session_id": "unique-session-id",
  "user_name": "Prénom",
  "user_email": "email@example.com",
  "conversation": [],
  "current_message": "Votre message"
}
```

**Réponse:**
```json
{
  "output": "Réponse du chatbot",
  "sessionId": "unique-session-id",
  "isNewSession": true,
  "metadata": {
    "qualification_level": "tiède",
    "interest": "automatisation",
    "last_question": "Quels aspects souhaitez-vous automatiser ?"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### GET /chat/health
Vérifie la santé des services (Postgres, IA, Gmail, Calendar).

### POST /chat/test
Endpoint de test pour valider le chatbot.

### GET /chat/history/:sessionId
Récupère l'historique d'une session.

## 🧪 Tests

```bash
# Test complet du chatbot
npm test

# Test manuel avec un message
npm run send "Votre message de test"

# Test de santé des services
node scripts/sendMessage.js --health
```

## 🏗️ Architecture

```
src/
├── server.js              # Serveur Express principal
├── routes/
│   └── chat.js           # Routes API
├── controllers/
│   └── chatController.js # Contrôleurs HTTP
├── services/
│   ├── chatOrchestrator.js    # Orchestrateur principal
│   ├── aiAgent.js             # Agent IA (Gemini)
│   ├── postgresService.js     # Service Postgres
│   ├── sessionRepository.js   # Repository sessions
│   ├── googleCalendar.js      # Service Google Calendar
│   └── gmailNotifier.js       # Service Gmail
├── prompts/
│   └── systemPrompt.txt       # Prompt système de l'IA
└── utils/
    └── metadata.js            # Utilitaires métadonnées
```

## 🔧 Services

### Agent IA
- Utilise Gemini 2.5 Flash via OpenRouter
- Prompt système identique au workflow n8n
- Gestion des métadonnées de qualification

### Base de données
- Table `fd_chat_memory` (Postgres)
- Gestion des sessions et conversations
- Métadonnées JSONB

### Google Calendar
- Vérification disponibilités
- Création de rendez-vous
- Mode mock pour développement

### Gmail
- Notifications nouvelles sessions
- Résumés personnalisés
- Mode mock pour développement

## 🐛 Débogage

```bash
# Logs détaillés
DEBUG=* npm run dev

# Test de connectivité
node -e "
import('./src/services/postgresService.js').then(({pool}) => 
  pool.query('SELECT NOW()').then(r => console.log('Postgres OK:', r.rows[0]))
);
"
```

## 📊 Monitoring

- Health check: `GET /health`
- Logs structurés en console
- Métriques de performance dans les tests

## 🔄 Migration depuis n8n

Ce backend remplace complètement le workflow n8n avec:
- ✅ Même logique métier
- ✅ Même structure de données
- ✅ Même prompt système
- ✅ Même gestion des sessions
- ✅ Même notifications
- ✅ Même intégration calendrier

## 🚀 Déploiement

1. Configurer les variables d'environnement
2. Installer les dépendances: `npm install`
3. Démarrer: `npm start`
4. Configurer le reverse proxy (nginx)
5. Mettre à jour le frontend pour pointer vers l'API

## 📝 Notes

- Compatible avec le frontend existant (`js/chatbot.js`)
- Même format de réponse que n8n
- Gestion d'erreurs gracieuse
- Mode mock pour développement sans credentials
