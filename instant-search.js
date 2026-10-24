
  (function() {
    var header = document.querySelector('.top');
    var qInput = document.getElementById('q');
    var qres = document.getElementById('qres');

    // 1. Smart Auto-Hiding / Showing Sticky Navigation Header
    if (header) {
      var lastY = window.pageYOffset || document.documentElement.scrollTop;
      var ticking = false;

      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            // Keep header visible if search input is focused or search results are open
            if (document.activeElement === qInput || (qres && !qres.hidden && qres.style.display !== 'none')) {
              header.classList.remove('nav-hidden');
              ticking = false;
              return;
            }

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
    if (!qInput || !qres) return;

    var indexData = [];
    var isFetching = true;

    function hideResults() {
      qres.hidden = true;
      qres.setAttribute('hidden', '');
      qres.style.display = 'none';
    }

    function showResults() {
      qres.hidden = false;
      qres.removeAttribute('hidden');
      qres.style.display = 'block';
    }

    function norm(s) {
      return (s || '').toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
    }

    function performSearch() {
      var q = qInput.value.trim();
      if (!q) {
        hideResults();
        qres.innerHTML = '';
        return;
      }

      if (isFetching && (!indexData || indexData.length === 0)) {
        qres.innerHTML = '<div class="none">Katalog wird geladen…</div>';
        showResults();
        return;
      }

      var qNorm = norm(q);
      var terms = qNorm.split(/\s+/).filter(Boolean);

      var matches = indexData.filter(function(item) {
        var hay = norm(item.title + ' ' + (item.h1 || '') + ' ' + (item.category || '') + ' ' + (item.brand || '') + ' ' + (item.asin || ''));
        return terms.every(function(t) { return hay.indexOf(t) !== -1; });
      }).slice(0, 10);

      if (matches.length === 0) {
        qres.innerHTML = '<div class="none">Keine passenden Ersatzteile für „' + q.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '“ gefunden.</div>';
        showResults();
        return;
      }

      qres.innerHTML = matches.map(function(m) {
        return '<a href="' + m.url + '">' +
          '<img src="' + m.thumb + '" alt="' + (m.title || '').replace(/"/g, '&quot;') + '" width="44" height="44" loading="lazy">' +
          '<div style="overflow:hidden; flex:1;">' +
            '<div class="t">' + (m.title || '') + '</div>' +
            '<div class="b">' + (m.brand ? m.brand + ' • ' : '') + (m.category || '') + ' • ASIN: ' + m.asin + '</div>' +
          '</div>' +
        '</a>';
      }).join('');
      showResults();
    }

    // Load search index with fallback
    var indexUrl = '/search-index.json';
    try {
      if (window.location.protocol === 'file:') indexUrl = 'https://kaffeereparatur.github.io/search-index.json';
    } catch(e) {}

    fetch(indexUrl)
      .catch(function() { return fetch('https://kaffeereparatur.github.io/search-index.json'); })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        indexData = d;
        isFetching = false;
        if (qInput.value.trim()) {
          performSearch();
        }
      })
      .catch(function(e) {
        isFetching = false;
        console.error('Search load error:', e);
      });

    qInput.addEventListener('input', performSearch);
    qInput.addEventListener('search', performSearch);
    qInput.addEventListener('focus', function() {
      if (qInput.value.trim()) {
        performSearch();
      }
    });

    document.addEventListener('click', function(e) {
      if (!qInput.contains(e.target) && !qres.contains(e.target)) {
        hideResults();
      }
    });

    document.addEventListener('touchstart', function(e) {
      if (!qInput.contains(e.target) && !qres.contains(e.target)) {
        hideResults();
      }
    }, { passive: true });

    qInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideResults();
        qInput.blur();
      } else if (e.key === 'Enter') {
        var first = qres.querySelector('a');
        if (first && !qres.hidden && qres.style.display !== 'none') {
          e.preventDefault();
          window.location.href = first.getAttribute('href');
        }
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
  