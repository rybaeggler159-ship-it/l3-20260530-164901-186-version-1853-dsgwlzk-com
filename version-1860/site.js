(function () {
  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const searchInputs = Array.from(document.querySelectorAll('[data-filter-input]'));

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('show');
      menuBtn.setAttribute('aria-expanded', mobileNav.classList.contains('show') ? 'true' : 'false');
    });
  }

  searchInputs.forEach((input) => {
    const targetSelector = input.getAttribute('data-filter-input');
    const cards = Array.from(document.querySelectorAll(targetSelector));
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('hidden', term && !text.includes(term));
      });
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    const show = (idx) => {
      active = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    };
    dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
    show(0);
    window.setInterval(() => show(active + 1), 5200);
  }

  const player = document.querySelector('[data-player]');
  if (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play-overlay]');
    const tabs = Array.from(document.querySelectorAll('[data-source-tab]'));
    let hls = null;

    function destroyHls() {
      if (hls) {
        try { hls.destroy(); } catch (err) {}
        hls = null;
      }
    }

    function loadSource(src) {
      if (!video || !src) return;
      destroyHls();
      const canNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (window.Hls && !canNative) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      tabs.forEach((tab) => tab.classList.toggle('active', tab.getAttribute('data-source-url') === src));
      if (overlay) overlay.classList.remove('hidden');
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => loadSource(tab.getAttribute('data-source-url')));
    });

    const first = video.getAttribute('data-src');
    if (first) loadSource(first);

    if (overlay && video) {
      overlay.addEventListener('click', async () => {
        overlay.classList.add('hidden');
        try {
          await video.play();
        } catch (err) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }
})();
