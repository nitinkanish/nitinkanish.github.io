/**
 * Cookie consent — gates Google Analytics until user accepts.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'oc_cookie_consent';
  const CONSENT_ACCEPTED = 'accepted';
  const CONSENT_REJECTED = 'rejected';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* noop */ }
  }

  function getGaId() {
    const el = document.getElementById('ga-config');
    if (!el) return null;
    try { return JSON.parse(el.textContent).id; } catch { return null; }
  }

  function loadGoogleAnalytics(id) {
    if (!id || window.__gaLoaded) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    window.__GA_MEASUREMENT_ID__ = id;
    window.__GA_DEBUG__ = isLocal;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    script.onload = function () {
      window.gtag('js', new Date());
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      window.gtag('config', id, {
        send_page_view: true,
        debug_mode: isLocal,
        anonymize_ip: true,
        allow_google_signals: !isLocal,
        allow_ad_personalization_signals: false
      });
      window.__gaLoaded = true;
      if (window.OCAnalytics && typeof window.OCAnalytics.init === 'function') {
        window.OCAnalytics.init();
      }
    };
    document.head.appendChild(script);
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-consent');
    if (banner) {
      banner.hidden = true;
      banner.classList.remove('visible');
    }
  }

  function showBanner() {
    const banner = document.getElementById('cookie-consent');
    if (!banner) return;
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add('visible'); });
  }

  function acceptCookies() {
    setConsent(CONSENT_ACCEPTED);
    hideBanner();
    const id = getGaId();
    if (id) loadGoogleAnalytics(id);
  }

  function rejectCookies() {
    setConsent(CONSENT_REJECTED);
    hideBanner();
  }

  function bindBanner() {
    document.getElementById('cookie-accept')?.addEventListener('click', acceptCookies);
    document.getElementById('cookie-reject')?.addEventListener('click', rejectCookies);
  }

  function init() {
    bindBanner();
    const consent = getConsent();

    if (consent === CONSENT_ACCEPTED) {
      loadGoogleAnalytics(getGaId());
      return;
    }

    if (consent === CONSENT_REJECTED) return;

    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CookieConsent = {
    getConsent,
    accept: acceptCookies,
    reject: rejectCookies,
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      showBanner();
    }
  };
})();
