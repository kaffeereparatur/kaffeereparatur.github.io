
  (function() {
    // 1. Smart Auto-Hiding / Showing Sticky Navigation Header
    var header = document.querySelector('.top');
    if (header) {
      var lastY = window.pageYOffset || document.documentElement.scrollTop;
      var ticking = false;

      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            var currentY = window.pageYOffset || document.documentElement.scrollTop;
            if (currentY > 60) {
              header.classList.add('nav-scrolled');
              if (currentY > lastY + 8 && currentY > 150) {
                // Scrolling down -> hide menu
                header.classList.add('nav-hidden');
              } else if (currentY < lastY - 6) {
                // Scrolling up -> show menu smoothly
                header.classList.remove('nav-hidden');
              }
            } else {
              header.classList.remove('nav-scrolled');
              header.classList.remove('nav-hidden');
            }
            lastY = currentY;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    // 2. Instant Search Autocomplete
    var indexData = [];
    var qInput = document.getElementById('q');
    var qres = document.getElementById('qres');

    if (!qInput || !qres) return;

    fetch('https://kaffeereparatur.github.io/search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { indexData = d; })
      .catch(function(e) { console.error('Search load error:', e); });

    function performSearch() {
      var q = qInput.value.trim().toLowerCase();
      if (!q) {
        qres.hidden = true;
        qres.innerHTML = '';
        return;
      }

      var terms = q.split(/\s+/);
      var matches = indexData.filter(function(item) {
        var hay = (item.title + ' ' + (item.h1 || '') + ' ' + (item.category || '') + ' ' + (item.asin || '')).toLowerCase();
        return terms.every(function(t) { return hay.indexOf(t) !== -1; });
      }).slice(0, 8);

      if (matches.length === 0) {
        qres.innerHTML = '<div class="none">Keine passenden Ersatzteile gefunden.</div>';
        qres.hidden = false;
        return;
      }

      qres.innerHTML = matches.map(function(m) {
        return '<a href="' + m.url + '">' +
          '<img src="' + m.thumb + '" alt="' + m.title + '">' +
          '<div style="overflow:hidden;">' +
            '<div class="t">' + m.title + '</div>' +
            '<div class="b">' + m.category + ' • ASIN: ' + m.asin + '</div>' +
          '</div>' +
        '</a>';
      }).join('');
      qres.hidden = false;
    }

    qInput.addEventListener('input', performSearch);
    qInput.addEventListener('focus', function() {
      if (qInput.value.trim()) qres.hidden = false;
    });

    document.addEventListener('click', function(e) {
      if (!qInput.contains(e.target) && !qres.contains(e.target)) {
        qres.hidden = true;
      }
    });

    // 3. Mobile Product Page: Scroll down -> show CTA button; Scroll up -> show bottom dock
    var cta = document.querySelector('.mobile-sticky-cta');
    var dock = document.querySelector('.mobile-app-dock');
    if (cta && dock) {
      var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var scrollTicking = false;

      // On initial mobile view of product page: show CTA button, hide dock
      if (window.innerWidth <= 640) {
        cta.classList.remove('bar-hidden');
        dock.classList.add('bar-hidden');
      }

      function handleMobileScroll() {
        if (window.innerWidth <= 640) {
          var currY = window.pageYOffset || document.documentElement.scrollTop || 0;
          if (currY < 0) currY = 0;
          var diff = currY - lastScrollY;
          if (Math.abs(diff) >= 4) {
            if (diff > 0) {
              // Scrolling DOWN: show product purchase button, hide bottom dock
              cta.classList.remove('bar-hidden');
              dock.classList.add('bar-hidden');
            } else {
              // Scrolling UP: show bottom dock, hide product purchase button
              dock.classList.remove('bar-hidden');
              cta.classList.add('bar-hidden');
            }
            lastScrollY = currY;
          }
        }
        scrollTicking = false;
      }

      window.addEventListener('scroll', function() {
        if (!scrollTicking) {
          window.requestAnimationFrame(handleMobileScroll);
          scrollTicking = true;
        }
      }, { passive: true });

      window.addEventListener('touchmove', function() {
        if (!scrollTicking) {
          window.requestAnimationFrame(handleMobileScroll);
          scrollTicking = true;
        }
      }, { passive: true });
    }
  })();
  