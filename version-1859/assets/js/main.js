(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 16) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-cover-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.opacity = '0';
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function setHero(index) {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var search = bar.querySelector('[data-filter-search]');
    var type = bar.querySelector('[data-filter-type]');
    var year = bar.querySelector('[data-filter-year]');
    var list = document.querySelector('[data-filter-list]');
    if (!list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function applyFilter() {
      var q = (search && search.value ? search.value : '').trim().toLowerCase();
      var t = type && type.value ? type.value : '';
      var y = year && year.value ? year.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        card.classList.toggle('hidden-card', !ok);
      });
    }

    [search, type, year].forEach(function (el) {
      if (el) el.addEventListener('input', applyFilter);
      if (el) el.addEventListener('change', applyFilter);
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-video-url]');
    if (!video || !button) return;

    button.addEventListener('click', function () {
      var src = button.getAttribute('data-video-url');
      if (!src) return;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
      shell.classList.add('playing');
    });
  });

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.siteMovieIndex) {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var catSelect = document.querySelector('[data-search-category]');
    var yearSelect = document.querySelector('[data-search-year]');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) input.value = params.get('q');

    function cardHtml(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-frame" href="' + movie.detail + '">',
        '    <img class="card-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover-fallback>',
        '    <span class="poster-shade"></span>',
        '    <span class="play-dot">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <h2><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.categoryName) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderSearch() {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      var type = typeSelect && typeSelect.value ? typeSelect.value : '';
      var cat = catSelect && catSelect.value ? catSelect.value : '';
      var year = yearSelect && yearSelect.value ? yearSelect.value : '';
      var result = window.siteMovieIndex.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.categoryName].join(' ').toLowerCase();
        if (q && text.indexOf(q) === -1) return false;
        if (type && movie.type !== type) return false;
        if (cat && movie.category !== cat) return false;
        if (year && String(movie.year) !== String(year)) return false;
        return true;
      }).slice(0, 120);
      searchResults.innerHTML = result.map(cardHtml).join('');
      searchResults.querySelectorAll('[data-cover-fallback]').forEach(function (img) {
        img.addEventListener('error', function () {
          img.style.opacity = '0';
        }, { once: true });
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch();
      });
    }
    [input, typeSelect, catSelect, yearSelect].forEach(function (el) {
      if (el) el.addEventListener('input', renderSearch);
      if (el) el.addEventListener('change', renderSearch);
    });
    renderSearch();
  }
})();
