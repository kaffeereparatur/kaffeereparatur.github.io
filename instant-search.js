
  (function() {
    let indexData = [];
    const searchInput = document.getElementById('site-search');
    const searchClear = document.getElementById('search-clear');
    const searchDropdown = document.getElementById('search-dropdown');

    window.focusIosSearch = function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (searchInput) {
        setTimeout(function() { searchInput.focus(); }, 250);
      }
    };

    if (!searchInput) return;

    fetch('https://kaffeereparatur.github.io/search-index.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { indexData = d; })
      .catch(function(e) { console.error('Search index load error:', e); });

    function performSearch() {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchDropdown.classList.remove('show');
        searchClear.style.display = 'none';
        return;
      }
      searchClear.style.display = 'flex';

      const results = indexData.filter(function(item) {
        return item.title.toLowerCase().includes(q) || 
               item.category.toLowerCase().includes(q) ||
               item.brand.toLowerCase().includes(q) ||
               (item.asin && item.asin.toLowerCase().includes(q));
      }).slice(0, 10);

      if (results.length === 0) {
        searchDropdown.innerHTML = '<div style="padding:16px; text-align:center; font-size:13.5px; color:#8e8e93;">Kein passendes Ersatzteil gefunden.</div>';
      } else {
        searchDropdown.innerHTML = results.map(function(r) {
          return '<a href="' + r.url + '" class="ios-search-item">' +
            '<img src="' + r.thumb + '" class="ios-search-thumb" alt="' + r.title + '" onerror="this.style.display=\'none\'">' +
            '<div class="ios-search-info">' +
              '<div class="ios-search-title">' + r.title + '</div>' +
              '<div class="ios-search-meta">' + r.brand + ' • ' + r.category + '</div>' +
            '</div>' +
            '<span class="ios-search-arrow">›</span>' +
          '</a>';
        }).join('');
      }
      searchDropdown.classList.add('show');
    }

    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('focus', function() {
      if (this.value.trim().length > 0) {
        searchDropdown.classList.add('show');
      }
    });

    searchClear.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
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

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchDropdown.classList.remove('show');
        searchInput.blur();
      }
    });
  })();
  