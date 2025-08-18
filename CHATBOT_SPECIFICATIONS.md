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

### **1. Webhook unique et fonctionnel**
```
Webhook public : https://n8n.boubacarbarry.fr/webhook/483bf213-3064-4dd9-8006-4d7bf9fe4cc9/chat
- Réception des messages utilisateur
- Traitement par l'agent IA
- Retour des réponses via "Respond to Webhook"
```

### **2. Gestion des sessions**
- **Session ID** : UUID généré côté frontend (plus robuste que n8n pour la génération) ✅
- **Stockage** : Base de données Supabase avec timestamp de création et dernière activité ✅
- **Durée** : Pas de limite de temps fixe
- **Identification** : Session ID + Email utilisateur ✅
- **Système de nettoyage** : À implémenter (nettoyage automatique des sessions inactives)

### **3. Base de données implémentée**
**Supabase** est parfait pour ce cas d'usage et est maintenant configuré :
- **Table principale** : `fd_chat_memory` ✅
- **Structure** : session_id, user_name, user_email, conversation (JSONB), metadata, status ✅
- **API REST** : Intégration facile avec n8n ✅

---

## 🔄 **Flux de conversation**

### **Phase 1 : Initialisation** ✅ IMPLÉMENTÉE
1. Utilisateur saisit prénom + email ✅
2. Génération d'un Session ID unique ✅
3. Stockage en base (session + utilisateur) ✅
4. Affichage de l'interface de chat ✅
5. Message de bienvenue personnalisé ✅

### **Phase 2 : Conversation** ✅ IMPLÉMENTÉE
1. Utilisateur envoie un message ✅
2. Envoi vers webhook n8n avec Session ID ✅
3. Traitement IA (GPT/Claude) ✅
4. Réponse personnalisée ✅
5. Stockage de l'échange en base ✅

### **Phase 3 : Qualification et conclusion** 🔄 À IMPLÉMENTER
1. **Qualification automatique** du besoin
2. **Détection d'objections** et stockage
3. **Proposition de solutions** FlairDigital
4. **Demande de confirmation** email
5. **Proposition de rendez-vous**

### **Phase 4 : Gestion de l'inactivité** 🔄 À IMPLÉMENTER
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

### **Table : fd_chat_memory** ✅ IMPLÉMENTÉE
```sql
CREATE TABLE fd_chat_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(100),
  user_email VARCHAR(255),
  conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### **Tables futures à implémenter** 🔄
```sql
-- Table : objections
CREATE TABLE objections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES fd_chat_memory(session_id),
  objection_text TEXT NOT NULL,
  category VARCHAR(100), -- 'prix', 'temps', 'confiance', etc.
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Table : qualifications
CREATE TABLE qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES fd_chat_memory(session_id),
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

### **Workflow "Chatbot FD"** ✅ IMPLÉMENTÉ
```
Webhook public → AI Agent → Outils Postgres → Respond to Webhook
```

**Nœuds implémentés :**
- **"When chat message received"** : Webhook public sans authentification ✅
- **"AI Agent"** : Agent IA avec prompt FlairDigital configuré ✅
- **"GPT 4.1 Mini"** : Modèle de langage principal ✅
- **"Claude 3.7 Sonnet"** : Modèle de langage secondaire ✅
- **"Select rows from a table in Postgres"** : Lecture des sessions ✅
- **"Insert or update rows in a table in Postgres"** : Sauvegarde des conversations ✅
- **"Respond to Webhook"** : Retour des réponses IA ✅

### **Workflows futurs à implémenter** 🔄
- **Workflow de qualification finale** : Détection fin conversation + analyse
- **Workflow de gestion inactivité** : Relance automatique + nettoyage sessions

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

### **Phase 1 : Infrastructure** ✅ TERMINÉE
1. Configuration du projet Supabase (tables, API keys) ✅
2. Création des tables de base (fd_chat_memory) ✅
3. Configuration des webhooks n8n ✅
4. Tests d'intégration de base ✅

