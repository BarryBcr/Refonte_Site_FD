// Gestion du formulaire de contact
class ContactForm {
    constructor() {
        console.log('🔧 ContactForm: Constructeur appelé');
        this.form = document.getElementById('contact-form');
        this.submitButton = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        console.log('🔧 ContactForm: Init appelé');
        if (this.form) {
            console.log('✅ ContactForm: Formulaire trouvé:', this.form);
            this.submitButton = this.form.querySelector('button[type="submit"]');
            console.log('✅ ContactForm: Bouton trouvé:', this.submitButton);
            this.setupEventListeners();
            this.setupValidation();
            this.createNotificationContainer();
        } else {
            console.error('❌ ContactForm: Formulaire NON trouvé!');
        }
    }

    createNotificationContainer() {
        // Créer le conteneur de notifications s'il n'existe pas
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
    }

    setupEventListeners() {
        console.log('🔧 ContactForm: Configuration des event listeners');
        
        // Intercepter la soumission du formulaire
        this.form.addEventListener('submit', (e) => {
            console.log('🚨 ContactForm: Submit intercepté!');
            e.preventDefault(); // Empêcher la soumission normale
            console.log('✅ ContactForm: Submit empêché, appel de handleSubmit');
            this.handleSubmit();
        });

        // Validation en temps réel
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
        
        console.log('✅ ContactForm: Event listeners configurés');
    }

    setupValidation() {
        // Règles de validation
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            service: {
                required: false
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000
            }
        };

