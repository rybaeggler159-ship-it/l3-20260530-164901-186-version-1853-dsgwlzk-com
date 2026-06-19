import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-source');
    var hasStarted = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startPlayback() {
      if (!video || !source) {
        setStatus('当前页面未找到可用播放源。');
        return;
      }

      player.classList.add('is-playing');

      if (hasStarted) {
        video.play().catch(function () {
          setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
        });
        return;
      }

      hasStarted = true;
      setStatus('正在加载高清播放源...');

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成。');
          video.play().catch(function () {
            setStatus('请点击播放器中的播放按钮开始观看。');
          });
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载异常，正在尝试恢复。');
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源加载完成。');
          video.play().catch(function () {
            setStatus('请点击播放器中的播放按钮开始观看。');
          });
        }, { once: true });
      } else {
        video.src = source;
        setStatus('当前浏览器不完全支持 HLS，请使用新版 Chrome、Edge、Safari 或 Firefox。');
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!hasStarted) {
          startPlayback();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPlayers);
} else {
  setupPlayers();
}
