/* ===================================================
   OLF Historical Documentary — script.js
   =================================================== */

'use strict';

// ===================================================
// NAV — scroll behavior + hamburger
// ===================================================
const navbar  = document.getElementById('navbar');
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===================================================
// PARALLAX HERO
// ===================================================
const heroParallax = document.querySelector('.hero-parallax');

function updateParallax() {
  if (!heroParallax) return;
  const scrollY = window.scrollY;
  heroParallax.style.transform = `translateY(${scrollY * 0.4}px)`;
}

window.addEventListener('scroll', updateParallax, { passive: true });

// ===================================================
// INTERSECTION OBSERVER — reveal animations
// ===================================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Stagger siblings in same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const siblingIndex = siblings.indexOf(entry.target);
      const delay = Math.min(siblingIndex * 80, 400);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===================================================
// REGION BARS — animate on reveal
// ===================================================
const barFills = document.querySelectorAll('.bar-fill');

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const targetWidth = fill.dataset.width || 0;
      fill.style.width = targetWidth + '%';
      barObserver.unobserve(fill);
    }
  });
}, { threshold: 0.3 });

barFills.forEach(bar => barObserver.observe(bar));

// ===================================================
// TIMELINE — alternating reveal
// ===================================================
const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

timelineItems.forEach(item => {
  // Add base reveal styles inline so the observer can manage them
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  timelineObserver.observe(item);
});

// Patch the visible class for timeline items
const timelineStyle = document.createElement('style');
timelineStyle.textContent = `.timeline-item.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(timelineStyle);

// ===================================================
// LIGHTBOX
// ===================================================
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightbox-img');
const lightboxCap  = document.getElementById('lightbox-caption');
const lbClose      = document.querySelector('.lightbox-close');
const lbPrev       = document.querySelector('.lightbox-prev');
const lbNext       = document.querySelector('.lightbox-next');

let currentGalleryIndex = 0;

function openLightbox(index) {
  currentGalleryIndex = index;
  const item    = galleryItems[index];
  const img     = item.querySelector('img');
  const caption = item.dataset.caption || '';

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function showPrev() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentGalleryIndex);
}

function showNext() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
  openLightbox(currentGalleryIndex);
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lbClose?.addEventListener('click', closeLightbox);
lbPrev?.addEventListener('click', showPrev);
lbNext?.addEventListener('click', showNext);

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showPrev();
  if (e.key === 'ArrowRight')  showNext();
});

// ===================================================
// SMOOTH NAV ACTIVE STATES
// ===================================================
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--green-light)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => navObserver.observe(section));

// ===================================================
// LAZY LOADING IMAGES (native + polyfill fallback)
// ===================================================
function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported — images handle themselves
    return;
  }

  // Fallback with IntersectionObserver
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => imgObserver.observe(img));
}

lazyLoadImages();

// ===================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

// ===================================================
// COUNTER ANIMATION for stat cards
// ===================================================
function animateCounter(element, target, suffix = '') {
  const isYear = target.toString().length === 4;
  const duration  = 1500;
  const start     = performance.now();
  const startValue = isYear ? target - 30 : 0;

  function update(timestamp) {
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = Math.floor(startValue + (target - startValue) * ease);
    element.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else element.textContent = isYear ? target : target.toLocaleString() + suffix;
  }

  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.stat-number');
      if (!numEl) return;
      const raw = numEl.textContent.trim();
      const suffix = raw.replace(/[\d,]/g, '').replace('+', '');
      const num = parseInt(raw.replace(/[^0-9]/g, ''));
      const hasPlusSign = raw.includes('+');
      if (!isNaN(num)) animateCounter(numEl, num, hasPlusSign ? '+' : suffix);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));

// ===================================================
// CURSOR GLOW (desktop only)
// ===================================================
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(82,183,136,0.07) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 9999;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// ===================================================
// PAGE LOAD TRANSITION
// ===================================================
const pageLoader = document.createElement('div');
pageLoader.style.cssText = `
  position: fixed;
  inset: 0;
  background: var(--black, #0a0a0a);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease, transform 0.6s ease;
`;
pageLoader.innerHTML = `
  <div style="text-align: center;">
    <div style="font-family: 'Space Mono', monospace; font-size: 2rem; font-weight: 700; color: #e63946; letter-spacing: 0.3em; margin-bottom: 0.5rem;">OLF</div>
    <div style="font-family: 'Space Mono', monospace; font-size: 0.6rem; letter-spacing: 0.3em; color: #5a5550; text-transform: uppercase;">Loading Historical Archive...</div>
    <div style="width: 120px; height: 2px; background: #1c1c1c; margin: 1.5rem auto 0; border-radius: 2px; overflow: hidden;">
      <div id="loader-bar" style="height: 100%; width: 0; background: linear-gradient(90deg, #2d6a4f, #52b788); border-radius: 2px; transition: width 0.4s ease;"></div>
    </div>
  </div>
`;
document.body.prepend(pageLoader);

let loadProgress = 0;
const loaderBar = document.getElementById('loader-bar');

const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 25;
  if (loaderBar) loaderBar.style.width = Math.min(loadProgress, 90) + '%';
  if (loadProgress >= 90) clearInterval(loadInterval);
}, 200);

window.addEventListener('load', () => {
  clearInterval(loadInterval);
  if (loaderBar) loaderBar.style.width = '100%';
  setTimeout(() => {
    pageLoader.style.opacity = '0';
    pageLoader.style.transform = 'scale(1.02)';
    setTimeout(() => pageLoader.remove(), 600);
  }, 400);
});

// ===================================================
// SECTION ENTRANCE — number counter lines
// ===================================================
document.querySelectorAll('.section-rule').forEach(rule => {
  rule.style.width = '0px';
  rule.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  const ruleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '60px';
        ruleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  ruleObserver.observe(rule);
});

// ===================================================
// CARD TILT EFFECT (subtle, desktop)
// ===================================================
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.info-card, .leader-card, .date-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===================================================
// VIDEO PLACEHOLDERS — show overlay prompt
// ===================================================
document.querySelectorAll('.video-responsive iframe').forEach(iframe => {
  const src = iframe.getAttribute('src');
  if (src && src.includes('placeholder')) {
    const parent = iframe.closest('.video-wrap');
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #111 0%, #1a4d2e 100%);
      color: #9a9085;
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-align: center;
      padding: 2rem;
      z-index: 1;
    `;
    overlay.innerHTML = `
      <div style="font-size: 2.5rem; opacity: 0.4;">▶</div>
      <div style="color: #e8e0d4; font-size: 0.8rem;">VIDEO PLACEHOLDER</div>
      <div style="opacity: 0.6;">Replace iframe src with actual YouTube URL<br/>to embed documentary content.</div>
    `;
    iframe.parentElement.style.position = 'relative';
    iframe.parentElement.appendChild(overlay);
  }
});

console.log('%cOLF Documentary Website', 'color: #52b788; font-family: monospace; font-size: 1.2rem; font-weight: bold;');
console.log('%cHistorical & Educational Resource — For academic use only', 'color: #9a9085; font-family: monospace;');
