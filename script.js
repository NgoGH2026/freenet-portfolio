// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

// ===== DARK MODE TOGGLE =====
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateThemeColor(theme);
  updateIcon();

  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateThemeColor(theme);
    updateIcon();
  });

  function updateIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  function updateThemeColor(t) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0d1117' : '#00B295');
  }
})();

// ===== MOBILE MENU =====
(function() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.innerHTML = isOpen
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    });
  });
})();

// ===== NAV SCROLL EFFECT =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 32);
}, { passive: true });

// ===== ANIMATED COUNTER =====
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    const target = parseInt(counter.dataset.count);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      counter.textContent = current.toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(update);
    }

    counter.dataset.animated = 'true';
    requestAnimationFrame(update);
  });
}

const heroObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObs.observe(heroStats);

// ===== SEGMENT TABS =====
const segTabs = document.querySelectorAll('.seg-tab');
const segPanels = document.querySelectorAll('.seg-panel');

segTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    segTabs.forEach(t => t.classList.remove('active'));
    segPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panelId = 'seg-' + tab.dataset.seg;
    document.getElementById(panelId).classList.add('active');
  });
});

// ===== PORTFOLIO CARD TOGGLES =====
document.querySelectorAll('.port-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const details = btn.parentElement.querySelector('.port-details');
    const isOpen = details.classList.contains('open');
    details.classList.toggle('open');
    btn.setAttribute('aria-expanded', !isOpen);
    btn.querySelector('svg').style.transform = isOpen ? '' : 'rotate(180deg)';
    const text = btn.childNodes[0];
    text.textContent = isOpen ? 'Details anzeigen ' : 'Details ausblenden ';
  });
});

// ===== DONUT CHART =====
function drawDonutChart() {
  const canvas = document.getElementById('marketCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(240, window.innerWidth - 80);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const data = [
    { value: 30.6, color: '#00506e', label: 'Telekom' },
    { value: 27.4, color: '#e60000', label: 'Telefónica' },
    { value: 24.1, color: '#4a90d9', label: 'Vodafone' },
    { value: 8.5, color: '#555555', label: '1&1' },
    { value: 8.0, color: '#00B295', label: 'freenet' },
    { value: 1.4, color: '#999999', label: 'Sonstige' }
  ];

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.27;
  let startAngle = -Math.PI / 2;

  data.forEach(seg => {
    const sliceAngle = (seg.value / 100) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    startAngle = endAngle;
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  ctx.fillStyle = isDark ? '#e6edf3' : '#1a2744';
  ctx.font = '800 ' + (size * 0.1) + 'px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('8,0%', cx, cy - size * 0.03);
  ctx.fillStyle = isDark ? '#8b949e' : '#5a6b7a';
  ctx.font = '500 ' + (size * 0.046) + 'px Inter, sans-serif';
  ctx.fillText('freenet', cx, cy + size * 0.06);
}

drawDonutChart();
window.addEventListener('resize', drawDonutChart);

const observer = new MutationObserver(() => drawDonutChart());
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.org-card, .port-card, .kpi-card, .seg-kpi');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObs.observe(el);
});

// ===== BAR CHART ANIMATION =====
const barFills = document.querySelectorAll('.chart-bar-fill');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const targetWidth = fill.style.width;
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = targetWidth;
        });
      });
      barObs.unobserve(fill);
    }
  });
}, { threshold: 0.2 });

barFills.forEach(fill => barObs.observe(fill));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
