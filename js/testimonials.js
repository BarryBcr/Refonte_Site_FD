/**
 * Stacked Testimonials Carousel
 * Gère l'affichage et l'interaction des témoignages empilés avec drag & drop
 */
class StackedTestimonials {
    constructor() {
        this.testimonials = [];
        this.currentIndex = 0;
        this.positions = ['front', 'middle', 'back'];
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragCurrentX = 0;
        this.dragThreshold = 150;
        
        this.init();
    }

    async init() {
        try {
            console.log('🔍 Initialisation du carrousel empilé des témoignages...');
            await this.loadTestimonials();
            console.log('📊 Témoignages chargés:', this.testimonials.length);
            
            // Attendre que le DOM soit prêt
            await this.waitForElements();
            
            this.renderTestimonials();
            this.setupEventListeners();
            console.log('✅ Carrousel empilé initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des témoignages:', error);
            this.showFallback();
        }
    }

    async waitForElements() {
        console.log('⏳ Attente des éléments DOM...');
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const stack = document.querySelector('.testimonials-stack');
            
            if (stack) {
                console.log('✅ Élément DOM trouvé après', attempts + 1, 'tentatives');
                return;
            }
            
            attempts++;
            console.log(`🔄 Tentative ${attempts}/${maxAttempts} - Attente des éléments...`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Élément DOM non trouvé après plusieurs tentatives');
    }

    async loadTestimonials() {
        try {
            console.log('📥 Chargement des témoignages...');
            
            // Essayer différents chemins pour GitHub Pages
            const paths = [
                '/data/testimonials.json',
                './data/testimonials.json',
                'data/testimonials.json',
                '/Refonte_FD/data/testimonials.json'
            ];
            
            let data = null;
            let successfulPath = '';
            
            for (const path of paths) {
                try {
                    console.log(`🔍 Tentative avec le chemin: ${path}`);
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        successfulPath = path;
                        console.log(`✅ Témoignages chargés depuis: ${path}`);
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Échec avec le chemin: ${path}`);
                }
            }
            
            if (data && data.testimonials) {
                this.testimonials = data.testimonials;
                console.log('📋 Témoignages récupérés:', this.testimonials);
            } else {
                console.warn('⚠️ Aucun témoignage chargé depuis les chemins externes, utilisation des témoignages par défaut');
                this.testimonials = this.getDefaultTestimonials();
            }
            
        } catch (error) {
            console.warn('⚠️ Erreur de chargement, utilisation des témoignages par défaut:', error);
            this.testimonials = this.getDefaultTestimonials();
        }
    }

    getDefaultTestimonials() {
        console.log('🔄 Utilisation des témoignages par défaut intégrés');
        return [
            {
                id: 1,
                name: "Stephanie Rameau",
                company: "Café de la place Saint Mars La brière",
                position: "Gerante",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
                text: "FlairDigital nous a aidés à automatiser l'animation commerciale du Café de la place. Résultat : plus de temps pour nos clients et une ambiance toujours dynamique !",
                rating: 5
            },
            {
                id: 2,
                name: "Thony Meunier",
                company: "Commercial independant",
                position: "Commercial",
                text: "Grâce à FlairDigital, j'ai pu trouver plus de clients grâce à la génération de prospects industriels et à la mise en place d'automatisations efficaces.",
                rating: 5
            },
            {
                id: 3,
                name: "Jerome Cosset",
                company: "Bien être by Jerôme",
                position: "Magnétiseur",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
                text: "FlairDigital m'a aidé à développer mon activité sur la région en me générant des rendez-vous qualifiés avec des personnes en recherche de thérapeutes. Nous avons utilisé de la publicité Meta pour cibler efficacement ces prospects.",
                rating: 5
            }
        ];
    }

    renderTestimonials() {
        console.log('🎨 Rendu des témoignages empilés...');
        const stack = document.querySelector('.testimonials-stack');
        
        if (!stack) {
            console.error('❌ Élément stack non trouvé');
            return;
        }

        // Vider le contenu existant
        stack.innerHTML = '';

        // Afficher les 3 premiers témoignages
        const visibleTestimonials = this.getVisibleTestimonials();
        
        visibleTestimonials.forEach((testimonial, index) => {
            const card = this.createTestimonialCard(testimonial, this.positions[index]);
            stack.appendChild(card);
            console.log(`✅ Carte ${index + 1} créée et ajoutée`);
        });

        console.log('✅ Rendu terminé');
    }

    getVisibleTestimonials() {
        const visible = [];
        for (let i = 0; i < 3; i++) {
            const index = (this.currentIndex + i) % this.testimonials.length;
            visible.push(this.testimonials[index]);
        }
        return visible;
    }

    createTestimonialCard(testimonial, position) {
        const card = document.createElement('div');
        card.className = `testimonial-card-stack ${position}`;
        card.setAttribute('data-testimonial-id', testimonial.id);
        
        // Gestion intelligente des avatars
        let avatarHtml = '';
        if (testimonial.avatar) {
            avatarHtml = `<img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar">`;
        } else {
            const initials = testimonial.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
            avatarHtml = `<div class="testimonial-avatar-default">${initials}</div>`;
        }

        card.innerHTML = `
            ${avatarHtml}
            <div class="testimonial-stars">
                ${this.generateStars(testimonial.rating)}
            </div>
            <div class="testimonial-text">"${testimonial.text}"</div>
            <div class="testimonial-author">${testimonial.name}</div>
            <div class="testimonial-company">${testimonial.position} @ ${testimonial.company}</div>
        `;

        return card;
    }

    generateStars(rating) {
        const fullStar = '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        const emptyStar = '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }
        return stars;
    }

    setupEventListeners() {
        console.log('🔧 Configuration des événements...');
        
        const stack = document.querySelector('.testimonials-stack');
        if (!stack) {
            console.error('❌ Stack non trouvé pour les événements');
            return;
        }

        // Événements de souris
        stack.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));

        // Événements tactiles
        stack.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleDragEnd(e));