        // Messages d'erreur
        this.errorMessages = {
            name: {
                required: 'Le nom est requis',
                minLength: 'Le nom doit contenir au moins 2 caractères',
                maxLength: 'Le nom ne peut pas dépasser 50 caractères',
                pattern: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
            },
            email: {
                required: 'L\'email est requis',
                pattern: 'Veuillez entrer une adresse email valide'
            },
            message: {
                required: 'Le message est requis',
                minLength: 'Le message doit contenir au moins 10 caractères',
                maxLength: 'Le message ne peut pas dépasser 1000 caractères'
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
        
        // Ajouter les classes d'erreur
        field.style.borderColor = '#ef4444'; // Rouge
        field.style.borderWidth = '2px';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 font-medium';
        errorDiv.textContent = message;
        errorDiv.id = `error-${field.name}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        // Restaurer les styles par défaut
        field.style.borderColor = '';
        field.style.borderWidth = '';
        
        const errorDiv = field.parentNode.querySelector(`#error-${field.name}`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleSubmit() {
        console.log('🚀 ContactForm: handleSubmit appelé');
        
        if (this.isSubmitting) {
            console.log('⚠️ ContactForm: Déjà en cours d\'envoi');
            return;
        }

        if (!this.validateForm()) {
            console.log('❌ ContactForm: Validation échouée');
            this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        console.log('✅ ContactForm: Validation réussie, début de l\'envoi');
        this.setSubmitting(true);

        try {
            const formData = this.getFormData();
            console.log('📤 ContactForm: Données du formulaire:', formData);
            await this.submitForm(formData);
        } catch (error) {
            console.error('❌ ContactForm: Erreur lors de l\'envoi:', error);
            this.showNotification('Une erreur est survenue lors de l\'envoi', 'error');
        } finally {
            this.setSubmitting(false);
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }

        return data;
    }

    async submitForm(data) {
        console.log('📤 ContactForm: submitForm appelé avec:', data);
        
        // Simulation d'envoi - remplacer par votre logique d'envoi réelle
        console.log('⏳ ContactForm: Simulation d\'envoi en cours...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Afficher la popup de confirmation
        console.log('✅ ContactForm: Envoi simulé réussi, affichage de la popup');
        this.showSuccessPopup(data);
        this.resetForm();
    }

    setSubmitting(submitting) {
        console.log('🔄 ContactForm: setSubmitting:', submitting);
        this.isSubmitting = submitting;
        
        if (this.submitButton) {
            if (submitting) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                `;
            } else {
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = 'Envoyer votre message';
            }
        }
    }

    showSuccessPopup(data) {
        console.log('🎉 ContactForm: Affichage de la popup de succès');
        
        // Créer la popup de succès
        const popup = document.createElement('div');
        popup.id = 'success-popup';
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        popup.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 shadow-2xl">
                <div class="text-center">
                    <!-- Icône de succès -->
                    <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style="border: 3px solid #b388ff; background-color: transparent;">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke: #b388ff;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    
                    <!-- Message de succès -->
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Message envoyé !</h3>
                    <p class="text-gray-600 mb-8 leading-relaxed">
                        Votre message a été envoyé ! Nous vous recontactons au plus vite.
                    </p>
                    
                    <!-- Bouton de fermeture avec bordures violettes (non rempli) et check -->
                    <button onclick="this.closest('#success-popup').remove()" class="success-popup-button px-8 py-3 bg-transparent border-2 font-medium rounded-lg transition-all duration-300 flex items-center justify-center mx-auto group" style="border-color: #b388ff; color: #b388ff;">
                        <svg class="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke: #b388ff;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Parfait !
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animation d'entrée
        setTimeout(() => {
            const content = popup.querySelector('div');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 100);
        
        // Fermeture au clic sur l'arrière-plan
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }

    showNotification(message, type) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type} transform transition-all duration-300 ease-in-out translate-x-full`;
        
        // Styles selon le type
        const styles = {
            success: 'bg-green-500 text-white border-l-4 border-green-600',
            error: 'bg-red-500 text-white border-l-4 border-red-600',
            warning: 'bg-yellow-500 text-white border-l-4 border-yellow-600',
            info: 'bg-blue-500 text-white border-l-4 border-blue-600'
        };

        notification.className = `notification p-4 rounded-lg shadow-lg max-w-sm ${styles[type] || styles.info}`;
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="font-medium">${message}</span>
                </div>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    resetForm() {
        this.form.reset();
        
        // Réinitialiser les styles
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
    }
}

// Gestion de la newsletter
class NewsletterForm {
    constructor() {
        this.form = document.querySelector('.newsletter-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    async handleSubmit() {
        const emailInput = this.form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showError('Veuillez entrer une adresse email valide');
            return;
        }

        try {
            // Simulation d'envoi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess('Inscription réussie ! Vous recevrez bientôt nos actualités.');
            emailInput.value = '';
        } catch (error) {
            this.showError('Une erreur est survenue lors de l\'inscription');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        // Utiliser le système de notification du formulaire de contact
        if (window.contactForm) {
            window.contactForm.showNotification(message, 'error');
        }
    }

    showSuccess(message) {
        if (window.contactForm) {
            window.contactForm.showNotification(message, 'success');
        }
    }
}

// Gestion des informations de contact
class ContactInfo {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactLinks();
        this.setupMapIntegration();
    }

    setupContactLinks() {
        // Lien email
        const emailElement = document.querySelector('.contact-info-item:has(svg[stroke-linecap="round"])');
        if (emailElement) {
            const emailText = emailElement.querySelector('p');
            if (emailText && emailText.textContent.includes('@')) {
                emailText.style.cursor = 'pointer';
                emailText.addEventListener('click', () => {
                    window.location.href = `mailto:${emailText.textContent}`;
                });
            }
        }

        // Lien téléphone
        const phoneElement = document.querySelector('.contact-info-item:has(svg[stroke-linecap="round"])');
        if (phoneElement) {
            const phoneText = phoneElement.querySelector('p');
            if (phoneText && phoneText.textContent.includes('+')) {
                phoneText.style.cursor = 'pointer';
                phoneText.addEventListener('click', () => {
                    window.location.href = `tel:${phoneText.textContent.replace(/\s/g, '')}`;
                });
            }
        }
    }

    setupMapIntegration() {
        // Intégration Google Maps (optionnel)
        const addressElement = document.querySelector('.contact-info-item:last-child p');
        if (addressElement) {
            addressElement.style.cursor = 'pointer';
            addressElement.addEventListener('click', () => {
                const address = encodeURIComponent(addressElement.textContent);
                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
            });
        }
    }
}

// Gestion des horaires d'ouverture
class OpeningHours {
    constructor() {
        this.init();
    }

    init() {
        this.updateCurrentStatus();
        setInterval(() => this.updateCurrentStatus(), 60000); // Mettre à jour toutes les minutes
    }

    updateCurrentStatus() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hour * 100 + minutes;

        const isOpen = this.isCurrentlyOpen(dayOfWeek, currentTime);
        const statusElement = document.querySelector('.opening-status');

        if (statusElement) {
            statusElement.textContent = isOpen ? 'Ouvert' : 'Fermé';
            statusElement.className = `opening-status ${isOpen ? 'text-green-400' : 'text-red-400'}`;
        }
    }

    isCurrentlyOpen(dayOfWeek, currentTime) {
        // Lundi = 1, Dimanche = 0
        const openingHours = {
            1: { open: 900, close: 1800 }, // Lundi
            2: { open: 900, close: 1800 }, // Mardi
            3: { open: 900, close: 1800 }, // Mercredi
            4: { open: 900, close: 1800 }, // Jeudi
            5: { open: 900, close: 1800 }, // Vendredi
            6: { open: -1, close: -1 },    // Samedi (sur rendez-vous)
            0: { open: -1, close: -1 }     // Dimanche (fermé)
        };

        const today = openingHours[dayOfWeek];
        
        if (today.open === -1) return false; // Fermé
        
        return currentTime >= today.open && currentTime <= today.close;
    }
}

// Initialisation
// Note: L'initialisation se fait maintenant dans index.html après le chargement des sections
// pour éviter le problème de timing où le formulaire n'existe pas encore dans le DOM

// Fonction d'initialisation manuelle (appelée depuis index.html)
function initializeContactForm() {
    console.log('🚀 Initialisation manuelle du formulaire de contact...');
    window.contactForm = new ContactForm();
    new NewsletterForm();
    console.log('✅ Initialisation manuelle terminée');
} 