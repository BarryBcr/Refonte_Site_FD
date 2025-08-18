// Gestion du chatbot FlairDigital
class ChatbotManager {
    constructor() {
        this.chatbotForm = document.getElementById('chatbot-form');
        this.chatbotCollect = document.getElementById('chatbot-collect');
        this.chatbotInterface = document.getElementById('chatbot-interface');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.closeButton = document.getElementById('close-chat');
        
        this.userName = '';
        this.userEmail = '';
        this.sessionId = '';
        this.isChatActive = false;
        this.conversation = [];
        this.isProcessing = false;
        
        // URL du webhook n8n
        this.webhookUrl = 'https://n8n.boubacarbarry.fr/webhook/483bf213-3064-4dd9-8006-4d7bf9fe4cc9/chat';
        
        console.log('🔧 [DEBUG] ChatbotManager initialisé');
        console.log('🌐 [DEBUG] URL webhook configurée:', this.webhookUrl);
        console.log('🔍 [DEBUG] Éléments trouvés:', {
            form: !!this.chatbotForm,
            collect: !!this.chatbotCollect,
            interface: !!this.chatbotInterface,
            messages: !!this.chatMessages,
            input: !!this.chatInput,
            sendButton: !!this.sendButton,
            closeButton: !!this.closeButton
        });
        
        this.init();
    }

    init() {
        if (this.chatbotForm) {
            this.setupEventListeners();
            this.setupValidation();
        }
    }

