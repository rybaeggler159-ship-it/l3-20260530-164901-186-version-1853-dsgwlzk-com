(function () {
  var video = document.querySelector('[data-player-video]');
  var box = document.querySelector('[data-player-box]');
  var overlay = document.querySelector('[data-player-overlay]');
  var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
  var videoUrl = window.__MOVIE_VIDEO_URL || '';
  var hls = null;

  if (!video || !videoUrl) {
    return;
  }

  function preparePlayer() {
    if (video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }

    video.setAttribute('data-ready', 'true');
  }

  function beginPlayback(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    preparePlayer();
    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  startButtons.forEach(function (button) {
    button.addEventListener('click', beginPlayback);
  });

  if (box) {
    box.addEventListener('click', function (event) {
      if (event.target.closest('button')) {
        return;
      }

      if (video.paused) {
        beginPlayback(event);
      }
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
