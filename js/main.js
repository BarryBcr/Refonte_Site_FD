// Main JavaScript file for FlairDigital
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
    
    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('text-brand');
            item.classList.add('text-gray-300');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.remove('text-gray-300');
                item.classList.add('text-brand');
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Form validation and submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Veuillez entrer une adresse email valide.');
                return;
            }
            
            // Here you would typically send the form data to your server
            console.log('Form submitted:', { name, email, message });
            alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
            contactForm.reset();
        });
    }
    
    // Opening hours status check
    function updateOpeningStatus() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const hour = now.getHours();
        const statusElement = document.querySelector('.opening-status');
        
        if (statusElement) {
            let status = '';
            let statusClass = '';
            
            if (day === 0) { // Sunday
                status = 'Fermé';
                statusClass = 'text-red-400';
            } else if (day === 6) { // Saturday
                status = 'Sur rendez-vous';
                statusClass = 'text-yellow-400';
            } else if (hour >= 9 && hour < 18) { // Monday-Friday, 9h-18h
                status = 'Ouvert';
                statusClass = 'text-green-400';
            } else {
                status = 'Fermé';
                statusClass = 'text-red-400';
            }
            
            statusElement.textContent = status;
            statusElement.className = `opening-status font-medium ${statusClass}`;
        }
    }
    
    // Update opening status on page load
    updateOpeningStatus();
    
    // Update opening status every minute
    setInterval(updateOpeningStatus, 60000);
    
    // Initialize Services Slider after sections are loaded
    initializeServicesSlider();
}); 

// Services Slider
class ServicesSlider {
    constructor() {
        this.slider = document.querySelector('.services-slider');
        this.container = document.querySelector('.services-slider-container');
        this.slides = document.querySelectorAll('.service-slide');
        this.prevBtn = document.querySelector('.slider-nav-prev');
        this.nextBtn = document.querySelector('.slider-nav-next');
        
        if (!this.slider) {
            console.log('Services slider not found');
            return;
        }
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        console.log('Services slider initialized with', this.totalSlides, 'slides');
        this.init();
    }
    
    init() {
        this.setupDimensions();
        this.setupEventListeners();
        this.updateSliderPosition();
        this.updateNavigationButtons();
    }

    setupDimensions() {
        // Ensure slider width matches number of slides and each slide occupies equal fraction
        if (this.slider && this.totalSlides > 0) {
            this.slider.style.width = `${this.totalSlides * 100}%`;
            const basis = 100 / this.totalSlides;
            this.slides.forEach(slide => {
                slide.style.flex = `0 0 ${basis}%`;
                slide.style.minWidth = `${basis}%`;
                slide.style.maxWidth = `${basis}%`;
            });
        }
    }
    
    setupEventListeners() {
        // Navigation buttons (removed)
        
        // Touch events for swipe
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Mouse events for hover
        // No hover navigation indicators
        
        // Touch events for mobile navigation visibility
        // No touch navigation indicators
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.showNavigation();
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
        setTimeout(() => this.hideNavigation(), 3000);
    }
    
    handleTouchMove(e) {
        // Allow scrolling but prevent default only for horizontal swipes
        const touch = e.changedTouches[0];
        const diffX = Math.abs(touch.screenX - this.touchStartX);
        const diffY = Math.abs(touch.screenY - (e.touches[0]?.screenY || 0));
        
        if (diffX > diffY && diffX > 10) {
            e.preventDefault();
        }
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.prevSlide();
            }
        }
    }
    
    showNavigation() {
        if (this.prevBtn) this.prevBtn.style.opacity = '1';
        if (this.nextBtn) this.nextBtn.style.opacity = '1';
    }
    
    hideNavigation() {
        if (this.prevBtn) this.prevBtn.style.opacity = '0';
        if (this.nextBtn) this.nextBtn.style.opacity = '0';
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        console.log('Moving to slide', this.currentSlide);
        this.updateSliderPosition();
        this.updateNavigationButtons();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        console.log('Moving to slide', this.currentSlide);
        this.updateSliderPosition();
        this.updateNavigationButtons();
    }
    
    updateSliderPosition() {
        // Translate by the fraction of the slider width that corresponds to one slide
        const percentagePerSlide = 100 / this.totalSlides; // e.g., 33.333% for 3 slides
        const translateX = -(this.currentSlide * percentagePerSlide);
        console.log('Updating slider position:', translateX + '%');
        this.slider.style.transform = `translateX(${translateX}%)`;
    }
    
    updateNavigationButtons() {
        // Update button states based on current slide
        if (this.prevBtn) {
            this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
        }
        if (this.nextBtn) {
            this.nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1';
        }
    }
}

// Function to initialize slider after sections are loaded
function initializeServicesSlider() {
    // Wait a bit for sections to load, then initialize slider
    setTimeout(() => {
        console.log('Initializing Services Slider...');
        new ServicesSlider();
    }, 1000);
} 