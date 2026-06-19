(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCategoryJump();
    setupCardFiltering();
    setupSearchPage();
  });

  function setupMobileNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isHidden = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isHidden));
      toggle.textContent = isHidden ? '☰' : '×';
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCategoryJump() {
    var select = document.querySelector('[data-jump-category]');
    if (!select) {
      return;
    }

    select.addEventListener('change', function () {
      if (select.value) {
        window.location.href = select.value;
      }
    });
  }

  function setupCardFiltering() {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var sortSelect = document.querySelector('[data-sort-cards]');
    var countNode = document.querySelector('[data-filter-count]');

    if (yearSelect) {
      var years = cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean).filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort().reverse();

      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var show = matchQuery && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部，共 ' + cards.length + ' 部。';
      }
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return (b.getAttribute('data-year') || '').localeCompare(a.getAttribute('data-year') || '');
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilters();
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
    applyFilters();
  }

  function setupSearchPage() {
    var input = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = '<p class="text-gray-500">输入关键词后显示匹配结果。</p>';
        return;
      }

      var matched = window.SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 80);

      if (!matched.length) {
        results.innerHTML = '<p class="text-gray-500">没有找到匹配影片，请换一个关键词。</p>';
        return;
      }

      results.innerHTML = matched.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="result-copy"><strong>' + escapeHtml(item.title) + '</strong>' +
          '<p>' + escapeHtml(item.meta) + '</p>' +
          '<p>' + escapeHtml(item.oneLine) + '</p></span>' +
          '<span>观看</span>' +
          '</a>';
      }).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
