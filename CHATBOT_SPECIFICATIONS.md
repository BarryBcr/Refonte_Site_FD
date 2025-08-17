# 🤖 Chatbot FlairDigital - Spécifications Techniques

## 📋 **Vue d'ensemble**

### **Objectif principal**
Le chatbot FlairDigital est un agent conversationnel intelligent conçu pour :
- **Qualifier les prospects** sur leurs besoins d'automatisation et de croissance
- **Guider vers la prise de rendez-vous** avec l'équipe FlairDigital
- **Collecter et analyser** les objections et besoins clients
- **Améliorer continuellement** grâce aux données d'interaction

### **Cible utilisateurs**
- Prospects intéressés par l'automatisation
- Clients potentiels pour Meta Ads, Email Marketing, Automatisation
- Entrepreneurs cherchant des leviers de croissance

---

## 🏗️ **Architecture Technique**

### **1. Webhooks séparés**
```
Webhook A : Initialisation (collecte prénom/email)
Webhook B : Conversation (échange avec l'IA)
```

### **2. Gestion des sessions**
- **Session ID** : UUID généré côté frontend (plus robuste que n8n pour la génération)
- **Stockage** : Base de données avec timestamp de création et dernière activité
- **Durée** : Pas de limite de temps fixe
- **Identification** : Session ID + Email utilisateur
- **Système de nettoyage** : Nettoyage automatique des sessions inactives (après X jours d'inactivité)

### **3. Base de données recommandée**
**Supabase** est parfait pour ce cas d'usage :
- **Tables** : sessions, conversations, objections, utilisateurs
- **Realtime** : Possibilité de chat en temps réel
- **Auth** : Gestion des utilisateurs si nécessaire
- **API REST** : Intégration facile avec n8n

---

## 🔄 **Flux de conversation**

### **Phase 1 : Initialisation**
1. Utilisateur saisit prénom + email
2. Génération d'un Session ID unique
3. Stockage en base (session + utilisateur)
4. Affichage de l'interface de chat
5. Message de bienvenue personnalisé

### **Phase 2 : Conversation**
1. Utilisateur envoie un message
2. Envoi vers webhook B avec Session ID
3. Traitement IA (GPT/Claude)
4. Réponse personnalisée
5. Stockage de l'échange en base

### **Phase 3 : Qualification et conclusion**
1. **Qualification automatique** du besoin
2. **Détection d'objections** et stockage
3. **Proposition de solutions** FlairDigital
4. **Demande de confirmation** email
5. **Proposition de rendez-vous**

### **Phase 4 : Gestion de l'inactivité**
1. **Détection automatique** de fin de conversation
2. **Relance automatique** par l'IA en cas d'inactivité prolongée
3. **Gestion des sessions** abandonnées

---

## 🧠 **Intelligence Artificielle**

### **Modèles utilisés**
- **GPT-4** : Conversation générale et qualification
- **Claude** : Analyse des objections et besoins
- **Combinaison** : Meilleur des deux mondes

### **Contexte FlairDigital**
```
"Tu es un expert en automatisation et croissance d'entreprise.
Tu représentes FlairDigital, spécialiste en :
- Meta Ads (publicité Facebook/Instagram)
- Email Marketing automatisé
- Solutions d'automatisation des processus
- Acquisition client et développement commercial

Ton objectif : Qualifier le prospect et le diriger vers une prise de rendez-vous."
```

### **Instructions spécifiques**
- **Qualification** : Poser des questions ciblées sur le business
- **Objections** : Noter et répondre à chaque objection
- **Solutions** : Proposer des solutions FlairDigital spécifiques
- **Rendez-vous** : Orienter vers la prise de RDV après qualification

---

## 💾 **Structure de la base de données**

### **Table : sessions**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  last_activity TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  inactivity_count INTEGER DEFAULT 0
);
```

### **Table : conversations**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  message_type VARCHAR(20) NOT NULL, -- 'user' ou 'bot'
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Pour stocker des infos supplémentaires
);
```

### **Table : objections**
```sql
CREATE TABLE objections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  objection_text TEXT NOT NULL,
  category VARCHAR(100), -- 'prix', 'temps', 'confiance', etc.
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);
```

