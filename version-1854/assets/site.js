(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    function onScroll() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && mobilePanel) {
        toggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var carousels = document.querySelectorAll('[data-carousel]');
    carousels.forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.slide-dots button'));
        var index = 0;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        show(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    });

    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var genre = panel.querySelector('[data-filter-genre]');
        var year = panel.querySelector('[data-filter-year]');
        var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('.empty-state');

        function testCard(card) {
            var q = input ? input.value.trim().toLowerCase() : '';
            var g = genre ? genre.value.trim().toLowerCase() : '';
            var y = year ? year.value.trim().toLowerCase() : '';
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || ''
            ].join(' ');
            var passQ = !q || text.indexOf(q) !== -1;
            var passG = !g || text.indexOf(g) !== -1;
            var passY = !y || text.indexOf(y) !== -1;
            return passQ && passG && passY;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var pass = testCard(card);
                card.style.display = pass ? '' : 'none';
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, genre, year].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        apply();
    });

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('.player-start');
        var stream = player.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded || !video || !stream) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function start() {
            attach();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            video.controls = true;
            var playAction = video.play();
            if (playAction && playAction.catch) {
                playAction.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (layer && video) {
            layer.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
}());
