document.addEventListener('DOMContentLoaded', function () {
  // Checklist items: toggle done state, update progress bar.
  var checkItems = Array.prototype.slice.call(document.querySelectorAll('.check-item'));
  var progressLabel = document.querySelector('.progress-label');
  var progressFill = document.querySelector('.progress-fill');
  var totalChecks = checkItems.length;

  function updateProgress() {
    var doneCount = checkItems.filter(function (item) {
      return item.classList.contains('is-done');
    }).length;
    progressLabel.textContent = '완료 ' + doneCount + ' / ' + totalChecks;
    progressFill.style.width = Math.round((doneCount / totalChecks) * 100) + '%';
  }

  checkItems.forEach(function (item) {
    var header = item.querySelector('.check-header');
    header.addEventListener('click', function () {
      item.classList.toggle('is-done');
      updateProgress();
    });
  });

  updateProgress();

  // Accordions: systems / welfare / faq sections.
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    header.addEventListener('click', function () {
      item.classList.toggle('is-open');
    });
  });

  // Search: index checklist/accordion items plus the company & contact sections.
  var SECTION_LABEL = { c: '01 입사 체크리스트', s: '02 인사시스템', w: '03 복지 · 인사제도', f: '05 자주 묻는 질문' };

  function norm(t) {
    return (t || '').replace(/\s+/g, ' ').trim();
  }

  function buildIndex() {
    var idx = [];
    document.querySelectorAll('[data-search-key]').forEach(function (header) {
      var key = header.getAttribute('data-search-key');
      var box = header.parentElement;
      var title = norm(header.textContent).replace(/\+$/, '').trim();
      var bodyParts = [];
      Array.prototype.forEach.call(box.children, function (child) {
        if (child !== header) bodyParts.push(child.textContent);
      });
      idx.push({ key: key, section: SECTION_LABEL[key[0]], title: title, body: norm(bodyParts.join(' ')) });
    });

    [['company', '04 회사 소개'], ['contact', '06 담당자 연락처']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      var h2 = el.querySelector('h2');
      var bodyParts = [];
      Array.prototype.forEach.call(el.children, function (child) {
        var text = norm(child.textContent);
        if (child === h2 || /^\d+$/.test(text)) return;
        bodyParts.push(child.textContent);
      });
      idx.push({ key: pair[0], section: pair[1], title: norm(h2 && h2.textContent), body: norm(bodyParts.join(' ')) });
    });

    return idx;
  }

  var searchIndex = [];
  setTimeout(function () { searchIndex = buildIndex(); }, 0);

  function search(query) {
    var t = query.trim().toLowerCase();
    if (!t) return [];
    return searchIndex
      .map(function (e) {
        return { e: e, inTitle: e.title.toLowerCase().indexOf(t) >= 0, i: e.body.toLowerCase().indexOf(t) };
      })
      .filter(function (x) { return x.inTitle || x.i >= 0; })
      .sort(function (a, b) { return (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0); })
      .slice(0, 12)
      .map(function (x) {
        var e = x.e, i = x.i, before = '', match = '', after = '';
        if (i >= 0) {
          var st = Math.max(0, i - 24);
          before = (st > 0 ? '…' : '') + e.body.slice(st, i);
          match = e.body.slice(i, i + t.length);
          after = e.body.slice(i + t.length, i + t.length + 50) + (i + t.length + 50 < e.body.length ? '…' : '');
        } else {
          after = e.body.slice(0, 70) + (e.body.length > 70 ? '…' : '');
        }
        return { section: e.section, title: e.title, before: before, match: match, after: after, key: e.key };
      });
  }

  function goToResult(key) {
    var isAccordion = /^[swf]\d$/.test(key);
    var header = document.querySelector('[data-search-key="' + key + '"]');
    if (isAccordion && header) {
      header.parentElement.classList.add('is-open');
    }
    var target = header ? header.parentElement : document.getElementById(key);
    if (!target) return;
    if (document.activeElement) document.activeElement.blur();
    requestAnimationFrame(function () {
      var top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
      target.classList.remove('search-target-flash');
      void target.offsetWidth;
      target.classList.add('search-target-flash');
    });
  }

  var searchInput = document.getElementById('search-input');
  var searchClear = document.getElementById('search-clear');
  var searchPanel = document.getElementById('search-panel');
  var panelOpen = false;

  function renderPanel() {
    var query = searchInput.value;
    var hasQuery = query.trim().length > 0;
    searchClear.hidden = !hasQuery;

    if (!panelOpen || !hasQuery) {
      searchPanel.hidden = true;
      searchPanel.innerHTML = '';
      return;
    }

    var results = search(query);
    searchPanel.hidden = false;
    searchPanel.innerHTML = '';

    var count = document.createElement('div');
    count.className = 'search-count';
    count.textContent = '검색 결과 ' + results.length + '건';
    searchPanel.appendChild(count);

    if (results.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = '검색 결과가 없습니다. 다른 키워드로 검색하거나 06 담당자에게 문의해주세요.';
      searchPanel.appendChild(empty);
      return;
    }

    results.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'search-result';

      var section = document.createElement('span');
      section.className = 'search-result-section';
      section.textContent = r.section;

      var title = document.createElement('span');
      title.className = 'search-result-title';
      title.textContent = r.title;

      var snippet = document.createElement('span');
      snippet.className = 'search-result-snippet';
      snippet.appendChild(document.createTextNode(r.before));
      var mark = document.createElement('mark');
      mark.textContent = r.match;
      snippet.appendChild(mark);
      snippet.appendChild(document.createTextNode(r.after));

      row.appendChild(section);
      row.appendChild(title);
      row.appendChild(snippet);

      row.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        panelOpen = false;
        goToResult(r.key);
      });

      searchPanel.appendChild(row);
    });
  }

  searchInput.addEventListener('input', function () {
    panelOpen = true;
    renderPanel();
  });

  searchInput.addEventListener('focus', function () {
    panelOpen = true;
    renderPanel();
  });

  searchInput.addEventListener('blur', function () {
    setTimeout(function () { panelOpen = false; renderPanel(); }, 120);
  });

  searchInput.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') {
      var results = search(searchInput.value);
      if (results[0]) { panelOpen = false; goToResult(results[0].key); }
    } else if (ev.key === 'Escape') {
      panelOpen = false;
      renderPanel();
    }
  });

  searchClear.addEventListener('mousedown', function (ev) {
    ev.preventDefault();
    searchInput.value = '';
    panelOpen = false;
    renderPanel();
  });
});
