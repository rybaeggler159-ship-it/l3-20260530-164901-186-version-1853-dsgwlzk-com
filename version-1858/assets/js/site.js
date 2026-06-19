
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    play();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-category')
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var input = document.querySelector('.filter-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .wide-card'));
    if (!input || !cards.length) {
      return;
    }
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var empty = document.querySelector('.empty-state');
    var query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      input.value = query;
    }

    function valueMatches(card, name, value) {
      if (!value || value.indexOf('全部') === 0) {
        return true;
      }
      var data = card.getAttribute('data-' + name) || '';
      return data.indexOf(value) !== -1;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var ok = !keyword || textOf(card).indexOf(keyword) !== -1;
        selects.forEach(function (select) {
          var filterName = select.getAttribute('data-filter');
          if (filterName && !valueMatches(card, filterName, select.value)) {
            ok = false;
          }
        });
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    input.addEventListener('input', apply);
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
