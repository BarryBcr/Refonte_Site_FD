// Gestion du formulaire de contact
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        if (this.form) {
            this.submitButton = this.form.querySelector('button[type="submit"]');
            this.setupEventListeners();
            this.setupValidation();
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
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
        
        field.classList.add('border-red-500');
        field.classList.remove('border-brand/30');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        errorDiv.id = `error-${field.name}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500');
        field.classList.add('border-brand/30');
        
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
        if (this.isSubmitting) return;

        if (!this.validateForm()) {
            this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
            return;
        }

        this.setSubmitting(true);

        try {
            const formData = this.getFormData();
            await this.submitForm(formData);
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
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
        // Simulation d'envoi - remplacer par votre logique d'envoi réelle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Exemple d'envoi avec fetch (à adapter selon votre backend)
        /*
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        */

        this.showSuccessMessage(data);
        this.resetForm();
    }

    setSubmitting(submitting) {
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

    showSuccessMessage(data) {
        const message = `Merci ${data.name} ! Votre message a bien été envoyé. Nous vous contacterons rapidement à l'adresse ${data.email}.`;
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback si le système de notification n'est pas disponible
            alert(message);
        }
    }

    resetForm() {
        this.form.reset();
        
        // Réinitialiser les styles
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('border-red-500');
            input.classList.add('border-brand/30');
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
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'error');
        }
    }

    showSuccess(message) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, 'success');
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
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
    new NewsletterForm();
    new ContactInfo();
    new OpeningHours();
}); 