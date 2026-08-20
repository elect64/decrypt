/* ==========================================================================
   DECRYPT CONTENT SETTINGS
   Place all editable content here.
   ========================================================================== */
const decryptConfig = {
    contact: {
        instagram: "[ADD INSTAGRAM URL]",
        facebook: "https://www.facebook.com/share/19V4zN4ikG/",
        whatsapp: "https://wa.link/llj78c",
        linkedin: "https://www.linkedin.com/company/decrypt144/",
        email: "[ADD EMAIL]"
    },
    cta: {
        join: "[https://chat.whatsapp.com/Lu3FOJ4U4ZwF5dcnUwbVQL]",
        attend: "[ADD ATTEND URL]",
        partner: "https://chat.whatsapp.com/LPzVlXnTBMDDRx8bTcFmE0",
        volunteer: "https://chat.whatsapp.com/LPzVlXnTBMDDRx8bTcFmE0"
    },
    ecosystem: [
        { title: "COMMUNITY MEETUPS", desc: "Small rooms. Big conversations. People worth meeting." },
        { title: "CONFERENCES", desc: "The flagship DECRYPT experience." },
        { title: "BOOTCAMPS", desc: "Practical knowledge. Real skills." },
        { title: "CREATIVE CHALLENGES", desc: "Build. Experiment. Create." },
        { title: "PUBLICATIONS", desc: "Ideas worth sharing." }
    ],
    conferenceProgram: [
        { day: "DAY 01", topic: "LEADERSHIP", desc: "" },
        { day: "DAY 02", topic: "ENTREPRENEURSHIP", desc: "" },
        { day: "DAY 03", topic: "GRAPHIC DESIGN", desc: "Creativity with Your Phone" },
        { day: "DAY 04", topic: "FOREX", desc: "Forex Fundamentals: Trading Smart, Trading Profitably" },
        { day: "DAY 05", topic: "ARTIFICIAL INTELLIGENCE", desc: "A Beginner's Guide to AI: Supercharging Creativity" },
        { day: "DAY 06", topic: "VIDEO EDITING", desc: "Mastering Basic Video Editing Principles" },
        { day: "DAY 07", topic: "CYBERSECURITY", desc: "Cybersecurity Decoded: Staying Safe in a Digital World" }
    ],
    speakers: [
        { name: "Mr. Ezirim Kingdom", topic: "Cybersecurity", image: "assets/speakers/ezirim-kingdom.jpg" },
        { name: "Mr. Emeka Okoro", topic: "Artificial Intelligence", image: "assets/speakers/emeka-okoro.jpg" },
        { name: "Victoria Chisom", topic: "Leadership", image: "assets/speakers/victoria-chisom.jpg" }
    ],
    archiveImages: [
        { src: "assets/archive/event-1.jpg", category: "EVENT", size: "large" },
        { src: "assets/archive/speaker-1.jpg", category: "SPEAKERS", size: "normal" },
        { src: "assets/archive/creative-1.jpg", category: "CREATIVE", size: "small" },
        { src: "assets/archive/bts-1.jpg", category: "BEHIND THE SCENES", size: "normal" },
        { src: "assets/archive/session-1.jpg", category: "SESSIONS", size: "large" }
    ],
    testimonials: [
        { quote: "[ADD TESTIMONIAL]", name: "[ATTENDEE NAME]", role: "Participant, DECRYPT 1.0" },
        { quote: "[ADD TESTIMONIAL]", name: "[SPEAKER NAME]", role: "Speaker, DECRYPT 1.0" }
    ]
};


/* ==========================================================================
   INITIALIZATION & DOM ELEMENTS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // Set Current Year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Render Content from Config
    renderContent();
    
    // Initialize Systems
    initLoader();
    initCustomCursor();
    initScrollAnimations();
    initMobileMenu();
    initArchiveCarousel();
    initArchiveViewer();
});


/* ==========================================================================
   CONTENT RENDERING ENGINE
   ========================================================================== */
