// Simple CNIL-compliant consent banner with Google Consent Mode v2
// Design aligned with Design Rules (brand colors, dark backgrounds)
(function () {
    const STORAGE_KEY = 'fd_consent_v1';

    function readConsent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function saveConsent(consent) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (_) {}
    }

    function applyConsent(consent) {
        if (typeof gtag !== 'function') {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){ dataLayer.push(arguments); };
        }
        gtag('consent', 'update', {
            ad_storage: consent.ads ? 'granted' : 'denied',
            analytics_storage: consent.analytics ? 'granted' : 'denied'
        });
    }

    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'fd-consent-banner';
        banner.className = 'fixed inset-x-0 bottom-0 z-50';

        banner.innerHTML = `
            <div class="container mx-auto px-4 pb-4">
                <div class="bg-[#1e1e1e] border border-[rgba(179,136,255,0.2)] rounded-xl p-4 md:p-6 shadow-2xl">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="text-gray-200">
                            <h3 class="text-lg md:text-xl font-bold futuristic-font text-white mb-1">Cookies & Confidentialité</h3>
                            <p class="text-gray-300 text-sm md:text-base">Nous utilisons des cookies et technologies similaires, nécessaires au fonctionnement du site et, sous réserve de votre consentement, destinés à mesurer l'audience et améliorer nos services. Vous pouvez accepter, refuser ou personnaliser vos choix à tout moment.</p>
                            <a href="politique-confidentialite.html" class="text-brand underline text-sm">En savoir plus</a>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 md:gap-3">
                            <button id="fd-consent-refuse" class="px-4 py-2 rounded-lg border border-brand text-brand hover:bg-brand hover:text-dark transition">Tout refuser</button>
                            <button id="fd-consent-customize" class="px-4 py-2 rounded-lg bg-[#2d2d2d] text-gray-200 border border-[rgba(179,136,255,0.2)] hover:border-brand transition">Personnaliser</button>
                            <button id="fd-consent-accept" class="px-4 py-2 rounded-lg brand-gradient text-white glow hover:opacity-90 transition">Tout accepter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById('fd-consent-accept').addEventListener('click', () => {
            const consent = { analytics: true, ads: true, ts: Date.now() };
            saveConsent(consent);
            applyConsent(consent);
            removeBanner();
        });
        document.getElementById('fd-consent-refuse').addEventListener('click', () => {
            const consent = { analytics: false, ads: false, ts: Date.now() };
            saveConsent(consent);
            applyConsent(consent);
            removeBanner();
        });
        document.getElementById('fd-consent-customize').addEventListener('click', openPreferences);
    }

    function removeBanner() {
        const el = document.getElementById('fd-consent-banner');
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function openPreferences() {
        let existing = document.getElementById('fd-consent-modal');
        if (existing) existing.remove();

        const current = readConsent() || { analytics: false, ads: false };

        const modal = document.createElement('div');
        modal.id = 'fd-consent-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60';
        modal.innerHTML = `
            <div class="bg-[#1e1e1e] text-gray-200 border border-[rgba(179,136,255,0.2)] rounded-xl w-[92%] max-w-lg p-6 shadow-2xl">
                <div class="flex items-start justify-between mb-4">
                    <h3 class="text-xl font-bold futuristic-font text-white">Préférences de cookies</h3>
                    <button id="fd-consent-close" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="p-4 bg-[#2d2d2d] rounded-lg border border-[rgba(179,136,255,0.2)]">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-medium text-white">Mesure d'audience (Analytics)</h4>
                                <p class="text-gray-300 text-sm">Nous aide à comprendre l'utilisation du site.</p>
                            </div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input id="fd-toggle-analytics" type="checkbox" class="sr-only">
                                <span class="w-11 h-6 bg-gray-500 rounded-full relative transition">
                                    <span class="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="p-4 bg-[#2d2d2d] rounded-lg border border-[rgba(179,136,255,0.2)]">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-medium text-white">Services tiers (Ads)</h4>
                                <p class="text-gray-300 text-sm">Activation de technologies fournies par des partenaires.</p>
                            </div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input id="fd-toggle-ads" type="checkbox" class="sr-only">
                                <span class="w-11 h-6 bg-gray-500 rounded-full relative transition">
                                    <span class="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button id="fd-consent-save" class="px-4 py-2 rounded-lg brand-gradient text-white glow hover:opacity-90 transition">Enregistrer</button>
                    <button id="fd-consent-decline" class="px-4 py-2 rounded-lg border border-brand text-brand hover:bg-brand hover:text-dark transition">Tout refuser</button>
                    <button id="fd-consent-approve" class="px-4 py-2 rounded-lg bg-[#2d2d2d] text-gray-200 border border-[rgba(179,136,255,0.2)] hover:border-brand transition">Tout accepter</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize toggles
        const analyticsToggle = modal.querySelector('#fd-toggle-analytics');
        const adsToggle = modal.querySelector('#fd-toggle-ads');
        function setToggle(el, on) {
            el.checked = !!on;
            const track = el.nextElementSibling;
            const dot = track.querySelector('.dot');
            track.classList.toggle('bg-brand', !!on);
            track.classList.toggle('bg-gray-500', !on);
            dot.style.transform = on ? 'translateX(20px)' : 'translateX(0)';
        }
        setToggle(analyticsToggle, current.analytics);
        setToggle(adsToggle, current.ads);
        analyticsToggle.addEventListener('change', () => setToggle(analyticsToggle, analyticsToggle.checked));
        adsToggle.addEventListener('change', () => setToggle(adsToggle, adsToggle.checked));

        modal.querySelector('#fd-consent-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#fd-consent-save').addEventListener('click', () => {
            const consent = { analytics: analyticsToggle.checked, ads: adsToggle.checked, ts: Date.now() };
            saveConsent(consent);
            applyConsent(consent);
            modal.remove();
            removeBanner();
        });
        modal.querySelector('#fd-consent-decline').addEventListener('click', () => {
            const consent = { analytics: false, ads: false, ts: Date.now() };
            saveConsent(consent);
            applyConsent(consent);
            modal.remove();
            removeBanner();
        });
        modal.querySelector('#fd-consent-approve').addEventListener('click', () => {
            const consent = { analytics: true, ads: true, ts: Date.now() };
            saveConsent(consent);
            applyConsent(consent);
            modal.remove();
            removeBanner();
        });
    }

    // Public API to reopen preferences
    window.openConsentManager = function () {
        openPreferences();
    };

    // Auto-init
    document.addEventListener('DOMContentLoaded', function () {
        const consent = readConsent();
        if (consent) {
            applyConsent(consent);
        } else {
            createBanner();
        }

        // Footer links with class .manage-cookies open the manager
        document.querySelectorAll('.manage-cookies').forEach(el => {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                openPreferences();
            });
        });
    });
})();


