/**
 * Dashboard UI — shared rendering for all calculator pages
 */
window.DashboardUI = (function () {
  'use strict';

  let chartMode = 'growth';
  let chartData = [];
  let chartRenderer = null;

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function animateValue(id, target, formatter) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseFloat(el.dataset.value) || 0;
    const duration = 500;
    const t0 = performance.now();
    const isNum = typeof target === 'number' && !isNaN(target);
    if (!isNum) { el.textContent = formatter(target); return; }
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
      else el.dataset.value = target;
    }
    requestAnimationFrame(tick);
  }

  function renderResults(data, fmt) {
    if (!data) return;
    if (data.primary !== undefined) {
      if (typeof data.primary === 'string') {
        setText('dash-wealth', data.primary);
        const el = document.getElementById('dash-wealth');
        if (el) el.dataset.value = data.primary;
      } else {
        animateValue('dash-wealth', data.primary, (v) => fmt ? fmt.currency(v) : String(v));
      }
    }
    (data.metrics || []).forEach((m) => setText(m.id, m.value));
    if (data.sticky) setText('sticky-wealth', data.sticky);
    if (data.compare) setText('compare-you', data.compare);

    if (data.share) {
      Object.entries(data.share).forEach(([k, v]) => setText('share-' + k, v));
    }
    if (data.shareText && window.DashboardShare) {
      DashboardShare.updateText(data.shareText);
    }
  }

  function renderTimeline(milestones, fmt) {
    const el = document.getElementById('wealth-timeline');
    if (!el || !milestones?.length) return;
    el.innerHTML = milestones.map((m, i) => `
      <div class="timeline-story ${i === milestones.length - 1 ? 'active' : ''}">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <span class="timeline-year">${m.label || 'Year ' + m.year}</span>
          <strong class="timeline-balance">${m.balance}</strong>
          ${m.growth ? `<span class="timeline-growth">${m.growth}</span>` : ''}
          ${m.milestone ? `<span class="timeline-milestone">${m.milestone}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderInsights(insights) {
    const el = document.getElementById('insights-grid');
    if (!el || !insights?.length) return;
    el.innerHTML = insights.map((i) => `
      <div class="insight-card">
        <span class="insight-icon" aria-hidden="true">${i.icon || '💡'}</span>
        <p>${i.text}</p>
      </div>
    `).join('');
  }

  function renderGoalProgress(currentValue) {
    document.querySelectorAll('[data-goal]').forEach((card) => {
      const target = parseFloat(card.dataset.target);
      if (!target) return;
      const pct = Math.min((currentValue / target) * 100, 100);
      const ring = card.querySelector('.goal-ring-fill');
      const pctEl = card.querySelector('.goal-pct');
      const remainEl = card.querySelector('.goal-remaining');
      if (ring) ring.style.strokeDashoffset = 283 - (283 * pct / 100);
      if (pctEl) pctEl.textContent = Math.round(pct) + '%';
      if (remainEl) {
        const gap = Math.max(target - currentValue, 0);
        remainEl.textContent = gap > 0
          ? (gap >= 100000 ? '₹' + (gap / 100000).toFixed(1) + 'L to go' : '₹' + Math.round(gap).toLocaleString('en-IN') + ' to go')
          : 'Goal achievable!';
      }
    });
  }

  function initChart(tabs) {
    document.querySelectorAll('[data-chart-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-chart-tab]').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        chartMode = tab.dataset.chartTab;
        if (chartRenderer) chartRenderer(chartData, chartMode);
      });
    });
  }

  function drawLineChart(canvasId, yearlyData, mode, valueFn) {
    const canvas = document.getElementById(canvasId || 'growth-chart');
    if (!canvas || !yearlyData?.length) return;
    chartData = yearlyData;
    chartRenderer = (data, m) => drawLineChart(canvasId, data, m, valueFn);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 280 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '280px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = 280;
    const pad = { t: 20, r: 20, b: 36, l: 56 };
    ctx.clearRect(0, 0, w, h);

    const vals = yearlyData.map((d, i) => valueFn(d, mode, i));
    const maxVal = Math.max(...vals) * 1.08 || 1;
    const getY = (val) => h - pad.b - ((val / maxVal) * (h - pad.t - pad.b));
    const getX = (i) => pad.l + (i / (yearlyData.length - 1 || 1)) * (w - pad.l - pad.r);

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (i / 4) * (h - pad.t - pad.b);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    }

    const points = vals.map((val, i) => ({ x: getX(i), y: getY(val) }));
    const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, 'rgba(91, 92, 246, 0.22)');
    grad.addColorStop(1, 'rgba(91, 92, 246, 0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad.b);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#5B5CF6';
    ctx.lineWidth = 2.5;
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  function bindSliders(form) {
    if (!form) return;
    form.querySelectorAll('.dash-range').forEach((range) => {
      const id = range.id.replace('-range', '');
      const input = form.querySelector('#' + id);
      if (!input) return;
      range.addEventListener('input', () => {
        input.value = range.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      input.addEventListener('input', () => { range.value = input.value; });
    });
  }

  function bindChips(form) {
    if (!form) return;
    form.querySelectorAll('.dash-chips').forEach((group) => {
      const target = group.dataset.target || group.dataset.selectTarget;
      const input = form.querySelector('#' + target);
      const range = form.querySelector('#' + target + '-range');
      group.querySelectorAll('.dash-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const val = chip.dataset.value;
          if (input) {
            input.value = val;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (range) range.value = val;
          group.querySelectorAll('.dash-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });
    });
  }

  function parseExampleData(card) {
    const raw = card.getAttribute('data-example');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function bindExamples(form, applyFn) {
    document.querySelectorAll('.example-dash-card').forEach((card) => {
      const data = parseExampleData(card);
      if (card.dataset.computed !== 'true' && applyFn.preview && data) {
        const preview = applyFn.preview(data);
        const resEl = card.querySelector('.example-dash-result');
        if (resEl && preview) resEl.textContent = preview;
        card.dataset.computed = 'true';
      }
      card.querySelector('.example-apply-btn')?.addEventListener('click', () => {
        if (data) applyFn.apply(data, form);
        document.getElementById('calculator-dashboard')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function publishDashboard(engine, opts) {
    if (!opts) return;
    if (window.OCAnalytics) {
      window.OCAnalytics.trackCalculatorUse({ interaction: 'result_update' });
    }
    const fmtCur = (n, d) => engine.formatCurrency(n, d);
    const primaryStr = typeof opts.primary === 'number'
      ? (opts.primaryFormat === 'percent' ? engine.formatPercent(opts.primary, opts.decimals || 2)
        : opts.primaryFormat === 'number' ? engine.formatNumber(opts.primary, opts.decimals || 2)
        : fmtCur(opts.primary, opts.decimals))
      : String(opts.primary);

    const metrics = opts.metrics || [];
    const share = opts.share || {
      wealth: primaryStr,
      'stat-1': metrics[0] || '—',
      'stat-2': metrics[1] || '—',
      'stat-3': metrics[2] || '—'
    };

    renderResults({
      primary: opts.primary,
      metrics: metrics.map((value, i) => ({ id: 'dash-metric-' + (i + 1), value })),
      sticky: opts.sticky ?? primaryStr,
      compare: opts.compare,
      share,
      shareText: opts.shareText
    }, fmtCur);

    if (opts.shareBadge) setText('share-badge', opts.shareBadge);
    if (opts.insights) renderInsights(opts.insights);
    if (opts.timeline) renderTimeline(opts.timeline);
    if (opts.goalValue != null) renderGoalProgress(opts.goalValue);
    if (opts.fieldDisplays) updateFieldDisplays(opts.fieldDisplays);

    if (opts.yearlyData?.length && opts.chartValueFn) {
      drawLineChart('growth-chart', opts.yearlyData, chartMode, opts.chartValueFn);
    }
  }

  function financeChartFn(d, mode) {
    const m = (mode || '').toLowerCase();
    if (m.includes('principal') || m.includes('invested') || m.includes('contribution')) return d.invested || d.principalPaid || 0;
    if (m.includes('interest') || m.includes('gain')) return d.gains || d.interestPaid || 0;
    if (m.includes('inflation')) return (d.balance || d.amount || 0) * Math.pow(0.96, d.year || 1);
    return d.balance || d.amount || 0;
  }

  function updateFieldDisplays(map) {
    Object.entries(map).forEach(([id, val]) => setText(id + '-display', val));
  }

  window.addEventListener('resize', () => {
    if (chartRenderer && chartData.length) chartRenderer(chartData, chartMode);
  });

  initChart();

  return {
    setText, animateValue, renderResults, renderTimeline, renderInsights,
    renderGoalProgress, initChart, drawLineChart, bindSliders, bindChips,
    bindExamples, updateFieldDisplays, publishDashboard, parseExampleData, financeChartFn
  };
})();
