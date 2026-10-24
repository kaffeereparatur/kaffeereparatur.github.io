
  (function() {
    let indexData = [];
    const qInput = document.getElementById('q');
    const qres = document.getElementById('qres');

    if (!qInput || !qres) return;

    fetch('https://kaffeereparatur.github.io/search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { indexData = d; })
      .catch(function(e) { console.error('Search load error:', e); });

    function performSearch() {
      const q = qInput.value.trim().toLowerCase();
      if (!q) {
        qres.hidden = true;
        qres.innerHTML = '';
        return;
      }

      const terms = q.split(/\s+/);
      const matches = indexData.filter(function(item) {
        const hay = (item.title + ' ' + (item.category || '') + ' ' + (item.asin || '')).toLowerCase();
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
  })();
  