function renderContent() {
    // 1. Ecosystem
    const ecoContainer = document.getElementById('ecosystem-container');
    if(ecoContainer) {
        let ecoHTML = '';
        decryptConfig.ecosystem.forEach((item, index) => {
            const num = String(index + 1).padStart(2, '0');
            ecoHTML += `
                <div class="eco-item reveal-up" style="transition-delay: ${index * 0.1}s">
                    <div class="eco-num">${num}</div>
                    <div class="eco-title">${item.title}</div>
                    <div class="eco-desc">${item.desc}</div>
                </div>
            `;
        });
        ecoContainer.innerHTML = ecoHTML;
    }

    // 2. Timeline
    const timelineContainer = document.getElementById('timeline-container');
    if(timelineContainer) {
        let tlHTML = '';
        decryptConfig.conferenceProgram.forEach((item, index) => {
            tlHTML += `
                <div class="timeline-item reveal-up" style="transition-delay: ${index * 0.05}s">
                    <div class="tl-day">${item.day}</div>
                    <div class="tl-topic">${item.topic}</div>
                    <div class="tl-desc">${item.desc}</div>
                </div>
            `;
        });
        timelineContainer.innerHTML = tlHTML;
    }

    // 3. Speakers
    const speakersContainer = document.getElementById('speakers-container');
    if(speakersContainer) {
        let spHTML = '';
        decryptConfig.speakers.forEach((speaker, index) => {
            spHTML += `
                <div class="speaker-card reveal-up" style="transition-delay: ${index * 0.1}s">
                    <div class="speaker-img-wrapper">
                        <!-- Fallback background if image fails -->
                        <img src="${speaker.image}" alt="${speaker.name}" class="speaker-img" onerror="this.style.display='none'">
                    </div>
                    <h4 class="speaker-name">${speaker.name}</h4>
                    <p class="speaker-topic">${speaker.topic}</p>
                </div>
            `;
        });
        speakersContainer.innerHTML = spHTML;
    }

    // 4. Archive Carousel
    const archiveContainer = document.getElementById('archive-carousel');
    if(archiveContainer) {
        let arHTML = '';
        decryptConfig.archiveImages.forEach((img) => {
            arHTML += `
                <div class="archive-item ${img.size}" data-src="${img.src}">
                    <img src="${img.src}" alt="${img.category}" onerror="this.style.display='none'">
                    <div class="archive-meta">${img.category}</div>
                </div>
            `;
        });
        archiveContainer.innerHTML = arHTML;
    }

    // 5. Testimonials
    const testContainer = document.getElementById('testimonials-container');
    if(testContainer) {
        let testHTML = '<div class="grid">';
        decryptConfig.testimonials.forEach((test, index) => {
            testHTML += `
                <div class="testimonial-card reveal-up" style="transition-delay: ${index * 0.1}s">
                    <p class="test-quote">"${test.quote}"</p>
                    <p class="test-author">${test.name}</p>
                    <p class="test-role">${test.role}</p>
                </div>
            `;
        });
        testHTML += '</div>';
        testContainer.innerHTML = testHTML;
    }

    // 6. Contact & Social Links
    const socialLinks = document.getElementById('social-links');
    const contactLinks = document.getElementById('contact-links');
    
    if(socialLinks) {
        socialLinks.innerHTML = `
            <li><a href="https://www.instagram.com/officialdecrypt_?igsh=dGdjZDdlODBmZTl2" target="" rel="noopener">Instagram</a></li>
            <li><a href="https://www.linkedin.com/company/decrypt144/" target="" rel="noopener">LinkedIn</a></li>
            <li><a href="https://www.facebook.com/share/19V4zN4ikG/" target="" rel="noopener">Facebook</a></li>
        `;
    }
    
    if(contactLinks) {
        contactLinks.innerHTML = `
            <li><a href="mailto:teamdecryptinfo@gmail.com}">Email Us</a></li>
            <li><a href="https://wa.link/llj78c" target="" rel="noopener">WhatsApp</a></li>
        `;
    }

    // 7. CTAs
    const ctaContainer = document.getElementById('cta-container');
    if(ctaContainer) {
        ctaContainer.innerHTML = `
            <a href="${decryptConfig.cta.join}" class="btn-primary">JOIN DECRYPT</a>
            <a href="${decryptConfig.cta.attend}" class="btn-secondary">ATTEND EVENTS</a>
            <a href="${decryptConfig.cta.partner}">PARTNER WITH US</a>
        `;
    }
}


/* ==========================================================================
   SYSTEMS & INTERACTIONS
   ========================================================================== */

// Loader Sequence
function initLoader() {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 800);
    }, 1200);
}

// Custom Cursor (Desktop Only)
function initCustomCursor() {
    // Check if touch device
    if(window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.getElementById('cursor');
    const cursorText = cursor.querySelector('.cursor-text');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth follow loop
    function renderCursor() {
        // Linear interpolation for smoothness
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover logic
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-view');
            cursorText.textContent = 'VIEW';
        });
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-view');
            cursorText.textContent = '';
        });
    });
}

// Scroll Reveal Animations & Sticky Nav
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-text');
    const navbar = document.getElementById('navbar');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    reveals.forEach(reveal => observer.observe(reveal));

    // Nav Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const links = document.querySelectorAll('.mobile-links a');

    if(!menuBtn || !mobileMenu) return;

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Prevent body scroll when open
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    menuBtn.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}

// Archive Carousel Drag/Swipe logic
function initArchiveCarousel() {
    const slider = document.getElementById('archive-carousel');
    const prevBtn = document.getElementById('prev-archive');
    const nextBtn = document.getElementById('next-archive');
    
    if(!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse drag events
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast factor
        slider.scrollLeft = scrollLeft - walk;
    });

    // Button controls
    const scrollAmount = window.innerWidth * 0.4; // 40vw
    
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
}

// Fullscreen Image Viewer
function initArchiveViewer() {
    const viewer = document.getElementById('image-viewer');
    const viewerImg = document.getElementById('viewer-image');
    const closeBtn = document.querySelector('.viewer-close');
    const prevBtn = document.querySelector('.viewer-prev');
    const nextBtn = document.querySelector('.viewer-next');
    const currentSpan = document.getElementById('viewer-current');
    const totalSpan = document.getElementById('viewer-total');
    
    if(!viewer || !viewerImg) return;

    let currentIndex = 0;
    const images = decryptConfig.archiveImages;

    totalSpan.textContent = images.length;

    // Open viewer
    document.querySelectorAll('.archive-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            // Prevent opening if dragged
            currentIndex = index;
            openViewer();
        });
    });

    function openViewer() {
        viewerImg.src = images[currentIndex].src;
        currentSpan.textContent = currentIndex + 1;
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeViewer() {
        viewer.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { viewerImg.src = ''; }, 400); // clear after fade
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        openViewer();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        openViewer();
    }

    closeBtn.addEventListener('click', closeViewer);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if(!viewer.classList.contains('active')) return;
        if(e.key === 'Escape') closeViewer();
        if(e.key === 'ArrowRight') showNext();
        if(e.key === 'ArrowLeft') showPrev();
    });
}