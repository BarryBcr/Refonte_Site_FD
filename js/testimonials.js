/**
 * Testimonials Carousel
 * Gère l'affichage et la rotation automatique des témoignages
 */
class TestimonialsCarousel {
    constructor() {
        this.currentSlide = 0;
        this.testimonials = [];
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 secondes
        this.isPaused = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🔍 Initialisation du carrousel des témoignages...');
            await this.loadTestimonials();
            console.log('📊 Témoignages chargés:', this.testimonials.length);
            
            // Attendre que le DOM soit prêt
            await this.waitForElements();
            
            this.renderTestimonials();
            this.setupEventListeners();
            this.startAutoPlay();
            this.updateDots();
            console.log('✅ Carrousel initialisé avec succès');
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
            const track = document.querySelector('.testimonials-track');
            const dotsContainer = document.querySelector('.testimonial-dots');
            
            if (track && dotsContainer) {
                console.log('✅ Éléments DOM trouvés après', attempts + 1, 'tentatives');
                return;
            }
            
            attempts++;
            console.log(`🔄 Tentative ${attempts}/${maxAttempts} - Attente des éléments...`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('Éléments DOM non trouvés après plusieurs tentatives');
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
            // Fallback si le fichier JSON n'est pas accessible
            this.testimonials = this.getDefaultTestimonials();
        }
    }

    getDefaultTestimonials() {
        console.log('🔄 Utilisation des témoignages par défaut intégrés');
        return [
            {
                id: 1,
                name: "Marie Dubois",
                company: "E-commerce Plus",
                position: "Directrice Marketing",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
                text: "FlairDigital a transformé notre stratégie digitale. Nos ventes en ligne ont augmenté de 40% en seulement 3 mois !",
                rating: 5
            },
            {
                id: 2,
                name: "Thomas Martin",
                company: "TechStart",
                position: "CEO",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
                text: "L'équipe de FlairDigital a su comprendre nos besoins et livrer des solutions sur mesure. Un partenaire de confiance !",
                rating: 5
            },
            {
                id: 3,
                name: "Sophie Bernard",
                company: "Green Solutions",
                position: "Responsable Communication",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluYXI+",
                text: "Excellente collaboration ! FlairDigital nous a aidés à moderniser notre présence en ligne avec professionnalisme.",
                rating: 5
            },
            {
                id: 4,
                name: "Lucas Moreau",
                company: "Innov'Consulting",
                position: "Fondateur",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluYXI+",
                text: "Grâce à FlairDigital, notre visibilité sur les réseaux sociaux a explosé. ROI exceptionnel sur nos investissements !",
                rating: 5
            },
            {
                id: 5,
                name: "Emma Rousseau",
                company: "BioMarket",
                position: "Directrice Commerciale",
                avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjQiIHI9IjEyIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgNDhDMjQgNDAgMzIgNDAgNDAgNDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI2NCIgeTI9IjY0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNiMzg4ZmYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOWI2ZGZmIi8+CjwvbGluYXI+",
                text: "FlairDigital a créé une stratégie d'automatisation qui nous fait gagner 15h par semaine. Incroyable !",
                rating: 5
            }
        ];
    }

