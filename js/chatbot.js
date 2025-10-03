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
            // Tenter de restaurer une session existante
            this.tryRestoreSessionOnLoad();
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

        // Gestion de la touche Entrée dans le textarea
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize du textarea
            this.chatInput.addEventListener('input', () => {
                this.autoResizeTextarea();
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

        // Plein écran sur mobile + scroll lock + animation + focus
        this.enterFullscreenOverlayIfMobile();

        // Démarrer la conversation
        this.startConversation();

        // Sauvegarder l'état initial (avec message de bienvenue ajouté ensuite)
        this.saveSessionToStorage();

        // dataLayer: chatbot started
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'chatbot_start',
                chatbot: {
                    session_id: this.sessionId,
                    user_email_hash: this.userEmail ? this.userEmail : undefined
                }
            });
        }
    }

    startConversation() {
        this.isChatActive = true;
        
        // Message de bienvenue
        this.addMessage('bot', `Bonjour ${this.userName} ! 👋 Comment puis-je vous aider aujourd'hui ?`);
        this.conversation.push({
            type: 'bot',
            content: `Bonjour ${this.userName} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
            timestamp: new Date().toISOString()
        });
        this.saveSessionToStorage();
        
        // Activer l'input et le bouton d'envoi
        this.chatInput.disabled = false;
        this.sendButton.disabled = false;
        
        // Focus sur l'input
        setTimeout(() => this.chatInput && this.chatInput.focus(), 50);
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

        // Vider l'input et réinitialiser sa taille
        this.chatInput.value = '';
        this.resetTextareaSize();

        // Désactiver l'input pendant le traitement
        console.log('⏳ [DEBUG] Activation de l\'état de traitement');
        this.setProcessingState(true);

        try {
            console.log('🤖 [DEBUG] Appel du webhook n8n...');
            // Appeler le webhook n8n
            const aiResponse = await this.callN8nWebhook(message);
            console.log('✅ [DEBUG] Réponse IA reçue:', aiResponse);
            
            // Supprimer le loader de chat avant d'ajouter la réponse
            this.removeTypingLoader();
            
            // Ajouter la réponse de l'IA
            this.addMessage('bot', aiResponse);
            
            // Ajouter à l'historique
            this.conversation.push({
                type: 'bot',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            this.saveSessionToStorage();

            // dataLayer: bot message received
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'chatbot_message_received',
                    chatbot: {
                        session_id: this.sessionId,
                        message_length: (aiResponse || '').length
                    }
                });
            }
            
            console.log('📚 [DEBUG] Historique final mis à jour, longueur:', this.conversation.length);
            
        } catch (error) {
            console.error('💥 [DEBUG] Erreur dans sendMessage:', error);
            console.error('💥 [DEBUG] Stack trace:', error.stack);
            
            // Supprimer le loader de chat en cas d'erreur
            this.removeTypingLoader();
            
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
                console.warn('⚠️ [DEBUG] Réponse en texte brut (pas JSON):', parseError.message);
                console.log('📄 [DEBUG] Contenu brut reçu:', responseText);
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
            // Afficher le loader sur le bouton (ancien comportement)
            this.sendButton.innerHTML = `
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            
            // Ajouter le loader de chat avec 3 points
            this.addTypingLoader();
        } else {
            // Restaurer le bouton normal
            this.sendButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
            `;
            
            // Supprimer le loader de chat
            this.removeTypingLoader();
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

        // dataLayer: user message sent
        if (sender === 'user' && window.dataLayer) {
            window.dataLayer.push({
                event: 'chatbot_message_sent',
                chatbot: {
                    session_id: this.sessionId,
                    message_length: (content || '').length
                }
            });
        }
    }

    // Ajouter le loader de chat avec 3 points animés
    addTypingLoader() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start';
        messageDiv.id = 'typing-loader-message';

        const messageBubble = document.createElement('div');
        messageBubble.className = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none';

        const typingLoader = document.createElement('div');
        typingLoader.className = 'typing-loader';
        
        // Créer les 3 points
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingLoader.appendChild(dot);
        }

        messageBubble.appendChild(typingLoader);
        messageDiv.appendChild(messageBubble);

        this.chatMessages.appendChild(messageDiv);

        // Scroll vers le bas
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Supprimer le loader de chat
    removeTypingLoader() {
        const typingLoader = document.getElementById('typing-loader-message');
        if (typingLoader) {
            typingLoader.remove();
        }
    }

    closeChat() {
        // Animation de sortie si overlay actif
        const wasOverlay = this.chatbotInterface.classList.contains('chat-overlay');
        if (wasOverlay) {
            this.addTemporaryClass(this.chatbotInterface, 'overlay-exit', 220);
            const panel = this.chatbotInterface.querySelector('.info-card');
            if (panel) this.addTemporaryClass(panel, 'overlay-panel-exit', 240);
        }

        // Retirer l'overlay et réactiver le scroll
        this.exitFullscreenOverlayIfNeeded();

        // Masquer l'interface de chat après l'animation
        setTimeout(() => {
            this.chatbotInterface.classList.add('hidden');
            // Réafficher le formulaire de collecte
            this.chatbotCollect.classList.remove('hidden');
        }, wasOverlay ? 240 : 0);

        // NE PAS effacer la session pour permettre restauration
        // Réinitialiser seulement l'UI immédiate
        this.isChatActive = false;
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;
        this.isProcessing = false;

        // Vider l'affichage des messages (sauvegarde déjà en localStorage)
        this.chatMessages.innerHTML = '';

        // Nettoyer les erreurs
        const inputs = this.chatbotForm.querySelectorAll('input');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });

        // dataLayer: chatbot closed
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'chatbot_closed',
                chatbot: {
                    session_id: this.sessionId
                }
            });
        }
    }

    // Auto-resize du textarea
    autoResizeTextarea() {
        if (!this.chatInput) return;

        // Réinitialiser la hauteur pour calculer la nouvelle taille
        this.chatInput.style.height = 'auto';
        
        // Calculer la nouvelle hauteur basée sur le contenu
        const scrollHeight = this.chatInput.scrollHeight;
        const minHeight = 48; // 1 ligne
        const maxHeight = 120; // 4 lignes
        
        // Appliquer la nouvelle hauteur avec les limites
        if (scrollHeight <= maxHeight) {
            this.chatInput.style.height = Math.max(scrollHeight, minHeight) + 'px';
            this.chatInput.style.overflowY = 'hidden';
        } else {
            this.chatInput.style.height = maxHeight + 'px';
            this.chatInput.style.overflowY = 'auto';
            // Scroll automatique vers le bas pour voir la dernière ligne
            this.chatInput.scrollTop = this.chatInput.scrollHeight;
        }
    }

    // Réinitialiser la taille du textarea à 1 ligne
    resetTextareaSize() {
        if (!this.chatInput) return;
        
        this.chatInput.style.height = '48px'; // Hauteur d'une ligne
        this.chatInput.style.overflowY = 'hidden';
        this.chatInput.scrollTop = 0;
    }
}

/* ===== Extensions: overlay & session persistence ===== */
ChatbotManager.prototype.isMobileViewport = function() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
};

ChatbotManager.prototype.enterFullscreenOverlayIfMobile = function() {
    if (!this.isMobileViewport()) return;
    if (!this.chatbotInterface) return;
    // Appliquer classes d'overlay et animations
    this.chatbotInterface.classList.add('chat-overlay');
    this.addTemporaryClass(this.chatbotInterface, 'overlay-enter', 200);
    const panel = this.chatbotInterface.querySelector('.info-card');
    if (panel) this.addTemporaryClass(panel, 'overlay-panel-enter', 240);
    // Scroll lock
    if (document && document.body) {
        document.body.classList.add('no-scroll');
    }
};

ChatbotManager.prototype.exitFullscreenOverlayIfNeeded = function() {
    if (!this.chatbotInterface) return;
    this.chatbotInterface.classList.remove('chat-overlay');
    if (document && document.body) {
        document.body.classList.remove('no-scroll');
    }
};

ChatbotManager.prototype.addTemporaryClass = function(element, className, durationMs = 200) {
    if (!element) return;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), durationMs);
};

ChatbotManager.prototype.saveSessionToStorage = function() {
    try {
        const payload = {
            sessionId: this.sessionId,
            userName: this.userName,
            userEmail: this.userEmail,
            conversation: this.conversation,
            updatedAt: Date.now()
        };
        localStorage.setItem('fd_chat_session', JSON.stringify(payload));
    } catch (_) { /* ignore storage errors */ }
};

ChatbotManager.prototype.loadSessionFromStorage = function() {
    try {
        const raw = localStorage.getItem('fd_chat_session');
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !data.sessionId) return null;
        return data;
    } catch (_) {
        return null;
    }
};

ChatbotManager.prototype.tryRestoreSessionOnLoad = function() {
    const saved = this.loadSessionFromStorage();
    if (!saved) return;

    // Restaurer l'état
    this.sessionId = saved.sessionId;
    this.userName = saved.userName || '';
    this.userEmail = saved.userEmail || '';
    this.conversation = Array.isArray(saved.conversation) ? saved.conversation : [];

    // Basculer UI en mode chat
    if (this.chatbotCollect) this.chatbotCollect.classList.add('hidden');
    if (this.chatbotInterface) this.chatbotInterface.classList.remove('hidden');

    // Plein écran si mobile
    this.enterFullscreenOverlayIfMobile();

    // Activer l'input et reconstruire l'historique
    this.isChatActive = true;
    this.chatInput.disabled = false;
    this.sendButton.disabled = false;
    this.renderConversationFromState();

    // Focus input
    setTimeout(() => this.chatInput && this.chatInput.focus(), 50);
};

ChatbotManager.prototype.renderConversationFromState = function() {
    if (!this.chatMessages) return;
    this.chatMessages.innerHTML = '';
    this.conversation.forEach(msg => {
        const sender = msg.type === 'user' ? 'user' : 'bot';
        this.addMessage(sender, msg.content);
    });
};

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
