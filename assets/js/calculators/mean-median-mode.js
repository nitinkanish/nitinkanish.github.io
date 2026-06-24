document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="mean-median-mode"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const nums = parseDataset(v.dataset);
    if (nums.length === 0) return null;

    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const mode = computeMode(nums);
    const range = sorted[n - 1] - sorted[0];

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(mean, 4),
      metrics: [
        engine.formatNumber(median, 4) + ' median',
        mode !== null ? mode + ' mode' : 'No mode',
        n + ' values'
      ],
      compare: 'μ = ' + engine.formatNumber(mean, 4),
      shareBadge: 'Mean ' + engine.formatNumber(mean, 2),
      shareText: `Mean ${engine.formatNumber(mean, 2)}, Median ${engine.formatNumber(median, 2)}, n=${n}`,
      insights: [
        { icon: '📊', text: `Mean: ${engine.formatNumber(mean, 4)} · Median: ${engine.formatNumber(median, 4)}.` },
        { icon: '🔢', text: mode !== null ? `Mode: ${mode} (most frequent value).` : 'No mode — all values appear once.' },
        { icon: '📏', text: `Range: ${engine.formatNumber(sorted[0], 2)} – ${engine.formatNumber(sorted[n - 1], 2)} (${engine.formatNumber(range, 2)}).` },
        { icon: '💡', text: Math.abs(mean - median) > range * 0.1 ? 'Mean and median differ — data may be skewed.' : 'Mean ≈ median — fairly symmetric distribution.' }
      ]
    });
    return { mean, median, mode, n };
  };

  engine.init();
  engine.calculate();

  function parseDataset(raw) {
    if (!raw) return [];
    return raw.split(/[\s,;\n]+/).map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
  }

  function computeMode(nums) {
    const freq = {};
    let max = 0;
    nums.forEach((n) => { freq[n] = (freq[n] || 0) + 1; max = Math.max(max, freq[n]); });
    if (max < 2) return null;
    const modes = Object.keys(freq).filter((k) => freq[k] === max).map(Number);
    return modes.length === 1 ? modes[0] : modes.join(', ');
  }
});
