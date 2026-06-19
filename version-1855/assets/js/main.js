(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = qsa('.hero-dot');
        var prev = qs('.hero-prev');
        var next = qs('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function setupFilters() {
        var list = qs('.filter-list');
        if (!list) {
            return;
        }
        var cards = qsa('.movie-card', list);
        var input = qs('.filter-input');
        var type = qs('.filter-type');
        var year = qs('.filter-year');
        var category = qs('.filter-category');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
        }

        function run() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value : 'all';
            var yearValue = year ? year.value : 'all';
            var categoryValue = category ? category.value : 'all';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) >= 0;
                var okType = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
                var okYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
                var okCategory = categoryValue === 'all' || card.getAttribute('data-category') === categoryValue;
                card.style.display = okKeyword && okType && okYear && okCategory ? '' : 'none';
            });
        }

        [input, type, year, category].forEach(function (node) {
            if (node) {
                node.addEventListener('input', run);
                node.addEventListener('change', run);
            }
        });
        run();
    }

    window.initMoviePlayer = function (videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var started = false;
        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== streamUrl) {
                    video.src = streamUrl;
                }
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hlsReady) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    video._hlsReady = true;
                    video._hls = hls;
                }
                return Promise.resolve();
            }
            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }
            return Promise.resolve();
        }

        function play() {
            attach().then(function () {
                if (cover) {
                    cover.classList.add('hidden');
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            });
            started = true;
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