### **Phase 2 : IA de base** ✅ TERMINÉE
1. Intégration GPT-4 ✅
2. Contexte FlairDigital ✅
3. Tests de conversation ✅

### **Phase 3 : Fonctionnalités avancées** 🔄 EN COURS
1. Détection d'objections
2. Qualification automatique
3. Email de conclusion

### **Phase 4 : Optimisation** 🔄 À VENIR
1. Analyse des métriques
2. Amélioration des réponses
3. A/B testing des approches

---

## 🎯 **État actuel et prochaines étapes**

### **✅ Ce qui fonctionne actuellement**
- **Interface utilisateur** : Formulaire de collecte + interface de chat complète
- **Gestion des sessions** : UUID unique + stockage en base Supabase
- **Communication n8n** : Webhook public + agent IA fonctionnel
- **Stockage des conversations** : Table `fd_chat_memory` avec structure JSONB
- **Agent IA** : Réponses contextuelles avec prompt FlairDigital configuré
- **Workflow n8n** : Pipeline complet de réception → traitement → réponse

### **🔄 Prochaines étapes prioritaires**
1. **Détection automatique de fin de conversation**
   - Implémenter la logique de détection d'inactivité
   - Ajouter des triggers de relance automatique
2. **Qualification automatique des prospects**
   - Analyser les conversations pour extraire les besoins
   - Catégoriser automatiquement les prospects
3. **Email de conclusion automatique**
   - Générer des résumés de conversation
   - Proposer des prises de rendez-vous
4. **Analytics et métriques**
   - Suivre les performances du chatbot
   - Analyser les patterns de conversation

### **🔧 Améliorations techniques possibles**
- **Gestion des erreurs** : Retry automatique en cas d'échec
- **Cache des réponses** : Optimisation des performances
- **Multi-langues** : Support d'autres langues que le français
- **Intégrations avancées** : CRM, calendrier, analytics

---

## ❓ **Questions ouvertes**

1. **Budget** : Avez-vous des limites sur l'utilisation des APIs IA ?
2. **Personnalisation** : Voulez-vous des réponses très spécifiques à FlairDigital ?
3. **Intégrations** : Autres outils à connecter (CRM, analytics) ?
4. **Modération** : Contrôle des conversations avant envoi ?
5. **Backup** : Sauvegarde des conversations importantes ?

## 🔧 **Décisions prises**

### **Gestion des sessions** ✅ IMPLÉMENTÉ
- **Session ID** : UUID côté frontend (plus robuste que n8n) ✅
- **Système de nettoyage** : À implémenter (nettoyage automatique des sessions inactives)

### **Détection de fin de conversation** 🔄 À IMPLÉMENTER
- **Automatique** : Détection par temps d'inactivité
- **Relance IA** : L'IA peut relancer l'utilisateur en cas d'inactivité prolongée

### **Intégration Supabase** ✅ IMPLÉMENTÉ
- **Projet configuré** : Projet Supabase opérationnel ✅
- **Table créée** : `fd_chat_memory` avec structure optimisée ✅

### **Workflows n8n** ✅ IMPLÉMENTÉ
- **Workflow principal** : "Chatbot FD" avec agent IA fonctionnel ✅
- **Webhook unique** : Point d'entrée public pour toutes les conversations ✅
- **Architecture simplifiée** : Un seul workflow au lieu de 4 séparés ✅

---

*Document créé le 17/08/2025 - Version 1.0*  
*Dernière mise à jour : 18/08/2025 - Version 2.0 (Implémentation fonctionnelle)*

**Note importante :** Ce document a été mis à jour pour refléter l'implémentation actuelle et fonctionnelle du chatbot. Les phases 1 et 2 sont terminées, le chatbot est opérationnel avec n8n et Supabase. Les phases 3 et 4 sont en cours de planification.
