
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.player-card'));
    cards.forEach(function (card) {
      var video = card.querySelector('video');
      var button = card.querySelector('.play-overlay');
      var url = card.getAttribute('data-url');
      var started = false;
      var hls = null;

      function bind() {
        if (started || !video || !url) {
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function begin() {
        bind();
        card.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            card.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', begin);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            begin();
          }
        });
        video.addEventListener('ended', function () {
          card.classList.remove('is-playing');
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
