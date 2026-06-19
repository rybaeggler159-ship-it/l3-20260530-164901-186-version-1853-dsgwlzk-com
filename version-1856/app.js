(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });
    show(0);
    window.setInterval(function() {
      show(active + 1);
    }, 5200);
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function(panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-year-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var scope = panel.parentElement;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty]");
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var shown = 0;
        cards.forEach(function(card) {
          var hay = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-type") || ""
          ].join(" ").toLowerCase();
          var ok = (!q || hay.indexOf(q) !== -1) &&
            (!y || card.getAttribute("data-year") === y) &&
            (!t || card.getAttribute("data-type") === t);
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }
      [input, year, type].forEach(function(el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function startVideo(shell) {
    var video = shell.querySelector("video");
    var trigger = shell.querySelector("[data-video]");
    if (!video || !trigger) {
      return;
    }
    var url = trigger.getAttribute("data-video");
    trigger.classList.add("hidden");
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(function() {});
      return;
    }
    if (window.Hls) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      return;
    }
    video.src = url;
    video.play().catch(function() {});
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function(shell) {
      var trigger = shell.querySelector("[data-video]");
      var video = shell.querySelector("video");
      if (trigger) {
        trigger.addEventListener("click", function() {
          startVideo(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function() {
          if (!video.getAttribute("src")) {
            startVideo(shell);
          }
        });
      }
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
