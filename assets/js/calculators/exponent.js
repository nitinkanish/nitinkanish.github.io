document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="exponent"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const base = engine.parseNumber(v.base);
    const exp = engine.parseNumber(v.exponent);
    if (base === undefined || exp === undefined) return null;

    if (base === 0 && exp <= 0) return null;

    const result = Math.pow(base, exp);
    if (!isFinite(result)) return null;

    const formula = `${formatNum(base)}^${formatNum(exp)}`;

    UI.publishDashboard(engine, {
      primary: result,
      primaryFormat: 'number',
      decimals: Math.abs(result) >= 1e6 || (Math.abs(result) < 0.0001 && result !== 0) ? 6 : 4,
      metrics: [
        formatNum(base),
        formatNum(exp),
        formula
      ],
      compare: engine.formatNumber(result, 6),
      shareBadge: formula,
      shareText: `${formula} = ${engine.formatNumber(result, 6)}`,
      insights: [
        { icon: '🔢', text: `${formula} = ${engine.formatNumber(result, 6)}` },
        { icon: '📐', text: exp < 0 ? `Negative exponent: ${formatNum(base)}^${exp} = 1/${formatNum(base)}^${Math.abs(exp)}` : `Base multiplied by itself ${exp} time(s).` },
        { icon: '💡', text: exp === 0 && base !== 0 ? 'Any non-zero number to the power of 0 equals 1.' : 'Use fractional exponents for roots: n^0.5 = √n.' },
        { icon: '✅', text: result === Math.round(result) && Math.abs(result) < 1e15 ? `Exact integer result: ${result}` : 'Decimal result shown to high precision.' }
      ]
    });
    return { result };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const r = Math.pow(parseFloat(d.base), parseFloat(d.exponent));
      return isFinite(r) ? engine.formatNumber(r, 2) : '—';
    },
    apply: (d, f) => {
      setVal(f, 'base', d.base);
      setVal(f, 'exponent', d.exponent);
      engine.calculate();
    }
  });

  function formatNum(n) {
    return Number.isInteger(n) ? String(n) : engine.formatNumber(n, 4);
  }

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
