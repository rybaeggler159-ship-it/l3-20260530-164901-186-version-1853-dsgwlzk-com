(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-nav-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var results = document.querySelector('[data-search-results]');

  if (results && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    function movieCard(movie) {
      var titleText = escapeHtml(movie.title);
      var oneLineText = escapeHtml(movie.oneLine);
      var yearText = escapeHtml(movie.year);
      var regionText = escapeHtml(movie.region);
      var typeText = escapeHtml(movie.type);
      var fileUrl = escapeHtml(movie.file);
      var coverUrl = escapeHtml(movie.cover);

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + fileUrl + '" aria-label="观看' + titleText + '">',
        '    <img src="' + coverUrl + '" alt="' + titleText + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + fileUrl + '">' + titleText + '</a></h3>',
        '    <p>' + oneLineText + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + yearText + '</span>',
        '      <span>' + regionText + '</span>',
        '      <span>' + typeText + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    var matched = window.MOVIE_INDEX;

    if (query) {
      var keyword = normalize(query);
      matched = window.MOVIE_INDEX.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags).indexOf(keyword) !== -1;
      });
    }

    if (title) {
      title.textContent = query ? '搜索结果：' + query : '热门影片';
    }

    results.innerHTML = matched.slice(0, 96).map(movieCard).join('') || '<p class="empty-state">未找到匹配影片。</p>';
  }
})();