    setupEventListeners() {
        // Gestion de la soumission du formulaire de collecte
        this.chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Gestion de la fermeture du chat
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.closeChat();
            });
        }

        // Gestion de l'envoi de messages
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Gestion de la touche Entrée dans l'input
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Validation en temps réel
        const inputs = this.chatbotForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupValidation() {
        this.validationRules = {
            'chatbot-name': {
                required: true,
                minLength: 2,
                maxLength: 30,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/
            },
            'chatbot-email': {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            }
        };

        this.errorMessages = {
            'chatbot-name': {
                required: 'Le prénom est requis',
                minLength: 'Le prénom doit contenir au moins 2 caractères',
                maxLength: 'Le prénom ne peut pas dépasser 30 caractères',
                pattern: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
            },
            'chatbot-email': {
                required: 'L\'email est requis',
                pattern: 'Veuillez entrer une adresse email valide'
            }
        };
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];

        if (!rules) return true;

        // Validation required
        if (rules.required && !value) {
            this.showFieldError(field, this.errorMessages[fieldName].required);
            return false;
        }

        // Validation minLength
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, this.errorMessages[fieldName].minLength);
            return false;
        }

        // Validation maxLength
        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(field, this.errorMessages[fieldName].maxLength);
            return false;
        }

        // Validation pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(field, this.errorMessages[fieldName].pattern);
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#ef4444';
        field.style.borderWidth = '2px';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 font-medium';
        errorDiv.textContent = message;
        errorDiv.id = `error-${field.name}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.borderWidth = '';
        
        const errorDiv = field.parentNode.querySelector(`#error-${field.name}`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const inputs = this.chatbotForm.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Générer un UUID unique pour la session
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        // Récupérer les données
        this.userName = this.chatbotForm.querySelector('#chatbot-name').value.trim();
        this.userEmail = this.chatbotForm.querySelector('#chatbot-email').value.trim();
        
        // Générer un ID de session unique
        this.sessionId = this.generateSessionId();
        
        // Initialiser la conversation
        this.conversation = [];

        // Masquer le formulaire de collecte
        this.chatbotCollect.classList.add('hidden');

        // Afficher l'interface de chat
        this.chatbotInterface.classList.remove('hidden');

        // Démarrer la conversation
        this.startConversation();
    }

    startConversation() {
        this.isChatActive = true;
        
        // Message de bienvenue
        this.addMessage('bot', `Bonjour ${this.userName} ! 👋 Comment puis-je vous aider aujourd'hui ?`);
        
        // Activer l'input et le bouton d'envoi
        this.chatInput.disabled = false;
        this.sendButton.disabled = false;
        
        // Focus sur l'input
        this.chatInput.focus();
    }

    async sendMessage() {
        console.log('📝 [DEBUG] Début sendMessage');
        const message = this.chatInput.value.trim();
        console.log('📝 [DEBUG] Message saisi:', message);
        console.log('📝 [DEBUG] État du chat:', {
            isChatActive: this.isChatActive,
            isProcessing: this.isProcessing
        });
        
        if (!message || !this.isChatActive || this.isProcessing) {
            console.log('❌ [DEBUG] Message non envoyé - conditions non remplies');
            return;
        }

        console.log('✅ [DEBUG] Conditions OK, ajout du message utilisateur');
        // Ajouter le message de l'utilisateur
        this.addMessage('user', message);
        
        // Ajouter à l'historique
        this.conversation.push({
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        console.log('📚 [DEBUG] Historique mis à jour, longueur:', this.conversation.length);

        // Vider l'input
        this.chatInput.value = '';

        // Désactiver l'input pendant le traitement
        console.log('⏳ [DEBUG] Activation de l\'état de traitement');
        this.setProcessingState(true);

        try {
            console.log('🤖 [DEBUG] Appel du webhook n8n...');
            // Appeler le webhook n8n
            const aiResponse = await this.callN8nWebhook(message);
            console.log('✅ [DEBUG] Réponse IA reçue:', aiResponse);
            
            // Ajouter la réponse de l'IA
            this.addMessage('bot', aiResponse);
            
            // Ajouter à l'historique
            this.conversation.push({
                type: 'bot',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            
            console.log('📚 [DEBUG] Historique final mis à jour, longueur:', this.conversation.length);
            
        } catch (error) {
            console.error('💥 [DEBUG] Erreur dans sendMessage:', error);
            console.error('💥 [DEBUG] Stack trace:', error.stack);
            
            // Message d'erreur pour l'utilisateur
            const errorMessage = 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.';
            console.log('⚠️ [DEBUG] Affichage message d\'erreur utilisateur');
            this.addMessage('bot', errorMessage);
            
            // Ajouter à l'historique
            this.conversation.push({
                type: 'bot',
                content: errorMessage,
                timestamp: new Date().toISOString()
            });
        } finally {
            // Réactiver l'input
            console.log('🔄 [DEBUG] Désactivation de l\'état de traitement');
            this.setProcessingState(false);
        }
    }

    async callN8nWebhook(userMessage) {
        console.log('🚀 [DEBUG] Début appel webhook n8n');
        console.log('📤 [DEBUG] Payload envoyé:', {
            session_id: this.sessionId,
            user_name: this.userName,
            user_email: this.userEmail,
            conversation_length: this.conversation.length,
            current_message: userMessage
        });

        const payload = {
            session_id: this.sessionId,
            user_name: this.userName,
            user_email: this.userEmail,
            conversation: this.conversation,
            current_message: userMessage
        };

        try {
            console.log('🌐 [DEBUG] Envoi requête à:', this.webhookUrl);
            console.log('📋 [DEBUG] Headers:', {
                'Content-Type': 'application/json'
            });
            
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 [DEBUG] Réponse reçue:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                console.error('❌ [DEBUG] Erreur HTTP:', response.status, response.statusText);
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            console.log('✅ [DEBUG] Réponse HTTP OK, lecture du body...');
            
            // Essayer de lire le body de la réponse
            let responseText;
            try {
                responseText = await response.text();
                console.log('📄 [DEBUG] Body brut reçu:', responseText);
            } catch (textError) {
                console.error('❌ [DEBUG] Erreur lecture body:', textError);
                throw new Error('Impossible de lire la réponse du serveur');
            }

            // Essayer de parser le JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('🔍 [DEBUG] JSON parsé:', data);
            } catch (parseError) {
                console.error('❌ [DEBUG] Erreur parsing JSON:', parseError);
                console.log('📄 [DEBUG] Contenu brut qui n\'est pas du JSON:', responseText);
                // Si ce n'est pas du JSON, retourner le texte brut
                return responseText || 'Réponse reçue du serveur';
            }
            
            // Vérifier la structure de la réponse
            console.log('🔍 [DEBUG] Structure de la réponse:', {
                hasResponse: !!data.response,
                hasMessage: !!data.message,
                hasContent: !!data.content,
                hasOutput: !!data.output,
                isString: typeof data === 'string',
                dataType: typeof data,
                keys: Object.keys(data)
            });

            if (data.response || data.message || data.content || data.output) {
                const finalResponse = data.response || data.message || data.content || data.output;
                console.log('✅ [DEBUG] Réponse extraite:', finalResponse);
                return finalResponse;
            } else if (typeof data === 'string') {
                console.log('✅ [DEBUG] Réponse string directe:', data);
                return data;
            } else {
                console.warn('⚠️ [DEBUG] Format de réponse inattendu, utilisation du message par défaut');
                return 'Merci pour votre message ! Comment puis-je vous aider davantage ?';
            }
            
        } catch (error) {
            console.error('💥 [DEBUG] Erreur complète lors de l\'appel webhook:', error);
            console.error('💥 [DEBUG] Stack trace:', error.stack);
            console.error('💥 [DEBUG] Type d\'erreur:', error.constructor.name);
            
            // Log des détails de l'erreur
            if (error.name === 'TypeError') {
                console.error('💥 [DEBUG] Erreur de type - probablement un problème réseau');
            } else if (error.name === 'SyntaxError') {
                console.error('💥 [DEBUG] Erreur de syntaxe - problème de parsing');
            } else if (error.name === 'ReferenceError') {
                console.error('💥 [DEBUG] Erreur de référence - variable non définie');
            }
            
            throw error;
        }
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        this.chatInput.disabled = processing;
        this.sendButton.disabled = processing;
        
        if (processing) {
            this.sendButton.innerHTML = `
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
        } else {
            this.sendButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
            `;
        }
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

        const messageBubble = document.createElement('div');
        messageBubble.className = `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            sender === 'user' 
                ? 'bg-brand text-white rounded-br-none' 
                : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`;

        messageBubble.textContent = content;
        messageDiv.appendChild(messageBubble);

        this.chatMessages.appendChild(messageDiv);

        // Scroll vers le bas
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    closeChat() {
        // Masquer l'interface de chat
        this.chatbotInterface.classList.add('hidden');

        // Réafficher le formulaire de collecte
        this.chatbotCollect.classList.remove('hidden');

        // Réinitialiser le formulaire
        this.chatbotForm.reset();

        // Vider les messages
        this.chatMessages.innerHTML = '';

        // Désactiver le chat
        this.isChatActive = false;
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;

        // Réinitialiser les variables
        this.userName = '';
        this.userEmail = '';
        this.sessionId = '';
        this.conversation = [];
        this.isProcessing = false;

        // Nettoyer les erreurs
        const inputs = this.chatbotForm.querySelectorAll('input');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que les sections soient chargées
    if (document.getElementById('chatbot-form')) {
        new ChatbotManager();
    } else {
        // Fallback si le formulaire n'est pas encore chargé
        setTimeout(() => {
            if (document.getElementById('chatbot-form')) {
                new ChatbotManager();
            }
        }, 1000);
    }
});
