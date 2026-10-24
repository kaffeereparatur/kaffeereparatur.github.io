
  (function() {
    let indexData = [];
    const searchInput = document.getElementById('site-search');
    const searchClear = document.getElementById('search-clear');
    const searchDropdown = document.getElementById('search-dropdown');

    if (!searchInput) return;

    fetch('https://kaffeereparatur.github.io/search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { indexData = d; })
      .catch(function(e) { console.error('Search load error:', e); });

    function performSearch() {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchDropdown.classList.remove('show');
        searchClear.style.display = 'none';
        return;
      }
      searchClear.style.display = 'block';

      const terms = q.split(/\s+/);
      const matches = indexData.filter(function(item) {
        const hay = (item.title + ' ' + (item.category || '') + ' ' + (item.asin || '')).toLowerCase();
        return terms.every(function(t) { return hay.indexOf(t) !== -1; });
      }).slice(0, 8);

      if (matches.length === 0) {
        searchDropdown.innerHTML = '<div style="padding:12px; font-size:13px; color:#78716c;">Keine passenden Ersatzteile gefunden.</div>';
        searchDropdown.classList.add('show');
        return;
      }

      searchDropdown.innerHTML = matches.map(function(m) {
        return '<a href="' + m.url + '" class="search-dropdown-item">' +
          '<div style="display:flex; align-items:center; overflow:hidden;">' +
            '<img src="' + m.thumb + '" class="search-item-thumb" alt="' + m.title + '">' +
            '<div style="display:flex; flex-direction:column; overflow:hidden;">' +
              '<span style="font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + m.title + '</span>' +
              '<span style="font-size:11px; color:#78716c;">' + m.category + ' • ASIN: ' + m.asin + '</span>' +
            '</div>' +
          '</div>' +
          '<span style="color:#854d0e; font-weight:700; font-size:12px; margin-left:8px;">›</span>' +
        '</a>';
      }).join('');
      searchDropdown.classList.add('show');
    }

    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('focus', function() {
      if (searchInput.value.trim()) searchDropdown.classList.add('show');
    });

    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      searchDropdown.classList.remove('show');
      searchClear.style.display = 'none';
      searchInput.focus();
    });

    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.remove('show');
      }
    });
  })();
  