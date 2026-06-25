document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="square-root"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const n = engine.parseNumber(v.value);
    if (n === undefined || n < 0) return null;

    const result = Math.sqrt(n);
    const isPerfect = Number.isInteger(result);
    const squared = result * result;

    UI.publishDashboard(engine, {
      primary: isPerfect ? result : result,
      primaryFormat: isPerfect ? 'number' : 'number',
      decimals: isPerfect ? 0 : 6,
      metrics: [
        `√${engine.formatNumber(n, 4)}`,
        isPerfect ? 'Yes ✓' : 'No',
        `${engine.formatNumber(result, 6)}² = ${engine.formatNumber(squared, 6)}`
      ],
      compare: `√${n} = ${engine.formatNumber(result, 6)}`,
      shareBadge: `√${n}`,
      shareText: `√${n} = ${engine.formatNumber(result, 6)}${isPerfect ? ' (perfect square)' : ''}`,
      insights: [
        { icon: '🔢', text: `√${engine.formatNumber(n, 4)} = ${engine.formatNumber(result, 6)}` },
        { icon: '📐', text: isPerfect ? `${n} is a perfect square (${result} × ${result} = ${n}).` : `${n} is not a perfect square — result is irrational or non-integer.` },
        { icon: '💡', text: 'Square root undoes squaring: if x² = n, then x = √n.' },
        { icon: '✅', text: `Check: ${engine.formatNumber(result, 6)}² = ${engine.formatNumber(squared, 6)}` }
      ]
    });
    return { result, isPerfect };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const n = parseFloat(d.value);
      return n >= 0 ? engine.formatNumber(Math.sqrt(n), 4) : '—';
    },
    apply: (d, f) => {
      setVal(f, 'value', d.value);
      engine.calculate();
    }
  });

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
