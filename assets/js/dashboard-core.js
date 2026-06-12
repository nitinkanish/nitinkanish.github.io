/**
 * Dashboard Core — FAQ search, carousels, share, mobile sticky, newsletter
 */
(function () {
  'use strict';

  initFaqSearch();
  initCarousels();
  initShareButtons();
  initNewsletter();
  initCommunityLikes();
  initMobileSticky();

  function initFaqSearch() {
    const search = document.getElementById('faq-search');
    const list = document.getElementById('faq-list');
    if (!search || !list) return;

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      list.querySelectorAll('.faq-item').forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.hidden = q.length > 0 && !text.includes(q);
      });
    });
  }

  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
      const track = carousel.querySelector('.carousel-track');
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!track) return;

      const scroll = (dir) => {
        const amount = track.offsetWidth * 0.85;
        track.scrollBy({ left: dir * amount, behavior: 'smooth' });
      };

      prev?.addEventListener('click', () => scroll(-1));
      next?.addEventListener('click', () => scroll(1));
    });
  }

  function initShareButtons() {
    document.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.share;
        const text = btn.dataset.shareText || document.title;
        const url = encodeURIComponent(window.location.href);
        const msg = encodeURIComponent(text);
        const links = {
          whatsapp: `https://wa.me/?text=${msg}%20${url}`,
          twitter: `https://twitter.com/intent/tweet?text=${msg}&url=${url}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        };
        if (platform === 'copy') {
          navigator.clipboard?.writeText(window.location.href);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
          return;
        }
        if (links[platform]) window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=500');
      });
    });

    document.getElementById('download-share-card')?.addEventListener('click', () => {
      const card = document.getElementById('share-result-card');
      if (!card || typeof html2canvas === 'undefined') return;
      html2canvas(card).then((canvas) => {
        const a = document.createElement('a');
        a.download = 'my-sip-results.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
    });
  }

  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('.newsletter-msg');
      if (msg) {
        msg.textContent = 'Thanks! Weekly investing insights coming your way.';
        msg.hidden = false;
      }
      form.reset();
    });
  }

  function initCommunityLikes() {
    document.querySelectorAll('[data-like]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = btn.querySelector('.like-count');
        if (!count) return;
        const n = parseInt(count.textContent, 10) + 1;
        count.textContent = n;
        btn.classList.add('liked');
        btn.disabled = true;
      });
    });
  }

  function initMobileSticky() {
    const bar = document.getElementById('mobile-sticky-bar');
    const wealth = document.getElementById('dash-wealth');
    if (!bar || !wealth) return;

    const observer = new IntersectionObserver(([e]) => {
      bar.classList.toggle('visible', !e.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(wealth);

    bar.querySelector('[data-sticky-share]')?.addEventListener('click', () => {
      document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  window.DashboardShare = {
    updateText(text) {
      document.querySelectorAll('[data-share]').forEach((btn) => {
        btn.dataset.shareText = text;
      });
    }
  };
})();
