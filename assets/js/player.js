(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function attach(video, src, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      done();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        done();
      } else {
        video.src = src;
        done();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var cover = wrap.querySelector('.play-cover');
    var src = wrap.getAttribute('data-stream');
    var ready = false;

    function play() {
      if (!video || !src) {
        return;
      }

      if (cover) {
        cover.classList.add('hidden');
      }

      if (ready) {
        video.play();
        return;
      }

      attach(video, src, function () {
        ready = true;
        video.play();
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });
})();
