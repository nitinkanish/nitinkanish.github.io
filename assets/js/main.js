/**
 * Online Calculators — Theme, Navigation, Search, PWA
 */
(function () {
  'use strict';

  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* noop */ }
      window.OCAnalytics?.trackThemeChange(next);
    });
  }

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      if (open) window.OCAnalytics?.trackNav('mobile');
    });
  }

  // Mega menu
  const megaTrigger = document.querySelector('.mega-trigger');
  const megaMenu = document.querySelector('.mega-menu');
  if (megaTrigger && megaMenu) {
    megaTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = megaMenu.classList.toggle('open');
      megaTrigger.setAttribute('aria-expanded', open);
      if (open) window.OCAnalytics?.trackNav('mega_menu');
    });
    document.addEventListener('click', () => {
      megaMenu.classList.remove('open');
      megaTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  // Search
  initSearch();

  // PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => window.OCAnalytics?.trackServiceWorker(true))
        .catch(() => window.OCAnalytics?.trackServiceWorker(false));
    });
  }
})();

function initSearch() {
  const inputs = [
    document.getElementById('global-search'),
    document.getElementById('hero-search')
  ].filter(Boolean);
  if (!inputs.length) return;

  const dataUrl = document.documentElement.getAttribute('data-search-url') || '/assets/data/search-data.json';

  fetch(dataUrl)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      inputs.forEach((input) => setupSearchInput(input, data));
    })
    .catch(() => { /* search unavailable */ });
}

function setupSearchInput(input, data) {
  const wrapper = input.closest('.search-wrapper') || input.parentElement;
  let resultsEl = wrapper.querySelector('.search-results');
  if (!resultsEl) {
    resultsEl = document.createElement('div');
    resultsEl.id = input.id + '-results';
    resultsEl.className = 'search-results';
    resultsEl.setAttribute('role', 'listbox');
    resultsEl.hidden = true;
    wrapper.appendChild(resultsEl);
  }

  let activeIndex = -1;
  let currentResults = [];

  input.addEventListener('input', () => {
    activeIndex = -1;
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) {
      hideResults();
      return;
    }
    currentResults = search(q, data).slice(0, 8);
    renderResults(resultsEl, currentResults, q, input);
    showResults(input, resultsEl);
    window.OCAnalytics?.trackSearch(input.id, q, currentResults.length);
  });

  input.addEventListener('keydown', (e) => {
    const items = resultsEl.querySelectorAll('.search-result-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActive(items, activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive(items, activeIndex);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex]?.click();
    } else if (e.key === 'Escape') {
      hideResults();
      input.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) hideResults();
  });

  function hideResults() {
    resultsEl.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function showResults(inp, el) {
    el.hidden = false;
    inp.setAttribute('aria-expanded', 'true');
  }
}

function search(query, data) {
  const results = [];
  const q = query.toLowerCase();

  (data.calculators || []).forEach((calc) => {
    const score = matchScore(q, [
      calc.title,
      calc.description,
      calc.category,
      ...(calc.keywords || [])
    ]);
    if (score > 0) results.push({ ...calc, type: 'calculator', score });
  });

  (data.categories || []).forEach((cat) => {
    const score = matchScore(q, [cat.title, cat.description, cat.slug]);
    if (score > 0) results.push({ ...cat, type: 'category', score });
  });

  return results.sort((a, b) => b.score - a.score);
}

function matchScore(query, fields) {
  let score = 0;
  fields.forEach((field) => {
    if (!field) return;
    const f = field.toLowerCase();
    if (f === query) score += 100;
    else if (f.startsWith(query)) score += 50;
    else if (f.includes(query)) score += 20;
  });
  return score;
}

function renderResults(container, results, query, input) {
  container.innerHTML = '';
  if (results.length === 0) {
    container.innerHTML = '<div class="search-result-item"><span class="result-meta">No results found</span></div>';
    return;
  }

  results.forEach((item, i) => {
    const el = document.createElement('a');
    el.href = item.url;
    el.className = 'search-result-item';
    el.setAttribute('role', 'option');
    el.id = `search-option-${i}`;
    el.innerHTML = `
      <div class="result-title">${highlight(item.title, query)}</div>
      <div class="result-meta">${item.type === 'category' ? 'Category' : item.category}</div>
    `;
    el.addEventListener('click', () => {
      window.OCAnalytics?.trackSearchResultClick(item, query);
    });
    container.appendChild(el);
  });
}

function highlight(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) +
    '<strong>' + escapeHtml(text.slice(idx, idx + query.length)) + '</strong>' +
    escapeHtml(text.slice(idx + query.length));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function updateActive(items, index) {
  items.forEach((item, i) => item.classList.toggle('active', i === index));
}
