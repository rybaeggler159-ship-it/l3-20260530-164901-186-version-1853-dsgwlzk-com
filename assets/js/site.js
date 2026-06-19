(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  showSlide(0);

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-keywords') || card.textContent);
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchRegion = !region || card.getAttribute('data-region') === region;
      var matchType = !type || card.getAttribute('data-type') === type;
      var show = matchKeyword && matchYear && matchRegion && matchType;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  [filterInput, yearSelect, regionSelect, typeSelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', runFilter);
      el.addEventListener('change', runFilter);
    }
  });

  runFilter();
})();