### **Table : qualifications**
```sql
CREATE TABLE qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES sessions(session_id),
  business_size VARCHAR(50), -- 'startup', 'pme', 'grande_entreprise'
  industry VARCHAR(100),
  budget_range VARCHAR(50),
  urgency VARCHAR(50), -- 'immédiat', '3_mois', '6_mois'
  primary_need VARCHAR(100), -- 'acquisition', 'automatisation', 'efficacité'
  qualified_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 **Intégration n8n**

### **Workflow A : Initialisation**
```
Webhook → Validation → Création Session → Stockage Supabase → Réponse OK
```

### **Workflow B : Conversation**
```
Webhook → Récupération Session → Appel IA → Stockage → Réponse IA
```

### **Workflow C : Qualification finale**
```
Détection fin conversation → Analyse objections → Génération résumé → Email → Proposition RDV
```

### **Workflow D : Gestion de l'inactivité**
```
Détection inactivité → Relance IA → Mise à jour session → Nettoyage si nécessaire
```

---

## 📧 **Email de conclusion**

### **Contenu automatique**
- **Résumé de la conversation**
- **Solutions proposées** par FlairDigital
- **Objections identifiées** et réponses
- **Prochaines étapes** recommandées
- **Lien de prise de rendez-vous** (Google Calendar)

### **Template personnalisé**
```
Bonjour [Prénom],

Suite à notre échange sur [sujet principal], voici un résumé de nos discussions :

🎯 **Vos besoins identifiés :**
- [Besoin 1]
- [Besoin 2]

💡 **Solutions FlairDigital :**
- [Solution 1]
- [Solution 2]

📅 **Prochaines étapes :**
Je vous propose de prendre rendez-vous pour approfondir vos besoins et vous présenter nos solutions personnalisées.

[Lien Google Calendar]

Cordialement,
L'équipe FlairDigital
```

---

## 🎯 **Métriques et amélioration continue**

### **KPI à suivre**
- **Taux de qualification** des prospects
- **Taux de conversion** vers rendez-vous
- **Objections les plus fréquentes**
- **Temps moyen de conversation**
- **Satisfaction utilisateur**

### **Amélioration continue**
- **Analyse des conversations** réussies
- **Identification des patterns** d'objections
- **Optimisation des réponses** IA
- **Mise à jour du contexte** FlairDigital

---

## 🚀 **Plan d'implémentation**

### **Phase 1 : Infrastructure**
1. Configuration du projet Supabase (tables, API keys)
2. Création des tables de base (sessions, conversations, objections, qualifications)
3. Configuration des webhooks n8n
4. Tests d'intégration de base

### **Phase 2 : IA de base**
1. Intégration GPT-4
2. Contexte FlairDigital
3. Tests de conversation

### **Phase 3 : Fonctionnalités avancées**
1. Détection d'objections
2. Qualification automatique
3. Email de conclusion

### **Phase 4 : Optimisation**
1. Analyse des métriques
2. Amélioration des réponses
3. A/B testing des approches

---

## ❓ **Questions ouvertes**

1. **Budget** : Avez-vous des limites sur l'utilisation des APIs IA ?
2. **Personnalisation** : Voulez-vous des réponses très spécifiques à FlairDigital ?
3. **Intégrations** : Autres outils à connecter (CRM, analytics) ?
4. **Modération** : Contrôle des conversations avant envoi ?
5. **Backup** : Sauvegarde des conversations importantes ?

## 🔧 **Décisions prises**

### **Gestion des sessions**
- **Session ID** : UUID côté frontend (plus robuste que n8n)
- **Système de nettoyage** : Nettoyage automatique des sessions inactives

### **Détection de fin de conversation**
- **Automatique** : Détection par temps d'inactivité
- **Relance IA** : L'IA peut relancer l'utilisateur en cas d'inactivité prolongée

### **Intégration Supabase**
- **Projet à configurer** : Pas encore configuré, sera fait en Phase 1
- **Tables à créer** : sessions, conversations, objections, qualifications

### **Workflows n8n**
- **Guidage nécessaire** : Assistance pour la création des workflows
- **Webhooks séparés** : Initialisation, Conversation, Qualification, Gestion inactivité

---

*Document créé le 17/08/2025 - Version 1.0*
