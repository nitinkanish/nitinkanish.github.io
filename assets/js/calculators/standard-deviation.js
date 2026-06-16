document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="standard-deviation"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const nums = parseDataset(v.dataset);
    if (nums.length < 2) return null;

    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const squaredDiffs = nums.map((x) => Math.pow(x - mean, 2));
    const sumSq = squaredDiffs.reduce((a, b) => a + b, 0);
    const isSample = v.mode !== 'population';
    const divisor = isSample ? n - 1 : n;
    const variance = sumSq / divisor;
    const sd = Math.sqrt(variance);

    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const min = sorted[0];
    const max = sorted[n - 1];

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(sd, 4),
      metrics: [
        engine.formatNumber(mean, 4) + ' mean',
        engine.formatNumber(variance, 4) + ' variance',
        n + ' values'
      ],
      compare: 'σ = ' + engine.formatNumber(sd, 4),
      shareBadge: 'SD ' + engine.formatNumber(sd, 4),
      shareText: `Standard deviation: ${engine.formatNumber(sd, 4)} (mean ${engine.formatNumber(mean, 2)}, n=${n})`,
      fieldDisplays: {
        mode: isSample ? 'Sample' : 'Population',
        dataset: n + ' data points'
      },
      insights: [
        { icon: '📊', text: `Mean (μ): ${engine.formatNumber(mean, 4)} · Median: ${engine.formatNumber(median, 4)}.` },
        { icon: '📈', text: `Variance (σ²): ${engine.formatNumber(variance, 4)} · SD (σ): ${engine.formatNumber(sd, 4)}.` },
        { icon: '🔢', text: `Range: ${engine.formatNumber(min, 2)} to ${engine.formatNumber(max, 2)} (${engine.formatNumber(max - min, 2)} spread).` },
        { icon: '📐', text: isSample ? 'Using sample formula (n−1) for unbiased estimation.' : 'Using population formula (N) for complete datasets.' }
      ]
    });

    return { mean, variance, sd, n, median };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => 'SD 5.2',
    apply: (d, f) => {
      if (d.dataset) {
        const el = f.querySelector('#dataset');
        if (el) { el.value = d.dataset; el.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      engine.calculate();
    }
  });

  function parseDataset(raw) {
    if (!raw) return [];
    return raw.split(/[\s,;\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }
});