    renderTestimonials() {
        console.log('🎨 Rendu des témoignages...');
        const track = document.querySelector('.testimonials-track');
        const dotsContainer = document.querySelector('.testimonial-dots');
        
        console.log('🔍 Éléments trouvés:', { 
            track: !!track, 
            dotsContainer: !!dotsContainer,
            trackElement: track,
            dotsElement: dotsContainer
        });
        
        if (!track || !dotsContainer) {
            console.error('❌ Éléments manquants pour le rendu');
            console.error('Track:', track);
            console.error('DotsContainer:', dotsContainer);
            return;
        }

        console.log('📏 Éléments DOM valides, début du rendu...');

        // Vider le contenu existant
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Calculer la largeur du track basée sur le nombre de témoignages
        const slideWidth = 100 / this.testimonials.length;
        track.style.width = `${this.testimonials.length * 100}%`;
        
        console.log('📏 Dimensions calculées:', { 
            slideWidth: `${slideWidth}%`, 
            trackWidth: `${this.testimonials.length * 100}%`,
            testimonialsCount: this.testimonials.length
        });

        // Créer les slides
        this.testimonials.forEach((testimonial, index) => {
            console.log(`🎭 Création du slide ${index + 1}/${this.testimonials.length}:`, testimonial.name);
            const slide = this.createTestimonialSlide(testimonial, slideWidth);
            console.log(`📦 Slide créé:`, slide);
            track.appendChild(slide);
            console.log(`✅ Slide ${index + 1} ajouté au track`);

            // Créer les dots
            const dot = this.createDot(index);
            dotsContainer.appendChild(dot);
            console.log(`🔘 Dot ${index + 1} ajouté`);
        });

        console.log('📊 Contenu final du track:', track.innerHTML.length, 'caractères');
        console.log('📊 Contenu final des dots:', dotsContainer.innerHTML.length, 'caractères');

        // Mettre à jour la position initiale
        this.updateSlidePosition();
        console.log('✅ Rendu terminé');
    }

    createTestimonialSlide(testimonial, slideWidth) {
        const slide = document.createElement('div');
        slide.className = 'testimonial-slide flex-shrink-0';
        slide.style.width = `${slideWidth}%`;
        slide.style.padding = '0 1rem';

        // Gestion intelligente des avatars
        let avatarHtml = '';
        if (testimonial.avatar) {
            // Avatar fourni (image ou SVG)
            avatarHtml = `<img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-16 h-16 rounded-full mx-auto mb-4 object-cover">`;
        } else {
            // Pas d'avatar - utiliser les initiales avec le style par défaut
            const initials = testimonial.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
            avatarHtml = `<div class="avatar-default w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold">${initials}</div>`;
        }

        slide.innerHTML = `
            <div class="testimonial-card bg-white rounded-xl shadow-lg p-6 md:p-8 h-full flex flex-col justify-between">
                <div class="text-center">
                    ${avatarHtml}
                    <div class="stars mb-4">
                        ${this.generateStars(testimonial.rating)}
                    </div>
                    <blockquote class="text-gray-700 text-lg mb-6 italic">
                        "${testimonial.text}"
                    </blockquote>
                </div>
                <div class="text-center">
                    <h4 class="font-semibold text-gray-800 text-lg">${testimonial.name}</h4>
                    <p class="text-gray-600 text-sm">${testimonial.position}</p>
                    <p class="text-blue-600 font-medium text-sm">${testimonial.company}</p>
                </div>
            </div>
        `;

        return slide;
    }

    generateStars(rating) {
        const fullStar = '<svg class="w-5 h-5 text-yellow-400 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        const emptyStar = '<svg class="w-5 h-5 text-gray-300 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }
        return stars;
    }

    createDot(index) {
        const dot = document.createElement('button');
        dot.className = 'w-3 h-3 rounded-full transition-all duration-300';
        dot.setAttribute('data-slide', index);
        
        if (index === 0) {
            dot.classList.add('bg-blue-600');
        } else {
            dot.classList.add('bg-gray-300');
        }

        dot.addEventListener('click', () => {
            this.goToSlide(index);
        });

        return dot;
    }

