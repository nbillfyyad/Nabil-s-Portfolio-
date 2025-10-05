/* main.js
   Fungsionalitas:
   - Smooth scroll + highlight nav saat scroll
   - Reveal on scroll (IntersectionObserver)
   - Simple typing effect untuk elemen .js-typing
   - Image parallax / mouse tilt pada .home-img
   - Optional: tombol .btn diberi class pulse saat terlihat
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- konfigurasi singkat ---
    const revealSelector = '.reveal'; // elemen yang akan reveal
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const sections = Array.from(document.querySelectorAll('section[id], .home'));
    const typingEl = document.querySelector('.js-typing'); // optional
    const typingPhrases = typingEl ? (typingEl.dataset.phrases || '').split('|').filter(Boolean) : [];
    const homeImg = document.querySelector('.home-img');

    // --- Smooth scroll for nav links (extra safety) ---
    navLinks.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // update url hash without jumping
                    history.replaceState(null, '', href);
                }
            }
        });
    });

    // --- Highlight active nav on scroll ---
    const navObserverOptions = { root: null, rootMargin: '-30% 0px -50% 0px', threshold: 0 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id || entry.target.dataset.section;
                if (!id) return;
                navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
            }
        });
    }, navObserverOptions);

    sections.forEach(s => {
        // ensure section has id for nav mapping (if .home used, add temporary id)
        if (!s.id) s.dataset.section = (s.classList.contains('home') ? 'home' : '');
        sectionObserver.observe(s);
    });

    // --- Reveal on scroll (staggered) ---
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('is-visible');
                // optional stagger for children
                const children = Array.from(el.querySelectorAll(':scope > *'));
                children.forEach((ch, i) => {
                    ch.style.transitionDelay = `${i * 60}ms`;
                });
                obs.unobserve(el);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    document.querySelectorAll(revealSelector).forEach(el => revealObserver.observe(el));

    // --- Typing effect (simple loop) ---
    if (typingEl && typingPhrases.length) {
        let phraseIndex = 0,
            charIndex = 0,
            deleting = false;
        const speed = { type: 60, delete: 40, pause: 1200 };
        const tick = () => {
            const current = typingPhrases[phraseIndex];
            if (!deleting) {
                charIndex++;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(tick, speed.pause);
                    return;
                }
            } else {
                charIndex--;
                typingEl.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % typingPhrases.length;
                }
            }
            setTimeout(tick, deleting ? speed.delete : speed.type);
        };
        tick();
    }

    // --- Image mouse tilt / parallax (for .home-img) ---
    if (homeImg) {
        homeImg.classList.add('tilt');
        const rect = () => homeImg.getBoundingClientRect();
        homeImg.addEventListener('mousemove', e => {
            const r = rect();
            const cx = r.left + r.width / 2,
                cy = r.top + r.height / 2;
            const dx = (e.clientX - cx) / (r.width / 2); // -1 .. 1
            const dy = (e.clientY - cy) / (r.height / 2);
            const rotateX = (-dy * 6).toFixed(2);
            const rotateY = (dx * 8).toFixed(2);
            homeImg.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
        });
        homeImg.addEventListener('mouseleave', () => {
            homeImg.style.transform = '';
        });
    }

    // --- Make cards lift and be revealed automatically ---
    document.querySelectorAll('.card').forEach(c => {
        c.classList.add('lift', 'reveal');
        revealObserver.observe(c);
    });

    // --- Make project items slide slightly when hovered (optional) ---
    document.querySelectorAll('.project-item').forEach(pi => {
        pi.addEventListener('mouseenter', () => pi.style.transform = 'translateX(6px)');
        pi.addEventListener('mouseleave', () => pi.style.transform = '');
    });

    // --- Optional: pulse primary buttons when visible ---
    const btns = document.querySelectorAll('.btn');
    const btnObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
            if (en.isIntersecting) en.target.classList.add('pulse');
            else en.target.classList.remove('pulse');
        });
    }, { threshold: 0.2 });
    btns.forEach(b => btnObserver.observe(b));

    // --- Accessibility: reduce animations if user prefers reduced motion ---
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
        document.querySelectorAll('*').forEach(el => el.style.transitionDuration = '0s');
    }

}); // DOMContentLoaded end