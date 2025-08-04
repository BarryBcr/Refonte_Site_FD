// Système de particules pour l'effet futuriste
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createCanvas();
            this.createParticles();
            this.animate();
            this.handleResize();
        });
    }

    createCanvas() {
        const heroSection = document.getElementById('accueil');
        
        if (!heroSection) return;

        // Créer le canvas s'il n'existe pas déjà
        if (!document.getElementById('particles-canvas')) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particles-canvas';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '1';
            
            heroSection.style.position = 'relative';
            heroSection.style.overflow = 'hidden';
            
            // Insérer le canvas comme premier enfant de la section hero
            heroSection.insertBefore(this.canvas, heroSection.firstChild);
            
            // S'assurer que le contenu est au-dessus des particules
            const heroContent = heroSection.querySelector('.container');
            if (heroContent) {
                heroContent.style.position = 'relative';
                heroContent.style.zIndex = '2';
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        } else {
            this.canvas = document.getElementById('particles-canvas');
            this.ctx = this.canvas.getContext('2d');
        }
    }

    resizeCanvas() {
        const heroSection = document.getElementById('accueil');
        if (heroSection && this.canvas) {
            this.canvas.width = heroSection.offsetWidth;
            this.canvas.height = heroSection.offsetHeight;
        }
    }

    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                color: `rgba(179, 136, 255, ${Math.random() * 0.5 + 0.1})`,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseDirection: 1
            });
        }
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Mettre à jour la position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Effet de pulsation
            particle.opacity += particle.pulseSpeed * particle.pulseDirection;
            if (particle.opacity > 0.6 || particle.opacity < 0.1) {
                particle.pulseDirection *= -1;
            }
            
            // Rebondir sur les bords
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // Garder les particules dans les limites
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Dessiner la particule
            this.drawParticle(particle);
        });
        
        // Dessiner les connexions
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(179, 136, 255, ${particle.opacity})`;
        this.ctx.fill();
        
        // Effet de lueur
        this.ctx.shadowColor = '#b388ff';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawConnections() {
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = 0.1 * (1 - distance / 100);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(179, 136, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Système de particules interactives
class InteractiveParticles extends ParticleSystem {
    constructor() {
        super();
        this.mouse = { x: 0, y: 0 };
        this.mouseRadius = 100;
        this.initInteraction();
    }

    initInteraction() {
        document.addEventListener('mousemove', (e) => {
            const heroSection = document.getElementById('accueil');
            if (heroSection) {
                const rect = heroSection.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            }
        });

        document.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Interaction avec la souris
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouseRadius) {
                const force = (this.mouseRadius - distance) / this.mouseRadius;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            }
            
            // Mise à jour normale
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Effet de pulsation
            particle.opacity += particle.pulseSpeed * particle.pulseDirection;
            if (particle.opacity > 0.6 || particle.opacity < 0.1) {
                particle.pulseDirection *= -1;
            }
            
            // Rebondir sur les bords
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            // Garder les particules dans les limites
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Dessiner la particule
            this.drawParticle(particle);
        });
        
        // Dessiner les connexions
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Système de particules avec effets météo
class WeatherParticles extends ParticleSystem {
    constructor(weatherType = 'rain') {
        super();
        this.weatherType = weatherType;
        this.particleCount = weatherType === 'rain' ? 100 : 30;
        this.createWeatherParticles();
    }

    createWeatherParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            if (this.weatherType === 'rain') {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    length: Math.random() * 20 + 10,
                    speed: Math.random() * 3 + 2,
                    opacity: Math.random() * 0.5 + 0.2,
                    width: Math.random() * 1 + 0.5
                });
            } else if (this.weatherType === 'snow') {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height - this.canvas.height,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 1 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    sway: Math.random() * 0.5 - 0.25
                });
            }
        }
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            if (this.weatherType === 'rain') {
                // Mise à jour de la position de la pluie
                particle.y += particle.speed;
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.length;
                    particle.x = Math.random() * this.canvas.width;
                }
                
                // Dessiner la goutte de pluie
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(179, 136, 255, ${particle.opacity})`;
                this.ctx.lineWidth = particle.width;
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x, particle.y + particle.length);
                this.ctx.stroke();
                
            } else if (this.weatherType === 'snow') {
                // Mise à jour de la position de la neige
                particle.y += particle.speed;
                particle.x += particle.sway;
                
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.size;
                    particle.x = Math.random() * this.canvas.width;
                }
                
                if (particle.x > this.canvas.width) {
                    particle.x = 0;
                } else if (particle.x < 0) {
                    particle.x = this.canvas.width;
                }
                
                // Dessiner le flocon de neige
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                this.ctx.fill();
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Initialiser le système de particules approprié
let particleSystem;

document.addEventListener('DOMContentLoaded', () => {
    // Choisir le type de particules selon les préférences
    const particleType = 'interactive'; // 'basic', 'interactive', 'weather'
    const weatherType = 'rain'; // 'rain', 'snow'
    
    switch (particleType) {
        case 'interactive':
            particleSystem = new InteractiveParticles();
            break;
        case 'weather':
            particleSystem = new WeatherParticles(weatherType);
            break;
        default:
            particleSystem = new ParticleSystem();
            break;
    }
}); 