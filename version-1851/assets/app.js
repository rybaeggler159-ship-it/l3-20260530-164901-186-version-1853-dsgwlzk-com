(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    show(0);
    restart();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector(".filter-input");
    var year = document.querySelector(".filter-year");
    var sort = document.querySelector(".filter-sort");
    var grid = document.querySelector(".movie-grid");
    var empty = document.querySelector(".empty-tip");
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var match = matchQuery && matchYear;
        card.classList.toggle("hidden-by-filter", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    function applySort() {
      if (!sort || !grid) {
        apply();
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice();
      if (mode === "newest") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }
      if (mode === "score") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", applySort);
    }
    applySort();
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var cover = document.getElementById("movie-cover");
      if (!video || !cover || !sourceUrl) {
        return;
      }
      var started = false;
      function attachSource() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }
      function play() {
        attachSource();
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
