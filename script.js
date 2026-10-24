document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Copyright Year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Scroll Progress Indicator & Navbar Elevation
    const scrollProgress = document.getElementById('scroll-progress');
    const navbar = document.getElementById('navbar');

    const updateScrollUI = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }

        if (navbar) {
            navbar.classList.toggle('shadow-2xl', scrollTop > 24);
            navbar.classList.toggle('border-slate-700/80', scrollTop > 24);
        }
    };

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    // 3. Accessible Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const setMenuState = (isOpen) => {
        if (!mobileMenu || !menuBtn) return;
        mobileMenu.classList.toggle('hidden', !isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        if (menuIcon) {
            menuIcon.className = isOpen ? 'ph ph-x text-2xl' : 'ph ph-list text-2xl';
        }
    };

    menuBtn?.addEventListener('click', () => {
        const isCurrentlyOpen = menuBtn.getAttribute('aria-expanded') === 'true';
        setMenuState(!isCurrentlyOpen);
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenuState(false);
    });

    // 4. Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Active Navigation Section Scroll-Spy
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
                });
            }
        });
    }, {
        rootMargin: '-35% 0px -55% 0px'
    });

    sections.forEach(sec => sectionObserver.observe(sec));

    // 6. Cursor-Tracked Spotlight Cards
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 7. Interactive Portfolio Filtering (All / Shopify / WordPress / Custom)
    const filterButtons = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button styles
            filterButtons.forEach(b => {
                const isActive = b === btn;
                b.classList.toggle('bg-brand-500', isActive);
                b.classList.toggle('text-slate-950', isActive);
                b.classList.toggle('border-brand-500', isActive);
                b.classList.toggle('font-bold', isActive);
                b.classList.toggle('bg-surface-950', !isActive);
                b.classList.toggle('text-slate-400', !isActive);
                b.classList.toggle('border-slate-800', !isActive);
            });

            // Filter cards
            projectCards.forEach(card => {
                const category = card.dataset.category;
                const matches = filter === 'all' || category === filter;
                card.classList.toggle('hidden-card', !matches);
            });
        });
    });

    // 8. Interactive Services Selection in Contact Section
    const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
    const serviceCountBadge = document.getElementById('service-count-badge');
    const serviceError = document.getElementById('service-error');
    const serviceTriggers = document.querySelectorAll('.service-trigger');

    const updateServiceCount = () => {
        const checkedCount = Array.from(serviceCheckboxes).filter(cb => cb.checked).length;
        if (serviceCountBadge) {
            serviceCountBadge.textContent = `${checkedCount} selected`;
        }
        if (checkedCount > 0 && serviceError) {
            serviceError.classList.add('hidden');
        }
    };

    serviceCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateServiceCount);
    });

    // Clicking "Select [Service]" on any Service or Project card selects it in the form & scrolls down
    serviceTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetService = trigger.dataset.selectService;
            if (targetService) {
                serviceCheckboxes.forEach(cb => {
                    if (cb.value === targetService) {
                        cb.checked = true;
                    }
                });
                updateServiceCount();
            }

            const contactSection = document.getElementById('contact');
            contactSection?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                document.getElementById('name')?.focus({ preventScroll: true });
            }, 650);
        });
    });

    // 9. Contact Form Submission & Project Brief Generator
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedServices = Array.from(serviceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (selectedServices.length === 0) {
            serviceError?.classList.remove('hidden');
            return;
        }

        const formData = new FormData(contactForm);
        const clientName = formData.get('name')?.toString().trim();
        const clientEmail = formData.get('email')?.toString().trim();
        const platform = formData.get('platform')?.toString();
        const message = formData.get('message')?.toString().trim();

        if (!clientName || !clientEmail || !message) {
            contactForm.reportValidity();
            return;
        }

        if (formFeedback) {
            formFeedback.classList.remove('hidden');
            formFeedback.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p class="font-bold text-emerald-300">Thank you, ${clientName}! Your project brief is ready.</p>
                        <p class="text-xs text-slate-300 mt-1">
                            <strong>Selected Services:</strong> ${selectedServices.join(', ')} &bull; <strong>Platform:</strong> ${platform}
                        </p>
                    </div>
                    <a href="https://linkedin.com/in/zullqernainhaider" target="_blank" rel="noopener noreferrer" class="shrink-0 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors text-center">
                        Message on LinkedIn &rarr;
                    </a>
                </div>
            `;
        }

        contactForm.reset();
        // Keep the first service checked by default after reset
        if (serviceCheckboxes[0]) serviceCheckboxes[0].checked = true;
        updateServiceCount();
    });
});