/**
 * Online Calculators — Google Analytics 4 (gtag) event layer
 * Centralizes custom events; safe no-op when gtag is blocked.
 */
window.OCAnalytics = (function () {
  'use strict';

  const MEASUREMENT_ID = window.__GA_MEASUREMENT_ID__ || 'G-BJLB2TWL8B';
  const DEBUG = !!window.__GA_DEBUG__;
  const calcDebounce = new Map();
  const searchDebounce = new Map();
  const scrollMarks = new Set();

  function gtagReady() {
    return typeof window.gtag === 'function';
  }

  /** @param {string} name GA4 event name (snake_case) */
  function event(name, params) {
    if (!gtagReady()) return;
    const payload = Object.assign({
      send_to: MEASUREMENT_ID,
      page_location: location.href,
      page_path: location.pathname,
      page_title: document.title
    }, params || {});
    if (DEBUG) console.debug('[GA4]', name, payload);
    window.gtag('event', name, payload);
  }

  function calcContext() {
    const root = document.querySelector('.calculator-dashboard[data-calculator]');
    if (!root) return {};
    return {
      calculator_type: root.dataset.calculator || '',
      calculator_slug: root.dataset.slug || '',
      content_group: 'calculator'
    };
  }

  function trackCalculatorUse(extra) {
    const ctx = calcContext();
    if (!ctx.calculator_type) return;
    const key = ctx.calculator_type;
    if (calcDebounce.has(key)) clearTimeout(calcDebounce.get(key));
    calcDebounce.set(key, setTimeout(() => {
      event('calculator_use', Object.assign({}, ctx, extra || {}));
      calcDebounce.delete(key);
    }, 800));
  }

  function trackSearch(inputId, term, resultCount) {
    if (!term || term.length < 1) return;
    const key = inputId || 'default';
    if (searchDebounce.has(key)) clearTimeout(searchDebounce.get(key));
    searchDebounce.set(key, setTimeout(() => {
      event('search', {
        search_term: term.slice(0, 100),
        search_length: term.length,
        result_count: resultCount,
        search_location: inputId === 'hero-search' ? 'hero' : 'header'
      });
      searchDebounce.delete(key);
    }, 600));
  }

  function initDelegation() {
    document.addEventListener('click', (e) => {
      const el = e.target;

      const shareBtn = el.closest('[data-share]');
      if (shareBtn) {
        event('share', {
          method: shareBtn.dataset.share,
          content_type: calcContext().calculator_type ? 'calculator_result' : 'page',
          item_id: calcContext().calculator_slug || location.pathname,
          link_text: (shareBtn.textContent || '').trim().slice(0, 80)
        });
        return;
      }

      const chip = el.closest('.dash-chip');
      if (chip) {
        const group = chip.closest('.dash-chips');
        event('calculator_chip_select', Object.assign({}, calcContext(), {
          field_name: group?.dataset.target || group?.dataset.selectTarget || '',
          chip_value: chip.dataset.value || ''
        }));
        return;
      }

      const exampleBtn = el.closest('.example-apply-btn');
      if (exampleBtn) {
        const card = exampleBtn.closest('.example-dash-card');
        event('calculator_example_apply', Object.assign({}, calcContext(), {
          example_label: card?.querySelector('.example-dash-label')?.textContent?.trim() || ''
        }));
        return;
      }

      const goal = el.closest('[data-goal]');
      if (goal) {
        event('calculator_goal_select', Object.assign({}, calcContext(), {
          goal_target: goal.dataset.target || '',
          goal_years: goal.dataset.years || ''
        }));
        return;
      }

      const chartTab = el.closest('[data-chart-tab]');
      if (chartTab) {
        event('chart_view', Object.assign({}, calcContext(), {
          chart_tab: chartTab.dataset.chartTab || chartTab.textContent?.trim() || ''
        }));
        return;
      }

      const likeBtn = el.closest('[data-like]');
      if (likeBtn) {
        event('community_like', calcContext());
        return;
      }

      const carouselBtn = el.closest('[data-carousel-prev], [data-carousel-next]');
      if (carouselBtn) {
        event('carousel_nav', Object.assign({}, calcContext(), {
          direction: carouselBtn.hasAttribute('data-carousel-prev') ? 'prev' : 'next'
        }));
        return;
      }

      if (el.closest('[data-sticky-share]')) {
        event('sticky_share_click', calcContext());
        return;
      }

      const calcCard = el.closest('a.calc-card-link');
      if (calcCard) {
        event('select_content', {
          content_type: 'calculator',
          item_id: calcCard.getAttribute('href') || '',
          item_name: calcCard.querySelector('.calc-card-title')?.textContent?.trim() || ''
        });
        return;
      }

      const explorer = el.closest('.explorer-card');
      if (explorer) {
        event('select_content', {
          content_type: 'category',
          item_id: explorer.getAttribute('href') || '',
          item_name: explorer.textContent?.trim().slice(0, 80) || ''
        });
        return;
      }

      const outbound = el.closest('a[href^="http"]');
      if (outbound && outbound.hostname !== location.hostname) {
        event('click', {
          event_category: 'outbound',
          event_label: outbound.hostname,
          link_url: outbound.href,
          link_text: (outbound.textContent || '').trim().slice(0, 80),
          outbound: true
        });
      }
    });

    document.addEventListener('toggle', (e) => {
      const details = e.target;
      if (!(details instanceof HTMLDetailsElement) || !details.classList.contains('faq-item')) return;
      if (!details.open) return;
      const question = details.querySelector('.faq-question')?.textContent?.trim() || '';
      event('faq_expand', Object.assign({}, calcContext(), {
        faq_question: question.slice(0, 120)
      }));
    }, true);

    const faqSearch = document.getElementById('faq-search');
    if (faqSearch) {
      let faqTimer;
      faqSearch.addEventListener('input', () => {
        clearTimeout(faqTimer);
        faqTimer = setTimeout(() => {
          const q = faqSearch.value.trim();
          if (q.length < 2) return;
          event('faq_search', Object.assign({}, calcContext(), {
            search_length: q.length
          }));
        }, 500);
      });
    }

    const newsletter = document.getElementById('newsletter-form');
    if (newsletter) {
      newsletter.addEventListener('submit', () => {
        event('sign_up', {
          method: 'email',
          signup_location: calcContext().calculator_type ? 'calculator_newsletter' : 'site_newsletter',
          calculator_type: calcContext().calculator_type || undefined
        });
      });
    }
  }

  function initScrollDepth() {
    const thresholds = [25, 50, 75, 90];
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      thresholds.forEach((t) => {
        if (pct >= t && !scrollMarks.has(t)) {
          scrollMarks.add(t);
          event('scroll_depth', {
            percent_scrolled: t,
            content_group: calcContext().calculator_type || 'site'
          });
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initPageContext() {
    const ctx = calcContext();
    if (!ctx.calculator_type || !gtagReady()) return;
    window.gtag('set', 'user_properties', {
      last_calculator_type: ctx.calculator_type
    });
    event('calculator_view', ctx);
  }

  function init() {
    if (!gtagReady()) return;
    initDelegation();
    initScrollDepth();
    initPageContext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    event,
    trackCalculatorUse,
    trackSearch,
    trackThemeChange(theme) {
      event('theme_change', { theme_preference: theme });
    },
    trackNav(type) {
      event('navigation', { nav_type: type });
    },
    trackSearchResultClick(item, query) {
      event('search_result_click', {
        search_term: (query || '').slice(0, 100),
        item_name: item.title || '',
        item_type: item.type || '',
        item_id: item.url || ''
      });
    },
    trackServiceWorker(ok) {
      event('pwa_service_worker', { success: ok });
    }
  };
})();