    setupEventListeners() {
        console.log('🔧 Configuration des événements...');
        
        // Navigation arrows
        const prevBtn = document.querySelector('.testimonial-nav.prev');
        const nextBtn = document.querySelector('.testimonial-nav.next');

        console.log('🔍 Boutons trouvés:', { prev: !!prevBtn, next: !!nextBtn });

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('⬅️ Bouton précédent cliqué');
                this.previousSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('➡️ Bouton suivant cliqué');
                this.nextSlide();
            });
        }

        // Pause auto-play on hover/touch
        const container = document.querySelector('.testimonials-carousel-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            container.addEventListener('mouseleave', () => this.resumeAutoPlay());
            
            // Gestion mobile : pause au touch
            container.addEventListener('touchstart', () => {
                console.log('👆 Touch détecté - pause auto-play');
                this.pauseAutoPlay();
            });
            
            container.addEventListener('touchend', () => {
                console.log('👆 Touch terminé - reprise auto-play');
                setTimeout(() => this.resumeAutoPlay(), 1000); // Reprise après 1 seconde
            });
        }

        // Touch events for mobile
        this.setupTouchEvents();
        
        console.log('✅ Événements configurés');
    }

    setupTouchEvents() {
        console.log('📱 Configuration des événements tactiles...');
        const track = document.querySelector('.testimonials-track');
        if (!track) {
            console.error('❌ Track non trouvé pour les événements tactiles');
            return;
        }

        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            console.log('👆 Touch start:', startX);
            this.pauseAutoPlay();
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = startX - currentX;
            const threshold = 50;

            console.log('👆 Touch end - diff:', diff, 'threshold:', threshold);

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    console.log('👆 Swipe gauche - slide suivant');
                    this.nextSlide();
                } else {
                    console.log('👆 Swipe droite - slide précédent');
                    this.previousSlide();
                }
            }

            isDragging = false;
            setTimeout(() => this.resumeAutoPlay(), 1000);
        });
        
        console.log('✅ Événements tactiles configurés');
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.testimonials.length;
        this.updateSlidePosition();
        this.updateDots();
    }

    previousSlide() {
        this.currentSlide = this.currentSlide === 0 ? 
            this.testimonials.length - 1 : this.currentSlide - 1;
        this.updateSlidePosition();
        this.updateDots();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlidePosition();
        this.updateDots();
    }

    updateSlidePosition() {
        const track = document.querySelector('.testimonials-track');
        if (!track) return;

        const slideWidth = 100 / this.testimonials.length;
        const translateX = -(this.currentSlide * slideWidth);
        track.style.transform = `translateX(${translateX}%)`;
    }

    updateDots() {
        console.log('🔘 Mise à jour des points indicateurs - slide actuel:', this.currentSlide);
        const dots = document.querySelectorAll('.testimonial-dots button');
        
        dots.forEach((dot, index) => {
            // Retirer toutes les classes de couleur
            dot.classList.remove('bg-blue-600', 'bg-gray-300', 'active');
            
            if (index === this.currentSlide) {
                dot.classList.add('active');
                console.log(`🔘 Point ${index} activé (bleu)`);
            } else {
                console.log(`🔘 Point ${index} désactivé (gris)`);
            }
        });
    }

    startAutoPlay() {
        console.log('🔄 Démarrage de la rotation automatique...');
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        // Vérifier que nous avons des témoignages
        if (this.testimonials.length <= 1) {
            console.log('⚠️ Pas assez de témoignages pour l\'auto-play');
            return;
        }
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                console.log('🔄 Rotation automatique - passage au slide suivant');
                this.nextSlide();
            } else {
                console.log('⏸️ Auto-play en pause');
            }
        }, this.autoPlayDelay);
        
        console.log('✅ Rotation automatique démarrée avec un délai de', this.autoPlayDelay, 'ms');
        console.log('📱 Compatible mobile:', 'ontouchstart' in window);
    }

    pauseAutoPlay() {
        console.log('⏸️ Pause de la rotation automatique');
        this.isPaused = true;
    }

    resumeAutoPlay() {
        console.log('▶️ Reprise de la rotation automatique');
        this.isPaused = false;
    }

    showFallback() {
        const container = document.querySelector('.testimonials-carousel-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-600">Chargement des témoignages...</p>
                </div>
            `;
        }
    }
}

// Initialiser le carrousel quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsCarousel();
});

// Initialiser aussi si la section est chargée dynamiquement
if (typeof window !== 'undefined') {
    window.initTestimonialsCarousel = () => {
        new TestimonialsCarousel();
    };
}