        // Événements clavier pour l'accessibilité
        stack.addEventListener('keydown', (e) => this.handleKeyDown(e));

        console.log('✅ Événements configurés');
    }

    handleDragStart(e) {
        const frontCard = document.querySelector('.testimonial-card-stack.front');
        if (!frontCard) return;

        // Vérifier si on clique sur la carte du devant
        if (!frontCard.contains(e.target)) return;

        this.isDragging = true;
        this.dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        
        frontCard.classList.add('dragging');
        console.log('👆 Début du drag');
        
        e.preventDefault();
    }

    handleDragMove(e) {
        if (!this.isDragging) return;

        const frontCard = document.querySelector('.testimonial-card-stack.front');
        if (!frontCard) return;

        this.dragCurrentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = this.dragCurrentX - this.dragStartX;

        // Appliquer l'effet visuel de drag
        if (Math.abs(deltaX) > 20) {
            if (deltaX < 0) {
                frontCard.classList.add('drag-left');
                frontCard.classList.remove('drag-right');
            } else {
                frontCard.classList.add('drag-right');
                frontCard.classList.remove('drag-left');
            }
        }

        e.preventDefault();
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;

        const frontCard = document.querySelector('.testimonial-card-stack.front');
        if (!frontCard) return;

        this.isDragging = false;
        const deltaX = this.dragCurrentX - this.dragStartX;

        // Nettoyer les classes de drag
        frontCard.classList.remove('dragging', 'drag-left', 'drag-right');

        // Vérifier si le seuil de swipe est atteint
        if (Math.abs(deltaX) > this.dragThreshold) {
            if (deltaX < 0) {
                // Swipe vers la gauche - passer au suivant
                console.log('👆 Swipe gauche détecté - passage au suivant');
                this.nextTestimonial();
            } else {
                // Swipe vers la droite - passer au précédent
                console.log('👆 Swipe droite détecté - passage au précédent');
                this.previousTestimonial();
            }
        }

        this.dragStartX = 0;
        this.dragCurrentX = 0;
    }

    handleKeyDown(e) {
        const frontCard = document.querySelector('.testimonial-card-stack.front');
        if (!frontCard || !frontCard.contains(e.target)) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTestimonial();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTestimonial();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.nextTestimonial();
                break;
        }
    }

    nextTestimonial() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.updatePositions();
        console.log('➡️ Passage au témoignage suivant:', this.currentIndex);
    }

    previousTestimonial() {
        this.currentIndex = this.currentIndex === 0 ? 
            this.testimonials.length - 1 : this.currentIndex - 1;
        this.updatePositions();
        console.log('⬅️ Passage au témoignage précédent:', this.currentIndex);
    }

    updatePositions() {
        const cards = document.querySelectorAll('.testimonial-card-stack');
        const visibleTestimonials = this.getVisibleTestimonials();

        // Effet de push : les cartes glissent naturellement vers leur nouvelle position
        cards.forEach((card, index) => {
            const testimonial = visibleTestimonials[index];
            const newPosition = this.positions[index];
            
            // Mettre à jour la classe de position pour déclencher la transition CSS
            card.className = `testimonial-card-stack ${newPosition}`;
            
            // Mettre à jour le contenu si c'est une nouvelle carte
            if (testimonial && card.getAttribute('data-testimonial-id') !== testimonial.id.toString()) {
                // Créer la nouvelle carte avec le bon contenu
                const newCard = this.createTestimonialCard(testimonial, newPosition);
                newCard.className = `testimonial-card-stack ${newPosition}`;
                card.parentNode.replaceChild(newCard, card);
            }
        });
    }

    showFallback() {
        const container = document.querySelector('.testimonials-stack-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-slate-400">Chargement des témoignages...</p>
                </div>
            `;
        }
    }
}

// Initialiser le carrousel quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new StackedTestimonials();
});

// Initialiser aussi si la section est chargée dynamiquement
if (typeof window !== 'undefined') {
    window.initStackedTestimonials = () => {
        new StackedTestimonials();
    };
}