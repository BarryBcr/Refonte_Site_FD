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
        this.isChatActive = false;
        
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

    handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        // Récupérer les données
        this.userName = this.chatbotForm.querySelector('#chatbot-name').value.trim();
        this.userEmail = this.chatbotForm.querySelector('#chatbot-email').value.trim();

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

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || !this.isChatActive) return;

        // Ajouter le message de l'utilisateur
        this.addMessage('user', message);

        // Vider l'input
        this.chatInput.value = '';

        // Simuler une réponse de l'IA (mockup)
        this.simulateAIResponse(message);
    }

    simulateAIResponse(userMessage) {
        // Simuler un délai de réponse
        setTimeout(() => {
            let response = '';

            // Réponses mockup basées sur le contenu du message
            if (userMessage.toLowerCase().includes('bonjour') || userMessage.toLowerCase().includes('salut')) {
                response = `Bonjour ${this.userName} ! Ravi de vous revoir. Comment puis-je vous aider aujourd'hui ?`;
            } else if (userMessage.toLowerCase().includes('automatisation') || userMessage.toLowerCase().includes('automatiser')) {
                response = 'L\'automatisation est un excellent moyen d\'optimiser vos processus ! Pouvez-vous me dire quels aspects de votre entreprise vous souhaitez automatiser ?';
            } else if (userMessage.toLowerCase().includes('croissance') || userMessage.toLowerCase().includes('développer')) {
                response = 'La croissance de votre entreprise est notre spécialité ! Nous utilisons des stratégies d\'acquisition client et d\'automatisation. Que souhaitez-vous améliorer en priorité ?';
            } else if (userMessage.toLowerCase().includes('meta ads') || userMessage.toLowerCase().includes('facebook') || userMessage.toLowerCase().includes('instagram')) {
                response = 'Les Meta Ads sont très efficaces pour l\'acquisition client ! Nous créons des campagnes ciblées qui convertissent. Avez-vous déjà testé la publicité sur les réseaux sociaux ?';
            } else if (userMessage.toLowerCase().includes('email marketing')) {
                response = 'L\'email marketing reste un canal très performant ! Nous automatisons vos séquences d\'emails pour maximiser l\'engagement. Quel est votre objectif principal ?';
            } else {
                response = 'Merci pour votre message ! Je comprends que vous souhaitez en savoir plus. Pouvez-vous me donner plus de détails sur vos besoins ?';
            }

            this.addMessage('bot', response);
        }, 1000 + Math.random() * 1000); // Délai aléatoire entre 1-2 secondes
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
